import sys, zipfile, xml.etree.ElementTree as ET
from pathlib import Path
DOCX=Path(sys.argv[1]); OUT=Path(sys.argv[2]); G='http://schemas.openxmlformats.org/wordprocessingml/2006/main'
NS={'w':G}
with zipfile.ZipFile(DOCX) as z: xml=z.read('word/document.xml')
root=ET.fromstring(xml); rows=[]
for tr in root.findall('.//w:tbl/w:tr',NS):
    cells=[]
    for tc in tr.findall('./w:tc',NS):
        parts=[]
        for t in tc.findall('.//w:t',NS): parts.append(t.text or '')
        cells.append(' '.join(''.join(parts).split()))
    if any(cells): rows.append(cells)
# Preserve table order; merge cells only by textual extraction, never invent content.
lines=['# GENERATED SOURCE EXTRACTION — ISLAMIC GRADE 4','STATUS: GENERATED DIRECTLY FROM USER-PROVIDED DOCX.','SOURCE CLASS: USER-PROVIDED REFERENCE; NOT OFFICIAL-VERIFIED.','## الصف 4','SOURCE: `كفايات التربية الاسلامية ومعاييرها للصف 4. .docx`','EXTRACTION ORIGIN: DOCX','### ORIGINAL EXTRACTED TEXT']
for r in rows:
    lines.append(' | '.join(r))
OUT.write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(f'EXTRACTED_ROWS={len(rows)}')
if len(rows)<2: raise SystemExit('DOCX_EXTRACTION_EMPTY')
