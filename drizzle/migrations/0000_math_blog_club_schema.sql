create extension if not exists pgcrypto with schema extensions;

create type public.app_role as enum ('teacher', 'mentor', 'student', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null,
  created_at timestamptz not null default now()
);
grant select on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('teacher', 'mentor', 'admin'))
$$;

create or replace function public.is_lead(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('teacher', 'admin'))
$$;

create policy "Read own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "Staff read all profiles" on public.profiles for select to authenticated using (public.is_staff(auth.uid()));
create policy "Read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "Staff read all roles" on public.user_roles for select to authenticated using (public.is_staff(auth.uid()));

-- Day notes
create table public.day_notes (
  day int primary key check (day between 1 and 12),
  title text not null check (char_length(title) between 1 and 80),
  notes text not null check (char_length(notes) between 1 and 3000),
  updated_at timestamptz not null default now(),
  updated_by uuid
);
grant select on public.day_notes to anon, authenticated;
grant insert, update, delete on public.day_notes to authenticated;
grant all on public.day_notes to service_role;
alter table public.day_notes enable row level security;
create policy "Anyone reads day notes" on public.day_notes for select to anon, authenticated using (true);
create policy "Staff add day notes" on public.day_notes for insert to authenticated with check (public.is_staff(auth.uid()));
create policy "Staff edit day notes" on public.day_notes for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "Staff remove day notes" on public.day_notes for delete to authenticated using (public.is_staff(auth.uid()));

-- Award winners
create table public.award_winners (
  award text primary key check (char_length(award) between 1 and 80),
  winner text not null check (char_length(winner) between 1 and 120),
  updated_at timestamptz not null default now()
);
grant select on public.award_winners to anon, authenticated;
grant insert, update, delete on public.award_winners to authenticated;
grant all on public.award_winners to service_role;
alter table public.award_winners enable row level security;
create policy "Anyone reads winners" on public.award_winners for select to anon, authenticated using (true);
create policy "Leads add winners" on public.award_winners for insert to authenticated with check (public.is_lead(auth.uid()));
create policy "Leads edit winners" on public.award_winners for update to authenticated using (public.is_lead(auth.uid())) with check (public.is_lead(auth.uid()));
create policy "Leads remove winners" on public.award_winners for delete to authenticated using (public.is_lead(auth.uid()));

