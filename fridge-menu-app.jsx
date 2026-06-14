const { useState, useEffect } = React;

// ── 내장 음식 사진 (base64, 48종) — 설정 없이 바로 표시 ──────────────


// ── 카테고리별 수량 단위 정의 ─────────────────────────────────────────
const QUANTITY_BY_CATEGORY = {
  채소: ["1/4개", "1/2개", "1개", "2개", "3개", "100g", "200g", "300g", "한 줌", "넉넉히"],
  과일: ["1/4개", "1/2개", "1개", "2개", "3개", "5개", "한 줌", "넉넉히"],
  육류: ["100g", "150g", "200g", "300g", "400g", "500g", "1팩", "넉넉히"],
  해산물: ["100g", "150g", "200g", "300g", "1마리", "2마리", "1봉지", "넉넉히"],
  유제품: {
    달걀: ["1개", "2개", "3개", "4개", "5개", "6개", "10개"],
    우유: ["100ml", "200ml", "300ml", "500ml", "1L"],
    치즈: ["1장", "2장", "3장", "50g", "100g"],
    버터: ["10g", "20g", "30g", "50g", "100g"],
    요거트: ["100g", "200g", "1개", "2개"],
    두부: ["1/4모", "1/2모", "1모", "2모"],
  },
  곡류: {
    쌀: ["1공기", "2공기", "3공기", "1컵", "2컵", "500g"],
    파스타면: ["100g", "150g", "200g", "300g", "500g"],
    라면: ["1봉", "2봉", "3봉"],
    밀가루: ["50g", "100g", "200g", "300g", "500g"],
    빵: ["1쪽", "2쪽", "4쪽", "1개", "2개"],
    떡: ["100g", "200g", "300g", "1봉지"],
    당면: ["50g", "100g", "200g"],
  },
};

const INGREDIENT_CATEGORIES = {
  채소: {
    emoji: "🥬", color: "#4ade80",
    items: [
      { name: "양파", emoji: "🧅" }, { name: "마늘", emoji: "🧄" }, { name: "대파", emoji: "🌿" },
      { name: "당근", emoji: "🥕" }, { name: "감자", emoji: "🥔" }, { name: "고추", emoji: "🌶️" },
      { name: "애호박", emoji: "🫑" }, { name: "시금치", emoji: "🥬" }, { name: "버섯", emoji: "🍄" },
      { name: "브로콜리", emoji: "🥦" }, { name: "배추", emoji: "🥬" }, { name: "깻잎", emoji: "🌿" },
      { name: "콩나물", emoji: "🌱" }, { name: "숙주", emoji: "🌱" },
    ],
  },
  과일: {
    emoji: "🍎", color: "#f87171",
    items: [
      { name: "사과", emoji: "🍎" }, { name: "바나나", emoji: "🍌" }, { name: "레몬", emoji: "🍋" },
      { name: "토마토", emoji: "🍅" }, { name: "딸기", emoji: "🍓" }, { name: "포도", emoji: "🍇" },
      { name: "복숭아", emoji: "🍑" }, { name: "귤", emoji: "🍊" },
    ],
  },
  육류: {
    emoji: "🥩", color: "#fb923c",
    items: [
      { name: "돼지고기", emoji: "🥩" }, { name: "소고기", emoji: "🥩" }, { name: "닭고기", emoji: "🍗" },
      { name: "삼겹살", emoji: "🥓" }, { name: "다진육", emoji: "🫙" }, { name: "베이컨", emoji: "🥓" },
      { name: "소시지", emoji: "🌭" }, { name: "참치캔", emoji: "🐟" },
    ],
  },
  해산물: {
    emoji: "🦐", color: "#38bdf8",
    items: [
      { name: "새우", emoji: "🦐" }, { name: "오징어", emoji: "🦑" }, { name: "조개", emoji: "🐚" },
      { name: "꽃게", emoji: "🦀" }, { name: "고등어", emoji: "🐟" }, { name: "연어", emoji: "🐠" },
      { name: "멸치", emoji: "🐟" },
    ],
  },
  유제품: {
    emoji: "🥚", color: "#facc15",
    items: [
      { name: "달걀", emoji: "🥚" }, { name: "우유", emoji: "🥛" }, { name: "치즈", emoji: "🧀" },
      { name: "버터", emoji: "🧈" }, { name: "요거트", emoji: "🍶" }, { name: "두부", emoji: "⬜" },
    ],
  },
  곡류: {
    emoji: "🌾", color: "#a78bfa",
    items: [
      { name: "쌀", emoji: "🍚" }, { name: "파스타면", emoji: "🍝" }, { name: "라면", emoji: "🍜" },
      { name: "밀가루", emoji: "🌾" }, { name: "빵", emoji: "🍞" }, { name: "떡", emoji: "🍡" },
      { name: "당면", emoji: "🫙" },
    ],
  },
};

function getQuantityOptions(categoryName, itemName) {
  const GENERIC = ["조금", "1개", "2개", "100g", "200g", "한 줌", "적당히", "넉넉히"];
  const catData = QUANTITY_BY_CATEGORY[categoryName];
  if (!catData) return GENERIC;
  if (typeof catData === "object" && !Array.isArray(catData)) {
    return catData[itemName] || GENERIC;
  }
  return catData;
}

const CUISINE_LABELS = { 한식: "🍚", 양식: "🍝", 중식: "🥢", 일식: "🍱", 기타: "🥗", 상관없음: "🌏" };

// ── Supabase Storage 음식 사진 설정 ───────────────────────────────────
// 200개 메뉴 사진은 Supabase Storage에 보관합니다 (코드에 내장하지 않음 → 앱이 가벼움).
// 아래 SUPABASE_URL 을 본인 프로젝트 URL로 채우면 사진이 표시됩니다.
//   - 버킷: menu-photos (Public)
//   - 파일명: 메뉴이름.jpg (예: 된장찌개.jpg)
// 사진이 없는 메뉴는 자동으로 SVG 일러스트로 표시됩니다.
const SUPABASE_URL = "https://fnldhhsisvxrhurqetjw.supabase.co";
const PHOTO_BUCKET = "menu-photos";

function menuPhotoUrl(name) {
  if (!SUPABASE_URL) return null;
  const bytes = new TextEncoder().encode(name.trim());
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
  return `${SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/${hex}.jpg`;
}

// ── 쿠팡 링크 생성 (평점높음·후기많음·저가순 정렬) ──────────────────────
// rocket=on(로켓배송), sorter=saleCountDesc(판매량순=후기·인기 반영) + 평점 필터
function coupangUrl(name) {
  const q = encodeURIComponent(name);
  // 판매량 많은 순 = 후기 많고 검증된 가성비 상품이 상위 노출
  return `https://www.coupang.com/np/search?q=${q}&channel=user&sorter=saleCountDesc&rating=4&isPriceRange=false`;
}

// ── 음식 종류별 손그림풍 SVG 일러스트 (네트워크 불필요) ──────────────────
function getFoodType(name) {
  if (/(떡볶이|떡뽁이|떡뻑이)/.test(name)) return "tteok";
  if (/된장/.test(name)) return "doenjang";
  if (/김치찌개/.test(name)) return "kimchistew";
  if (/마파/.test(name)) return "mapo";
  if (/닭/.test(name)) return "chicken";
  if (/(찌개|전골)/.test(name)) return "stew";
  if (/(탕|국)/.test(name)) return "soup";
  if (/(볶음밥|덮밥|비빔밥|볶음 밥)/.test(name)) return "fried";
  if (/(주먹밥|삼각김밥)/.test(name)) return "ball";
  if (/(파스타|스파게티)/.test(name)) return "pasta";
  if (/(면|국수|라면)/.test(name)) return "noodle";
  if (/(스테이크|불고기|제육|삼겹|고기)/.test(name)) return "meat";
  if (/새우/.test(name)) return "shrimp";
  if (/(오징어|조개|게|생선|고등어|연어|해산물)/.test(name)) return "fish";
  if (/(계란|달걀)/.test(name)) return "egg";
  if (/샐러드/.test(name)) return "salad";
  if (/(조림|무침|나물|볶음|반찬)/.test(name)) return "side";
  return "rice";
}

// 결정적 의사난수 (메뉴별 일관된 배치)
function seeded(name) {
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  let s = Math.abs(h) || 1;
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
}

