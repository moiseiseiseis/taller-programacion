-- El alumno puede ver los puntajes de su propio equipo recién cuando el
-- evento está cerrado (sección 8.1 del doc: "no se anuncia hasta el
-- viernes"). Se resuelve acá, no en el cliente, para que no dependa de que
-- la UI decida ocultarlo bien.
create policy "hackathon_scores_team_read_after_close" on public.hackathon_scores
  for select to authenticated using (
    exists (
      select 1
      from public.hackathon_submissions s
      join public.hackathon_teams t on t.id = s.team_id
      join public.hackathon_events e on e.id = t.event_id
      join public.hackathon_team_members tm on tm.team_id = t.id
      where s.id = hackathon_scores.submission_id
        and tm.user_id = auth.uid()
        and e.status = 'closed'
    )
  );
