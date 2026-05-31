const CAT_MODES = [
  { name: "Classic", filter: "none" },
  { name: "Shadow Cat", filter: "invert(1) drop-shadow(0 0 3px #cba6f7)" },
  { name: "Ghost Cat", filter: "grayscale(1) brightness(1.7) opacity(0.55) drop-shadow(0 0 4px #89dceb)" },
  { name: "CRT Cat", filter: "invert(48%) sepia(80%) saturate(2000%) hue-rotate(85deg) brightness(0.9) contrast(1.2)" },
  { name: "Vaporwave Cat", filter: "invert(60%) sepia(90%) saturate(3000%) hue-rotate(280deg) brightness(0.95)" },
  { name: "Gold Cat", filter: "invert(75%) sepia(85%) saturate(1400%) hue-rotate(8deg) brightness(1.0)" },
  { name: "Sapphire Cat", filter: "invert(45%) sepia(90%) saturate(2500%) hue-rotate(200deg) brightness(1.0)" },
  { name: "Dusty Cat", filter: "invert(60%)" },
];
const UNLOCK_EVERY = 5; // clicks needed to unlock each new mode
const SPRITE = "/images/oneko.gif";
const IDLE_POS = "-96px -96px"; // idle frame of the sprite sheet

(function catModes() {
  const oneko = document.getElementById("oneko");
  if (!oneko) return;

  oneko.style.pointerEvents = "auto";
  oneko.style.cursor = "pointer";

  const ls = window.localStorage;
  let clicks = parseInt(ls.getItem("onekoClicks") || "0", 10);
  let mode = parseInt(ls.getItem("onekoMode") || "0", 10);

  const unlockedCount = () =>
    Math.min(CAT_MODES.length, 1 + Math.floor(clicks / UNLOCK_EVERY));
  const isUnlocked = (i) => i < unlockedCount();
  const apply = (i) => (oneko.style.filter = CAT_MODES[i].filter);

  /* ---------- picker overlay (no visible trigger — press C to find it) ---------- */
  const overlay = document.createElement("div");
  overlay.className = "cat-picker";
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="cat-picker-panel" role="dialog" aria-label="Choose a cat">
      <div class="cat-picker-head">
        <span>Cat collection</span>
        <button class="cat-picker-close" type="button" aria-label="Close">&times;</button>
      </div>
      <div class="cat-grid"></div>
      <p class="cat-hint">Some cats are still hidden&hellip; &middot; press C to toggle</p>
    </div>`;
  document.body.appendChild(overlay);
  const grid = overlay.querySelector(".cat-grid");

  function renderGrid() {
    grid.innerHTML = "";
    CAT_MODES.forEach((c, i) => {
      const unlocked = isUnlocked(i);
      const opt = document.createElement(unlocked ? "button" : "div");
      opt.className =
        "cat-option" + (unlocked ? "" : " locked") + (i === mode ? " current" : "");
      if (unlocked) opt.type = "button";
      const previewFilter = unlocked ? c.filter : "brightness(0) opacity(0.3)";
      opt.innerHTML = `
        <span class="cat-preview" style="background-image:url('${SPRITE}');background-position:${IDLE_POS};filter:${previewFilter}"></span>
        <span class="cat-name">${unlocked ? c.name : "???"}</span>`;
      if (unlocked) opt.addEventListener("click", () => selectMode(i));
      grid.appendChild(opt);
    });
  }

  function selectMode(i) {
    mode = i;
    ls.setItem("onekoMode", String(i));
    apply(i);
    renderGrid();
  }

  const openPicker = () => {
    renderGrid();
    overlay.hidden = false;
  };
  const closePicker = () => (overlay.hidden = true);
  const togglePicker = () => (overlay.hidden ? openPicker() : closePicker());

  overlay
    .querySelector(".cat-picker-close")
    .addEventListener("click", closePicker);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePicker();
  });
  document.addEventListener("keydown", (e) => {
    // ignore while typing in a field or with modifier keys held
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "");
    if (e.key === "Escape" && !overlay.hidden) {
      closePicker();
    } else if (
      (e.key === "c" || e.key === "C") &&
      !e.ctrlKey && !e.metaKey && !e.altKey && !typing
    ) {
      togglePicker();
    }
  });

  /* ---------- toast ---------- */
  let toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "cat-toast";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.remove("show");
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1700);
  }

  /* ---------- init + cat click ---------- */
  mode = Math.max(0, Math.min(mode, unlockedCount() - 1));
  apply(mode);

  oneko.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const before = unlockedCount();
    clicks += 1;
    ls.setItem("onekoClicks", String(clicks));
    const after = unlockedCount();

    if (after > before) {
      mode = after - 1;
      toast(`✨ Unlocked: ${CAT_MODES[mode].name}!`);
    } else {
      mode = (mode + 1) % after;
      toast(CAT_MODES[mode].name);
    }

    ls.setItem("onekoMode", String(mode));
    apply(mode);
    if (!overlay.hidden) renderGrid();
  });
})();
