// extract-text.js — convert sponsor Office documents to plain text.
//
// Usage, from inside 02_Working/tools/:
//   node extract-text.js            # every file in ../../01_Sponsor_Inputs/originals/
//   node extract-text.js "<name>"   # one file by name
//
// Writes UTF-8 .txt into ../../01_Sponsor_Inputs/extracted/, never touching
// anything in originals/.
//
// No dependencies, no network, no model. Office files (.docx/.pptx/.xlsx) are
// ZIP archives of XML, so this reads the ZIP central directory itself and
// inflates the entries it needs with Node's built-in zlib. See README.md.
//
// PDFs are NOT handled here — a PDF is not a ZIP of XML and needs a real text
// layer decoder. The one PDF in the source set (the brief) was read directly
// and its extraction is recorded as mode "pdf-text" in data/sources.json.

'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ORIGINALS = path.join(__dirname, '..', '..', '01_Sponsor_Inputs', 'originals');
const EXTRACTED = path.join(__dirname, '..', '..', '01_Sponsor_Inputs', 'extracted');

// ---------------------------------------------------------------------------
// Minimal ZIP reader
// ---------------------------------------------------------------------------

function readZip(buf) {
  // Locate the End of Central Directory record by scanning back for its
  // signature. The trailing comment is almost always empty, so this is quick.
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && i > buf.length - 66000; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('not a ZIP archive (no EOCD record)');

  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);

  const entries = new Map();
  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) break;
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOff = buf.readUInt32LE(p + 42);
    const name = buf.slice(p + 46, p + 46 + nameLen).toString('utf8');
    entries.set(name, { method: method, compSize: compSize, localOff: localOff });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

function readEntry(buf, entry) {
  // Skip the local file header, whose name/extra lengths may differ from the
  // central directory's, then inflate.
  const off = entry.localOff;
  if (buf.readUInt32LE(off) !== 0x04034b50) throw new Error('bad local header');
  const nameLen = buf.readUInt16LE(off + 26);
  const extraLen = buf.readUInt16LE(off + 28);
  const start = off + 30 + nameLen + extraLen;
  const raw = buf.slice(start, start + entry.compSize);
  if (entry.method === 0) return raw;                 // stored
  if (entry.method === 8) return zlib.inflateRawSync(raw); // deflate
  throw new Error('unsupported compression method ' + entry.method);
}

// ---------------------------------------------------------------------------
// XML helpers
// ---------------------------------------------------------------------------

