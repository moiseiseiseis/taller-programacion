export type MarkdownStep = {
  title: string | null;
  markdown: string;
};

// Divide el markdown de una lección en pasos usando los encabezados `##` como
// cortes de sección. El `#` principal se descarta (ya se muestra como título
// de la lección en la página). Si no hay ningún `##`, devuelve un solo paso
// con todo el contenido.
export function parseMarkdownSteps(markdown: string): MarkdownStep[] {
  const lines = markdown.split('\n');
  const steps: MarkdownStep[] = [];
  let currentTitle: string | null = null;
  let currentLines: string[] = [];
  let hasContent = false;

  function pushCurrent() {
    const body = currentLines.join('\n').trim();
    if (body || currentTitle) {
      steps.push({ title: currentTitle, markdown: body });
    }
  }

  for (const line of lines) {
    const h2Match = /^##\s+(.*)/.exec(line);
    const h1Match = /^#\s+(.*)/.exec(line);

    if (h2Match) {
      pushCurrent();
      currentTitle = h2Match[1].trim();
      currentLines = [];
      hasContent = true;
    } else if (h1Match) {
      continue;
    } else {
      currentLines.push(line);
    }
  }
  pushCurrent();

  if (!hasContent || steps.length === 0) {
    return [{ title: null, markdown: markdown.trim() }];
  }

  return steps;
}
