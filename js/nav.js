// Navigate via data-href so the destination URL never shows in the
// browser status bar on hover. Pairs with the CSS View Transitions
// (@view-transition) for a smooth cross-fade between pages.
document.querySelectorAll("[data-href]").forEach((el) => {
  el.style.cursor = "pointer";
  if (!el.hasAttribute("role")) el.setAttribute("role", "link");
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");

  const go = () => {
    const url = el.dataset.href;
    if (!url) return;
    location.href = url;
  };

  el.addEventListener("click", go);
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go();
    }
  });
});