// 떨리는 닫힌 곡선 path 생성 (손그림 느낌)
function wobblePath(cx, cy, rx, ry, rnd, jitter = 2.0, n = 16) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 6.283;
    pts.push([cx + Math.cos(a) * rx + (rnd() - 0.5) * jitter, cy + Math.sin(a) * ry + (rnd() - 0.5) * jitter]);
  }
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)} `;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    for (const t of [0.5, 1.0]) {
      const t2 = t * t, t3 = t2 * t;
      const x = 0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const y = 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      d += `L${x.toFixed(1)},${y.toFixed(1)} `;
    }
  }
  return d + "Z";
}

const INK = "#3a3026";       // 따뜻한 먹색 외곽선

// 음식별 손그림 SVG
function FoodArt({ name }) {
  const type = getFoodType(name);
  const rnd = seeded(name);
  const clipId = "clip-" + Math.abs([...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) & 0xffffffff, 0));

  const blob = (cx, cy, rx, ry, fill, sw = 2) =>
    `<path d="${wobblePath(cx, cy, rx, ry, rnd, 1.4, 12)}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" filter="url(#rough)"/>`;

  // 뚝배기를 쓰는 음식 (찌개·탕류)
  const isPot = ["doenjang", "kimchistew", "stew", "soup", "mapo", "chicken"].includes(type);
  const bowlPath = wobblePath(100, isPot ? 104 : 102, isPot ? 70 : 74, isPot ? 44 : 46, rnd, 2.0, 18);
  const clipPath = wobblePath(100, 99, isPot ? 58 : 62, isPot ? 34 : 38, rnd, 1.4, 16);

  let bowl = "";
  if (isPot) {
    bowl = `<path d="${bowlPath}" fill="#7a5238" stroke="${INK}" stroke-width="3" filter="url(#rough)"/>`
         + `<path d="${wobblePath(100, 100, 62, 37, rnd, 1.6, 16)}" fill="#5e3e29"/>`;
  } else {
    bowl = `<path d="${bowlPath}" fill="#fdfaf0" stroke="${INK}" stroke-width="2.6" filter="url(#rough)"/>`
         + `<path d="${wobblePath(100, 100, 60, 36, rnd, 1.4, 16)}" fill="#f5efe0"/>`;
  }

  let inner = "";

  if (type === "doenjang") {
    inner += `<path d="${wobblePath(100, 99, 56, 33, rnd, 1.4)}" fill="#a87332"/>`;
    inner += `<path d="${wobblePath(100, 98, 50, 28, rnd, 1.2)}" fill="#b9843e" opacity="0.6"/>`;
    for (const [x, y] of [[80, 92], [108, 88], [94, 106]]) inner += `<rect x="${x}" y="${y}" width="20" height="16" rx="2" fill="#fdfbf2" stroke="${INK}" stroke-width="2" filter="url(#rough)"/>`;
    for (const [x, y] of [[122, 98], [74, 108]]) { inner += `<path d="M${x},${y} a10,10 0 0,1 20,0 Z" fill="#9ac46a" stroke="${INK}" stroke-width="1.8" filter="url(#rough)"/>`; inner += `<circle cx="${x + 10}" cy="${y - 2}" r="2" fill="#dfeec2"/>`; }
    inner += blob(118, 114, 9, 6, "#6e4a30");
    for (let i = 0; i < 10; i++) inner += `<circle cx="${(72 + rnd() * 56).toFixed(0)}" cy="${(82 + rnd() * 34).toFixed(0)}" r="1.6" fill="#c0392b"/>`;
    for (let i = 0; i < 5; i++) inner += `<circle cx="${(78 + rnd() * 44).toFixed(0)}" cy="${(82 + rnd() * 30).toFixed(0)}" r="2.4" fill="#4e9b3c"/>`;
  } else if (type === "kimchistew") {
    inner += `<path d="${wobblePath(100, 99, 56, 33, rnd, 1.4)}" fill="#c0341c"/>`;
    for (const [x, y] of [[82, 90], [110, 86], [96, 104], [120, 100]]) inner += `<g transform="rotate(${(rnd() * 60 - 30).toFixed(0)} ${x} ${y})"><rect x="${x - 9}" y="${y - 5}" width="20" height="10" rx="3" fill="#d14524" stroke="${INK}" stroke-width="1.6" filter="url(#rough)"/></g>`;
    for (const [x, y] of [[74, 104], [126, 94]]) inner += `<rect x="${x}" y="${y}" width="16" height="13" rx="2" fill="#fdfbf2" stroke="${INK}" stroke-width="1.8"/>`;
    for (let i = 0; i < 5; i++) inner += `<circle cx="${(80 + rnd() * 42).toFixed(0)}" cy="${(84 + rnd() * 28).toFixed(0)}" r="2.2" fill="#4e9b3c"/>`;
  } else if (type === "mapo") {
    inner += `<path d="${wobblePath(100, 99, 56, 33, rnd, 1.4)}" fill="#cf3c20"/>`;
    for (const [x, y] of [[80, 90], [106, 86], [94, 104], [116, 98]]) inner += `<rect x="${x}" y="${y}" width="15" height="13" rx="2" fill="#fcf2dd" stroke="${INK}" stroke-width="1.6" filter="url(#rough)"/>`;
    for (let i = 0; i < 12; i++) inner += `<circle cx="${(74 + rnd() * 54).toFixed(0)}" cy="${(82 + rnd() * 32).toFixed(0)}" r="1.8" fill="#7a1a0c"/>`;
    for (let i = 0; i < 5; i++) inner += `<circle cx="${(80 + rnd() * 42).toFixed(0)}" cy="${(84 + rnd() * 26).toFixed(0)}" r="2.2" fill="#4e9b3c"/>`;
  } else if (type === "chicken") {
    inner += `<path d="${wobblePath(100, 99, 56, 33, rnd, 1.4)}" fill="#c33a16"/>`;
    // 닭다리(드럼스틱): 통통한 살 + 뼈 손잡이
    for (const [x, y, rot] of [[84, 92, -22], [110, 100, 18]]) {
      inner += `<g transform="rotate(${rot} ${x} ${y})">`
        + `<path d="${wobblePath(x, y, 15, 12, rnd, 1.2, 12)}" fill="#b56a3c" stroke="${INK}" stroke-width="2" filter="url(#rough)"/>`
        + `<path d="${wobblePath(x, y, 11, 9, rnd, 1.0, 10)}" fill="#c47c48" opacity="0.7"/>`
        + `<rect x="${x + 11}" y="${y - 3.5}" width="15" height="7" rx="3.5" fill="#efe3cc" stroke="${INK}" stroke-width="1.6"/>`
        + `<circle cx="${x + 26}" cy="${y}" r="4" fill="#efe3cc" stroke="${INK}" stroke-width="1.6"/>`
        + `</g>`;
    }
    for (const [x, y] of [[96, 110], [120, 88]]) inner += blob(x, y, 10, 8, "#e3c878");
    inner += blob(74, 106, 7, 5, "#e0792e");
    for (let i = 0; i < 4; i++) inner += `<circle cx="${(82 + rnd() * 40).toFixed(0)}" cy="${(82 + rnd() * 22).toFixed(0)}" r="2.4" fill="#4e9b3c"/>`;
  } else if (type === "stew" || type === "soup") {
    inner += `<path d="${wobblePath(100, 99, 56, 33, rnd, 1.4)}" fill="#b5481f"/>`;
    for (const [x, y] of [[82, 90], [108, 88], [96, 106]]) inner += blob(x, y, 11, 8, "#e8c98f");
    for (let i = 0; i < 6; i++) inner += `<circle cx="${(78 + rnd() * 44).toFixed(0)}" cy="${(84 + rnd() * 26).toFixed(0)}" r="2.4" fill="#4e9b3c"/>`;
  } else if (type === "tteok") {
    inner += `<path d="${wobblePath(100, 99, 56, 33, rnd, 1.4)}" fill="#e0481f"/>`;
    for (const [x, y, w] of [[70, 88, 22], [96, 80, 24], [120, 90, 20], [80, 108, 20], [112, 108, 22], [130, 98, 18]]) inner += `<g transform="rotate(${(rnd() * 50 - 25).toFixed(0)} ${x + w / 2} ${y + 6})"><rect x="${x}" y="${y}" width="${w}" height="14" rx="7" fill="#fdf3e4" stroke="${INK}" stroke-width="2" filter="url(#rough)"/></g>`;
    for (const [x, y] of [[64, 82], [136, 84]]) inner += `<path d="M${x},${y} l8,-6 l6,8 Z" fill="#f2d79c" stroke="${INK}" stroke-width="1.6"/>`;
    for (let i = 0; i < 7; i++) inner += `<path d="M${(86 + rnd() * 30).toFixed(0)},${(76 + rnd() * 14).toFixed(0)} l9,-3" stroke="#4e9b3c" stroke-width="2.6" stroke-linecap="round"/>`;
  } else if (type === "fried" || type === "rice") {
    inner += `<path d="${wobblePath(100, 98, 54, 32, rnd, 1.4)}" fill="${type === "fried" ? "#ecae57" : "#fbf4e2"}"/>`;
    const cols = type === "fried" ? ["#f0c474", "#dd8a2e", "#6f9a36", "#c0392b", "#3a2a1a"] : ["#fdfaf0", "#efe7d2", "#dccdb0"];
    for (let i = 0; i < 75; i++) { const a = rnd() * 6.28, r = rnd() * 48, x = 100 + Math.cos(a) * r, y = 96 + Math.sin(a) * r * 0.58; inner += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(1.6 + rnd() * 1.1).toFixed(1)}" ry="1.1" fill="${cols[(rnd() * cols.length) | 0]}" transform="rotate(${(rnd() * 180) | 0} ${x.toFixed(0)} ${y.toFixed(0)})"/>`; }
    if (type === "fried") inner += blob(98, 88, 18, 11, "#e6cda8");
  } else if (type === "ball") {
    for (const [x, y] of [[74, 100], [102, 108], [128, 98]]) {
      inner += `<path d="${wobblePath(x, y, 21, 20, rnd, 1.8, 14)}" fill="#fdfaef" stroke="${INK}" stroke-width="2" filter="url(#rough)"/>`;
      inner += `<rect x="${x - 16}" y="${y + 6}" width="32" height="10" rx="2" fill="#2e3a2e" stroke="${INK}" stroke-width="1.4"/>`;
      for (let j = 0; j < 10; j++) { const a = rnd() * 6.28, rr = rnd() * 15; inner += `<ellipse cx="${(x + Math.cos(a) * rr).toFixed(0)}" cy="${(y + Math.sin(a) * rr - 3).toFixed(0)}" rx="1.8" ry="1.1" fill="${["#dd8a2e", "#4e9b3c", "#cf6a3c"][(rnd() * 3) | 0]}"/>`; }
    }
  } else if (type === "pasta" || type === "noodle") {
    inner += `<path d="${wobblePath(100, 98, 54, 32, rnd, 1.4)}" fill="${type === "noodle" ? "#d8641f" : "#d94a2a"}" opacity="0.85"/>`;
    for (let i = 0; i < 16; i++) { const x = 64 + i * 5; inner += `<path d="M${x},80 q${(8 + rnd() * 8).toFixed(0)},${(20 + rnd() * 12).toFixed(0)} -3,36" stroke="${type === "pasta" ? "#eec24e" : "#f0cd6a"}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`; }
    if (type === "pasta") { for (const [x, y] of [[88, 92], [112, 96]]) inner += blob(x, y, 6, 5, "#c0392b"); inner += blob(100, 86, 5, 4, "#5fa849"); }
    else inner += `<path d="${wobblePath(118, 90, 12, 12, rnd, 1.2, 12)}" fill="#ffd24a" stroke="${INK}" stroke-width="1.8"/>`;
  } else if (type === "meat") {
    inner += `<path d="${wobblePath(100, 98, 54, 32, rnd, 1.4)}" fill="#fbf4e2"/>`;
    for (const [x, y] of [[80, 90], [106, 84], [120, 98], [90, 106], [112, 108]]) { inner += `<g transform="rotate(${(rnd() * 40 - 20).toFixed(0)} ${x} ${y})"><path d="${wobblePath(x, y, 15, 10, rnd, 1.4, 10)}" fill="#9c4a28" stroke="${INK}" stroke-width="1.8" filter="url(#rough)"/></g>`; inner += `<path d="M${x - 8},${y - 2} q8,-3 16,0" stroke="#6e2f18" stroke-width="1.6" fill="none"/>`; }
    for (let i = 0; i < 5; i++) inner += `<circle cx="${(80 + rnd() * 40).toFixed(0)}" cy="${(84 + rnd() * 22).toFixed(0)}" r="2.4" fill="#4e9b3c"/>`;
  } else if (type === "shrimp") {
    inner += `<path d="${wobblePath(100, 98, 54, 32, rnd, 1.4)}" fill="#fdf3e9"/>`;
    for (const [x, y] of [[82, 90], [108, 86], [120, 100], [92, 106]]) { inner += `<g transform="rotate(${(rnd() * 60 - 30).toFixed(0)} ${x} ${y})"><path d="M${x},${y} q-12,-12 1,-18 q14,-4 16,8 q10,4 0,12 q-8,9 -17,-2 Z" fill="#f08a52" stroke="${INK}" stroke-width="1.8" filter="url(#rough)"/></g>`; inner += `<circle cx="${x - 6}" cy="${y - 8}" r="1.4" fill="${INK}"/>`; }
  } else if (type === "fish") {
    inner += `<path d="${wobblePath(100, 98, 54, 32, rnd, 1.4)}" fill="#fdf3e9"/>`;
    inner += `<path d="M64,98 q30,-22 64,0 q-30,22 -64,0 Z" fill="#b6c2cc" stroke="${INK}" stroke-width="2" filter="url(#rough)"/>`;
    inner += `<path d="M128,98 l14,-9 l0,18 Z" fill="#b6c2cc" stroke="${INK}" stroke-width="2"/>`;
    inner += `<circle cx="76" cy="94" r="2.4" fill="${INK}"/>`;
  } else if (type === "egg") {
    inner += `<path d="${wobblePath(100, 98, 54, 32, rnd, 1.4)}" fill="#ecae57"/>`;
    for (let i = 0; i < 60; i++) { const a = rnd() * 6.28, r = rnd() * 46, x = 100 + Math.cos(a) * r, y = 96 + Math.sin(a) * r * 0.56; inner += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="1.6" ry="1.1" fill="${["#f0c474", "#fff7e6", "#6f9a36"][(rnd() * 3) | 0]}"/>`; }
    inner += blob(98, 90, 16, 11, "#fff2d0");
    inner += `<circle cx="98" cy="89" r="7" fill="#ffd24a" stroke="${INK}" stroke-width="1.4"/>`;
  } else if (type === "salad") {
    inner += `<path d="${wobblePath(100, 98, 56, 33, rnd, 1.4)}" fill="#fdfaf0"/>`;
    for (let i = 0; i < 20; i++) { const a = rnd() * 6.28, r = rnd() * 46, x = 100 + Math.cos(a) * r, y = 96 + Math.sin(a) * r * 0.56; inner += blob(x, y, 6 + rnd() * 3, 4 + rnd() * 2, ["#5aa83c", "#3f8a2c", "#9ccc5c", "#d8402c", "#e08a2e"][(rnd() * 5) | 0]); }
    for (const [x, y] of [[86, 92], [114, 100]]) inner += `<circle cx="${x}" cy="${y}" r="6" fill="#d8402c" stroke="${INK}" stroke-width="1.6"/>`;
  } else { // side
    inner += `<path d="${wobblePath(100, 98, 54, 32, rnd, 1.4)}" fill="#fbf4e2"/>`;
    for (const [x, y] of [[82, 90], [106, 86], [118, 98], [92, 104]]) inner += `<g transform="rotate(${(rnd() * 30 - 15).toFixed(0)} ${x} ${y})"><rect x="${x - 9}" y="${y - 7}" width="18" height="15" rx="3" fill="#c47a2c" stroke="${INK}" stroke-width="1.6" filter="url(#rough)"/></g>`;
    for (let i = 0; i < 5; i++) inner += `<circle cx="${(80 + rnd() * 40).toFixed(0)}" cy="${(84 + rnd() * 20).toFixed(0)}" r="2.2" fill="#4e9b3c"/>`;
  }

  return (
    <svg viewBox="0 0 200 170" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
      <defs>
        <filter id="rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" />
        </filter>
        <clipPath id={clipId}><path d={clipPath} /></clipPath>
      </defs>
      <path d="M84,52 q-8,-13 0,-23 q7,-9 1,-19" fill="none" stroke="#c7b29a" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
      <path d="M116,52 q8,-13 0,-23 q-7,-9 -1,-19" fill="none" stroke="#c7b29a" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
      <g dangerouslySetInnerHTML={{ __html: bowl }} />
      <g clipPath={`url(#${clipId})`} dangerouslySetInnerHTML={{ __html: inner }} />
    </svg>
  );
}

// 음식 일러스트 컴포넌트 (종이 질감 배경 + 손그림풍)
function FoodImage({ name, height = 200, radius = "0" }) {
  const photoUrl = menuPhotoUrl(name);
  const [photoOk, setPhotoOk] = useState(!!photoUrl);

  // 메뉴가 바뀌면 사진 로딩 상태 초기화
  useEffect(() => { setPhotoOk(!!photoUrl); }, [photoUrl]);

  let hash = 0;
  for (let c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  const hue = Math.abs(hash) % 14;
  const bg1 = `hsl(${42 + hue}, 48%, 92%)`;
  const bg2 = `hsl(${36 + hue}, 42%, 85%)`;

  // Supabase 사진이 있으면 사진 우선, 로딩 실패 시 SVG로 폴백
  if (photoUrl && photoOk) {
    return (
      <div style={{ width: "100%", height, borderRadius: radius, overflow: "hidden", background: "#f3f4f6" }}>
        <img
          src={photoUrl}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={() => setPhotoOk(false)}
        />
      </div>
    );
  }

  return (
    <div style={{
      width: "100%", height, borderRadius: radius, overflow: "hidden",
      background: `radial-gradient(circle at 42% 36%, ${bg1}, ${bg2})`,
      position: "relative",
    }}>
      {/* 종이 질감 점 */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.5,
        backgroundImage: "radial-gradient(rgba(150,125,90,0.16) 1px, transparent 1px)",
        backgroundSize: "6px 6px",
      }} />
      <FoodArt name={name} />
    </div>
  );
}

// 네이버 레시피 검색 URL (블로그/View 탭)
function naverRecipeUrl(name) {
  const q = encodeURIComponent(name + " 레시피 만드는법");
  return `https://search.naver.com/search.naver?ssc=tab.blog.all&query=${q}`;
}

// 외부 링크 열기 (웹뷰에서 새창이 막히면 같은 탭으로 폴백)
function openExternal(url) {
  try {
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w || w.closed || typeof w.closed === "undefined") {
      window.location.href = url; // 새 창 차단 시 현재 탭 이동
    }
  } catch (e) {
    window.location.href = url;
  }
}

// 단계별 일러스트용 이모지 (조리 동작 키워드 매칭)
function stepEmoji(text) {
  const map = [
    ["끓", "🔥"], ["볶", "🍳"], ["썰", "🔪"], ["다진", "🔪"], ["넣", "🥄"],
    ["풀", "🥄"], ["섞", "🥣"], ["프라이", "🍳"], ["굽", "🔥"], ["올리", "🍽"],
    ["간", "🧂"], ["완성", "✅"], ["데치", "♨️"], ["물", "💧"], ["튀", "🍤"],
  ];
  for (const [k, e] of map) if (text.includes(k)) return e;
  return "🥢";
}

