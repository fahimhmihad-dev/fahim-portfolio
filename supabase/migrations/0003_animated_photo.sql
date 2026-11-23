-- ============================================================================
-- Fahim H. Mihad Portfolio — Animated Personal Photo Settings (Additive)
-- ============================================================================

alter table public.profile
  add column if not exists show_animated_photo boolean not null default true,
  add column if not exists photo_animation_style text not null default 'tilt',
  add column if not exists photo_alt text not null default 'Portrait of Fahim H. Mihad';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profile_photo_animation_style_check'
  ) then
    alter table public.profile
      add constraint profile_photo_animation_style_check
      check (photo_animation_style in ('float', 'tilt', 'minimal'));
  end if;
end $$;

update public.profile
set avatar_url = '/me/portrait-2x.webp'
where id = 1 and (avatar_url is null or trim(avatar_url) = '');
