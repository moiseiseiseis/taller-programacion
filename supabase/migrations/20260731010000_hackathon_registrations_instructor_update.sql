-- El flujo de aprobación de cambio de nivel (Fase 2) necesita que un
-- instructor pueda actualizar el level_id/team_id del registro de OTRO
-- usuario al aprobar una solicitud. La única policy de update que existía
-- era la del propio dueño de la fila.
create policy "hackathon_registrations_instructor_update" on public.hackathon_registrations
  for update to authenticated using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );
