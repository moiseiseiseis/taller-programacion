// Calculadora pura de "arrepentimiento" (lateness) según el orden en que
// se hacen un conjunto de pendientes con duración y fecha límite propias.

export type Task = {
  id: string;
  label: string;
  duration: number;
  deadline: number;
};

export type SchedulingConfig = {
  tasks: Task[];
};

export type TaskResult = {
  id: string;
  label: string;
  completionTime: number;
  lateness: number;
};

export type ScheduleResult = {
  totalLateness: number;
  perTask: TaskResult[];
};

// Recorre las tareas en el orden dado, acumulando el tiempo, y calcula
// cuánto se pasó cada una de su fecha límite (0 si llegó a tiempo).
export function computeLateness(order: Task[]): ScheduleResult {
  let elapsed = 0;
  const perTask: TaskResult[] = order.map((task) => {
    elapsed += task.duration;
    const lateness = Math.max(0, elapsed - task.deadline);
    return { id: task.id, label: task.label, completionTime: elapsed, lateness };
  });

  return { totalLateness: perTask.reduce((sum, t) => sum + t.lateness, 0), perTask };
}

export function shortestJobFirstOrder(tasks: Task[]): Task[] {
  return tasks.slice().sort((a, b) => a.duration - b.duration);
}

export function earliestDeadlineFirstOrder(tasks: Task[]): Task[] {
  return tasks.slice().sort((a, b) => a.deadline - b.deadline);
}
