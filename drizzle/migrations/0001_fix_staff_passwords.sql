-- Fix default passwords for admin and staff
update public.club_logins
set password_hash = extensions.crypt('admin654321', extensions.gen_salt('bf'))
where kind = 'admin';

update public.club_logins
set password_hash = extensions.crypt('12345', extensions.gen_salt('bf'))
where kind in ('teacher', 'mentor');
