import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search, MapPin, Star, Clock, TrendingUp, Users, Crown, ShieldCheck, ChevronRight, X, Plus, Minus, ArrowUpRight, ArrowDownRight, UserPlus, UserMinus, Wallet, CheckCircle2, Package, ChevronLeft, MapPinned, Camera, ImagePlus, ChefHat, MessageSquare, UserCircle2, Pencil, Phone, Settings, ClipboardList, Ban, Check, XCircle, Percent, Lock, LogOut, EyeOff, Eye, Mail, Megaphone, Trash2, FileText, Heart, Sparkles, Inbox, Navigation, Globe, Home, Briefcase, Bell, Send, Scale } from "lucide-react";
import { supabase } from "./supabaseClient";

function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw != null ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}


// ---------- Design tokens ----------
// Palette drawn from Rishtan ceramics (Farg'ona valley pottery): deep cobalt/turquoise glaze,
// warm unglazed clay, ivory plate white, mustard gold for premium accents.
const T = {
  ink: "#211D17",
  cobalt: "#173F4C",
  turquoise: "#2C8C93",
  turquoiseLight: "#DCEFEE",
  clay: "#B1512E",
  clayLight: "#F4E1D5",
  gold: "#C8952E",
  goldLight: "#F6E8CB",
  ivory: "#F8F3E9",
  ivoryDeep: "#EFE7D6",
  line: "#DED2B8",
};

// Demo-only gate. In a real backend this becomes a real login tied to your account,
// not a hardcoded string shipped in the app code.
const ADMIN_EMAIL = "ulugbeksaydullayev55555@gmail.com";
const ADMIN_PASSWORD = "guzor2026";

const LISTING_COLORS = [T.clay, T.turquoise, T.gold, T.cobalt];

// ---------- i18n ----------
const LANGUAGES = [
  { id: "uz", label: "O'zbek", native: "O'zbek tili" },
  { id: "ru", label: "Русский", native: "Русский язык" },
  { id: "en", label: "English", native: "English" },
];

const STRINGS = {
  uz: {
    navMijoz: "Mijoz",
    navCooks: "Oshpazlar",
    navOshpaz: "Oshpaz",
    heroLocation: "so'nggi holat",
    heroTitle: "Qo'shni oshpazlar bugun nima pishirayotganini ko'ring",
    searchPlaceholder: "Taom yoki oshpaz nomini yozing",
    nearby: "Yaqin atrofda",
    nearestToYou: "Sizga eng yaqin",
    locating: "Joylashuvingiz aniqlanmoqda...",
    results: "ta natija",
    menuTab: "Menyu",
    ordersTab: "Buyurtmalarim",
    addToCart: "Savatga qo'shish",
    itemsInCart: "ta taom savatda",
    checkout: "Buyurtma berish",
    save: "Saqlash",
    cancel: "Bekor qilish",
    confirm: "Tasdiqlash",
    delete: "O'chirish",
    close: "Yopish",
    myProfile: "Mening profilim",
    myListings: "Mening e'lonlarim",
    messages: "Xabarlar",
    saved: "Saqlanganlar",
    myAddresses: "Manzillarim",
    myRatings: "Baholarim",
    pricingTariffs: "Ta'riflar va narxlar",
    settings: "Sozlamalar",
    logout: "Chiqish",
    language: "Til",
    chooseLanguage: "Tilni tanlang",
    languageNote: "Ilova interfeysi tanlangan tilda ko'rsatiladi.",
  },
  ru: {
    navMijoz: "Клиент",
    navCooks: "Повара",
    navOshpaz: "Повар",
    heroLocation: "последнее обновление",
    heroTitle: "Узнайте, что готовят соседские повара сегодня",
    searchPlaceholder: "Введите блюдо или имя повара",
    nearby: "Рядом с вами",
    nearestToYou: "Ближе всего к вам",
    locating: "Определяется ваше местоположение...",
    results: "результатов",
    menuTab: "Меню",
    ordersTab: "Мои заказы",
    addToCart: "Добавить в корзину",
    itemsInCart: "блюд в корзине",
    checkout: "Оформить заказ",
    save: "Сохранить",
    cancel: "Отмена",
    confirm: "Подтвердить",
    delete: "Удалить",
    close: "Закрыть",
    myProfile: "Мой профиль",
    myListings: "Мои объявления",
    messages: "Сообщения",
    saved: "Избранное",
    myAddresses: "Мои адреса",
    myRatings: "Мои отзывы",
    pricingTariffs: "Описания и цены",
    settings: "Настройки",
    logout: "Выйти",
    language: "Язык",
    chooseLanguage: "Выберите язык",
    languageNote: "Интерфейс приложения будет показан на выбранном языке.",
  },
  en: {
    navMijoz: "Customer",
    navCooks: "Cooks",
    navOshpaz: "Cook",
    heroLocation: "last updated",
    heroTitle: "See what neighborhood cooks are making today",
    searchPlaceholder: "Search a dish or cook's name",
    nearby: "Near you",
    nearestToYou: "Closest to you",
    locating: "Finding your location...",
    results: "results",
    menuTab: "Menu",
    ordersTab: "My orders",
    addToCart: "Add to cart",
    itemsInCart: "items in cart",
    checkout: "Place order",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    close: "Close",
    myProfile: "My profile",
    myListings: "My listings",
    messages: "Messages",
    saved: "Saved",
    myAddresses: "My addresses",
    myRatings: "My ratings",
    pricingTariffs: "Descriptions & pricing",
    settings: "Settings",
    logout: "Log out",
    language: "Language",
    chooseLanguage: "Choose a language",
    languageNote: "The app interface will be shown in the selected language.",
  },
};

