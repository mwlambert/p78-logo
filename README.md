# P78 — Orbital Logo Tool

An interactive tool for designing the P78 logo from **real orbital mechanics**: a
constellation of satellites, each on its own true Keplerian orbit (the body sits at
the focus). Spreading the orbital elements sculpts the fan of orbit traces; clustering
the apogees to one side gives the one-sided look.

**Live:** https://mwlambert.github.io/p78-logo/

## Using it
- **Orbital dials** — satellites, eccentricity, inclination spread, RAAN spread,
  apogee direction & spread, view tilt, roll.
- **Design dials** — scale, line weight; drag the canvas to pan, scroll to zoom.
- **Export** — PNG (the current frame) or **SVG** (clean vector of the full mark).
- **Theme** toggle (white-on-black ↔ brand orange), recording mode for clean capture.

## Layout
```
index.html            the tool (single file, no dependencies)
img/                  P78 wordmark SVGs used by the overlay (hosted)
scripts/dev-server.mjs  local live-reload server (port 5178)
assets/               brand source files — gitignored, local only
archive/              superseded experiments — gitignored, local only
```

## Local development
```
node scripts/dev-server.mjs   # then open http://localhost:5178/
```
Edits to `index.html` auto-refresh the browser (and any phone on the same Wi-Fi at
`http://<your-LAN-ip>:5178/`).

## Publishing
The live site is GitHub Pages off `main`. To update:
```
git add -A && git commit -m "…" && git push
```
The site rebuilds ~30–60s after each push.
