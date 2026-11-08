var $="#00f268",E="#27af6b",L="quaver-original-imprint",N="M12 20s-7-4.6-9-9c-1.3-3 .8-6.5 4-6.5 2 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 3.2 0 5.3 3.5 4 6.5-2 4.4-9 9-9 9z",_=e=>`url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${N}" fill="${e}" stroke="black" stroke-width="1.8"/></svg>`)}")`;var F="0.58em",O=`
html:not([data-theme="dark"]) {
  color-scheme: light;
  --bg: #f0f0f0;
  --side: #f0f0f0;
  --card: #f6f6f6;
  --panel: #f6f6f6;
  --glass: #f6f6f6;
  --ink: #202124;
  --ink2: #565861;
  --ink3: #41434a;
  --idx: #666973;
  --hover: #e3e3e3;
  --row-hover: #e9e9e9;
  --nav-active: #d8d8d8;
  --nav-active-line: #cecece;
  --line: #dcdcdc;
  --sep: #d8d8d8;
  --panel-line: transparent;
  --glass-line: transparent;
  --ph: #e3e3e3;
  --ph2: #dadada;
  --pill: #e3e3e3;
  --track: #dadada;
  --press: #00000014;
  --qq-row-stripe: #f1f1f1;
  --qq-panel-opacity: 72%;
}

html[data-theme="dark"] {
  color-scheme: dark;
  --bg: #171718;
  --side: #171718;
  --card: #1e1e20;
  --panel: #1e1e20;
  --glass: #1e1e20;
  --ink: #f5f5f5;
  --ink2: #adadae;
  --ink3: #dededf;
  --idx: #a0a0a2;
  --hover: #343436;
  --row-hover: #2c2c2e;
  --nav-active: #353536;
  --nav-active-line: #4b4b4d;
  --line: #414143;
  --sep: #38383a;
  --panel-line: transparent;
  --glass-line: transparent;
  --ph: #343436;
  --ph2: #3d3d3f;
  --pill: #343436;
  --track: #505052;
  --press: #ffffff1a;
  --qq-row-stripe: #222224;
  --qq-panel-opacity: 74%;
}

html:not([data-theme="dark"]):not([data-menu-glass="off"]) {
  --menu-surface: #f6f6f6dc;
  --menu-edge: #ffffff80;
  --menu-shadow: 0 12px 36px #00000026;
}

html[data-theme="dark"]:not([data-menu-glass="off"]) {
  --menu-surface: #222224e6;
  --menu-edge: #ffffff14;
  --menu-shadow: 0 12px 36px #00000075;
}

:root {
  --sidebar-surface: var(--side);
  --content-surface: var(--panel);
  --qq-accent: var(--cvg-accent, var(--acc));
  --qq-current-song: color-mix(in srgb, var(--qq-accent) 68%, var(--ink));
  --qq-play: var(--qq-accent);
}

.sidebar {
  box-shadow: none;
  backdrop-filter: none;
}

body .sidebar:has(> .side-foot) {
  padding-block-end: 4px;
}

.sidebar .nav a,
.sidebar .pl {
  border-radius: 8px;
}

.sidebar .nav a.active {
  background: var(--nav-active);
}

.sidebar .nav a.active::before {
  content: none;
}

.row.sel {
  box-shadow: none;
}

.content,
.player {
  box-shadow: none;
}

.content {
  --top-band-h: 66px;
  --veil-gentle: none;
  --qq-sticky-cover-height: calc(var(--top-band-h) + var(--stuck-h, 0px) + 4px);
  --stuck-cover: linear-gradient(
    to bottom,
    var(--panel) 0 var(--qq-sticky-cover-height),
    transparent var(--qq-sticky-cover-height)
  );
}

.content.has-stuck::before {
  height: var(--qq-sticky-cover-height);
}

.content.has-stuck .queue-panel.dock {
  background-size: 100% max(112px, var(--qq-sticky-cover-height));
}

.content .route {
  --route-pad-top: 0px;
}

#tint-cards:has([data-opt="default"]:disabled) > .qq-tint-option {
  display: none;
}

#tint-cards:has(> .qq-tint-option.sel) .opt-card[data-opt].sel {
  border-color: var(--line);
  box-shadow: none;
  background: transparent;
  color: var(--ink2);
}

body:has(> .ambient:is([data-mode="cover"], [data-mode="custom"])) {
  --sidebar-surface: color-mix(in srgb, var(--side) 62%, transparent);
  --content-surface: color-mix(in srgb, var(--panel) var(--qq-panel-opacity), transparent);
  --control-bar-surface: color-mix(in srgb, var(--glass) 62%, transparent);
  --qq-row-stripe: transparent;
  --row-hover: color-mix(in srgb, var(--ink) 9%, transparent);
}

body:has(> .ambient:is([data-mode="cover"], [data-mode="custom"])) .sidebar {
  --hover: color-mix(in srgb, var(--ink) 9%, transparent);
  --nav-active: color-mix(in srgb, var(--ink) 14%, transparent);
  backdrop-filter: var(--shell-filter);
}

body:has(> .ambient:is([data-mode="cover"], [data-mode="custom"])) .sb-field {
  background: transparent;
}

.sb-field:not(:focus-within) {
  border-color: color-mix(in srgb, var(--ink) 26%, transparent);
}

body:has(> .ambient:is([data-mode="cover"], [data-mode="custom"])) .sb-field:not(:focus-within) {
  box-shadow: none;
}

body:has(> .ambient:is([data-mode="cover"], [data-mode="custom"])) .content.has-stuck {
  --stuck-cover: none;
}

[data-qq-sticky-clip] {
  clip-path: inset(var(--qq-sticky-clip) -100px -100px);
}

[data-qq-sticky-clip="hidden"] {
  clip-path: inset(50%);
}