function makeT(lang) {
  return (key) => STRINGS[lang]?.[key] ?? STRINGS.uz[key] ?? key;
}

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Work+Sans:wght@400;500;600;700&display=swap');
`;

// ---------- Mock data ----------
const COOKS = [
  { id: 1, name: "Gulnora opa", dish: "Qazon kabob", area: "Guzor markazi", price: 28000, rating: 4.9, orders: 214, time: "35-45 daq", color: T.clay, tag: "Bugungi taklif", lat: 38.6167, lng: 66.2500 },
  { id: 2, name: "Malika opa", dish: "Norin", area: "Yangi mahalla", price: 22000, rating: 4.8, orders: 176, time: "40-50 daq", color: T.turquoise, tag: null, lat: 38.6280, lng: 66.2610 },
  { id: 3, name: "Dilfuza opa", dish: "Manti (10 dona)", area: "Bozor atrofi", price: 20000, rating: 5.0, orders: 302, time: "30-40 daq", color: T.gold, tag: "Top oshpaz", lat: 38.6140, lng: 66.2440 },
  { id: 4, name: "Zarina opa", dish: "Lag'mon", area: "Guzor markazi", price: 24000, rating: 4.7, orders: 98, time: "35-45 daq", color: T.cobalt, tag: null, lat: 38.6190, lng: 66.2530 },
  { id: 5, name: "Shahnoza opa", dish: "Somsa (5 dona)", area: "Temir yo'l", price: 15000, rating: 4.9, orders: 421, time: "20-30 daq", color: T.clay, tag: "Tez tayyor", lat: 38.6055, lng: 66.2350 },
  { id: 6, name: "Nodira opa", dish: "Mastava", area: "Yangi mahalla", price: 18000, rating: 4.6, orders: 87, time: "30-40 daq", color: T.turquoise, tag: null, lat: 38.6300, lng: 66.2650 },
];

const ADMIN_USERS = [
  { id: 1, name: "Gulnora opa", role: "Oshpaz", status: "Faol", pro: true, joined: "3 oy avval", revenue: 1840000 },
  { id: 2, name: "Bekzod Tursunov", role: "Xaridor", status: "Faol", pro: false, joined: "1 hafta avval", revenue: 240000 },
  { id: 3, name: "Dilfuza opa", status: "Faol", role: "Oshpaz", pro: true, joined: "5 oy avval", revenue: 3120000 },
  { id: 4, name: "Aziz Karimov", role: "Xaydovchi", status: "Nofaol", pro: false, joined: "2 hafta avval", revenue: 0 },
  { id: 5, name: "Shahnoza opa", role: "Oshpaz", status: "Faol", pro: false, joined: "2 oy avval", revenue: 2760000 },
  { id: 6, name: "Malika opa", role: "Oshpaz", status: "Kutilmoqda", pro: false, joined: "2 kun avval", revenue: 0 },
];

// Builds the last 7 real calendar days and sums actual order totals into each one.
// Days with no real orders correctly show 0 — no padding, no fake numbers.
function computeWeeklyRevenue(orders) {
  const labels = ["Ya", "Du", "Se", "Cho", "Pa", "Ju", "Sha"]; // JS getDay(): 0 = Sunday
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push({ key: d.getTime(), label: labels[d.getDay()], total: 0 });
  }
  orders.forEach((o) => {
    if (!o.createdAt) return;
    const od = new Date(o.createdAt);
    od.setHours(0, 0, 0, 0);
    const bucket = days.find((d) => d.key === od.getTime());
    if (bucket) bucket.total += o.total;
  });
  return days;
}

// Counts real quantities sold per dish name from actual placed orders —
// not the static demo "orders" number seeded on each dish.
function computeDishSales(orders) {
  const counts = {};
  orders.forEach((o) =>
    o.items.forEach((it) => {
      counts[it.dish] = (counts[it.dish] || 0) + it.qty;
    })
  );
  return counts;
}

// Computes the real platform commission and seller net payout for a set of order
// items, using the actual dish owner (own published listing vs. demo cook) and
// the seller's real Pro status to pick the correct rate — not a flat guess.
function computeCommission(items, dishes, listings, profile, baseRate) {
  let total = 0;
  let commission = 0;
  items.forEach((it) => {
    const lineTotal = it.qty * it.price;
    total += lineTotal;
    const dish = dishes.find((d) => d.dish === it.dish);
    const isOwnListing = dish && listings.some((l) => l.id === dish.id);
    const rate = isOwnListing && profile?.pro ? Math.max(0, baseRate - 4) : baseRate;
    commission += lineTotal * (rate / 100);
  });
  commission = Math.round(commission);
  return { total, commission, net: total - commission };
}

// Real distance in km between two coordinates (haversine formula).
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km) {
  if (km < 1) return Math.round(km * 1000) + " m";
  return km.toFixed(1).replace(".0", "") + " km";
}

const PAYMENT_METHODS = [
  { id: "click", label: "Click" },
  { id: "payme", label: "Payme" },
  { id: "naqd", label: "Yetkazganda naqd" },
];

const STATUS_STYLE = {
  "Tayyorlanmoqda": { bg: T.goldLight, fg: T.gold },
  "Yo'lda": { bg: T.turquoiseLight, fg: T.cobalt },
  "Yetkazildi": { bg: "#E4F0E6", fg: "#3D7A4A" },
};

const SEED_REVIEWS = {
  1: [
    { name: "Bekzod", rating: 5, text: "Go'shti juda mazali, uydagidek." },
  ],
  3: [
    { name: "Aziza", rating: 5, text: "Mantisi bug'da tayyor, xamiri yupqa." },
    { name: "Jasur", rating: 4, text: "Tez yetkazishdi, ta'mi yoqdi." },
  ],
  5: [
    { name: "Kamola", rating: 5, text: "Somsasi qarsildoq va issiq keldi." },
  ],
};

function formatSum(n) {
  return n.toLocaleString("ru-RU").replace(/,/g, " ") + " so'm";
}

// ---------- Shared bits ----------
function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ background: T.cobalt }}
      >
        <div className="w-3.5 h-3.5 rounded-full" style={{ background: T.gold }} />
      </div>
      <span
        className="text-[19px] tracking-tight"
        style={{ fontFamily: "Fraunces, serif", fontWeight: 600, color: T.ink }}
      >
        Uy Dasturxon
      </span>
    </div>
  );
}

// ---------- Order history ----------
function OrderHistory({ orders }) {
  if (orders.length === 0) {
    return (
      <div className="px-6 md:px-10 py-16 flex flex-col items-center text-center">
        <Package size={28} color={T.line} className="mb-3" />
        <p style={{ fontFamily: "Work Sans, sans-serif", color: "#8A7F68", fontSize: 14 }}>
          Hali buyurtma yo'q. Menyudan taom tanlab ko'ring.
        </p>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const delivered = orders.filter((o) => o.status === "Yetkazildi").length;
  const active = orders.length - delivered;

  return (
    <div className="px-6 md:px-10 py-8 flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl p-4 text-center" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
          <p style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 22, color: T.ink }}>{orders.length}</p>
          <p className="text-[11.5px] mt-0.5" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>Jami buyurtma</p>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
          <p style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 22, color: active > 0 ? T.gold : T.ink }}>{active}</p>
          <p className="text-[11.5px] mt-0.5" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>Yo'lda</p>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
          <p style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 15, color: T.ink }}>{formatSum(totalSpent).replace(" so'm", "")}</p>
          <p className="text-[11.5px] mt-0.5" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>Jami xarajat</p>
        </div>
      </div>

      {orders.map((o) => {
        const st = STATUS_STYLE[o.status];
        return (
          <div key={o.id} className="rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 700, fontSize: 14.5, color: T.ink }}>{o.id}</p>
                <p className="text-[12.5px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>{o.date}</p>
              </div>
              <span
                className="rounded-full px-3 py-1 text-[11.5px]"
                style={{ background: st.bg, color: st.fg, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
              >
                {o.status}
              </span>
            </div>
            <div className="mb-3" style={{ borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
              {o.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between py-2 text-[13.5px]" style={{ fontFamily: "Work Sans, sans-serif", color: "#5B5343" }}>
                  <span>{it.qty} × {it.dish}</span>
                  <span style={{ fontWeight: 600, color: T.ink }}>{formatSum(it.price * it.qty)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[13px]" style={{ fontFamily: "Work Sans, sans-serif", color: "#8A7F68" }}>
              <span className="flex items-center gap-1"><MapPinned size={12} /> {o.address} · {o.payment}</span>
              <span style={{ fontWeight: 700, color: T.ink, fontSize: 14.5 }}>{formatSum(o.total)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Customer view ----------
function CustomerView({ cart, setCart, onOpenCook, orders, page, setPage, onStartCheckout, photos, dishes, favorites, onToggleFavorite, locationStatus, onRequestLocation, initialQuery, t }) {
  const [query, setQuery] = useState(initialQuery || "");
  const filtered = useMemo(() => {
    const matched = dishes.filter(
      (c) =>
        c.dish.toLowerCase().includes(query.toLowerCase()) ||
        c.name.toLowerCase().includes(query.toLowerCase())
    );
    if (locationStatus === "granted") {
      return [...matched].sort((a, b) => {
        if (a.distanceKm == null && b.distanceKm == null) return 0;
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }
    return matched;
  }, [query, dishes, locationStatus]);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Hero */}
      <div
        className="px-6 md:px-10 pt-10 pb-8 md:pt-14 md:pb-12"
        style={{ background: T.cobalt }}
      >
        <p
          className="text-[13px] mb-3"
          style={{ color: T.turquoiseLight, fontFamily: "Work Sans, sans-serif", letterSpacing: "0.02em" }}
        >
          G'uzor tumani · {t("heroLocation")}
        </p>
        <h1
          className="max-w-md leading-[1.08] mb-5"
          style={{
            fontFamily: "Fraunces, serif",
            fontWeight: 600,
            fontSize: "clamp(28px, 5vw, 38px)",
            color: T.ivory,
          }}
        >
          {t("heroTitle")}
        </h1>
        <div
          className="flex items-center gap-3 rounded-full px-4 py-3 max-w-md"
          style={{ background: T.ivory }}
        >
          <Search size={18} color={T.cobalt} strokeWidth={2.25} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="flex-1 bg-transparent outline-none text-[15px]"
            style={{ fontFamily: "Work Sans, sans-serif", color: T.ink }}
          />
        </div>
      </div>

      {/* Sub nav */}
      <div className="px-6 md:px-10 pt-6 flex items-center gap-2">
        {[
          { k: "menyu", label: t("menuTab") },
          { k: "buyurtmalar", label: `${t("ordersTab")}${orders.length ? ` (${orders.length})` : ""}` },
        ].map((tabItem) => (
          <button
            key={tabItem.k}
            onClick={() => setPage(tabItem.k)}
            className="px-3.5 py-1.5 rounded-full text-[13px]"
            style={{
              background: page === tabItem.k ? T.turquoiseLight : "transparent",
              color: page === tabItem.k ? T.cobalt : "#8A7F68",
              fontFamily: "Work Sans, sans-serif",
              fontWeight: 600,
              border: page === tabItem.k ? "none" : `1px solid ${T.line}`,
            }}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {page === "buyurtmalar" ? (
        <OrderHistory orders={orders} />
      ) : (
      <>
      {/* Listings */}
      <div className="px-6 md:px-10 py-8">
        {locationStatus === "denied" && (
          <div className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 mb-5" style={{ background: T.goldLight }}>
            <span className="flex items-center gap-2 text-[12.5px]" style={{ color: "#8A6B1F", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
              <Navigation size={14} /> Joylashuv ruxsat etilmadi — eng yaqin taomlarni ko'rsata olmayapmiz
            </span>
            <button
              onClick={onRequestLocation}
              className="rounded-full px-3 py-1.5 text-[12px] shrink-0"
              style={{ background: T.gold, color: T.ink, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
            >
              Qayta so'rash
            </button>
          </div>
        )}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 21, color: T.ink }}>
              {locationStatus === "granted" ? t("nearestToYou") : t("nearby")}
            </h2>
            {locationStatus === "requesting" && (
              <p className="flex items-center gap-1.5 text-[12px] mt-0.5" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
                <Navigation size={11} /> {t("locating")}
              </p>
            )}
          </div>
          <span className="text-[13px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
            {filtered.length} {t("results")}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpenCook(c)}
              onKeyDown={(e) => e.key === "Enter" && onOpenCook(c)}
              className="text-left rounded-2xl overflow-hidden transition-transform hover:-translate-y-0.5 cursor-pointer"
              style={{ background: "#fff", border: `1px solid ${T.line}` }}
            >
              <div
                className="h-28 flex items-end p-4 relative"
                style={photos[c.id] ? undefined : { background: c.color }}
              >
                {photos[c.id] && (
                  <img
                    src={photos[c.id]}
                    alt={c.dish}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {photos[c.id] && <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0))" }} />}
                {c.tag && (
                  <span
                    className="absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] z-10"
                    style={{ background: "rgba(255,255,255,0.92)", color: T.ink, fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}
                  >
                    {c.tag}
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(c.id);
                  }}
                  aria-label="Saqlash"
                  className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center z-10"
                  style={{ background: "rgba(255,255,255,0.92)" }}
                >
                  <Heart size={13} fill={favorites.includes(c.id) ? T.clay : "none"} color={favorites.includes(c.id) ? T.clay : T.ink} strokeWidth={2} />
                </button>
                <span
                  className="text-[22px] leading-none relative z-10"
                  style={{ fontFamily: "Fraunces, serif", fontWeight: 600, color: "#fff" }}
                >
                  {c.dish}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[14px]" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 600, color: T.ink }}>
                    {c.name}
                  </span>
                  <span className="flex items-center gap-1 text-[13px]" style={{ color: T.gold, fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
                    <Star size={13} fill={T.gold} strokeWidth={0} />
                    {c.rating}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[12.5px] mb-3" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
                  <MapPin size={12} /> {c.area}
                  {c.distanceKm != null && (
                    <span style={{ color: T.cobalt, fontWeight: 600 }}>· {formatDistance(c.distanceKm)}</span>
                  )}
                  {" "}· <Clock size={12} /> {c.time}
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 700, fontSize: 15, color: T.ink }}>
                    {formatSum(c.price)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCart((p) => ({ ...p, [c.id]: (p[c.id] || 0) + 1 }));
                    }}
                    aria-label="Savatga qo'shish"
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors"
                    style={{ background: cart[c.id] ? T.gold : T.ivoryDeep }}
                  >
                    {cart[c.id] ? (
                      <span style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 700, fontSize: 12, color: "#fff" }}>
                        {cart[c.id]}
                      </span>
                    ) : (
                      <Plus size={14} color={T.cobalt} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {cartCount > 0 && (
        <div className="sticky bottom-4 px-6 md:px-10">
          <button
            onClick={onStartCheckout}
            className="w-full rounded-full px-5 py-3.5 flex items-center justify-between max-w-md mx-auto shadow-lg"
            style={{ background: T.ink }}
          >
            <span className="text-[14px]" style={{ color: T.ivory, fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
              {cartCount} {t("itemsInCart")}
            </span>
            <span className="rounded-full px-4 py-1.5 text-[13px]" style={{ background: T.gold, color: T.ink, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}>
              {t("checkout")}
            </span>
          </button>
        </div>
      )}
      </>
      )}
    </div>
  );
}

function StarPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star size={20} fill={n <= value ? T.gold : "none"} color={n <= value ? T.gold : T.line} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}

function CookModal({ cook, cart, setCart, onClose, photo, reviews, onAddReview, onMessage }) {
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  if (!cook) return null;
  const qty = cart[cook.id] || 0;
  const list = reviews || [];

  function submitReview() {
    if (!reviewText.trim()) return;
    onAddReview(cook.id, { name: reviewName.trim() || "Mehmon", rating: reviewRating, text: reviewText.trim() });
    setReviewName("");
    setReviewRating(5);
    setReviewText("");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
      style={{ background: "rgba(23,63,76,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-sm rounded-t-3xl md:rounded-3xl overflow-hidden max-h-[92vh] flex flex-col"
        style={{ background: T.ivory }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ borderBottom: `1px solid ${T.line}`, background: T.ivory }}>
          <span className="text-[13px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
            Taom tafsilotlari
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: T.ivoryDeep }}
            aria-label="Yopish"
          >
            <X size={16} color={T.ink} />
          </button>
        </div>
        <div className="h-40 relative flex items-end p-5 shrink-0" style={photo ? undefined : { background: cook.color }}>
          {photo && <img src={photo} alt={cook.dish} className="absolute inset-0 w-full h-full object-cover" />}
          {photo && <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0.05))" }} />}
          <span className="relative z-10" style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 24, color: "#fff" }}>
            {cook.dish}
          </span>
        </div>
        <div className="p-5 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 600, fontSize: 15, color: T.ink }}>{cook.name}</p>
              <p className="text-[13px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>{cook.area}</p>
            </div>
            <span className="flex items-center gap-1 text-[13px]" style={{ color: T.gold, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}>
              <Star size={13} fill={T.gold} strokeWidth={0} /> {cook.rating} ({cook.orders})
            </span>
          </div>
          <button
            onClick={() => onMessage(cook)}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] mb-4"
            style={{ background: T.ivoryDeep, color: T.ink, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
          >
            <MessageSquare size={13} /> Oshpazga yozish
          </button>
          {cook.description && (
            <p className="text-[13.5px] mb-4" style={{ color: "#5B5343", fontFamily: "Work Sans, sans-serif", lineHeight: 1.5 }}>
              {cook.description}
            </p>
          )}
          <div className="flex items-center justify-between rounded-2xl px-4 py-3 mb-5" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
            <span style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 700, fontSize: 16, color: T.ink }}>
              {formatSum(cook.price)}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCart((p) => ({ ...p, [cook.id]: Math.max(0, (p[cook.id] || 0) - 1) }))}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: T.ivoryDeep }}
              >
                <Minus size={13} color={T.ink} />
              </button>
              <span style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 700, minWidth: 14, textAlign: "center" }}>{qty}</span>
              <button
                onClick={() => setCart((p) => ({ ...p, [cook.id]: (p[cook.id] || 0) + 1 }))}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: T.cobalt }}
              >
                <Plus size={13} color="#fff" />
              </button>
            </div>
          </div>

          {/* Reviews */}
          <div className="flex items-center gap-1.5 mb-3">
            <MessageSquare size={15} color={T.cobalt} />
            <span style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 600, fontSize: 14, color: T.ink }}>
              Sharhlar {list.length > 0 && `(${list.length})`}
            </span>
          </div>

          {list.length === 0 ? (
            <p className="text-[13px] mb-4" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
              Hali sharh yo'q — birinchi bo'lib fikringizni qoldiring.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5 mb-5">
              {list.map((r, i) => (
                <div key={i} className="rounded-xl p-3.5" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px]" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 600, color: T.ink }}>{r.name}</span>
                    <span className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={11} fill={n <= r.rating ? T.gold : "none"} color={n <= r.rating ? T.gold : T.line} strokeWidth={1.5} />
                      ))}
                    </span>
                  </div>
                  <p className="text-[13px]" style={{ color: "#5B5343", fontFamily: "Work Sans, sans-serif" }}>{r.text}</p>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl p-3.5" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
            <p className="text-[12.5px] mb-2" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
              Fikr qoldiring
            </p>
            <StarPicker value={reviewRating} onChange={setReviewRating} />
            <input
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
              placeholder="Ismingiz (ixtiyoriy)"
              className="w-full rounded-lg px-3 py-2 text-[13px] outline-none mt-2.5"
              style={{ background: T.ivory, border: `1px solid ${T.line}`, fontFamily: "Work Sans, sans-serif", color: T.ink }}
            />
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Taom haqida fikringiz..."
              rows={2}
              className="w-full rounded-lg px-3 py-2 text-[13px] outline-none mt-2 resize-none"
              style={{ background: T.ivory, border: `1px solid ${T.line}`, fontFamily: "Work Sans, sans-serif", color: T.ink }}
            />
            <button
              onClick={submitReview}
              className="w-full rounded-full py-2.5 text-[13px] mt-2.5"
              style={{ background: T.cobalt, color: "#fff", fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
            >
              Sharh qoldirish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutModal({ open, cart, onClose, onConfirm, profile, dishes, addresses }) {
  const defaultAddr = addresses?.find((a) => a.isDefault);
  const [address, setAddress] = useState(defaultAddr?.text || profile?.address || "");
  const [method, setMethod] = useState("click");
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    if (open) setAddress(defaultAddr?.text || profile?.address || "");
  }, [open]);

  if (!open) return null;

  const lines = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const cook = dishes.find((c) => c.id === Number(id));
      return { dish: cook.dish, qty, price: cook.price };
    });
  const total = lines.reduce((sum, l) => sum + l.qty * l.price, 0);

  function handleClose() {
    setPlaced(false);
    setAddress("");
    setMethod("click");
    onClose();
  }

  function handleConfirm() {
    onConfirm({
      items: lines,
      total,
      address: address.trim() || "Manzil ko'rsatilmagan",
      payment: PAYMENT_METHODS.find((m) => m.id === method).label,
    });
    setPlaced(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
      style={{ background: "rgba(23,63,76,0.55)" }}
      onClick={handleClose}
    >
      <div
        className="w-full md:max-w-sm rounded-t-3xl md:rounded-3xl overflow-hidden"
        style={{ background: T.ivory }}
        onClick={(e) => e.stopPropagation()}
      >
        {placed ? (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: T.turquoiseLight }}>
              <CheckCircle2 size={26} color={T.cobalt} />
            </div>
            <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 20, color: T.ink }} className="mb-1.5">
              Buyurtma qabul qilindi
            </h3>
            <p className="text-[13.5px] mb-6" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
              Oshpaz tez orada tayyorlashni boshlaydi. Holatini "Buyurtmalarim" bo'limidan kuzatishingiz mumkin.
            </p>
            <button
              onClick={handleClose}
              className="w-full rounded-full py-3 text-[14px]"
              style={{ background: T.cobalt, color: "#fff", fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
            >
              Tushunarli
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 p-5" style={{ borderBottom: `1px solid ${T.line}` }}>
              <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: T.ivoryDeep }}>
                <ChevronLeft size={16} color={T.ink} />
              </button>
              <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 18, color: T.ink }}>
                Buyurtmani rasmiylashtirish
              </h3>
            </div>

            <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
                {lines.map((l, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 text-[13.5px]" style={{ fontFamily: "Work Sans, sans-serif", color: "#5B5343" }}>
                    <span>{l.qty} × {l.dish}</span>
                    <span style={{ fontWeight: 600, color: T.ink }}>{formatSum(l.price * l.qty)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2.5 mt-1.5" style={{ borderTop: `1px solid ${T.line}` }}>
                  <span className="text-[13.5px]" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 600, color: T.ink }}>Jami</span>
                  <span style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 700, fontSize: 16, color: T.ink }}>{formatSum(total)}</span>
                </div>
              </div>

              <div>
                <label className="text-[12.5px] mb-1.5 block" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
                  Yetkazish manzili
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Mahalla, ko'cha, uy raqami"
                  className="w-full rounded-xl px-4 py-3 text-[14px] outline-none"
                  style={{ background: "#fff", border: `1px solid ${T.line}`, fontFamily: "Work Sans, sans-serif", color: T.ink }}
                />
              </div>

              <div>
                <label className="text-[12.5px] mb-1.5 block" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
                  To'lov usuli
                </label>
                <div className="flex flex-col gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className="flex items-center justify-between rounded-xl px-4 py-3"
                      style={{
                        background: method === m.id ? T.turquoiseLight : "#fff",
                        border: `1px solid ${method === m.id ? T.turquoise : T.line}`,
                      }}
                    >
                      <span className="flex items-center gap-2 text-[14px]" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 600, color: T.ink }}>
                        <Wallet size={15} color={method === m.id ? T.cobalt : "#8A7F68"} /> {m.label}
                      </span>
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ border: `2px solid ${method === m.id ? T.cobalt : T.line}` }}
                      >
                        {method === m.id && <div className="w-2 h-2 rounded-full" style={{ background: T.cobalt }} />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={handleConfirm}
                className="w-full rounded-full py-3.5 text-[14.5px]"
                style={{ background: T.gold, color: T.ink, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
              >
                Buyurtmani tasdiqlash · {formatSum(total)}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------- Cook studio (photo upload) ----------
// ---------- Publish a dish ----------
function NewListingModal({ open, profile, onClose, onPublish, onSetPhoto }) {
  const [dish, setDish] = useState("");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState(profile?.address || "");
  const [time, setTime] = useState("30-40 daq");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);

  if (!open) return null;

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  }

  function handleClose() {
    setDish("");
    setPrice("");
    setArea(profile?.address || "");
    setTime("30-40 daq");
    setDescription("");
    setPhoto(null);
    onClose();
  }

  function handlePublish() {
    if (!dish.trim() || !price) return;
    const id = Date.now();
    const listing = {
      id,
      name: profile.name,
      dish: dish.trim(),
      area: area.trim() || "Ko'rsatilmagan",
      price: Number(price),
      rating: 5.0,
      orders: 0,
      time: time.trim() || "30-40 daq",
      color: LISTING_COLORS[id % LISTING_COLORS.length],
      tag: "Yangi",
      description: description.trim(),
    };
    if (photo) onSetPhoto(id, photo);

    // Best-effort: attach the publisher's real coordinates so their dish can be
    // sorted by distance too. If permission isn't granted, publish without
    // coordinates rather than guessing a location.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => onPublish({ ...listing, lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => onPublish(listing),
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
      );
    } else {
      onPublish(listing);
    }
    handleClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
      style={{ background: "rgba(23,63,76,0.55)" }}
      onClick={handleClose}
    >
      <div
        className="w-full md:max-w-sm rounded-t-3xl md:rounded-3xl overflow-hidden max-h-[92vh] flex flex-col"
        style={{ background: T.ivory }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-5 shrink-0" style={{ borderBottom: `1px solid ${T.line}` }}>
          <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: T.ivoryDeep }}>
            <X size={16} color={T.ink} />
          </button>
          <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 18, color: T.ink }}>
            Taomni e'lon qilish
          </h3>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          <div className="flex justify-center">
            <label className="relative cursor-pointer">
              <div
                className="w-full rounded-2xl overflow-hidden flex items-center justify-center"
                style={{ width: 260, height: 130, background: photo ? undefined : T.turquoiseLight, border: `1px solid ${T.line}` }}
              >
                {photo ? (
                  <img src={photo} alt="Taom" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={26} color={T.cobalt} />
                )}
              </div>
              <div
                className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: T.gold, border: `2px solid ${T.ivory}` }}
              >
                <Camera size={14} color={T.ink} />
              </div>
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          </div>

          <div>
            <label className="text-[12.5px] mb-1.5 block" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
              Taom nomi
            </label>
            <input
              value={dish}
              onChange={(e) => setDish(e.target.value)}
              placeholder="Masalan: Tuxum barak"
              className="w-full rounded-xl px-4 py-3 text-[14px] outline-none"
              style={{ background: "#fff", border: `1px solid ${T.line}`, fontFamily: "Work Sans, sans-serif", color: T.ink }}
            />
          </div>

          <div>
            <label className="text-[12.5px] mb-1.5 block" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
              Narxi (so'm)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="25000"
              className="w-full rounded-xl px-4 py-3 text-[14px] outline-none"
              style={{ background: "#fff", border: `1px solid ${T.line}`, fontFamily: "Work Sans, sans-serif", color: T.ink }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12.5px] mb-1.5 block" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
                Hudud
              </label>
              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Mahalla nomi"
                className="w-full rounded-xl px-4 py-3 text-[14px] outline-none"
                style={{ background: "#fff", border: `1px solid ${T.line}`, fontFamily: "Work Sans, sans-serif", color: T.ink }}
              />
            </div>
            <div>
              <label className="text-[12.5px] mb-1.5 block" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
                Tayyor bo'lish vaqti
              </label>
              <input
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="30-40 daq"
                className="w-full rounded-xl px-4 py-3 text-[14px] outline-none"
                style={{ background: "#fff", border: `1px solid ${T.line}`, fontFamily: "Work Sans, sans-serif", color: T.ink }}
              />
            </div>
          </div>

          <div>
            <label className="text-[12.5px] mb-1.5 block" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
              Qisqa tavsif (ixtiyoriy)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tarkibi yoki taomning o'ziga xosligi haqida yozing..."
              rows={2}
              className="w-full rounded-xl px-4 py-3 text-[14px] outline-none resize-none"
              style={{ background: "#fff", border: `1px solid ${T.line}`, fontFamily: "Work Sans, sans-serif", color: T.ink }}
            />
          </div>

          <button
            onClick={handlePublish}
            disabled={!dish.trim() || !price}
            className="w-full rounded-full py-3.5 text-[14.5px] flex items-center justify-center gap-2"
            style={{
              background: dish.trim() && price ? T.gold : T.ivoryDeep,
              color: dish.trim() && price ? T.ink : "#B3A98C",
              fontFamily: "Work Sans, sans-serif",
              fontWeight: 700,
            }}
          >
            <Megaphone size={15} /> Ommaga e'lon qilish
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Cook studio (photo upload) ----------
// ---------- Cooks list ----------
function aggregateCooks(dishes, photos) {
  const map = {};
  dishes.forEach((d) => {
    if (!map[d.name]) {
      map[d.name] = { name: d.name, area: d.area, color: d.color, dishes: [] };
    }
    map[d.name].dishes.push(d);
  });
  return Object.values(map).map((c) => {
    const photoDish = c.dishes.find((d) => photos[d.id]);
    return {
      ...c,
      count: c.dishes.length,
      avgRating: c.dishes.reduce((s, d) => s + d.rating, 0) / c.dishes.length,
      photo: photoDish ? photos[photoDish.id] : null,
    };
  });
}

function CooksListView({ dishes, photos, onSelectCook }) {
  const [query, setQuery] = useState("");
  const cooks = useMemo(() => aggregateCooks(dishes, photos), [dishes, photos]);
  const filtered = cooks.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="px-6 md:px-10 py-8">
      <div className="flex items-center gap-2 mb-1.5">
        <ChefHat size={16} color={T.cobalt} />
        <span className="text-[13px]" style={{ color: T.cobalt, fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
          Oshpazlar
        </span>
      </div>
      <h2 className="mb-5" style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 26, color: T.ink }}>
        Barcha oshpazlar
      </h2>

      <div className="flex items-center gap-3 rounded-full px-4 py-3 mb-6" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
        <Search size={16} color="#8A7F68" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Oshpaz ismini qidirish"
          className="flex-1 bg-transparent outline-none text-[14px]"
          style={{ fontFamily: "Work Sans, sans-serif", color: T.ink }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <button
            key={c.name}
            onClick={() => onSelectCook(c.name)}
            className="flex items-center gap-3.5 rounded-2xl p-4 text-left transition-transform hover:-translate-y-0.5"
            style={{ background: "#fff", border: `1px solid ${T.line}` }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden shrink-0"
              style={c.photo ? undefined : { background: c.color }}
            >
              {c.photo ? (
                <img src={c.photo} alt={c.name} className="w-full h-full object-cover" />
              ) : (
                <span style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 20, color: "#fff" }}>
                  {c.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14.5px] truncate" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 700, color: T.ink }}>{c.name}</p>
              <p className="flex items-center gap-1 text-[12px] mt-0.5" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
                <MapPin size={11} /> {c.area}
              </p>
              <div className="flex items-center gap-2.5 mt-1.5">
                <span className="flex items-center gap-1 text-[12px]" style={{ color: T.gold, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}>
                  <Star size={11} fill={T.gold} strokeWidth={0} /> {c.avgRating.toFixed(1)}
                </span>
                <span className="text-[12px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>{c.count} ta taom</span>
              </div>
            </div>
            <ChevronRight size={16} color="#C6BCA3" className="shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Cook studio (photo upload) ----------
function CookStudioView({ photos, onSetPhoto, reviews, profile, listings, onPublish, onRemoveListing, onOpenProfile, legalNoticeDismissed, onDismissLegalNotice }) {
  const [selectedId, setSelectedId] = useState(COOKS[0].id);
  const [formOpen, setFormOpen] = useState(false);
  const selected = COOKS.find((c) => c.id === selectedId);
  const photo = photos[selectedId];
  const list = reviews[selectedId] || [];

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onSetPhoto(selectedId, reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <div className="px-6 md:px-10 py-8">
      <div className="flex items-center gap-2 mb-1.5">
        <Megaphone size={16} color={T.cobalt} />
        <span className="text-[13px]" style={{ color: T.cobalt, fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
          Oshpaz kabineti
        </span>
      </div>
      <h2 className="mb-6" style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 26, color: T.ink }}>
        Taomingizni ommaga e'lon qiling
      </h2>

      {!legalNoticeDismissed && (
        <div className="rounded-2xl p-4 mb-6 relative" style={{ background: T.goldLight, border: `1px solid ${T.gold}` }}>
          <button
            onClick={onDismissLegalNotice}
            className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.6)" }}
          >
            <X size={12} color={T.ink} />
          </button>
          <div className="flex items-center gap-2 mb-2 pr-8">
            <Scale size={15} color="#8A6B1F" />
            <p style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 14.5, color: T.ink }}>Bilishingiz kerak bo'lgan huquqiy jihatlar</p>
          </div>
          <ul className="flex flex-col gap-1.5 mb-2">
            {[
              "Doimiy daromad olsangiz, YaTT (Yakka tartibdagi tadbirkor) sifatida ro'yxatdan o'tish tavsiya etiladi (my.gov.uz)",
              "Oziq-ovqat tayyorlash sanitariya-gigiyena talablariga bo'ysunadi",
              "Click/Payme orqali to'lovlar soliq organlari tomonidan kuzatiladi",
            ].map((txt, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px]" style={{ color: "#6B5A22", fontFamily: "Work Sans, sans-serif" }}>
                <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: "#8A6B1F" }} /> {txt}
              </li>
            ))}
          </ul>
          <p className="text-[11px]" style={{ color: "#8A6B1F", fontFamily: "Work Sans, sans-serif" }}>
            Bu — huquqiy maslahat emas, umumiy eslatma. Aniq talablar uchun soliq inspeksiyasi yoki yurist bilan maslahatlashing.
          </p>
        </div>
      )}

      {!profile ? (
        <div className="rounded-2xl p-6 flex flex-col items-center text-center mb-8" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
          <UserCircle2 size={30} color={T.line} className="mb-3" />
          <p className="text-[13.5px] mb-4" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
            Taom e'lon qilish uchun avval profil yarating — xaridorlar sizni shu ism bilan ko'radi.
          </p>
          <button
            onClick={onOpenProfile}
            className="rounded-full px-5 py-2.5 text-[13.5px]"
            style={{ background: T.cobalt, color: "#fff", fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
          >
            Profil yaratish
          </button>
        </div>
      ) : (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <p style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 17, color: T.ink }}>
              Mening taomlarim {listings.length > 0 && `(${listings.length})`}
            </p>
            <button
              onClick={() => setFormOpen(true)}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px]"
              style={{ background: T.gold, color: T.ink, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
            >
              <Plus size={13} /> Yangi taom
            </button>
          </div>

          {listings.length === 0 ? (
            <div className="rounded-2xl p-6 flex flex-col items-center text-center" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
              <Megaphone size={26} color={T.line} className="mb-2.5" />
              <p className="text-[13px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
                Hali taom e'lon qilmagansiz. "Yangi taom" tugmasini bosing.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((l) => (
                <div key={l.id} className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
                  <div className="h-24 relative flex items-end p-3.5" style={photos[l.id] ? undefined : { background: l.color }}>
                    {photos[l.id] && <img src={photos[l.id]} alt={l.dish} className="absolute inset-0 w-full h-full object-cover" />}
                    {photos[l.id] && <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0))" }} />}
                    <span className="relative z-10 text-[16px]" style={{ fontFamily: "Fraunces, serif", fontWeight: 600, color: "#fff" }}>
                      {l.dish}
                    </span>
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-[13.5px]" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 700, color: T.ink }}>
                        {formatSum(l.price)}
                      </p>
                      <p className="text-[11.5px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>{l.area}</p>
                    </div>
                    <button
                      onClick={() => onRemoveListing(l.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: T.clayLight }}
                    >
                      <Trash2 size={14} color={T.clay} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mb-4" style={{ borderTop: `1px solid ${T.line}` }} />

      <div className="flex items-center gap-2 mb-1.5">
        <ChefHat size={15} color="#8A7F68" />
        <span className="text-[12.5px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
          Namunaviy oshpazlar (demo)
        </span>
      </div>
      <p className="text-[12.5px] mb-5" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
        Ilovadagi tayyor namunalar uchun rasm sinab ko'rish.
      </p>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {COOKS.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            className="shrink-0 px-3.5 py-1.5 rounded-full text-[13px] whitespace-nowrap"
            style={{
              background: selectedId === c.id ? T.cobalt : "#fff",
              color: selectedId === c.id ? "#fff" : T.ink,
              border: `1px solid ${selectedId === c.id ? T.cobalt : T.line}`,
              fontFamily: "Work Sans, sans-serif",
              fontWeight: 600,
            }}
          >
            {c.name} · {c.dish}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
          <div className="h-52 relative flex items-center justify-center" style={photo ? undefined : { background: selected.color }}>
            {photo ? (
              <img src={photo} alt={selected.dish} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <span style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 22, color: "#fff" }}>{selected.dish}</span>
            )}
          </div>
          <div className="p-4">
            <label
              className="flex items-center justify-center gap-2 rounded-full py-3 text-[13.5px] cursor-pointer"
              style={{ background: T.gold, color: T.ink, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
            >
              <Camera size={15} /> {photo ? "Rasmni almashtirish" : "Rasm yuklash"}
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
            <p className="text-[12px] mt-2 text-center" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
              {selected.name} · {selected.dish} uchun
            </p>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
          <div className="flex items-center gap-1.5 mb-3">
            <MessageSquare size={15} color={T.cobalt} />
            <span style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 600, fontSize: 14, color: T.ink }}>
              Xaridorlar sharhlari {list.length > 0 && `(${list.length})`}
            </span>
          </div>
          {list.length === 0 ? (
            <p className="text-[13px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
              Hali sharh qoldirilmagan.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {list.map((r, i) => (
                <div key={i} className="rounded-xl p-3.5" style={{ background: T.ivory, border: `1px solid ${T.line}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px]" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 600, color: T.ink }}>{r.name}</span>
                    <span className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={11} fill={n <= r.rating ? T.gold : "none"} color={n <= r.rating ? T.gold : T.line} strokeWidth={1.5} />
                      ))}
                    </span>
                  </div>
                  <p className="text-[13px]" style={{ color: "#5B5343", fontFamily: "Work Sans, sans-serif" }}>{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <NewListingModal
        open={formOpen}
        profile={profile}
        onClose={() => setFormOpen(false)}
        onPublish={onPublish}
        onSetPhoto={onSetPhoto}
      />
    </div>
  );
}