function unescapeXml(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (m, d) => String.fromCharCode(parseInt(d, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, '&');
}

// Collect the text of every <tag>...</tag> in document order.
function textRuns(xml, tag) {
  const out = [];
  const re = new RegExp('<' + tag + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + tag + '>', 'g');
  let m;
  while ((m = re.exec(xml)) !== null) out.push(unescapeXml(m[1]));
  return out;
}

function tidy(lines) {
  const out = [];
  for (let line of lines) {
    line = line.replace(/[ \t]+/g, ' ').trim();
    // Collapse runs of blank lines to a single one.
    if (line === '' && (out.length === 0 || out[out.length - 1] === '')) continue;
    out.push(line);
  }
  while (out.length && out[out.length - 1] === '') out.pop();
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// .docx — paragraphs and table rows from word/document.xml
// ---------------------------------------------------------------------------

function extractDocx(buf, entries) {
  const xml = readEntry(buf, entries.get('word/document.xml')).toString('utf8');
  const lines = [];

  // Walk block elements in order so table structure survives. Paragraphs carry
  // <w:t> runs; a table row's cells are joined with " | " so the reference
  // tables in these documents stay readable as tables.
  const blockRe = /<w:tbl(?:\s[^>]*)?>[\s\S]*?<\/w:tbl>|<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>|<w:p(?:\s[^>]*)?\/>/g;
  let m;
  while ((m = blockRe.exec(xml)) !== null) {
    const block = m[0];
    if (block.startsWith('<w:tbl')) {
      lines.push('');
      const rowRe = /<w:tr(?:\s[^>]*)?>[\s\S]*?<\/w:tr>/g;
      let r;
      while ((r = rowRe.exec(block)) !== null) {
        const cells = [];
        const cellRe = /<w:tc(?:\s[^>]*)?>[\s\S]*?<\/w:tc>/g;
        let c;
        while ((c = cellRe.exec(r[0])) !== null) {
          cells.push(textRuns(c[0], 'w:t').join('').replace(/\s+/g, ' ').trim());
        }
        if (cells.some(x => x !== '')) lines.push(cells.join(' | '));
      }
      lines.push('');
    } else {
      lines.push(textRuns(block, 'w:t').join(''));
    }
  }
  return tidy(lines);
}

// ---------------------------------------------------------------------------
// .pptx — one labelled section per slide, plus speaker notes
// ---------------------------------------------------------------------------

function extractPptx(buf, entries) {
  const slideNum = name => {
    const m = /slide(\d+)\.xml$/.exec(name);
    return m ? parseInt(m[1], 10) : 0;
  };

  const slides = [...entries.keys()]
    .filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => slideNum(a) - slideNum(b));

  const lines = [];
  for (const name of slides) {
    const n = slideNum(name);
    const xml = readEntry(buf, entries.get(name)).toString('utf8');

    lines.push('');
    lines.push('=== Slide ' + n + ' ===');

    // Each <a:p> is a paragraph; keep them on separate lines so bullet
    // structure is preserved for citation.
    const paraRe = /<a:p(?:\s[^>]*)?>[\s\S]*?<\/a:p>/g;
    let m;
    while ((m = paraRe.exec(xml)) !== null) {
      const t = textRuns(m[0], 'a:t').join('').replace(/\s+/g, ' ').trim();
      if (t) lines.push(t);
    }

    // Speaker notes often carry the trainer's actual guidance.
    const notesName = 'ppt/notesSlides/notesSlide' + n + '.xml';
    if (entries.has(notesName)) {
      const nx = readEntry(buf, entries.get(notesName)).toString('utf8');
      const notes = [];
      let p;
      const nre = /<a:p(?:\s[^>]*)?>[\s\S]*?<\/a:p>/g;
      while ((p = nre.exec(nx)) !== null) {
        const t = textRuns(p[0], 'a:t').join('').replace(/\s+/g, ' ').trim();
        // Skip the bare slide-number placeholder notes carry.
        if (t && t !== String(n)) notes.push(t);
      }
      if (notes.length) {
        lines.push('[Speaker notes]');
        for (const t of notes) lines.push(t);
      }
    }
  }
  return tidy(lines);
}

// ---------------------------------------------------------------------------
// .xlsx — one labelled section per sheet, cells joined by " | "
// ---------------------------------------------------------------------------

function extractXlsx(buf, entries) {
  // Shared strings table: every <si> is one string, possibly split across runs.
  let shared = [];
  if (entries.has('xl/sharedStrings.xml')) {
    const sx = readEntry(buf, entries.get('xl/sharedStrings.xml')).toString('utf8');
    const siRe = /<si(?:\s[^>]*)?>([\s\S]*?)<\/si>/g;
    let m;
    while ((m = siRe.exec(sx)) !== null) {
      shared.push(textRuns(m[1], 't').join('').replace(/\s+/g, ' ').trim());
    }
  }

  // Map sheet name -> worksheet part, via workbook.xml + its rels.
  const wb = readEntry(buf, entries.get('xl/workbook.xml')).toString('utf8');
  const rels = entries.has('xl/_rels/workbook.xml.rels')
    ? readEntry(buf, entries.get('xl/_rels/workbook.xml.rels')).toString('utf8')
    : '';

  const relTarget = {};
  let rm;
  const relRe = /<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"[^>]*\/?>/g;
  while ((rm = relRe.exec(rels)) !== null) relTarget[rm[1]] = rm[2];

  const sheets = [];
  let sm;
  const sheetRe = /<sheet\b[^>]*\/?>/g;
  while ((sm = sheetRe.exec(wb)) !== null) {
    const tag = sm[0];
    const name = /name="([^"]*)"/.exec(tag);
    const rid = /r:id="([^"]*)"/.exec(tag);
    if (!name || !rid) continue;
    let target = relTarget[rid[1]] || '';
    target = target.replace(/^\/?xl\//, '').replace(/^\//, '');
    sheets.push({ name: unescapeXml(name[1]), part: 'xl/' + target });
  }

  const colOf = ref => (/^([A-Z]+)/.exec(ref || '') || ['', ''])[1];

  const lines = [];
  for (const sheet of sheets) {
    if (!entries.has(sheet.part)) continue;
    const xml = readEntry(buf, entries.get(sheet.part)).toString('utf8');

    lines.push('');
    lines.push('=== Sheet: ' + sheet.name + ' ===');

    const rowRe = /<row(?:\s[^>]*)?>[\s\S]*?<\/row>|<row(?:\s[^>]*)?\/>/g;
    let r;
    while ((r = rowRe.exec(xml)) !== null) {
      const cells = [];
      const cellRe = /<c\b([^>]*)\/>|<c\b([^>]*)>([\s\S]*?)<\/c>/g;
      let c;
      while ((c = cellRe.exec(r[0])) !== null) {
        const attrs = c[1] || c[2] || '';
        const body = c[3] || '';
        const type = (/t="([^"]+)"/.exec(attrs) || [])[1];
        let val = '';
        if (type === 's') {
          const idx = parseInt(textRuns(body, 'v').join('') || '-1', 10);
          val = shared[idx] !== undefined ? shared[idx] : '';
        } else if (type === 'inlineStr') {
          val = textRuns(body, 't').join('');
        } else if (type === 'str') {
          val = textRuns(body, 'v').join('');
        } else {
          val = textRuns(body, 'v').join('');
        }
        val = String(val).replace(/\s+/g, ' ').trim();
        if (val) cells.push(colOf((/r="([^"]+)"/.exec(attrs) || [])[1]) + ':' + val);
      }
      if (cells.length) lines.push(cells.join(' | '));
    }
  }
  return tidy(lines);
}

