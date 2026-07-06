/* @ds-bundle: {"format":3,"namespace":"UXDesignSystem_59a60b","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"IconButton","sourcePath":"components/buttons/IconButton.jsx"},{"name":"Card","sourcePath":"components/data/Card.jsx"},{"name":"ListRow","sourcePath":"components/data/ListRow.jsx"},{"name":"Tabs","sourcePath":"components/data/Tabs.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Spinner","sourcePath":"components/feedback/Spinner.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"TextField","sourcePath":"components/forms/TextField.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"BottomNav","sourcePath":"components/navigation/BottomNav.jsx"},{"name":"Pagination","sourcePath":"components/navigation/Pagination.jsx"},{"name":"Checkbox","sourcePath":"components/selection/Checkbox.jsx"},{"name":"Chip","sourcePath":"components/selection/Chip.jsx"},{"name":"Radio","sourcePath":"components/selection/Radio.jsx"},{"name":"Switch","sourcePath":"components/selection/Switch.jsx"}],"sourceHashes":{"components/buttons/Button.jsx":"2e03e736780d","components/buttons/IconButton.jsx":"5bfc791294b5","components/data/Card.jsx":"17d8227acc07","components/data/ListRow.jsx":"dc014be0efea","components/data/Tabs.jsx":"c27590d70f60","components/feedback/Badge.jsx":"ccff2e59b8af","components/feedback/Dialog.jsx":"4175fecdf2f4","components/feedback/Spinner.jsx":"e3ea94f1d753","components/feedback/Tooltip.jsx":"f934cfd27b71","components/forms/Select.jsx":"567084696701","components/forms/TextField.jsx":"2d26414b02a2","components/forms/Textarea.jsx":"eb8fc581434b","components/navigation/BottomNav.jsx":"dbd592c97647","components/navigation/Pagination.jsx":"dc2b557f7794","components/selection/Checkbox.jsx":"f84b28629c57","components/selection/Chip.jsx":"b6fdb2ac87cb","components/selection/Radio.jsx":"fb3d0b93b9bd","components/selection/Switch.jsx":"ced5deebdf13","ui_kits/pc_web/screens.jsx":"3b9a5d1430e9"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.UXDesignSystem_59a60b = window.UXDesignSystem_59a60b || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Inject component CSS once (token-driven; no CSS-in-JS libs). */
const STYLE_ID = "s1-button-styles";
function useButtonStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
  .s1-btn{
    display:inline-flex;align-items:center;justify-content:center;gap:6px;
    font-family:var(--font-base);font-weight:var(--weight-medium);
    letter-spacing:-.02em;border-radius:var(--radius-m);border:1px solid transparent;
    cursor:pointer;white-space:nowrap;user-select:none;
    transition:background var(--dur-fast) var(--ease-standard),
               border-color var(--dur-fast) var(--ease-standard),
               color var(--dur-fast) var(--ease-standard),
               transform var(--dur-fast) var(--ease-standard);
  }
  .s1-btn:focus-visible{outline:2px solid var(--border-focus);outline-offset:2px;}
  .s1-btn--lg{height:48px;padding:0 20px;font-size:var(--fs-16);}
  .s1-btn--sm{height:36px;padding:0 14px;font-size:var(--fs-14);}
  .s1-btn--block{width:100%;}
  .s1-btn__icon{display:inline-grid;place-items:center;font-size:1.25em;line-height:1;}

  /* primary (blue) */
  .s1-btn--primary{background:var(--accent);color:var(--text-on-accent);}
  .s1-btn--primary:hover{background:var(--accent-hover);}
  .s1-btn--primary:active{background:var(--accent-pressed);transform:scale(.99);}
  .s1-btn--primary.s1-btn--danger{background:var(--danger);}
  .s1-btn--primary.s1-btn--danger:hover{background:var(--danger-hover);}

  /* secondary (white) */
  .s1-btn--secondary{background:var(--s1-white);color:var(--text-body);border-color:var(--border-strong);}
  .s1-btn--secondary:hover{background:var(--s1-gray-50);}
  .s1-btn--secondary:active{background:var(--s1-gray-100);transform:scale(.99);}

  /* line (blue outline) */
  .s1-btn--line{background:var(--s1-white);color:var(--accent);border-color:var(--accent);}
  .s1-btn--line:hover{background:var(--accent-subtle);}
  .s1-btn--line:active{background:var(--s1-blue-100);transform:scale(.99);}
  .s1-btn--line.s1-btn--danger{color:var(--danger);border-color:var(--danger);}
  .s1-btn--line.s1-btn--danger:hover{background:var(--danger-subtle);}

  .s1-btn:disabled,.s1-btn[aria-disabled="true"]{
    cursor:not-allowed;transform:none;
    background:var(--s1-gray-100);color:var(--text-disabled);border-color:transparent;
  }
  .s1-btn--line:disabled,.s1-btn--secondary:disabled{
    background:var(--s1-white);border-color:var(--border-default);color:var(--text-disabled);
  }
  `;
  document.head.appendChild(el);
}
function Button({
  children,
  variant = "primary",
  size = "lg",
  danger = false,
  block = false,
  iconLeft,
  iconRight,
  disabled = false,
  type = "button",
  className = "",
  ...rest
}) {
  useButtonStyles();
  const cls = ["s1-btn", `s1-btn--${variant}`, `s1-btn--${size}`, danger ? "s1-btn--danger" : "", block ? "s1-btn--block" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: cls,
    disabled: disabled
  }, rest), iconLeft ? /*#__PURE__*/React.createElement("span", {
    className: "s1-btn__icon"
  }, iconLeft) : null, children, iconRight ? /*#__PURE__*/React.createElement("span", {
    className: "s1-btn__icon"
  }, iconRight) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = "s1-iconbutton-styles";
function useIconButtonStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
  .s1-iconbtn-wrap{display:inline-flex;flex-direction:column;align-items:center;gap:6px;}
  .s1-iconbtn{
    display:inline-grid;place-items:center;cursor:pointer;border:1px solid transparent;
    background:var(--s1-white);color:var(--s1-gray-800);
    transition:background var(--dur-fast) var(--ease-standard),
               transform var(--dur-fast) var(--ease-standard),
               color var(--dur-fast) var(--ease-standard);
  }
  .s1-iconbtn:focus-visible{outline:2px solid var(--border-focus);outline-offset:2px;}
  .s1-iconbtn--circle{border-radius:var(--radius-full);}
  .s1-iconbtn--square{border-radius:var(--radius-m);}
  .s1-iconbtn--md{width:48px;height:48px;font-size:24px;}
  .s1-iconbtn--lg{width:56px;height:56px;font-size:26px;}
  .s1-iconbtn--sm{width:40px;height:40px;font-size:20px;}

  .s1-iconbtn--default{border-color:var(--border-default);}
  .s1-iconbtn--default:hover{background:var(--s1-gray-50);}
  .s1-iconbtn--default:active{background:var(--s1-gray-100);transform:scale(.96);}

  .s1-iconbtn--action{background:var(--accent);color:var(--text-on-accent);border-color:transparent;}
  .s1-iconbtn--action:hover{background:var(--accent-hover);}
  .s1-iconbtn--action:active{transform:scale(.96);}

  .s1-iconbtn--danger{background:var(--danger);color:#fff;}
  .s1-iconbtn--danger:hover{background:var(--danger-hover);}

  .s1-iconbtn:disabled{cursor:not-allowed;background:var(--s1-gray-100);color:var(--text-disabled);border-color:transparent;transform:none;}
  .s1-iconbtn__label{font:var(--type-12m);letter-spacing:0;color:var(--text-secondary);}
  `;
  document.head.appendChild(el);
}
function IconButton({
  icon,
  label,
  shape = "circle",
  variant = "default",
  size = "md",
  disabled = false,
  ariaLabel,
  className = "",
  ...rest
}) {
  useIconButtonStyles();
  const cls = ["s1-iconbtn", `s1-iconbtn--${shape}`, `s1-iconbtn--${variant}`, `s1-iconbtn--${size}`, className].filter(Boolean).join(" ");
  const btn = /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: cls,
    disabled: disabled,
    "aria-label": ariaLabel || label
  }, rest), icon);
  if (!label) return btn;
  return /*#__PURE__*/React.createElement("span", {
    className: "s1-iconbtn-wrap"
  }, btn, /*#__PURE__*/React.createElement("span", {
    className: "s1-iconbtn__label"
  }, label));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/data/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = "s1-card-styles";
function useStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
  .s1-card{font-family:var(--font-base);border-radius:var(--radius-l);
    background:var(--s1-white);padding:20px;display:block;width:100%;text-align:left;
    border:1px solid transparent;
    transition:box-shadow var(--dur-fast) var(--ease-standard),border-color var(--dur-fast) var(--ease-standard);}
  .s1-card--white{box-shadow:var(--shadow-card);border-color:var(--border-subtle);}
  .s1-card--gray{background:var(--s1-gray-50);}
  .s1-card--line{border-color:var(--border-default);}
  .s1-card--interactive{cursor:pointer;}
  .s1-card--interactive:hover{box-shadow:var(--shadow-raised);border-color:var(--border-default);}
  .s1-card--interactive:active{transform:scale(.995);}
  .s1-card__head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;}
  .s1-card__title{font:var(--type-18b);letter-spacing:0;color:var(--text-title);}
  .s1-card__action{flex:none;}
  `;
  document.head.appendChild(el);
}
function Card({
  variant = "white",
  title,
  headerAction,
  interactive = false,
  onClick,
  children,
  className = "",
  ...rest
}) {
  useStyles();
  const cls = ["s1-card", `s1-card--${variant}`, interactive || onClick ? "s1-card--interactive" : "", className].filter(Boolean).join(" ");
  const Tag = onClick ? "button" : "div";
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: cls,
    onClick: onClick,
    type: onClick ? "button" : undefined
  }, rest), title || headerAction ? /*#__PURE__*/React.createElement("div", {
    className: "s1-card__head"
  }, title ? /*#__PURE__*/React.createElement("h3", {
    className: "s1-card__title"
  }, title) : /*#__PURE__*/React.createElement("span", null), headerAction ? /*#__PURE__*/React.createElement("div", {
    className: "s1-card__action"
  }, headerAction) : null) : null, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Card.jsx", error: String((e && e.message) || e) }); }

// components/data/ListRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = "s1-listrow-styles";
function useStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
  .s1-row{display:flex;align-items:center;gap:12px;width:100%;text-align:left;
    font-family:var(--font-base);background:transparent;border:0;padding:14px 4px;}
  .s1-row--divider{border-bottom:1px solid var(--divider);}
  .s1-row--interactive{cursor:pointer;border-radius:var(--radius-s);
    transition:background var(--dur-fast) var(--ease-standard);}
  .s1-row--interactive:hover{background:var(--s1-gray-50);}
  .s1-row__lead{flex:none;display:grid;place-items:center;}
  .s1-row__lead .material-symbols-rounded{font-size:24px;color:var(--text-secondary);}
  .s1-row__body{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;}
  .s1-row__title{font:var(--type-16m);letter-spacing:-.02em;color:var(--text-body);
    overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .s1-row__desc{font:var(--type-14r);letter-spacing:-.02em;color:var(--text-tertiary);
    overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .s1-row__trail{flex:none;display:flex;align-items:center;gap:8px;
    font:var(--type-14r);letter-spacing:-.02em;color:var(--text-tertiary);}
  .s1-row__chev{font-size:22px;color:var(--text-placeholder);}
  `;
  document.head.appendChild(el);
}
function ListRow({
  title,
  description,
  leading,
  trailing,
  chevron = false,
  divider = true,
  onClick,
  className = "",
  ...rest
}) {
  useStyles();
  const interactive = !!onClick || chevron;
  const cls = ["s1-row", divider ? "s1-row--divider" : "", interactive ? "s1-row--interactive" : "", className].filter(Boolean).join(" ");
  const Tag = onClick ? "button" : "div";
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: cls,
    onClick: onClick,
    type: onClick ? "button" : undefined
  }, rest), leading ? /*#__PURE__*/React.createElement("span", {
    className: "s1-row__lead"
  }, leading) : null, /*#__PURE__*/React.createElement("span", {
    className: "s1-row__body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "s1-row__title"
  }, title), description ? /*#__PURE__*/React.createElement("span", {
    className: "s1-row__desc"
  }, description) : null), trailing || chevron ? /*#__PURE__*/React.createElement("span", {
    className: "s1-row__trail"
  }, trailing, chevron ? /*#__PURE__*/React.createElement("span", {
    className: "s1-row__chev material-symbols-rounded"
  }, "chevron_right") : null) : null);
}
Object.assign(__ds_scope, { ListRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ListRow.jsx", error: String((e && e.message) || e) }); }

// components/data/Tabs.jsx
try { (() => {
const STYLE_ID = "s1-tabs-styles";
function useStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
  .s1-tabs{display:flex;font-family:var(--font-base);border-bottom:1px solid var(--border-subtle);gap:0;}
  .s1-tabs--fill .s1-tab{flex:1;}
  .s1-tab{position:relative;background:transparent;border:0;cursor:pointer;
    padding:12px 18px;font:var(--type-16m);letter-spacing:-.02em;color:var(--text-tertiary);
    white-space:nowrap;transition:color var(--dur-fast) var(--ease-standard);}
  .s1-tab:hover{color:var(--text-body);}
  .s1-tab[aria-selected="true"]{color:var(--text-title);font-weight:var(--weight-bold);}
  .s1-tab[aria-selected="true"]::after{content:"";position:absolute;left:12px;right:12px;bottom:-1px;
    height:2px;background:var(--accent);border-radius:2px 2px 0 0;}
  .s1-tab:disabled{color:var(--text-disabled);cursor:not-allowed;}
  `;
  document.head.appendChild(el);
}
function Tabs({
  tabs = [],
  value,
  onChange,
  fill = false,
  className = ""
}) {
  useStyles();
  const norm = tabs.map(t => typeof t === "string" ? {
    value: t,
    label: t
  } : t);
  const active = value != null ? value : norm[0] && norm[0].value;
  return /*#__PURE__*/React.createElement("div", {
    className: ["s1-tabs", fill ? "s1-tabs--fill" : "", className].filter(Boolean).join(" "),
    role: "tablist"
  }, norm.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.value,
    type: "button",
    role: "tab",
    className: "s1-tab",
    "aria-selected": t.value === active,
    disabled: t.disabled,
    onClick: () => onChange && onChange(t.value)
  }, t.label)));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = "s1-badge-styles";
function useStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
  .s1-badge{display:inline-flex;align-items:center;gap:4px;
    font-family:var(--font-base);font:var(--type-12m);letter-spacing:0;
    height:24px;padding:0 8px;white-space:nowrap;line-height:1;}
  .s1-badge--square{border-radius:var(--radius-s);}
  .s1-badge--pill{border-radius:var(--radius-full);}
  .s1-badge__dot{width:6px;height:6px;border-radius:var(--radius-full);background:currentColor;}
  /* soft (default) — tinted bg + colored text */
  .s1-badge--soft.s1-badge--neutral{background:var(--s1-gray-100);color:var(--text-secondary);}
  .s1-badge--soft.s1-badge--info{background:var(--s1-blue-50);color:var(--s1-blue-600);}
  .s1-badge--soft.s1-badge--positive{background:var(--s1-seagreen-100);color:var(--s1-seagreen-700);}
  .s1-badge--soft.s1-badge--warning{background:var(--s1-yellow-100);color:var(--s1-yellow-800);}
  .s1-badge--soft.s1-badge--danger{background:var(--s1-red-50);color:var(--s1-red-600);}
  /* solid */
  .s1-badge--solid{color:#fff;}
  .s1-badge--solid.s1-badge--neutral{background:var(--s1-gray-500);}
  .s1-badge--solid.s1-badge--info{background:var(--accent);}
  .s1-badge--solid.s1-badge--positive{background:var(--s1-seagreen-600);}
  .s1-badge--solid.s1-badge--warning{background:var(--s1-yellow-600);color:var(--s1-gray-900);}
  .s1-badge--solid.s1-badge--danger{background:var(--danger);}
  /* outline */
  .s1-badge--outline{background:transparent;border:1px solid currentColor;}
  .s1-badge--outline.s1-badge--neutral{color:var(--text-secondary);border-color:var(--border-strong);}
  .s1-badge--outline.s1-badge--info{color:var(--accent);}
  .s1-badge--outline.s1-badge--positive{color:var(--s1-seagreen-700);}
  .s1-badge--outline.s1-badge--warning{color:var(--s1-yellow-800);}
  .s1-badge--outline.s1-badge--danger{color:var(--danger);}
  `;
  document.head.appendChild(el);
}
function Badge({
  children,
  tone = "neutral",
  variant = "soft",
  shape = "square",
  dot = false,
  className = "",
  ...rest
}) {
  useStyles();
  const cls = ["s1-badge", `s1-badge--${variant}`, `s1-badge--${tone}`, `s1-badge--${shape}`, className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), dot ? /*#__PURE__*/React.createElement("span", {
    className: "s1-badge__dot"
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
const STYLE_ID = "s1-dialog-styles";
function useStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
  .s1-dlg__scrim{position:fixed;inset:0;background:var(--surface-dim);z-index:1000;
    display:grid;place-items:center;padding:20px;
    animation:s1dlgfade var(--dur-normal) var(--ease-out);}
  @keyframes s1dlgfade{from{opacity:0}to{opacity:1}}
  .s1-dlg{background:var(--s1-white);border-radius:var(--radius-l);
    width:100%;max-width:var(--s1-dlg-w,360px);min-height:0;
    max-height:80vh;display:flex;flex-direction:column;overflow:hidden;
    box-shadow:var(--shadow-overlay);font-family:var(--font-base);
    animation:s1dlgpop var(--dur-normal) var(--ease-out);}
  @keyframes s1dlgpop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}
  .s1-dlg__head{padding:24px 24px 0;display:flex;align-items:flex-start;gap:8px;}
  .s1-dlg__titles{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;}
  .s1-dlg__title{font:var(--type-18b);letter-spacing:0;color:var(--text-title);}
  .s1-dlg__subtitle{font:var(--type-14r);letter-spacing:-.02em;color:var(--text-tertiary);}
  .s1-dlg__x{flex:none;border:0;background:transparent;cursor:pointer;color:var(--text-tertiary);
    display:grid;place-items:center;width:28px;height:28px;border-radius:var(--radius-s);margin:-2px -4px 0 0;}
  .s1-dlg__x:hover{background:var(--s1-gray-50);color:var(--text-body);}
  .s1-dlg__body{padding:14px 24px 4px;overflow:auto;
    font:var(--type-16r);letter-spacing:-.02em;color:var(--text-body);line-height:1.5;}
  .s1-dlg__foot{padding:20px 24px 24px;display:flex;gap:8px;}
  .s1-dlg__foot .s1-btn{flex:1;}
  `;
  document.head.appendChild(el);
}
function Dialog({
  open = true,
  onClose,
  title,
  subtitle,
  children,
  actions,
  closeButton = false,
  width,
  className = ""
}) {
  useStyles();
  if (!open) return null;
  const onScrim = e => {
    if (e.target === e.currentTarget && onClose) onClose();
  };
  const style = width ? {
    ["--s1-dlg-w"]: typeof width === "number" ? `${width}px` : width
  } : undefined;
  return /*#__PURE__*/React.createElement("div", {
    className: "s1-dlg__scrim",
    onMouseDown: onScrim
  }, /*#__PURE__*/React.createElement("div", {
    className: ["s1-dlg", className].filter(Boolean).join(" "),
    role: "dialog",
    "aria-modal": "true",
    style: style
  }, (title || closeButton) && /*#__PURE__*/React.createElement("div", {
    className: "s1-dlg__head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "s1-dlg__titles"
  }, title ? /*#__PURE__*/React.createElement("h2", {
    className: "s1-dlg__title"
  }, title) : null, subtitle ? /*#__PURE__*/React.createElement("p", {
    className: "s1-dlg__subtitle"
  }, subtitle) : null), closeButton ? /*#__PURE__*/React.createElement("button", {
    className: "s1-dlg__x material-symbols-rounded",
    "aria-label": "\uB2EB\uAE30",
    onClick: onClose
  }, "close") : null), /*#__PURE__*/React.createElement("div", {
    className: "s1-dlg__body"
  }, children), actions && actions.length ? /*#__PURE__*/React.createElement("div", {
    className: "s1-dlg__foot"
  }, actions.map((a, i) => /*#__PURE__*/React.createElement(__ds_scope.Button, {
    key: i,
    variant: a.variant || (i === actions.length - 1 ? "primary" : "secondary"),
    danger: a.danger,
    onClick: a.onClick
  }, a.label))) : null));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Spinner.jsx
try { (() => {
const STYLE_ID = "s1-spinner-styles";
function useStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
  .s1-spin-wrap{display:inline-flex;flex-direction:column;align-items:center;gap:12px;font-family:var(--font-base);}
  .s1-spin{display:inline-block;border-radius:var(--radius-full);
    border:3px solid var(--s1-blue-100);border-top-color:var(--accent);
    animation:s1spin .8s linear infinite;}
  @keyframes s1spin{to{transform:rotate(360deg)}}
  .s1-spin--sm{width:20px;height:20px;border-width:2px;}
  .s1-spin--md{width:32px;height:32px;}
  .s1-spin--lg{width:44px;height:44px;border-width:4px;}
  .s1-spin__label{font:var(--type-14r);letter-spacing:-.02em;color:var(--text-secondary);text-align:center;}
  .s1-spin__overlay{position:fixed;inset:0;z-index:1100;display:grid;place-items:center;}
  .s1-spin__overlay--dim{background:var(--surface-dim);}
  @media (prefers-reduced-motion:reduce){.s1-spin{animation-duration:1.6s;}}
  `;
  document.head.appendChild(el);
}
function Spinner({
  size = "md",
  label,
  overlay = false,
  dim = false,
  className = ""
}) {
  useStyles();
  const core = /*#__PURE__*/React.createElement("span", {
    className: ["s1-spin-wrap", className].filter(Boolean).join(" ")
  }, /*#__PURE__*/React.createElement("span", {
    className: `s1-spin s1-spin--${size}`,
    role: "status",
    "aria-label": label || "로딩 중"
  }), label ? /*#__PURE__*/React.createElement("span", {
    className: "s1-spin__label"
  }, label) : null);
  if (!overlay) return core;
  return /*#__PURE__*/React.createElement("div", {
    className: `s1-spin__overlay ${dim ? "s1-spin__overlay--dim" : ""}`
  }, core);
}
Object.assign(__ds_scope, { Spinner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Spinner.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
const STYLE_ID = "s1-tooltip-styles";
function useStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
  .s1-tip{position:relative;display:inline-flex;}
  .s1-tip__bubble{position:absolute;z-index:50;width:max-content;max-width:260px;
    padding:10px 12px;border-radius:var(--radius-m);
    font:var(--type-12r);letter-spacing:0;line-height:1.45;
    opacity:0;visibility:hidden;pointer-events:none;
    transition:opacity var(--dur-fast) var(--ease-standard),visibility var(--dur-fast);
    box-shadow:var(--shadow-raised);}
  .s1-tip:hover .s1-tip__bubble,.s1-tip:focus-within .s1-tip__bubble{opacity:1;visibility:visible;}
  .s1-tip__bubble::after{content:"";position:absolute;width:8px;height:8px;transform:rotate(45deg);background:inherit;}
  /* theme */
  .s1-tip__bubble--gray{background:var(--s1-gray-800);color:#fff;}
  .s1-tip__bubble--white{background:#fff;color:var(--text-body);border:1px solid var(--border-default);}
  /* placement */
  .s1-tip__bubble--top{bottom:calc(100% + 9px);left:50%;transform:translateX(-50%);}
  .s1-tip__bubble--top::after{top:100%;left:50%;margin:-4px 0 0 -4px;}
  .s1-tip__bubble--bottom{top:calc(100% + 9px);left:50%;transform:translateX(-50%);}
  .s1-tip__bubble--bottom::after{bottom:100%;left:50%;margin:0 0 -4px -4px;}
  .s1-tip__bubble--right{left:calc(100% + 9px);top:50%;transform:translateY(-50%);}
  .s1-tip__bubble--right::after{right:100%;top:50%;margin:-4px -4px 0 0;}
  .s1-tip__bubble--white.s1-tip__bubble--right::after{box-shadow:-1px 1px 0 var(--border-default);}
  `;
  document.head.appendChild(el);
}
function Tooltip({
  content,
  theme = "gray",
  placement = "top",
  children,
  className = ""
}) {
  useStyles();
  return /*#__PURE__*/React.createElement("span", {
    className: ["s1-tip", className].filter(Boolean).join(" "),
    tabIndex: 0
  }, children, /*#__PURE__*/React.createElement("span", {
    className: `s1-tip__bubble s1-tip__bubble--${theme} s1-tip__bubble--${placement}`,
    role: "tooltip"
  }, content));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
const STYLE_ID = "s1-select-styles";
function useStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
  .s1-sel{position:relative;font-family:var(--font-base);}
  .s1-sel__field{display:flex;font-family:var(--font-base);gap:8px;}
  .s1-sel--top{flex-direction:column;}
  .s1-sel--left{flex-direction:row;align-items:center;}
  .s1-sel--left .s1-sel__label{width:120px;flex:none;}
  .s1-sel__label{font:var(--type-14m);letter-spacing:-.02em;color:var(--text-body);}
  .s1-sel__req{color:var(--text-accent-red);margin-left:2px;}
  .s1-sel__wrap{position:relative;flex:1;min-width:0;}
  .s1-sel__control{
    width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;
    background:var(--s1-white);border:1px solid var(--border-strong);
    border-radius:var(--radius-m);padding:0 12px;height:48px;cursor:pointer;
    font:var(--type-16r);letter-spacing:-.02em;color:var(--text-body);text-align:left;
    transition:border-color var(--dur-fast) var(--ease-standard),box-shadow var(--dur-fast) var(--ease-standard);
  }
  .s1-sel--sm .s1-sel__control{height:40px;font-size:var(--fs-14);}
  .s1-sel__control:hover{border-color:var(--s1-gray-400);}
  .s1-sel--open .s1-sel__control{border-color:var(--border-focus);box-shadow:0 0 0 3px var(--s1-blue-50);}
  .s1-sel__control[data-placeholder="true"]{color:var(--text-placeholder);}
  .s1-sel__chev{font-size:22px;color:var(--text-tertiary);transition:transform var(--dur-fast) var(--ease-standard);}
  .s1-sel--open .s1-sel__chev{transform:rotate(180deg);}
  .s1-sel__list{
    position:absolute;z-index:30;top:calc(100% + 4px);left:0;right:0;
    background:var(--s1-white);border:1px solid var(--border-default);
    border-radius:var(--radius-m);box-shadow:var(--shadow-overlay);
    padding:6px;max-height:264px;overflow:auto;
  }
  .s1-sel__opt{display:flex;align-items:center;justify-content:space-between;gap:8px;
    padding:10px 10px;border-radius:var(--radius-s);cursor:pointer;
    font:var(--type-16r);letter-spacing:-.02em;color:var(--text-body);}
  .s1-sel--sm .s1-sel__opt{font-size:var(--fs-14);padding:8px 10px;}
  .s1-sel__opt:hover{background:var(--s1-gray-50);}
  .s1-sel__opt[aria-selected="true"]{color:var(--accent);font-weight:var(--weight-medium);background:var(--accent-subtle);}
  .s1-sel__opt .material-symbols-rounded{font-size:20px;}
  .s1-sel--disabled .s1-sel__control{background:var(--s1-gray-50);border-color:var(--border-default);color:var(--text-disabled);cursor:not-allowed;}
  `;
  document.head.appendChild(el);
}
function Select({
  label,
  labelPosition = "top",
  required = false,
  placeholder = "선택",
  options = [],
  value,
  onChange,
  size = "lg",
  disabled = false,
  className = ""
}) {
  useStyles();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const norm = options.map(o => typeof o === "string" ? {
    value: o,
    label: o
  } : o);
  const selected = norm.find(o => o.value === value);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const wrapCls = ["s1-sel__field", `s1-sel--${labelPosition}`, `s1-sel--${size}`, disabled ? "s1-sel--disabled" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", {
    className: wrapCls
  }, label ? /*#__PURE__*/React.createElement("span", {
    className: "s1-sel__label"
  }, label, required ? /*#__PURE__*/React.createElement("span", {
    className: "s1-sel__req"
  }, "*") : null) : null, /*#__PURE__*/React.createElement("div", {
    className: `s1-sel s1-sel--${size} ${open ? "s1-sel--open" : ""} ${disabled ? "s1-sel--disabled" : ""}`,
    ref: ref
  }, /*#__PURE__*/React.createElement("div", {
    className: "s1-sel__wrap"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "s1-sel__control",
    "data-placeholder": !selected,
    disabled: disabled,
    onClick: () => setOpen(v => !v),
    "aria-haspopup": "listbox",
    "aria-expanded": open
  }, /*#__PURE__*/React.createElement("span", null, selected ? selected.label : placeholder), /*#__PURE__*/React.createElement("span", {
    className: "s1-sel__chev material-symbols-rounded"
  }, "expand_more")), open ? /*#__PURE__*/React.createElement("div", {
    className: "s1-sel__list",
    role: "listbox"
  }, norm.map(o => /*#__PURE__*/React.createElement("div", {
    key: o.value,
    className: "s1-sel__opt",
    role: "option",
    "aria-selected": o.value === value,
    onClick: () => {
      onChange && onChange(o.value);
      setOpen(false);
    }
  }, /*#__PURE__*/React.createElement("span", null, o.label), o.value === value ? /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded"
  }, "check") : null))) : null)));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = "s1-textfield-styles";
function useStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
  .s1-field{display:flex;font-family:var(--font-base);gap:8px;}
  .s1-field--top{flex-direction:column;}
  .s1-field--left{flex-direction:row;align-items:center;}
  .s1-field--left>.s1-field__label{width:120px;flex:none;padding-top:0;}
  .s1-field__label{font:var(--type-14m);letter-spacing:-.02em;color:var(--text-body);}
  .s1-field__req{color:var(--text-accent-red);margin-left:2px;}
  .s1-field__main{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;}
  .s1-field__control{
    display:flex;align-items:center;gap:8px;background:var(--s1-white);
    border:1px solid var(--border-strong);border-radius:var(--radius-m);
    padding:0 12px;height:48px;
    transition:border-color var(--dur-fast) var(--ease-standard),
               box-shadow var(--dur-fast) var(--ease-standard);
  }
  .s1-field--sm .s1-field__control{height:40px;}
  .s1-field__control:focus-within{border-color:var(--border-focus);
    box-shadow:0 0 0 3px var(--s1-blue-50);}
  .s1-field__icon{display:inline-grid;place-items:center;font-size:20px;color:var(--text-tertiary);}
  .s1-field__input{flex:1;min-width:0;border:0;outline:0;background:transparent;
    font:var(--type-16r);letter-spacing:-.02em;color:var(--text-body);}
  .s1-field--sm .s1-field__input{font-size:var(--fs-14);}
  .s1-field__input::placeholder{color:var(--text-placeholder);}
  .s1-field__btn{flex:none;height:32px;padding:0 12px;border-radius:var(--radius-s);
    border:1px solid var(--accent);background:var(--s1-white);color:var(--accent);
    font:var(--type-14m);letter-spacing:-.02em;cursor:pointer;}
  .s1-field__msg{font:var(--type-12r);letter-spacing:0;color:var(--text-tertiary);}
  /* states */
  .s1-field--error .s1-field__control{border-color:var(--s1-red-500);}
  .s1-field--error .s1-field__control:focus-within{box-shadow:0 0 0 3px var(--s1-red-50);}
  .s1-field--error .s1-field__msg{color:var(--text-error);}
  .s1-field--success .s1-field__control{border-color:var(--s1-seagreen-600);}
  .s1-field--success .s1-field__msg{color:var(--status-positive);}
  .s1-field--disabled .s1-field__control{background:var(--s1-gray-50);border-color:var(--border-default);}
  .s1-field--disabled .s1-field__input{color:var(--text-disabled);}
  `;
  document.head.appendChild(el);
}
function TextField({
  label,
  labelPosition = "top",
  required = false,
  placeholder,
  value,
  defaultValue,
  onChange,
  iconLeft,
  trailingButton,
  onTrailingClick,
  helperText,
  error,
  success,
  size = "lg",
  disabled = false,
  type = "text",
  id,
  className = "",
  ...rest
}) {
  useStyles();
  const state = error ? "error" : success ? "success" : disabled ? "disabled" : "";
  const wrapCls = ["s1-field", `s1-field--${labelPosition}`, `s1-field--${size}`, state ? `s1-field--${state}` : "", className].filter(Boolean).join(" ");
  const msg = error || (success && typeof success === "string" ? success : "") || helperText;
  return /*#__PURE__*/React.createElement("div", {
    className: wrapCls
  }, label ? /*#__PURE__*/React.createElement("label", {
    className: "s1-field__label",
    htmlFor: id
  }, label, required ? /*#__PURE__*/React.createElement("span", {
    className: "s1-field__req"
  }, "*") : null) : null, /*#__PURE__*/React.createElement("div", {
    className: "s1-field__main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "s1-field__control"
  }, iconLeft ? /*#__PURE__*/React.createElement("span", {
    className: "s1-field__icon"
  }, iconLeft) : null, /*#__PURE__*/React.createElement("input", _extends({
    id: id,
    type: type,
    className: "s1-field__input",
    placeholder: placeholder,
    value: value,
    defaultValue: defaultValue,
    onChange: onChange,
    disabled: disabled
  }, rest)), trailingButton ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "s1-field__btn",
    onClick: onTrailingClick
  }, trailingButton) : null), msg ? /*#__PURE__*/React.createElement("span", {
    className: "s1-field__msg"
  }, msg) : null));
}
Object.assign(__ds_scope, { TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextField.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = "s1-textarea-styles";
function useStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
  .s1-ta{display:flex;flex-direction:column;gap:6px;font-family:var(--font-base);}
  .s1-ta__label{font:var(--type-14m);letter-spacing:-.02em;color:var(--text-body);}
  .s1-ta__req{color:var(--text-accent-red);margin-left:2px;}
  .s1-ta__box{background:var(--s1-white);border:1px solid var(--border-strong);
    border-radius:var(--radius-m);padding:12px;
    transition:border-color var(--dur-fast) var(--ease-standard),box-shadow var(--dur-fast) var(--ease-standard);}
  .s1-ta__box:focus-within{border-color:var(--border-focus);box-shadow:0 0 0 3px var(--s1-blue-50);}
  .s1-ta__input{width:100%;border:0;outline:0;resize:vertical;background:transparent;
    font:var(--type-16r);letter-spacing:-.02em;color:var(--text-body);line-height:1.5;display:block;}
  .s1-ta__input::placeholder{color:var(--text-placeholder);}
  .s1-ta__foot{display:flex;justify-content:flex-end;}
  .s1-ta__count{font:var(--type-12r);letter-spacing:0;color:var(--text-tertiary);font-variant-numeric:tabular-nums;}
  .s1-ta--disabled .s1-ta__box{background:var(--s1-gray-50);border-color:var(--border-default);}
  `;
  document.head.appendChild(el);
}
function Textarea({
  label,
  required = false,
  placeholder,
  value,
  defaultValue,
  onChange,
  maxLength,
  rows = 4,
  disabled = false,
  className = "",
  ...rest
}) {
  useStyles();
  const [len, setLen] = React.useState((value ?? defaultValue ?? "").length);
  const handle = e => {
    setLen(e.target.value.length);
    onChange && onChange(e);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: ["s1-ta", disabled ? "s1-ta--disabled" : "", className].filter(Boolean).join(" ")
  }, label ? /*#__PURE__*/React.createElement("span", {
    className: "s1-ta__label"
  }, label, required ? /*#__PURE__*/React.createElement("span", {
    className: "s1-ta__req"
  }, "*") : null) : null, /*#__PURE__*/React.createElement("div", {
    className: "s1-ta__box"
  }, /*#__PURE__*/React.createElement("textarea", _extends({
    className: "s1-ta__input",
    placeholder: placeholder,
    value: value,
    defaultValue: defaultValue,
    onChange: handle,
    maxLength: maxLength,
    rows: rows,
    disabled: disabled
  }, rest))), maxLength ? /*#__PURE__*/React.createElement("div", {
    className: "s1-ta__foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "s1-ta__count"
  }, "(", len, "/", maxLength, ")")) : null);
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BottomNav.jsx
try { (() => {
const STYLE_ID = "s1-bottomnav-styles";
function useStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
  .s1-bnav{display:flex;width:100%;background:var(--s1-white);
    border-top:1px solid var(--border-subtle);font-family:var(--font-base);
    padding:6px 0 max(6px,env(safe-area-inset-bottom));}
  .s1-bnav__item{flex:1;background:transparent;border:0;cursor:pointer;
    display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 0;
    color:var(--text-placeholder);
    transition:color var(--dur-fast) var(--ease-standard);}
  .s1-bnav__item .material-symbols-rounded{font-size:26px;
    font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;}
  .s1-bnav__label{font:var(--type-12m);letter-spacing:0;}
  .s1-bnav__item[aria-current="true"]{color:var(--accent);}
  .s1-bnav__item[aria-current="true"] .material-symbols-rounded{font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 24;}
  `;
  document.head.appendChild(el);
}
function BottomNav({
  items = [],
  value,
  onChange,
  className = ""
}) {
  useStyles();
  const active = value != null ? value : items[0] && items[0].value;
  return /*#__PURE__*/React.createElement("nav", {
    className: ["s1-bnav", className].filter(Boolean).join(" ")
  }, items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.value,
    type: "button",
    className: "s1-bnav__item",
    "aria-current": it.value === active,
    onClick: () => onChange && onChange(it.value)
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded"
  }, it.icon), /*#__PURE__*/React.createElement("span", {
    className: "s1-bnav__label"
  }, it.label))));
}
Object.assign(__ds_scope, { BottomNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BottomNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Pagination.jsx
try { (() => {
const STYLE_ID = "s1-pagination-styles";
function useStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
  .s1-pg{display:flex;align-items:center;justify-content:center;gap:2px;font-family:var(--font-base);}
  .s1-pg__btn{min-width:34px;height:34px;padding:0 6px;border:0;background:transparent;cursor:pointer;
    border-radius:var(--radius-s);font:var(--type-14m);letter-spacing:0;color:var(--text-secondary);
    display:inline-grid;place-items:center;font-variant-numeric:tabular-nums;
    transition:background var(--dur-fast) var(--ease-standard),color var(--dur-fast) var(--ease-standard);}
  .s1-pg__btn:hover:not(:disabled){background:var(--s1-gray-50);color:var(--text-body);}
  .s1-pg__btn[aria-current="true"]{background:var(--accent);color:#fff;}
  .s1-pg__btn:disabled{color:var(--text-disabled);cursor:not-allowed;}
  .s1-pg__btn .material-symbols-rounded{font-size:20px;}
  `;
  document.head.appendChild(el);
}
function pageWindow(page, total, span = 5) {
  let start = Math.max(1, page - Math.floor(span / 2));
  let end = Math.min(total, start + span - 1);
  start = Math.max(1, end - span + 1);
  const out = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}
function Pagination({
  page = 1,
  totalPages = 1,
  onChange,
  className = ""
}) {
  useStyles();
  const go = p => {
    if (p >= 1 && p <= totalPages && p !== page && onChange) onChange(p);
  };
  return /*#__PURE__*/React.createElement("nav", {
    className: ["s1-pg", className].filter(Boolean).join(" "),
    "aria-label": "\uD398\uC774\uC9C0"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "s1-pg__btn",
    disabled: page <= 1,
    onClick: () => go(page - 1),
    "aria-label": "\uC774\uC804"
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded"
  }, "chevron_left")), pageWindow(page, totalPages).map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    type: "button",
    className: "s1-pg__btn",
    "aria-current": p === page,
    onClick: () => go(p)
  }, p)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "s1-pg__btn",
    disabled: page >= totalPages,
    onClick: () => go(page + 1),
    "aria-label": "\uB2E4\uC74C"
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded"
  }, "chevron_right")));
}
Object.assign(__ds_scope, { Pagination });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Pagination.jsx", error: String((e && e.message) || e) }); }

