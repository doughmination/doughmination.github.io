const LASTFM_USER = "Real_AlexTLM";
const LASTFM_API_KEY = "768e8bd0d366f4d6c7874740ca6610ad";

const POLL_MS = 30000; // refresh every 30s

(function nowPlaying() {
  const el = document.getElementById("now-playing");
  if (!el) return;

  // Don't fire until configured (keeps the widget hidden on a fresh clone)
  if (
    LASTFM_USER === "YOUR_LASTFM_USERNAME" ||
    LASTFM_API_KEY === "YOUR_LASTFM_API_KEY"
  ) {
    return;
  }

  const artEl = el.querySelector(".np-art");
  const labelEl = el.querySelector(".np-label");
  const trackEl = el.querySelector(".np-track");
  const artistEl = el.querySelector(".np-artist");

  const endpoint =
    "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks" +
    `&user=${encodeURIComponent(LASTFM_USER)}` +
    `&api_key=${encodeURIComponent(LASTFM_API_KEY)}` +
    "&format=json&limit=1";

  async function update() {
    try {
      const res = await fetch(endpoint);
      if (!res.ok) return;
      const data = await res.json();
      const track = data?.recenttracks?.track?.[0];
      if (!track) return;

      const nowPlaying = track["@attr"]?.nowplaying === "true";
      const name = track.name || "";
      const artist = track.artist?.["#text"] || "";
      const url = track.url || `https://www.last.fm/user/${LASTFM_USER}`;
      const images = track.image || [];
      const art = images[images.length - 1]?.["#text"] || "";

      labelEl.textContent = nowPlaying ? "Now playing" : "Last played";
      trackEl.textContent = name;
      artistEl.textContent = artist;
      el.href = url;
      el.classList.toggle("is-live", nowPlaying);

      if (art) {
        artEl.src = art;
        artEl.style.display = "";
      } else {
        artEl.style.display = "none";
      }

      el.hidden = false;
    } catch (e) {
      /* network hiccup — keep last state, try again next tick */
    }
  }

  update();
  setInterval(update, POLL_MS);
})();
