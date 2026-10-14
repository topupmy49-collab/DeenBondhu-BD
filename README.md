# DeenBondhu BD — দ্বীনবন্ধু বিডি

*প্রতিদিনের জীবনে দ্বীনের সঙ্গী* — a free, ad-free Islamic companion PWA (Bangla · English · Arabic).
Plain HTML/CSS/JavaScript. No framework, no build step, no backend, no API keys, no login. ৳0 to run.

## What is in the box

| Area | Status |
|---|---|
| Home dashboard (date, Hijri, city, 5 prayers, next-prayer countdown, daily dua, continue-reading, checklist, search) | Works now (needs internet for first prayer-time fetch) |
| Quran — all 114 surahs, Arabic (Uthmani) + Bangla (Muhiuddin Khan) + English (Saheeh Intl), bookmarks, last position, copy/share, font size, per-ayah audio (Alafasy) | Works now, online. Opened surahs are cached for offline reading |
| Duas — 59 source-attributed entries in 14 categories, search, favorites, recent | Works now, fully offline |
| Asma ul Husna — 99 names, search (Arabic/English/Bangla), favorites, detail, daily reflection tracker | Works now, fully offline |
| Prayer times (AlAdhan) — city search, GPS, method + Asr school, mosque comparison, in-page alerts, test sound | Works now, online (last good result is cached) |
| Qibla — bearing from your coordinates, live compass where the device has sensors, manual fallback | Works now; compass needs a phone with sensors (not verified on real hardware) |
| Tasbih, worship tracker, goals, weekly history, JSON export / reset | Works now, offline |
| Wudu, Ghusl, Salah guides, FAQ | Works now, offline |
| Family profiles (local), Kids Mode with PIN, link allowlist, kids quiz | Works now, device-local only |
| Safe Browsing guide (Private DNS) | Information only — nothing changes your network |
| Meal / routine reminders | Works while the app is open |
| PWA install, offline shell, update prompt | Works over HTTPS or localhost |

## Run it

Service workers do **not** work from `file://`. Use localhost or HTTPS.

```bash
cd deenbondhu
python3 -m http.server 8000      # then open http://localhost:8000
```

### Open on an Android phone (testing)
1. Easiest: host it free (below) and open the HTTPS link in Chrome.
2. On the same Wi-Fi without hosting: run the command above on your computer and open `http://<computer-ip>:8000` — the app works, but install/service-worker need HTTPS (or `localhost`, e.g. via Chrome remote debugging port-forward).

### Install as an app (Android / Chrome)
Open the HTTPS URL → ⋮ menu → **Install app** / **Add to Home screen**.

### Free HTTPS hosting
Upload the folder as-is to any static host: **GitHub Pages**, **Cloudflare Pages**, **Netlify** (drag-and-drop) or **Firebase Hosting** (free tiers). If you host under a sub-path (e.g. `username.github.io/deenbondhu/`) everything still works because all paths are relative. When you release a new version, change `VERSION` in `sw.js`; users then see a "Reload" banner.

## Data sources & licences — please read
- **Prayer times & Hijri date:** AlAdhan API `https://api.aladhan.com/v1` (`timings` / `timingsByCity`). Free, no key; fair-use rate limits apply.
- **Quran:** AlQuran Cloud `https://api.alquran.cloud/v1` — editions `quran-uthmani`, `bn.bengali`, `en.sahih`; audio `ar.alafasy` from `cdn.islamic.network`. Free, no key. Confirm the current terms and the translations' attribution at alquran.cloud before a public/commercial launch.
- The Arabic text is shown exactly as the API returns it. The only presentation change: the Bismillah that the API prepends to ayah 1 of most surahs is displayed on its own line above the surah (Al-Fatiha keeps it as ayah 1; At-Tawbah has none).
- **Duas / guides / names:** written for this project (`js/data-duas.js`, `js/data-names.js`, `js/data-guide.js`) with source references. Hadith numbers follow common printed/online numbering and **may differ between editions**.
- **Fonts:** Hind Siliguri, Noto Naskh Arabic (Google Fonts, SIL OFL). They need internet the first time and are cached afterwards; system fonts are the fallback.
- No adhan recording is shipped. Users pick their own audio file (stored on their device only).

## ⚠️ Must be reviewed by a qualified person before public release
- **All religious content** (duas, Bangla meanings, hadith references and gradings, wudu/ghusl/salah guides, Asma ul Husna list and meanings, quiz) should be checked by a qualified scholar/teacher. Where a point is disputed between schools the text says so; where no specific dua is established (e.g. ghusl, mirror, marketplace) it says so rather than inventing one.
- **Bengali pronunciation was deliberately not added** — it needs a qualified reciter. **Pronunciation audio** is also not included.
- The 99 names follow one common enumeration; other references differ slightly in a few names and in order.