// components/selection/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = "s1-checkbox-styles";
function useStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
  .s1-cbx{display:inline-flex;align-items:center;gap:8px;cursor:pointer;
    font-family:var(--font-base);font:var(--type-16r);letter-spacing:-.02em;color:var(--text-body);user-select:none;}
  .s1-cbx input{position:absolute;opacity:0;width:0;height:0;}
  .s1-cbx__box{width:22px;height:22px;flex:none;border-radius:var(--radius-s);
    border:1.5px solid var(--border-strong);background:var(--s1-white);
    display:grid;place-items:center;color:#fff;
    transition:background var(--dur-fast) var(--ease-standard),border-color var(--dur-fast) var(--ease-standard);}
  .s1-cbx__box .material-symbols-rounded{font-size:18px;font-variation-settings:'wght' 600;opacity:0;}
  .s1-cbx input:checked + .s1-cbx__box{background:var(--accent);border-color:var(--accent);}
  .s1-cbx input:checked + .s1-cbx__box .material-symbols-rounded{opacity:1;}
  .s1-cbx input:focus-visible + .s1-cbx__box{outline:2px solid var(--border-focus);outline-offset:2px;}
  .s1-cbx--disabled{cursor:not-allowed;color:var(--text-disabled);}
  .s1-cbx--disabled .s1-cbx__box{background:var(--s1-gray-100);border-color:var(--border-default);}
  .s1-cbx--disabled input:checked + .s1-cbx__box{background:var(--s1-gray-300);border-color:var(--s1-gray-300);}
  `;
  document.head.appendChild(el);
}
function Checkbox({
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  children,
  className = "",
  ...rest
}) {
  useStyles();
  return /*#__PURE__*/React.createElement("label", {
    className: ["s1-cbx", disabled ? "s1-cbx--disabled" : "", className].filter(Boolean).join(" ")
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    checked: checked,
    defaultChecked: defaultChecked,
    onChange: onChange,
    disabled: disabled
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "s1-cbx__box"
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded"
  }, "check")), children ? /*#__PURE__*/React.createElement("span", {
    className: "s1-cbx__label"
  }, children) : null);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/selection/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/selection/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = "s1-chip-styles";
function useStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
  .s1-chip-c{display:inline-flex;align-items:center;gap:4px;height:36px;padding:0 14px;
    border-radius:var(--radius-full);cursor:pointer;white-space:nowrap;
    font-family:var(--font-base);font:var(--type-14m);letter-spacing:-.02em;
    border:1px solid var(--border-default);background:var(--s1-white);color:var(--text-secondary);
    transition:background var(--dur-fast) var(--ease-standard),
               border-color var(--dur-fast) var(--ease-standard),
               color var(--dur-fast) var(--ease-standard);}
  .s1-chip-c:hover{border-color:var(--s1-gray-400);}
  .s1-chip-c .material-symbols-rounded{font-size:18px;}
  /* line selected */
  .s1-chip-c--line[aria-pressed="true"]{border-color:var(--accent);color:var(--accent);background:var(--accent-subtle);}
  /* solid */
  .s1-chip-c--solid{background:var(--s1-gray-100);border-color:transparent;color:var(--text-secondary);}
  .s1-chip-c--solid[aria-pressed="true"]{background:var(--accent);color:#fff;}
  .s1-chip-c--disabled{cursor:not-allowed;background:var(--s1-gray-50);color:var(--text-disabled);border-color:var(--border-subtle);}
  `;
  document.head.appendChild(el);
}
function Chip({
  children,
  variant = "line",
  selected = false,
  filter = false,
  disabled = false,
  onClick,
  className = "",
  ...rest
}) {
  useStyles();
  const cls = ["s1-chip-c", `s1-chip-c--${variant}`, disabled ? "s1-chip-c--disabled" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: cls,
    "aria-pressed": selected,
    disabled: disabled,
    onClick: onClick
  }, rest), children, filter ? /*#__PURE__*/React.createElement("span", {
    className: "material-symbols-rounded"
  }, "expand_more") : null);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/selection/Chip.jsx", error: String((e && e.message) || e) }); }

