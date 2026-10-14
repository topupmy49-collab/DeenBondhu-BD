/* DeenBondhu BD — Prayer times (AlAdhan API), in-page alarms, adhan/notification sound, Qibla compass.
   IMPORTANT LIMITATION: alarms/notifications here run only while the page/PWA is open and the device is awake.
   A web page or service worker cannot guarantee background Adhan; see README (native Android roadmap). */
(function () {
  'use strict';
  const DB = window.DB;
  const API = 'https://api.aladhan.com/v1';
  const PR = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const METHODS = [[1, 'University of Islamic Sciences, Karachi'], [2, 'Islamic Society of North America (ISNA)'], [3, 'Muslim World League'], [4, 'Umm Al-Qura University, Makkah'], [5, 'Egyptian General Authority of Survey'], [15, 'Moonsighting Committee Worldwide'], [0, 'Shia Ithna-Ashari, Leva Institute, Qum']];
  const CITIES = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh', 'Cumilla', 'Cox\'s Bazar', 'Gazipur', 'Narayanganj'];
  const KAABA = { lat: 21.4225, lng: 39.8262 };

  const defP = { city: 'Dhaka', country: 'Bangladesh', lat: null, lng: null, label: '', method: 1, school: 1, alarms: {}, pre: { on: false, min: 10 }, sound: 'beep', mosque: {} };
  const getP = () => { const p = Object.assign({}, defP, DB.store.get('prayer', {})); p.alarms = p.alarms || {}; p.pre = Object.assign({}, defP.pre, p.pre); p.mosque = p.mosque || {}; return p; };
  const saveP = (p) => DB.store.set('prayer', p);
  DB.getPrayerSettings = getP;

  /* ---------- time helpers ---------- */
  const dmy = (d) => DB.pad(d.getDate()) + '-' + DB.pad(d.getMonth() + 1) + '-' + d.getFullYear();
  const hm = (s) => { const m = /(\d{1,2}):(\d{2})/.exec(s || ''); return m ? [parseInt(m[1], 10), parseInt(m[2], 10)] : null; };
  const secOf = (s) => { const x = hm(s); return x ? x[0] * 3600 + x[1] * 60 : null; };
  const nowSecIn = (tz) => {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date());
      const g = (t) => parseInt((parts.find((p) => p.type === t) || { value: '0' }).value, 10) % 24;
      return g('hour') * 3600 + g('minute') * 60 + g('second');
    } catch (e) { const d = new Date(); return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds(); }
  };
  DB.fmtTime = (s) => {
    const x = hm(s); if (!x) return '—';
    let h = x[0]; const ap = h >= 12 ? DB.t('pm') : DB.t('am'); h = h % 12 || 12;
    return DB.num(h) + ':' + DB.num2(x[1]) + ' ' + ap;
  };
  const fmtHMS = (sec) => { sec = Math.max(0, Math.floor(sec)); const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60; return DB.num2(h) + ':' + DB.num2(m) + ':' + DB.num2(s); };
  DB.fmtDateLong = () => {
    const loc = DB.S.lang === 'bn' ? 'bn-BD' : DB.S.lang === 'ar' ? 'ar-EG' : 'en-GB';
    try { return new Date().toLocaleDateString(loc, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', calendar: 'gregory' }); } catch (e) { return new Date().toDateString(); }
  };

  /* ---------- timings ---------- */
  let PT = DB.store.get('ptimes', null); // cached last good result
  DB.PT = () => PT;
  const keyOf = (P) => [P.city, P.country, P.lat, P.lng, P.method, P.school].join('|');
  const urlFor = (P, d) => {
    const qs = 'method=' + P.method + '&school=' + P.school;
    if (P.lat != null && P.lng != null) return API + '/timings/' + dmy(d) + '?latitude=' + P.lat + '&longitude=' + P.lng + '&' + qs;
    return API + '/timingsByCity/' + dmy(d) + '?city=' + encodeURIComponent(P.city) + '&country=' + encodeURIComponent(P.country) + '&' + qs;
  };
  DB.loadTimings = async (force) => {
    const P = getP(); const today = DB.dateKey();
    if (!force && PT && PT.key === keyOf(P) && PT.reqDate === today && !PT.stale) return PT;
    try {
      const j = await DB.fetchJson(urlFor(P, new Date()), 12000);
      const d = j && j.data;
      if (!d || !d.timings) { const e = new Error('bad'); e.code = 'http'; throw e; }
      const tm = {};
      PR.concat(['Sunrise']).forEach((k) => { tm[k] = (hm(d.timings[k]) ? DB.pad(hm(d.timings[k])[0]) + ':' + DB.pad(hm(d.timings[k])[1]) : null); });
      if (PR.some((k) => !tm[k])) { const e = new Error('bad'); e.code = 'http'; throw e; }
      const hj = d.date && d.date.hijri;
      PT = {
        key: keyOf(P), reqDate: today, at: Date.now(), stale: false, tz: (d.meta && d.meta.timezone) || null, timings: tm,
        hijri: hj ? { d: hj.day, m: hj.month && hj.month.en, ma: hj.month && hj.month.ar, y: hj.year } : null,
        method: (d.meta && d.meta.method && d.meta.method.name) || '', school: (d.meta && d.meta.school) || ''
      };
      DB.store.set('ptimes', PT);
      return PT;
    } catch (e) {
      if (PT && PT.key === keyOf(P)) { PT.stale = true; PT.err = e.code || 'network'; return PT; }
      throw e;
    }
  };
  DB.nextPrayer = () => {
    if (!PT) return null;
    const now = nowSecIn(PT.tz);
    for (const p of PR) { const s = secOf(PT.timings[p]); if (s > now) return { name: p, left: s - now, tomorrow: false }; }
    return { name: 'Fajr', left: secOf(PT.timings.Fajr) + 86400 - now, tomorrow: true };
  };
  DB.hijriText = () => {
    if (!PT || !PT.hijri) return '';
    return DB.num(PT.hijri.d) + ' ' + (DB.S.lang === 'ar' ? PT.hijri.ma : PT.hijri.m) + ' ' + DB.num(PT.hijri.y) + ' ' + DB.t('ah');
  };
  DB.cityLabel = () => { const P = getP(); return P.label || (P.city + (P.country ? ', ' + P.country : '')); };

  /* ---------- sound (never before a user gesture) ---------- */
  const idb = () => new Promise((res, rej) => { const r = indexedDB.open('dbbd', 1); r.onupgradeneeded = () => r.result.createObjectStore('files'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const idbPut = async (k, v) => { const db = await idb(); return new Promise((res, rej) => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').put(v, k); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); };
  const idbGet = async (k) => { const db = await idb(); return new Promise((res, rej) => { const rq = db.transaction('files').objectStore('files').get(k); rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error); }); };
  let adhanEl = null;
  const beep = () => {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    const ctx = new AC(); const f = [660, 784, 880];
    f.forEach((fr, i) => { const t = i * 0.35, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = fr; g.gain.setValueAtTime(0.0001, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.6); o.connect(g); g.connect(ctx.destination); o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.65); });
    setTimeout(() => ctx.close(), 2200); return true;
  };
  DB.playSound = async (kind) => {
    if (!DB.audioUnlocked) { DB.toast(DB.t('tap_for_sound')); return; }
    if (kind === 'none') return;
    if (kind === 'adhan') {
      try {
        const blob = await idbGet('adhan');
        if (blob) { if (adhanEl) adhanEl.pause(); adhanEl = new Audio(URL.createObjectURL(blob)); await adhanEl.play(); return; }
        DB.toast(DB.t('no_adhan_file'));
      } catch (e) { DB.toast(DB.t('err_audio')); }
    }
    beep();
  };
  DB.stopSound = () => { if (adhanEl) { adhanEl.pause(); adhanEl = null; } };

  /* ---------- notifications ---------- */
  const notifSupported = () => 'Notification' in window;
  DB.notify = async (title, body, tag, snoozeMin) => {
    const actions = [{ label: DB.t('stop_sound'), fn: DB.stopSound }];
    if (snoozeMin) actions.push({ label: DB.t('snooze') + ' ' + DB.num(snoozeMin), fn: () => setTimeout(() => DB.notify(title, body, tag), snoozeMin * 60000) });
    DB.toast(title + ' — ' + body, { actions, ms: 20000 });
    if (notifSupported() && Notification.permission === 'granted') {
      try {
        const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
        const opts = { body, tag: tag || 'dbbd', icon: 'icons/icon-192.png', badge: 'icons/icon-192.png' };
        if (reg && reg.showNotification) reg.showNotification(title, opts); else new Notification(title, opts);
      } catch (e) { /* in-app toast already shown */ }
    }
  };
  const fired = () => { const f = DB.store.get('fired', {}); const t = DB.dateKey(); Object.keys(f).forEach((k) => { if (k.indexOf(t) !== 0) delete f[k]; }); return f; };
  const markFired = (k) => { const f = fired(); f[k] = 1; DB.store.set('fired', f); };

  /* ---------- 1s ticker: countdown + alarms ---------- */
  DB.tickers.push(() => {
    if (!PT) return;
    const np = DB.nextPrayer();
    DB.$$('[data-countdown]').forEach((el) => { if (np) el.textContent = fmtHMS(np.left); });
    DB.$$('[data-nextname]').forEach((el) => { if (np) el.textContent = DB.t('p_' + np.name) + (np.tomorrow ? ' (' + DB.t('tomorrow') + ')' : ''); });
    if (PT.reqDate !== DB.dateKey() && navigator.onLine && !DB._refreshing) { DB._refreshing = true; DB.loadTimings(true).then(() => { if (DB.parseHash().name === 'prayer' || DB.parseHash().name === 'home') DB.render(); }).catch(() => {}).finally(() => { DB._refreshing = false; }); }
    const P = getP(); const now = nowSecIn(PT.tz); const today = DB.dateKey(); const F = fired();
    PR.forEach((p) => {
      const t = secOf(PT.timings[p]);
      if (P.alarms[p] && now >= t && now < t + 120 && !F[today + ':' + p]) {
        markFired(today + ':' + p);
        DB.notify(DB.t('p_' + p), DB.t('time_for') + ' ' + DB.t('p_' + p), 'prayer-' + p, 5);
        DB.playSound(P.sound);
      }
      const pt = t - P.pre.min * 60;
      if (P.pre.on && P.alarms[p] && now >= pt && now < pt + 60 && !F[today + ':pre:' + p]) {
        markFired(today + ':pre:' + p);
        DB.notify(DB.t('p_' + p), DB.num(P.pre.min) + ' ' + DB.t('min_left'), 'pre-' + p);
      }
    });
  });
  DB.hooks.online = () => { DB.loadTimings(true).then(() => { if (DB.parseHash().name === 'prayer' || DB.parseHash().name === 'home') DB.render(); }).catch(() => {}); };

  /* ---------- Prayer view ---------- */
  const updated = () => { if (!PT) return ''; const d = new Date(PT.at); return DB.num2(d.getHours()) + ':' + DB.num2(d.getMinutes()); };
  DB.routes.prayer = async () => {
    const P = getP();
    let err = null;
    try { await DB.loadTimings(false); } catch (e) { err = e; }
    let h = '';
    if (err) h += DB.errBox(err, 'prayerRetry');
    if (PT && PT.stale) h += '<div class="notice">' + DB.esc(DB.t('stale_times')) + ' (' + DB.esc(updated()) + ')</div>';
    if (PT) {
      const np = DB.nextPrayer();
      h += '<div class="card hero center"><div class="muted small">' + DB.esc(DB.cityLabel()) + ' · ' + DB.esc(DB.fmtDateLong()) + '</div><div class="muted small">' + DB.esc(DB.hijriText()) + '</div>' +
        '<div style="margin-top:10px" class="muted">' + DB.esc(DB.t('next_prayer')) + '</div><h2 style="margin:0" data-nextname>' + DB.esc(DB.t('p_' + np.name)) + '</h2><div class="big-time" data-countdown>' + fmtHMS(np.left) + '</div></div>';
      h += '<div class="card"><table class="ptable" aria-label="' + DB.esc(DB.t('nav_prayer')) + '"><tbody>';
      const rows = [['Fajr'], ['Sunrise'], ['Dhuhr'], ['Asr'], ['Maghrib'], ['Isha']];
      rows.forEach(([p]) => { h += '<tr class="' + (p === 'Sunrise' ? 'sunrise' : np.name === p && !np.tomorrow ? 'next' : (np.tomorrow && p === 'Fajr' ? 'next' : '')) + '"><td>' + DB.esc(DB.t('p_' + p)) + (p === 'Sunrise' ? ' <span class="small">(' + DB.esc(DB.t('not_a_prayer')) + ')</span>' : '') + '</td><td>' + DB.esc(DB.fmtTime(PT.timings[p])) + '</td></tr>'; });
      h += '</tbody></table><p class="muted small">' + DB.esc(DB.t('timezone')) + ': ' + DB.esc(PT.tz || '—') + '<br>' + DB.esc(DB.t('method')) + ': ' + DB.esc(PT.method) + (PT.school ? ' · ' + DB.esc(PT.school) : '') + '<br>' + DB.esc(DB.t('last_updated')) + ': ' + DB.esc(updated()) + '</p>' +
        '<button class="btn sm" data-act="prayerRefresh">' + DB.esc(DB.t('refresh')) + '</button></div>';
    }
    /* location + calculation settings */
    h += '<div class="card"><h2>' + DB.esc(DB.t('location')) + '</h2>' +
      '<form data-submit="prayerCity"><div class="field-row"><div><label for="pc">' + DB.esc(DB.t('city')) + '</label><input id="pc" name="city" list="cities" value="' + DB.esc(P.lat == null ? P.city : '') + '" autocomplete="off" required></div>' +
      '<div><label for="pco">' + DB.esc(DB.t('country')) + '</label><input id="pco" name="country" value="' + DB.esc(P.country) + '" required></div></div>' +
      '<datalist id="cities">' + CITIES.map((c) => '<option value="' + DB.esc(c) + '">').join('') + '</datalist>' +
      '<div class="row" style="margin-top:10px"><button class="btn primary" type="submit">' + DB.esc(DB.t('apply')) + '</button><button class="btn" type="button" data-act="prayerLoc">' + DB.esc(DB.t('use_location')) + '</button></div></form>' +
      '<p class="muted small">' + DB.esc(DB.t('loc_why')) + '</p>' +
      '<label for="pm">' + DB.esc(DB.t('method')) + '</label><select id="pm" data-change="pMethod">' + METHODS.map((m) => '<option value="' + m[0] + '"' + (P.method === m[0] ? ' selected' : '') + '>' + DB.esc(m[1]) + '</option>').join('') + '</select>' +
      '<label for="ps">' + DB.esc(DB.t('asr_school')) + '</label><select id="ps" data-change="pSchool"><option value="0"' + (P.school === 0 ? ' selected' : '') + '>' + DB.esc(DB.t('school_std')) + '</option><option value="1"' + (P.school === 1 ? ' selected' : '') + '>' + DB.esc(DB.t('school_hanafi')) + '</option></select>' +
      '<p class="muted small">' + DB.esc(DB.t('method_note')) + '</p></div>';
    /* alarms */
    const perm = notifSupported() ? Notification.permission : 'unsupported';
    h += '<div class="card"><h2>' + DB.esc(DB.t('alarms')) + '</h2>' +
      '<div class="notice">' + DB.esc(DB.t('alarm_limits')) + '</div>' +
      '<p>' + DB.esc(DB.t('notif_status')) + ': <b>' + DB.esc(DB.t('notif_' + perm)) + '</b> ' + (perm === 'default' ? '<button class="btn sm" data-act="notifAsk">' + DB.esc(DB.t('enable_notif')) + '</button>' : '') + '</p>' +
      PR.map((p) => '<label class="inline"><input type="checkbox" data-change="alarm" data-p="' + p + '" ' + (P.alarms[p] ? 'checked' : '') + '> ' + DB.esc(DB.t('p_' + p)) + '</label>').join('') +
      '<label class="inline"><input type="checkbox" data-change="preOn" ' + (P.pre.on ? 'checked' : '') + '> ' + DB.esc(DB.t('pre_reminder')) + '</label>' +
      '<label for="pre">' + DB.esc(DB.t('minutes_before')) + '</label><select id="pre" data-change="preMin">' + [5, 10, 15, 20, 30].map((m) => '<option value="' + m + '"' + (P.pre.min === m ? ' selected' : '') + '>' + DB.num(m) + '</option>').join('') + '</select>' +
      '<label for="snd">' + DB.esc(DB.t('sound')) + '</label><select id="snd" data-change="pSound"><option value="beep"' + (P.sound === 'beep' ? ' selected' : '') + '>' + DB.esc(DB.t('sound_beep')) + '</option><option value="adhan"' + (P.sound === 'adhan' ? ' selected' : '') + '>' + DB.esc(DB.t('sound_adhan')) + '</option><option value="none"' + (P.sound === 'none' ? ' selected' : '') + '>' + DB.esc(DB.t('sound_none')) + '</option></select>' +
      '<label for="af">' + DB.esc(DB.t('adhan_file')) + '</label><input id="af" type="file" accept="audio/*" data-change="adhanFile"><p class="muted small">' + DB.esc(DB.t('adhan_license')) + '</p>' +
      '<div class="row"><button class="btn" data-act="testNotif">' + DB.esc(DB.t('test_notif')) + '</button><button class="btn" data-act="testSound">' + DB.esc(DB.t('test_sound')) + '</button><button class="btn" data-act="stopSound">' + DB.esc(DB.t('stop_sound')) + '</button></div></div>';
    /* mosque compare */
    if (PT) {
      h += '<div class="card"><h2>' + DB.esc(DB.t('compare_mosque')) + '</h2><p class="muted small">' + DB.esc(DB.t('compare_note')) + '</p>' +
        PR.map((p) => '<div class="row between" style="margin:6px 0"><label for="mq' + p + '" style="margin:0;flex:1">' + DB.esc(DB.t('p_' + p)) + ' (' + DB.esc(DB.fmtTime(PT.timings[p])) + ')</label><input id="mq' + p + '" type="time" data-change="mosque" data-p="' + p + '" value="' + DB.esc(P.mosque[p] || '') + '" style="max-width:140px"><span class="small" id="md' + p + '" style="min-width:70px;text-align:end">' + diffText(p, P) + '</span></div>').join('') + '</div>';
    }
    return DB.page(DB.t('nav_prayer'), h);
  };
  const diffText = (p, P) => {
    if (!PT || !P.mosque[p]) return '';
    const d = Math.round((secOf(P.mosque[p]) - secOf(PT.timings[p])) / 60);
    return d === 0 ? DB.t('same') : (d > 0 ? '+' : '−') + DB.num(Math.abs(d)) + ' ' + DB.t('min');
  };
  DB.acts.prayerRetry = () => DB.render();
  DB.acts.prayerRefresh = async () => { try { await DB.loadTimings(true); } catch (e) { DB.toast(DB.errText(e)); } DB.render(); };
  DB.acts.prayerCity = (f) => {
    const P = getP(); P.city = f.city.value.trim(); P.country = f.country.value.trim(); P.lat = null; P.lng = null; P.label = ''; saveP(P); PT = null; DB.render();
  };
  DB.acts.prayerLoc = () => {
    if (!navigator.geolocation) { DB.toast(DB.t('loc_fail')); return; }
    navigator.geolocation.getCurrentPosition((pos) => {
      const P = getP(); P.lat = +pos.coords.latitude.toFixed(4); P.lng = +pos.coords.longitude.toFixed(4); P.label = DB.t('my_location'); saveP(P); PT = null; DB.render();
    }, (err) => { DB.toast(err && err.code === 1 ? DB.t('loc_denied') : DB.t('loc_fail')); }, { timeout: 12000, maximumAge: 600000 });
  };
  const mutP = (fn, rerender) => { const P = getP(); fn(P); saveP(P); if (rerender) { PT = null; DB.render(); } };
  DB.changes.pMethod = (el) => mutP((P) => { P.method = parseInt(el.value, 10); }, true);
  DB.changes.pSchool = (el) => mutP((P) => { P.school = parseInt(el.value, 10); }, true);
  DB.changes.alarm = (el) => mutP((P) => { P.alarms[el.getAttribute('data-p')] = el.checked; });
  DB.changes.preOn = (el) => mutP((P) => { P.pre.on = el.checked; });
  DB.changes.preMin = (el) => mutP((P) => { P.pre.min = parseInt(el.value, 10); });
  DB.changes.pSound = (el) => mutP((P) => { P.sound = el.value; });
  DB.changes.mosque = (el) => { const p = el.getAttribute('data-p'); mutP((P) => { P.mosque[p] = el.value; }); DB.$('#md' + p).textContent = diffText(p, getP()); };
  DB.changes.adhanFile = async (el) => {
    const f = el.files && el.files[0]; if (!f) return;
    if (!/^audio\//.test(f.type) || f.size > 15 * 1024 * 1024) { DB.toast(DB.t('bad_audio_file')); return; }
    try { await idbPut('adhan', f); DB.toast(DB.t('adhan_saved')); } catch (e) { DB.toast(DB.t('err_audio')); }
  };
  DB.acts.notifAsk = async () => { if (notifSupported()) { await Notification.requestPermission(); DB.render(); } };
  DB.acts.testNotif = async () => {
    if (notifSupported() && Notification.permission === 'default') await Notification.requestPermission();
    DB.notify(DB.t('appName'), DB.t('test_body'), 'test');
  };
  DB.acts.testSound = () => { DB.audioUnlocked = true; DB.playSound(getP().sound === 'none' ? 'beep' : getP().sound); };
  DB.acts.stopSound = () => DB.stopSound();

  /* ---------- Qibla ---------- */
  const bearing = (lat, lng) => {
    const r = Math.PI / 180; const p1 = lat * r, p2 = KAABA.lat * r, dl = (KAABA.lng - lng) * r;
    const y = Math.sin(dl) * Math.cos(p2), x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
    return (Math.atan2(y, x) / r + 360) % 360;
  };
  DB.routes.qibla = async () => {
    const P = getP(); const has = P.lat != null && P.lng != null;
    let h = '<div class="notice">' + DB.esc(DB.t('qibla_warn')) + '</div>';
    if (!has) {
      h += '<div class="card"><p>' + DB.esc(DB.t('qibla_need_loc')) + '</p><p class="muted small">' + DB.esc(DB.t('loc_why')) + '</p><button class="btn primary" data-act="qiblaLoc">' + DB.esc(DB.t('use_location')) + '</button>' +
        '<form data-submit="qiblaManual"><div class="field-row"><div><label for="ql">' + DB.esc(DB.t('latitude')) + '</label><input id="ql" name="lat" type="number" step="any" min="-90" max="90" required></div><div><label for="qg">' + DB.esc(DB.t('longitude')) + '</label><input id="qg" name="lng" type="number" step="any" min="-180" max="180" required></div></div><button class="btn" type="submit" style="margin-top:10px">' + DB.esc(DB.t('apply')) + '</button></form></div>';
      return DB.page(DB.t('nav_qibla'), h);
    }
    const b = bearing(P.lat, P.lng);
    h += '<div class="card center"><div class="muted small">' + DB.esc(P.label || DB.cityLabel()) + ' (' + DB.num(P.lat) + ', ' + DB.num(P.lng) + ')</div>' +
      '<h2>' + DB.esc(DB.t('qibla_dir')) + ': <span class="gold">' + DB.num(b.toFixed(1)) + '°</span></h2><p class="muted small">' + DB.esc(DB.t('qibla_from_north')) + '</p>' +
      '<div class="compass" aria-label="' + DB.esc(DB.t('nav_qibla')) + '"><span class="n">N</span><svg class="needle" id="needle" viewBox="0 0 100 100" aria-hidden="true" style="transform:rotate(' + b.toFixed(1) + 'deg)"><path d="M50 8 L58 50 L50 44 L42 50 Z" fill="#E9CB7B"/><path d="M50 92 L56 52 L50 56 L44 52 Z" fill="#174A35"/><circle cx="50" cy="50" r="4" fill="#9DE4B5"/></svg></div>' +
      '<p id="compassMsg" class="muted small">' + DB.esc(DB.t('compass_off')) + '</p><button class="btn primary" data-act="compassOn">' + DB.esc(DB.t('enable_compass')) + '</button></div>' +
      '<div class="card"><h3>' + DB.esc(DB.t('calibrate')) + '</h3><p class="small">' + DB.esc(DB.t('calibrate_text')) + '</p><p class="small">' + DB.esc(DB.t('manual_qibla')) + ' <b>' + DB.num(b.toFixed(0)) + '°</b></p></div>';
    DB.onMount(() => { DB._qb = b; });
    return DB.page(DB.t('nav_qibla'), h);
  };
  DB.acts.qiblaLoc = DB.acts.prayerLoc;
  DB.acts.qiblaManual = (f) => { const P = getP(); P.lat = +f.lat.value; P.lng = +f.lng.value; P.label = DB.t('manual_coords'); saveP(P); PT = null; DB.render(); };
  let compassOn = false;
  DB.acts.compassOn = async () => {
    const msg = DB.$('#compassMsg'); const needle = DB.$('#needle');
    if (compassOn) return;
    try { if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') { const r = await DeviceOrientationEvent.requestPermission(); if (r !== 'granted') { msg.textContent = DB.t('compass_denied'); return; } } } catch (e) { msg.textContent = DB.t('compass_denied'); return; }
    let got = false;
    const handler = (e) => {
      let hd = null;
      if (typeof e.webkitCompassHeading === 'number') hd = e.webkitCompassHeading;
      else if (e.absolute && typeof e.alpha === 'number') hd = (360 - e.alpha) % 360;
      if (hd == null) return;
      got = true; compassOn = true;
      needle.style.transform = 'rotate(' + ((DB._qb - hd + 360) % 360).toFixed(1) + 'deg)';
      msg.textContent = DB.t('compass_on') + ' ' + DB.num(Math.round(hd)) + '°';
    };
    window.addEventListener('deviceorientationabsolute', handler, true);
    window.addEventListener('deviceorientation', handler, true);
    msg.textContent = DB.t('compass_wait');
    setTimeout(() => { if (!got) msg.textContent = DB.t('no_compass'); }, 3500);
    DB.onMount(() => {});
    window.addEventListener('hashchange', () => { window.removeEventListener('deviceorientationabsolute', handler, true); window.removeEventListener('deviceorientation', handler, true); compassOn = false; }, { once: true });
  };
})();
