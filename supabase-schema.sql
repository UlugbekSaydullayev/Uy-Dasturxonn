-- Uy Dasturxon — Supabase sxemasi
-- Buni Supabase loyihangizda "SQL Editor" bo'limiga joylashtirib, "Run" tugmasini bosing.

create table if not exists listings (
  id bigint primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists orders (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists photos (
  dish_id bigint primary key,
  url text not null
);

create table if not exists reviews (
  dish_id bigint primary key,
  items jsonb not null default '[]'::jsonb
);

create table if not exists platform_settings (
  id int primary key default 1,
  pro_price numeric not null default 45000,
  commission numeric not null default 12
);

insert into platform_settings (id, pro_price, commission)
values (1, 45000, 12)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- MUHIM XAVFSIZLIK ESLATMASI:
-- Bu ilovada hali haqiqiy foydalanuvchi autentifikatsiyasi (login/parol) yo'q,
-- shuning uchun quyidagi siyosatlar HAMMA UCHUN (anon kalit bilan) o'qish VA
-- yozishga ruxsat beradi. Bu demo/MVP bosqichi uchun to'g'ri, lekin bu degani:
-- istalgan kishi (havolani va anon kalitni bilgan holda) ma'lumotlarni
-- o'zgartirishi yoki o'chirishi mumkin.
--
-- Haqiqiy ishga tushirishdan oldin: Supabase Auth qo'shing va bu siyosatlarni
-- "faqat egasi o'zgartira oladi" darajasiga qattiqlashtiring.
-- ---------------------------------------------------------------------------

alter table listings enable row level security;
alter table orders enable row level security;
alter table photos enable row level security;
alter table reviews enable row level security;
alter table platform_settings enable row level security;

create policy "public read listings" on listings for select using (true);
create policy "public write listings" on listings for insert with check (true);
create policy "public update listings" on listings for update using (true);
create policy "public delete listings" on listings for delete using (true);

create policy "public read orders" on orders for select using (true);
create policy "public write orders" on orders for insert with check (true);
create policy "public update orders" on orders for update using (true);

create policy "public read photos" on photos for select using (true);
create policy "public write photos" on photos for insert with check (true);
create policy "public update photos" on photos for update using (true);

create policy "public read reviews" on reviews for select using (true);
create policy "public write reviews" on reviews for insert with check (true);
create policy "public update reviews" on reviews for update using (true);

create policy "public read settings" on platform_settings for select using (true);
create policy "public update settings" on platform_settings for update using (true);

-- Real vaqtli yangilanishlar uchun (ixtiyoriy, lekin tavsiya etiladi):
-- Supabase Dashboard > Database > Replication bo'limida shu jadvallarni yoqing:
-- listings, orders, photos, reviews, platform_settings