// components/selection/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = "s1-radio-styles";
function useStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
  .s1-rdo{display:inline-flex;align-items:center;gap:8px;cursor:pointer;
    font-family:var(--font-base);font:var(--type-16r);letter-spacing:-.02em;color:var(--text-body);user-select:none;}
  .s1-rdo input{position:absolute;opacity:0;width:0;height:0;}
  .s1-rdo__dot{width:22px;height:22px;flex:none;border-radius:var(--radius-full);
    border:1.5px solid var(--border-strong);background:var(--s1-white);
    display:grid;place-items:center;
    transition:border-color var(--dur-fast) var(--ease-standard);}
  .s1-rdo__dot::after{content:"";width:11px;height:11px;border-radius:var(--radius-full);
    background:var(--accent);transform:scale(0);transition:transform var(--dur-fast) var(--ease-standard);}
  .s1-rdo input:checked + .s1-rdo__dot{border-color:var(--accent);}
  .s1-rdo input:checked + .s1-rdo__dot::after{transform:scale(1);}
  .s1-rdo input:focus-visible + .s1-rdo__dot{outline:2px solid var(--border-focus);outline-offset:2px;}
  .s1-rdo--disabled{cursor:not-allowed;color:var(--text-disabled);}
  .s1-rdo--disabled .s1-rdo__dot{background:var(--s1-gray-100);border-color:var(--border-default);}
  .s1-rdo--disabled input:checked + .s1-rdo__dot::after{background:var(--s1-gray-300);}
  `;
  document.head.appendChild(el);
}
function Radio({
  name,
  value,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  children,
  className = "",
  ...rest
}) {
  useStyles();
  return /*#__PURE__*/React.createElement("label", {
    className: ["s1-rdo", disabled ? "s1-rdo--disabled" : "", className].filter(Boolean).join(" ")
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "radio",
    name: name,
    value: value,
    checked: checked,
    defaultChecked: defaultChecked,
    onChange: onChange,
    disabled: disabled
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "s1-rdo__dot"
  }), children ? /*#__PURE__*/React.createElement("span", {
    className: "s1-rdo__label"
  }, children) : null);
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/selection/Radio.jsx", error: String((e && e.message) || e) }); }

// components/selection/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = "s1-switch-styles";
function useStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
  .s1-sw{display:inline-flex;align-items:center;gap:10px;cursor:pointer;
    font-family:var(--font-base);font:var(--type-16r);letter-spacing:-.02em;color:var(--text-body);user-select:none;}
  .s1-sw input{position:absolute;opacity:0;width:0;height:0;}
  .s1-sw__track{width:48px;height:28px;flex:none;border-radius:var(--radius-full);
    background:var(--s1-gray-300);position:relative;
    transition:background var(--dur-normal) var(--ease-standard);}
  .s1-sw__thumb{position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:var(--radius-full);
    background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);
    transition:transform var(--dur-normal) var(--ease-standard);}
  .s1-sw input:checked + .s1-sw__track{background:var(--accent);}
  .s1-sw input:checked + .s1-sw__track .s1-sw__thumb{transform:translateX(20px);}
  .s1-sw input:focus-visible + .s1-sw__track{outline:2px solid var(--border-focus);outline-offset:2px;}
  .s1-sw--disabled{cursor:not-allowed;color:var(--text-disabled);}
  .s1-sw--disabled .s1-sw__track{background:var(--s1-gray-200);}
  .s1-sw--disabled input:checked + .s1-sw__track{background:var(--s1-blue-200);}
  `;
  document.head.appendChild(el);
}
function Switch({
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  children,
  className = "",
  ...rest
}) {
  useStyles();
  return /*#__PURE__*/React.createElement("label", {
    className: ["s1-sw", disabled ? "s1-sw--disabled" : "", className].filter(Boolean).join(" ")
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    role: "switch",
    checked: checked,
    defaultChecked: defaultChecked,
    onChange: onChange,
    disabled: disabled
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "s1-sw__track"
  }, /*#__PURE__*/React.createElement("span", {
    className: "s1-sw__thumb"
  })), children ? /*#__PURE__*/React.createElement("span", {
    className: "s1-sw__label"
  }, children) : null);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/selection/Switch.jsx", error: String((e && e.message) || e) }); }

