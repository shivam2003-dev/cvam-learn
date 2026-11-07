const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');

function readModule(file) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const context = { exports: {}, require: (id) => id === 'react/jsx-runtime' ? require(id) : new Proxy({}, { get: (_, key) => String(key) }) };
  vm.runInNewContext(code, context);
  return context.exports;
}
function collect(node, out = []) {
  if (Array.isArray(node)) node.forEach((n) => collect(n, out));
  else if (node && typeof node === 'object') {
    if (node.type === 'Figure') out.push(node);
    else if (['Flow', 'Graph', 'Layers', 'Timeline', 'Sequence', 'Quadrant'].includes(node.type)) out.push({ type: 'Figure', standalone: true, props: { children: node } });
    else if (node.props) collect(node.props.children, out);
  }
  return out;
}
function model(node) {
  if (Array.isArray(node)) return node.map(model);
  if (!node || typeof node !== 'object') return node;
  if (node.props) return { type: node.type, ...model(node.props) };
  return Object.fromEntries(Object.entries(node).filter(([k]) => !['tone', 'col', 'row', 'cellW', 'cellH', 'nodeW', 'w', 'weight', 'gap', 'shape', 'bend'].includes(k)).map(([k, v]) => [k, model(v)]));
}
const style = 'Use case: scientific-educational. Asset type: finished engineering course diagram. Selected visual style: clean vector architecture (Option 1). Pure white background, precise straight connectors, aligned rounded cards and clear group boundaries, flat useful service symbols, crisp large dark sans-serif labels, restrained blue and teal accents. Generous whitespace. No handwriting, no 3D, no decorative characters, no watermarks or brand logos. LANDSCAPE ONLY, 1536 x 1024 or wider, width strictly greater than height. Draw ONE complete diagram, not a study-sheet collage. Use a short accurate title. Prioritize readable labels. Preserve source meaning, all named components, arrow directions, important edge labels and boundaries. Distinguish logical boundaries from network/request flow. Do not invent service guarantees, numbers, topology, certification facts or extra services. Render declarative source data as a diagram; never print source code. No option/style badges on the final course diagrams.\n';
const jobs = [];
for (const courseId of ['gcp-pca', 'aws-ans-c01']) {
  const course = Object.values(readModule(`src/content/courseware/${courseId}/curriculum.ts`)).find((v) => v.slug === courseId);
  const dir = `src/content/courseware/${courseId}/visuals`;
  if (fs.existsSync(`${dir}/generation-plan.json`)) {
    const existing = JSON.parse(fs.readFileSync(`${dir}/generation-plan.json`));
    for (const chapter of course.modules) for (const meta of chapter.lessons) {
      const lesson = readModule(`src/content/courseware/${courseId}/lessons/${meta.slug}.tsx`).lesson;
      for (const task of lesson.tasks) for (const figure of collect(task.body).filter(f => f.standalone)) {
        if (existing.some(j => j.standalone && j.lesson === meta.slug && j.source.section === task.title)) continue;
        const index = 1 + Math.max(0, ...existing.filter(j => j.lesson === meta.slug).map(j => j.panel));
        const source = { section: task.title, caption: task.title, diagram: model(figure.props.children) };
        existing.push({ id: `${meta.slug}-diagram-${index}`, course: courseId, kind: 'diagram', lesson: meta.slug, panel: index, standalone: true, chapter: chapter.id, title: meta.title, source, prompt: style + `Course: ${course.title}. Lesson: ${meta.title}. Section: ${task.title}.\nSource diagram:\n` + JSON.stringify(source.diagram) });
      }
    }
    fs.writeFileSync(`${dir}/generation-plan.json`, JSON.stringify(existing, null, 2) + '\n');
    jobs.push(...existing);
    continue;
  }
  const courseJobs = [];
  for (const [ci, chapter] of course.modules.entries()) {
    const learning = [];
    for (const meta of chapter.lessons) {
      const lesson = readModule(`src/content/courseware/${courseId}/lessons/${meta.slug}.tsx`).lesson;
      let index = 0;
      for (const task of lesson.tasks) for (const figure of collect(task.body)) {
        index++;
        const source = { section: task.title, caption: figure.props.caption || task.title, diagram: model(figure.props.children) };
        courseJobs.push({ id: `${meta.slug}-diagram-${index}`, course: courseId, kind: 'diagram', lesson: meta.slug, panel: index, ...(figure.standalone ? { standalone: true } : {}), chapter: chapter.id, title: meta.title, source, prompt: style + `Course: ${course.title}. Lesson: ${meta.title}. Section: ${task.title}. Caption: ${source.caption}.\nSource diagram:\n` + JSON.stringify(source.diagram) });
      }
      learning.push({ title: meta.title, summary: meta.summary, takeaways: lesson.takeaways });
    }
    courseJobs.push({ id: `${chapter.id}-summary`, course: courseId, kind: 'summary', chapter: chapter.id, title: chapter.title, lessons: learning, prompt: style + `Create a cohesive chapter recap diagram for ${course.title}. Title: "Chapter ${ci + 1}: ${chapter.title}". Subtitle: "Chapter recap". Cover ALL lessons below in connected concept clusters, a decision flow, comparison or architecture appropriate to the chapter. Use concise labels instead of paragraphs. Include a bottom strip "Put it into practice" with one actionable next step derived from these learning points. Only use the supplied learning content.\n` + JSON.stringify(learning) });
  }
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(`${dir}/generation-plan.json`, JSON.stringify(courseJobs, null, 2) + '\n');
  jobs.push(...courseJobs);
}
console.log(JSON.stringify(jobs.reduce((out, j) => { out[j.course] ??= { diagrams: 0, recaps: 0, lessons: new Set() }; out[j.course][j.kind === 'diagram' ? 'diagrams' : 'recaps']++; if (j.lesson) out[j.course].lessons.add(j.lesson); return out; }, {}), (_, value) => value instanceof Set ? value.size : value));
