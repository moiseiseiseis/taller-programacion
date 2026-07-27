export type FsNode =
  | { type: 'file'; name: string; content: string; executable?: boolean }
  | { type: 'dir'; name: string; children: FsNode[] };

// El cwd se representa como un array de segmentos desde la raíz, ej. ['hogar', 'pip'].
export type Path = string[];

export function cloneFs(root: FsNode): FsNode {
  return JSON.parse(JSON.stringify(root));
}

export function resolveNode(root: FsNode, path: Path): FsNode | null {
  let node: FsNode = root;
  for (const segment of path) {
    if (node.type !== 'dir') return null;
    const next = node.children.find((c) => c.name === segment);
    if (!next) return null;
    node = next;
  }
  return node;
}

export function formatPath(path: Path): string {
  return '/' + path.join('/');
}

// Resuelve un argumento de ruta (relativo, absoluto, '..', '~') contra el cwd actual.
// Devuelve null si la ruta no existe.
export function resolvePathArg(
  root: FsNode,
  cwd: Path,
  homePath: Path,
  arg: string
): Path | null {
  let target: Path;

  if (arg === '~' || arg === '') {
    target = [...homePath];
  } else if (arg.startsWith('/')) {
    target = arg.split('/').filter(Boolean);
  } else {
    target = [...cwd];
    for (const segment of arg.split('/').filter(Boolean)) {
      if (segment === '.') continue;
      if (segment === '..') {
        target.pop();
      } else {
        target.push(segment);
      }
    }
  }

  return resolveNode(root, target) ? target : null;
}

export function listDir(root: FsNode, path: Path, showHidden: boolean): FsNode[] | null {
  const node = resolveNode(root, path);
  if (!node || node.type !== 'dir') return null;
  return node.children
    .filter((c) => showHidden || !c.name.startsWith('.'))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function splitParentAndName(arg: string): { parent: string; name: string } {
  const idx = arg.lastIndexOf('/');
  if (idx === -1) return { parent: '', name: arg };
  return { parent: arg.slice(0, idx), name: arg.slice(idx + 1) };
}

// Devuelve un NUEVO árbol con los children de dirPath reemplazados. No muta root.
function withChildrenAt(root: FsNode, dirPath: Path, newChildren: FsNode[]): FsNode {
  if (dirPath.length === 0) {
    if (root.type !== 'dir') return root;
    return { ...root, children: newChildren };
  }
  if (root.type !== 'dir') return root;
  const [head, ...rest] = dirPath;
  return {
    ...root,
    children: root.children.map((c) =>
      c.name === head && c.type === 'dir' ? withChildrenAt(c, rest, newChildren) : c
    ),
  };
}

// Agrega (o reemplaza si ya existía un nodo con el mismo nombre) un nodo
// dentro del directorio en dirPath. Devuelve un nuevo árbol, no muta root.
export function addNode(root: FsNode, dirPath: Path, node: FsNode): FsNode {
  const dir = resolveNode(root, dirPath);
  if (!dir || dir.type !== 'dir') return root;
  const filtered = dir.children.filter((c) => c.name !== node.name);
  return withChildrenAt(root, dirPath, [...filtered, node]);
}

// Quita un nodo por nombre del directorio en dirPath. Devuelve un nuevo árbol.
export function removeNode(root: FsNode, dirPath: Path, name: string): FsNode {
  const dir = resolveNode(root, dirPath);
  if (!dir || dir.type !== 'dir') return root;
  return withChildrenAt(root, dirPath, dir.children.filter((c) => c.name !== name));
}
