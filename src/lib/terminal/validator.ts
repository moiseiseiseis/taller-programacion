import { formatPath, resolveNode, type FsNode, type Path } from './filesystem';
import type { CommandResult } from './interpreter';

export type LevelValidator =
  | { type: 'cwd_equals'; path: string }
  | { type: 'command_used'; command: string; flags?: string[]; argsInclude?: string }
  | { type: 'output_contains'; value: string }
  | { type: 'node_exists'; path: string; nodeType?: 'file' | 'dir' }
  | { type: 'node_missing'; path: string }
  | { type: 'file_contains'; path: string; value: string };

// Se llama después de cada comando ejecutado. Devuelve true si con el
// historial acumulado hasta ahora (incluyendo el comando recién corrido) el
// nivel queda resuelto.
export function checkValidator(
  validator: LevelValidator,
  history: CommandResult[],
  cwd: Path,
  root: FsNode
): boolean {
  switch (validator.type) {
    case 'cwd_equals':
      return formatPath(cwd) === validator.path;

    case 'command_used':
      return history.some(
        (h) =>
          h.command === validator.command &&
          (!validator.flags || validator.flags.every((f) => h.flags.includes(f))) &&
          (!validator.argsInclude || h.args.some((a) => a.includes(validator.argsInclude as string)))
      );

    case 'output_contains':
      return history.some((h) => h.output.includes(validator.value));

    case 'node_exists': {
      const segments = validator.path.split('/').filter(Boolean);
      const node = resolveNode(root, segments);
      if (!node) return false;
      return !validator.nodeType || node.type === validator.nodeType;
    }

    case 'node_missing': {
      const segments = validator.path.split('/').filter(Boolean);
      return resolveNode(root, segments) === null;
    }

    case 'file_contains': {
      const segments = validator.path.split('/').filter(Boolean);
      const node = resolveNode(root, segments);
      if (!node || node.type !== 'file') return false;
      return node.content.includes(validator.value);
    }

    default:
      return false;
  }
}
