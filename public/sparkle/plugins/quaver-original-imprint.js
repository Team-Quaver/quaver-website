var $="#00f268",M="#27af6b",z="quaver-original-imprint",W="M12 20s-7-4.6-9-9c-1.3-3 .8-6.5 4-6.5 2 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 3.2 0 5.3 3.5 4 6.5-2 4.4-9 9-9 9z",I=e=>`url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${W}" fill="${e}" stroke="black" stroke-width="1.8"/></svg>`)}")`;var F="0.58em",B=`
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

body:has(> .ambient:is([data-mode="cover"], [data-mode="custom"])):has(:is(#side-collapse, .content-top .top-back):hover) .qtip {
  background: color-mix(in srgb, var(--menu-surface) 85%, var(--card));
  backdrop-filter: none;
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

.content-top .searchbar {
  inset-inline-start: -8px;
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

.content-top .top-back {
  border: 0;
  background: transparent;
}

.content-top .top-back:not([hidden]):hover {
  background: var(--hover);
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
  mask: ${I("none")} center / contain no-repeat;
}

.route .rows > :where(.entering:has(.pl-head) .row[data-songkey], .cloud-row) > .row-love.on::before {
  mask-image: ${I("black")};
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

.route .sticky-bar.stuck .sticky-bar__lead {
  margin-inline-start: 8px;
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

body[data-control-bar="floating"]:not(:has(> .np.open)) .player {
  border-color: color-mix(in srgb, var(--ink) 16%, transparent);
}

@media (prefers-reduced-motion: no-preference) {
  body[data-control-bar="bottom"] .player {
    transition: margin-inline-start .34s cubic-bezier(.32, .72, .24, 1);
  }
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

.player:has(.qq-progress) .pb-left .now .s {
  margin-block-start: 3px;
}

@media (width > 860px) {
  .player:has(.qq-progress) .pb-left .now {
    position: relative;
    inset-block-start: 1.5px;
  }
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
  text-shadow: none;
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

/* Keep the wrapper's animated position and render the lyric line at its natural size. */
.np .np-kara-host [class*="_lyricLine"]:has(> [class*="_lyricMainLine"]):not([class*="_lyricBgLine"]) {
  transform: none !important;
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
`,N=B+`
:root[data-original-imprint-green] {
  --cvg-accent: ${M} !important;
  --cvg-glow: ${M} !important;
  --cvg-bar-line: ${M} !important;
  --cvg-bar-fill: ${M} !important;
  --np-hl: ${M} !important;
  --qq-play: ${$};
  --qq-current-song: ${M};
}

:root[data-original-imprint-green] .sidebar {
  --cvg-accent: ${$};
  --cvg-glow: ${$};
}
`;function R(e){let g=e.closest(".content"),t=document.querySelector("body > .ambient");if(!g||!t)return;let a=new Set,s=t.querySelector(".ambient-art"),p=new Image,n=document.createElement("canvas"),c=0,l,h,i=()=>["cover","custom"].includes(t.dataset.mode),r=()=>{delete e.dataset.qqStickySnapshot;for(let f of["--qq-sticky-snapshot","--qq-sticky-x","--qq-sticky-y"])e.style.removeProperty(f)},m=()=>{if(!i()||e.hasAttribute("data-qq-sticky-scrolling"))return;let f=t.querySelector(".ambient-host.ready canvas"),L=s?.style.backgroundImage.match(/^url\(["']?(.*?)["']?\)$/)?.[1];if(t.dataset.renderer==="quaver"&&L&&L!==h){h=L;let w=new URL(L,location.href);p.src=/^https?:$/.test(w.protocol)&&w.origin!==location.origin?"/api/img?u="+encodeURIComponent(w.href):w.href}let y=t.dataset.renderer==="quaver"?p:f,S=y?.naturalWidth??y?.width,C=y?.naturalHeight??y?.height;if(!S||!C)return;n.width=192,n.height=Math.max(1,Math.round(n.width*innerHeight/innerWidth));let b=n.getContext("2d",{alpha:!1});if(b)try{b.fillStyle=getComputedStyle(document.documentElement).getPropertyValue("--bg").trim(),b.fillRect(0,0,n.width,n.height);let w=b.getImageData(0,0,1,1).data;if(y===p){let P=Math.max(n.width/S,n.height/C)*1.15,A=S*P,_=C*P,O=parseFloat(getComputedStyle(s).getPropertyValue("--bg-blur"))||70;b.filter=`blur(${O*n.width/innerWidth}px) saturate(1.5) brightness(1.06)`,b.globalAlpha=t.dataset.mode==="custom"?1:.55,b.drawImage(y,(n.width-A)/2,(n.height-_)/2,A,_)}else b.globalAlpha=t.dataset.mode==="custom"?1:.9,b.drawImage(y,0,0,n.width,n.height);if(!b.getImageData(0,0,n.width,n.height).data.some((P,A)=>P!==w[A%4]))return;e.style.setProperty("--qq-sticky-snapshot",`url("${n.toDataURL("image/webp")}")`),e.dataset.qqStickySnapshot=""}catch{}};p.onload=m;let v=f=>{delete f.dataset.qqStickyClip,f.style.removeProperty("--qq-sticky-clip"),a.delete(f)},x=()=>{c=0;let f=g.classList.contains("has-stuck")&&i()?e.querySelector(":scope > .entering > :is(.sticky-bar, .sticky-head).stuck"):null,L=new Map;if(f){let y=f.getBoundingClientRect(),S=y.bottom;if(e.hasAttribute("data-qq-sticky-snapshot"))for(let[b,w]of[["--qq-sticky-x",y.left],["--qq-sticky-y",y.top]]){let E=-w+"px";e.style.getPropertyValue(b)!==E&&e.style.setProperty(b,E)}let C=e.getBoundingClientRect().top;for(let b of f.parentElement.children){if(b===f||b.matches(".list-fabs, [hidden]"))continue;let w=b.getBoundingClientRect();w.bottom<=C||w.top>=S||["absolute","fixed","sticky"].includes(getComputedStyle(b).position)||L.set(b,w.bottom<=S?"hidden":Math.ceil(S-w.top)+"px")}}for(let y of a)L.has(y)||v(y);for(let[y,S]of L){let C=S==="hidden"?"hidden":"",b=C?"0px":S;y.dataset.qqStickyClip!==C&&(y.dataset.qqStickyClip=C),y.style.getPropertyValue("--qq-sticky-clip")!==b&&y.style.setProperty("--qq-sticky-clip",b),a.add(y)}},u=()=>{c||(c=requestAnimationFrame(x))},q=()=>{i()&&(e.dataset.qqStickyScrolling="",cancelAnimationFrame(c),x(),clearTimeout(l),l=setTimeout(()=>{delete e.dataset.qqStickyScrolling,x(),m()},110))},o=new MutationObserver(u);o.observe(g,{attributes:!0,attributeFilter:["class"]});let d=new MutationObserver(()=>{i()?m():(clearTimeout(l),delete e.dataset.qqStickyScrolling,r()),u()});d.observe(t,{attributes:!0,attributeFilter:["data-mode","data-renderer"]}),s&&d.observe(s,{attributes:!0,attributeFilter:["style","class"]});let k=t.querySelector(".ambient-host");return k&&d.observe(k,{childList:!0,attributes:!0,attributeFilter:["class"]}),o.observe(e,{childList:!0,subtree:!0}),e.addEventListener("scroll",q,{passive:!0}),window.addEventListener("resize",u),u(),m(),()=>{o.disconnect(),d.disconnect(),cancelAnimationFrame(c),clearTimeout(l),delete e.dataset.qqStickyScrolling,p.onload=null,r(),e.removeEventListener("scroll",q),window.removeEventListener("resize",u),a.forEach(v)}}function T(e){let g,t,a=()=>{if(t?.isConnected)return;let p=e.querySelector(":scope > .entering"),n=p?.querySelector(".pl-head .pl-actions > .fav-btn"),c=p?.querySelector(".sticky-bar__right > .sticky-playall");if(!n||!c)return;let l=document.createComment("Playlist favorite position");n.before(l),t=document.createElement("div"),t.className="qq-playlist-actions",c.before(t),t.append(c,n),g=()=>{l.replaceWith(n),t.replaceWith(c)}},s=new MutationObserver(a);return s.observe(e,{childList:!0,subtree:!0}),a(),()=>{s.disconnect(),t?.isConnected&&g()}}function V(e,g,t){let a,s,p=h=>{h.target.closest("button[data-opt]")&&g()&&t(!1)},n=()=>{a?.removeEventListener("click",p),s?.remove()},c=()=>{let h=e.querySelector("#tint-cards");if(h!==a){if(n(),a=h,!a)return;s=document.createElement("button"),s.type="button",s.className="opt-card qq-tint-option",s.textContent="\u539F\u5370\u8C61\xB7\u7EFF",s.onclick=()=>t(!0),a.append(s),a.addEventListener("click",p)}if(!s?.isConnected)return;let i=g();s.classList.toggle("sel",i),s.setAttribute("aria-pressed",String(i))},l=new MutationObserver(c);return l.observe(e,{childList:!0,subtree:!0}),c(),{sync:c,dispose(){l.disconnect(),n()}}}function K(e){let g=e.querySelector(".pb-mid"),t=e.querySelector("#pb-time"),a=e.querySelector(".pb-lpop"),s=["#pb-loop","#pb-prev","#pb-play","#pb-next",".pb-volhost"].map(d=>e.querySelector(d));if(!g||!t||s.some(d=>!d))return;let p=document.createElement("div");p.className="qq-transport";let n=s.map(d=>{let k=document.createComment("Original player control position");return d.before(k),p.append(d),k}),c=document.createComment("Original playback mode menu position");if(a){let d=document.createElement("div");d.className="qq-loophost",a.before(c),s[0].before(d),d.append(s[0],a)}let l=document.createElement("div");l.className="qq-progress";let h=document.createElement("span"),i=document.createElement("span"),r=document.createElement("input");r.type="range",r.max="100",r.step="0.1",r.setAttribute("aria-label","\u64AD\u653E\u8FDB\u5EA6"),l.append(h,r,i),g.append(p,l);let m=!1,v=new AbortController,x={signal:v.signal},u=()=>r.style.setProperty("--qq-progress",r.value+"%"),q=()=>{let[d="0:00",k="0:00"]=t.textContent.split(" / ");h.textContent=d,i.textContent=k,r.disabled=!k.split(":").some(f=>Number(f)>0),r.matches(":active")||(r.value=String(100*(Number(e.style.getPropertyValue("--pf"))||0)),r.setAttribute("aria-valuetext",d+" / "+k),u())};e.addEventListener("pointerdown",d=>{!m&&!d.target.closest("button, input, .pb-volpop, .pb-qpop, .pb-lpop")&&d.stopImmediatePropagation()},{...x,capture:!0}),r.addEventListener("input",u,x),r.addEventListener("change",()=>{let d=e.getBoundingClientRect(),k=d.left+1+(d.width-2)*Number(r.value)/100;m=!0;try{for(let f of["pointerdown","pointerup"])e.dispatchEvent(new PointerEvent(f,{bubbles:!0,clientX:k,pointerId:-1}))}finally{m=!1}},x);let o=new MutationObserver(q);return o.observe(e,{attributes:!0,attributeFilter:["style"]}),o.observe(t,{childList:!0,subtree:!0,characterData:!0}),q(),()=>{o.disconnect(),v.abort(),n.forEach((d,k)=>d.replaceWith(s[k])),a&&c.replaceWith(a),p.remove(),l.remove()}}function H(e,g){let t=document.querySelector('script[type="module"][src]')?.src;if(!t||new URL(t).origin!==location.origin)return;let a,s=!1,p=()=>{if(!a||!e.querySelector(".pl-head .liked-cover"))return;let c=new Map(a.likedCache?.map(l=>[String(l.mid),l.album]));for(let l of e.querySelectorAll(".rows > .row[data-songkey]")){let h=l.querySelector(".rmeta"),i=c.get(l.dataset.songkey);if(!h||h.querySelector(".ral")||!i?.name)continue;let r=document.createElement("span");if(r.className="ral qq-liked-album",i.mid){let m=document.createElement("a");m.className="meta-link",m.dataset.link=`album:${i.mid}:${i.name}`,m.title=i.name,m.textContent=i.name,r.append(m)}else r.textContent=i.name;h.append(r)}},n=new MutationObserver(p);return import(t).then(c=>{s||(a=Object.values(c).find(l=>typeof l?.loadLoved=="function"&&"likedCache"in l),a&&(n.observe(e,{childList:!0,subtree:!0}),p()))}).catch(c=>g?.warn("\u65E0\u6CD5\u8BFB\u53D6 Quaver \u6536\u85CF\u7F13\u5B58",c)),()=>{s=!0,n.disconnect(),e.querySelectorAll(".qq-liked-album").forEach(c=>c.remove())}}function U(e){let g=document.createElement("canvas");g.width=g.height=32;let t=g.getContext("2d",{willReadFrequently:!0});if(!t)return null;t.drawImage(e,0,0,32,32);let{data:a}=t.getImageData(0,0,32,32),s=Array(24).fill(0);for(let i=0;i<a.length;i+=4){let[r,m,v]=a.subarray(i,i+3),x=Math.max(r,m,v),u=Math.min(r,m,v),q=x-u;if(a[i+3]<128||q<22||x<48)continue;let o=x===r?(m-v)/q:x===m?2+(v-r)/q:4+(r-m)/q,d=Math.floor((o+6)%6*4);s[d]+=(q/255)**1.7}let p=s.map((i,r)=>i+.5*(s[(r+23)%24]+s[(r+1)%24])),n=p.indexOf(Math.max(...p));if(p[n]<.35)return null;let c=p.reduce((i,r,m)=>{let v=Math.abs(m-n);return v>=3&&v<=21&&r>(p[i]??p[n]*.12)?m:i},-1),l=n*15+7.5,h=c<0?l:c*15+7.5;return{accent:`hsl(${l} 83% 64%)`,left:`hsl(${l} 42% 17%)`,right:`hsl(${h} 36% 19%)`}}function j(e){let g=e.querySelector(".np-cover");if(!g)return;let t=document.body,a=document.createElement("button");a.className="qq-np-collapse",a.type="button",a.title="\u6536\u8D77\u64AD\u653E\u9875",a.setAttribute("aria-label",a.title),a.innerHTML='<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"><path d="m3 8 9 9 9-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',a.onclick=()=>{let u=document.getElementById("pb-cover");u?.click(),u?.focus({preventScroll:!0})},e.append(a);let s=["--qq-cover-accent","--qq-cover-left","--qq-cover-right"],p=()=>{s.forEach(u=>t.style.removeProperty(u)),delete e.dataset.qqCoverPalette},n,c=!1,l,h=-1/0,i=new Set,r=u=>{delete u.dataset.qqKaraokeWord,delete u.dataset.qqKaraokeNative;for(let q of["--qq-word-gradient","--qq-word-position","--qq-word-size","--qq-word-played"])u.style.removeProperty(q)},m=u=>{if(l=requestAnimationFrame(m),u-h<30)return;h=u;let q=new Set;for(let o of e.querySelectorAll('.np-kara-host [class*="_gradientMask"] [style*="mask-image"]')){if(!o.closest('[class*="_lyricMainLine"]')?.matches('[class*="_active"]'))continue;let k=o.style.maskImage;if(!k.includes("--bright-mask-alpha")||!k.includes("--dark-mask-alpha"))continue;let{maskPosition:f,maskSize:L}=getComputedStyle(o);if(o.childElementCount){let S=f.split(" ")[0],C=L.split(" ")[0],b=o.offsetWidth,w=b&&S.endsWith("px")&&C.endsWith("%")?(parseFloat(S)/b+parseFloat(C)/200)*100:0,E=Math.round(Math.max(0,Math.min(100,w)))+"%";o.style.getPropertyValue("--qq-word-played")!==E&&o.style.setProperty("--qq-word-played",E),o.hasAttribute("data-qq-karaoke-native")||(o.dataset.qqKaraokeNative=""),o.hasAttribute("data-qq-karaoke-word")&&delete o.dataset.qqKaraokeWord,q.add(o);continue}let y=k.replace(/rgba?\([^)]*var\(--bright-mask-alpha[^)]*\)\)/g,"var(--qq-playing-lyric)").replace(/rgba?\([^)]*var\(--dark-mask-alpha[^)]*\)\)/g,"var(--amll-lp-color)");y.includes("-mask-alpha")||(o.style.getPropertyValue("--qq-word-gradient")!==y&&o.style.setProperty("--qq-word-gradient",y),o.style.getPropertyValue("--qq-word-position")!==f&&o.style.setProperty("--qq-word-position",f),(!i.has(o)||o.style.getPropertyValue("--qq-word-size")!==L)&&o.style.setProperty("--qq-word-size",L),o.hasAttribute("data-qq-karaoke-word")||(o.dataset.qqKaraokeWord=""),o.hasAttribute("data-qq-karaoke-native")&&delete o.dataset.qqKaraokeNative,q.add(o))}for(let o of i)q.has(o)||r(o);i=q},v=()=>{if(!e.classList.contains("open")){cancelAnimationFrame(l),l=void 0,i.forEach(r),i.clear();return}l===void 0&&(l=requestAnimationFrame(m));let u=g.querySelector("img")?.src;if(u===n||(n=u,p(),!u))return;let q=new Image,o=new URL(u);q.src=/^https?:$/.test(o.protocol)&&o.origin!==location.origin?"/api/img?u="+encodeURIComponent(u):u,q.decode().then(()=>{if(c||n!==u)return;let d=U(q);d&&(s.forEach((k,f)=>t.style.setProperty(k,Object.values(d)[f])),e.dataset.qqCoverPalette="")}).catch(()=>{})},x=new MutationObserver(v);return x.observe(e,{attributes:!0,attributeFilter:["class"]}),x.observe(g,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["src"]}),v(),()=>{c=!0,x.disconnect(),cancelAnimationFrame(l),a.remove(),i.forEach(r),p()}}var Q={id:z,name:"\u539F\u5370\u8C61",version:"0.1.81",minHostVersion:"1.7.0",kind:"third-party",description:"\u539F\u5370\u8C61\uFF0C\u590D\u523B\u719F\u6089\u7684\u684C\u9762\u97F3\u4E50\u64AD\u653E\u5668\u5916\u89C2\u3002",setup(e){e.registerTheme({id:z,name:"\u539F\u5370\u8C61",css:"",tint:{mode:"host"},background:{mode:"host"},menus:{mode:"host"},controlBar:{mode:"host"},playlistMode:{mode:"host"}});let g=document.documentElement,t,a=()=>e.storage.get("highlight")!=="host",s=()=>{if(g.dataset.sparkleTheme!==z){t?.(),t=void 0;return}if(t)return;let n=e.style.register({id:z,css:N,order:1e3}),c=()=>g.toggleAttribute("data-original-imprint-green",a());c();let l=document.getElementById("player-bar"),h=document.getElementById("route"),i=document.querySelector("body > .np"),r=h&&V(h,a,v=>{e.storage.set("highlight",v?"green":"host"),c(),r?.sync()}),m=[l&&K(l),h&&H(h,e.log),h&&R(h),h&&T(h),i&&j(i)];t=()=>{for(let v of m)v?.();r?.dispose(),g.removeAttribute("data-original-imprint-green"),n()}},p=new MutationObserver(s);return p.observe(g,{attributes:!0,attributeFilter:["data-sparkle-theme"]}),s(),()=>{p.disconnect(),t?.()}}};export{Q as default};