-- Class list
create table public.roster_members (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.roster_members to anon, authenticated;
grant insert, update, delete on public.roster_members to authenticated;
grant all on public.roster_members to service_role;
alter table public.roster_members enable row level security;
create policy "Anyone reads roster" on public.roster_members for select to anon, authenticated using (true);
create policy "Leads add roster" on public.roster_members for insert to authenticated with check (public.is_lead(auth.uid()));
create policy "Leads edit roster" on public.roster_members for update to authenticated using (public.is_lead(auth.uid())) with check (public.is_lead(auth.uid()));
create policy "Leads remove roster" on public.roster_members for delete to authenticated using (public.is_lead(auth.uid()));

insert into public.roster_members (name, sort_order) values
  ('Mehtab Ud Deen Didar Jan', 1), ('Muhammad Azhan Pardar Adeel', 2), ('Muhammad Hamdaan Malik', 3),
  ('Muhammad Ibrahim Shams Ali', 4), ('Muhammad Khizer Muhammad Hanif', 5), ('Muhammad Yaseen Muhammad Humair', 6),
  ('Muneebah Muhammad Salman', 7), ('Nabeeha Hayat Khan', 8), ('Naeel Aziz Amir Ali Khwaja', 9),
  ('Noorul Emaan Noman Nasir', 10), ('Razeen Noorddin Nasrullah', 11), ('Rohan Ahmed Rehan Ahmed', 12),
  ('Ruhab Muhammad Saqib', 13), ('Saadi Sher Afzal', 14), ('Samrana Zeeshan Lakhpati', 15),
  ('Sara Damani Faizan Suleman Damani', 16), ('Shan Saeed Saeed Hussain', 17), ('Sinan Karim Ajmal Karim', 18),
  ('Soha Salman', 19), ('Syeda Aizah Salman Syed', 20), ('Umm E Hani Muhammad Burhan', 21),
  ('Urooj Umair', 22), ('Zunaira Fayyaz', 23), ('Haniya Asif', 24), ('Hanya Fatima', 25);

-- Club photos
create table public.club_photos (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  caption text not null check (char_length(caption) between 1 and 80),
  alt text not null check (char_length(alt) between 1 and 300),
  width int not null default 1200,
  height int not null default 1200,
  uploaded_by uuid,
  created_at timestamptz not null default now()
);
grant select on public.club_photos to anon, authenticated;
grant insert, update, delete on public.club_photos to authenticated;
grant all on public.club_photos to service_role;
alter table public.club_photos enable row level security;
create policy "Anyone reads photos" on public.club_photos for select to anon, authenticated using (true);
create policy "Staff add photos" on public.club_photos for insert to authenticated with check (public.is_staff(auth.uid()));
create policy "Staff edit photos" on public.club_photos for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "Staff remove photos" on public.club_photos for delete to authenticated using (public.is_staff(auth.uid()));

-- Prompt notebook
create table public.student_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  prompt text not null check (char_length(prompt) between 1 and 300),
  stars int not null default 0 check (stars between 0 and 6),
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.student_prompts to authenticated;
grant all on public.student_prompts to service_role;
alter table public.student_prompts enable row level security;
create policy "Read own prompts" on public.student_prompts for select to authenticated using (user_id = auth.uid());
create policy "Staff read all prompts" on public.student_prompts for select to authenticated using (public.is_staff(auth.uid()));
create policy "Add own prompts" on public.student_prompts for insert to authenticated with check (user_id = auth.uid());
create policy "Remove own prompts" on public.student_prompts for delete to authenticated using (user_id = auth.uid());

-- Storage policies
create policy "Anyone views club photos" on storage.objects for select to anon, authenticated using (bucket_id = 'club-photos');
create policy "Staff upload club photos" on storage.objects for insert to authenticated with check (bucket_id = 'club-photos' and public.is_staff(auth.uid()));
create policy "Staff remove club photos" on storage.objects for delete to authenticated using (bucket_id = 'club-photos' and public.is_staff(auth.uid()));
create policy "Anyone views project media" on storage.objects for select to anon, authenticated using (bucket_id = 'project-media');

-- Sign-in slots (server only)
create table public.club_logins (
  id uuid primary key default gen_random_uuid(),
  kind public.app_role not null,
  display_name text not null check (char_length(display_name) between 1 and 80),
  sort_order int not null default 0,
  user_id uuid unique,
  username text unique,
  password_hash text,
  signed_in boolean not null default false,
  signed_in_at timestamptz,
  failed_attempts int not null default 0,
  blocked_until timestamptz,
  created_at timestamptz not null default now(),
  unique (kind, display_name)
);
grant all on public.club_logins to service_role;
alter table public.club_logins enable row level security;

insert into public.club_logins (kind, display_name, sort_order, password_hash) values
  ('admin', 'Admin', 0, extensions.crypt('admin654321', extensions.gen_salt('bf'))),
  ('teacher', 'Miss Sana Kashif', 1, extensions.crypt('12345', extensions.gen_salt('bf'))),
  ('mentor', 'Muhammad Salman', 2, extensions.crypt('12345', extensions.gen_salt('bf'))),
  ('mentor', 'Lavanya', 3, extensions.crypt('12345', extensions.gen_salt('bf'))),
  ('mentor', 'Ekta', 4, extensions.crypt('12345', extensions.gen_salt('bf'))),
  ('mentor', 'Meer Fahad', 5, extensions.crypt('12345', extensions.gen_salt('bf')));

create or replace function public.check_login_password(_id uuid, _password text)
returns boolean language sql stable security definer set search_path = public, extensions as $$
  select coalesce((
    select password_hash = extensions.crypt(_password, password_hash)
    from public.club_logins where id = _id and password_hash is not null
  ), false)
$$;
revoke execute on function public.check_login_password(uuid, text) from public, anon, authenticated;
grant execute on function public.check_login_password(uuid, text) to service_role;

create or replace function public.set_login_password(_id uuid, _password text)
returns void language sql volatile security definer set search_path = public, extensions as $$
  update public.club_logins
  set password_hash = extensions.crypt(_password, extensions.gen_salt('bf')), failed_attempts = 0, blocked_until = null
  where id = _id and kind <> 'student'
$$;
revoke execute on function public.set_login_password(uuid, text) from public, anon, authenticated;
grant execute on function public.set_login_password(uuid, text) to service_role;

create or replace function public.my_login_active()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select signed_in or kind <> 'student' from public.club_logins where user_id = auth.uid()), true)
$$;
revoke execute on function public.my_login_active() from public, anon;
grant execute on function public.my_login_active() to authenticated;

create or replace function public.release_my_login()
returns void language sql volatile security definer set search_path = public as $$
  update public.club_logins set signed_in = false where user_id = auth.uid()
$$;
revoke execute on function public.release_my_login() from public, anon;
grant execute on function public.release_my_login() to authenticated;

