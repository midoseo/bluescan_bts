# 에스원 (S-1 Corp) · SECOM — SW UX Design System

A faithful, code-first reconstruction of the **에스원 / S-1 Corp** Software UX
guidelines. S-1 Corp (에스원, brand **SECOM / 세콤**) is Samsung's security &
facility-services subsidiary; this system codifies the design language shared
across its software products.

> **Confidential heritage.** The source guidelines are marked 대외비 (internal /
> confidential). Treat this reconstruction with the same care.

---

## 1. Sources

This system was rebuilt from the official guideline PDFs and brand fonts
provided by the user (stored under `uploads/`):

| Source | Detail |
|---|---|
| `01. Mobile SW UX 가이드라인 Ver2.3.pdf` | Mobile S/W UX Guideline, Ver 2.3 (2024.04), 74 pp — Foundation · Policy · Components for **mobile web + app** |
| `01. PC SW UX 가이드라인 Ver1.0.pdf` | PC S/W UX Guideline, Ver 1.0 (2025.01), 109 pp — Foundation · Policy · Components for **PC web** |
| `SamsungOneKorean-200…700_v2.0_hinted.ttf` | SamsungOne Korean webfonts, weights 200–700 (shipped) |

Extracted plaintext lives in `uploads/mobile_ux.txt` and `uploads/pc_ux.txt`
for reference. Guideline owner: **디자인그룹 (Design Group)** —
`s1.uxdesign@samsung.com`.

### ⚠️ Font substitution — please confirm
The guidelines specify **Pretendard** as the type family. The fonts you
provided are **SamsungOne Korean**. This system therefore ships SamsungOne
Korean as the primary face and loads **Pretendard from CDN as the
guideline-spec fallback** (see `tokens/fonts.css`). **Tell us which should be
authoritative** — if Pretendard, we'll drop SamsungOne to the fallback slot; if
SamsungOne, we keep it primary and can remove the CDN dependency.

### ⚠️ Icon substitution — please confirm
The guidelines define a proprietary **에스원 icon set** (24×24 grid, Line +
Solid styles, color set blue/white/gray) and full-color **Graphic icons**.
Those binaries were **not included**, so cards and kits use **Google Material
Symbols Rounded** (loaded from CDN) — chosen because it matches the 24px grid
and offers a fill axis that mirrors the system's Line/Solid duality. **Please
send the real icon set / sprite / SVGs** and we'll swap it in.

---

## 2. Products represented

The system spans two surfaces with a shared foundation:

1. **Mobile App** (모바일 앱 / 모바일 웹) — customer-facing security &
   monitoring app (SECOM). Home dashboard, device arm/disarm (경비/해제), video
   monitoring, device registration, member flows. Fixed header + bottom
   navigation, scrolling content, home background `#F5F6FB`.
2. **PC Web** (PC 웹) — admin / management portals (e.g. building control
   "관제시스템", commute-bus & facility management). 1920×1080 base, content
   1280/1440px, header (toolbar + GNB + breadcrumb) + content + footer; dense
   tables, forms, modals, dashboards.

---

## 3. Content fundamentals

How S-1 writes copy (Korean):

- **Tone — 해요체, warm & polite.** Sentences end in soft polite forms:
  `~해요`, `~해 주세요`, `~할까요?`, `~하시겠어요?`. Never blunt imperatives or
  noun-stacks. The customer is always **고객님**.
- **Choices are phrased as questions.** Dialogs ask *"다음부터 자동으로
  로그인할까요?"* and answer with **아니오 / 네** (or 취소 / 확인, 닫기 / 해지).
  Destructive confirms can swap 아니오 for 닫기·취소·나중에.
- **Task-first titles.** Process titles describe the task in ≤2 lines
  (*"인증 번호 6자리를 입력해 주세요"*); extra explanation goes in a subtitle, not
  the title. Titles are never used for plain feature labels.