.route[data-qq-sticky-scrolling] :is(.sticky-bar, .sticky-head).stuck {
  backdrop-filter: var(--shell-filter);
}

.route[data-qq-sticky-snapshot][data-qq-sticky-scrolling] :is(.sticky-bar, .sticky-head).stuck {
  background:
    linear-gradient(var(--content-surface), var(--content-surface)),
    var(--qq-sticky-snapshot) var(--qq-sticky-x, 0px) var(--qq-sticky-y, 0px) / 100vw 100dvh no-repeat;
  backdrop-filter: none;
}

@media (min-width: 860px) {
  .content-top .top-center {
    margin-inline: 36px auto;
  }

  .content-top .top-back {
    right: calc(100% + 27px);
  }

  body:not(.ssd) .content-top::before {
    flex-basis: 20px;
  }
}

.content-top .sb-field {
  border-radius: 10px;
  background: var(--pill);
  box-shadow: none;
}

.sb-field > .sb-icon {
  display: grid;
  flex: none;
  place-items: center;
}

.sb-field > .sb-icon svg {
  display: block;
}

.content-top .top-back[hidden] {
  display: grid;
  opacity: .38;
  pointer-events: none;
}

.content-top .top-back,
.content-top .top-back:hover {
  border: 0;
  background: transparent;
}

.content-top .top-back svg {
  width: 22px;
  height: 22px;
}

.content {
  --qq-page-heading-inset: 10px;
}

.content .home-pagehead.sticky-head {
  padding-top: calc(var(--qq-page-heading-inset) - 7px);
}

.route > .entering:has(> .home-pagehead + .home-lead) {
  padding-inline-start: 14px;
}

.content .pl-head {
  margin-top: var(--qq-page-heading-inset);
}

.pl-head .pl-art:not(.round) {
  border-radius: 6px;
  box-shadow: none;
}

.sticky-bar .sticky-playall {
  border-radius: 999px;
  background: var(--qq-accent);
  border-color: var(--qq-accent);
  color: white;
  font-weight: 600;
}

.sticky-bar .sticky-playall.ghost-btn:hover:not(:disabled) {
  --qq-playall-hover: color-mix(in srgb, var(--qq-accent) 88%, black);
  background: var(--qq-playall-hover);
  border-color: var(--qq-playall-hover);
}

.sticky-bar .sticky-playall.ghost-btn:disabled:hover {
  border-color: var(--qq-accent);
}

.sticky-bar .sticky-playall:focus-visible {
  outline: 2px solid var(--qq-accent);
  outline-offset: 2px;
}

.pl-actions:empty {
  display: none;
}

.pl-info:has(> .pl-desc:not(.open) + .pl-expand) {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

.pl-info > .pl-desc:not(.open):has(+ .pl-expand) {
  grid-area: 3 / 1;
  padding-inline-end: 5em;
}

.pl-info > .pl-desc:not(.open) + .pl-expand {
  grid-area: 3 / 1;
  place-self: end;
  margin: 0;
  padding: 0 8px;
  line-height: 1.35;
}

.qq-playlist-actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
}

.qq-playlist-actions > :is(.sticky-playall, .fav-btn) {
  box-sizing: border-box;
  height: 32px;
  padding-block: 0;
  white-space: nowrap;
}