// ── 내장 레시피 DB (200종, API 실패 시 폴백) ───────────────────────────
const RECIPE_DB = [
  { name: "김치볶음밥", category: "한식", cook_time: "15분", difficulty: "쉬움", description: "김치 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["김치","밥","대파","달걀"], missing: ["김치","참기름"], steps: ["팬에 기름을 두르고 송송 썬 대파로 파기름을 낸다.","잘게 썬 김치를 넣고 노릇하게 볶는다.","밥을 넣고 김치와 고루 섞어 볶는다.","참기름과 깨소금으로 마무리한다.","달걀 프라이를 올려 완성."] },
  { name: "된장찌개", category: "한식", cook_time: "20분", difficulty: "쉬움", description: "된장 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["된장","두부","애호박","양파","대파"], missing: ["된장","두부"], steps: ["냄비에 물 500ml와 멸치·다시마로 육수를 낸다.","된장 2큰술을 푼다.","애호박·양파·두부를 썰어 넣는다.","마늘·대파를 넣고 5분 끓인다.","간을 보고 완성."] },
  { name: "김치찌개", category: "한식", cook_time: "25분", difficulty: "쉬움", description: "김치 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["김치","돼지고기","두부","대파"], missing: ["김치","돼지고기"], steps: ["냄비에 돼지고기를 볶는다.","익은 김치를 넣고 함께 볶는다.","물을 붓고 끓인다.","두부와 대파를 넣는다.","10분 더 끓여 완성."] },
  { name: "닭볶음탕", category: "한식", cook_time: "40분", difficulty: "보통", description: "닭고기 들어간 정겨운 집밥 한 끼. 보통 난이도로 부담 없어요.", base: ["닭고기","감자","당근","양파","대파"], missing: ["고추장","닭고기"], steps: ["닭을 끓는 물에 데쳐 기름기를 뺀다.","고추장·간장·설탕으로 양념을 만든다.","냄비에 닭과 양념, 물을 넣고 끓인다.","감자와 당근을 넣고 익힌다.","대파를 넣어 마무리."] },
  { name: "제육볶음", category: "한식", cook_time: "20분", difficulty: "쉬움", description: "돼지고기 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["돼지고기","양파","대파","고추"], missing: ["돼지고기","고추장"], steps: ["고추장·고춧가루·간장으로 양념을 만든다.","돼지고기를 양념에 재운다.","팬에 고기를 볶는다.","양파와 대파를 넣는다.","센불에 볶아 완성."] },
  { name: "불고기", category: "한식", cook_time: "25분", difficulty: "보통", description: "소고기 들어간 정겨운 집밥 한 끼. 보통 난이도로 부담 없어요.", base: ["소고기","양파","당근","대파"], missing: ["소고기","간장"], steps: ["간장·설탕·배즙으로 양념장을 만든다.","소고기를 양념에 30분 재운다.","팬에 고기를 볶는다.","양파·당근을 넣는다.","대파를 올려 완성."] },
  { name: "비빔밥", category: "한식", cook_time: "20분", difficulty: "보통", description: "밥 들어간 정겨운 집밥 한 끼. 보통 난이도로 부담 없어요.", base: ["밥","당근","시금치","콩나물","달걀"], missing: ["고추장"], steps: ["각종 나물을 데쳐 무친다.","밥 위에 나물을 색색이 올린다.","달걀 프라이를 얹는다.","고추장과 참기름을 넣는다.","비벼서 완성."] },
  { name: "순두부찌개", category: "한식", cook_time: "20분", difficulty: "쉬움", description: "순두부 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["순두부","달걀","대파","고추"], missing: ["순두부","고춧가루"], steps: ["뚝배기에 고춧가루로 양념기름을 낸다.","물을 붓고 끓인다.","순두부를 넣는다.","달걀을 깨 넣는다.","대파를 올려 완성."] },
  { name: "계란말이", category: "한식", cook_time: "10분", difficulty: "쉬움", description: "달걀 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["달걀","당근","대파"], missing: ["달걀"], steps: ["달걀을 풀고 소금 간을 한다.","당근·대파를 잘게 다져 섞는다.","팬에 얇게 부친다.","돌돌 말아준다.","한입 크기로 썰어 완성."] },
  { name: "미역국", category: "한식", cook_time: "25분", difficulty: "쉬움", description: "미역 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["미역","소고기","마늘"], missing: ["미역","소고기"], steps: ["미역을 물에 불린다.","소고기를 참기름에 볶는다.","미역을 넣고 함께 볶는다.","물을 붓고 끓인다.","국간장으로 간해 완성."] },
  { name: "김치전", category: "한식", cook_time: "15분", difficulty: "쉬움", description: "김치 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["김치","밀가루","대파"], missing: ["김치","부침가루"], steps: ["김치를 잘게 썬다.","밀가루·물·김치국물을 섞는다.","김치를 넣어 반죽한다.","팬에 부친다.","노릇하게 뒤집어 완성."] },
  { name: "떡볶이", category: "한식", cook_time: "20분", difficulty: "쉬움", description: "떡 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["떡","어묵","대파","고추"], missing: ["떡","고추장"], steps: ["물에 고추장·고춧가루·설탕을 푼다.","떡과 어묵을 넣고 끓인다.","양념이 졸아들 때까지 끓인다.","대파를 넣는다.","걸쭉해지면 완성."] },
  { name: "잡채", category: "한식", cook_time: "35분", difficulty: "보통", description: "당면 들어간 정겨운 집밥 한 끼. 보통 난이도로 부담 없어요.", base: ["당면","당근","시금치","양파","버섯"], missing: ["당면","간장"], steps: ["당면을 삶아 헹군다.","채소를 채 썰어 각각 볶는다.","당면을 간장·설탕에 볶는다.","모든 재료를 섞는다.","참기름·깨를 넣어 완성."] },
  { name: "콩나물국", category: "한식", cook_time: "15분", difficulty: "쉬움", description: "콩나물 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["콩나물","대파","마늘"], missing: ["콩나물"], steps: ["냄비에 물과 콩나물을 넣는다.","뚜껑을 덮고 끓인다.","마늘을 넣는다.","소금으로 간한다.","대파를 올려 완성."] },
  { name: "어묵볶음", category: "한식", cook_time: "15분", difficulty: "쉬움", description: "어묵 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["어묵","양파","당근","대파"], missing: ["어묵","간장"], steps: ["어묵을 먹기 좋게 썬다.","팬에 양파·당근을 볶는다.","어묵을 넣고 볶는다.","간장·설탕으로 양념한다.","대파를 넣어 완성."] },
  { name: "두부조림", category: "한식", cook_time: "20분", difficulty: "쉬움", description: "두부 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["두부","대파","고추"], missing: ["두부","간장"], steps: ["두부를 도톰하게 썬다.","팬에 노릇하게 굽는다.","간장·고춧가루 양념을 붓는다.","조린다.","대파를 올려 완성."] },
  { name: "멸치볶음", category: "한식", cook_time: "12분", difficulty: "쉬움", description: "멸치 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["멸치","고추","마늘"], missing: ["멸치"], steps: ["멸치를 마른 팬에 볶는다.","기름·간장·설탕을 넣는다.","조린다.","고추를 넣는다.","깨를 뿌려 완성."] },
  { name: "시금치나물", category: "한식", cook_time: "10분", difficulty: "쉬움", description: "시금치 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["시금치","마늘","대파"], missing: ["시금치"], steps: ["시금치를 데친다.","찬물에 헹궈 물기를 짠다.","마늘·참기름·소금으로 무친다.","깨를 뿌린다.","완성."] },
  { name: "감자조림", category: "한식", cook_time: "20분", difficulty: "쉬움", description: "감자 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["감자","양파","대파"], missing: ["간장"], steps: ["감자를 한입 크기로 썬다.","팬에 감자와 물을 넣고 끓인다.","간장·설탕 양념을 넣는다.","양파를 넣고 졸인다.","대파를 올려 완성."] },
  { name: "애호박전", category: "한식", cook_time: "15분", difficulty: "쉬움", description: "애호박 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["애호박","달걀","밀가루"], missing: ["애호박"], steps: ["애호박을 동그랗게 썬다.","소금을 뿌려 둔다.","밀가루·달걀물을 입힌다.","팬에 부친다.","노릇하게 완성."] },
  { name: "순대볶음", category: "한식", cook_time: "20분", difficulty: "보통", description: "순대 들어간 정겨운 집밥 한 끼. 보통 난이도로 부담 없어요.", base: ["순대","양배추","대파","고추"], missing: ["순대","고추장"], steps: ["순대를 먹기 좋게 썬다.","양배추를 썬다.","고추장 양념을 만든다.","함께 볶는다.","깻잎을 올려 완성."] },
  { name: "육개장", category: "한식", cook_time: "50분", difficulty: "어려움", description: "소고기 들어간 정겨운 집밥 한 끼. 어려움 난이도로 부담 없어요.", base: ["소고기","대파","고사리","숙주"], missing: ["소고기","고춧가루"], steps: ["소고기를 삶아 결대로 찢는다.","대파·고사리·숙주를 준비한다.","고춧가루 양념을 만든다.","육수에 재료를 넣고 끓인다.","푹 끓여 완성."] },
  { name: "부대찌개", category: "한식", cook_time: "30분", difficulty: "보통", description: "햄 들어간 정겨운 집밥 한 끼. 보통 난이도로 부담 없어요.", base: ["햄","소시지","김치","두부","라면"], missing: ["햄","소시지"], steps: ["햄·소시지를 썬다.","냄비에 김치와 함께 담는다.","육수를 붓고 끓인다.","두부·라면을 넣는다.","끓여 완성."] },
  { name: "갈비찜", category: "한식", cook_time: "60분", difficulty: "어려움", description: "소고기 들어간 정겨운 집밥 한 끼. 어려움 난이도로 부담 없어요.", base: ["소고기","감자","당근","대파"], missing: ["소고기갈비","간장"], steps: ["갈비를 데쳐 핏물을 뺀다.","간장 양념을 만든다.","갈비를 양념에 조린다.","감자·당근을 넣는다.","푹 익혀 완성."] },
  { name: "닭갈비", category: "한식", cook_time: "30분", difficulty: "보통", description: "닭고기 들어간 정겨운 집밥 한 끼. 보통 난이도로 부담 없어요.", base: ["닭고기","양배추","고구마","떡"], missing: ["닭고기","고추장"], steps: ["닭을 고추장 양념에 재운다.","팬에 채소와 함께 볶는다.","떡을 넣는다.","익을 때까지 볶는다.","깻잎을 올려 완성."] },
  { name: "오징어볶음", category: "한식", cook_time: "20분", difficulty: "보통", description: "오징어 들어간 정겨운 집밥 한 끼. 보통 난이도로 부담 없어요.", base: ["오징어","양파","당근","대파"], missing: ["오징어","고추장"], steps: ["오징어를 손질해 썬다.","고추장 양념을 만든다.","팬에 채소를 볶는다.","오징어를 넣고 센불에 볶는다.","완성."] },
  { name: "북엇국", category: "한식", cook_time: "20분", difficulty: "쉬움", description: "북어 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["북어","달걀","대파","두부"], missing: ["북어채"], steps: ["북어를 참기름에 볶는다.","물을 붓고 끓인다.","두부를 넣는다.","달걀을 풀어 넣는다.","대파로 마무리."] },
  { name: "열무비빔국수", category: "한식", cook_time: "15분", difficulty: "쉬움", description: "소면 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["소면","열무김치","고추장"], missing: ["소면","열무김치"], steps: ["소면을 삶아 헹군다.","고추장·식초·설탕으로 양념한다.","열무김치를 넣는다.","비빈다.","깨를 뿌려 완성."] },
  { name: "김밥", category: "한식", cook_time: "30분", difficulty: "보통", description: "밥 들어간 정겨운 집밥 한 끼. 보통 난이도로 부담 없어요.", base: ["밥","김","당근","시금치","달걀","단무지"], missing: ["김","단무지"], steps: ["밥에 참기름·소금을 섞는다.","속재료를 준비한다.","김 위에 밥을 편다.","속을 올려 만다.","썰어서 완성."] },
  { name: "된장국", category: "한식", cook_time: "15분", difficulty: "쉬움", description: "된장 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["된장","두부","대파","애호박"], missing: ["된장"], steps: ["멸치육수를 낸다.","된장을 푼다.","두부·애호박을 넣는다.","끓인다.","대파를 올려 완성."] },
  { name: "고등어조림", category: "한식", cook_time: "30분", difficulty: "보통", description: "고등어 들어간 정겨운 집밥 한 끼. 보통 난이도로 부담 없어요.", base: ["고등어","무","대파","고추"], missing: ["고등어","고춧가루"], steps: ["무를 깔고 고등어를 올린다.","간장·고춧가루 양념을 붓는다.","물을 넣고 조린다.","대파·고추를 넣는다.","조려서 완성."] },
  { name: "계란찜", category: "한식", cook_time: "15분", difficulty: "쉬움", description: "달걀 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["달걀","대파"], missing: ["달걀"], steps: ["달걀을 푼다.","물·소금을 섞는다.","뚝배기에 붓는다.","약불에 익힌다.","대파를 올려 완성."] },
  { name: "콩나물밥", category: "한식", cook_time: "25분", difficulty: "쉬움", description: "콩나물 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["콩나물","쌀","대파"], missing: ["콩나물"], steps: ["쌀을 씻어 안친다.","콩나물을 위에 올린다.","밥을 짓는다.","양념장을 만든다.","비벼서 완성."] },
  { name: "호박전", category: "한식", cook_time: "15분", difficulty: "쉬움", description: "애호박 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["애호박","밀가루","달걀"], missing: ["애호박"], steps: ["애호박을 썬다.","밀가루를 묻힌다.","달걀물을 입힌다.","팬에 부친다.","완성."] },
  { name: "김치찜", category: "한식", cook_time: "40분", difficulty: "보통", description: "김치 들어간 정겨운 집밥 한 끼. 보통 난이도로 부담 없어요.", base: ["김치","돼지고기","두부"], missing: ["묵은지","돼지고기"], steps: ["묵은지를 냄비에 깐다.","돼지고기를 올린다.","육수를 붓는다.","푹 끓인다.","두부를 곁들여 완성."] },
  { name: "동태찌개", category: "한식", cook_time: "30분", difficulty: "보통", description: "동태 들어간 정겨운 집밥 한 끼. 보통 난이도로 부담 없어요.", base: ["동태","무","두부","대파"], missing: ["동태","고춧가루"], steps: ["무를 깔고 육수를 낸다.","동태를 넣고 끓인다.","고춧가루 양념을 푼다.","두부·대파를 넣는다.","끓여 완성."] },
  { name: "제육덮밥", category: "한식", cook_time: "20분", difficulty: "쉬움", description: "돼지고기 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["돼지고기","양파","밥","대파"], missing: ["돼지고기","고추장"], steps: ["돼지고기를 고추장에 볶는다.","양파를 넣는다.","밥 위에 올린다.","대파를 뿌린다.","완성."] },
  { name: "된장비빔밥", category: "한식", cook_time: "20분", difficulty: "쉬움", description: "밥 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["밥","상추","된장","고추"], missing: ["강된장"], steps: ["강된장을 끓인다.","밥에 채소를 올린다.","강된장을 얹는다.","비빈다.","참기름을 둘러 완성."] },
  { name: "순두부백반", category: "한식", cook_time: "20분", difficulty: "쉬움", description: "순두부 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["순두부","달걀","대파"], missing: ["순두부"], steps: ["뚝배기에 순두부를 담는다.","육수를 붓는다.","끓인다.","달걀을 넣는다.","대파를 올려 완성."] },
  { name: "돼지고기김치찌개", category: "한식", cook_time: "30분", difficulty: "쉬움", description: "김치 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["김치","돼지고기","두부","대파"], missing: ["김치","돼지고기"], steps: ["돼지고기를 볶는다.","김치를 넣고 볶는다.","물을 붓고 끓인다.","두부를 넣는다.","대파로 마무리."] },
  { name: "소고기무국", category: "한식", cook_time: "30분", difficulty: "쉬움", description: "소고기 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["소고기","무","대파"], missing: ["소고기"], steps: ["소고기를 참기름에 볶는다.","무를 넣고 볶는다.","물을 붓고 끓인다.","국간장으로 간한다.","대파로 마무리."] },
  { name: "버섯전골", category: "한식", cook_time: "30분", difficulty: "보통", description: "버섯 들어간 정겨운 집밥 한 끼. 보통 난이도로 부담 없어요.", base: ["버섯","두부","배추","대파"], missing: ["모둠버섯"], steps: ["전골냄비에 채소를 담는다.","버섯을 올린다.","육수를 붓는다.","끓인다.","두부를 넣어 완성."] },
  { name: "코다리조림", category: "한식", cook_time: "35분", difficulty: "보통", description: "코다리 들어간 정겨운 집밥 한 끼. 보통 난이도로 부담 없어요.", base: ["코다리","무","대파","고추"], missing: ["코다리","고춧가루"], steps: ["코다리를 손질한다.","무를 깐다.","양념을 붓는다.","조린다.","대파를 올려 완성."] },
  { name: "뚝배기불고기", category: "한식", cook_time: "25분", difficulty: "보통", description: "소고기 들어간 정겨운 집밥 한 끼. 보통 난이도로 부담 없어요.", base: ["소고기","당면","양파","대파","버섯"], missing: ["소고기","간장"], steps: ["소고기를 양념에 재운다.","뚝배기에 채소와 담는다.","육수를 붓는다.","당면을 넣는다.","끓여 완성."] },
  { name: "두부김치", category: "한식", cook_time: "20분", difficulty: "쉬움", description: "두부 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["두부","김치","돼지고기","대파"], missing: ["김치","두부"], steps: ["두부를 데쳐 썬다.","김치와 돼지고기를 볶는다.","접시에 두부를 담는다.","볶은 김치를 올린다.","완성."] },
  { name: "애호박된장찌개", category: "한식", cook_time: "20분", difficulty: "쉬움", description: "애호박 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["애호박","된장","두부","양파"], missing: ["된장"], steps: ["육수를 낸다.","된장을 푼다.","애호박·양파를 넣는다.","두부를 넣는다.","끓여 완성."] },
  { name: "낙지볶음", category: "한식", cook_time: "25분", difficulty: "보통", description: "낙지 들어간 정겨운 집밥 한 끼. 보통 난이도로 부담 없어요.", base: ["낙지","양파","대파","고추"], missing: ["낙지","고추장"], steps: ["낙지를 손질한다.","고추장 양념을 만든다.","채소를 볶는다.","낙지를 넣고 센불에 볶는다.","완성."] },
  { name: "황태해장국", category: "한식", cook_time: "25분", difficulty: "쉬움", description: "황태 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["황태","달걀","대파","두부"], missing: ["황태채"], steps: ["황태를 참기름에 볶는다.","물을 붓고 끓인다.","두부를 넣는다.","달걀을 푼다.","대파로 마무리."] },
  { name: "오징어덮밥", category: "한식", cook_time: "20분", difficulty: "쉬움", description: "오징어 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["오징어","양파","밥","대파"], missing: ["오징어","고추장"], steps: ["오징어를 고추장에 볶는다.","양파를 넣는다.","밥 위에 올린다.","대파를 뿌린다.","완성."] },
  { name: "소불고기덮밥", category: "한식", cook_time: "20분", difficulty: "쉬움", description: "소고기 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["소고기","양파","밥","대파"], missing: ["소고기","간장"], steps: ["소고기를 양념에 볶는다.","양파를 넣는다.","밥에 올린다.","깨를 뿌린다.","완성."] },
  { name: "김치우동", category: "한식", cook_time: "15분", difficulty: "쉬움", description: "우동면 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["우동면","김치","대파","달걀"], missing: ["우동면","김치"], steps: ["육수를 끓인다.","우동면을 넣는다.","김치를 넣는다.","달걀을 푼다.","대파로 마무리."] },
  { name: "계란국", category: "한식", cook_time: "10분", difficulty: "쉬움", description: "달걀 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["달걀","대파","마늘"], missing: ["달걀"], steps: ["물을 끓인다.","국간장으로 간한다.","달걀을 풀어 넣는다.","대파를 넣는다.","완성."] },
  { name: "골뱅이무침", category: "한식", cook_time: "20분", difficulty: "쉬움", description: "골뱅이 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["골뱅이","양파","오이","대파"], missing: ["골뱅이","고추장"], steps: ["골뱅이를 썬다.","채소를 채 썬다.","고추장·식초 양념을 만든다.","무친다.","소면을 곁들여 완성."] },
  { name: "두부버섯전골", category: "한식", cook_time: "30분", difficulty: "보통", description: "두부 들어간 정겨운 집밥 한 끼. 보통 난이도로 부담 없어요.", base: ["두부","버섯","배추","대파"], missing: ["모둠버섯"], steps: ["냄비에 채소를 담는다.","두부·버섯을 올린다.","육수를 붓는다.","끓인다.","완성."] },
  { name: "애호박새우젓볶음", category: "한식", cook_time: "12분", difficulty: "쉬움", description: "애호박 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["애호박","새우젓","대파"], missing: ["애호박"], steps: ["애호박을 반달썰기 한다.","팬에 볶는다.","새우젓으로 간한다.","대파를 넣는다.","깨를 뿌려 완성."] },
  { name: "청국장", category: "한식", cook_time: "25분", difficulty: "보통", description: "청국장 들어간 정겨운 집밥 한 끼. 보통 난이도로 부담 없어요.", base: ["청국장","두부","김치","대파"], missing: ["청국장"], steps: ["육수를 낸다.","김치를 넣고 끓인다.","청국장을 푼다.","두부를 넣는다.","대파로 마무리."] },
  { name: "가지볶음", category: "한식", cook_time: "15분", difficulty: "쉬움", description: "가지 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["가지","대파","마늘","고추"], missing: ["가지"], steps: ["가지를 썬다.","팬에 볶는다.","간장·마늘로 양념한다.","대파를 넣는다.","완성."] },
  { name: "표고버섯볶음", category: "한식", cook_time: "15분", difficulty: "쉬움", description: "표고버섯 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["표고버섯","양파","대파"], missing: ["표고버섯"], steps: ["버섯을 썬다.","팬에 볶는다.","간장·참기름으로 양념한다.","대파를 넣는다.","완성."] },
  { name: "도토리묵무침", category: "한식", cook_time: "15분", difficulty: "쉬움", description: "도토리묵 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["도토리묵","상추","오이","대파"], missing: ["도토리묵"], steps: ["묵을 썬다.","채소를 썬다.","간장 양념을 만든다.","무친다.","깨를 뿌려 완성."] },
  { name: "김치볶음", category: "한식", cook_time: "12분", difficulty: "쉬움", description: "김치 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["김치","돼지고기","대파"], missing: ["김치"], steps: ["김치를 썬다.","팬에 돼지고기를 볶는다.","김치를 넣고 볶는다.","설탕·참기름을 넣는다.","대파로 마무리."] },
  { name: "된장지짐", category: "한식", cook_time: "20분", difficulty: "쉬움", description: "된장 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["된장","두부","애호박","고추"], missing: ["된장"], steps: ["뚝배기에 된장을 푼다.","두부·애호박을 넣는다.","자작하게 끓인다.","고추를 넣는다.","완성."] },
  { name: "소고기버섯죽", category: "한식", cook_time: "30분", difficulty: "쉬움", description: "소고기 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["소고기","버섯","쌀","당근"], missing: ["소고기"], steps: ["쌀을 불린다.","소고기·버섯을 볶는다.","물을 넉넉히 붓는다.","쌀을 넣고 끓인다.","소금으로 간해 완성."] },
  { name: "닭개장", category: "한식", cook_time: "45분", difficulty: "어려움", description: "닭고기 들어간 정겨운 집밥 한 끼. 어려움 난이도로 부담 없어요.", base: ["닭고기","대파","고사리","숙주"], missing: ["닭고기","고춧가루"], steps: ["닭을 삶아 살을 찢는다.","채소를 준비한다.","고춧가루 양념을 만든다.","육수에 넣고 끓인다.","푹 끓여 완성."] },
  { name: "매운돼지갈비찜", category: "한식", cook_time: "50분", difficulty: "어려움", description: "돼지갈비 들어간 정겨운 집밥 한 끼. 어려움 난이도로 부담 없어요.", base: ["돼지갈비","감자","당근","대파"], missing: ["돼지갈비","고추장"], steps: ["갈비를 데친다.","고추장 양념을 만든다.","조린다.","감자·당근을 넣는다.","익혀 완성."] },
  { name: "두부스테이크", category: "한식", cook_time: "20분", difficulty: "보통", description: "두부 들어간 정겨운 집밥 한 끼. 보통 난이도로 부담 없어요.", base: ["두부","양파","당근"], missing: ["두부"], steps: ["두부를 으깬다.","채소를 다져 섞는다.","반죽해 모양을 잡는다.","팬에 굽는다.","소스를 곁들여 완성."] },
  { name: "버섯불고기", category: "한식", cook_time: "25분", difficulty: "보통", description: "소고기 들어간 정겨운 집밥 한 끼. 보통 난이도로 부담 없어요.", base: ["소고기","버섯","양파","대파"], missing: ["소고기","간장"], steps: ["소고기를 양념에 재운다.","버섯·양파를 넣는다.","팬에 볶는다.","대파를 넣는다.","완성."] },
  { name: "호박죽", category: "한식", cook_time: "30분", difficulty: "쉬움", description: "단호박 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["단호박","찹쌀가루"], missing: ["단호박"], steps: ["단호박을 쪄서 으깬다.","물을 넣고 끓인다.","찹쌀가루를 푼다.","저으며 끓인다.","설탕·소금으로 간해 완성."] },
  { name: "소고기미역국", category: "한식", cook_time: "30분", difficulty: "쉬움", description: "미역 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["미역","소고기","마늘"], missing: ["미역","소고기"], steps: ["미역을 불린다.","소고기를 참기름에 볶는다.","미역을 넣고 볶는다.","물을 붓고 끓인다.","국간장으로 간해 완성."] },
  { name: "새우볶음밥", category: "한식", cook_time: "15분", difficulty: "쉬움", description: "새우 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["새우","밥","당근","대파","달걀"], missing: ["새우"], steps: ["새우를 손질한다.","팬에 채소를 볶는다.","밥을 넣고 볶는다.","새우를 넣는다.","달걀을 넣어 완성."] },
  { name: "김치말이국수", category: "한식", cook_time: "15분", difficulty: "쉬움", description: "소면 들어간 정겨운 집밥 한 끼. 쉬움 난이도로 부담 없어요.", base: ["소면","김치","오이","달걀"], missing: ["소면","김치"], steps: ["소면을 삶는다.","김치국물 육수를 만든다.","면을 담는다.","김치·오이를 올린다.","달걀을 얹어 완성."] },
  { name: "토마토 파스타", category: "양식", cook_time: "25분", difficulty: "보통", description: "파스타면(으)로 만드는 근사한 양식 요리. 보통 난이도예요.", base: ["파스타면","토마토","마늘","양파"], missing: ["파스타면","올리브유"], steps: ["파스타면을 8분 삶는다.","올리브유에 마늘을 볶는다.","토마토·양파로 소스를 만든다.","면을 넣고 버무린다.","치즈를 뿌려 완성."] },
  { name: "크림 파스타", category: "양식", cook_time: "25분", difficulty: "보통", description: "파스타면(으)로 만드는 근사한 양식 요리. 보통 난이도예요.", base: ["파스타면","우유","베이컨","양파","버섯"], missing: ["파스타면","생크림"], steps: ["파스타면을 삶는다.","베이컨·양파를 볶는다.","생크림·우유를 붓는다.","면을 넣고 졸인다.","치즈를 뿌려 완성."] },
  { name: "오일 파스타", category: "양식", cook_time: "20분", difficulty: "쉬움", description: "파스타면(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["파스타면","마늘","고추","올리브유"], missing: ["파스타면","올리브유"], steps: ["면을 삶는다.","올리브유에 마늘·고추를 볶는다.","면수를 넣어 유화한다.","면을 넣고 버무린다.","파슬리를 뿌려 완성."] },
  { name: "토마토 리조또", category: "양식", cook_time: "30분", difficulty: "보통", description: "쌀(으)로 만드는 근사한 양식 요리. 보통 난이도예요.", base: ["쌀","토마토","양파","치즈"], missing: ["파마산치즈"], steps: ["양파를 볶는다.","쌀을 넣고 볶는다.","토마토와 육수를 조금씩 붓는다.","저으며 익힌다.","치즈를 넣어 완성."] },
  { name: "오므라이스", category: "양식", cook_time: "20분", difficulty: "보통", description: "밥(으)로 만드는 근사한 양식 요리. 보통 난이도예요.", base: ["밥","달걀","양파","당근","케첩"], missing: ["케첩"], steps: ["채소를 볶는다.","밥과 케첩을 넣고 볶는다.","달걀을 부쳐 얇게 만든다.","밥을 감싼다.","케첩을 뿌려 완성."] },
  { name: "그라탕", category: "양식", cook_time: "35분", difficulty: "보통", description: "감자(으)로 만드는 근사한 양식 요리. 보통 난이도예요.", base: ["감자","우유","치즈","베이컨"], missing: ["치즈","생크림"], steps: ["감자를 얇게 썬다.","베이컨을 볶는다.","크림소스를 만든다.","그릇에 담고 치즈를 올린다.","오븐에 구워 완성."] },
  { name: "필라프", category: "양식", cook_time: "25분", difficulty: "쉬움", description: "쌀(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["쌀","당근","양파","버터"], missing: ["버터"], steps: ["버터에 채소를 볶는다.","쌀을 넣고 볶는다.","육수를 붓는다.","뚜껑을 덮고 익힌다.","완성."] },
  { name: "함박스테이크", category: "양식", cook_time: "30분", difficulty: "보통", description: "다진육(으)로 만드는 근사한 양식 요리. 보통 난이도예요.", base: ["다진육","양파","빵가루","케첩"], missing: ["다진육","빵가루"], steps: ["다진 고기에 양파·빵가루를 섞는다.","반죽해 모양을 잡는다.","팬에 굽는다.","소스를 만든다.","소스를 끼얹어 완성."] },
  { name: "토마토 스튜", category: "양식", cook_time: "40분", difficulty: "보통", description: "소고기(으)로 만드는 근사한 양식 요리. 보통 난이도예요.", base: ["소고기","토마토","감자","당근","양파"], missing: ["소고기","토마토"], steps: ["고기를 굽는다.","채소를 넣고 볶는다.","토마토와 물을 붓는다.","푹 끓인다.","간을 보고 완성."] },
  { name: "콥샐러드", category: "양식", cook_time: "15분", difficulty: "쉬움", description: "상추(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["상추","달걀","베이컨","토마토","치즈"], missing: ["드레싱"], steps: ["채소를 썬다.","달걀을 삶는다.","베이컨을 굽는다.","재료를 담는다.","드레싱을 뿌려 완성."] },
  { name: "프렌치토스트", category: "양식", cook_time: "12분", difficulty: "쉬움", description: "빵(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["빵","달걀","우유"], missing: ["식빵"], steps: ["달걀·우유를 섞는다.","빵을 적신다.","버터에 굽는다.","노릇하게 뒤집는다.","시럽을 뿌려 완성."] },
  { name: "감자수프", category: "양식", cook_time: "25분", difficulty: "쉬움", description: "감자(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["감자","양파","우유","버터"], missing: ["생크림"], steps: ["감자·양파를 볶는다.","물을 붓고 삶는다.","곱게 간다.","우유를 넣고 끓인다.","간을 보고 완성."] },
  { name: "미트볼", category: "양식", cook_time: "30분", difficulty: "보통", description: "다진육(으)로 만드는 근사한 양식 요리. 보통 난이도예요.", base: ["다진육","양파","토마토","빵가루"], missing: ["다진육"], steps: ["고기에 양파·빵가루를 섞는다.","동그랗게 빚는다.","팬에 굽는다.","토마토소스를 붓는다.","조려서 완성."] },
  { name: "치즈오믈렛", category: "양식", cook_time: "12분", difficulty: "쉬움", description: "달걀(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["달걀","치즈","우유"], missing: ["치즈"], steps: ["달걀을 푼다.","우유를 섞는다.","팬에 붓는다.","치즈를 올린다.","반으로 접어 완성."] },
  { name: "새우 로제파스타", category: "양식", cook_time: "25분", difficulty: "보통", description: "파스타면(으)로 만드는 근사한 양식 요리. 보통 난이도예요.", base: ["파스타면","새우","토마토","우유"], missing: ["파스타면","새우"], steps: ["면을 삶는다.","새우를 볶는다.","토마토·크림소스를 만든다.","면을 넣고 버무린다.","완성."] },
  { name: "라따뚜이", category: "양식", cook_time: "40분", difficulty: "보통", description: "가지(으)로 만드는 근사한 양식 요리. 보통 난이도예요.", base: ["가지","애호박","토마토","양파"], missing: ["가지"], steps: ["채소를 얇게 썬다.","토마토소스를 깐다.","채소를 돌려 담는다.","오븐에 굽는다.","올리브유를 둘러 완성."] },
  { name: "치킨스테이크", category: "양식", cook_time: "25분", difficulty: "보통", description: "닭고기(으)로 만드는 근사한 양식 요리. 보통 난이도예요.", base: ["닭고기","감자","브로콜리"], missing: ["닭다리살"], steps: ["닭에 소금·후추를 뿌린다.","팬에 굽는다.","채소를 곁들여 굽는다.","소스를 만든다.","끼얹어 완성."] },
  { name: "연어스테이크", category: "양식", cook_time: "20분", difficulty: "보통", description: "연어(으)로 만드는 근사한 양식 요리. 보통 난이도예요.", base: ["연어","아스파라거스","레몬"], missing: ["연어"], steps: ["연어에 소금·후추를 뿌린다.","팬에 굽는다.","채소를 곁들인다.","레몬을 짠다.","완성."] },
  { name: "BLT샌드위치", category: "양식", cook_time: "12분", difficulty: "쉬움", description: "빵(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["빵","베이컨","상추","토마토"], missing: ["식빵","베이컨"], steps: ["빵을 굽는다.","베이컨을 굽는다.","마요를 바른다.","재료를 쌓는다.","반으로 잘라 완성."] },
  { name: "까르보나라", category: "양식", cook_time: "20분", difficulty: "보통", description: "파스타면(으)로 만드는 근사한 양식 요리. 보통 난이도예요.", base: ["파스타면","베이컨","달걀","치즈"], missing: ["파스타면","파마산치즈"], steps: ["면을 삶는다.","베이컨을 볶는다.","달걀·치즈를 섞는다.","면을 넣고 빠르게 버무린다.","후추를 뿌려 완성."] },
  { name: "토마토 뇨끼", category: "양식", cook_time: "30분", difficulty: "보통", description: "감자(으)로 만드는 근사한 양식 요리. 보통 난이도예요.", base: ["감자","밀가루","토마토","치즈"], missing: ["토마토소스"], steps: ["감자를 으깨 반죽한다.","뇨끼를 빚는다.","삶는다.","토마토소스에 버무린다.","치즈를 뿌려 완성."] },
  { name: "시저샐러드", category: "양식", cook_time: "15분", difficulty: "쉬움", description: "상추(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["상추","치즈","빵","베이컨"], missing: ["시저드레싱"], steps: ["로메인을 썬다.","크루통을 만든다.","베이컨을 굽는다.","드레싱에 버무린다.","치즈를 뿌려 완성."] },
  { name: "토마토 미네스트로네", category: "양식", cook_time: "35분", difficulty: "쉬움", description: "토마토(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["토마토","감자","당근","양파","파스타면"], missing: ["토마토"], steps: ["채소를 깍둑썬다.","올리브유에 볶는다.","토마토·물을 붓는다.","파스타를 넣는다.","끓여 완성."] },
  { name: "버섯크림수프", category: "양식", cook_time: "25분", difficulty: "쉬움", description: "버섯(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["버섯","양파","우유","버터"], missing: ["생크림"], steps: ["버섯·양파를 볶는다.","물을 붓고 끓인다.","곱게 간다.","우유를 넣는다.","간을 보고 완성."] },
  { name: "폭찹", category: "양식", cook_time: "25분", difficulty: "보통", description: "돼지고기(으)로 만드는 근사한 양식 요리. 보통 난이도예요.", base: ["돼지고기","감자","양파"], missing: ["돼지등심"], steps: ["돼지고기에 밑간을 한다.","팬에 굽는다.","양파를 볶는다.","소스를 만든다.","끼얹어 완성."] },
  { name: "스크램블에그", category: "양식", cook_time: "8분", difficulty: "쉬움", description: "달걀(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["달걀","우유","버터"], missing: ["달걀"], steps: ["달걀을 푼다.","우유를 섞는다.","버터에 부드럽게 익힌다.","저어준다.","소금·후추로 완성."] },
  { name: "핫도그", category: "양식", cook_time: "12분", difficulty: "쉬움", description: "소시지(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["소시지","빵","양파","케첩"], missing: ["핫도그번","소시지"], steps: ["소시지를 굽는다.","빵을 데운다.","양파를 볶는다.","빵에 끼운다.","소스를 뿌려 완성."] },
  { name: "토마토 브루스케타", category: "양식", cook_time: "12분", difficulty: "쉬움", description: "빵(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["빵","토마토","마늘","올리브유"], missing: ["바게트"], steps: ["빵을 굽는다.","마늘을 문지른다.","토마토를 다진다.","빵에 올린다.","올리브유를 둘러 완성."] },
  { name: "베이컨 김치필라프", category: "양식", cook_time: "18분", difficulty: "쉬움", description: "밥(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["밥","베이컨","김치","양파"], missing: ["베이컨"], steps: ["베이컨을 볶는다.","김치·양파를 볶는다.","밥을 넣고 볶는다.","버터를 넣는다.","완성."] },
  { name: "감바스", category: "양식", cook_time: "20분", difficulty: "쉬움", description: "새우(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["새우","마늘","올리브유","고추"], missing: ["새우","올리브유"], steps: ["올리브유에 마늘을 익힌다.","새우를 넣는다.","고추를 넣는다.","끓인다.","빵을 곁들여 완성."] },
  { name: "스파게티 볼로네제", category: "양식", cook_time: "30분", difficulty: "보통", description: "파스타면(으)로 만드는 근사한 양식 요리. 보통 난이도예요.", base: ["파스타면","다진육","토마토","양파"], missing: ["파스타면","다진육"], steps: ["고기를 볶는다.","양파를 넣는다.","토마토소스를 붓고 끓인다.","면을 삶는다.","소스를 올려 완성."] },
  { name: "치즈리조또", category: "양식", cook_time: "30분", difficulty: "보통", description: "쌀(으)로 만드는 근사한 양식 요리. 보통 난이도예요.", base: ["쌀","양파","치즈","버터"], missing: ["파마산치즈"], steps: ["양파를 버터에 볶는다.","쌀을 볶는다.","육수를 조금씩 붓는다.","익힌다.","치즈를 넣어 완성."] },
  { name: "토마토 닭가슴살", category: "양식", cook_time: "25분", difficulty: "쉬움", description: "닭가슴살(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["닭가슴살","토마토","양파"], missing: ["닭가슴살"], steps: ["닭가슴살을 굽는다.","양파를 볶는다.","토마토소스를 넣는다.","조린다.","완성."] },
  { name: "크로크무슈", category: "양식", cook_time: "20분", difficulty: "보통", description: "빵(으)로 만드는 근사한 양식 요리. 보통 난이도예요.", base: ["빵","치즈","햄","우유"], missing: ["식빵","치즈"], steps: ["베샤멜소스를 만든다.","빵에 햄·치즈를 넣는다.","소스를 바른다.","치즈를 올린다.","구워서 완성."] },
  { name: "야채스프", category: "양식", cook_time: "20분", difficulty: "쉬움", description: "양배추(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["양배추","당근","감자","양파"], missing: ["양배추"], steps: ["채소를 깍둑썬다.","버터에 볶는다.","물을 붓는다.","끓인다.","간을 보고 완성."] },
  { name: "닭다리 오븐구이", category: "양식", cook_time: "40분", difficulty: "쉬움", description: "닭다리(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["닭다리","감자","로즈마리"], missing: ["닭다리"], steps: ["닭에 밑간을 한다.","감자와 함께 담는다.","올리브유를 두른다.","오븐에 굽는다.","완성."] },
  { name: "토마토에그인헬", category: "양식", cook_time: "20분", difficulty: "쉬움", description: "토마토(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["토마토","달걀","양파","빵"], missing: ["토마토"], steps: ["양파를 볶는다.","토마토소스를 끓인다.","달걀을 깨 넣는다.","익힌다.","빵을 곁들여 완성."] },
  { name: "버섯리조또", category: "양식", cook_time: "30분", difficulty: "보통", description: "쌀(으)로 만드는 근사한 양식 요리. 보통 난이도예요.", base: ["쌀","버섯","양파","치즈"], missing: ["파마산치즈"], steps: ["버섯·양파를 볶는다.","쌀을 넣고 볶는다.","육수를 조금씩 붓는다.","익힌다.","치즈를 넣어 완성."] },
  { name: "스테이크", category: "양식", cook_time: "20분", difficulty: "보통", description: "소고기(으)로 만드는 근사한 양식 요리. 보통 난이도예요.", base: ["소고기","버터","마늘"], missing: ["스테이크고기"], steps: ["고기를 실온에 둔다.","소금·후추를 뿌린다.","센불에 굽는다.","버터·마늘로 향을 낸다.","레스팅 후 완성."] },
  { name: "치킨까스", category: "양식", cook_time: "30분", difficulty: "보통", description: "닭고기(으)로 만드는 근사한 양식 요리. 보통 난이도예요.", base: ["닭고기","빵가루","달걀","밀가루"], missing: ["닭안심","빵가루"], steps: ["닭을 펴서 밑간한다.","밀가루·달걀·빵가루를 입힌다.","튀긴다.","소스를 만든다.","곁들여 완성."] },
  { name: "토마토 수프 파스타", category: "양식", cook_time: "25분", difficulty: "쉬움", description: "파스타면(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["파스타면","토마토","양파","마늘"], missing: ["파스타면","토마토"], steps: ["양파·마늘을 볶는다.","토마토를 넣고 끓인다.","물을 붓는다.","파스타를 넣는다.","끓여 완성."] },
  { name: "감자전", category: "양식", cook_time: "18분", difficulty: "쉬움", description: "감자(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["감자","양파"], missing: ["감자"], steps: ["감자를 간다.","물기를 짠다.","양파를 섞는다.","팬에 부친다.","노릇하게 완성."] },
  { name: "새우튀김", category: "양식", cook_time: "25분", difficulty: "보통", description: "새우(으)로 만드는 근사한 양식 요리. 보통 난이도예요.", base: ["새우","밀가루","달걀","빵가루"], missing: ["새우","빵가루"], steps: ["새우를 손질한다.","튀김옷을 입힌다.","빵가루를 묻힌다.","튀긴다.","소스와 완성."] },
  { name: "머쉬룸 토스트", category: "양식", cook_time: "12분", difficulty: "쉬움", description: "빵(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["빵","버섯","치즈","버터"], missing: ["식빵"], steps: ["버섯을 볶는다.","빵을 굽는다.","버섯을 올린다.","치즈를 얹는다.","구워서 완성."] },
  { name: "야채오믈렛", category: "양식", cook_time: "12분", difficulty: "쉬움", description: "달걀(으)로 만드는 근사한 양식 요리. 쉬움 난이도예요.", base: ["달걀","양파","당근","치즈"], missing: ["달걀"], steps: ["채소를 다진다.","달걀에 섞는다.","팬에 부친다.","치즈를 올린다.","접어서 완성."] },
  { name: "마파두부", category: "중식", cook_time: "20분", difficulty: "보통", description: "불맛 살린 중화풍 마파두부. 두부 활용도가 좋아요.", base: ["두부","다진육","대파","마늘"], missing: ["두부","두반장"], steps: ["두부를 깍둑썬다.","다진 고기를 볶는다.","두반장 양념을 넣는다.","두부를 넣고 끓인다.","전분물로 농도를 맞춰 완성."] },
  { name: "계란볶음밥", category: "중식", cook_time: "12분", difficulty: "쉬움", description: "불맛 살린 중화풍 계란볶음밥. 달걀 활용도가 좋아요.", base: ["달걀","밥","대파","당근"], missing: ["굴소스"], steps: ["달걀을 스크램블한다.","채소를 볶는다.","밥을 넣고 볶는다.","굴소스로 간한다.","대파를 넣어 완성."] },
  { name: "짜장면", category: "중식", cook_time: "30분", difficulty: "보통", description: "불맛 살린 중화풍 짜장면. 춘장 활용도가 좋아요.", base: ["춘장","돼지고기","양파","감자","면"], missing: ["춘장","중화면"], steps: ["춘장을 기름에 볶는다.","돼지고기·채소를 볶는다.","춘장을 넣고 볶는다.","전분물로 농도를 맞춘다.","삶은 면에 올려 완성."] },
  { name: "짬뽕", category: "중식", cook_time: "30분", difficulty: "어려움", description: "불맛 살린 중화풍 짬뽕. 해물 활용도가 좋아요.", base: ["해물","양배추","양파","고춧가루","면"], missing: ["중화면","해물"], steps: ["고춧가루로 기름을 낸다.","채소·해물을 볶는다.","육수를 붓는다.","끓인다.","삶은 면에 부어 완성."] },
  { name: "탕수육", category: "중식", cook_time: "40분", difficulty: "어려움", description: "불맛 살린 중화풍 탕수육. 돼지고기 활용도가 좋아요.", base: ["돼지고기","전분","당근","양파","파인애플"], missing: ["돼지등심","전분"], steps: ["고기에 전분옷을 입힌다.","튀긴다.","소스를 끓인다.","전분물로 걸쭉하게 한다.","고기에 부어 완성."] },
  { name: "깐풍기", category: "중식", cook_time: "35분", difficulty: "보통", description: "불맛 살린 중화풍 깐풍기. 닭고기 활용도가 좋아요.", base: ["닭고기","고추","마늘","전분"], missing: ["닭고기","전분"], steps: ["닭에 튀김옷을 입힌다.","튀긴다.","매콤달콤 소스를 만든다.","닭을 버무린다.","고추를 넣어 완성."] },
  { name: "유산슬", category: "중식", cook_time: "30분", difficulty: "보통", description: "불맛 살린 중화풍 유산슬. 돼지고기 활용도가 좋아요.", base: ["돼지고기","목이버섯","죽순","당근"], missing: ["해삼","목이버섯"], steps: ["재료를 채 썬다.","고기를 볶는다.","채소를 넣는다.","육수·전분물을 넣는다.","걸쭉하게 완성."] },
  { name: "양장피", category: "중식", cook_time: "30분", difficulty: "보통", description: "불맛 살린 중화풍 양장피. 당면피 활용도가 좋아요.", base: ["당면피","오이","당근","달걀","새우"], missing: ["양장피","해물"], steps: ["당면피를 불린다.","채소를 채 썬다.","해물을 데친다.","겨자소스를 만든다.","돌려 담아 완성."] },
  { name: "고추잡채", category: "중식", cook_time: "20분", difficulty: "보통", description: "불맛 살린 중화풍 고추잡채. 돼지고기 활용도가 좋아요.", base: ["돼지고기","피망","양파","죽순"], missing: ["돼지고기","굴소스"], steps: ["고기를 채 썰어 볶는다.","피망·양파를 넣는다.","굴소스로 양념한다.","센불에 볶는다.","꽃빵과 완성."] },
  { name: "새우볶음밥", category: "중식", cook_time: "15분", difficulty: "쉬움", description: "불맛 살린 중화풍 새우볶음밥. 새우 활용도가 좋아요.", base: ["새우","밥","달걀","대파"], missing: ["새우"], steps: ["새우를 볶는다.","달걀을 스크램블한다.","밥을 넣고 볶는다.","굴소스로 간한다.","대파를 넣어 완성."] },
  { name: "팔보채", category: "중식", cook_time: "30분", difficulty: "보통", description: "불맛 살린 중화풍 팔보채. 해물 활용도가 좋아요.", base: ["해물","오징어","새우","채소"], missing: ["모둠해물"], steps: ["해물을 손질한다.","채소를 볶는다.","해물을 넣는다.","육수·전분물을 넣는다.","걸쭉하게 완성."] },
  { name: "마라샹궈", category: "중식", cook_time: "30분", difficulty: "보통", description: "불맛 살린 중화풍 마라샹궈. 고기 활용도가 좋아요.", base: ["고기","버섯","청경채","마라소스"], missing: ["마라소스","건두부"], steps: ["재료를 데친다.","마라소스를 볶는다.","재료를 넣고 볶는다.","향신료를 더한다.","완성."] },
  { name: "부추잡채", category: "중식", cook_time: "15분", difficulty: "쉬움", description: "불맛 살린 중화풍 부추잡채. 부추 활용도가 좋아요.", base: ["부추","돼지고기","양파"], missing: ["부추","굴소스"], steps: ["고기를 볶는다.","부추를 넣는다.","굴소스로 양념한다.","센불에 볶는다.","완성."] },
  { name: "동파육", category: "중식", cook_time: "60분", difficulty: "어려움", description: "불맛 살린 중화풍 동파육. 삼겹살 활용도가 좋아요.", base: ["삼겹살","대파","생강","간장"], missing: ["삼겹살","간장"], steps: ["삼겹살을 데친다.","간장 양념을 만든다.","약불에 졸인다.","뒤집어가며 익힌다.","윤기나게 완성."] },
  { name: "calamari튀김", category: "중식", cook_time: "25분", difficulty: "보통", description: "불맛 살린 중화풍 calamari튀김. 오징어 활용도가 좋아요.", base: ["오징어","전분","마늘"], missing: ["오징어","전분"], steps: ["오징어를 손질한다.","전분옷을 입힌다.","튀긴다.","마늘소스를 만든다.","버무려 완성."] },
  { name: "토마토계란볶음", category: "중식", cook_time: "12분", difficulty: "쉬움", description: "불맛 살린 중화풍 토마토계란볶음. 토마토 활용도가 좋아요.", base: ["토마토","달걀","대파"], missing: ["토마토"], steps: ["달걀을 스크램블한다.","토마토를 볶는다.","달걀을 넣는다.","설탕·소금으로 간한다.","대파를 넣어 완성."] },
  { name: "가지튀김 어향소스", category: "중식", cook_time: "30분", difficulty: "보통", description: "불맛 살린 중화풍 가지튀김 어향소스. 가지 활용도가 좋아요.", base: ["가지","다진육","마늘","고추"], missing: ["가지"], steps: ["가지를 튀긴다.","고기를 볶는다.","어향소스를 만든다.","가지를 넣고 버무린다.","완성."] },
  { name: "멘보샤", category: "중식", cook_time: "30분", difficulty: "어려움", description: "불맛 살린 중화풍 멘보샤. 새우 활용도가 좋아요.", base: ["새우","식빵","달걀"], missing: ["새우","식빵"], steps: ["새우를 다진다.","빵 사이에 넣는다.","튀긴다.","기름을 뺀다.","썰어서 완성."] },
  { name: "꿔바로우", category: "중식", cook_time: "40분", difficulty: "어려움", description: "불맛 살린 중화풍 꿔바로우. 돼지고기 활용도가 좋아요.", base: ["돼지고기","전분","당근"], missing: ["돼지등심","감자전분"], steps: ["고기에 전분옷을 입힌다.","두 번 튀긴다.","새콤달콤 소스를 만든다.","버무린다.","완성."] },
  { name: "청경채굴소스볶음", category: "중식", cook_time: "12분", difficulty: "쉬움", description: "불맛 살린 중화풍 청경채굴소스볶음. 청경채 활용도가 좋아요.", base: ["청경채","마늘","굴소스"], missing: ["청경채"], steps: ["청경채를 데친다.","마늘을 볶는다.","굴소스를 넣는다.","청경채를 넣고 볶는다.","완성."] },
  { name: "새우칠리", category: "중식", cook_time: "25분", difficulty: "보통", description: "불맛 살린 중화풍 새우칠리. 새우 활용도가 좋아요.", base: ["새우","토마토","마늘","고추"], missing: ["새우"], steps: ["새우를 튀긴다.","칠리소스를 만든다.","새우를 넣는다.","버무린다.","대파를 넣어 완성."] },
  { name: "깐쇼새우", category: "중식", cook_time: "30분", difficulty: "보통", description: "불맛 살린 중화풍 깐쇼새우. 새우 활용도가 좋아요.", base: ["새우","전분","케첩","마늘"], missing: ["새우"], steps: ["새우에 전분옷을 입힌다.","튀긴다.","케첩소스를 만든다.","버무린다.","완성."] },
  { name: "마라탕", category: "중식", cook_time: "30분", difficulty: "보통", description: "불맛 살린 중화풍 마라탕. 고기 활용도가 좋아요.", base: ["고기","채소","당면","마라소스"], missing: ["마라소스","건두부"], steps: ["재료를 고른다.","육수를 끓인다.","재료를 넣는다.","당면을 넣는다.","끓여 완성."] },
  { name: "훠궈", category: "중식", cook_time: "40분", difficulty: "보통", description: "불맛 살린 중화풍 훠궈. 고기 활용도가 좋아요.", base: ["고기","채소","두부","버섯"], missing: ["훠궈육수","양고기"], steps: ["육수를 끓인다.","재료를 준비한다.","고기를 데친다.","채소를 데친다.","소스에 찍어 완성."] },
  { name: "계란탕", category: "중식", cook_time: "12분", difficulty: "쉬움", description: "불맛 살린 중화풍 계란탕. 달걀 활용도가 좋아요.", base: ["달걀","대파","전분"], missing: ["달걀"], steps: ["육수를 끓인다.","전분물을 넣는다.","달걀을 풀어 넣는다.","대파를 넣는다.","완성."] },
  { name: "새우완탕", category: "중식", cook_time: "30분", difficulty: "보통", description: "불맛 살린 중화풍 새우완탕. 새우 활용도가 좋아요.", base: ["새우","만두피","대파"], missing: ["새우","만두피"], steps: ["새우소를 만든다.","만두피로 빚는다.","육수를 끓인다.","완탕을 삶는다.","대파를 올려 완성."] },
  { name: "볶음짬뽕", category: "중식", cook_time: "30분", difficulty: "보통", description: "불맛 살린 중화풍 볶음짬뽕. 해물 활용도가 좋아요.", base: ["해물","양배추","양파","면"], missing: ["중화면","해물"], steps: ["고춧가루로 기름을 낸다.","해물·채소를 볶는다.","면을 넣고 볶는다.","센불에 볶는다.","완성."] },
  { name: "울면", category: "중식", cook_time: "30분", difficulty: "보통", description: "불맛 살린 중화풍 울면. 해물 활용도가 좋아요.", base: ["해물","달걀","채소","면"], missing: ["중화면","해물"], steps: ["채소·해물을 볶는다.","육수를 붓는다.","전분물로 걸쭉하게 한다.","달걀을 푼다.","면에 부어 완성."] },
  { name: "중화비빔밥", category: "중식", cook_time: "20분", difficulty: "쉬움", description: "불맛 살린 중화풍 중화비빔밥. 밥 활용도가 좋아요.", base: ["밥","돼지고기","양배추","양파"], missing: ["굴소스"], steps: ["고기·채소를 볶는다.","굴소스로 양념한다.","밥에 올린다.","달걀을 얹는다.","완성."] },
  { name: "깐풍새우", category: "중식", cook_time: "30분", difficulty: "보통", description: "불맛 살린 중화풍 깐풍새우. 새우 활용도가 좋아요.", base: ["새우","전분","고추","마늘"], missing: ["새우"], steps: ["새우를 튀긴다.","깐풍소스를 만든다.","버무린다.","고추를 넣는다.","완성."] },
  { name: "간짜장", category: "중식", cook_time: "30분", difficulty: "보통", description: "불맛 살린 중화풍 간짜장. 춘장 활용도가 좋아요.", base: ["춘장","돼지고기","양파","면"], missing: ["춘장","중화면"], steps: ["춘장을 볶는다.","고기·양파를 따로 볶는다.","춘장과 섞는다.","면을 삶는다.","올려서 완성."] },
  { name: "토마토새우볶음", category: "중식", cook_time: "20분", difficulty: "쉬움", description: "불맛 살린 중화풍 토마토새우볶음. 새우 활용도가 좋아요.", base: ["새우","토마토","양파","마늘"], missing: ["새우"], steps: ["새우를 볶는다.","토마토를 넣는다.","양파를 넣는다.","간장으로 양념한다.","완성."] },
  { name: "부추계란볶음", category: "중식", cook_time: "12분", difficulty: "쉬움", description: "불맛 살린 중화풍 부추계란볶음. 부추 활용도가 좋아요.", base: ["부추","달걀","대파"], missing: ["부추"], steps: ["달걀을 스크램블한다.","부추를 볶는다.","달걀을 넣는다.","소금으로 간한다.","완성."] },
  { name: "배추된장볶음", category: "중식", cook_time: "15분", difficulty: "쉬움", description: "불맛 살린 중화풍 배추된장볶음. 배추 활용도가 좋아요.", base: ["배추","된장","마늘","대파"], missing: ["배추"], steps: ["배추를 썬다.","된장을 푼다.","배추를 볶는다.","마늘을 넣는다.","대파를 올려 완성."] },
  { name: "난자완스", category: "중식", cook_time: "40분", difficulty: "어려움", description: "불맛 살린 중화풍 난자완스. 다진육 활용도가 좋아요.", base: ["다진육","청경채","전분","마늘"], missing: ["다진육"], steps: ["고기를 완자로 빚는다.","튀긴다.","소스를 만든다.","청경채와 함께 끓인다.","완성."] },
  { name: "오향장육", category: "중식", cook_time: "50분", difficulty: "어려움", description: "불맛 살린 중화풍 오향장육. 돼지고기 활용도가 좋아요.", base: ["돼지고기","오향","간장","대파"], missing: ["돼지수육","오향분"], steps: ["고기를 오향에 삶는다.","식혀 썬다.","간장소스를 만든다.","파채를 곁들인다.","완성."] },
  { name: "새우건두부볶음", category: "중식", cook_time: "20분", difficulty: "보통", description: "불맛 살린 중화풍 새우건두부볶음. 새우 활용도가 좋아요.", base: ["새우","건두부","고추","마늘"], missing: ["건두부","새우"], steps: ["건두부를 불린다.","새우를 볶는다.","건두부를 넣는다.","간장으로 양념한다.","완성."] },
  { name: "중화풍가지볶음", category: "중식", cook_time: "20분", difficulty: "쉬움", description: "불맛 살린 중화풍 중화풍가지볶음. 가지 활용도가 좋아요.", base: ["가지","다진육","대파","마늘"], missing: ["가지"], steps: ["가지를 볶는다.","고기를 넣는다.","굴소스로 양념한다.","대파를 넣는다.","완성."] },
  { name: "토마토달걀탕", category: "중식", cook_time: "12분", difficulty: "쉬움", description: "불맛 살린 중화풍 토마토달걀탕. 토마토 활용도가 좋아요.", base: ["토마토","달걀","대파"], missing: ["토마토"], steps: ["토마토를 끓인다.","달걀을 푼다.","전분물을 넣는다.","대파를 넣는다.","완성."] },
  { name: "새우브로콜리볶음", category: "중식", cook_time: "15분", difficulty: "쉬움", description: "불맛 살린 중화풍 새우브로콜리볶음. 새우 활용도가 좋아요.", base: ["새우","브로콜리","마늘"], missing: ["새우"], steps: ["브로콜리를 데친다.","새우를 볶는다.","브로콜리를 넣는다.","굴소스로 양념한다.","완성."] },
  { name: "규동", category: "기타", cook_time: "20분", difficulty: "쉬움", description: "일 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["일","식"], missing: ["소고기","양파","밥","달걀"], steps: ["소고기"] },
  { name: "가츠동", category: "기타", cook_time: "25분", difficulty: "보통", description: "일 활용한 색다른 별미. 보통 난이도로 즐겨보세요.", base: ["일","식"], missing: ["돈가스","양파","달걀","밥"], steps: ["돈가스"] },
  { name: "오야코동", category: "기타", cook_time: "20분", difficulty: "쉬움", description: "일 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["일","식"], missing: ["닭고기","양파","달걀","밥"], steps: ["닭다리살"] },
  { name: "연어덮밥", category: "기타", cook_time: "15분", difficulty: "쉬움", description: "일 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["일","식"], missing: ["연어","밥","아보카도","간장"], steps: ["연어회"] },
  { name: "우동", category: "기타", cook_time: "15분", difficulty: "쉬움", description: "일 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["일","식"], missing: ["우동면","어묵","대파","달걀"], steps: ["우동면"] },
  { name: "야키소바", category: "기타", cook_time: "20분", difficulty: "쉬움", description: "일 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["일","식"], missing: ["면","양배추","돼지고기","당근"], steps: ["야키소바면"] },
  { name: "규카츠", category: "기타", cook_time: "30분", difficulty: "보통", description: "일 활용한 색다른 별미. 보통 난이도로 즐겨보세요.", base: ["일","식"], missing: ["소고기","빵가루","달걀","밀가루"], steps: ["소고기","빵가루"] },
  { name: "타코야키", category: "기타", cook_time: "30분", difficulty: "보통", description: "일 활용한 색다른 별미. 보통 난이도로 즐겨보세요.", base: ["일","식"], missing: ["밀가루","문어","대파","가쓰오"], steps: ["타코야키가루","문어"] },
  { name: "미소된장국", category: "기타", cook_time: "12분", difficulty: "쉬움", description: "일 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["일","식"], missing: ["미소","두부","미역","대파"], steps: ["미소된장"] },
  { name: "연어구이", category: "기타", cook_time: "18분", difficulty: "쉬움", description: "일 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["일","식"], missing: ["연어","레몬","무"], steps: ["연어"] },
  { name: "치킨난반", category: "기타", cook_time: "30분", difficulty: "보통", description: "일 활용한 색다른 별미. 보통 난이도로 즐겨보세요.", base: ["일","식"], missing: ["닭고기","달걀","타르타르","밀가루"], steps: ["닭다리살"] },
  { name: "돈부리", category: "기타", cook_time: "20분", difficulty: "쉬움", description: "일 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["일","식"], missing: ["돼지고기","양파","밥","달걀"], steps: ["돼지고기"] },
  { name: "자루소바", category: "기타", cook_time: "12분", difficulty: "쉬움", description: "일 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["일","식"], missing: ["메밀면","무","대파","간장"], steps: ["메밀면"] },
  { name: "크림우동", category: "기타", cook_time: "20분", difficulty: "보통", description: "일 활용한 색다른 별미. 보통 난이도로 즐겨보세요.", base: ["일","식"], missing: ["우동면","우유","베이컨","버섯"], steps: ["우동면","생크림"] },
  { name: "일본식카레", category: "기타", cook_time: "30분", difficulty: "쉬움", description: "일 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["일","식"], missing: ["감자","당근","양파","고기","카레"], steps: ["카레가루"] },
  { name: "치즈김밥", category: "기타", cook_time: "30분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["밥","김","치즈","당근","달걀"], steps: ["김"] },
  { name: "닭죽", category: "기타", cook_time: "40분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["닭고기","쌀","마늘","대파"], steps: ["닭고기"] },
  { name: "전복죽", category: "기타", cook_time: "45분", difficulty: "보통", description: "기 활용한 색다른 별미. 보통 난이도로 즐겨보세요.", base: ["기","타"], missing: ["전복","쌀","참기름"], steps: ["전복"] },
  { name: "토마토 달걀죽", category: "기타", cook_time: "25분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["토마토","달걀","쌀","대파"], steps: ["토마토"] },
  { name: "팟타이", category: "기타", cook_time: "25분", difficulty: "보통", description: "기 활용한 색다른 별미. 보통 난이도로 즐겨보세요.", base: ["기","타"], missing: ["쌀국수","새우","숙주","달걀","땅콩"], steps: ["쌀국수","피쉬소스"] },
  { name: "쌀국수", category: "기타", cook_time: "25분", difficulty: "보통", description: "기 활용한 색다른 별미. 보통 난이도로 즐겨보세요.", base: ["기","타"], missing: ["쌀국수","소고기","숙주","고수"], steps: ["쌀국수","소고기"] },
  { name: "나시고렝", category: "기타", cook_time: "20분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["밥","새우","달걀","양파"], steps: ["새우","케첩마니스"] },
  { name: "타코", category: "기타", cook_time: "20분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["토르티야","다진육","양상추","치즈","토마토"], steps: ["토르티야","다진육"] },
  { name: "부리또", category: "기타", cook_time: "20분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["토르티야","밥","콩","치즈","고기"], steps: ["토르티야"] },
  { name: "팟퐁커리", category: "기타", cook_time: "30분", difficulty: "보통", description: "기 활용한 색다른 별미. 보통 난이도로 즐겨보세요.", base: ["기","타"], missing: ["게","달걀","양파","커리"], steps: ["게","커리가루"] },
  { name: "그린커리", category: "기타", cook_time: "30분", difficulty: "보통", description: "기 활용한 색다른 별미. 보통 난이도로 즐겨보세요.", base: ["기","타"], missing: ["닭고기","코코넛밀크","가지","바질"], steps: ["그린커리페이스트","코코넛밀크"] },
  { name: "월남쌈", category: "기타", cook_time: "25분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["라이스페이퍼","새우","채소","당면"], steps: ["라이스페이퍼"] },
  { name: "후무스", category: "기타", cook_time: "15분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["병아리콩","마늘","올리브유","레몬"], steps: ["병아리콩"] },
  { name: "샥슈카", category: "기타", cook_time: "20분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["토마토","달걀","양파","고추"], steps: ["토마토"] },
  { name: "닭가슴살샐러드", category: "기타", cook_time: "15분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["닭가슴살","상추","토마토","오이"], steps: ["닭가슴살"] },
  { name: "연어포케", category: "기타", cook_time: "15분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["연어","밥","아보카도","오이"], steps: ["연어회"] },
  { name: "토마토 카프레제", category: "기타", cook_time: "10분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["토마토","치즈","바질","올리브유"], steps: ["모짜렐라"] },
  { name: "두부오이토마토샐러드", category: "기타", cook_time: "12분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["두부","오이","토마토"], steps: ["두부"] },
  { name: "파드득나물주먹밥", category: "기타", cook_time: "20분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["밥","참치","당근","양파","파드득나물"], steps: ["참치캔"] },
  { name: "참치마요덮밥", category: "기타", cook_time: "12분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["참치","밥","마요네즈","대파"], steps: ["참치캔"] },
  { name: "아보카도토스트", category: "기타", cook_time: "10분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["빵","아보카도","달걀","토마토"], steps: ["아보카도"] },
  { name: "김치치즈볶음밥", category: "기타", cook_time: "15분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["밥","김치","치즈","대파"], steps: ["김치"] },
  { name: "토마토리코타", category: "기타", cook_time: "12분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["토마토","치즈","빵","올리브유"], steps: ["리코타치즈"] },
  { name: "새우아보카도샐러드", category: "기타", cook_time: "15분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["새우","아보카도","상추","토마토"], steps: ["새우"] },
  { name: "두부면비빔", category: "기타", cook_time: "12분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["두부면","오이","당근","고추장"], steps: ["두부면"] },
  { name: "콩국수", category: "기타", cook_time: "20분", difficulty: "보통", description: "기 활용한 색다른 별미. 보통 난이도로 즐겨보세요.", base: ["기","타"], missing: ["소면","콩","오이"], steps: ["콩물","소면"] },
  { name: "냉채족발", category: "기타", cook_time: "30분", difficulty: "보통", description: "기 활용한 색다른 별미. 보통 난이도로 즐겨보세요.", base: ["기","타"], missing: ["족발","오이","당근","겨자"], steps: ["족발"] },
  { name: "비빔당면", category: "기타", cook_time: "15분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["당면","당근","시금치","고추장"], steps: ["당면"] },
  { name: "토마토 스크램블", category: "기타", cook_time: "10분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["토마토","달걀","대파"], steps: ["토마토"] },
  { name: "계란김밥", category: "기타", cook_time: "25분", difficulty: "쉬움", description: "기 활용한 색다른 별미. 쉬움 난이도로 즐겨보세요.", base: ["기","타"], missing: ["밥","김","달걀","당근","단무지"], steps: ["김","단무지"] }
];

function pickRecipes(ingredients, cuisine, count) {
  const have = new Set(ingredients.map((i) => i.name));
  let pool = RECIPE_DB.map((r) => {
    const matched = r.base.filter((b) => [...have].some((h) => b.includes(h) || h.includes(b))).length;
    return { ...r, score: matched };
  });
  if (cuisine !== "상관없음") {
    pool.sort((a, b) => (b.category === cuisine) - (a.category === cuisine) || b.score - a.score);
  } else {
    pool.sort((a, b) => b.score - a.score);
  }
  return pool.slice(0, count);
}

function recipeToMenu(r, servings, ingredients) {
  const have = new Set(ingredients.map((i) => i.name));
  const used = r.base.filter((b) => [...have].some((h) => b.includes(h) || h.includes(b)));
  const missing = r.missing.map((m) => ({
    name: m, quantity: "적당량", coupang_url: coupangUrl(m),
  }));
  return {
    name: r.name, category: r.category, description: r.description,
    servings, cook_time: r.cook_time, difficulty: r.difficulty,
    used_ingredients: used.length ? used : r.base.slice(0, 2),
    missing_ingredients: missing, steps: r.steps,
  };
}

function buildLocalResult(ingredients, servings, cuisine, mode) {
  if (mode === "single") {
    const recs = pickRecipes(ingredients, cuisine, 3);
    return {
      mode: "single",
      menu: recipeToMenu(recs[0], servings, ingredients),
      next_suggestions: recs.slice(1).map((r) => recipeToMenu(r, servings, ingredients)),
    };
  } else {
    const days = ["월요일","화요일","수요일","목요일","금요일","토요일","일요일"];
    const recs = pickRecipes(ingredients, cuisine, RECIPE_DB.length);
    return {
      mode: "weekly",
      plan: days.map((d, i) => ({
        day: d, meal: recipeToMenu(recs[i % recs.length], servings, ingredients),
      })),
    };
  }
}

// ── API 호출 (성공 시 사용, 실패 시 폴백) ───────────────────────────────
const SYSTEM_PROMPT = `You are "냉장고 요리사", a Korean meal planning assistant. Respond ONLY with a raw JSON object — no markdown, no code fences, no extra text.

single format:
{"mode":"single","menu":{"name":"...","category":"한식|양식|중식","description":"...","servings":2,"cook_time":"20분","difficulty":"쉬움|보통|어려움","used_ingredients":["..."],"missing_ingredients":[{"name":"재료명","quantity":"분량"}],"steps":["...","...","...","...","..."]},"next_suggestions":[{"name":"...","category":"...","description":"...","missing_ingredients":[{"name":"...","quantity":"..."}],"steps":["..."]},{...}]}

weekly format:
{"mode":"weekly","plan":[{"day":"월요일","meal":{...same as menu...}}, ...7 days]}

Rules: prioritize the user's ingredients; scale to servings; steps must be 4-6 detailed Korean instructions; for weekly vary cuisine across 7 days; next_suggestions exactly 2 (single only). Do NOT include coupang_url — the app adds it. Return ONLY JSON.`;

async function tryApi(ingredients, servings, cuisine, mode) {
  const list = ingredients.length ? ingredients.map((i) => `${i.name}(${i.quantity})`).join(", ") : "없음";
  const userMessage = `냉장고 재료: ${list}\n인원: ${servings}인분\n선호: ${cuisine}\n방식: ${mode === "single" ? "오늘 메뉴 1개" : "일주일 7일"}\nJSON만 응답.`;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  if (!res.ok) throw new Error("api_" + res.status);
  const data = await res.json();
  const raw = (data.content || []).map((b) => b.text || "").join("");
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("no_json");
  const parsed = JSON.parse(m[0]);
  // 쿠팡 링크 주입
  const inject = (menu) => {
    if (menu?.missing_ingredients) {
      menu.missing_ingredients = menu.missing_ingredients.map((x) => ({
        ...x, coupang_url: coupangUrl(x.name),
      }));
    }
    return menu;
  };
  if (parsed.mode === "single") {
    inject(parsed.menu);
    (parsed.next_suggestions || []).forEach(inject);
  } else if (parsed.mode === "weekly") {
    (parsed.plan || []).forEach((d) => inject(d.meal));
  }
  return parsed;
}

async function getRecommendation(ingredients, servings, cuisine, mode) {
  try {
    return await tryApi(ingredients, servings, cuisine, mode);
  } catch (e) {
    // 어떤 오류든 로컬 레시피로 폴백 → 사용자에겐 항상 결과 표시
    return buildLocalResult(ingredients, servings, cuisine, mode);
  }
}

// ── 메뉴 카드 ──────────────────────────────────────────────────────────
function MenuCard({ menu, onClick }) {
  const diffColor = { 쉬움: "#22c55e", 보통: "#f59e0b", 어려움: "#ef4444" };
  return (
    <div onClick={onClick}
      style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.15)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.08)"; }}
    >
      <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
        <FoodImage name={menu.name} height={200} />
        <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,0.92)", borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 700, color: "#374151" }}>
          {CUISINE_LABELS[menu.category] || "🍽"} {menu.category}
        </div>
        {menu.difficulty && (
          <div style={{ position: "absolute", top: 12, right: 12, background: diffColor[menu.difficulty] || "#9ca3af", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: "#fff" }}>
            {menu.difficulty}
          </div>
        )}
      </div>
      <div style={{ padding: "16px 20px 20px" }}>
        <h3 className="handwrite" style={{ margin: "0 0 6px", fontSize: 23, fontWeight: 700, color: "#111827" }}>{menu.name}</h3>
        <p style={{ margin: "0 0 12px", fontSize: 14, color: "#6b7280", lineHeight: 1.5 }}>{menu.description}</p>
        <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#9ca3af", flexWrap: "wrap" }}>
          {menu.cook_time && <span>⏱ {menu.cook_time}</span>}
          {menu.servings && <span>👥 {menu.servings}인분</span>}
          {menu.missing_ingredients?.length > 0 && <span style={{ color: "#f87171" }}>🛒 {menu.missing_ingredients.length}개 구매필요</span>}
        </div>
      </div>
    </div>
  );
}

// ── 메뉴 상세 (사진 + 하단 레시피 + 쿠팡) ──────────────────────────────
function MenuDetail({ menu, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 24, maxWidth: 640, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }} onClick={(e) => e.stopPropagation()}>
        {/* 음식 사진 */}
        <div style={{ position: "relative" }}>
          <FoodImage name={menu.name} height={300} radius="24px 24px 0 0" />
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 40, height: 40, cursor: "pointer", fontSize: 20, fontWeight: 700 }}>×</button>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "40px 28px 16px", background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }}>
            <h2 className="handwrite" style={{ margin: 0, fontSize: 32, fontWeight: 700, color: "#fff" }}>{menu.name}</h2>
          </div>
        </div>

        <div style={{ padding: "20px 28px 32px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {menu.category && <span style={{ background: "#fef3c7", color: "#92400e", borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 600 }}>{CUISINE_LABELS[menu.category] || "🍽"} {menu.category}</span>}
            {menu.cook_time && <span style={{ background: "#f0fdf4", color: "#166534", borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 600 }}>⏱ {menu.cook_time}</span>}
            {menu.servings && <span style={{ background: "#eff6ff", color: "#1e40af", borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 600 }}>👥 {menu.servings}인분</span>}
          </div>
          <p style={{ margin: "0 0 24px", fontSize: 15, color: "#6b7280", lineHeight: 1.6 }}>{menu.description}</p>

          {menu.used_ingredients?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: "#374151" }}>✅ 냉장고에서 사용할 재료</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {menu.used_ingredients.map((ing, i) => (
                  <span key={i} style={{ background: "#f0fdf4", color: "#166534", borderRadius: 20, padding: "6px 14px", fontSize: 14, fontWeight: 600 }}>{ing}</span>
                ))}
              </div>
            </div>
          )}

          {/* 부족 재료 → 쿠팡 구매 */}
          {menu.missing_ingredients?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#374151" }}>🛒 추가로 필요한 재료</h4>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: "#9ca3af" }}>평점 4점 이상·판매량 많은 가성비 상품 위주로 연결돼요</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {menu.missing_ingredients.map((ing, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff7ed", borderRadius: 12, padding: "10px 16px" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                      {ing.name} <span style={{ color: "#9ca3af", fontWeight: 400 }}>{ing.quantity}</span>
                    </span>
                    <button onClick={() => openExternal(ing.coupang_url)}
                      style={{ background: "#ff5722", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", cursor: "pointer" }}>
                      🛍 쿠팡 최저가
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 만드는 방법 — 단계별 일러스트(이모지) + 설명 */}
          {menu.steps?.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#374151" }}>👨‍🍳 만드는 방법</h4>
                <button onClick={() => openExternal(naverRecipeUrl(menu.name))}
                  style={{ background: "#03c75a", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                  <span style={{ fontWeight: 900, fontSize: 13 }}>N</span> 블로그 레시피·사진 보기
                </button>
              </div>
              <p style={{ margin: "0 0 14px", fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>
                처음 만드는 음식이라면 위 버튼으로 네이버 블로그의 실제 조리 사진과 후기를 함께 확인해보세요 👀
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {menu.steps.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "#fafafa", borderRadius: 14, padding: "12px 14px" }}>
                    <div style={{ minWidth: 44, height: 44, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                      {stepEmoji(step)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#ff6b35" }}>STEP {i + 1}</span>
                      <p style={{ margin: "2px 0 0", fontSize: 15, color: "#374151", lineHeight: 1.55 }}>{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: "20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <h3 style={{ margin: "0 0 2px", fontSize: 17, fontWeight: 800, color: "#111827" }}>{title}</h3>
      {subtitle && <p style={{ margin: "0 0 16px", fontSize: 13, color: "#9ca3af" }}>{subtitle}</p>}
      {children}
    </div>
  );
}

// ── 메인 앱 ─────────────────────────────────────────────────────────────
function App() {
  const [step, setStep] = useState("setup");
  const [activeCategory, setActiveCategory] = useState("채소");
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [pendingIngredient, setPendingIngredient] = useState(null);
  const [servings, setServings] = useState(2);
  const [cuisine, setCuisine] = useState("상관없음");
  const [planMode, setPlanMode] = useState("single");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [detailMenu, setDetailMenu] = useState(null);
  const [customInput, setCustomInput] = useState("");

  function addCustomIngredient() {
    const name = customInput.trim();
    if (!name) return;
    if (selectedIngredients.find((i) => i.name === name)) { setCustomInput(""); return; }
    // 직접 추가한 재료는 수량 선택 모달을 띄워 단위까지 받음
    setPendingIngredient({ name, emoji: "🧺", category: "직접추가" });
    setCustomInput("");
  }

  function handleIngredientClick(item) {
    const exists = selectedIngredients.find((i) => i.name === item.name);
    if (exists) setSelectedIngredients((prev) => prev.filter((i) => i.name !== item.name));
    else setPendingIngredient({ ...item, category: activeCategory });
  }

  function confirmQuantity(qty) {
    if (!pendingIngredient) return;
    setSelectedIngredients((prev) => [...prev, { ...pendingIngredient, quantity: qty }]);
    setPendingIngredient(null);
  }

  async function handleSubmit() {
    setLoading(true);
    const data = await getRecommendation(selectedIngredients, servings, cuisine, planMode);
    setResult(data);
    setStep("result");
    setLoading(false);
  }

  const quantityOptions = pendingIngredient ? getQuantityOptions(pendingIngredient.category, pendingIngredient.name) : [];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #fff8f0 0%, #fff3e8 50%, #ffeedd 100%)", fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&display=swap'); .handwrite{font-family:'Gaegu','Noto Sans KR',sans-serif;}`}</style>
      <div style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c42)", padding: "20px 24px", textAlign: "center", boxShadow: "0 4px 20px rgba(255,107,53,0.3)" }}>
        <div style={{ fontSize: 36, marginBottom: 4 }}>🍳</div>
        <h1 className="handwrite" style={{ margin: 0, color: "#fff", fontSize: 28, fontWeight: 700 }}>냉장고 요리사</h1>
        <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.85)", fontSize: 14 }}>있는 재료로 오늘 뭐 먹을지 알려드려요!</p>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 60px" }}>
        {step === "setup" && (
          <>
            <SectionCard title="🥬 냉장고 재료 선택" subtitle="카테고리 탭 → 재료 선택 → 수량 고르기">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                {Object.keys(INGREDIENT_CATEGORIES).map((cat) => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    style={{ padding: "8px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all 0.15s", background: activeCategory === cat ? "#ff6b35" : "#fff", color: activeCategory === cat ? "#fff" : "#374151", boxShadow: activeCategory === cat ? "0 4px 12px rgba(255,107,53,0.35)" : "0 1px 4px rgba(0,0,0,0.08)" }}>
                    {INGREDIENT_CATEGORIES[cat].emoji} {cat}
                  </button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))", gap: 10 }}>
                {INGREDIENT_CATEGORIES[activeCategory].items.map((item) => {
                  const selected = selectedIngredients.find((i) => i.name === item.name);
                  return (
                    <button key={item.name} onClick={() => handleIngredientClick(item)}
                      style={{ background: selected ? "#ff6b35" : "#fff", border: `2px solid ${selected ? "#ff6b35" : "#e5e7eb"}`, borderRadius: 14, padding: "12px 6px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.15s", boxShadow: selected ? "0 4px 12px rgba(255,107,53,0.3)" : "none" }}>
                      <span style={{ fontSize: 26 }}>{item.emoji}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: selected ? "#fff" : "#374151", textAlign: "center" }}>{item.name}</span>
                      {selected && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>{selected.quantity}</span>}
                    </button>
                  );
                })}
              </div>

              {/* 목록에 없는 재료 직접 추가 */}
              <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addCustomIngredient(); }}
                  placeholder="목록에 없는 재료 직접 입력 (예: 부추)"
                  style={{ flex: 1, padding: "11px 14px", borderRadius: 12, border: "2px solid #e5e7eb", fontSize: 14, outline: "none" }}
                />
                <button onClick={addCustomIngredient}
                  style={{ background: "#ff6b35", color: "#fff", border: "none", borderRadius: 12, padding: "0 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                  + 추가
                </button>
              </div>

              {selectedIngredients.length > 0 && (
                <div style={{ marginTop: 16, padding: "14px 16px", background: "#fff8f0", borderRadius: 14 }}>
                  <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "#92400e" }}>선택된 재료 ({selectedIngredients.length}개)</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {selectedIngredients.map((ing) => (
                      <span key={ing.name} onClick={() => setSelectedIngredients((prev) => prev.filter((i) => i.name !== ing.name))}
                        style={{ background: "#ff6b35", color: "#fff", borderRadius: 20, padding: "5px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                        {ing.emoji} {ing.name} · {ing.quantity} ✕
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>

            <SectionCard title="👥 몇 인분?" subtitle="먹을 사람 수를 선택해주세요">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button key={n} onClick={() => setServings(n)}
                    style={{ width: 56, height: 56, borderRadius: 14, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 18, background: servings === n ? "#ff6b35" : "#fff", color: servings === n ? "#fff" : "#374151", boxShadow: servings === n ? "0 4px 12px rgba(255,107,53,0.4)" : "0 1px 4px rgba(0,0,0,0.08)", transition: "all 0.15s" }}>
                    {n}
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="🍽 음식 종류" subtitle="어떤 요리가 땡기시나요?">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {Object.keys(CUISINE_LABELS).map((c) => (
                  <button key={c} onClick={() => setCuisine(c)}
                    style={{ padding: "12px 22px", borderRadius: 14, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 15, background: cuisine === c ? "#ff6b35" : "#fff", color: cuisine === c ? "#fff" : "#374151", boxShadow: cuisine === c ? "0 4px 12px rgba(255,107,53,0.4)" : "0 1px 4px rgba(0,0,0,0.08)", transition: "all 0.15s" }}>
                    {CUISINE_LABELS[c]} {c}
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="📅 추천 방식" subtitle="오늘 하루 or 일주일치?">
              <div style={{ display: "flex", gap: 10 }}>
                {[{ key: "single", label: "🍳 오늘 메뉴", sub: "1가지 추천" }, { key: "weekly", label: "📆 일주일 메뉴", sub: "7일 플랜" }].map(({ key, label, sub }) => (
                  <button key={key} onClick={() => setPlanMode(key)}
                    style={{ flex: 1, padding: "16px", borderRadius: 16, border: "none", cursor: "pointer", background: planMode === key ? "#ff6b35" : "#fff", color: planMode === key ? "#fff" : "#374151", boxShadow: planMode === key ? "0 4px 12px rgba(255,107,53,0.4)" : "0 1px 4px rgba(0,0,0,0.08)", transition: "all 0.15s", textAlign: "center" }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{label}</div>
                    <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>{sub}</div>
                  </button>
                ))}
              </div>
            </SectionCard>

            <button onClick={handleSubmit} disabled={loading}
              style={{ width: "100%", padding: "18px", borderRadius: 20, border: "none", cursor: loading ? "wait" : "pointer", background: loading ? "#fbd0b5" : "linear-gradient(135deg, #ff6b35, #ff8c42)", color: "#fff", fontWeight: 900, fontSize: 18, boxShadow: loading ? "none" : "0 8px 24px rgba(255,107,53,0.4)", transition: "all 0.2s" }}>
              {loading ? "🍳 메뉴 추천 중..." : "✨ 메뉴 추천받기"}
            </button>
          </>
        )}

        {step === "result" && result && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <button onClick={() => { setStep("setup"); setResult(null); }}
                style={{ background: "#fff", border: "none", borderRadius: 12, padding: "10px 18px", cursor: "pointer", fontWeight: 700, fontSize: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", color: "#374151" }}>
                ← 다시 설정
              </button>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#111827" }}>
                {planMode === "single" ? "🍳 오늘의 추천 메뉴" : "📅 일주일 메뉴 플랜"}
              </h2>
            </div>

            {result.mode === "single" && result.menu && (
              <>
                <MenuCard menu={result.menu} onClick={() => setDetailMenu(result.menu)} />
                {result.next_suggestions?.length > 0 && (
                  <div style={{ marginTop: 32 }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800, color: "#374151" }}>💡 다음엔 이런 건 어때요?</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                      {result.next_suggestions.map((menu, i) => (
                        <MenuCard key={i} menu={menu} onClick={() => setDetailMenu(menu)} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {result.mode === "weekly" && result.plan && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {result.plan.map((day, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                    <div style={{ background: "linear-gradient(135deg, #ff6b35, #ff8c42)", padding: "12px 20px" }}>
                      <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{day.day}</span>
                    </div>
                    <div style={{ padding: 16 }}>
                      <MenuCard menu={day.meal} onClick={() => setDetailMenu(day.meal)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {pendingIngredient && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 2000, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setPendingIngredient(null)}>
          <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "28px 24px 44px", width: "100%", maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 44 }}>{pendingIngredient.emoji}</span>
              <h3 style={{ margin: "8px 0 4px", fontSize: 20, fontWeight: 900, color: "#111827" }}>{pendingIngredient.name}</h3>
              <p style={{ margin: 0, fontSize: 14, color: "#9ca3af" }}>얼마나 있나요?</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 340, overflowY: "auto", paddingRight: 4 }}>
              {quantityOptions.map((qty) => (
                <button key={qty} onClick={() => confirmQuantity(qty)}
                  style={{ padding: "14px 20px", borderRadius: 14, border: "2px solid #f3f4f6", background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 15, color: "#374151", textAlign: "left", transition: "all 0.1s", flexShrink: 0 }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#fff8f0"; e.currentTarget.style.borderColor = "#ff6b35"; e.currentTarget.style.color = "#ff6b35"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#f3f4f6"; e.currentTarget.style.color = "#374151"; }}>
                  {qty}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {detailMenu && <MenuDetail menu={detailMenu} onClose={() => setDetailMenu(null)} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
