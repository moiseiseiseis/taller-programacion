import {
  addNode,
  formatPath,
  listDir,
  removeNode,
  resolveNode,
  resolvePathArg,
  splitParentAndName,
  type FsNode,
  type Path,
} from './filesystem';

const DEFAULT_HEAD_TAIL_LINES = 3;
const WHOAMI = 'pip';

export type CommandResult = {
  command: string;
  flags: string[];
  args: string[];
  output: string;
  isError: boolean;
  cwd: Path;
  root: FsNode;
  // Si rm -i encuentra un objetivo válido, no borra todavía: deja esto
  // seteado para que quien use el intérprete pida confirmación antes de
  // aplicar el borrado (ver resolveConfirmedDelete más abajo).
  confirm: { path: Path; name: string } | null;
};

// Aplica el borrado de un objetivo que quedó pendiente de confirmación
// (rm -i). Se llama después de que el alumno responde "sí" al prompt.
export function resolveConfirmedDelete(root: FsNode, confirm: { path: Path; name: string }): FsNode {
  const parentPath = confirm.path.slice(0, -1);
  return removeNode(root, parentPath, confirm.name);
}

// Divide una línea en tokens respetando comillas simples o dobles, para que
// "la clave final" llegue como un solo argumento en vez de partirse en tres.
function tokenize(raw: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;

  for (const ch of raw) {
    if (quote) {
      if (ch === quote) {
        quote = null;
      } else {
        current += ch;
      }
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (/\s/.test(ch)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(current);

  return tokens;
}

function parseInput(raw: string): { command: string; flags: string[]; args: string[] } {
  const tokens = tokenize(raw.trim());
  const command = tokens[0] || '';
  const flags: string[] = [];
  const args: string[] = [];

  for (const token of tokens.slice(1)) {
    if (token.startsWith('-')) {
      flags.push(token);
    } else {
      args.push(token);
    }
  }

  return { command, flags, args };
}

// Resuelve un argumento a un archivo (no directorio). Devuelve el nodo o un mensaje de error.
function resolveFile(
  root: FsNode,
  cwd: Path,
  homePath: Path,
  arg: string | undefined,
  commandName: string
): { node: FsNode; error: null } | { node: null; error: string } {
  if (!arg) return { node: null, error: `${commandName}: falta el nombre del archivo` };
  const path = resolvePathArg(root, cwd, homePath, arg);
  if (!path) return { node: null, error: `${commandName}: no se encontró: ${arg}` };
  const node = resolveNode(root, path);
  if (!node || node.type !== 'file') return { node: null, error: `${commandName}: no es un archivo: ${arg}` };
  return { node, error: null };
}

// Como resolveFile, pero si no hay argumento de archivo cae a la entrada por
// pipe (stdin). Es lo que le da sentido a comandos como `ls | wc -l`.
function resolveInput(
  root: FsNode,
  cwd: Path,
  homePath: Path,
  arg: string | undefined,
  stdin: string | null,
  commandName: string
): { content: string; error: null } | { content: null; error: string } {
  if (arg) {
    const result = resolveFile(root, cwd, homePath, arg, commandName);
    if (result.error) return { content: null, error: result.error };
    return { content: (result.node as { content: string }).content, error: null };
  }
  if (stdin !== null) return { content: stdin, error: null };
  return { content: null, error: `${commandName}: falta el archivo (o una entrada por pipe)` };
}

// Convierte un patrón simple con comodines (*, ?) en una expresión regular.
function globToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${escaped}$`);
}

// Recorre el árbol desde startPath (sin incluirlo a él mismo) buscando nodos
// cuyo nombre coincida con el patrón. Devuelve las rutas completas encontradas.
function findMatches(root: FsNode, startPath: Path, pattern: string): string[] {
  const regex = globToRegex(pattern);
  const results: string[] = [];

  function walk(node: FsNode, path: Path) {
    if (node.type !== 'dir') return;
    for (const child of node.children) {
      const childPath = [...path, child.name];
      if (regex.test(child.name)) results.push(formatPath(childPath));
      walk(child, childPath);
    }
  }

  const startNode = resolveNode(root, startPath);
  if (startNode) walk(startNode, startPath);
  return results;
}

// Resuelve el directorio destino y el nombre final para mv/cp: si el destino
// es un directorio existente, el nodo entra ahí conservando su nombre; si no,
// el último segmento del destino se usa como nuevo nombre.
function resolveMoveTarget(
  root: FsNode,
  cwd: Path,
  homePath: Path,
  srcNode: FsNode,
  destArg: string
): { dirPath: Path; name: string } | { error: string } {
  const destAsExisting = resolvePathArg(root, cwd, homePath, destArg);
  const destNode = destAsExisting ? resolveNode(root, destAsExisting) : null;

  if (destNode && destNode.type === 'dir') {
    return { dirPath: destAsExisting as Path, name: srcNode.name };
  }

  const { parent, name } = splitParentAndName(destArg);
  const parentPath = parent ? resolvePathArg(root, cwd, homePath, parent) : cwd;
  if (!parentPath) return { error: `no existe el directorio: ${parent}` };
  return { dirPath: parentPath, name };
}

function permissionString(node: FsNode): string {
  if (node.type === 'dir') return 'drwxr-xr-x';
  return node.executable ? '-rwxr-xr-x' : '-rw-r--r--';
}

// Ejecuta UN comando (sin pipes ni redirección; eso lo maneja runLine).
// stdin es la salida del comando anterior en una cadena de pipes, o null si
// este es el primer (o único) comando de la línea.
export function runCommand(
  root: FsNode,
  cwd: Path,
  homePath: Path,
  raw: string,
  stdin: string | null = null
): CommandResult {
  const { command, flags, args } = parseInput(raw);

  function make(
    output: string,
    isError: boolean,
    newCwd: Path = cwd,
    newRoot: FsNode = root,
    confirm: { path: Path; name: string } | null = null
  ): CommandResult {
    return { command, flags, args, output, isError, cwd: newCwd, root: newRoot, confirm };
  }

  if (!command) return make('', false);

  // Ejecutar un script: ./nombre.sh
  if (command.startsWith('./')) {
    const name = command.slice(2);
    const node = resolveNode(root, [...cwd, name]);
    if (!node || node.type !== 'file') return make(`bash: ${command}: no se encontró el archivo`, true);
    if (!node.executable) return make(`bash: ${command}: permiso denegado`, true);
    return make(`Ejecutando ${name}...\n¡Listo!`, false);
  }

  switch (command) {
    case 'pwd':
      return make(formatPath(cwd), false);

    case 'whoami':
      return make(WHOAMI, false);

    case 'ls': {
      const showHidden = flags.includes('-a') || flags.includes('-la') || flags.includes('-al');
      const longFormat = flags.includes('-l') || flags.includes('-la') || flags.includes('-al');

      // Comodín: ls *.txt filtra el directorio actual por patrón, no navega a otro lado.
      if (args[0] && args[0].includes('*')) {
        const entries = listDir(root, cwd, showHidden);
        if (!entries) return make('ls: no es un directorio', true);
        const regex = globToRegex(args[0]);
        const filtered = entries.filter((e) => regex.test(e.name));
        if (filtered.length === 0) return make(`ls: no hay coincidencias para ${args[0]}`, false);
        return make(filtered.map((e) => (e.type === 'dir' ? `${e.name}/` : e.name)).join('  '), false);
      }

      const targetPath = args[0] ? resolvePathArg(root, cwd, homePath, args[0]) : cwd;

      if (!targetPath) return make(`ls: no se encontró: ${args[0]}`, true);

      const entries = listDir(root, targetPath, showHidden);
      if (!entries) return make(`ls: no es un directorio: ${args[0]}`, true);
      if (entries.length === 0) return make('(directorio vacío)', false);

      if (longFormat) {
        const output = entries
          .map((e) => `${permissionString(e)}  ${e.type === 'dir' ? `${e.name}/` : e.name}`)
          .join('\n');
        return make(output, false);
      }

      const output = entries.map((e) => (e.type === 'dir' ? `${e.name}/` : e.name)).join('  ');
      return make(output, false);
    }

    case 'cd': {
      const target = resolvePathArg(root, cwd, homePath, args[0] ?? '~');
      if (!target) return make(`cd: no existe el directorio: ${args[0]}`, true);
      return make('', false, target);
    }

    case 'echo':
      return make([...flags, ...args].join(' '), false);

    case 'clear':
      return make('__CLEAR__', false);

    case 'cat': {
      const result = resolveInput(root, cwd, homePath, args[0], stdin, 'cat');
      if (result.error !== null) return make(result.error, true);
      return make(result.content, false);
    }

    // less/more no simulan paginado real: muestran el archivo completo, igual
    // que cat. La lección enseña CUÁNDO usarlos (archivos largos), aunque acá
    // el resultado visual sea el mismo.
    case 'less':
    case 'more': {
      const result = resolveFile(root, cwd, homePath, args[0], command);
      if (result.error !== null) return make(result.error, true);
      return make(`${(result.node as { content: string }).content}\n(fin del archivo)`, false);
    }

    case 'head':
    case 'tail': {
      let n = DEFAULT_HEAD_TAIL_LINES;
      let fileArg = args[0];
      if (flags.includes('-n') && args[0] && !Number.isNaN(Number(args[0]))) {
        n = Number(args[0]);
        fileArg = args[1];
      }

      const result = resolveInput(root, cwd, homePath, fileArg, stdin, command);
      if (result.error !== null) return make(result.error, true);

      const allLines = result.content.split('\n');
      const shown = command === 'head' ? allLines.slice(0, n) : allLines.slice(-n);
      return make(shown.join('\n'), false);
    }

    case 'wc': {
      const result = resolveInput(root, cwd, homePath, args[0], stdin, 'wc');
      if (result.error !== null) return make(result.error, true);

      const content = result.content;
      const lineCount = content.split('\n').length;
      const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
      const charCount = content.length;
      const suffix = args[0] ? ` ${args[0]}` : '';

      const output = flags.includes('-l') ? `${lineCount}${suffix}` : `${lineCount} ${wordCount} ${charCount}${suffix}`;
      return make(output, false);
    }

    case 'sort': {
      const result = resolveInput(root, cwd, homePath, args[0], stdin, 'sort');
      if (result.error !== null) return make(result.error, true);
      const sorted = result.content.split('\n').sort((a, b) => a.localeCompare(b));
      return make(sorted.join('\n'), false);
    }

    case 'touch': {
      if (!args[0]) return make('touch: falta el nombre del archivo', true);
      const { parent, name } = splitParentAndName(args[0]);
      const dirPath = parent ? resolvePathArg(root, cwd, homePath, parent) : cwd;
      if (!dirPath) return make(`touch: no existe el directorio: ${parent}`, true);

      const dirNode = resolveNode(root, dirPath);
      if (!dirNode || dirNode.type !== 'dir') return make(`touch: no es un directorio: ${parent}`, true);

      if (dirNode.children.some((c) => c.name === name)) return make('', false);

      const newRoot = addNode(root, dirPath, { type: 'file', name, content: '' });
      return make('', false, cwd, newRoot);
    }

    case 'mkdir': {
      if (!args[0]) return make('mkdir: falta el nombre del directorio', true);
      const recursive = flags.includes('-p');
      const segments = args[0].split('/').filter(Boolean);
      const currentPath: Path = args[0].startsWith('/') ? [] : [...cwd];
      let currentRoot = root;

      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const isLast = i === segments.length - 1;
        const existing = resolveNode(currentRoot, [...currentPath, seg]);

        if (existing) {
          if (existing.type !== 'dir') return make(`mkdir: ${seg} no es un directorio`, true);
          if (isLast && !recursive) return make(`mkdir: ya existe: ${args[0]}`, true);
          currentPath.push(seg);
          continue;
        }

        if (!isLast && !recursive) {
          return make('mkdir: no existe el directorio padre (usa -p)', true);
        }

        currentRoot = addNode(currentRoot, currentPath, { type: 'dir', name: seg, children: [] });
        currentPath.push(seg);
      }

      return make('', false, cwd, currentRoot);
    }

    case 'mv': {
      if (!args[0] || !args[1]) return make('mv: uso: mv origen destino', true);

      const srcPath = resolvePathArg(root, cwd, homePath, args[0]);
      if (!srcPath) return make(`mv: no se encontró: ${args[0]}`, true);
      const srcNode = resolveNode(root, srcPath);
      if (!srcNode) return make(`mv: no se encontró: ${args[0]}`, true);

      const target = resolveMoveTarget(root, cwd, homePath, srcNode, args[1]);
      if ('error' in target) return make(`mv: ${target.error}`, true);

      const srcParentPath = srcPath.slice(0, -1);
      let newRoot = removeNode(root, srcParentPath, srcNode.name);
      newRoot = addNode(newRoot, target.dirPath, { ...srcNode, name: target.name });

      return make('', false, cwd, newRoot);
    }

    case 'cp': {
      if (!args[0] || !args[1]) return make('cp: uso: cp origen destino', true);

      const srcPath = resolvePathArg(root, cwd, homePath, args[0]);
      if (!srcPath) return make(`cp: no se encontró: ${args[0]}`, true);
      const srcNode = resolveNode(root, srcPath);
      if (!srcNode) return make(`cp: no se encontró: ${args[0]}`, true);

      if (srcNode.type === 'dir' && !flags.includes('-r')) {
        return make(`cp: ${args[0]} es un directorio (usa -r)`, true);
      }

      const target = resolveMoveTarget(root, cwd, homePath, srcNode, args[1]);
      if ('error' in target) return make(`cp: ${target.error}`, true);

      const copiedNode: FsNode = JSON.parse(JSON.stringify({ ...srcNode, name: target.name }));
      const newRoot = addNode(root, target.dirPath, copiedNode);

      return make('', false, cwd, newRoot);
    }

    case 'rm': {
      if (!args[0]) return make('rm: falta el nombre del archivo o carpeta', true);

      const recursive = flags.includes('-r') || flags.includes('-rf') || flags.includes('-fr');
      const interactive = flags.includes('-i');

      const targetPath = resolvePathArg(root, cwd, homePath, args[0]);
      if (!targetPath) return make(`rm: no se encontró: ${args[0]}`, true);
      const targetNode = resolveNode(root, targetPath);
      if (!targetNode) return make(`rm: no se encontró: ${args[0]}`, true);

      if (targetNode.type === 'dir' && !recursive) {
        return make(`rm: no se puede eliminar '${args[0]}': es un directorio (usa -r)`, true);
      }

      if (interactive) {
        return make(`¿eliminar '${args[0]}'? (s/n)`, false, cwd, root, { path: targetPath, name: targetNode.name });
      }

      const parentPath = targetPath.slice(0, -1);
      const newRoot = removeNode(root, parentPath, targetNode.name);
      return make('', false, cwd, newRoot);
    }

    case 'rmdir': {
      if (!args[0]) return make('rmdir: falta el nombre del directorio', true);

      const targetPath = resolvePathArg(root, cwd, homePath, args[0]);
      if (!targetPath) return make(`rmdir: no se encontró: ${args[0]}`, true);
      const targetNode = resolveNode(root, targetPath);
      if (!targetNode || targetNode.type !== 'dir') return make(`rmdir: no es un directorio: ${args[0]}`, true);
      if (targetNode.children.length > 0) {
        return make(`rmdir: no se pudo eliminar '${args[0]}': el directorio no está vacío`, true);
      }

      const parentPath = targetPath.slice(0, -1);
      const newRoot = removeNode(root, parentPath, targetNode.name);
      return make('', false, cwd, newRoot);
    }

    case 'grep': {
      if (!args[0]) return make('grep: falta el patrón a buscar', true);
      const pattern = args[0];
      const recursive = flags.includes('-r') || flags.includes('-R');

      if (recursive) {
        const searchPath = args[1] ? resolvePathArg(root, cwd, homePath, args[1]) : cwd;
        if (!searchPath) return make(`grep: no se encontró: ${args[1]}`, true);

        const matches: string[] = [];
        function walk(node: FsNode, path: Path) {
          if (node.type === 'file') {
            const line = node.content.split('\n').find((l) => l.includes(pattern));
            if (line) matches.push(`${formatPath(path)}: ${line}`);
          } else {
            for (const child of node.children) walk(child, [...path, child.name]);
          }
        }
        const startNode = resolveNode(root, searchPath);
        if (startNode) walk(startNode, searchPath);

        return make(matches.length ? matches.join('\n') : '(sin coincidencias)', false);
      }

      const result = resolveInput(root, cwd, homePath, args[1], stdin, 'grep');
      if (result.error !== null) return make(result.error, true);
      const lines = result.content.split('\n').filter((l) => l.includes(pattern));
      return make(lines.length ? lines.join('\n') : '(sin coincidencias)', false);
    }

    case 'find': {
      if (!args[1]) return make('find: uso: find <ruta> -name <patrón>', true);
      const searchPath = args[0] ? resolvePathArg(root, cwd, homePath, args[0]) : cwd;
      if (!searchPath) return make(`find: no se encontró: ${args[0]}`, true);

      const matches = findMatches(root, searchPath, args[1]);
      return make(matches.length ? matches.join('\n') : '(sin resultados)', false);
    }

    case 'chmod': {
      if (args[0] !== '+x' || !args[1]) return make('chmod: uso: chmod +x archivo', true);

      const targetPath = resolvePathArg(root, cwd, homePath, args[1]);
      if (!targetPath) return make(`chmod: no se encontró: ${args[1]}`, true);
      const targetNode = resolveNode(root, targetPath);
      if (!targetNode || targetNode.type !== 'file') return make(`chmod: no es un archivo: ${args[1]}`, true);

      const parentPath = targetPath.slice(0, -1);
      const newRoot = addNode(root, parentPath, { ...targetNode, executable: true });
      return make('', false, cwd, newRoot);
    }

    default:
      return make(`${command}: comando no encontrado`, true);
  }
}

// Punto de entrada para lo que escribe el alumno en la terminal: soporta
// encadenar comandos con pipes (|) y redirigir la salida final a un archivo
// (> sobrescribe, >> agrega). Internamente sigue usando runCommand para cada
// comando individual de la cadena.
export function runLine(root: FsNode, cwd: Path, homePath: Path, raw: string): CommandResult {
  let append = false;
  let redirectTarget: string | null = null;
  let commandPart = raw;

  const appendIndex = raw.indexOf('>>');
  const singleIndex = raw.indexOf('>');

  if (appendIndex !== -1) {
    append = true;
    commandPart = raw.slice(0, appendIndex);
    redirectTarget = raw.slice(appendIndex + 2).trim();
  } else if (singleIndex !== -1) {
    append = false;
    commandPart = raw.slice(0, singleIndex);
    redirectTarget = raw.slice(singleIndex + 1).trim();
  }

  const segments = commandPart.split('|').map((s) => s.trim()).filter(Boolean);

  if (segments.length === 0) {
    return { command: '', flags: [], args: [], output: '', isError: false, cwd, root, confirm: null };
  }

  let currentRoot = root;
  let currentCwd = cwd;
  let stdin: string | null = null;
  let last: CommandResult = runCommand(root, cwd, homePath, segments[0]);

  for (const segment of segments) {
    last = runCommand(currentRoot, currentCwd, homePath, segment, stdin);
    currentRoot = last.root;
    currentCwd = last.cwd;
    stdin = last.output;
    if (last.confirm || last.isError) break;
  }

  if (!redirectTarget || last.isError || last.confirm) return last;

  const { parent, name } = splitParentAndName(redirectTarget);
  const dirPath = parent ? resolvePathArg(currentRoot, currentCwd, homePath, parent) : currentCwd;
  if (!dirPath) return { ...last, output: `no existe el directorio: ${parent}`, isError: true };

  const dirNode = resolveNode(currentRoot, dirPath);
  if (!dirNode || dirNode.type !== 'dir') return { ...last, output: `no es un directorio: ${parent}`, isError: true };

  const existing = dirNode.children.find((c) => c.name === name);
  const newContent =
    append && existing && existing.type === 'file' ? `${existing.content}\n${last.output}` : last.output;

  const newRoot = addNode(currentRoot, dirPath, { type: 'file', name, content: newContent });
  return { ...last, output: '', isError: false, root: newRoot, cwd: currentCwd };
}
