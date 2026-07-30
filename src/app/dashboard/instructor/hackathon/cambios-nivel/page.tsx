import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { approveLevelChangeRequest, rejectLevelChangeRequest } from '../actions';

export default async function CambiosNivelPage() {
  await requireRole('instructor');
  const supabase = await createClient();

  const { data: event } = await supabase
    .from('hackathon_events')
    .select('id, name')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center bg-black/20 border-2 border-dashed border-brand-terminal-border rounded-3xl">
        <p className="text-[#9c9c94]">Todavía no hay un evento configurado.</p>
      </div>
    );
  }

  const { data: requests } = await supabase
    .from('hackathon_level_change_requests')
    .select(
      'id, reason, created_at, users(name, email), current:hackathon_levels!current_level_id(name), requested:hackathon_levels!requested_level_id(name)'
    )
    .eq('event_id', event.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  type RequestRow = {
    id: string;
    reason: string | null;
    created_at: string;
    users: { name: string | null; email: string } | null;
    current: { name: string } | null;
    requested: { name: string } | null;
  };
  const rows = (requests ?? []) as unknown as RequestRow[];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">Cambios de nivel — {event.name}</h1>
        <p className="text-[#9c9c94] mt-2">Solicitudes pendientes de aprobar o rechazar.</p>
      </div>

      <div className="space-y-4">
        {rows.length === 0 ? (
          <div className="p-12 text-center bg-black/20 border-2 border-dashed border-brand-terminal-border rounded-3xl">
            <p className="text-[#9c9c94]">No hay solicitudes pendientes.</p>
          </div>
        ) : (
          rows.map((request) => (
            <div key={request.id} className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-brand-beige">{request.users?.name || request.users?.email}</p>
                  <p className="text-sm text-[#9c9c94] mt-1">
                    {request.current?.name || 'Sin nivel'} → <span className="text-brand-mint font-semibold">{request.requested?.name}</span>
                  </p>
                  {request.reason && <p className="text-sm text-[#9c9c94] mt-2 italic">&quot;{request.reason}&quot;</p>}
                </div>
                <div className="flex gap-3 shrink-0">
                  <form action={approveLevelChangeRequest}>
                    <input type="hidden" name="request_id" value={request.id} />
                    <button
                      type="submit"
                      className="py-2 px-4 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
                    >
                      Aprobar
                    </button>
                  </form>
                  <form action={rejectLevelChangeRequest}>
                    <input type="hidden" name="request_id" value={request.id} />
                    <button
                      type="submit"
                      className="py-2 px-4 rounded-lg text-sm font-bold text-brand-salmon bg-brand-salmon/10 hover:bg-brand-salmon/20 transition-colors"
                    >
                      Rechazar
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
