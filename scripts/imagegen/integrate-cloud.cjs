const fs = require('node:fs');
const ts = require('typescript');

function cleanDiagramImports(source) {
  const ast = ts.createSourceFile('lesson.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const used = new Set();
  function visit(node) {
    if (ts.isImportDeclaration(node)) return;
    if (ts.isIdentifier(node)) used.add(node.text);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return source.replace(/import \{([^}]+)\} from "@\/components\/Diagram";/g, (_, names) => {
    const retained = names.split(',').map(s => s.trim()).filter(name => used.has(name));
    return retained.length ? `import { ${retained.join(', ')} } from "@/components/Diagram";` : '';
  });
}

function describe(m) {
  if (Array.isArray(m)) return m.flatMap(describe);
  if (!m) return [];
  const line = (a, b) => [a, b].filter(Boolean).join(': ');
  switch (m.type) {
    case 'Flow': return m.steps.map((s, i) => `${i + 1}. ${line(s.title, s.note)}`);
    case 'Layers': return m.layers.map((s, i) => `${i + 1}. ${line(s.title, s.note)}`);
    case 'Timeline': return m.phases.map(s => line(line(s.label, s.when), s.items?.join('; ')));
    case 'Graph': {
      const names = Object.fromEntries(m.nodes.map(n => [n.id, n.label]));
      return [...(m.groups || []).map(g => `Boundary: ${g.label}`), ...m.nodes.map(n => line(n.label, n.sub)), ...(m.edges || []).map(e => `${names[e.from]} ${e.both ? '↔' : '→'} ${names[e.to]}${e.label ? ': ' + e.label : ''}${e.dashed ? ' (dashed connection)' : ''}`)];
    }
    case 'Sequence': {
      const names = Object.fromEntries(m.actors.map(a => typeof a === 'string' ? [a, a] : [a.id, a.label]));
      return m.messages.map(s => s.note ? `Note: ${s.note}` : `${names[s.from]} → ${names[s.to]}: ${s.text}`);
    }
    case 'Quadrant': return [`Horizontal axis: ${m.xLabel}; vertical axis: ${m.yLabel}`, ...(m.corners || []).map((s, i) => `${['Top left', 'Top right', 'Bottom left', 'Bottom right'][i]}: ${s}`), ...m.items.map(s => `${s.label}: ${s.x < .5 ? 'lower' : 'higher'} ${m.xLabel}; ${s.y < .5 ? 'lower' : 'higher'} ${m.yLabel}`)];
    default: throw Error(`Unknown diagram ${m.type}`);
  }
}

for (const course of ['gcp-pca', 'aws-ans-c01']) {
  const dir = `src/content/courseware/${course}`;
  const jobs = JSON.parse(fs.readFileSync(`${dir}/visuals/generation-plan.json`));
  const notes = Object.fromEntries(jobs.filter(j => j.kind === 'diagram').map(j => [j.id, { lesson: j.lesson, section: j.source.section, caption: j.source.caption, notes: describe(j.source.diagram) }]));
  fs.writeFileSync(`${dir}/visuals/diagram-notes.json`, JSON.stringify(notes, null, 2) + '\n');
  const byLesson = {};
  for (const job of jobs.filter(j => j.kind === 'diagram')) (byLesson[job.lesson] ??= []).push(job);
  for (const [slug, diagrams] of Object.entries(byLesson)) {
    const file = `${dir}/lessons/${slug}.tsx`;
    const source = fs.readFileSync(file, 'utf8');
    const pending = diagrams.filter(job => !source.includes(`id="${job.id}"`));
    if (!pending.length) {
      const cleaned = cleanDiagramImports(source);
      if (cleaned !== source) fs.writeFileSync(file, cleaned);
      continue;
    }
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const changes = []; let index = 0;
    function walk(node) {
      if (ts.isJsxSelfClosingElement(node) && pending.some(job => job.standalone && job.source.diagram.type === node.tagName.getText(ast))) {
        const job = pending[index++];
        changes.push({ start: node.getStart(ast), end: node.end, text: `<CloudDiagram course="${course}" id="${job.id}" />` });
        return;
      }
      if (ts.isJsxElement(node) && (node.openingElement.tagName.getText(ast) === 'Figure' || pending.some(job => job.standalone && job.source.diagram.type === node.openingElement.tagName.getText(ast)))) {
        const job = pending[index++];
        if (!job) throw Error(`${slug}: unexpected figure`);
        changes.push({ start: node.getStart(ast), end: node.end, text: `<CloudDiagram course="${course}" id="${job.id}" />` });
        return;
      }
      ts.forEachChild(node, walk);
    }
    walk(ast);
    if (index !== pending.length) throw Error(`${slug}: missing figure`);
    let result = source;
    changes.sort((a, b) => b.start - a.start).forEach(c => { result = result.slice(0, c.start) + c.text + result.slice(c.end); });
    // Remove only diagram imports that became unused after replacing Figures.
    result = cleanDiagramImports(result);
    fs.writeFileSync(file, (result.includes('from "@/components/CloudVisuals"') ? '' : 'import { CloudDiagram } from "@/components/CloudVisuals";\n') + result);
  }
  console.log(`${course}: integrated ${Object.keys(notes).length} diagrams across ${Object.keys(byLesson).length} lessons`);
}
