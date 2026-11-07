const fs = require('fs');
const ts = require('typescript');
const vm = require('vm');
function readModule(file) {
  const code = ts.transpileModule(fs.readFileSync(file,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const context = { exports:{}, require:(id)=>id==='react/jsx-runtime'?require(id):new Proxy({}, {get:(_,key)=>String(key)}) };
  vm.runInNewContext(code,context); return context.exports;
}
const course = readModule('src/content/courseware/fde/curriculum.ts').fde;
function collect(node, out=[]) {
  if (Array.isArray(node)) node.forEach(n=>collect(n,out));
  else if(node && typeof node==='object') {
    if(node.type==='Figure') out.push(node);
    else if(node.props) collect(node.props.children,out);
  }
  return out;
}
function model(node) {
  if(Array.isArray(node)) return node.map(model);
  if(!node || typeof node!=='object') return node;
  if(node.props) return {type:node.type, ...model(node.props)};
  return Object.fromEntries(Object.entries(node).filter(([k])=>!['tone','col','row','cellW','cellH','nodeW','w','weight','gap','shape','bend'].includes(k)).map(([k,v])=>[k,model(v)]));
}
const style = `Use case: scientific-educational. Asset type: courseware study diagram. Create one polished HANDWRITTEN educational sketchnote on warm ivory paper, dark navy pen, teal and ochre highlighter accents, organically drawn boxes and directional arrows, small useful sketch icons. Expert technical accuracy, beautiful clear handwritten print lettering (not cursive), generous whitespace and large highly legible text. Flat straight-on scan, no desk, hands, shadows, logos or watermark. Use a LANDSCAPE layout, width greater than height (1536 x 1024 or wider), with numbered panels in a balanced grid of at most two rows, each panel a real diagram appropriate to the topic (flow, architecture, decision tree, timeline, comparison). Keep panel boundaries clear for later individual display; no crossing arrows between unrelated panels. Simplify verbose notes to short labels, retain technical meaning and direction of dependencies. No invented quantitative claims. All text in English. This is for an engineering course, not decoration. Landscape only. At least 1536px wide; prioritize readable short labels over dense paragraphs.\n`;
const jobs=[];
for (const [ci,ch] of course.modules.entries()) {
  const chapterLessons=[];
  for (const l of ch.lessons) {
    const lesson=readModule(`src/content/courseware/fde/lessons/${l.slug}.tsx`).lesson;
    const figs=lesson.tasks.flatMap(t=>collect(t.body).map(f=>({section:t.title,caption:f.props.caption,diagram:model(f.props.children)})));
    chapterLessons.push({title:l.title,summary:l.summary,takeaways:lesson.takeaways});
    jobs.push({id:l.slug,kind:'lesson',chapter:ch.id,title:l.title,figures:figs,takeaways:lesson.takeaways,prompt:style+`Title: "${l.title}". Create ${figs.length} numbered diagram panels, one for each source diagram below. The source uses a declarative data format; render its meaning as handwritten diagrams, never print source code. Preserve ALL panels, in this exact order. Shorten labels where necessary.\n`+JSON.stringify(figs)});
  }
  jobs.push({id:ch.id+'-summary',kind:'summary',chapter:ch.id,title:ch.title,prompt:style+`Title: "Chapter ${ci+1}: ${ch.title}". Subtitle: "Chapter recap". Create a cohesive visual summary that covers ALL lessons in this chapter. Use connected concept clusters with short memorable labels, a practical flow or architecture where helpful, and one bottom strip "Put it into practice" with an actionable next step. Use these course-provided learning points as your only source. Avoid tiny paragraphs; distill to concise visual concepts.\n`+JSON.stringify(chapterLessons)});
}
fs.writeFileSync('src/content/courseware/fde/visuals/generation-plan.json',JSON.stringify(jobs,null,2)+'\n');
console.log(JSON.stringify({chapters:course.modules.length,lessons:jobs.filter(j=>j.kind==='lesson').length,figures:jobs.reduce((s,j)=>s+(j.figures?.length||0),0),jobs:jobs.length,maxPrompt:Math.max(...jobs.map(j=>j.prompt.length))}));
