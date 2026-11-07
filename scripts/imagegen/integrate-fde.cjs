const fs=require('fs');
const ts=require('typescript');
const plan=require('../../src/content/courseware/fde/visuals/generation-plan.json');
const notes={};
function describe(m) {
  if(Array.isArray(m))return m.flatMap(describe);
  if(!m)return [];
  const line=(a,b)=>[a,b].filter(Boolean).join(': ');
  switch(m.type){
    case 'Flow': return m.steps.map((s,i)=>`${i+1}. ${line(s.title,s.note)}`);
    case 'Layers': return m.layers.map((s,i)=>`${i+1}. ${line(s.title,s.note)}`);
    case 'Timeline': return m.phases.map(s=>line(line(s.label,s.when),s.items?.join('; ')));
    case 'Graph': {const names=Object.fromEntries(m.nodes.map(n=>[n.id,n.label]));return [...(m.groups||[]).map(g=>`Boundary: ${g.label}`),...m.nodes.map(n=>line(n.label,n.sub)),...(m.edges||[]).map(e=>`${names[e.from]} ${e.both?'↔':'→'} ${names[e.to]}${e.label?': '+e.label:''}${e.dashed?' (dashed connection)':''}`)];}
    case 'Sequence': {const names=Object.fromEntries(m.actors.map(a=>typeof a==='string'?[a,a]:[a.id,a.label]));return m.messages.map(s=>s.note?`Note: ${s.note}`:`${names[s.from]} → ${names[s.to]}: ${s.text}`);}
    case 'Quadrant': return [`Horizontal axis: ${m.xLabel}; vertical axis: ${m.yLabel}`,...(m.corners||[]).map((s,i)=>`${['Top left','Top right','Bottom left','Bottom right'][i]}: ${s}`),...m.items.map(s=>`${s.label}: ${s.x<.5?'lower':'higher'} ${m.xLabel}; ${s.y<.5?'lower':'higher'} ${m.yLabel}`)];
    default: throw Error(`Unknown diagram ${m.type}`);
  }
}
for(const j of plan.filter(j=>j.kind==='lesson')) {
  notes[j.id]={title:j.title,panels:j.figures.map(f=>({section:f.section,caption:f.caption,notes:describe(f.diagram)}))};
  const file=`src/content/courseware/fde/lessons/${j.id}.tsx`;
  const source=fs.readFileSync(file,'utf8');
  const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const changes=[]; let panel=0;
  function walk(node){
    if(ts.isJsxElement(node)&&node.openingElement.tagName.getText(ast)==='Figure'){
      panel++;changes.push({start:node.getStart(ast),end:node.end,text:`<DiagramReference lesson="${j.id}" panel={${panel}} />`});return;
    }
    if(ts.isImportDeclaration(node)&&node.moduleSpecifier.text==='@/components/Diagram'){
      const names=node.importClause.namedBindings.elements.filter(e=>e.name.text==='Exercise').map(e=>e.getText(ast));
      changes.push({start:node.getStart(ast),end:node.end,text:names.length?`import { ${names.join(', ')} } from "@/components/Diagram";`:''});
    }
    ts.forEachChild(node,walk);
  }
  walk(ast);
  if(panel!==j.figures.length)throw Error(`${j.id} figure mismatch`);
  let result=source;
  changes.sort((a,b)=>b.start-a.start).forEach(c=>{result=result.slice(0,c.start)+c.text+result.slice(c.end)});
  result=`import { DiagramReference } from "@/components/FdeVisuals";\n`+result;
  fs.writeFileSync(file,result);
}
fs.writeFileSync('src/content/courseware/fde/visuals/diagram-notes.json',JSON.stringify(notes,null,2)+'\n');
console.log(`Integrated ${Object.keys(notes).length} lessons`);