-- Learning progress
create table public.explorer_progress (
  user_id uuid primary key,
  display_name text not null,
  is_student boolean not null default false,
  done_lessons text[] not null default '{}',
  passed_levels text[] not null default '{}',
  challenges_done integer not null default 0,
  score integer not null default 0,
  luck integer not null default 0,
  emojis jsonb not null default '[]'::jsonb,
  certificates jsonb not null default '[]'::jsonb,
  top_emoji text,
  top_emoji_rank integer not null default 0,
  summary text,
  game_points integer not null default 0,
  games_played integer not null default 0,
  game_day date,
  game_points_today integer not null default 0,
  updated_at timestamptz not null default now()
);
grant select on public.explorer_progress to authenticated;
grant all on public.explorer_progress to service_role;
alter table public.explorer_progress enable row level security;
create policy "Read own progress" on public.explorer_progress for select to authenticated using (user_id = auth.uid());
create policy "Staff read progress" on public.explorer_progress for select to authenticated using (public.is_staff(auth.uid()));

create function public.public_rankings()
returns table (display_name text, level_count integer, lessons integer, challenges_done integer, score integer, luck integer, emoji_count integer, top_emoji text, top_emoji_rank integer, certificates integer, summary text, game_points integer, games_played integer)
language sql stable security definer set search_path = public as $$
  select p.display_name, coalesce(array_length(p.passed_levels,1),0), coalesce(array_length(p.done_lessons,1),0),
         p.challenges_done, p.score, p.luck, jsonb_array_length(p.emojis), p.top_emoji, p.top_emoji_rank,
         jsonb_array_length(p.certificates), p.summary, p.game_points, p.games_played
  from public.explorer_progress p where p.is_student
  order by p.score desc, p.display_name;
$$;
grant execute on function public.public_rankings() to anon, authenticated;

-- Class chat
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  author_name text not null default '',
  author_role text not null default 'student',
  body text not null,
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  constraint chat_body_len check (char_length(body) between 1 and 1200)
);
grant select, insert, update, delete on public.chat_messages to authenticated;
grant all on public.chat_messages to service_role;
alter table public.chat_messages enable row level security;
create policy "Members read chat" on public.chat_messages for select to authenticated using (not hidden or public.is_staff(auth.uid()) or user_id = auth.uid());
create policy "Members post own" on public.chat_messages for insert to authenticated with check (user_id = auth.uid() and not hidden);
create policy "Staff hide messages" on public.chat_messages for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "Leads delete messages" on public.chat_messages for delete to authenticated using (public.is_lead(auth.uid()));

create or replace function public.chat_fill_author()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if auth.uid() is null then
      new.created_at := now();
      return new;
    end if;
    new.user_id := auth.uid();
    new.created_at := now();
    new.hidden := false;
    select coalesce(display_name, 'Explorer') into new.author_name from public.profiles where id = auth.uid();
    if new.author_name is null or new.author_name = '' then new.author_name := 'Explorer'; end if;
    select coalesce((select role::text from public.user_roles where user_id = auth.uid()
      order by case role when 'admin' then 0 when 'teacher' then 1 when 'mentor' then 2 else 3 end limit 1), 'student') into new.author_role;
  else
    new.body := old.body; new.user_id := old.user_id; new.author_name := old.author_name;
    new.author_role := old.author_role; new.created_at := old.created_at;
  end if;
  return new;
end $$;
create trigger chat_fill_author before insert or update on public.chat_messages for each row execute function public.chat_fill_author();
alter publication supabase_realtime add table public.chat_messages;

-- Projects
create table public.club_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  emoji text not null default '🚀',
  emoji_tier text not null default 'common',
  emoji_reason text not null default '',
  blurb text not null default '',
  details text not null default '',
  href text not null,
  kind text not null default 'live',
  section text not null default 'student',
  group_name text not null default '',
  members text not null default '',
  credit text not null default '',
  tags text[] not null default '{}',
  featured boolean not null default false,
  sort_order integer not null default 100,
  media_key text,
  poster_url text,
  video_path text,
  video_job_id text,
  video_status text not null default 'none',
  maker_id uuid,
  maker_name text not null default '',
  maker_role text not null default '',
  ai_status text not null default 'none',
  added_by uuid default auth.uid(),
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint club_projects_section check (section in ('team', 'extra', 'student')),
  constraint club_projects_kind check (kind in ('live', 'handmade')),
  constraint club_projects_tier check (emoji_tier in ('common', 'rare', 'epic', 'legendary')),
  constraint club_projects_video check (video_status in ('none', 'pending', 'ready', 'failed')),
  constraint club_projects_ai check (ai_status in ('none', 'pending', 'done', 'failed')),
  constraint club_projects_href check (href ~ '^(https://|/projects/)'),
  constraint club_projects_blurb_len check (char_length(blurb) <= 600),
  constraint club_projects_details_len check (char_length(details) <= 3000)
);
grant select on public.club_projects to anon;
grant select, insert, update, delete on public.club_projects to authenticated;
grant all on public.club_projects to service_role;
alter table public.club_projects enable row level security;
create policy "Anyone reads projects" on public.club_projects for select to anon, authenticated using (true);
create policy "Members add projects" on public.club_projects for insert to authenticated
  with check (public.is_staff(auth.uid()) or (section = 'student' and maker_id = auth.uid()));