// ui_kits/pc_web/screens.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* PC Web UI kit — chrome + screens. Reads DS primitives, exports PCWebApp. */
const {
  Button,
  TextField,
  Select,
  Textarea,
  Checkbox,
  Radio,
  Chip,
  Badge,
  Tabs,
  Pagination,
  Dialog,
  Card,
  Tooltip
} = window.UXDesignSystem_59a60b;
const PIcon = (name, props = {}) => /*#__PURE__*/React.createElement("span", _extends({
  className: "material-symbols-rounded"
}, props), name);

/* ---- Header ------------------------------------------------------------ */
function Header({
  route,
  onNav,
  onOpenPw,
  onLogout
}) {
  const menus = [{
    value: "dashboard",
    label: "대시보드"
  }, {
    value: "board",
    label: "게시판"
  }, {
    value: "inspect",
    label: "점검 관리"
  }, {
    value: "stats",
    label: "통계"
  }];
  const cur = route === "detail" || route === "write" ? "board" : route;
  const [userOpen, setUserOpen] = React.useState(false);
  return /*#__PURE__*/React.createElement("header", {
    className: "pc-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-toolbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-toolbar__inner"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pc-toolbar__chip"
  }, "\uC0BC\uC131\uC804\uC790 \uAE30\uD765\xB7\uD654\uC131"), /*#__PURE__*/React.createElement("span", {
    className: "pc-toolbar__sep"
  }, "|"), /*#__PURE__*/React.createElement("span", {
    className: "pc-toolbar__chip pc-toolbar__chip--strong"
  }, "\uAD00\uC81C\uC2DC\uC2A4\uD15C"), /*#__PURE__*/React.createElement("span", {
    className: "pc-toolbar__sep"
  }, "|"), /*#__PURE__*/React.createElement("span", {
    className: "pc-toolbar__chip"
  }, "\uAD00\uB9AC\uC790\uD398\uC774\uC9C0"))), /*#__PURE__*/React.createElement("div", {
    className: "pc-gnb"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-gnb__inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-logo",
    onClick: () => onNav("dashboard")
  }, /*#__PURE__*/React.createElement("span", {
    className: "pc-logo__mark"
  }, "S1"), /*#__PURE__*/React.createElement("span", {
    className: "pc-logo__word"
  }, "\uC5D0\uC2A4\uC6D0 \uAD00\uC81C")), /*#__PURE__*/React.createElement("nav", {
    className: "pc-menu"
  }, menus.map(m => /*#__PURE__*/React.createElement("button", {
    key: m.value,
    className: "pc-menu__item",
    "aria-current": cur === m.value,
    onClick: () => onNav(m.value)
  }, m.label))), /*#__PURE__*/React.createElement("div", {
    className: "pc-gnb__util"
  }, /*#__PURE__*/React.createElement("button", {
    className: "pc-util"
  }, "KR ", PIcon("expand_more", {
    style: {
      fontSize: 18
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "pc-util",
    onClick: () => setUserOpen(v => !v)
  }, PIcon("account_circle"), " \uC774\uC2B9\uD658"), userOpen ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      right: 0,
      top: "calc(100% + 6px)",
      background: "#fff",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-m)",
      boxShadow: "var(--shadow-overlay)",
      padding: 6,
      width: 160,
      zIndex: 50
    }
  }, [["내 정보"], ["비밀번호 변경", onOpenPw], ["로그아웃", onLogout]].map(([t, fn], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    onClick: () => {
      setUserOpen(false);
      fn && fn();
    },
    style: {
      padding: "10px 10px",
      borderRadius: "var(--radius-s)",
      cursor: "pointer",
      font: "var(--type-14r)",
      letterSpacing: "-.02em",
      color: "var(--text-body)"
    },
    onMouseDown: e => e.preventDefault()
  }, t))) : null), /*#__PURE__*/React.createElement("button", {
    className: "pc-util"
  }, PIcon("apps"))))), route !== "dashboard" ? /*#__PURE__*/React.createElement("div", {
    className: "pc-breadcrumb"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-breadcrumb__inner"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      cursor: "pointer"
    },
    onClick: () => onNav("dashboard")
  }, "\uD648"), PIcon("chevron_right"), /*#__PURE__*/React.createElement("span", {
    style: {
      cursor: "pointer"
    },
    onClick: () => onNav("board")
  }, "\uAC8C\uC2DC\uD310"), PIcon("chevron_right"), /*#__PURE__*/React.createElement("span", {
    className: "pc-breadcrumb__cur"
  }, "\uBB38\uC758 \uAC8C\uC2DC\uD310"))) : null);
}
function NotificationBar({
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "pc-notice"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-notice__inner"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pc-notice__tag"
  }, "\uACF5\uC9C0\uC0AC\uD56D"), /*#__PURE__*/React.createElement("span", {
    className: "pc-notice__text"
  }, "8~9\uC6D4 \uAE30\uD765\uC0AC\uC5C5\uC7A5 \uB3C4\uB85C \uBC0F \uC815\uB958\uC7A5 \uD1B5\uC81C \uC548\uB0B4 \u2014 \uC790\uC138\uD55C \uC77C\uC815\uC740 \uC804\uCCB4\uBCF4\uAE30\uC5D0\uC11C \uD655\uC778\uD574 \uC8FC\uC138\uC694."), /*#__PURE__*/React.createElement("span", {
    className: "pc-notice__more"
  }, "\uC804\uCCB4\uBCF4\uAE30"), /*#__PURE__*/React.createElement("button", {
    className: "pc-notice__x",
    onClick: onClose
  }, PIcon("close", {
    style: {
      fontSize: 20
    }
  }))));
}
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    className: "pc-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-footer__inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-footer__links"
  }, /*#__PURE__*/React.createElement("a", {
    className: "strong"
  }, "\uC774\uC6A9\uC57D\uAD00"), /*#__PURE__*/React.createElement("a", null, "\uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uBC29\uCE68"), /*#__PURE__*/React.createElement("a", null, "\uC704\uCE58\uAE30\uBC18 \uC11C\uBE44\uC2A4 \uC774\uC6A9\uC57D\uAD00")), /*#__PURE__*/React.createElement("div", {
    className: "pc-footer__info"
  }, "(\uC8FC)\uC5D0\uC2A4\uC6D0 \xA0\xB7\xA0 \uC0AC\uC5C5\uC790\uB4F1\uB85D\uBC88\uD638 208-81-13302 \xA0\xB7\xA0 \uB300\uD45C\uC774\uC0AC \uB0A8\uAD81\uBC94", /*#__PURE__*/React.createElement("br", null), "04511 \uC11C\uC6B8\uD2B9\uBCC4\uC2DC \uC911\uAD6C \uC138\uC885\uB300\uB85C 7\uAE38 25 \uC5D0\uC2A4\uC6D0 \uBE4C\uB529"), /*#__PURE__*/React.createElement("div", {
    className: "pc-footer__copy"
  }, "\xA9 S-1 Corp. All Rights Reserved.")));
}

