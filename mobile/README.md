# Scoop Mobile

The Scoop mobile app, built with React Native + Expo. It mirrors the Scoop
design system (purple `#4759E4`, near-black surfaces, Poppins, evidence-first
glass cards) and the desktop product's analysis pipeline.

## Run

```bash
cd mobile
npm install
npx expo start
```

Press `i` for the iOS simulator, `a` for Android, or scan the QR code with Expo
Go. The app runs fully offline against bundled sample data; point it at a live
Scoop backend by adding `extra.apiBase` to `app.json`:

```json
"extra": { "apiBase": "http://localhost:8000" }
```

When set, the Analysis screen streams from the backend's `/analyze/stream`
endpoint; otherwise it runs a faithful simulated pipeline.

## Structure

```
app/                      expo-router routes
  _layout.jsx             fonts, providers, root stack
  index.jsx               entry redirect (welcome vs tabs)
  welcome.jsx             "Verify Before You Trust" (open.png)
  login.jsx               sign in / create account
  onboarding.jsx          role -> community -> interests
  (tabs)/                 home, history, saved, settings + glass nav
  analysis.jsx            running + "Analysis Complete" (analysis.png)
  details.jsx             "Details" confidence breakdown (breakdown.png)
components/               GlassCard, NavPill, MetricBar, StatCard, etc.
theme/                    colors, type scale, spacing, shadows
lib/                      store (AsyncStorage), api client, session handoff
data/                    sample analysis + trending mock
assets/logoXml.js        the Scoop wordmark as inline SVG
_design_refs/            the original reference screenshots
```

## Screens

- **Welcome** — the wordmark, headline, Create Account / Log in.
- **Auth & Onboarding** — styled to the dark-glass system; persists a light
  profile locally.
- **Home** — greeting, paste-a-link analyser, Upload Image/Video/Doc, and a
  Trending Fake AI feed, over the floating glass tab bar.
- **Analysis** — reconstructs the captured conversation, streams pipeline
  progress, then lists the detected issues.
- **Details** — Confidence Breakdown, Context Integrity / Emotional Resistance
  stat cards, a source trust passport, the ruling, and next steps.
- **History / Saved / Settings** — local activity, starred reports, and account
  preferences.

The glass look uses `expo-blur` with a dark tint plus a translucent fill and a
hairline border, matching the desktop `design.md` glass card spec adapted for a
dark surface.