create policy "Staff edit projects" on public.club_projects for update to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "Admin removes projects" on public.club_projects for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Explorers' own submissions always land in the student section with their own name.
create or replace function public.club_projects_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  if auth.uid() is null then
    return new;
  end if;
  new.updated_by := auth.uid();
  if tg_op = 'INSERT' then
    new.added_by := auth.uid();
    if not public.is_staff(auth.uid()) then
      new.section := 'student';
      new.featured := false;
      new.sort_order := 100;
      new.maker_id := auth.uid();
      select coalesce(display_name, '') into new.maker_name from public.profiles where id = auth.uid();
      new.maker_role := 'student';
      new.video_status := 'none';
      new.video_job_id := null;
      new.video_path := null;
      new.media_key := null;
    end if;
  end if;
  return new;
end $$;
create trigger club_projects_guard before insert or update on public.club_projects for each row execute function public.club_projects_guard();

insert into public.club_projects (title, emoji, emoji_tier, blurb, href, kind, section, credit, tags, featured, sort_order, media_key, maker_role, ai_status) values
  ('Maths Block Club — Numbers, Games & Glory', '🧙', 'legendary', 'A student-led maths website for Grades 1 to 5 at Aga Khan School Garden, with grade-wise games, quizzes, puzzles and activities that follow our school syllabus.', 'https://numbers-games-and-glory.lovable.app', 'live', 'team', 'Led by Peer Educator Lavanya with club members from Grades 1–5', array['Grades 1–5','Games','Quizzes'], true, 1, 'glory', 'mentor', 'done'),
  ('Math Bloom', '🌸', 'rare', 'A dreamy, flower-themed maths world with gentle colours and fun practice for young learners.', 'https://math-bloom-champions.lovable.app', 'live', 'team', '', array['Practice','Cute design'], false, 2, 'bloom', '', 'done'),
  ('Maths Gaming Adventure', '🎮', 'epic', 'Estimation and number games where the fun adds up — guess, check and level up your maths brain.', 'https://estimation-game-time.lovable.app', 'live', 'team', '', array['Estimation','Games'], false, 3, 'estimation', '', 'done'),
  ('Math Block Club — Quizzes & Tips', '🧱', 'rare', 'Quizzes, maths tips and fun challenges, all built in neat colourful blocks.', 'https://math-block-magic.lovable.app', 'live', 'team', '', array['Quizzes','Tips'], false, 4, 'block', '', 'done'),
  ('Math Lavender', '💜', 'epic', 'A calm lavender maths garden for Grades 1–3: tap-to-count apples, shapes, adding, coins, multiplication stars — and a printable certificate at the end!', '/projects/math-lavender.html', 'handmade', 'team', '', array['Grades 1–3','Handmade','Certificate'], false, 5, 'lavender', '', 'done'),
  ('Math Fun — Learn, Play, Shine!', '✨', 'rare', 'Choose your grade, take a quick quiz and solve puzzles to become a maths star.', '/projects/math-fun.html', 'handmade', 'team', '', array['Quiz','Puzzles','Handmade'], false, 6, 'mathfun', '', 'done'),
  ('Our first Math Blog Club page', '🧮', 'common', 'Where it all started: maths topics, blog posts, tricks and a challenge of the week.', '/projects/first-math-blog-club.html', 'handmade', 'team', '', array['Blog','Handmade'], false, 7, 'first', '', 'done');

-- Worksheets uploaded by teacher/admin
create table public.club_worksheets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  path text not null,
  added_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
grant select on public.club_worksheets to anon;
grant select, insert, update, delete on public.club_worksheets to authenticated;
grant all on public.club_worksheets to service_role;
alter table public.club_worksheets enable row level security;
create policy "Anyone reads worksheets" on public.club_worksheets for select to anon, authenticated using (true);
create policy "Leads add worksheets" on public.club_worksheets for insert to authenticated with check (public.is_lead(auth.uid()));
create policy "Leads remove worksheets" on public.club_worksheets for delete to authenticated using (public.is_lead(auth.uid()));