/* ---- Dashboard --------------------------------------------------------- */
function Dashboard({
  onNav
}) {
  const bars = [40, 55, 48, 70, 62, 80, 58, 90, 72, 84, 66, 95];
  const months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  const progress = [["고장/수리/불편신고", 10], ["온도 조절", 40], ["청소/소모품 교체", 60], ["냉난방/조명 연장 신청", 100]];
  return /*#__PURE__*/React.createElement("div", {
    className: "pc-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-hero__title"
  }, "\uAD00\uC81C \uC2DC\uC2A4\uD15C\uC5D0 \uC624\uC2E0 \uAC83\uC744 \uD658\uC601\uD574\uC694.", /*#__PURE__*/React.createElement("br", null), "\uC624\uB298\uB3C4 \uC548\uC804\uD55C \uC0AC\uC5C5\uC7A5 \uC6B4\uC601\uC744 \uB3C4\uC640\uB4DC\uB9B4\uAC8C\uC694."), /*#__PURE__*/React.createElement("div", {
    className: "pc-hero__sub"
  }, "\uBB38\uC758\xB7\uC810\uAC80 \uD604\uD669\uACFC \uC5D0\uB108\uC9C0 \uC0AC\uC6A9\uB7C9\uC744 \uD55C\uB208\uC5D0 \uD655\uC778\uD574 \uBCF4\uC138\uC694."), /*#__PURE__*/React.createElement("div", {
    className: "pc-hero__search"
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "\uBB38\uC758 \uB0B4\uC6A9, \uC810\uAC80 \uD56D\uBAA9, \uAC8C\uC2DC\uAE00\uC744 \uAC80\uC0C9\uD574 \uBCF4\uC138\uC694"
  }), /*#__PURE__*/React.createElement(Button, {
    onClick: () => onNav("board"),
    iconLeft: PIcon("search")
  }, "\uAC80\uC0C9"))), /*#__PURE__*/React.createElement("div", {
    className: "pc-dash-grid"
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "line",
    title: "\uC624\uB298\uC758 \uBB38\uC758 \uD604\uD669"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-stat__row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-stat"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pc-stat__k"
  }, "\uC804\uCCB4 \uBB38\uC758"), /*#__PURE__*/React.createElement("span", {
    className: "pc-stat__v"
  }, "1,000", /*#__PURE__*/React.createElement("span", {
    className: "u"
  }, "\uAC74"))), /*#__PURE__*/React.createElement("div", {
    className: "pc-stat"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pc-stat__k"
  }, "\uC870\uCE58 \uC608\uC815"), /*#__PURE__*/React.createElement("span", {
    className: "pc-stat__v",
    style: {
      color: "var(--s1-yellow-800)"
    }
  }, "50", /*#__PURE__*/React.createElement("span", {
    className: "u"
  }, "\uAC74"))), /*#__PURE__*/React.createElement("div", {
    className: "pc-stat"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pc-stat__k"
  }, "\uC870\uCE58 \uC644\uB8CC"), /*#__PURE__*/React.createElement("span", {
    className: "pc-stat__v",
    style: {
      color: "var(--s1-seagreen-700)"
    }
  }, "950", /*#__PURE__*/React.createElement("span", {
    className: "u"
  }, "\uAC74"))))), /*#__PURE__*/React.createElement(Card, {
    variant: "line",
    title: "\uC124\uBE44 \uC810\uAC80"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-progress"
  }, progress.map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    className: "pc-progress__item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-progress__top"
  }, /*#__PURE__*/React.createElement("span", null, k), /*#__PURE__*/React.createElement("span", {
    className: "pct"
  }, v, "%")), /*#__PURE__*/React.createElement("div", {
    className: "pc-progress__track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-progress__fill",
    style: {
      width: v + "%"
    }
  })))))), /*#__PURE__*/React.createElement(Card, {
    variant: "line",
    title: "\uC5D0\uB108\uC9C0 \uC0AC\uC6A9\uB7C9",
    headerAction: /*#__PURE__*/React.createElement("span", {
      className: "pc-link",
      onClick: () => onNav("stats")
    }, "\uBC14\uB85C\uAC00\uAE30")
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-stat",
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "pc-stat__k"
  }, "2025.01.01 \u2013 02.01 \xB7 \uC804\uB825"), /*#__PURE__*/React.createElement("span", {
    className: "pc-stat__v",
    style: {
      fontSize: "var(--fs-24)"
    }
  }, "89.1", /*#__PURE__*/React.createElement("span", {
    className: "u"
  }, "kWh")), /*#__PURE__*/React.createElement("span", {
    className: "pc-stat__delta",
    style: {
      color: "var(--s1-seagreen-700)"
    }
  }, "\u25BC \uC791\uB144 \uB3D9\uC6D4 \uB300\uBE44 10,000")), /*#__PURE__*/React.createElement("div", {
    className: "pc-stat"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pc-stat__k"
  }, "\uC6A9\uC218"), /*#__PURE__*/React.createElement("span", {
    className: "pc-stat__v",
    style: {
      fontSize: "var(--fs-24)"
    }
  }, "62.4", /*#__PURE__*/React.createElement("span", {
    className: "u"
  }, "\u33A5"))))), /*#__PURE__*/React.createElement("div", {
    className: "pc-dash-2"
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "line",
    title: "\uC5F0\uAC04 \uC124\uBE44 \uC810\uAC80 \uC2E4\uC801"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-bars"
  }, bars.map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "pc-bars__col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-bars__bar" + (i === bars.length - 1 ? " pc-bars__bar--accent" : ""),
    style: {
      height: h + "%"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "pc-bars__lab"
  }, months[i], "\uC6D4"))))), /*#__PURE__*/React.createElement(Card, {
    variant: "line",
    title: "\uACF5\uC9C0\uC0AC\uD56D",
    headerAction: /*#__PURE__*/React.createElement("span", {
      className: "pc-link",
      onClick: () => onNav("board")
    }, "\uC804\uCCB4\uBCF4\uAE30")
  }, [["퇴근 근거리셔틀 화성 H3 운행시간 개편운영 안내", "2025.03.03"], ["퇴근 근거리셔틀 화성 H1 운행시간 확대운영 안내", "2025.03.02"], ["출근 못골사거리(GS주유소) 정류장 위치 변경", "2025.03.01"], ["8~9월 기흥사업장 도로 및 정류장 통제 안내", "2025.02.27"]].map(([t, d], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      padding: "13px 0",
      borderBottom: i < 3 ? "1px solid var(--divider)" : "0"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-15r)",
      letterSpacing: "-.02em",
      color: "var(--text-body)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, t), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-13r)",
      color: "var(--text-placeholder)",
      flex: "none"
    }
  }, d))))));
}

