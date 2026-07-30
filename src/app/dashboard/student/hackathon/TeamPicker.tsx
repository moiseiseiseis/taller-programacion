import { createTeam, joinTeam } from './actions';

type TeamRow = {
  id: string;
  name: string;
  hackathon_team_members: { id: string }[];
};

export default function TeamPicker({
  eventId,
  levelId,
  teams,
  maxTeamSize,
}: {
  eventId: string;
  levelId: string;
  teams: TeamRow[];
  maxTeamSize: number;
}) {
  return (
    <div className="space-y-6">
      {teams.length > 0 && (
        <div className="space-y-2">
          {teams.map((team) => {
            const memberCount = team.hackathon_team_members?.length ?? 0;
            const isFull = memberCount >= maxTeamSize;
            return (
              <div
                key={team.id}
                className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-brand-terminal-border bg-black/20"
              >
                <div>
                  <span className="font-semibold text-brand-beige">{team.name}</span>
                  <span className="text-xs text-[#6f6f68] ml-2">
                    {memberCount}/{maxTeamSize}
                  </span>
                </div>
                <form action={joinTeam}>
                  <input type="hidden" name="event_id" value={eventId} />
                  <input type="hidden" name="team_id" value={team.id} />
                  <button
                    type="submit"
                    disabled={isFull}
                    className="py-1.5 px-4 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {isFull ? 'Lleno' : 'Unirme'}
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border">
        <h3 className="text-sm font-bold text-brand-beige mb-3">Crear un equipo nuevo</h3>
        <form action={createTeam} className="flex flex-col sm:flex-row gap-3">
          <input type="hidden" name="event_id" value={eventId} />
          <input type="hidden" name="level_id" value={levelId} />
          <input
            type="text"
            name="name"
            required
            placeholder="Nombre del equipo"
            className="flex-1 rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none placeholder:text-[#6f6f68]"
          />
          <button
            type="submit"
            className="py-2.5 px-6 rounded-lg text-sm font-bold text-brand-beige bg-black/30 hover:bg-black/40 transition-colors border border-brand-terminal-border whitespace-nowrap"
          >
            Crear equipo
          </button>
        </form>
      </div>
    </div>
  );
}