function SubHeader({ title, onBack }) {
  return (
    <div className="flex items-center gap-3 p-5 shrink-0" style={{ borderBottom: `1px solid ${T.line}` }}>
      <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: T.ivoryDeep }}>
        <ChevronLeft size={16} color={T.ink} />
      </button>
      <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 18, color: T.ink }}>{title}</h3>
    </div>
  );
}

function MenuRow({ icon: Icon, label, badge, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5"
      style={{ background: danger ? T.clayLight : "#fff", border: `1px solid ${danger ? "transparent" : T.line}` }}
    >
      <span
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{ background: danger ? "rgba(255,255,255,0.5)" : T.turquoiseLight }}
      >
        <Icon size={16} color={danger ? T.clay : T.cobalt} />
      </span>
      <span className="flex-1 text-left text-[14px]" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 600, color: danger ? T.clay : T.ink }}>
        {label}
      </span>
      {badge > 0 && (
        <span
          className="rounded-full px-2 py-0.5 text-[11px] min-w-[20px] text-center"
          style={{ background: T.ivoryDeep, color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
        >
          {badge}
        </span>
      )}
      {!danger && <ChevronRight size={16} color="#C6BCA3" />}
    </button>
  );
}

function ProPaymentModal({ open, proPrice, onClose, onConfirm }) {
  const [method, setMethod] = useState("click");
  const [paid, setPaid] = useState(false);

  if (!open) return null;

  function handleClose() {
    setPaid(false);
    setMethod("click");
    onClose();
  }

  function handlePay() {
    onConfirm();
    setPaid(true);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-6"
      style={{ background: "rgba(23,63,76,0.65)" }}
      onClick={handleClose}
    >
      <div
        className="w-full md:max-w-sm rounded-t-3xl md:rounded-3xl overflow-hidden"
        style={{ background: T.ivory }}
        onClick={(e) => e.stopPropagation()}
      >
        {paid ? (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: T.goldLight }}>
              <Crown size={24} color={T.gold} />
            </div>
            <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 20, color: T.ink }} className="mb-1.5">
              Pro faollashtirildi
            </h3>
            <p className="text-[13.5px] mb-6" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
              To'lov qabul qilindi. Taomlaringiz endi menyuda yuqorida chiqadi.
            </p>
            <button
              onClick={handleClose}
              className="w-full rounded-full py-3 text-[14px]"
              style={{ background: T.cobalt, color: "#fff", fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
            >
              Tushunarli
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 p-5" style={{ borderBottom: `1px solid ${T.line}` }}>
              <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: T.ivoryDeep }}>
                <X size={16} color={T.ink} />
              </button>
              <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 18, color: T.ink }}>Pro uchun to'lov</h3>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
                <span className="flex items-center gap-2 text-[13.5px]" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 600, color: T.ink }}>
                  <Crown size={15} color={T.gold} /> Pro tarif (1 oy)
                </span>
                <span style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 700, fontSize: 16, color: T.ink }}>{formatSum(proPrice)}</span>
              </div>

              <div>
                <label className="text-[12.5px] mb-1.5 block" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
                  To'lov usuli
                </label>
                <div className="flex flex-col gap-2">
                  {PAYMENT_METHODS.filter((m) => m.id !== "naqd").map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className="flex items-center justify-between rounded-xl px-4 py-3"
                      style={{
                        background: method === m.id ? T.turquoiseLight : "#fff",
                        border: `1px solid ${method === m.id ? T.turquoise : T.line}`,
                      }}
                    >
                      <span className="flex items-center gap-2 text-[14px]" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 600, color: T.ink }}>
                        <Wallet size={15} color={method === m.id ? T.cobalt : "#8A7F68"} /> {m.label}
                      </span>
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ border: `2px solid ${method === m.id ? T.cobalt : T.line}` }}
                      >
                        {method === m.id && <div className="w-2 h-2 rounded-full" style={{ background: T.cobalt }} />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePay}
                className="w-full rounded-full py-3.5 text-[14.5px]"
                style={{ background: T.gold, color: T.ink, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
              >
                To'lovni tasdiqlash · {formatSum(proPrice)}
              </button>
              <p className="text-[10.5px] text-center" style={{ color: "#B3A98C", fontFamily: "Work Sans, sans-serif" }}>
                Demo to'lov oynasi — hozircha haqiqiy pul yechilmaydi. Real ilovada shu joyda Click/Payme orqali chinakam to'lov amalga oshiriladi.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function timeAgo(ts) {
  const diff = Math.max(0, Date.now() - ts);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "hozir";
  if (min < 60) return `${min} daq oldin`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} soat oldin`;
  return `${Math.floor(hr / 24)} kun oldin`;
}

function NotificationsPanel({ open, notifications, onClose, onMarkAllRead, onClear }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end p-0 md:p-6"
      style={{ background: "rgba(23,63,76,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-sm md:mt-16 rounded-b-3xl md:rounded-3xl overflow-hidden max-h-[85vh] flex flex-col"
        style={{ background: T.ivory }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 p-5 shrink-0" style={{ borderBottom: `1px solid ${T.line}` }}>
          <div className="flex items-center gap-2.5">
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: T.ivoryDeep }}>
              <X size={16} color={T.ink} />
            </button>
            <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 18, color: T.ink }}>Bildirishnomalar</h3>
          </div>
          {notifications.length > 0 && (
            <button onClick={onClear} className="text-[12px]" style={{ color: T.clay, fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
              Tozalash
            </button>
          )}
        </div>
        <div className="p-4 overflow-y-auto flex flex-col gap-2">
          {notifications.length === 0 ? (
            <div className="py-14 flex flex-col items-center text-center">
              <Bell size={24} color={T.line} className="mb-2.5" />
              <p className="text-[13px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>Hozircha bildirishnoma yo'q.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="rounded-xl p-3.5 flex items-start gap-2.5"
                style={{ background: n.read ? "#fff" : T.turquoiseLight, border: `1px solid ${T.line}` }}
              >
                <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: n.read ? T.ivoryDeep : T.cobalt }}>
                  <Bell size={13} color={n.read ? "#8A7F68" : "#fff"} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px]" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 700, color: T.ink }}>{n.title}</p>
                  <p className="text-[12.5px]" style={{ color: "#5B5343", fontFamily: "Work Sans, sans-serif" }}>{n.body}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#B3A98C", fontFamily: "Work Sans, sans-serif" }}>{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationToast({ notif, onOpen }) {
  if (!notif) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] w-[calc(100%-2rem)] max-w-sm px-1">
      <button
        onClick={onOpen}
        className="w-full flex items-start gap-3 rounded-2xl p-4 text-left shadow-lg"
        style={{ background: T.cobalt }}
      >
        <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: T.gold }}>
          <Bell size={14} color={T.ink} />
        </span>
        <div className="min-w-0">
          <p className="text-[13px]" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 700, color: "#fff" }}>{notif.title}</p>
          <p className="text-[12.5px]" style={{ color: T.turquoiseLight, fontFamily: "Work Sans, sans-serif" }}>{notif.body}</p>
        </div>
      </button>
    </div>
  );
}

function MessageThreadModal({ open, dish, thread, onClose, onSend }) {
  const [text, setText] = useState("");
  if (!open || !dish) return null;

  function submit() {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
      style={{ background: "rgba(23,63,76,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-sm rounded-t-3xl md:rounded-3xl overflow-hidden max-h-[85vh] flex flex-col"
        style={{ background: T.ivory }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-5 shrink-0" style={{ borderBottom: `1px solid ${T.line}` }}>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: T.ivoryDeep }}>
            <ChevronLeft size={16} color={T.ink} />
          </button>
          <div>
            <p style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 16, color: T.ink }}>{dish.name}</p>
            <p className="text-[11.5px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>{dish.dish} haqida</p>
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-2.5">
          {(!thread || thread.length === 0) ? (
            <p className="text-[12.5px] text-center py-8" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
              Suhbat hali boshlanmagan. Savolingizni yozing.
            </p>
          ) : (
            thread.map((m) => (
              <div key={m.id} className="self-end max-w-[80%] rounded-2xl rounded-br-md px-3.5 py-2.5" style={{ background: T.cobalt }}>
                <p className="text-[13px]" style={{ color: "#fff", fontFamily: "Work Sans, sans-serif" }}>{m.text}</p>
                <p className="text-[10px] mt-0.5" style={{ color: T.turquoiseLight, fontFamily: "Work Sans, sans-serif" }}>{timeAgo(m.createdAt)}</p>
              </div>
            ))
          )}
        </div>

        <div className="p-4 shrink-0" style={{ borderTop: `1px solid ${T.line}` }}>
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Xabar yozing..."
              className="flex-1 rounded-full px-4 py-2.5 text-[13.5px] outline-none"
              style={{ background: "#fff", border: `1px solid ${T.line}`, fontFamily: "Work Sans, sans-serif", color: T.ink }}
            />
            <button onClick={submit} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: T.gold }}>
              <Send size={15} color={T.ink} />
            </button>
          </div>
          <p className="text-[10.5px] mt-2 text-center" style={{ color: "#B3A98C", fontFamily: "Work Sans, sans-serif" }}>
            Xabaringiz saqlanadi. Ikki tomonlama real vaqtli javob uchun backend kerak — bu demo hozircha bir tomonlama.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfileModal({
  open,
  profile,
  onClose,
  onSave,
  orderCount,
  dishes,
  photos,
  onSetPhoto,
  listings,
  onPublish,
  onRemoveListing,
  onUpdateListing,
  favorites,
  onToggleFavorite,
  onOpenCook,
  addresses,
  onAddAddress,
  onRemoveAddress,
  onUpdateAddress,
  onSetDefaultAddress,
  reviews,
  orders,
  proPrice,
  commission,
  onToggleProDemo,
  language,
  onSetLanguage,
  t,
  messages,
  onOpenMessageThread,
  onLogout,
}) {
  const [screen, setScreen] = useState("main");
  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [address, setAddress] = useState(profile?.address || "");
  const [avatar, setAvatar] = useState(profile?.avatar || null);
  const [editing, setEditing] = useState(!profile);

  const [addrTitle, setAddrTitle] = useState("");
  const [addrText, setAddrText] = useState("");
  const [editAddrId, setEditAddrId] = useState(null);
  const [editAddrTitle, setEditAddrTitle] = useState("");
  const [editAddrText, setEditAddrText] = useState("");
  const [priceDrafts, setPriceDrafts] = useState({});
  const [descDrafts, setDescDrafts] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmDeleteAddrId, setConfirmDeleteAddrId] = useState(null);
  const [newListingOpen, setNewListingOpen] = useState(false);
  const [savedFlashId, setSavedFlashId] = useState(null);
  const [payModalOpen, setPayModalOpen] = useState(false);

  const dishSales = useMemo(() => computeDishSales(orders || []), [orders]);

  // Re-sync the form with the latest saved profile every time the modal is opened.
  useEffect(() => {
    if (open) {
      setName(profile?.name || "");
      setPhone(profile?.phone || "");
      setEmail(profile?.email || "");
      setAddress(profile?.address || "");
      setAvatar(profile?.avatar || null);
      setEditing(!profile);
      setScreen("main");
    }
  }, [open, profile]);

  if (!open) return null;

  const ownReviews = Object.entries(reviews || {}).flatMap(([dishId, list]) =>
    (list || [])
      .filter((r) => r.own)
      .map((r) => ({ ...r, dish: dishes.find((d) => d.id === Number(dishId)) }))
  );

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!name.trim() || !phone.trim()) return;
    onSave({ name: name.trim(), phone: phone.trim(), email: email.trim(), address: address.trim(), avatar });
    setEditing(false);
    setScreen("main");
  }

  function startEdit() {
    setName(profile.name);
    setPhone(profile.phone);
    setEmail(profile.email || "");
    setAddress(profile.address);
    setAvatar(profile.avatar);
    setEditing(true);
  }

  function submitAddress() {
    if (!addrText.trim()) return;
    onAddAddress({ title: addrTitle.trim() || "Manzil", text: addrText.trim() });
    setAddrTitle("");
    setAddrText("");
  }

  function startEditAddr(a) {
    setEditAddrId(a.id);
    setEditAddrTitle(a.title);
    setEditAddrText(a.text);
  }

  function saveEditAddr() {
    if (!editAddrText.trim()) return;
    onUpdateAddress(editAddrId, { title: editAddrTitle.trim() || "Manzil", text: editAddrText.trim() });
    setEditAddrId(null);
  }

  function addrIcon(title) {
    const t = (title || "").toLowerCase();
    if (t.includes("uy") || t.includes("dom") || t.includes("home")) return Home;
    if (t.includes("ish") || t.includes("rabota") || t.includes("work")) return Briefcase;
    return MapPin;
  }

  function saveListingEdit(id) {
    const changes = {};
    if (priceDrafts[id] !== undefined && priceDrafts[id] !== "") changes.price = Number(priceDrafts[id]);
    if (descDrafts[id] !== undefined) changes.description = descDrafts[id];
    onUpdateListing(id, changes);
    setSavedFlashId(id);
    setTimeout(() => setSavedFlashId((cur) => (cur === id ? null : cur)), 1600);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
      style={{ background: "rgba(23,63,76,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-sm rounded-t-3xl md:rounded-3xl overflow-hidden max-h-[92vh] flex flex-col"
        style={{ background: T.ivory }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ---------- MAIN ---------- */}
        {screen === "main" && !editing && (
          <>
            <div className="flex items-center gap-3 p-5 shrink-0" style={{ borderBottom: `1px solid ${T.line}` }}>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: T.ivoryDeep }}>
                <X size={16} color={T.ink} />
              </button>
              <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 18, color: T.ink }}>{t("myProfile")}</h3>
            </div>
            <div className="p-5 overflow-y-auto flex flex-col gap-5">
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden mb-3"
                  style={{ background: T.turquoiseLight, border: `2px solid ${T.line}` }}
                >
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle2 size={40} color={T.cobalt} />
                  )}
                </div>
                <p style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 19, color: T.ink }}>{profile.name}</p>
                <p className="flex items-center gap-1 text-[13px] mt-0.5" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
                  <Phone size={12} /> {profile.phone}
                </p>
                {profile.email && (
                  <p className="flex items-center gap-1 text-[13px] mt-0.5" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
                    <Mail size={12} /> {profile.email}
                  </p>
                )}
                <button
                  onClick={startEdit}
                  className="flex items-center gap-1.5 text-[12.5px] rounded-full px-3.5 py-1.5 mt-3"
                  style={{ background: T.ivoryDeep, color: T.ink, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
                >
                  <Pencil size={12} /> Tahrirlash
                </button>
              </div>

              <div className="rounded-xl p-3.5 text-center" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
                <p style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 20, color: T.ink }}>{orderCount}</p>
                <p className="text-[12px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>Jami buyurtma</p>
              </div>

              <div className="flex flex-col gap-2.5">
                <MenuRow icon={Package} label={t("myListings")} badge={listings.length} onClick={() => setScreen("listings")} />
                <MenuRow icon={MessageSquare} label={t("messages")} onClick={() => setScreen("messages")} />
                <MenuRow icon={Heart} label={t("saved")} badge={favorites.length} onClick={() => setScreen("saved")} />
                <MenuRow icon={MapPin} label={t("myAddresses")} badge={addresses.length} onClick={() => setScreen("addresses")} />
                <MenuRow icon={Star} label={t("myRatings")} badge={ownReviews.length} onClick={() => setScreen("ratings")} />
                <MenuRow icon={Sparkles} label={t("pricingTariffs")} onClick={() => setScreen("pricing")} />
                <MenuRow icon={Settings} label={t("settings")} onClick={() => setScreen("settings")} />
                <MenuRow icon={LogOut} label={t("logout")} danger onClick={() => setScreen("logout")} />
              </div>
            </div>
          </>
        )}

        {/* ---------- EDIT ---------- */}
        {editing && (
          <>
            <div className="flex items-center gap-3 p-5 shrink-0" style={{ borderBottom: `1px solid ${T.line}` }}>
              <button
                onClick={() => (profile ? setEditing(false) : onClose())}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: T.ivoryDeep }}
              >
                {profile ? <ChevronLeft size={16} color={T.ink} /> : <X size={16} color={T.ink} />}
              </button>
              <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 18, color: T.ink }}>
                {profile ? "Profilni tahrirlash" : "Profil yaratish"}
              </h3>
            </div>
            <div className="p-5 flex flex-col gap-4 overflow-y-auto">
              <div className="flex justify-center">
                <label className="relative cursor-pointer">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
                    style={{ background: T.turquoiseLight, border: `2px solid ${T.line}` }}
                  >
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle2 size={40} color={T.cobalt} />
                    )}
                  </div>
                  <div
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: T.gold, border: `2px solid ${T.ivory}` }}
                  >
                    <Camera size={13} color={T.ink} />
                  </div>
                  <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                </label>
              </div>

              <div>
                <label className="text-[12.5px] mb-1.5 block" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
                  Ism familiya
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Ulug'bek Rahimov"
                  className="w-full rounded-xl px-4 py-3 text-[14px] outline-none"
                  style={{ background: "#fff", border: `1px solid ${T.line}`, fontFamily: "Work Sans, sans-serif", color: T.ink }}
                />
              </div>

              <div>
                <label className="text-[12.5px] mb-1.5 block" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
                  Telefon raqam
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full rounded-xl px-4 py-3 text-[14px] outline-none"
                  style={{ background: "#fff", border: `1px solid ${T.line}`, fontFamily: "Work Sans, sans-serif", color: T.ink }}
                />
              </div>

              <div>
                <label className="text-[12.5px] mb-1.5 block" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
                  E-mail (ixtiyoriy)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ism@example.com"
                  className="w-full rounded-xl px-4 py-3 text-[14px] outline-none"
                  style={{ background: "#fff", border: `1px solid ${T.line}`, fontFamily: "Work Sans, sans-serif", color: T.ink }}
                />
              </div>

              <div>
                <label className="text-[12.5px] mb-1.5 block" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
                  Doimiy manzil (ixtiyoriy)
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Mahalla, ko'cha, uy raqami"
                  className="w-full rounded-xl px-4 py-3 text-[14px] outline-none"
                  style={{ background: "#fff", border: `1px solid ${T.line}`, fontFamily: "Work Sans, sans-serif", color: T.ink }}
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full rounded-full py-3.5 text-[14.5px]"
                style={{ background: T.cobalt, color: "#fff", fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
              >
                Saqlash
              </button>
            </div>
          </>
        )}

        {/* ---------- MENING E'LONLARIM ---------- */}
        {screen === "listings" && !editing && (
          <>
            <SubHeader title={t("myListings")} onBack={() => setScreen("main")} />
            <div className="p-5 overflow-y-auto flex flex-col gap-4">
              {listings.length > 0 && (() => {
                const myRate = profile?.pro ? Math.max(0, commission - 4) : commission;
                const gross = listings.reduce((sum, l) => sum + (dishSales[l.dish] || 0) * l.price, 0);
                const net = Math.round(gross * (1 - myRate / 100));
                return (
                  <>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="rounded-xl p-3 text-center" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
                        <p style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 18, color: T.ink }}>{listings.length}</p>
                        <p className="text-[10.5px] mt-0.5" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>E'lon</p>
                      </div>
                      <div className="rounded-xl p-3 text-center" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
                        <p style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 18, color: T.ink }}>
                          {listings.reduce((sum, l) => sum + (dishSales[l.dish] || 0), 0)}
                        </p>
                        <p className="text-[10.5px] mt-0.5" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>Sotilgan</p>
                      </div>
                      <div className="rounded-xl p-3 text-center" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
                        <p style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 15, color: T.ink }}>
                          {formatSum(net).replace(" so'm", "")}
                        </p>
                        <p className="text-[10.5px] mt-0.5" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>Sizga tushadi</p>
                      </div>
                    </div>
                    <p className="text-[11px] px-1 -mt-2" style={{ color: "#B3A98C", fontFamily: "Work Sans, sans-serif" }}>
                      Jami savdo {formatSum(gross)} — platforma komissiyasi ({myRate}%) ayrilgandan so'ng
                    </p>
                  </>
                );
              })()}

              <button
                onClick={() => setNewListingOpen(true)}
                className="flex items-center justify-center gap-1.5 rounded-full py-3 text-[13.5px]"
                style={{ background: T.gold, color: T.ink, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
              >
                <Plus size={15} /> Yangi taom e'lon qilish
              </button>

              {listings.length === 0 ? (
                <div className="rounded-2xl p-6 flex flex-col items-center text-center" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
                  <Megaphone size={24} color={T.line} className="mb-2.5" />
                  <p className="text-[13px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
                    Hali taom e'lon qilmagansiz.
                  </p>
                </div>
              ) : (
                listings.map((l) => {
                  const sold = dishSales[l.dish] || 0;
                  const myRate = profile?.pro ? Math.max(0, commission - 4) : commission;
                  const earned = Math.round(sold * l.price * (1 - myRate / 100));
                  const confirming = confirmDeleteId === l.id;
                  return (
                    <div key={l.id} className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
                      <div className="h-24 relative flex items-end p-3.5" style={photos[l.id] ? undefined : { background: l.color }}>
                        {photos[l.id] && <img src={photos[l.id]} alt={l.dish} className="absolute inset-0 w-full h-full object-cover" />}
                        {photos[l.id] && <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0))" }} />}
                        {l.tag && (
                          <span
                            className="absolute top-3 left-3 rounded-full px-2 py-0.5 text-[10.5px] z-10"
                            style={{ background: "rgba(255,255,255,0.92)", color: T.ink, fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}
                          >
                            {l.tag}
                          </span>
                        )}
                        <span className="relative z-10 text-[16px]" style={{ fontFamily: "Fraunces, serif", fontWeight: 600, color: "#fff" }}>{l.dish}</span>
                      </div>

                      <div className="p-3.5">
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-[14.5px]" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 700, color: T.ink }}>{formatSum(l.price)}</span>
                          <span className="flex items-center gap-1 text-[11.5px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
                            <MapPin size={11} /> {l.area}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]"
                            style={{ background: T.turquoiseLight, color: T.cobalt, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
                          >
                            <Package size={11} /> {sold} sotildi
                          </span>
                          {sold > 0 && (
                            <span
                              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]"
                              style={{ background: T.goldLight, color: T.gold, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
                            >
                              {formatSum(earned)}
                            </span>
                          )}
                        </div>

                        {confirming ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] flex-1" style={{ color: T.clay, fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
                              O'chirilsinmi?
                            </span>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="rounded-full px-3 py-1.5 text-[12px]"
                              style={{ background: T.ivoryDeep, color: T.ink, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
                            >
                              Bekor
                            </button>
                            <button
                              onClick={() => {
                                onRemoveListing(l.id);
                                setConfirmDeleteId(null);
                              }}
                              className="rounded-full px-3 py-1.5 text-[12px]"
                              style={{ background: T.clay, color: "#fff", fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
                            >
                              Ha, o'chirish
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                onOpenCook(l);
                                onClose();
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-[12px]"
                              style={{ background: T.ivoryDeep, color: T.ink, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
                            >
                              <Eye size={12} /> Ko'rish
                            </button>
                            <button
                              onClick={() => setScreen("pricing")}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-[12px]"
                              style={{ background: T.ivoryDeep, color: T.ink, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
                            >
                              <Pencil size={12} /> Tahrirlash
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(l.id)}
                              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                              style={{ background: T.clayLight }}
                            >
                              <Trash2 size={13} color={T.clay} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ---------- XABARLAR ---------- */}
        {screen === "messages" && !editing && (
          <>
            <SubHeader title={t("messages")} onBack={() => setScreen("main")} />
            <div className="p-5 overflow-y-auto flex flex-col gap-2.5">
              {(() => {
                const threads = dishes
                  .filter((d) => (messages[d.id] || []).length > 0)
                  .map((d) => ({ dish: d, thread: messages[d.id] }))
                  .sort((a, b) => {
                    const la = a.thread[a.thread.length - 1]?.createdAt || 0;
                    const lb = b.thread[b.thread.length - 1]?.createdAt || 0;
                    return lb - la;
                  });

                if (threads.length === 0) {
                  return (
                    <div className="py-10 flex flex-col items-center text-center">
                      <Inbox size={26} color={T.line} className="mb-3" />
                      <p className="text-[13.5px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
                        Hozircha xabarlar yo'q. Taom sahifasidagi "Oshpazga yozish" tugmasidan foydalaning.
                      </p>
                    </div>
                  );
                }

                return threads.map(({ dish, thread }) => {
                  const last = thread[thread.length - 1];
                  return (
                    <button
                      key={dish.id}
                      onClick={() => {
                        onOpenMessageThread(dish);
                        onClose();
                      }}
                      className="flex items-center gap-3 rounded-2xl p-3.5 text-left"
                      style={{ background: "#fff", border: `1px solid ${T.line}` }}
                    >
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden shrink-0"
                        style={photos[dish.id] ? undefined : { background: dish.color }}
                      >
                        {photos[dish.id] ? (
                          <img src={photos[dish.id]} alt={dish.dish} className="w-full h-full object-cover" />
                        ) : (
                          <span style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 15, color: "#fff" }}>{dish.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px]" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 700, color: T.ink }}>{dish.name}</p>
                        <p className="text-[12px] truncate" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>{last?.text}</p>
                      </div>
                      <span className="text-[10.5px] shrink-0" style={{ color: "#B3A98C", fontFamily: "Work Sans, sans-serif" }}>{timeAgo(last?.createdAt)}</span>
                    </button>
                  );
                });
              })()}
            </div>
          </>
        )}

        {/* ---------- SAQLANGANLAR ---------- */}
        {screen === "saved" && !editing && (
          <>
            <SubHeader title={t("saved")} onBack={() => setScreen("main")} />
            <div className="p-5 overflow-y-auto flex flex-col gap-3">
              {favorites.length === 0 ? (
                <div className="rounded-2xl p-6 flex flex-col items-center text-center" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
                  <Heart size={24} color={T.line} className="mb-2.5" />
                  <p className="text-[13px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
                    Hali hech narsa saqlamagansiz. Menyuda taom ustidagi yurakcha belgisini bosing.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-[12.5px] px-1" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
                    {favorites.length} ta taom saqlangan
                  </p>
                  {dishes
                    .filter((d) => favorites.includes(d.id))
                    .map((d) => (
                      <div
                        key={d.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          onOpenCook(d);
                          onClose();
                        }}
                        onKeyDown={(e) => e.key === "Enter" && onOpenCook(d)}
                        className="flex items-center gap-3 rounded-2xl overflow-hidden p-2.5 text-left cursor-pointer"
                        style={{ background: "#fff", border: `1px solid ${T.line}` }}
                      >
                        <div
                          className="w-16 h-16 rounded-xl relative overflow-hidden shrink-0 flex items-center justify-center"
                          style={photos[d.id] ? undefined : { background: d.color }}
                        >
                          {photos[d.id] && <img src={photos[d.id]} alt={d.dish} className="absolute inset-0 w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13.5px] truncate" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 600, color: T.ink }}>{d.dish}</p>
                          <p className="text-[12px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>{d.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[12.5px]" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 700, color: T.ink }}>{formatSum(d.price)}</span>
                            <span className="flex items-center gap-0.5 text-[11.5px]" style={{ color: T.gold, fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
                              <Star size={10} fill={T.gold} strokeWidth={0} /> {d.rating}
                            </span>
                            {d.distanceKm != null && (
                              <span className="text-[11.5px]" style={{ color: T.cobalt, fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
                                {formatDistance(d.distanceKm)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(d.id);
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: T.clayLight }}
                          aria-label="Saqlanganlardan olib tashlash"
                        >
                          <Heart size={14} fill={T.clay} color={T.clay} />
                        </button>
                      </div>
                    ))}
                </>
              )}
            </div>
          </>
        )}

        {/* ---------- MANZILLARIM ---------- */}
        {screen === "addresses" && !editing && (
          <>
            <SubHeader title={t("myAddresses")} onBack={() => setScreen("main")} />
            <div className="p-5 overflow-y-auto flex flex-col gap-3">
              {addresses.length === 0 && (
                <div className="rounded-2xl p-6 flex flex-col items-center text-center" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
                  <MapPin size={24} color={T.line} className="mb-2.5" />
                  <p className="text-[13px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
                    Hali manzil qo'shmagansiz. Pastdan birinchi manzilingizni qo'shing.
                  </p>
                </div>
              )}

              {addresses.map((a) => {
                const Icon = addrIcon(a.title);
                const isEditing = editAddrId === a.id;
                const confirming = confirmDeleteAddrId === a.id;
                return (
                  <div key={a.id} className="rounded-2xl p-4" style={{ background: "#fff", border: `1px solid ${a.isDefault ? T.turquoise : T.line}` }}>
                    {isEditing ? (
                      <div className="flex flex-col gap-2">
                        <input
                          value={editAddrTitle}
                          onChange={(e) => setEditAddrTitle(e.target.value)}
                          placeholder="Nomi (masalan: Uy, Ish)"
                          className="w-full rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none"
                          style={{ background: T.ivory, border: `1px solid ${T.line}`, fontFamily: "Work Sans, sans-serif", color: T.ink }}
                        />
                        <input
                          value={editAddrText}
                          onChange={(e) => setEditAddrText(e.target.value)}
                          placeholder="Mahalla, ko'cha, uy raqami"
                          className="w-full rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none"
                          style={{ background: T.ivory, border: `1px solid ${T.line}`, fontFamily: "Work Sans, sans-serif", color: T.ink }}
                        />
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => setEditAddrId(null)}
                            className="flex-1 rounded-full py-2 text-[12.5px]"
                            style={{ background: T.ivoryDeep, color: T.ink, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
                          >
                            {t("cancel")}
                          </button>
                          <button
                            onClick={saveEditAddr}
                            className="flex-1 rounded-full py-2 text-[12.5px]"
                            style={{ background: T.cobalt, color: "#fff", fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
                          >
                            {t("save")}
                          </button>
                        </div>
                      </div>
                    ) : confirming ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] flex-1" style={{ color: T.clay, fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
                          O'chirilsinmi?
                        </span>
                        <button
                          onClick={() => setConfirmDeleteAddrId(null)}
                          className="rounded-full px-3 py-1.5 text-[12px]"
                          style={{ background: T.ivoryDeep, color: T.ink, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
                        >
                          {t("cancel")}
                        </button>
                        <button
                          onClick={() => {
                            onRemoveAddress(a.id);
                            setConfirmDeleteAddrId(null);
                          }}
                          className="rounded-full px-3 py-1.5 text-[12px]"
                          style={{ background: T.clay, color: "#fff", fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
                        >
                          Ha, o'chirish
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span
                            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: a.isDefault ? T.turquoiseLight : T.ivoryDeep }}
                          >
                            <Icon size={15} color={a.isDefault ? T.cobalt : "#8A7F68"} />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-[13.5px]" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 700, color: T.ink }}>{a.title}</p>
                              {a.isDefault && (
                                <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: T.turquoiseLight, color: T.cobalt, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}>
                                  Asosiy
                                </span>
                              )}
                            </div>
                            <p className="text-[13px]" style={{ color: "#5B5343", fontFamily: "Work Sans, sans-serif" }}>{a.text}</p>
                            {!a.isDefault && (
                              <button
                                onClick={() => onSetDefaultAddress(a.id)}
                                className="text-[11.5px] mt-1"
                                style={{ color: T.cobalt, fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}
                              >
                                Asosiy qilish
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => startEditAddr(a)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: T.ivoryDeep }}>
                            <Pencil size={12} color={T.ink} />
                          </button>
                          <button onClick={() => setConfirmDeleteAddrId(a.id)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: T.clayLight }}>
                            <Trash2 size={13} color={T.clay} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
                <p className="text-[12.5px] mb-2.5" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>Yangi manzil qo'shish</p>
                <div className="flex items-center gap-1.5 mb-2">
                  {["Uy", "Ish", "Boshqa"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAddrTitle(opt === "Boshqa" ? "" : opt)}
                      className="rounded-full px-3 py-1.5 text-[12px]"
                      style={{
                        background: addrTitle === opt || (opt === "Boshqa" && !["Uy", "Ish"].includes(addrTitle) && addrTitle !== "") ? T.turquoiseLight : T.ivory,
                        color: addrTitle === opt ? T.cobalt : "#8A7F68",
                        border: `1px solid ${addrTitle === opt ? T.turquoise : T.line}`,
                        fontFamily: "Work Sans, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <input
                  value={addrTitle}
                  onChange={(e) => setAddrTitle(e.target.value)}
                  placeholder="Nomi (masalan: Uy, Ish)"
                  className="w-full rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none mb-2"
                  style={{ background: T.ivory, border: `1px solid ${T.line}`, fontFamily: "Work Sans, sans-serif", color: T.ink }}
                />
                <input
                  value={addrText}
                  onChange={(e) => setAddrText(e.target.value)}
                  placeholder="Mahalla, ko'cha, uy raqami"
                  className="w-full rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none mb-2.5"
                  style={{ background: T.ivory, border: `1px solid ${T.line}`, fontFamily: "Work Sans, sans-serif", color: T.ink }}
                />
                <button
                  onClick={submitAddress}
                  className="w-full rounded-full py-2.5 text-[13px]"
                  style={{ background: T.cobalt, color: "#fff", fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
                >
                  Qo'shish
                </button>
              </div>
            </div>
          </>
        )}

        {/* ---------- BAHOLARIM ---------- */}
        {screen === "ratings" && !editing && (
          <>
            <SubHeader title={t("myRatings")} onBack={() => setScreen("main")} />
            <div className="p-5 overflow-y-auto flex flex-col gap-3">
              {ownReviews.length === 0 ? (
                <div className="rounded-2xl p-6 flex flex-col items-center text-center" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
                  <Star size={24} color={T.line} className="mb-2.5" />
                  <p className="text-[13px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
                    Siz hali hech qanday taomga sharh qoldirmagansiz.
                  </p>
                </div>
              ) : (
                ownReviews.map((r, i) => (
                  <div key={i} className="rounded-2xl p-4" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13.5px]" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 700, color: T.ink }}>
                        {r.dish ? r.dish.dish : "O'chirilgan taom"}
                      </span>
                      <span className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} size={11} fill={n <= r.rating ? T.gold : "none"} color={n <= r.rating ? T.gold : T.line} strokeWidth={1.5} />
                        ))}
                      </span>
                    </div>
                    <p className="text-[13px]" style={{ color: "#5B5343", fontFamily: "Work Sans, sans-serif" }}>{r.text}</p>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ---------- TA'RIFLAR VA NARXLAR ---------- */}
        {screen === "pricing" && !editing && (
          <>
            <SubHeader title={t("pricingTariffs")} onBack={() => setScreen("main")} />
            <div className="p-5 overflow-y-auto flex flex-col gap-4">
              {/* Pro tariff info */}
              <div className="rounded-2xl p-4 overflow-hidden relative" style={{ background: T.cobalt }}>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: T.gold }}>
                    <Crown size={15} color={T.ink} />
                  </span>
                  <p style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 16, color: "#fff" }}>Pro tarif</p>
                  {profile?.pro && (
                    <span className="ml-auto rounded-full px-2.5 py-1 text-[11px]" style={{ background: T.gold, color: T.ink, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}>
                      Faol
                    </span>
                  )}
                </div>
                <ul className="flex flex-col gap-1.5 mb-3.5">
                  {[
                    "Taomlaringiz menyu ro'yxatida yuqorida chiqadi",
                    "Kartochkada oltin \"Pro\" belgisi bilan ajralib turadi",
                    `Platforma komissiyasi ${commission}% o'rniga ${Math.max(0, commission - 4)}%`,
                    "Admin statistikasida alohida ko'rinish",
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12.5px]" style={{ color: T.turquoiseLight, fontFamily: "Work Sans, sans-serif" }}>
                      <Check size={13} className="mt-0.5 shrink-0" /> {t}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>
                    {formatSum(proPrice)} <span className="text-[12px] font-normal" style={{ color: T.turquoiseLight }}>/ oyiga</span>
                  </span>
                  <button
                    onClick={() => (profile?.pro ? onToggleProDemo() : setPayModalOpen(true))}
                    className="rounded-full px-4 py-2 text-[12.5px]"
                    style={{ background: profile?.pro ? "rgba(255,255,255,0.15)" : T.gold, color: profile?.pro ? "#fff" : T.ink, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
                  >
                    {profile?.pro ? "Bekor qilish" : "To'lov qilish"}
                  </button>
                </div>
                <p className="text-[10.5px] mt-2.5" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "Work Sans, sans-serif" }}>
                  Faollashtirish uchun to'lov talab qilinadi. Narx va komissiyani admin "Sozlamalar"da belgilaydi.
                </p>
              </div>

              {listings.length === 0 ? (
                <div className="rounded-2xl p-6 flex flex-col items-center text-center" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
                  <Sparkles size={24} color={T.line} className="mb-2.5" />
                  <p className="text-[13px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
                    Avval biror taom e'lon qiling, keyin bu yerda narx va tavsifni tahrirlashingiz mumkin.
                  </p>
                </div>
              ) : (
                listings.map((l) => {
                  const descLen = (descDrafts[l.id] !== undefined ? descDrafts[l.id] : l.description || "").length;
                  return (
                    <div key={l.id} className="rounded-2xl p-4" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
                      <p className="text-[14px] mb-3" style={{ fontFamily: "Fraunces, serif", fontWeight: 600, color: T.ink }}>{l.dish}</p>
                      <label className="text-[12px] mb-1 block" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>Narxi (so'm)</label>
                      <input
                        type="number"
                        defaultValue={l.price}
                        onChange={(e) => setPriceDrafts((p) => ({ ...p, [l.id]: e.target.value }))}
                        className="w-full rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none mb-3"
                        style={{ background: T.ivory, border: `1px solid ${T.line}`, fontFamily: "Work Sans, sans-serif", color: T.ink }}
                      />
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[12px] block" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>Tavsif</label>
                        <span className="text-[11px]" style={{ color: descLen > 140 ? T.clay : "#B3A98C", fontFamily: "Work Sans, sans-serif" }}>{descLen}/140</span>
                      </div>
                      <textarea
                        defaultValue={l.description || ""}
                        maxLength={140}
                        onChange={(e) => setDescDrafts((p) => ({ ...p, [l.id]: e.target.value }))}
                        rows={2}
                        placeholder="Taom haqida qisqa tavsif..."
                        className="w-full rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none mb-3 resize-none"
                        style={{ background: T.ivory, border: `1px solid ${T.line}`, fontFamily: "Work Sans, sans-serif", color: T.ink }}
                      />
                      <button
                        onClick={() => saveListingEdit(l.id)}
                        className="w-full rounded-full py-2.5 text-[13px]"
                        style={{
                          background: savedFlashId === l.id ? "#3D7A4A" : T.gold,
                          color: savedFlashId === l.id ? "#fff" : T.ink,
                          fontFamily: "Work Sans, sans-serif",
                          fontWeight: 700,
                        }}
                      >
                        {savedFlashId === l.id ? "Saqlandi ✓" : "Saqlash"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ---------- CHIQISH ---------- */}
        {/* ---------- SOZLAMALAR ---------- */}
        {screen === "settings" && !editing && (
          <>
            <SubHeader title={t("settings")} onBack={() => setScreen("main")} />
            <div className="p-5 overflow-y-auto flex flex-col gap-3">
              <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
                <div className="flex items-center gap-2 mb-1">
                  <Globe size={15} color={T.cobalt} />
                  <p style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 15, color: T.ink }}>{t("chooseLanguage")}</p>
                </div>
                <p className="text-[12px] mb-3.5" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>{t("languageNote")}</p>
                <div className="flex flex-col gap-2">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => onSetLanguage(l.id)}
                      className="flex items-center justify-between rounded-xl px-4 py-3"
                      style={{
                        background: language === l.id ? T.turquoiseLight : T.ivory,
                        border: `1px solid ${language === l.id ? T.turquoise : T.line}`,
                      }}
                    >
                      <span className="text-[14px]" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 600, color: T.ink }}>
                        {l.native}
                      </span>
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ border: `2px solid ${language === l.id ? T.cobalt : T.line}` }}
                      >
                        {language === l.id && <div className="w-2 h-2 rounded-full" style={{ background: T.cobalt }} />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {screen === "logout" && !editing && (
          <div className="p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: T.clayLight }}>
              <LogOut size={22} color={T.clay} />
            </div>
            <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 19, color: T.ink }} className="mb-1.5">
              Profildan chiqish
            </h3>
            <p className="text-[13px] mb-6" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
              Ism, telefon va boshqa profil ma'lumotlaringiz bu qurilmadan o'chiriladi. Buyurtmalaringiz va e'lonlaringiz saqlanib qoladi.
            </p>
            <div className="w-full flex flex-col gap-2.5">
              <button
                onClick={onLogout}
                className="w-full rounded-full py-3 text-[14px]"
                style={{ background: T.clay, color: "#fff", fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
              >
                Ha, chiqish
              </button>
              <button
                onClick={() => setScreen("main")}
                className="w-full rounded-full py-3 text-[14px]"
                style={{ background: T.ivoryDeep, color: T.ink, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
              >
                Bekor qilish
              </button>
            </div>
          </div>
        )}
      </div>

      <NewListingModal
        open={newListingOpen}
        profile={profile}
        onClose={() => setNewListingOpen(false)}
        onPublish={onPublish}
        onSetPhoto={onSetPhoto}
      />

      <ProPaymentModal
        open={payModalOpen}
        proPrice={proPrice}
        onClose={() => setPayModalOpen(false)}
        onConfirm={onToggleProDemo}
      />
    </div>
  );
}
function AdminLoginModal({ open, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);

  if (!open) return null;

  function handleClose() {
    setEmail("");
    setPassword("");
    setError(false);
    onClose();
  }

  function handleSubmit() {
    if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      setEmail("");
      setPassword("");
      setError(false);
      onSuccess();
    } else {
      setError(true);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
      style={{ background: "rgba(23,63,76,0.55)" }}
      onClick={handleClose}
    >
      <div
        className="w-full md:max-w-sm rounded-t-3xl md:rounded-3xl overflow-hidden"
        style={{ background: T.ivory }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: T.cobalt }}>
            <Lock size={22} color="#fff" />
          </div>
          <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 19, color: T.ink }} className="mb-1.5">
            Admin panel
          </h3>
          <p className="text-[13px] mb-5" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
            Bu bo'lim faqat yaratuvchi uchun. Davom etish uchun e-mail va parolni kiriting.
          </p>

          <div className="w-full mb-3">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(false);
              }}
              placeholder="E-mail"
              autoFocus
              className="w-full rounded-xl px-4 py-3.5 text-[14.5px] outline-none text-center"
              style={{
                background: "#fff",
                border: `1.5px solid ${error ? T.clay : T.line}`,
                fontFamily: "Work Sans, sans-serif",
                color: T.ink,
              }}
            />
          </div>

          <div className="w-full relative mb-2">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Parol"
              className="w-full rounded-xl pl-4 pr-11 py-3.5 text-[15px] outline-none text-center tracking-wide"
              style={{
                background: "#fff",
                border: `1.5px solid ${error ? T.clay : T.line}`,
                fontFamily: "Work Sans, sans-serif",
                color: T.ink,
              }}
            />
            <button
              onClick={() => setShow((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
              tabIndex={-1}
            >
              {show ? <EyeOff size={16} color="#8A7F68" /> : <Eye size={16} color="#8A7F68" />}
            </button>
          </div>

          {error && (
            <p className="text-[12.5px] mb-3" style={{ color: T.clay, fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
              E-mail yoki parol noto'g'ri. Qayta urinib ko'ring.
            </p>
          )}

          <button
            onClick={handleSubmit}
            className="w-full rounded-full py-3.5 text-[14.5px] mt-2"
            style={{ background: T.cobalt, color: "#fff", fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
          >
            Kirish
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Admin view ----------
function StatCard({ label, value, delta, positive, neutral, icon: Icon }) {
  return (
    <div className="rounded-2xl p-5 transition-transform hover:-translate-y-0.5" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 500 }}>{label}</span>
        <Icon size={16} color={T.turquoise} />
      </div>
      <p style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 24, color: T.ink }}>{value}</p>
      {delta && (
        <div
          className="flex items-center gap-1 mt-1.5 text-[12.5px]"
          style={{ color: neutral ? "#8A7F68" : positive ? "#3D7A4A" : T.clay, fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}
        >
          {!neutral && (positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />)} {delta}
        </div>
      )}
    </div>
  );
}

function AdminView({ orders, setOrders, onLogout, dishes, commission, setCommission, proPrice, setProPrice }) {
  const [tab, setTab] = useState("umumiy");
  const [users, setUsers] = useState(ADMIN_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Hammasi");
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const weeklyRevenue = useMemo(() => computeWeeklyRevenue(orders), [orders]);
  const maxRev = Math.max(1, ...weeklyRevenue.map((d) => d.total));
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const deliveredCount = orders.filter((o) => o.status === "Yetkazildi").length;
  const avgOrder = orders.length ? Math.round(totalRevenue / orders.length) : 0;
  const platformRevenue = orders.reduce((sum, o) => sum + (o.commissionAmount || 0), 0);
  const sellerPayouts = orders.reduce((sum, o) => sum + (o.netAmount != null ? o.netAmount : o.total), 0);
  const dishSales = useMemo(() => computeDishSales(orders), [orders]);
  const proCount = users.filter((u) => u.pro).length;
  const pendingCooks = users.filter((u) => u.status === "Kutilmoqda");
  const topDishes = [...dishes]
    .map((d) => ({ ...d, realOrders: dishSales[d.dish] || 0 }))
    .sort((a, b) => b.realOrders - a.realOrders)
    .slice(0, 3);

  const ORDER_FLOW = ["Tayyorlanmoqda", "Yo'lda", "Yetkazildi"];

  function togglePro(id) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, pro: !u.pro } : u)));
  }

  function toggleSuspend(id) {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "Nofaol" ? "Faol" : "Nofaol" } : u))
    );
  }

  function approveCook(id) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "Faol" } : u)));
  }

  function rejectCook(id) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  function advanceStatus(orderId) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const i = ORDER_FLOW.indexOf(o.status);
        const next = ORDER_FLOW[Math.min(i + 1, ORDER_FLOW.length - 1)];
        return { ...o, status: next };
      })
    );
  }

  function saveSettings() {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) &&
      (roleFilter === "Hammasi" || u.role === roleFilter)
  );

  const TABS = [
    { k: "umumiy", label: "Umumiy" },
    { k: "buyurtmalar", label: `Buyurtmalar${orders.length ? ` (${orders.length})` : ""}` },
    { k: "foydalanuvchilar", label: "Foydalanuvchilar" },
    { k: "sozlamalar", label: "Sozlamalar" },
  ];

  return (
    <div className="px-6 md:px-10 py-8">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} color={T.cobalt} />
          <span className="text-[13px]" style={{ color: T.cobalt, fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
            Admin panel
          </span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-[12.5px] rounded-full px-3 py-1.5"
          style={{ background: "#fff", border: `1px solid ${T.line}`, color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}
        >
          <LogOut size={13} /> Chiqish
        </button>
      </div>
      <h2 className="mb-6" style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 26, color: T.ink }}>
        Bugungi holat
      </h2>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-7 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className="shrink-0 px-3.5 py-1.5 rounded-full text-[13px] whitespace-nowrap"
            style={{
              background: tab === t.k ? T.cobalt : "#fff",
              color: tab === t.k ? "#fff" : T.ink,
              border: `1px solid ${tab === t.k ? T.cobalt : T.line}`,
              fontFamily: "Work Sans, sans-serif",
              fontWeight: 600,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "umumiy" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-3.5">
            <StatCard label="Jami aylanma" value={formatSum(totalRevenue).replace(" so'm", "")} delta={`${orders.length} ta buyurtmadan`} neutral icon={TrendingUp} />
            <StatCard label="Buyurtmalar soni" value={orders.length} delta={`${deliveredCount} ta yetkazilgan`} neutral icon={ClipboardList} />
            <StatCard label="O'rtacha chek" value={orders.length ? formatSum(avgOrder).replace(" so'm", "") : "—"} delta="buyurtma boshiga" neutral icon={Wallet} />
            <StatCard label="E'lon qilingan taom" value={dishes.length} delta={`shundan ${dishes.length - COOKS.length} tasi foydalanuvchilardan`} neutral icon={Megaphone} />
          </div>
          <div className="grid grid-cols-2 gap-3.5 mb-8">
            <StatCard
              label="Platforma komissiyasi"
              value={formatSum(platformRevenue).replace(" so'm", "")}
              delta={`${commission}% stavka bo'yicha`}
              neutral
              icon={Percent}
            />
            <StatCard
              label="Oshpazlarga to'lov"
              value={formatSum(sellerPayouts).replace(" so'm", "")}
              delta="komissiyadan keyin, sof"
              neutral
              icon={Wallet}
            />
          </div>

          {/* Revenue chart */}
          <div className="rounded-2xl p-5 mb-6" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
            <div className="flex items-center justify-between mb-5">
              <p className="text-[13px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 500 }}>
                Haftalik aylanma (so'm) — so'nggi 7 kun, haqiqiy buyurtmalar
              </p>
              <span className="flex items-center gap-1.5 text-[12px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: T.gold }} /> Bugun
              </span>
            </div>
            <div className="flex items-end gap-3" style={{ height: 132 }}>
              {weeklyRevenue.map((d, i) => {
                const barHeight = d.total > 0 ? Math.max(10, Math.round((d.total / maxRev) * 92)) : 4;
                const isToday = i === weeklyRevenue.length - 1;
                return (
                  <div key={d.key} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
                    <span
                      className="text-[10.5px]"
                      style={{ color: isToday ? T.gold : "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: isToday ? 700 : 500 }}
                    >
                      {d.total > 0 ? Math.round(d.total / 1000) + "k" : "0"}
                    </span>
                    <div
                      className="w-full rounded-t-md transition-all"
                      style={{
                        height: `${barHeight}px`,
                        background: d.total === 0 ? T.ivoryDeep : isToday ? T.gold : T.turquoiseLight,
                        border: d.total === 0 ? "none" : isToday ? "none" : `1px solid ${T.turquoise}`,
                        borderBottom: "none",
                      }}
                    />
                    <span
                      className="text-[11.5px]"
                      style={{ color: isToday ? T.ink : "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: isToday ? 700 : 500 }}
                    >
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {/* Top dishes */}
            <div className="rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
              <p style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 16, color: T.ink }} className="mb-4">
                Top taomlar
              </p>
              {topDishes.every((d) => d.realOrders === 0) ? (
                <p className="text-[13px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
                  Hali haqiqiy buyurtma yo'q — birinchi buyurtmadan so'ng bu yerda ko'rinadi.
                </p>
              ) : (
              <div className="flex flex-col gap-4">
                {topDishes.map((d, i) => (
                  <div key={d.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] shrink-0"
                          style={{ background: i === 0 ? T.goldLight : T.ivoryDeep, color: i === 0 ? T.gold : "#8A7F68", fontWeight: 700, fontFamily: "Work Sans, sans-serif" }}
                        >
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-[13.5px]" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 600, color: T.ink }}>{d.dish}</p>
                          <p className="text-[12px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>{d.name}</p>
                        </div>
                      </div>
                      <span className="text-[12.5px] shrink-0" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>{d.realOrders} buyurtma</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden ml-8.5" style={{ background: T.ivoryDeep, marginLeft: 34 }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(d.realOrders / topDishes[0].realOrders) * 100}%`, background: i === 0 ? T.gold : T.turquoise }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>

            {/* Pending approvals */}
            <div className="rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
              <p style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 16, color: T.ink }} className="mb-4">
                Tasdiqlash kutilmoqda {pendingCooks.length > 0 && `(${pendingCooks.length})`}
              </p>
              {pendingCooks.length === 0 ? (
                <p className="text-[13px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
                  Hozircha yangi so'rov yo'q.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {pendingCooks.map((u) => (
                    <div key={u.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] shrink-0"
                          style={{ background: T.goldLight, color: T.gold, fontWeight: 700, fontFamily: "Fraunces, serif" }}
                        >
                          {u.name.charAt(0)}
                        </span>
                        <div>
                          <p className="text-[13.5px]" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 600, color: T.ink }}>{u.name}</p>
                          <p className="text-[12px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>{u.role} · {u.joined}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => approveCook(u.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: "#E4F0E6" }}
                        >
                          <Check size={14} color="#3D7A4A" />
                        </button>
                        <button
                          onClick={() => rejectCook(u.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: T.clayLight }}
                        >
                          <XCircle size={14} color={T.clay} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {tab === "buyurtmalar" && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
          {orders.length === 0 ? (
            <div className="p-10 flex flex-col items-center text-center">
              <ClipboardList size={26} color={T.line} className="mb-3" />
              <p className="text-[13.5px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
                Hali platformada buyurtma yo'q.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {orders.map((o, idx) => {
                const st = STATUS_STYLE[o.status];
                return (
                  <div
                    key={o.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-5"
                    style={{ borderBottom: idx < orders.length - 1 ? `1px solid ${T.line}` : "none" }}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13.5px]" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 700, color: T.ink }}>{o.id}</span>
                        <span className="rounded-full px-2.5 py-0.5 text-[11px]" style={{ background: st.bg, color: st.fg, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}>
                          {o.status}
                        </span>
                      </div>
                      <p className="text-[12.5px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
                        {o.items.map((it) => `${it.qty} × ${it.dish}`).join(", ")} · {o.date}
                      </p>
                      <p className="text-[12px] flex items-center gap-1 mt-0.5" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
                        <MapPinned size={11} /> {o.address} · {o.payment}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 700, fontSize: 14.5, color: T.ink }}>
                          {formatSum(o.total)}
                        </span>
                        {o.commissionAmount != null && (
                          <p className="text-[10.5px] mt-0.5" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
                            komissiya {formatSum(o.commissionAmount)} · sof {formatSum(o.netAmount)}
                          </p>
                        )}
                      </div>
                      {o.status !== "Yetkazildi" ? (
                        <button
                          onClick={() => advanceStatus(o.id)}
                          className="rounded-full px-3.5 py-2 text-[12.5px] whitespace-nowrap"
                          style={{ background: T.ivoryDeep, color: T.ink, fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
                        >
                          {o.status === "Tayyorlanmoqda" ? "Yo'lga chiqdi →" : "Yetkazildi deb belgilash →"}
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-[12.5px]" style={{ color: "#3D7A4A", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
                          <CheckCircle2 size={14} /> Yakunlangan
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "foydalanuvchilar" && (
        <div>
          <div className="flex items-center gap-1.5 mb-3 px-1">
            <FileText size={12} color="#8A7F68" />
            <p className="text-[11.5px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>
              Namuna ro'yxat — haqiqiy backend ulanganda bu yerda platformaga ro'yxatdan o'tgan real foydalanuvchilar ko'rinadi.
            </p>
          </div>
        <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 pt-5 pb-4">
            <div className="flex items-center gap-2 rounded-full px-3.5 py-2 flex-1" style={{ background: T.ivory, border: `1px solid ${T.line}` }}>
              <Search size={14} color="#8A7F68" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ism bo'yicha qidirish"
                className="flex-1 bg-transparent outline-none text-[13px]"
                style={{ fontFamily: "Work Sans, sans-serif", color: T.ink }}
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {["Hammasi", "Oshpaz", "Xaridor", "Xaydovchi"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className="shrink-0 px-3 py-1.5 rounded-full text-[12px] whitespace-nowrap"
                  style={{
                    background: roleFilter === r ? T.turquoiseLight : "transparent",
                    color: roleFilter === r ? T.cobalt : "#8A7F68",
                    border: `1px solid ${roleFilter === r ? T.turquoise : T.line}`,
                    fontFamily: "Work Sans, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]" style={{ fontFamily: "Work Sans, sans-serif" }}>
              <thead>
                <tr style={{ borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
                  {["Ism", "Rol", "Holat", "Qo'shilgan", "Aylanma", "Pro", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-2.5 font-medium" style={{ color: "#8A7F68", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${T.line}` }}>
                    <td className="px-5 py-3" style={{ fontWeight: 600, color: T.ink }}>{u.name}</td>
                    <td className="px-5 py-3" style={{ color: "#5B5343" }}>{u.role}</td>
                    <td className="px-5 py-3">
                      <span
                        className="rounded-full px-2.5 py-1 text-[11.5px]"
                        style={{
                          background: u.status === "Faol" ? "#E4F0E6" : u.status === "Kutilmoqda" ? T.goldLight : T.clayLight,
                          color: u.status === "Faol" ? "#3D7A4A" : u.status === "Kutilmoqda" ? T.gold : T.clay,
                          fontWeight: 600,
                        }}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-3" style={{ color: "#5B5343" }}>{u.joined}</td>
                    <td className="px-5 py-3" style={{ color: "#5B5343" }}>{u.revenue ? formatSum(u.revenue) : "—"}</td>
                    <td className="px-5 py-3">
                      {u.role === "Oshpaz" ? (
                        <button
                          onClick={() => togglePro(u.id)}
                          className="rounded-full px-3 py-1.5 text-[11.5px] flex items-center gap-1"
                          style={{
                            background: u.pro ? T.gold : T.ivoryDeep,
                            color: u.pro ? "#fff" : "#8A7F68",
                            fontWeight: 700,
                          }}
                        >
                          <Crown size={11} /> {u.pro ? "Pro faol" : "Pro berish"}
                        </button>
                      ) : (
                        <span style={{ color: "#C6BCA3" }}>—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {u.status !== "Kutilmoqda" && (
                        <button
                          onClick={() => toggleSuspend(u.id)}
                          className="rounded-full px-3 py-1.5 text-[11.5px] flex items-center gap-1"
                          style={{
                            background: u.status === "Nofaol" ? "#E4F0E6" : T.clayLight,
                            color: u.status === "Nofaol" ? "#3D7A4A" : T.clay,
                            fontWeight: 700,
                          }}
                        >
                          <Ban size={11} /> {u.status === "Nofaol" ? "Qayta tiklash" : "To'xtatish"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {tab === "sozlamalar" && (
        <div className="max-w-md flex flex-col gap-5">
          <div className="rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${T.line}` }}>
            <div className="flex items-center gap-2 mb-4">
              <Settings size={15} color={T.cobalt} />
              <p style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 16, color: T.ink }}>Platforma sozlamalari</p>
            </div>

            <label className="text-[12.5px] mb-1.5 block" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
              Platforma komissiyasi (%)
            </label>
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4" style={{ background: T.ivory, border: `1px solid ${T.line}` }}>
              <Percent size={14} color="#8A7F68" />
              <input
                type="number"
                min={0}
                max={50}
                value={commission}
                onChange={(e) => setCommission(Number(e.target.value))}
                className="flex-1 bg-transparent outline-none text-[14px]"
                style={{ fontFamily: "Work Sans, sans-serif", color: T.ink }}
              />
            </div>

            <label className="text-[12.5px] mb-1.5 block" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif", fontWeight: 600 }}>
              Pro obuna narxi (oyiga)
            </label>
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4" style={{ background: T.ivory, border: `1px solid ${T.line}` }}>
              <input
                type="number"
                step={1000}
                value={proPrice}
                onChange={(e) => setProPrice(Number(e.target.value))}
                className="flex-1 bg-transparent outline-none text-[14px]"
                style={{ fontFamily: "Work Sans, sans-serif", color: T.ink }}
              />
              <span className="text-[13px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>so'm</span>
            </div>

            <div className="flex items-center justify-between py-3" style={{ borderTop: `1px solid ${T.line}` }}>
              <div>
                <p className="text-[13.5px]" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 600, color: T.ink }}>Yangi buyurtma bildirishnomasi</p>
                <p className="text-[12px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>Har bir yangi buyurtmada xabar olish</p>
              </div>
              <button
                onClick={() => setNotifyOrders((v) => !v)}
                className="w-11 h-6 rounded-full flex items-center px-0.5 shrink-0"
                style={{ background: notifyOrders ? T.cobalt : T.line, justifyContent: notifyOrders ? "flex-end" : "flex-start" }}
              >
                <div className="w-5 h-5 rounded-full" style={{ background: "#fff" }} />
              </button>
            </div>

            <div className="flex items-center justify-between py-3" style={{ borderTop: `1px solid ${T.line}` }}>
              <div>
                <p className="text-[13.5px]" style={{ fontFamily: "Work Sans, sans-serif", fontWeight: 600, color: T.ink }}>Oshpazlarni avtomatik tasdiqlash</p>
                <p className="text-[12px]" style={{ color: "#8A7F68", fontFamily: "Work Sans, sans-serif" }}>O'chiq bo'lsa, har biri qo'lda tekshiriladi</p>
              </div>
              <button
                onClick={() => setAutoApprove((v) => !v)}
                className="w-11 h-6 rounded-full flex items-center px-0.5 shrink-0"
                style={{ background: autoApprove ? T.cobalt : T.line, justifyContent: autoApprove ? "flex-end" : "flex-start" }}
              >
                <div className="w-5 h-5 rounded-full" style={{ background: "#fff" }} />
              </button>
            </div>

            <button
              onClick={saveSettings}
              className="w-full rounded-full py-3 text-[14px] mt-4"
              style={{ background: savedFlash ? "#3D7A4A" : T.cobalt, color: "#fff", fontFamily: "Work Sans, sans-serif", fontWeight: 700 }}
            >
              {savedFlash ? "Saqlandi ✓" : "Sozlamalarni saqlash"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Root ----------
export default function App() {
  const [view, setView] = useState("mijoz");
  const [cart, setCart] = useState({});
  const [openCook, setOpenCook] = useState(null);
  const [messageDish, setMessageDish] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customerPage, setCustomerPage] = useState("menyu");
  const [menuQuery, setMenuQuery] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [photos, setPhotos] = useState({});
  const [reviews, setReviews] = useState(SEED_REVIEWS);
  const [profile, setProfile] = useState(() => lsGet("profile", null));
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [proPrice, setProPrice] = useState(45000);
  const [language, setLanguage] = useState(() => lsGet("language", "uz"));
  const [legalNoticeDismissed, setLegalNoticeDismissed] = useState(() => lsGet("legalNoticeDismissed", false));
  const [myOrderIds, setMyOrderIds] = useState(() => lsGet("myOrderIds", []));
  const myOrders = useMemo(() => orders.filter((o) => myOrderIds.includes(o.id)), [orders, myOrderIds]);
  const [notifications, setNotifications] = useState(() => lsGet("notifications", []));
  const [notifOpen, setNotifOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [messages, setMessages] = useState(() => lsGet("messages", {}));
  const prevStatusRef = useRef({});

  function pushNotification(title, body) {
    const notif = { id: Date.now() + Math.random(), title, body, createdAt: Date.now(), read: false };
    setNotifications((prev) => [notif, ...prev].slice(0, 50));
    setToast(notif);
  }

  // Detect real order-status transitions (from wherever they happen — admin panel,
  // this session) and turn each one into a genuine notification.
  useEffect(() => {
    orders.forEach((o) => {
      const prev = prevStatusRef.current[o.id];
      if (prev !== undefined && prev !== o.status && myOrderIds.includes(o.id)) {
        pushNotification(
          o.status === "Yo'lda" ? "Buyurtmangiz yo'lda" : o.status === "Yetkazildi" ? "Buyurtmangiz yetkazildi" : "Buyurtma holati yangilandi",
          `${o.id} — ${o.status}`
        );
      }
      prevStatusRef.current[o.id] = o.status;
    });
  }, [orders, myOrderIds]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  const t = useMemo(() => makeT(language), [language]);
  const [commission, setCommission] = useState(12);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | requesting | granted | denied | unsupported

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      return;
    }
    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("granted");
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }

  // Ask for location automatically once, when the app first opens.
  useEffect(() => {
    requestLocation();
  }, []);
  const [favorites, setFavorites] = useState(() => lsGet("favorites", []));
  const [addresses, setAddresses] = useState(() => lsGet("addresses", []));
  const [hydrated, setHydrated] = useState(false);

  const dishes = useMemo(() => [...COOKS, ...listings], [listings]);
  const dishesWithDistance = useMemo(() => {
    if (!userLocation) return dishes;
    return dishes.map((d) =>
      d.lat != null && d.lng != null
        ? { ...d, distanceKm: distanceKm(userLocation.lat, userLocation.lng, d.lat, d.lng) }
        : d
    );
  }, [dishes, userLocation]);

  // ---- Personal data: plain localStorage, synced automatically on change ----
  useEffect(() => { localStorage.setItem("profile", JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem("favorites", JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem("addresses", JSON.stringify(addresses)); }, [addresses]);
  useEffect(() => { localStorage.setItem("language", JSON.stringify(language)); }, [language]);
  useEffect(() => { localStorage.setItem("notifications", JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem("messages", JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem("legalNoticeDismissed", JSON.stringify(legalNoticeDismissed)); }, [legalNoticeDismissed]);
  useEffect(() => { localStorage.setItem("myOrderIds", JSON.stringify(myOrderIds)); }, [myOrderIds]);

  // ---- Shared data: real Supabase tables, live-synced across every device ----
  const syncedRef = useRef({});
  function isSynced(key, value) {
    return syncedRef.current[key] === JSON.stringify(value);
  }
  function markSynced(key, value) {
    syncedRef.current[key] = JSON.stringify(value);
  }

  async function fetchListings() {
    const { data, error } = await supabase.from("listings").select("data").order("created_at", { ascending: false });
    if (error) { console.error(error); return; }
    const v = data.map((r) => r.data);
    if (!isSynced("listings", v)) setListings(v);
    markSynced("listings", v);
  }
  async function fetchOrders() {
    const { data, error } = await supabase.from("orders").select("data").order("created_at", { ascending: false });
    if (error) { console.error(error); return; }
    const v = data.map((r) => r.data);
    if (!isSynced("orders", v)) setOrders(v);
    markSynced("orders", v);
  }
  async function fetchPhotos() {
    const { data, error } = await supabase.from("photos").select("dish_id, url");
    if (error) { console.error(error); return; }
    const v = {};
    data.forEach((r) => { v[r.dish_id] = r.url; });
    if (!isSynced("photos", v)) setPhotos(v);
    markSynced("photos", v);
  }
  async function fetchReviews() {
    const { data, error } = await supabase.from("reviews").select("dish_id, items");
    if (error) { console.error(error); return; }
    const v = {};
    data.forEach((r) => { v[r.dish_id] = r.items; });
    if (!isSynced("reviews", v)) setReviews(v);
    markSynced("reviews", v);
  }
  async function fetchSettings() {
    const { data, error } = await supabase.from("platform_settings").select("pro_price, commission").eq("id", 1).single();
    if (error) { console.error(error); return; }
    const v = { proPrice: data.pro_price, commission: data.commission };
    if (!isSynced("settings", v)) {
      setProPrice(v.proPrice);
      setCommission(v.commission);
    }
    markSynced("settings", v);
  }

  // Initial load + realtime subscriptions: any change anyone makes, on any
  // device, arrives here automatically — this is what makes the app truly
  // shared, without needing your own account or Claude at all.
  useEffect(() => {
    (async () => {
      await Promise.all([fetchListings(), fetchOrders(), fetchPhotos(), fetchReviews(), fetchSettings()]);
      setHydrated(true);
    })();

    const channel = supabase
      .channel("uy-dasturxon-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "listings" }, fetchListings)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchOrders)
      .on("postgres_changes", { event: "*", schema: "public", table: "photos" }, fetchPhotos)
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, fetchReviews)
      .on("postgres_changes", { event: "*", schema: "public", table: "platform_settings" }, fetchSettings)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Push every listing to Supabase whenever the local list changes (covers
  // new publishes and price/description edits in one place).
  useEffect(() => {
    if (!hydrated || listings.length === 0 || isSynced("listings", listings)) return;
    markSynced("listings", listings);
    supabase.from("listings").upsert(listings.map((l) => ({ id: l.id, data: l }))).then(({ error }) => {
      if (error) console.error(error);
    });
  }, [listings, hydrated]);

  // Push every order to Supabase whenever the local list changes (covers new
  // orders and admin status updates in one place).
  useEffect(() => {
    if (!hydrated || orders.length === 0 || isSynced("orders", orders)) return;
    markSynced("orders", orders);
    supabase.from("orders").upsert(orders.map((o) => ({ id: o.id, data: o }))).then(({ error }) => {
      if (error) console.error(error);
    });
  }, [orders, hydrated]);

  useEffect(() => {
    const keys = Object.keys(photos);
    if (!hydrated || keys.length === 0 || isSynced("photos", photos)) return;
    markSynced("photos", photos);
    supabase.from("photos").upsert(keys.map((id) => ({ dish_id: Number(id), url: photos[id] }))).then(({ error }) => {
      if (error) console.error(error);
    });
  }, [photos, hydrated]);

  useEffect(() => {
    const keys = Object.keys(reviews);
    if (!hydrated || keys.length === 0 || isSynced("reviews", reviews)) return;
    markSynced("reviews", reviews);
    supabase.from("reviews").upsert(keys.map((id) => ({ dish_id: Number(id), items: reviews[id] }))).then(({ error }) => {
      if (error) console.error(error);
    });
  }, [reviews, hydrated]);

  useEffect(() => {
    const v = { proPrice, commission };
    if (!hydrated || isSynced("settings", v)) return;
    markSynced("settings", v);
    supabase.from("platform_settings").update({ pro_price: proPrice, commission }).eq("id", 1).then(({ error }) => {
      if (error) console.error(error);
    });
  }, [proPrice, commission, hydrated]);

  function publishListing(listing) {
    setListings((prev) => [listing, ...prev]);
  }

  function removeListing(id) {
    setListings((prev) => prev.filter((l) => l.id !== id));
    setPhotos((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    supabase.from("listings").delete().eq("id", id).then(({ error }) => { if (error) console.error(error); });
    supabase.from("photos").delete().eq("dish_id", id).then(({ error }) => { if (error) console.error(error); });
  }

  function placeOrder(details) {
    const { commission: commissionAmount, net: netAmount } = computeCommission(
      details.items,
      dishes,
      listings,
      profile,
      commission
    );
    const order = {
      id: `UD-${1000 + orders.length + 43}`,
      date: "Hozir",
      createdAt: Date.now(),
      status: "Tayyorlanmoqda",
      commissionAmount,
      netAmount,
      ...details,
    };
    setOrders((prev) => [order, ...prev]);
    setMyOrderIds((prev) => [order.id, ...prev]);
    prevStatusRef.current[order.id] = order.status;
    pushNotification("Buyurtma qabul qilindi", `${order.id} — tayyorlanmoqda`);
    setCart({});
    setCustomerPage("buyurtmalar");
  }

  function setPhoto(cookId, dataUrl) {
    setPhotos((prev) => ({ ...prev, [cookId]: dataUrl }));
  }

  function addReview(cookId, review) {
    setReviews((prev) => ({ ...prev, [cookId]: [{ ...review, own: true }, ...(prev[cookId] || [])] }));
    const ownDish = listings.find((l) => l.id === cookId);
    if (ownDish) {
      pushNotification("Yangi sharh", `"${ownDish.dish}" taomingizga ${review.rating}★ sharh qoldirildi`);
    }
  }

  function sendMessage(dishId, text) {
    if (!text.trim()) return;
    const msg = { id: Date.now(), sender: "me", text: text.trim(), createdAt: Date.now() };
    setMessages((prev) => ({ ...prev, [dishId]: [...(prev[dishId] || []), msg] }));
  }

  function toggleFavorite(dishId) {
    setFavorites((prev) => (prev.includes(dishId) ? prev.filter((id) => id !== dishId) : [...prev, dishId]));
  }

  function addAddress(addr) {
    setAddresses((prev) => [{ id: Date.now(), isDefault: prev.length === 0, ...addr }, ...prev]);
  }

  function removeAddress(id) {
    setAddresses((prev) => {
      const next = prev.filter((a) => a.id !== id);
      if (next.length && !next.some((a) => a.isDefault)) next[0] = { ...next[0], isDefault: true };
      return next;
    });
  }

  function updateAddress(id, changes) {
    setAddresses((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a)));
  }

  function setDefaultAddress(id) {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  }

  function updateListing(id, changes) {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, ...changes } : l)));
  }

  function logoutProfile() {
    setProfile(null);
    setProfileOpen(false);
  }

  function toggleProDemo() {
    setProfile((p) => (p ? { ...p, pro: !p.pro } : p));
  }

  return (
    <div style={{ background: T.ivory, minHeight: "100%", fontFamily: "Work Sans, sans-serif" }}>
      <style>{FONTS}</style>

      <div className="flex items-center justify-between px-6 md:px-10 py-4" style={{ borderBottom: `1px solid ${T.line}`, background: T.ivory }}>
        <Logo />
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-full p-1" style={{ background: T.ivoryDeep }}>
            {[
              { k: "mijoz", label: t("navMijoz") },
              { k: "oshpazlar", label: t("navCooks") },
              { k: "oshpaz", label: t("navOshpaz") },
            ].map((tab) => (
              <button
                key={tab.k}
                onClick={() => setView(tab.k)}
                className="px-4 py-1.5 rounded-full text-[13.5px] transition-colors"
                style={{
                  background: view === tab.k ? T.cobalt : "transparent",
                  color: view === tab.k ? "#fff" : T.ink,
                  fontFamily: "Work Sans, sans-serif",
                  fontWeight: 600,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {profile?.email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && (
            <button
              onClick={() => (adminAuthed ? setView("admin") : setAdminLoginOpen(true))}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: view === "admin" ? T.cobalt : T.ivoryDeep }}
              title="Admin"
            >
              <Lock size={15} color={view === "admin" ? "#fff" : "#8A7F68"} />
            </button>
          )}
          <button
            onClick={() => {
              setNotifOpen(true);
              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 relative"
            style={{ background: T.ivoryDeep }}
          >
            <Bell size={15} color="#8A7F68" />
            {notifications.some((n) => !n.read) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: T.clay }} />
            )}
          </button>
          <button
            onClick={() => setProfileOpen(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden shrink-0"
            style={{ background: T.turquoiseLight, border: `1px solid ${T.line}` }}
          >
            {profile?.avatar ? (
              <img src={profile.avatar} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              <UserCircle2 size={20} color={T.cobalt} />
            )}
          </button>
        </div>
      </div>

      {view === "mijoz" ? (
        <CustomerView
          cart={cart}
          setCart={setCart}
          onOpenCook={setOpenCook}
          orders={myOrders}
          page={customerPage}
          setPage={setCustomerPage}
          onStartCheckout={() => setCheckoutOpen(true)}
          photos={photos}
          dishes={dishesWithDistance}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          locationStatus={locationStatus}
          onRequestLocation={requestLocation}
          initialQuery={menuQuery}
          t={t}
        />
      ) : view === "oshpazlar" ? (
        <CooksListView
          dishes={dishes}
          photos={photos}
          onSelectCook={(name) => {
            setMenuQuery(name);
            setView("mijoz");
          }}
        />
      ) : view === "oshpaz" ? (
        <CookStudioView
          photos={photos}
          onSetPhoto={setPhoto}
          reviews={reviews}
          profile={profile}
          listings={listings}
          onPublish={publishListing}
          onRemoveListing={removeListing}
          onOpenProfile={() => setProfileOpen(true)}
          legalNoticeDismissed={legalNoticeDismissed}
          onDismissLegalNotice={() => setLegalNoticeDismissed(true)}
        />
      ) : view === "admin" && adminAuthed ? (
        <AdminView
          orders={orders}
          setOrders={setOrders}
          dishes={dishes}
          proPrice={proPrice}
          setProPrice={setProPrice}
          commission={commission}
          setCommission={setCommission}
          onLogout={() => {
            setAdminAuthed(false);
            setView("mijoz");
          }}
        />
      ) : (
        <CustomerView
          cart={cart}
          setCart={setCart}
          onOpenCook={setOpenCook}
          orders={myOrders}
          page={customerPage}
          setPage={setCustomerPage}
          onStartCheckout={() => setCheckoutOpen(true)}
          photos={photos}
          dishes={dishesWithDistance}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          locationStatus={locationStatus}
          onRequestLocation={requestLocation}
          initialQuery={menuQuery}
          t={t}
        />
      )}

      <AdminLoginModal
        open={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onSuccess={() => {
          setAdminAuthed(true);
          setAdminLoginOpen(false);
          setView("admin");
        }}
      />

      <CookModal
        cook={openCook}
        cart={cart}
        setCart={setCart}
        onClose={() => setOpenCook(null)}
        photo={openCook ? photos[openCook.id] : null}
        reviews={openCook ? reviews[openCook.id] : []}
        onAddReview={addReview}
        onMessage={(dish) => {
          setOpenCook(null);
          setMessageDish(dish);
        }}
      />
      <MessageThreadModal
        open={!!messageDish}
        dish={messageDish}
        thread={messageDish ? messages[messageDish.id] : []}
        onClose={() => setMessageDish(null)}
        onSend={(text) => sendMessage(messageDish.id, text)}
      />
      <CheckoutModal open={checkoutOpen} cart={cart} onClose={() => setCheckoutOpen(false)} onConfirm={placeOrder} profile={profile} dishes={dishes} addresses={addresses} />
      <NotificationToast notif={toast} onOpen={() => { setToast(null); setNotifOpen(true); }} />
      <NotificationsPanel
        open={notifOpen}
        notifications={notifications}
        onClose={() => setNotifOpen(false)}
        onClear={() => setNotifications([])}
      />

      <ProfileModal
        open={profileOpen}
        profile={profile}
        onClose={() => setProfileOpen(false)}
        onSave={setProfile}
        orderCount={orders.length}
        dishes={dishesWithDistance}
        photos={photos}
        onSetPhoto={setPhoto}
        listings={listings}
        onPublish={publishListing}
        onRemoveListing={removeListing}
        onUpdateListing={updateListing}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onOpenCook={setOpenCook}
        addresses={addresses}
        onAddAddress={addAddress}
        onRemoveAddress={removeAddress}
        onUpdateAddress={updateAddress}
        onSetDefaultAddress={setDefaultAddress}
        reviews={reviews}
        orders={myOrders}
        proPrice={proPrice}
        commission={commission}
        onToggleProDemo={toggleProDemo}
        language={language}
        onSetLanguage={setLanguage}
        t={t}
        messages={messages}
        onOpenMessageThread={setMessageDish}
        onLogout={logoutProfile}
      />
    </div>

  );
}