/* ---- Board list (filter + table) -------------------------------------- */
const ROWS = [["322", "RE: 8층 냉난방 연장 신청 관련 문의", "신누리 / 디자인그룹", "2025.01.24", "120", "완료"], ["321", "수변전 설비 일일점검 결과 확인 요청", "김기장 / 에스원", "2025.01.24", "98", "조치중"], ["320", "주차장 LED 조명 교체 견적 문의", "박수지 / 운영실", "2025.01.23", "210", "접수"], ["319", "엘리베이터 정기 점검 일정 안내", "하동수 / 운영자", "2025.01.23", "57", "완료"], ["318", "8층 인테리어 공사 견적 요청 드립니다", "이준구 / DS부문", "2025.01.22", "312", "조치중"], ["317", "정문 출입통제기 오작동 신고", "최민호 / 보안팀", "2025.01.22", "41", "접수"], ["316", "화재 감지기 오경보 관련 확인 요청", "정하늘 / 시설팀", "2025.01.21", "88", "완료"]];
const STATUS_TONE = {
  "완료": "positive",
  "조치중": "info",
  "접수": "warning"
};
function BoardList({
  onNav,
  onWrite
}) {
  const [tab, setTab] = React.useState("inquiry");
  const [page, setPage] = React.useState(1);
  return /*#__PURE__*/React.createElement("div", {
    className: "pc-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-pagehead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-pagehead__title"
  }, "\uBB38\uC758 \uAC8C\uC2DC\uD310"), /*#__PURE__*/React.createElement("div", {
    className: "pc-pagehead__desc"
  }, "\uC0AC\uC5C5\uC7A5 \uC2DC\uC124 \uBB38\uC758\uC640 \uC870\uCE58 \uD604\uD669\uC744 \uD655\uC778\uD560 \uC218 \uC788\uC5B4\uC694.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    tabs: [{
      value: "inquiry",
      label: "문의 게시판"
    }, {
      value: "notice",
      label: "공지사항"
    }, {
      value: "lost",
      label: "분실/습득"
    }]
  })), /*#__PURE__*/React.createElement("div", {
    className: "pc-filter"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-filter__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pc-filter__label"
  }, "\uC9C4\uD589 \uC0C1\uD0DC"), /*#__PURE__*/React.createElement("div", {
    className: "pc-filter__chips"
  }, ["전체", "접수", "조치중", "완료"].map((c, i) => /*#__PURE__*/React.createElement(Chip, {
    key: c,
    selected: i === 0
  }, c)))), /*#__PURE__*/React.createElement("div", {
    className: "pc-filter__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pc-filter__label"
  }, "\uC870\uD68C \uAE30\uAC04"), /*#__PURE__*/React.createElement("div", {
    className: "pc-filter__chips",
    style: {
      alignItems: "center"
    }
  }, ["3개월", "6개월", "12개월"].map((c, i) => /*#__PURE__*/React.createElement(Chip, {
    key: c,
    selected: i === 1
  }, c)), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 160
    }
  }, /*#__PURE__*/React.createElement(TextField, {
    size: "sm",
    placeholder: "2025.01.01",
    iconLeft: PIcon("calendar_today")
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-placeholder)"
    }
  }, "~"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 160
    }
  }, /*#__PURE__*/React.createElement(TextField, {
    size: "sm",
    placeholder: "2025.02.01",
    iconLeft: PIcon("calendar_today")
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "pc-tabletoolbar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pc-count"
  }, "\uCD1D ", /*#__PURE__*/React.createElement("b", null, "322"), "\uAC74"), /*#__PURE__*/React.createElement("div", {
    className: "pc-toolbar-right"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-search"
  }, PIcon("search"), /*#__PURE__*/React.createElement("input", {
    placeholder: "\uC81C\uBAA9\uC744 \uAC80\uC0C9\uD574 \uC8FC\uC138\uC694."
  })), /*#__PURE__*/React.createElement(Button, {
    onClick: onWrite
  }, "\uC791\uC131\uD558\uAE30"))), /*#__PURE__*/React.createElement("table", {
    className: "pc-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    className: "col-no"
  }, "\uBC88\uD638"), /*#__PURE__*/React.createElement("th", null, "\uC81C\uBAA9"), /*#__PURE__*/React.createElement("th", {
    style: {
      width: 180
    }
  }, "\uC791\uC131\uC790"), /*#__PURE__*/React.createElement("th", {
    style: {
      width: 120
    }
  }, "\uB4F1\uB85D\uC77C"), /*#__PURE__*/React.createElement("th", {
    style: {
      width: 80
    },
    className: "col-c"
  }, "\uC870\uD68C"), /*#__PURE__*/React.createElement("th", {
    style: {
      width: 96
    },
    className: "col-c"
  }, "\uC0C1\uD0DC"))), /*#__PURE__*/React.createElement("tbody", null, ROWS.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    onClick: onNav
  }, /*#__PURE__*/React.createElement("td", {
    className: "col-no"
  }, r[0]), /*#__PURE__*/React.createElement("td", {
    className: "col-title"
  }, r[1]), /*#__PURE__*/React.createElement("td", null, r[2]), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, r[3]), /*#__PURE__*/React.createElement("td", {
    className: "col-c num"
  }, r[4]), /*#__PURE__*/React.createElement("td", {
    className: "col-c"
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: STATUS_TONE[r[5]]
  }, r[5])))))), /*#__PURE__*/React.createElement("div", {
    className: "pc-pagination-wrap"
  }, /*#__PURE__*/React.createElement(Pagination, {
    page: page,
    totalPages: 22,
    onChange: setPage
  })));
}