.sticky-bar__right:has(> .qq-playlist-actions) {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.route .rows > :where(.entering:has(.pl-head) .row[data-songkey], .cloud-row) {
  display: grid;
  grid-template-columns: 16px auto minmax(0, 1fr) minmax(0, 26%) 24px 40px;
  align-items: center;
  column-gap: 10px;
  padding-inline-start: 12px;
}

.route .rows > :where(.entering:has(.pl-head) .row[data-songkey], .cloud-row) > .rmeta {
  display: grid;
  grid-column: 3 / 5;
  grid-template-columns: subgrid;
  grid-template-rows: auto auto;
  align-items: center;
  row-gap: 1px;
}

.route .rows > :where(.entering:has(.pl-head) .row[data-songkey], .cloud-row) > :is(.idx, .rthumb, .rmeta, .row-love, .dur) {
  grid-row: 1;
}

.route .rows > :where(.entering:has(.pl-head) .row[data-songkey], .cloud-row) > .idx {
  grid-column: 1;
  width: auto;
  text-align: center;
}

.route .rows > :where(.entering:has(.pl-head) .row[data-songkey], .cloud-row) > .rthumb {
  grid-column: 2;
}

.route .rows > :where(.entering:has(.pl-head) .row[data-songkey], .cloud-row) .rt {
  grid-area: 1 / 1;
}

.route .rows > :where(.entering:has(.pl-head) .row[data-songkey], .cloud-row):not(:has(.ra)) .rt {
  grid-row: 1 / span 2;
  align-self: center;
}

.route .rows > :where(.entering:has(.pl-head) .row[data-songkey], .cloud-row) .ra {
  grid-area: 2 / 1;
}

.route .rows > :where(.entering:has(.pl-head) .row[data-songkey], .cloud-row) .ral {
  grid-area: 1 / 2 / span 2;
}

.route .entering:has(.pl-head) .row :is(.ra, .ral) .meta-link:hover {
  text-decoration: none;
}

.route .rows > :where(.entering:has(.pl-head) .row[data-songkey], .cloud-row) > .row-love {
  grid-column: 5;
  font-size: 0;
  padding-inline: 4px;
}

.route .rows > :where(.entering:has(.pl-head) .row[data-songkey], .cloud-row) > .row-love::before {
  content: "";
  display: block;
  width: 16px;
  height: 16px;
  background: currentColor;
  mask: ${_("none")} center / contain no-repeat;
}

.route .rows > :where(.entering:has(.pl-head) .row[data-songkey], .cloud-row) > .row-love.on::before {
  mask-image: ${_("black")};
}

.route .rows > :where(.entering:has(.pl-head) .row[data-songkey], .cloud-row) > .dur {
  grid-column: 6;
}

/* The cloud list uses its status badges in place of the favorite and time columns. */
.route .rows > .row.cloud-row {
  grid-template-columns: 16px auto minmax(0, 1fr) minmax(0, 26%) fit-content(25%);
  padding-inline-start: 18px;
}

.route .cloud-row > .cloud-tags {
  grid-area: 1 / 5;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.route .cloud-row .cloud-pill {
  white-space: nowrap;
}

.route .cloud-row .rt {
  font-weight: 500;
}

.route .local-rows > .muted:only-child {
  margin-inline: 18px;
  padding-block: 6px;
  font-size: 13px;
  line-height: 1.5;
}

.route .cloud-auth {
  margin-inline: 18px;
  padding: 6px 0;
  border: 0;
  background: transparent;
}

.route .cloud-auth-copy {
  gap: 2px;
}

.route .cloud-auth-primary {
  border-radius: 999px;
  border-color: var(--line);
  background: var(--pill);
  color: var(--ink);
}

.route .cloud-auth-primary:hover:not(:disabled) {
  background: var(--hover);
}

/* Keep the native sticky toolbar and reuse its play button in the cover area. */
@media (min-width: 1050px) {
  .content {
    --qq-playlist-cover: 150px;
    --qq-playlist-inset: 22px;
    --qq-playlist-gap: 24px;
    --qq-playlist-controls-height: 42px;
  }

  .content:not(:has(.queue-panel.dock.open)) .pl-head:has(+ .sticky-bar .sticky-playall, + .all-source-note[hidden] + .sticky-bar .sticky-playall) {
    margin-inline-start: var(--qq-playlist-inset);
    gap: var(--qq-playlist-gap);
    margin-bottom: 0;
  }

  .content:not(:has(.queue-panel.dock.open)) .pl-head:has(+ .sticky-bar .sticky-playall, + .all-source-note[hidden] + .sticky-bar .sticky-playall) .pl-art {
    width: var(--qq-playlist-cover);
    height: var(--qq-playlist-cover);
  }

  .content:not(:has(.queue-panel.dock.open)) .pl-head:has(+ .sticky-bar .sticky-playall, + .all-source-note[hidden] + .sticky-bar .sticky-playall) .pl-info {
    padding-bottom: var(--qq-playlist-controls-height);
  }

  .content:not(:has(.queue-panel.dock.open)) :is(.pl-head + .sticky-bar, .pl-head + .all-source-note[hidden] + .sticky-bar):has(.sticky-playall) {
    min-height: var(--qq-playlist-controls-height);
    margin-top: calc(-1 * var(--qq-playlist-controls-height));
  }

  .content:not(:has(.queue-panel.dock.open)) :is(.pl-head + .sticky-bar, .pl-head + .all-source-note[hidden] + .sticky-bar):not(.stuck) .sticky-bar__right > :is(.sticky-playall, .qq-playlist-actions) {
    position: absolute;
    inset-inline-start: calc(24px + var(--qq-playlist-inset) + var(--qq-playlist-cover) + var(--qq-playlist-gap));
  }

  .content:not(:has(.queue-panel.dock.open)) :is(.pl-head + .sticky-bar, .pl-head + .all-source-note[hidden] + .sticky-bar):not(.stuck) .sticky-bar__lead {
    visibility: hidden;
    flex: 0 0 0;
  }
}

.row.playing,
.qp-item.cur:not(.dragging) {
  background: transparent;
}

.route .rows > :where(.entering:has(.pl-head) .row[data-songkey], .cloud-row):nth-child(odd):not(:hover, .sel) {
  background: var(--qq-row-stripe);
}

.row.playing:is(:hover, .sel),
.qp-list:not(.reordering) .qp-item.cur:not(.dragging):hover {
  background: var(--row-hover);
}

.row.playing :is(.rt, .ra, .ral, .dur),
.row.playing .meta-link:hover,
.qp-item.cur :is(.qi-n, .qi-a, .qi-i) {
  color: var(--qq-current-song);
}

:is(.row.playing > .rthumb, .qp-item.cur .qi-thumb) {
  position: relative;
}

:is(.row.playing > .rthumb, .qp-item.cur .qi-thumb)::before,
:is(.row.playing > .rthumb, .qp-item.cur .qi-thumb)::after {
  content: "";
  position: absolute;
  pointer-events: none;
}

:is(.row.playing > .rthumb, .qp-item.cur .qi-thumb)::before {
  inset: 0;
  background: #0006;
}

:is(.row.playing > .rthumb, .qp-item.cur .qi-thumb)::after {
  inset: 50% auto auto 50%;
  width: 14px;
  height: 12px;
  transform: translate(-50%, -50%);
  background: white;
  clip-path: polygon(
    0 100%, 0 7px, 2px 7px, 2px 100%,
    6px 100%, 6px 2px, 8px 2px, 8px 100%,
    12px 100%, 12px 5px, 14px 5px, 14px 100%
  );
}

@media (prefers-reduced-motion: no-preference) {
  body:has(> .np.playing) :is(.row.playing > .rthumb, .qp-item.cur .qi-thumb)::after {
    animation: qq-cover-playing .95s ease-in-out infinite;
  }
}

@keyframes qq-cover-playing {
  25% {
    clip-path: polygon(
      0 100%, 0 1px, 2px 1px, 2px 100%,
      6px 100%, 6px 7px, 8px 7px, 8px 100%,
      12px 100%, 12px 3px, 14px 3px, 14px 100%
    );
  }
  50% {
    clip-path: polygon(
      0 100%, 0 5px, 2px 5px, 2px 100%,
      6px 100%, 6px 0, 8px 0, 8px 100%,
      12px 100%, 12px 8px, 14px 8px, 14px 100%
    );
  }
  75% {
    clip-path: polygon(
      0 100%, 0 8px, 2px 8px, 2px 100%,
      6px 100%, 6px 5px, 8px 5px, 8px 100%,
      12px 100%, 12px 0, 14px 0, 14px 100%
    );
  }
}

.home-cards {
  gap: 20px;
}

.home-cards .card .art:not(.round),
.player .pb-cover {
  border-radius: 6px;
}

.player .pb-play {
  width: 40px;
  height: 30px;
  border-radius: 999px;
  color: #101713;
  color: contrast-color(var(--qq-play));
  background: var(--qq-play);
}

.player .pb-play:hover {
  background: color-mix(in srgb, var(--qq-play) 85%, var(--ink));
}

body[data-control-bar="bottom"]:has(.qq-progress) .body {
  margin-bottom: calc(-1 * var(--control-bar-slot));
}

body[data-control-bar="bottom"]:has(.qq-progress) .body > :is(.content, .side-resizer) {
  margin-bottom: var(--control-bar-slot);
}

body[data-control-bar="bottom"]:not(:has(> .np.open)) .player {
  margin-inline-start: calc(var(--side-w, 216px) + 20px);
}

body[data-control-bar="bottom"].side-collapsed:not(:has(> .np.open)) .player {
  margin-inline-start: 84px;
}

.player:has(.qq-progress) .pb-fill-clip,
.player:has(.qq-progress) .pb-time {
  display: none;
}

.player:has(.qq-progress) {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(140px, 300px) minmax(max-content, 1fr);
  align-items: center;
  column-gap: 8px;
}

.player:has(.qq-progress) .pb-left {
  width: 100%;
}

.player:has(.qq-progress) .pb-left .now {
  line-height: 1.35;
}

.player:has(.qq-progress) .pb-mid {
  flex-direction: column;
  gap: 0;
  margin: 0;
  inset-block-start: 2px;
}

.player:has(.qq-progress) .pb-right {
  justify-self: end;
}

.qq-transport,
.qq-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.qq-loophost {
  position: relative;
  display: flex;
}

.qq-loophost > .pb-lpop {
  right: auto;
  left: 50%;
  bottom: calc(100% + 16px);
  transform: translateX(-50%);
}

/* The host's third volume arc nearly overlaps the second at full volume. */
.player :is(#pb-mute, #pb-mute2) path[d="M19.6 5.2a10.4 10.4 0 0 1 0 13.6"] {
  d: path("M19.6 5.2Q26 12 19.6 18.8");
}

.qq-progress {
  width: 100%;
  color: var(--ink2);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.qq-progress span {
  min-width: 4ch;
  text-align: center;
}

.qq-progress input {
  appearance: none;
  min-width: 0;
  width: 100%;
  height: 14px;
  margin: 0;
  background: transparent;
  cursor: pointer;
}

.qq-progress input::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 4px;
  background: linear-gradient(to right, var(--ink) var(--qq-progress, 0%), var(--track) 0);
}

.qq-progress input::-webkit-slider-thumb {
  appearance: none;
  width: 8px;
  height: 8px;
  margin-top: -2px;
  border-radius: 50%;
  background: var(--ink);
}

body:has(> .np.open) .player {
  --control-bar-surface: transparent;
  --qq-accent: var(--qq-cover-accent, var(--cvg-accent, var(--acc)));
  --qq-play: var(--qq-accent);
  --ink: #f6f7fa;
  --ink2: #d2d8dd;
  --ink3: #e6ebee;
  --track: #536269;
  --ph2: #344a53;
  --press: #ffffff20;
  --card: #24383f;
  --line: #ffffff24;
  --menu-surface: #24383f;
  --menu-line: #ffffff24;
  border-color: transparent;
}

body:has(> .np.open) .player::before {
  backdrop-filter: none;
}

.winbtns {
  top: 17px;
}

.winbtns button {
  width: 28px;
  height: 28px;
}

.winbtns button svg {
  width: 14px;
  height: 14px;
}

body:not(.ssd) .content-top .top-drag {
  right: 102px;
}

body:not(.ssd):has(> .np.open) .winbtns {
  visibility: visible;
}

body:not(.ssd):has(> .np.open) .winbtns button {
  color: #f6f7fa;
}

body:not(.ssd):has(> .np.open) .winbtns button:hover {
  background: #ffffff24;
}

body:not(.ssd):has(> .np.open) .winbtns button[data-win="close"]:hover {
  background: #e81123;
}

body:not(.ssd) .np.open .np-drag {
  left: 60px;
  right: 122px;
}

.np > .qq-np-collapse {
  display: none;
  position: absolute;
  z-index: 3;
  top: 16px;
  left: 16px;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #fff9;
  cursor: pointer;
  -webkit-app-region: no-drag;
}

.np.open > .qq-np-collapse {
  display: grid;
  place-items: center;
}

.np > .qq-np-collapse:hover {
  color: white;
  background: #ffffff17;
}

.np {
  --qq-playing-lyric: var(--qq-cover-accent, var(--qq-accent));
  --qq-unplayed-lyric: #c6c2cd;
  background: #171b28;
}

.np .np-bg {
  filter: blur(85px) saturate(1.2) brightness(.72);
}

.np .np-scrim,
.np.kara .np-scrim {
  background: linear-gradient(130deg, #181726b0, #111722c9);
}

.np[data-qq-cover-palette] .np-scrim {
  background:
    radial-gradient(ellipse at 15% 74%, var(--qq-cover-left), transparent 72%),
    radial-gradient(ellipse at 90% 25%, var(--qq-cover-right), transparent 78%),
    #191926;
}

.np .np-cover,
.np .np-cover-wrap::before {
  border-radius: 6px;
}

.np .np-ly-line {
  filter: none;
  padding-block: ${F};
}

.np .np-ly-line.cur {
  color: var(--qq-playing-lyric);
}

.np .np-ly-line .l2 {
  font-size: .85em;
}

.np .np-ly-line.cur .l2 {
  font-size: 1em;
  color: var(--qq-unplayed-lyric);
  opacity: 1;
}

.np .np-kara-host {
  --amll-lp-color: var(--qq-unplayed-lyric);
}

.np .np-kara-host .amll-lyric-player {
  mix-blend-mode: normal;
}

/* Fade the whole main line after removing per-word masks outside the active line. */
.np .np-kara-host [class*="_lyricMainLine"]:not([class*="_gradientMask"] [class*="_active"]) {
  opacity: .56;
}

.np .np-kara-host [class*="_lyricMainLine"]:not([class*="_gradientMask"] [class*="_active"]) [style*="mask-image"] {
  mask-image: none !important;
}

.np .np-kara-host [data-qq-karaoke-word] {
  mask-image: none !important;
  color: transparent;
  text-shadow: none;
  background: var(--qq-word-gradient) var(--qq-word-position) / var(--qq-word-size) no-repeat;
  background-color: var(--amll-lp-color);
  background-clip: text;
}

.np .np-kara-host [data-qq-karaoke-native] {
  mask-image: none !important;
  color: color-mix(in srgb, var(--qq-playing-lyric) var(--qq-word-played, 0%), var(--amll-lp-color));
}

.np .np-kara-host .amll-lyric-player [class*="lyricSubLine"] {
  font-size: .85em;
}

.np .np-kara-host .amll-lyric-player [class*="_lyricLine"][class*="_active"] > [class*="_lyricSubLine"] {
  color: var(--qq-unplayed-lyric);
  opacity: 1;
}

/* AMLL applies its distance blur inline. Keep neighboring lyrics readable. */
.np .np-kara-host [class*="lyricLineWrapper"] {
  filter: none !important;
}

.np .np-kara-host .amll-lyric-player [class*="lyricLineWrapper"] {
  padding-block: ${F};
}

.np:not(.np-taken-over) .np-inner {
  --qq-cover-size: min(42vh, 440px);
  width: 80%;
  height: min(720px, calc(100dvh - 150px), max(560px, calc(100dvh - 240px)));
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  column-gap: clamp(30px, 8vw, 150px);
  row-gap: 12px;
}

.np.np-lyrics-full:not(.np-taken-over) .np-inner {
  left: 10%;
  right: 10%;
  width: auto;
  height: auto;
}

.np:not(.np-taken-over) .np-side {
  display: contents;
}

.np:not(.np-taken-over) .np-cover-wrap {
  grid-column: 1;
  grid-row: 1 / span 2;
  place-self: center;
  width: min(100%, var(--qq-cover-size));
  max-height: 100%;
}

.np:not(.np-taken-over) .np-lyrics,
.np:not(.np-taken-over) .np-kara-host {
  grid-column: 2;
  grid-row: 2;
  min-height: 0;
}

.np:not(.np-taken-over) :is(.np-lyrics, .np-kara-host, .np-meta) {
  margin-inline-start: max(0px, calc((100% - var(--qq-cover-size)) * ${.125}));
}

.np:not(.np-taken-over) .np-kara-host {
  --amll-lp-font-size: calc(21px * var(--np-ly-scale, 1));
  font-weight: 550;
}

.np:not(.np-taken-over) .np-kara-host .amll-lyric-player {
  --lyric-line-padding-x: 0px;
  --amll-lp-line-padding-x: 0px;
}

.np:not(.np-taken-over) .np-ly-line {
  padding-inline: 0;
}

.np:not(.np-taken-over) .np-meta {
  grid-column: 2;
  grid-row: 1;
  margin-top: 0;
  align-items: flex-start;
  text-align: left;
}

.np:not(.np-taken-over) .np-morewrap {
  align-self: flex-start;
  margin-top: 4px;
}

.np:not(.np-taken-over) .np-morewrap :is(.np-menu, .np-qinfo) {
  inset: calc(100% + 8px) auto auto 0;
}

@media (max-width: 859px), (max-height: 579px) {
  .np:not(.np-taken-over) .np-inner {
    --qq-cover-size: min(36dvh, 440px);
    column-gap: clamp(18px, 6vw, 65px);
    row-gap: 6px;
  }

  .np:not(.np-taken-over) .np-title {
    font-size: 18px;
  }
}
`,R=O+`
:root[data-original-imprint-green] {
  --cvg-accent: ${E} !important;
  --cvg-glow: ${E} !important;
  --cvg-bar-line: ${E} !important;
  --cvg-bar-fill: ${E} !important;
  --np-hl: ${E} !important;
  --qq-play: ${$};
  --qq-current-song: ${E};
}

:root[data-original-imprint-green] .sidebar {
  --cvg-accent: ${$};
  --cvg-glow: ${$};
}
`;function B(e){let m=e.closest(".content"),o=document.querySelector("body > .ambient");if(!m||!o)return;let t=new Set,n=o.querySelector(".ambient-art"),p=new Image,a=document.createElement("canvas"),d=0,s,k,l=()=>["cover","custom"].includes(o.dataset.mode),c=()=>{delete e.dataset.qqStickySnapshot;for(let b of["--qq-sticky-snapshot","--qq-sticky-x","--qq-sticky-y"])e.style.removeProperty(b)},h=()=>{if(!l()||e.hasAttribute("data-qq-sticky-scrolling"))return;let b=o.querySelector(".ambient-host.ready canvas"),C=n?.style.backgroundImage.match(/^url\(["']?(.*?)["']?\)$/)?.[1];if(o.dataset.renderer==="quaver"&&C&&C!==k){k=C;let w=new URL(C,location.href);p.src=/^https?:$/.test(w.protocol)&&w.origin!==location.origin?"/api/img?u="+encodeURIComponent(w.href):w.href}let q=o.dataset.renderer==="quaver"?p:b,S=q?.naturalWidth??q?.width,P=q?.naturalHeight??q?.height;if(!S||!P)return;a.width=192,a.height=Math.max(1,Math.round(a.width*innerHeight/innerWidth));let y=a.getContext("2d",{alpha:!1});if(y)try{y.fillStyle=getComputedStyle(document.documentElement).getPropertyValue("--bg").trim(),y.fillRect(0,0,a.width,a.height);let w=y.getImageData(0,0,1,1).data;if(q===p){let M=Math.max(a.width/S,a.height/P)*1.15,I=S*M,z=P*M,W=parseFloat(getComputedStyle(n).getPropertyValue("--bg-blur"))||70;y.filter=`blur(${W*a.width/innerWidth}px) saturate(1.5) brightness(1.06)`,y.globalAlpha=o.dataset.mode==="custom"?1:.55,y.drawImage(q,(a.width-I)/2,(a.height-z)/2,I,z)}else y.globalAlpha=o.dataset.mode==="custom"?1:.9,y.drawImage(q,0,0,a.width,a.height);if(!y.getImageData(0,0,a.width,a.height).data.some((M,I)=>M!==w[I%4]))return;e.style.setProperty("--qq-sticky-snapshot",`url("${a.toDataURL("image/webp")}")`),e.dataset.qqStickySnapshot=""}catch{}};p.onload=h;let f=b=>{delete b.dataset.qqStickyClip,b.style.removeProperty("--qq-sticky-clip"),t.delete(b)},x=()=>{d=0;let b=m.classList.contains("has-stuck")&&l()?e.querySelector(":scope > .entering > :is(.sticky-bar, .sticky-head).stuck"):null,C=new Map;if(b){let q=b.getBoundingClientRect(),S=q.bottom;if(e.hasAttribute("data-qq-sticky-snapshot"))for(let[y,w]of[["--qq-sticky-x",q.left],["--qq-sticky-y",q.top]]){let A=-w+"px";e.style.getPropertyValue(y)!==A&&e.style.setProperty(y,A)}let P=e.getBoundingClientRect().top;for(let y of b.parentElement.children){if(y===b||y.matches(".list-fabs, [hidden]"))continue;let w=y.getBoundingClientRect();w.bottom<=P||w.top>=S||["absolute","fixed","sticky"].includes(getComputedStyle(y).position)||C.set(y,w.bottom<=S?"hidden":Math.ceil(S-w.top)+"px")}}for(let q of t)C.has(q)||f(q);for(let[q,S]of C){let P=S==="hidden"?"hidden":"",y=P?"0px":S;q.dataset.qqStickyClip!==P&&(q.dataset.qqStickyClip=P),q.style.getPropertyValue("--qq-sticky-clip")!==y&&q.style.setProperty("--qq-sticky-clip",y),t.add(q)}},u=()=>{d||(d=requestAnimationFrame(x))},g=()=>{l()&&(e.dataset.qqStickyScrolling="",cancelAnimationFrame(d),x(),clearTimeout(s),s=setTimeout(()=>{delete e.dataset.qqStickyScrolling,x(),h()},110))},r=new MutationObserver(u);r.observe(m,{attributes:!0,attributeFilter:["class"]});let i=new MutationObserver(()=>{l()?h():(clearTimeout(s),delete e.dataset.qqStickyScrolling,c()),u()});i.observe(o,{attributes:!0,attributeFilter:["data-mode","data-renderer"]}),n&&i.observe(n,{attributes:!0,attributeFilter:["style","class"]});let v=o.querySelector(".ambient-host");return v&&i.observe(v,{childList:!0,attributes:!0,attributeFilter:["class"]}),r.observe(e,{childList:!0,subtree:!0}),e.addEventListener("scroll",g,{passive:!0}),window.addEventListener("resize",u),u(),h(),()=>{r.disconnect(),i.disconnect(),cancelAnimationFrame(d),clearTimeout(s),delete e.dataset.qqStickyScrolling,p.onload=null,c(),e.removeEventListener("scroll",g),window.removeEventListener("resize",u),t.forEach(f)}}function T(e){let m,o,t=()=>{if(o?.isConnected)return;let p=e.querySelector(":scope > .entering"),a=p?.querySelector(".pl-head .pl-actions > .fav-btn"),d=p?.querySelector(".sticky-bar__right > .sticky-playall");if(!a||!d)return;let s=document.createComment("Playlist favorite position");a.before(s),o=document.createElement("div"),o.className="qq-playlist-actions",d.before(o),o.append(d,a),m=()=>{s.replaceWith(a),o.replaceWith(d)}},n=new MutationObserver(t);return n.observe(e,{childList:!0,subtree:!0}),t(),()=>{n.disconnect(),o?.isConnected&&m()}}function V(e,m,o){let t,n,p=k=>{k.target.closest("button[data-opt]")&&m()&&o(!1)},a=()=>{t?.removeEventListener("click",p),n?.remove()},d=()=>{let k=e.querySelector("#tint-cards");if(k!==t){if(a(),t=k,!t)return;n=document.createElement("button"),n.type="button",n.className="opt-card qq-tint-option",n.textContent="\u539F\u5370\u8C61\xB7\u7EFF",n.onclick=()=>o(!0),t.append(n),t.addEventListener("click",p)}if(!n?.isConnected)return;let l=m();n.classList.toggle("sel",l),n.setAttribute("aria-pressed",String(l))},s=new MutationObserver(d);return s.observe(e,{childList:!0,subtree:!0}),d(),{sync:d,dispose(){s.disconnect(),a()}}}function H(e){let m=e.querySelector(".pb-mid"),o=e.querySelector("#pb-time"),t=e.querySelector(".pb-lpop"),n=["#pb-loop","#pb-prev","#pb-play","#pb-next",".pb-volhost"].map(i=>e.querySelector(i));if(!m||!o||n.some(i=>!i))return;let p=document.createElement("div");p.className="qq-transport";let a=n.map(i=>{let v=document.createComment("Original player control position");return i.before(v),p.append(i),v}),d=document.createComment("Original playback mode menu position");if(t){let i=document.createElement("div");i.className="qq-loophost",t.before(d),n[0].before(i),i.append(n[0],t)}let s=document.createElement("div");s.className="qq-progress";let k=document.createElement("span"),l=document.createElement("span"),c=document.createElement("input");c.type="range",c.max="100",c.step="0.1",c.setAttribute("aria-label","\u64AD\u653E\u8FDB\u5EA6"),s.append(k,c,l),m.append(p,s);let h=!1,f=new AbortController,x={signal:f.signal},u=()=>c.style.setProperty("--qq-progress",c.value+"%"),g=()=>{let[i="0:00",v="0:00"]=o.textContent.split(" / ");k.textContent=i,l.textContent=v,c.disabled=!v.split(":").some(b=>Number(b)>0),c.matches(":active")||(c.value=String(100*(Number(e.style.getPropertyValue("--pf"))||0)),c.setAttribute("aria-valuetext",i+" / "+v),u())};e.addEventListener("pointerdown",i=>{!h&&!i.target.closest("button, input, .pb-volpop, .pb-qpop, .pb-lpop")&&i.stopImmediatePropagation()},{...x,capture:!0}),c.addEventListener("input",u,x),c.addEventListener("change",()=>{let i=e.getBoundingClientRect(),v=i.left+1+(i.width-2)*Number(c.value)/100;h=!0;try{for(let b of["pointerdown","pointerup"])e.dispatchEvent(new PointerEvent(b,{bubbles:!0,clientX:v,pointerId:-1}))}finally{h=!1}},x);let r=new MutationObserver(g);return r.observe(e,{attributes:!0,attributeFilter:["style"]}),r.observe(o,{childList:!0,subtree:!0,characterData:!0}),g(),()=>{r.disconnect(),f.abort(),a.forEach((i,v)=>i.replaceWith(n[v])),t&&d.replaceWith(t),p.remove(),s.remove()}}function K(e,m){let o=document.querySelector('script[type="module"][src]')?.src;if(!o||new URL(o).origin!==location.origin)return;let t,n=!1,p=()=>{if(!t||!e.querySelector(".pl-head .liked-cover"))return;let d=new Map(t.likedCache?.map(s=>[String(s.mid),s.album]));for(let s of e.querySelectorAll(".rows > .row[data-songkey]")){let k=s.querySelector(".rmeta"),l=d.get(s.dataset.songkey);if(!k||k.querySelector(".ral")||!l?.name)continue;let c=document.createElement("span");if(c.className="ral qq-liked-album",l.mid){let h=document.createElement("a");h.className="meta-link",h.dataset.link=`album:${l.mid}:${l.name}`,h.title=l.name,h.textContent=l.name,c.append(h)}else c.textContent=l.name;k.append(c)}},a=new MutationObserver(p);return import(o).then(d=>{n||(t=Object.values(d).find(s=>typeof s?.loadLoved=="function"&&"likedCache"in s),t&&(a.observe(e,{childList:!0,subtree:!0}),p()))}).catch(d=>m?.warn("\u65E0\u6CD5\u8BFB\u53D6 Quaver \u6536\u85CF\u7F13\u5B58",d)),()=>{n=!0,a.disconnect(),e.querySelectorAll(".qq-liked-album").forEach(d=>d.remove())}}function U(e){let m=document.createElement("canvas");m.width=m.height=32;let o=m.getContext("2d",{willReadFrequently:!0});if(!o)return null;o.drawImage(e,0,0,32,32);let{data:t}=o.getImageData(0,0,32,32),n=Array(24).fill(0);for(let l=0;l<t.length;l+=4){let[c,h,f]=t.subarray(l,l+3),x=Math.max(c,h,f),u=Math.min(c,h,f),g=x-u;if(t[l+3]<128||g<22||x<48)continue;let r=x===c?(h-f)/g:x===h?2+(f-c)/g:4+(c-h)/g,i=Math.floor((r+6)%6*4);n[i]+=(g/255)**1.7}let p=n.map((l,c)=>l+.5*(n[(c+23)%24]+n[(c+1)%24])),a=p.indexOf(Math.max(...p));if(p[a]<.35)return null;let d=p.reduce((l,c,h)=>{let f=Math.abs(h-a);return f>=3&&f<=21&&c>(p[l]??p[a]*.12)?h:l},-1),s=a*15+7.5,k=d<0?s:d*15+7.5;return{accent:`hsl(${s} 83% 64%)`,left:`hsl(${s} 42% 17%)`,right:`hsl(${k} 36% 19%)`}}function j(e){let m=e.querySelector(".np-cover");if(!m)return;let o=document.body,t=document.createElement("button");t.className="qq-np-collapse",t.type="button",t.title="\u6536\u8D77\u64AD\u653E\u9875",t.setAttribute("aria-label",t.title),t.innerHTML='<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"><path d="m3 8 9 9 9-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',t.onclick=()=>{let u=document.getElementById("pb-cover");u?.click(),u?.focus({preventScroll:!0})},e.append(t);let n=["--qq-cover-accent","--qq-cover-left","--qq-cover-right"],p=()=>{n.forEach(u=>o.style.removeProperty(u)),delete e.dataset.qqCoverPalette},a,d=!1,s,k=-1/0,l=new Set,c=u=>{delete u.dataset.qqKaraokeWord,delete u.dataset.qqKaraokeNative;for(let g of["--qq-word-gradient","--qq-word-position","--qq-word-size","--qq-word-played"])u.style.removeProperty(g)},h=u=>{if(s=requestAnimationFrame(h),u-k<30)return;k=u;let g=new Set;for(let r of e.querySelectorAll('.np-kara-host [class*="_gradientMask"] [style*="mask-image"]')){if(!r.closest('[class*="_lyricMainLine"]')?.matches('[class*="_active"]'))continue;let v=r.style.maskImage;if(!v.includes("--bright-mask-alpha")||!v.includes("--dark-mask-alpha"))continue;let{maskPosition:b,maskSize:C}=getComputedStyle(r);if(r.childElementCount){let S=b.split(" ")[0],P=C.split(" ")[0],y=r.offsetWidth,w=y&&S.endsWith("px")&&P.endsWith("%")?(parseFloat(S)/y+parseFloat(P)/200)*100:0,A=Math.round(Math.max(0,Math.min(100,w)))+"%";r.style.getPropertyValue("--qq-word-played")!==A&&r.style.setProperty("--qq-word-played",A),r.hasAttribute("data-qq-karaoke-native")||(r.dataset.qqKaraokeNative=""),r.hasAttribute("data-qq-karaoke-word")&&delete r.dataset.qqKaraokeWord,g.add(r);continue}let q=v.replace(/rgba?\([^)]*var\(--bright-mask-alpha[^)]*\)\)/g,"var(--qq-playing-lyric)").replace(/rgba?\([^)]*var\(--dark-mask-alpha[^)]*\)\)/g,"var(--amll-lp-color)");q.includes("-mask-alpha")||(r.style.getPropertyValue("--qq-word-gradient")!==q&&r.style.setProperty("--qq-word-gradient",q),r.style.getPropertyValue("--qq-word-position")!==b&&r.style.setProperty("--qq-word-position",b),(!l.has(r)||r.style.getPropertyValue("--qq-word-size")!==C)&&r.style.setProperty("--qq-word-size",C),r.hasAttribute("data-qq-karaoke-word")||(r.dataset.qqKaraokeWord=""),r.hasAttribute("data-qq-karaoke-native")&&delete r.dataset.qqKaraokeNative,g.add(r))}for(let r of l)g.has(r)||c(r);l=g},f=()=>{if(!e.classList.contains("open")){cancelAnimationFrame(s),s=void 0,l.forEach(c),l.clear();return}s===void 0&&(s=requestAnimationFrame(h));let u=m.querySelector("img")?.src;if(u===a||(a=u,p(),!u))return;let g=new Image,r=new URL(u);g.src=/^https?:$/.test(r.protocol)&&r.origin!==location.origin?"/api/img?u="+encodeURIComponent(u):u,g.decode().then(()=>{if(d||a!==u)return;let i=U(g);i&&(n.forEach((v,b)=>o.style.setProperty(v,Object.values(i)[b])),e.dataset.qqCoverPalette="")}).catch(()=>{})},x=new MutationObserver(f);return x.observe(e,{attributes:!0,attributeFilter:["class"]}),x.observe(m,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["src"]}),f(),()=>{d=!0,x.disconnect(),cancelAnimationFrame(s),t.remove(),l.forEach(c),p()}}var G={id:L,name:"\u539F\u5370\u8C61",version:"0.1.68",minHostVersion:"1.7.0",kind:"third-party",description:"\u539F\u5370\u8C61\uFF0C\u590D\u523B\u719F\u6089\u7684\u684C\u9762\u97F3\u4E50\u64AD\u653E\u5668\u5916\u89C2\u3002",setup(e){e.registerThemePack({id:L,name:"\u539F\u5370\u8C61",preview:[$,E,"#f6f6f6","#1e1e20"],variants:[{id:"light",name:"\u539F\u5370\u8C61",css:R}]});let m,o,t,n,p,a,d=()=>e.storage.get("highlight")!=="host",s=f=>{document.documentElement.toggleAttribute("data-original-imprint-green",f&&d())},k=f=>{e.storage.set("highlight",f?"green":"host"),s(!0),n?.sync()},l=()=>{let{packId:f,variantId:x,suspended:u}=e.style.state();e.style.packs().some(b=>b.id===L)&&(f===L?e.storage.get("selected")!=="1"&&e.storage.set("selected","1"):e.storage.get("selected")==="1"&&e.storage.remove("selected"));let g=f===L&&!u;if(s(g),!g){m?.(),m=void 0,o?.(),o=void 0,t?.(),t=void 0,n?.dispose(),n=void 0,p?.(),p=void 0,a?.(),a=void 0;return}if(x!=="light"){e.style.activate(L,"light");return}let r=document.getElementById("player-bar");r&&!m&&(m=H(r));let i=document.getElementById("route");i&&!o&&(o=K(i,e.log)),i&&!n&&(n=V(i,d,k)),i&&!p&&(p=B(i)),i&&!a&&(a=T(i)),n?.sync();let v=document.querySelector("body > .np");v&&!t&&(t=j(v))},c=e.style.onChange(l),h=e.style.state();return!h.packId&&!h.suspended&&e.storage.get("selected")==="1"&&e.style.activate(L,"light"),l(),()=>{c(),m?.(),o?.(),t?.(),n?.dispose(),p?.(),a?.(),s(!1)}}};export{G as default};
