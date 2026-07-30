export type RubricCriterion = {
  id: string;
  // Peso en puntos porcentuales (ej. 40, 25, ...). Se asume que los pesos
  // de los criterios de un mismo nivel suman ~100.
  weight: number;
};

export type RubricScoreRow = {
  criterion_id: string;
  judge_id: string;
  score: number; // 1-10
};

export type RubricTotal = {
  total: number; // 0-100
  perCriterion: Record<string, { average: number; judgeCount: number }>;
};

// Por criterio, promedia el puntaje (1-10) entre todos los jueces que ya
// calificaron ese criterio (no se busca consenso en vivo entre jueces, se
// promedia directo). El total se normaliza sobre 100: cada criterio aporta
// (promedio / 10) * peso. Un criterio sin ningún puntaje todavía cuenta como
// 0 — el total es siempre parcial hasta que todos los jueces terminen.
export function computeSubmissionTotal(criteria: RubricCriterion[], scores: RubricScoreRow[]): RubricTotal {
  const perCriterion: Record<string, { average: number; judgeCount: number }> = {};
  let total = 0;

  for (const criterion of criteria) {
    const criterionScores = scores.filter((s) => s.criterion_id === criterion.id);
    const average =
      criterionScores.length > 0
        ? criterionScores.reduce((sum, s) => sum + s.score, 0) / criterionScores.length
        : 0;

    perCriterion[criterion.id] = { average, judgeCount: criterionScores.length };
    total += (average / 10) * criterion.weight;
  }

  return { total, perCriterion };
}

export type RankedTeam = {
  teamId: string;
  total: number;
  // Promedio por criterio, ordenado de mayor a menor peso — es el orden que
  // usa el desempate en cascada.
  tiebreakScores: number[];
  // Empatado con el equipo de arriba o de abajo incluso después de agotar el
  // desempate completo — en ese caso el doc dice que decide el jurado a
  // mano, no el software.
  isTied: boolean;
};

const TIE_EPSILON = 0.005;

function isFullyTied(
  a: { total: number; tiebreakScores: number[] },
  b: { total: number; tiebreakScores: number[] }
): boolean {
  if (Math.abs(a.total - b.total) > TIE_EPSILON) return false;
  return a.tiebreakScores.every((v, i) => Math.abs(v - b.tiebreakScores[i]) <= TIE_EPSILON);
}

// Desempate en cascada (sección 6 del doc): ordena por total descendente;
// si dos equipos empatan en el total, desempata por el promedio del
// criterio de mayor peso, luego el segundo de mayor peso, y así. Si el
// empate persiste después de agotar todos los criterios, se marca isTied en
// ambos en vez de decidir arbitrariamente.
export function rankTeams(
  criteria: RubricCriterion[],
  teams: { teamId: string; scores: RubricScoreRow[] }[]
): RankedTeam[] {
  const sortedCriteria = criteria.slice().sort((a, b) => b.weight - a.weight);

  const withTotals = teams.map((team) => {
    const { total, perCriterion } = computeSubmissionTotal(criteria, team.scores);
    const tiebreakScores = sortedCriteria.map((c) => perCriterion[c.id]?.average ?? 0);
    return { teamId: team.teamId, total, tiebreakScores };
  });

  withTotals.sort((a, b) => {
    if (Math.abs(a.total - b.total) > TIE_EPSILON) return b.total - a.total;
    for (let i = 0; i < a.tiebreakScores.length; i++) {
      const diff = a.tiebreakScores[i] - b.tiebreakScores[i];
      if (Math.abs(diff) > TIE_EPSILON) return diff > 0 ? -1 : 1;
    }
    return 0;
  });

  return withTotals.map((team, i) => {
    const tiedWithPrev = i > 0 && isFullyTied(team, withTotals[i - 1]);
    const tiedWithNext = i < withTotals.length - 1 && isFullyTied(team, withTotals[i + 1]);
    return { ...team, isTied: tiedWithPrev || tiedWithNext };
  });
}