/* ---- Board write (input form) ----------------------------------------- */
function BoardWrite({
  onCancel,
  onSubmit
}) {
  const [type, setType] = React.useState("service");
  const [cat, setCat] = React.useState("repair");
  return /*#__PURE__*/React.createElement("div", {
    className: "pc-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-pagehead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-pagehead__title"
  }, "\uBB34\uC5C7\uC744 \uB3C4\uC640\uB4DC\uB9B4\uAE4C\uC694?"), /*#__PURE__*/React.createElement("div", {
    className: "pc-pagehead__desc"
  }, "\uC6D0\uD558\uC2DC\uB294 \uBB38\uC758 \uD56D\uBAA9\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.")), /*#__PURE__*/React.createElement("div", {
    className: "pc-form"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-form__req"
  }, "\uD45C\uAE30\uB41C ", /*#__PURE__*/React.createElement("b", null, "*"), " \uD56D\uBAA9\uC740 \uD544\uC218 \uC785\uB825 \uC0AC\uD56D\uC774\uC5D0\uC694."), /*#__PURE__*/React.createElement("div", {
    className: "pc-form__divider"
  }), /*#__PURE__*/React.createElement("div", {
    className: "pc-form__row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-form__label"
  }, "\uBB38\uC758 \uC720\uD615", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("div", {
    className: "pc-form__field"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-radio-row"
  }, /*#__PURE__*/React.createElement(Radio, {
    name: "ftype",
    value: "service",
    checked: type === "service",
    onChange: () => setType("service")
  }, "\uC11C\uBE44\uC2A4 \uBB38\uC758"), /*#__PURE__*/React.createElement(Radio, {
    name: "ftype",
    value: "work",
    checked: type === "work",
    onChange: () => setType("work")
  }, "\uC5C5\uBB34 \uBB38\uC758"), /*#__PURE__*/React.createElement(Tooltip, {
    placement: "right",
    content: "\uC11C\uBE44\uC2A4 \uBB38\uC758: \uACE0\uC7A5 \uBC0F \uC11C\uBE44\uC2A4 \uC694\uCCAD / \uC5C5\uBB34 \uBB38\uC758: \uC21C\uCC30\xB7\uC5D0\uB108\uC9C0 \uB4F1 \uB370\uC774\uD130 \uC694\uCCAD"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-placeholder)",
      display: "grid",
      placeItems: "center"
    }
  }, PIcon("help")))))), /*#__PURE__*/React.createElement("div", {
    className: "pc-form__row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-form__label"
  }, "\uBB38\uC758 \uD56D\uBAA9", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("div", {
    className: "pc-form__field"
  }, /*#__PURE__*/React.createElement(Select, {
    value: cat,
    onChange: setCat,
    options: [{
      value: "repair",
      label: "고장/수리/불편신고"
    }, {
      value: "temp",
      label: "온도 조절"
    }, {
      value: "clean",
      label: "청소/소모품 교체"
    }, {
      value: "extend",
      label: "냉난방/조명 연장 신청"
    }]
  }))), /*#__PURE__*/React.createElement("div", {
    className: "pc-form__row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-form__label"
  }, "\uBB38\uC758 \uB0B4\uC6A9", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("div", {
    className: "pc-form__field"
  }, /*#__PURE__*/React.createElement(Textarea, {
    placeholder: "\uBB38\uC758 \uB0B4\uC6A9\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
    maxLength: 500,
    rows: 5
  }))), /*#__PURE__*/React.createElement("div", {
    className: "pc-form__row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-form__label"
  }, "\uC694\uCCAD \uC704\uCE58", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("div", {
    className: "pc-form__field",
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(TextField, {
    placeholder: "\uC0C1\uC138 \uC704\uCE58\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694 (\uC608: 8\uCE35 \uB514\uC790\uC778\uADF8\uB8F9)"
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "line"
  }, "\uC704\uCE58 \uC120\uD0DD"))), /*#__PURE__*/React.createElement("div", {
    className: "pc-form__actions"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: onCancel
  }, "\uCDE8\uC18C"), /*#__PURE__*/React.createElement(Button, {
    onClick: onSubmit
  }, "\uB2E4\uC74C"))));
}

/* ---- Board detail (output form + comments) ---------------------------- */
function BoardDetail({
  onList
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "pc-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-pagehead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-pagehead__title"
  }, "8\uCE35 \uC778\uD14C\uB9AC\uC5B4 \uACF5\uC0AC \uACAC\uC801 \uC694\uCCAD \uB4DC\uB9BD\uB2C8\uB2E4")), /*#__PURE__*/React.createElement("div", {
    className: "pc-form",
    style: {
      maxWidth: 920
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "pc-form__divider"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 24,
      flexWrap: "wrap",
      padding: "16px 0",
      borderBottom: "1px solid var(--divider)",
      font: "var(--type-14r)",
      letterSpacing: "-.02em",
      color: "var(--text-secondary)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\uBD84\uB958 ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--text-body)"
    }
  }, "\uC11C\uBE44\uC2A4 \uBB38\uC758")), /*#__PURE__*/React.createElement("span", null, "\uC791\uC131\uC790 ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--text-body)"
    }
  }, "\uC774\uC900\uAD6C / DS\uBD80\uBB38")), /*#__PURE__*/React.createElement("span", null, "\uB4F1\uB85D\uC77C ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--text-body)"
    }
  }, "2025.01.22")), /*#__PURE__*/React.createElement("span", null, "\uC870\uD68C\uC218 ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--text-body)"
    }
  }, "312")), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "info"
  }, "\uC870\uCE58\uC911"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "22px 4px",
      font: "var(--type-16r)",
      letterSpacing: "-.02em",
      color: "var(--text-body)",
      lineHeight: 1.7,
      borderBottom: "1px solid var(--divider)"
    }
  }, "8\uCE35 \uAC74\uBB3C \uC778\uD14C\uB9AC\uC5B4 \uACF5\uC0AC \uACAC\uC801 \uC694\uCCAD \uB4DC\uB9BD\uB2C8\uB2E4. \uAC00\uACA9\uACFC \uACAC\uC801\uC11C\uB97C \uBE44\uAD50\uD574\uC11C \uB2F5\uBCC0 \uC8FC\uC138\uC694.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("br", null), "\uC0C1\uC138 \uC815\uBCF4\uB294 \uCCA8\uBD80\uD30C\uC77C \uD655\uC778 \uBD80\uD0C1\uB4DC\uB9BD\uB2C8\uB2E4. \uBBF8\uB9AC \uAC10\uC0AC\uD569\uB2C8\uB2E4."), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "24px 0 12px",
      font: "var(--type-16b)",
      color: "var(--text-title)"
    }
  }, "\uB313\uAE00 2"), /*#__PURE__*/React.createElement(Card, {
    variant: "gray",
    className: "pc-mb20"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-14m)",
      letterSpacing: "-.02em",
      color: "var(--text-body)",
      marginBottom: 4
    }
  }, "\uBC84\uC2A4\uB2F4\uB2F9 \xB7 Workplace Solutions\uADF8\uB8F9(DS) ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-placeholder)",
      fontWeight: 400,
      marginLeft: 8
    }
  }, "2025.01.22 13:40")), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-15r)",
      letterSpacing: "-.02em",
      color: "var(--text-secondary)"
    }
  }, "\uB2F4\uB2F9 \uC5C5\uCCB4 \uD655\uC778 \uD6C4 \uACAC\uC801\uC11C \uD68C\uC2E0\uB4DC\uB9AC\uACA0\uC2B5\uB2C8\uB2E4. \uC870\uAE08\uB9CC \uAE30\uB2E4\uB824 \uC8FC\uC138\uC694.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Textarea, {
    placeholder: "\uB313\uAE00\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
    maxLength: 1000,
    rows: 2
  })), /*#__PURE__*/React.createElement(Button, null, "\uB4F1\uB85D")), /*#__PURE__*/React.createElement("div", {
    className: "pc-form__actions"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: onList
  }, "\uC804\uCCB4 \uBAA9\uB85D"))));
}

/* ---- App orchestrator -------------------------------------------------- */
function PCWebApp() {
  const [route, setRoute] = React.useState("dashboard");
  const [notice, setNotice] = React.useState(true);
  const [pwModal, setPwModal] = React.useState(false);
  let body;
  if (route === "dashboard") body = /*#__PURE__*/React.createElement(Dashboard, {
    onNav: setRoute
  });else if (route === "board") body = /*#__PURE__*/React.createElement(BoardList, {
    onNav: () => setRoute("detail"),
    onWrite: () => setRoute("write")
  });else if (route === "write") body = /*#__PURE__*/React.createElement(BoardWrite, {
    onCancel: () => setRoute("board"),
    onSubmit: () => setRoute("detail")
  });else if (route === "detail") body = /*#__PURE__*/React.createElement(BoardDetail, {
    onList: () => setRoute("board")
  });else body = /*#__PURE__*/React.createElement(BoardList, {
    onNav: () => setRoute("detail"),
    onWrite: () => setRoute("write")
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "pc-app"
  }, /*#__PURE__*/React.createElement(Header, {
    route: route,
    onNav: setRoute,
    onOpenPw: () => setPwModal(true),
    onLogout: () => setRoute("dashboard")
  }), notice && route === "dashboard" ? /*#__PURE__*/React.createElement(NotificationBar, {
    onClose: () => setNotice(false)
  }) : null, /*#__PURE__*/React.createElement("main", {
    className: "pc-main"
  }, body), /*#__PURE__*/React.createElement(Footer, null), pwModal ? /*#__PURE__*/React.createElement(Dialog, {
    title: "\uBE44\uBC00\uBC88\uD638 \uBCC0\uACBD",
    closeButton: true,
    width: 460,
    onClose: () => setPwModal(false),
    actions: [{
      label: "취소",
      onClick: () => setPwModal(false)
    }, {
      label: "확인",
      onClick: () => setPwModal(false)
    }]
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14,
      paddingBottom: 6
    }
  }, /*#__PURE__*/React.createElement(TextField, {
    label: "\uAE30\uC874 \uBE44\uBC00\uBC88\uD638",
    labelPosition: "top",
    type: "password",
    placeholder: "\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694"
  }), /*#__PURE__*/React.createElement(TextField, {
    label: "\uC0C8 \uBE44\uBC00\uBC88\uD638",
    labelPosition: "top",
    type: "password",
    placeholder: "\uC0C8 \uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694",
    helperText: "\uC601\uBB38, \uC22B\uC790, \uD2B9\uC218\uBB38\uC790\uB97C \uC870\uD569\uD558\uC5EC 8\uC790 \uC774\uC0C1 \uC785\uB825\uD574 \uC8FC\uC138\uC694."
  }), /*#__PURE__*/React.createElement(TextField, {
    label: "\uC0C8 \uBE44\uBC00\uBC88\uD638 \uD655\uC778",
    labelPosition: "top",
    type: "password",
    placeholder: "\uB2E4\uC2DC \uD55C\uBC88 \uC785\uB825\uD574 \uC8FC\uC138\uC694"
  }))) : null);
}
window.PCWebApp = PCWebApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/pc_web/screens.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.ListRow = __ds_scope.ListRow;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Spinner = __ds_scope.Spinner;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.TextField = __ds_scope.TextField;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.BottomNav = __ds_scope.BottomNav;

__ds_ns.Pagination = __ds_scope.Pagination;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Switch = __ds_scope.Switch;

})();
