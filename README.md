# Uy Dasturxon

Uy sharoitida tayyorlangan taomlarni sotish marketplace ilovasi. Bu versiya
**mustaqil** — Claude'ga bog'liq emas, hisobsiz ham ochiladi, va barcha
ma'lumot haqiqiy Supabase ma'lumotlar bazasida saqlanadi (real vaqtli
sinxronizatsiya bilan).

## Kerak bo'ladigan narsalar (ikkalasi ham bepul)

1. **Supabase hisobi** — ma'lumotlar bazasi uchun → https://supabase.com
2. **Vercel hisobi** — ilovani joylashtirish (hosting) uchun → https://vercel.com
3. **GitHub hisobi** — kodni Vercel'ga ulash uchun eng qulay yo'l → https://github.com

Bularning barchasi bepul tarifda yetarli. Ro'yxatdan o'tish — bir necha
daqiqa, faqat email tasdiqlash kerak.

---

## 1-qadam — Supabase loyihasini yaratish

1. https://supabase.com ga kiring → **"New project"**
2. Loyihaga nom bering (masalan `uy-dasturxon`), parol o'rnating, mintaqa
   tanlang → **"Create new project"** (1-2 daqiqa kutadi)
3. Chap menyudan **"SQL Editor"** ni oching → **"New query"**
4. Ushbu papkadagi **`supabase-schema.sql`** faylining butun matnini nusxa
   oling, SQL Editor'ga joylashtiring va **"Run"** tugmasini bosing
   (bu jadvallarni va xavfsizlik qoidalarini yaratadi)
5. Chap menyudan **Settings → API** ga o'ting. Ikkita qiymatni nusxalab
   oling:
   - **Project URL** (masalan `https://abcdxyz.supabase.co`)
   - **anon public** kaliti (uzun matn)

## 2-qadam — Kodni GitHub'ga yuklash

1. https://github.com da yangi bo'sh repository yarating (masalan
   `uy-dasturxon`)
2. Shu papka ichida terminalda:
   ```bash
   git init
   git add .
   git commit -m "Uy Dasturxon"
   git branch -M main
   git remote add origin https://github.com/<FOYDALANUVCHI-NOMI>/uy-dasturxon.git
   git push -u origin main
   ```

## 3-qadam — Vercel'da joylashtirish (deploy)

1. https://vercel.com ga GitHub hisobingiz bilan kiring
2. **"Add New" → "Project"** → GitHub repository'ngizni tanlang → **"Import"**
3. **"Environment Variables"** bo'limida ikkita qatorni qo'shing:
   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | 1-qadamda olgan Project URL |
   | `VITE_SUPABASE_ANON_KEY` | 1-qadamda olgan anon public kalit |
4. **"Deploy"** tugmasini bosing (1-2 daqiqa kutadi)
5. Tayyor! Vercel sizga `https://uy-dasturxon-xxxx.vercel.app` kabi
   **mustaqil havola** beradi — buni istalgan kishiga, Claude hisobisiz ham,
   yuborsangiz bo'ladi.

---

## Kompyuteringizda sinab ko'rish (ixtiyoriy)

```bash
npm install
cp .env.example .env
# .env faylini ochib, Supabase URL va kalitni joylashtiring
npm run dev
```

Brauzerda `http://localhost:5173` ni oching.

---

## ⚠️ Muhim xavfsizlik eslatmasi

Hozircha bu ilovada **haqiqiy login/parol tizimi yo'q**. `supabase-schema.sql`
fayli ma'lumotlarni **hammaga ochiq o'qish VA yozish** uchun sozlaydi — bu
demo/sinov bosqichi uchun to'g'ri, lekin bu degani: havola va Supabase
kalitini bilgan har qanday kishi ma'lumotlarni o'zgartirishi yoki o'chirishi
mumkin.

**Haqiqiy, ommaviy ishga tushirishdan oldin qiling:**
- Supabase Auth orqali haqiqiy foydalanuvchi hisoblarini qo'shing
- `supabase-schema.sql` dagi xavfsizlik siyosatlarini (RLS policies)
  "faqat egasi o'zgartira oladi" darajasiga qattiqlashtiring
- Rasmlarni (hozir matn sifatida saqlanayotgan base64) Supabase Storage'ga
  ko'chiring — bu tezroq va arzonroq bo'ladi

## Fayllar tuzilishi

```
src/
  App.jsx            — butun ilova (UI + mantiq)
  supabaseClient.js   — Supabase ulanishi
  main.jsx, index.css — kirish nuqtasi
supabase-schema.sql   — ma'lumotlar bazasi jadvallari
.env.example          — muhit o'zgaruvchilari namunasi
```