## Limitations — stated honestly
- **Prayer alerts and meal reminders only fire while the app/browser is open and the phone is awake.** A web page or service worker cannot guarantee Adhan when the browser is closed or the device sleeps. Reliable background Adhan needs a native Android app (roadmap below). Browsers may also throttle timers in background tabs.
- Browsers can refuse sound until the user taps the page; the app never autoplays before that.
- Kids Mode and its PIN are in-app only. They are **not** system parental controls; clearing browser data removes them. They do not filter other apps.
- Family profiles and all progress live in `localStorage` on one device; there is no sync and no cloud account.
- A web app cannot change Android's DNS or block content in other apps. The Safe Browsing page only explains how to turn on Private DNS yourself and links to official provider pages.
- Compass accuracy depends on the phone's sensors and magnetic interference. iOS requires a permission prompt.
- First load of a surah and prayer times needs internet; there is no bundled Quran text.

## Privacy
No accounts, ads, analytics or trackers. Settings, bookmarks, tracker, profiles and tasbih stay on the device. GPS is requested only when you tap "Use my current location"; the coordinates are sent to AlAdhan solely to calculate times and are not stored by us. Settings → *Export all data* / *Erase all data*.

## Project structure
```
index.html  manifest.json  sw.js  offline.html  README.md
css/style.css
icons/        icon.svg, icon-192.png, icon-512.png, icon-maskable-512.png
js/
  i18n.js         all UI text (bn / en / ar)
  data-duas.js    59 duas + 14 categories
  data-names.js   99 names
  data-guide.js   wudu / ghusl / salah / FAQ, kids quiz
  core.js         storage, router, i18n, toasts, kids lock, service worker registration
  quran.js  duas-names.js  prayer.js  worship.js  family.js  home.js
```
Add a dua: append an object to `window.DUAS` in `js/data-duas.js` (fields: `id, cat, g, t{bn,en}, ar, bn, en, src, n?`). Add a language string: edit `js/i18n.js`.

## Testing
Verified in headless Chromium (Playwright) at 390 px width: 56 automated checks covering all routes, 114-surah list, Bismillah handling, bookmarks/last-read, 59 duas + filters, 99 names, tasbih, prayer table/city/alarms, Qibla maths (Dhaka ≈ 277.6°), language switch + RTL, profiles, Kids Mode PIN and link blocking, service worker, offline shell, offline error state — **no console errors**.
**Caveat:** in the build sandbox the live APIs were not queried by the app tests; those tests used responses shaped exactly like the real APIs (structure confirmed earlier against live calls). Please run the manual checklist below on a real phone with internet.

### Manual checklist (not yet verified on a real Android device)
- [ ] Home renders on your phone; install prompt appears over HTTPS
- [ ] All 114 surahs load; open Al-Fatiha, Al-Baqarah, An-Nas; check numbering/translations
- [ ] Audio plays after tapping ▶
- [ ] City and GPS prayer times; compare to your mosque timetable; try Karachi + Hanafi
- [ ] Notification permission, test notification, test sound, alert fires with app open
- [ ] Qibla compass on phone (figure-8 calibration)
- [ ] Airplane mode: app opens, duas/names work, offline message for new surahs
- [ ] Kids Mode: PIN exit, external links blocked
- [ ] Console/network errors in Chrome DevTools remote debugging

## Release-readiness
**Ready now:** private/family testing as an MVP. **Before public release:** scholarly review of content; real-device testing; confirm API terms; add a privacy page on your host; decide on analytics (none today).

## Roadmap to a full Android app
1. **Wrap** the PWA with Capacitor (or Trusted Web Activity) and publish on Google Play (one-time US$25 developer fee — the only unavoidable cost).
2. **Native adhan:** schedule exact alarms (`AlarmManager.setExactAndAllowWhileIdle`, `SCHEDULE_EXACT_ALARM`/`USE_EXACT_ALARM` as policy allows), a notification channel with the adhan sound, a foreground/alarm service for playback, `RECEIVE_BOOT_COMPLETED` to reschedule, `POST_NOTIFICATIONS` runtime permission (Android 13+), battery-optimisation guidance. Test on Android 12, 13, 14, 15 and OEM skins (Xiaomi/Oppo/Samsung kill background work aggressively).
3. Cache full Quran text offline (check licence), verified pronunciation audio, widgets.
4. Optional backend (PHP 8 + MySQL + PDO, CSRF, prepared statements, role-checked admin) only if you add accounts/sync; family data must then be separated per household with real authentication. Ads (if ever) must be a disabled-by-default, policy-compliant module, never near Quran text, never shown in Kids Mode.

Version 1.0.0