// ---------------------------------------------------------------------------
// Driver
// ---------------------------------------------------------------------------

// Keep output filenames shallow and space-free: on Windows PowerShell 5.1 a
// full path over ~260 characters fails, and spaces complicate every later
// command that touches these files.
function outName(file) {
  return file
    .replace(/\.(docx|pptx|xlsx)$/i, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') + '.txt';
}

function main() {
  const only = process.argv[2];
  const all = fs.readdirSync(ORIGINALS).filter(f => /\.(docx|pptx|xlsx)$/i.test(f));
  const files = only ? all.filter(f => f === only) : all;

  if (!files.length) {
    console.error(only ? 'no such file in originals/: ' + only : 'nothing to extract');
    process.exit(1);
  }

  let ok = 0;
  let bad = 0;
  for (const file of files.sort()) {
    const dest = outName(file);
    try {
      const buf = fs.readFileSync(path.join(ORIGINALS, file));
      const entries = readZip(buf);
      let text;
      if (/\.docx$/i.test(file)) text = extractDocx(buf, entries);
      else if (/\.pptx$/i.test(file)) text = extractPptx(buf, entries);
      else text = extractXlsx(buf, entries);

      const header = 'Source: ' + file + '\n' +
        'Extracted by: 02_Working/tools/extract-text.js\n' +
        '(Plain-text extraction. The original in originals/ is authoritative.)\n' +
        '---\n\n';
      fs.writeFileSync(path.join(EXTRACTED, dest), header + text + '\n', 'utf8');
      console.log('OK   ' + file + '  ->  ' + dest + '  (' + text.length + ' chars)');
      ok++;
    } catch (e) {
      console.log('FAIL ' + file + '  ->  ' + e.message);
      bad++;
    }
  }
  console.log('');
  console.log(ok + ' extracted, ' + bad + ' failed');
  process.exit(bad === 0 ? 0 : 1);
}

main();