- **Plain, reassuring guidance.** Helper text explains *why* (*"휴대전화번호를
  수정하려면 본인 인증을 해주세요."*). Errors are factual and kind
  (*"인증 번호가 일치하지 않습니다. 확인하신 후 다시 입력해 주세요."*).
- **No emoji.** None in product copy. Bullet lists use `•`. Required fields use
  a red `*`. Numbers/codes are tabular.
- **Korean-first, light English.** English appears only for product/system
  terms (NVR, QR, NFC, SMS, ID); UI labels stay Korean.

Examples — see `guidelines/brand-voice.html`.

---

## 4. Visual foundations

- **Color.** Three families only: **Main** (Primary Blue `#1D6CEB`, Secondary
  Red `#E50533`), **Neutral** (black→white gray ramp; the *only* grays for UI),
  and **Sub/Graphic** (orange, yellow, seagreen, turquoise, purple, brown +
  graphic-grays) reserved strictly for charts, color icons & illustration.
  Blue = positive/confirm/save; Red = error/caution/emphasis. No colors outside
  these families. Tokens in `tokens/colors.css`.
- **Type.** SamsungOne Korean (→ Pretendard fallback). One scale shared across
  products: **32B / 24B / 20B / 18B·18M** (titles), **18·16·14 M/R** body at
  130% line-height and **−2% letter-spacing**, **12 M/R** caption at 140%/0%,
  **10 M/R** micro at 140%/+2% (PC). Weights used: Regular 400, Medium 500, Bold
  700. Tokens in `tokens/typography.css`.
- **Spacing & size.** 2-based spacing scale (2…64, plus 80/132/140 on PC).
  Mobile side margin **20**. Radius **XS 2 · S 4 · M 8 · L 10 · Full 999** (M is
  the default for cards/inputs/buttons). Icon grid 24px (XXS16…L32; >32 needs
  approval → use a graphic icon). Tokens in `tokens/spacing.css`.
- **Surfaces & backgrounds.** Mostly flat white. App **home/dashboard sits on
  `#F5F6FB`** with white cards; other main screens are white. No gradients in
  UI, no photographic hero backgrounds (imagery is functional — camera feeds,
  thumbnails). Illustrations are flat full-color built from basic shapes with
  low complementary contrast.
- **Cards.** Rounded (radius L/M), white with a **soft, low-contrast shadow** +
  faint hairline border — they do *not* rely on heavy drop shadows. "Gray box"
  (`#F5F5F5`) is the sunken sub-info variant; "line" is a bordered variant.
- **Borders & dividers.** 1px gray hairlines (`gray200`/`gray100`); dividers
  separate list rows and form groups.
- **Elevation.** Four soft tiers (card / raised / overlay / bottom-sheet) — see
  `tokens/spacing.css` and `guidelines/spacing-elevation.html`.
- **Motion.** Restrained and functional. Standard ease `cubic-bezier(.4,0,.2,1)`,
  durations 120/200/300ms. Hover = subtle tint (gray-50 / accent-subtle); press
  = slightly darker + ~0.99 scale. Switches/dialogs use short fades & slides; no
  bouncy or infinite decorative animation. Reduced-motion respected.
- **Accessibility.** Components target **≥4.5:1** text contrast (3:1 allowed for
  ≥18pt or bold ≥14pt). Guidance text must not rely on color/shape/position
  alone. Touch targets ≥44px.
- **Transparency / blur.** Used sparingly — only the modal/dialog **scrim**
  (`#000` @ 30%). No glassmorphism.

---

## 5. Iconography

- **System approach.** S-1 uses a **proprietary 24×24 icon set** in two styles —
  **Line** and **Solid** — colored only blue / white / gray_light / gray_dark
  (gray `#757575` allowed when paired text is body3). Categories: security,
  communication, weather, products, papers, media, vehicles, building,
  network-security, human, tools. Full-color **Graphic icons** exist for richer
  dashboard/illustration moments.
- **Launcher icons.** Built from a symbol + 사명, using a *separate* brand
  palette — Blue `#0072CE`, Red `#FF312C`, Dark Red `#BE1E2C` — stroke weight
  fixed 32px, Red ≤30% of the mark (see `guidelines/brand-launcher-colors.html`).
- **Emoji / unicode.** Never used as iconography.
- **This reconstruction** substitutes **Material Symbols Rounded** (CDN,
  `FILL 0` ≈ Line, `FILL 1` ≈ Solid) until the real set is supplied. Components
  accept any icon node, so swapping the set later is a drop-in change.
- **Logos.** No CI/BI files were provided; cards use a `SAMPLE LOGO` slot (the
  guideline's own placeholder) and an "S1 / 에스원 · SECOM" text lockup. Supply
  the real CI to finalize.

---

## 6. What's in here (manifest)

**Root**
- `styles.css` — the single entry point consumers link (imports only).
- `readme.md` — this guide. · `SKILL.md` — Agent-Skill front matter.

**`tokens/`** — `fonts.css` · `colors.css` · `typography.css` · `spacing.css` ·
`base.css` (element defaults + `.s1-*` type utility classes).

**`assets/fonts/`** — SamsungOne Korean TTFs (200–700).

**`guidelines/`** — Design-System-tab specimen cards (Type, Colors, Spacing,
Brand): title/body/caption type, primary/secondary/neutral/sub-graphic/text/
surface colors, radius/spacing/icon-size/elevation, launcher colors, logo,
voice & tone.

**`components/`** — 18 React primitives (namespace `window.UXDesignSystem_59a60b`):
- `buttons/` — **Button**, **IconButton**
- `forms/` — **TextField**, **Select**, **Textarea**
- `selection/` — **Checkbox**, **Radio**, **Switch**, **Chip**
- `feedback/` — **Badge**, **Dialog**, **Tooltip**, **Spinner**
- `data/` — **Card**, **ListRow**, **Tabs**
- `navigation/` — **BottomNav**, **Pagination**

Each directory carries a `*.card.html` thumbnail; each component has a
`.d.ts` (props contract) and `.prompt.md` (usage). **Button**, **TextField**,
**Card** and **Dialog** are exposed as Starting Points.

**`ui_kits/`** — full-screen product recreations:
- `pc_web/` — **에스원 관제 관리자 포털** (PC web). GNB header (toolbar + menu +
  breadcrumb), notification bar, dashboard (hero search, KPI / progress /
  energy cards, bar chart, notices), board list (line tabs + filter form +
  data table + pagination), input/output forms, comments, and a password
  modal. Composes the primitives above; table / header / filter / dashboard
  widgets are kit-level compositions. See `ui_kits/pc_web/README.md`.

> The **Mobile App** kit was de-scoped at the user's request; mobile patterns
> still live in the foundations, components, and the Mobile guideline source.

---

## 7. Caveats / open items

1. **Font authority** — confirm Pretendard vs SamsungOne Korean (see §1).
2. **Icon set** — supply the real 에스원 Line/Solid + Graphic icons (§5).
3. **Logos / CI-BI** — no brand marks provided; placeholders in use.
4. **Illustrations & loading (GIF/JSON)** — guideline references separate
   resource files not provided; omitted.
5. **Mobile App UI kit** — de-scoped per user request (PC Web kit shipped).
6. **Blue 600** differs slightly between docs (PC `#2453CC` / mobile `#2747B9`);
   we use the PC value as the token default.
