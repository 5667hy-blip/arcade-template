-- ============================================================
-- Arcade Template - Supabase Schema
-- Supabase SQLエディタで実行してください
-- ============================================================

-- プロフィールテーブル（auth.usersと連動）
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  avatar_url text,
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by everyone" on profiles
  for select using (true);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

-- サインアップ時に自動でprofileを作成するトリガー
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ゲームテーブル
create table if not exists games (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  title text not null,
  description text,
  thumbnail_url text,
  game_url text not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  play_count integer default 0,
  tags text[] default '{}'
);

alter table games enable row level security;

create policy "Games are viewable by everyone" on games
  for select using (true);

create policy "Authenticated users can insert games" on games
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own games" on games
  for update using (auth.uid() = user_id);

create policy "Users can delete their own games" on games
  for delete using (auth.uid() = user_id);

-- プレイ数インクリメント用のRPC（Row Level Securityを回避）
create or replace function increment_play_count(game_id uuid)
returns void as $$
  update games set play_count = play_count + 1 where id = game_id;
$$ language sql security definer;

-- ============================================================
-- Storageバケット設定（Supabase Dashboard > Storage でも可）
-- ============================================================

-- ゲームファイル用バケット（公開）
insert into storage.buckets (id, name, public)
  values ('games', 'games', true)
  on conflict do nothing;

-- サムネイル用バケット（公開）
insert into storage.buckets (id, name, public)
  values ('thumbnails', 'thumbnails', true)
  on conflict do nothing;

-- Storageポリシー: ゲームファイル
create policy "Game files are publicly accessible" on storage.objects
  for select using (bucket_id = 'games');

create policy "Authenticated users can upload game files" on storage.objects
  for insert with check (
    bucket_id = 'games' and auth.role() = 'authenticated'
  );

create policy "Users can delete their own game files" on storage.objects
  for delete using (
    bucket_id = 'games' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storageポリシー: サムネイル
create policy "Thumbnails are publicly accessible" on storage.objects
  for select using (bucket_id = 'thumbnails');

create policy "Authenticated users can upload thumbnails" on storage.objects
  for insert with check (
    bucket_id = 'thumbnails' and auth.role() = 'authenticated'
  );
