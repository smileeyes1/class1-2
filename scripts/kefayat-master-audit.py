# CI parser diagnostics trigger 2026-08-31
#!/usr/bin/env python3
import json, re, hashlib, subprocess, sys
from pathlib import Path
from docx import Document
ROOT=Path(__file__).resolve().parents[1]; SRC=ROOT/'.audit-source'/'kk'; OUT=ROOT/'zaytoona'/'kefayat'
SUBJECTS={'arabic':'اللغة العربية','math':'الرياضيات','islamic':'التربية الإسلامية','nurturing':'التنشئة/العلوم الحياتية'}; EXPECTED={(g,s) for g in range(1,5) for s in SUBJECTS}
def norm(x): return re.sub(r'\s+',' ',str(x or '').replace('\xa0',' ')).strip()
def sha(x): return hashlib.sha256(x.encode('utf-8')).hexdigest()
def grade(name):
 m=re.search(r'(?:الصف|صف)\s*([1-4١٢٣٤])|الصف([1-4١٢٣٤])|صف([1-4١٢٣٤])',name)
 if not m:m=re.search(r'([1-4١٢٣٤])',name)
 if not m:return None
 x=next(v for v in m.groups() if v); return {'١':1,'٢':2,'٣':3,'٤':4}.get(x,int(x) if x.isdigit() else None)
def subject(name):
 if 'العربية' in name:return 'arabic'
 if 'الرياضيات' in name:return 'math'
 if 'اسلامية' in name or 'إسلامية' in name:return 'islamic'
 if 'تنشئة' in name or 'علوم' in name or 'وطنية' in name:return 'nurturing'
 return None
def header_score(cells): return sum(1 for c in cells if any(k in c for k in ['كفاية','الكفاية','معيار','المعيار','مؤشر','المؤشر','قيمة','القيم','مجال','المجال','نواتج','نتاج']))
def map_fields(headers,cells):
 r={}
 for h,c in zip(headers,cells):
  h=norm(h); c=norm(c)
  if not h:continue
  if 'مجال' in h:r.setdefault('domain',c)
  elif 'كفاية' in h:r.setdefault('competency',c)
  elif 'معيار' in h:r.setdefault('standard',c)
  elif 'مؤشر' in h or 'نتاج' in h:r.setdefault('indicator',c)
  elif 'قيمة' in h:r.setdefault('value',c)
  else:r.setdefault('extra',[]);r['extra'].append({'header':h,'text':c})
 return r
def parse_doc(path):
 g=grade(path.name); s=subject(path.name); doc=Document(path); records=[]; diagnostics={'file':path.name,'grade':g,'subject':s,'tables':[],'paragraphs':[norm(p.text) for p in doc.paragraphs if norm(p.text)][:20]}
 if not g or not s:return [],{**diagnostics,'status':'UNMAPPED'}
 for ti,t in enumerate(doc.tables):
  rows=[[norm(c.text) for c in row.cells] for row in t.rows]; rows=[r for r in rows if any(r)]
  td={'table':ti,'rowCount':len(rows),'colCount':max([len(r) for r in rows] or [0]),'preview':rows[:8]}; diagnostics['tables'].append(td)
  if not rows:continue
  hi=max(range(min(len(rows),8)),key=lambda i:header_score(rows[i])); headers=rows[hi]
  if header_score(headers)<1: headers=[f'column_{i+1}' for i in range(len(headers))]; hi=-1
  for ri,cells in enumerate(rows[hi+1:],start=hi+1):
   if not any(cells) or len(cells)!=len(headers):continue
   f=map_fields(headers,cells); meaningful=any(f.get(k) for k in ['competency','standard','indicator','value','domain'])
   if not meaningful:continue
   raw=' | '.join(cells); key=sha(f'{s}|{g}|{raw}')
   records.append({'id':'KK-'+key[:16],'grade':g,'subject':s,'subjectLabel':SUBJECTS[s],'domain':f.get('domain',''),'competency':f.get('competency',''),'standard':f.get('standard',''),'indicator':f.get('indicator',''),'value':f.get('value',''),'extra':f.get('extra',[]),'raw':raw,'source':{'repository':'smileeyes1/kk','branch':'main','file':path.name,'table':ti,'row':ri,'sourceSha':hashlib.sha256(path.read_bytes()).hexdigest()},'provenance':'USER_PROVIDED_REFERENCE','officialStatus':'UNVERIFIED'})
 return records,{**diagnostics,'status':'OK','records':len(records)}
def main():
 if not SRC.exists():SRC.parent.mkdir(parents=True,exist_ok=True);subprocess.run(['git','clone','--depth','1','https://github.com/smileeyes1/kk.git',str(SRC)],check=True)
 files=list(SRC.glob('*.docx')); allr=[]; manifests=[]
 for p in files:
  r,m=parse_doc(p);allr.extend(r);manifests.append(m)
 coverage={(g,s):0 for g,s in EXPECTED}
 for r in allr:coverage[(r['grade'],r['subject'])]+=1
 duplicates=[];seen={}
 for r in allr:
  k=(r['grade'],r['subject'],r['domain'],r['competency'],r['standard'],r['indicator'],r['value'])
  if k in seen:duplicates.append({'key':k,'first':seen[k],'duplicate':r['id']})
  else:seen[k]=r['id']
 gaps=[{'grade':g,'subject':s,'count':coverage[(g,s)]} for g,s in sorted(EXPECTED) if coverage[(g,s)]==0]
 conflicts=[];by_comp={}
 for r in allr:
  k=(r['grade'],r['subject'],r['competency']);by_comp.setdefault(k,set()).add((r['standard'],r['indicator'],r['value']))
 for k,vals in by_comp.items():
  if len(vals)>1 and k[2]:conflicts.append({'key':k,'variants':list(vals)[:20]})
 unique={}
 for r in allr:unique.setdefault((r['grade'],r['subject'],r['domain'],r['competency'],r['standard'],r['indicator'],r['value']),r)
 records=list(unique.values()); OUT.mkdir(parents=True,exist_ok=True)
 catalog={'schemaVersion':4,'audit':'Ω KEFAYAT MASTER AUDIT & COMPLETION','generatedFrom':{'repository':'smileeyes1/kk','branch':'main'},'officialityPolicy':'USER-PROVIDED REFERENCE; NOT OFFICIAL-VERIFIED','recordCount':len(records),'inputRecordCount':len(allr),'deduplicated':len(allr)-len(records),'coverage':{'grades':[1,2,3,4],'subjects':list(SUBJECTS),'matrix':{f'{g}|{s}':coverage[(g,s)] for g,s in sorted(EXPECTED)}},'records':records}
 (OUT/'master-audit.json').write_text(json.dumps({'status':'NO-GO' if gaps else 'PASS','files':manifests,'coverage':catalog['coverage'],'duplicates':duplicates,'conflicts':conflicts,'gaps':gaps,'inputRecordCount':len(allr),'canonicalRecordCount':len(records)},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 (OUT/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');(OUT/'catalog.min.json').write_text(json.dumps(catalog,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
 status='PASS' if not gaps else 'NO-GO'; print(json.dumps({'status':status,'files':len(files),'records':len(records),'duplicates':len(duplicates),'conflicts':len(conflicts),'gaps':gaps,'coverage':catalog['coverage']['matrix']},ensure_ascii=False,indent=2));
 if gaps:sys.exit(2)
if __name__=='__main__':main()
