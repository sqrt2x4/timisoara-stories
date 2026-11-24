insert into public.locations
  (id, name_en, name_ro, description_en, description_ro, latitude, longitude)
values
  ('union-square', 'Union Square', 'Piața Unirii',
   'A historic square at the heart of old Timișoara.',
   'O piață istorică în inima vechii Timișoare.', 45.7581, 21.2300),
  ('victory-square', 'Victory Square', 'Piața Victoriei',
   'A central promenade connecting the Opera and the Orthodox Cathedral.',
   'O promenadă centrală între Operă și Catedrala Mitropolitană.',
   45.7537, 21.2257)
on conflict (id) do nothing;

insert into public.stories
  (id, title_en, title_ro, description_en, description_ro)
values
  ('timisoara-colours', 'Colours of the Union Square', 'Culorile Pieței Unirii',
   'A short story about the architecture and character of Piața Unirii.',
   'O poveste despre arhitectura și caracterul Pieței Unirii.')
on conflict (id) do nothing;

insert into public.story_fragments
  (id, story_id, title_en, title_ro, text_en, text_ro, fragment_order)
values
  ('union-square-fragment-1', 'timisoara-colours', 'A square of light', 'O piață de lumină',
   'The warm facades of Piața Unirii helped earn it the name of the Yellow Square.',
   'Fațadele calde ale Pieței Unirii i-au adus numele de Piața Galbenă.', 1),
  ('union-square-fragment-2', 'timisoara-colours', 'Layers of the city', 'Straturile orașului',
   'The square preserves a visible conversation between several centuries of Timișoara.',
   'Piața păstrează dialogul vizibil dintre mai multe secole ale Timișoarei.', 2)
on conflict (id) do nothing;

insert into public.challenges
  (id, location_id, fragment_id, prompt_en, prompt_ro, hint_en, hint_ro)
values
  ('union-square-gate', 'union-square', 'union-square-fragment-1',
   'Which colour gives Piața Unirii its popular nickname?',
   'Ce culoare apare în porecla populară a Pieței Unirii?',
   'Look closely at the facades surrounding the square.',
   'Privește cu atenție fațadele din jurul pieței.'),
  ('victory-square-gate', 'victory-square', 'union-square-fragment-2',
   'What kind of place connects the two ends of this central promenade?',
   'Ce fel de loc leagă cele două capete ale promenadei centrale?',
   'Think of a public space where people walk and gather.',
   'Gândește-te la un spațiu public unde oamenii se plimbă și se adună.')
on conflict (id) do nothing;

insert into public.challenge_answers (challenge_id, answer_hash)
values
  ('union-square-gate', digest('yellow', 'sha256')),
  ('union-square-gate', digest('galben', 'sha256')),
  ('victory-square-gate', digest('square', 'sha256')),
  ('victory-square-gate', digest('piață', 'sha256'))
on conflict (challenge_id, answer_hash) do nothing;
