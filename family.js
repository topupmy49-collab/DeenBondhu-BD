/* DeenBondhu BD — Family profiles (local only), Kids Mode, Safe DNS guidance, routine reminders, settings, "More" menu. */
(function () {
  'use strict';
  const DB = window.DB;
  const AGES = ['child', 'teen', 'adult'];
  const profName = (p) => p.name || DB.t('me');

  /* ---------- More ---------- */
  DB.routes.more = async () => {
    const tiles = [['names', 'names', 'names'], ['qibla', 'compass', 'nav_qibla'], ['tasbih', 'tasbih', 'nav_tasbih'], ['tracker', 'check', 'tracker'], ['guide', 'guide', 'guide'], ['quiz', 'quiz', 'quiz'], ['family', 'family', 'family'], ['reminders', 'bell', 'reminders'], ['safe', 'shield', 'safe_dns'], ['settings', 'gear', 'nav_settings']];
    return DB.page(DB.t('nav_more'), '<div class="grid g3">' + tiles.map((t) => '<a class="tile" href="#/' + t[0] + '">' + DB.icon(t[1]) + '<span>' + DB.esc(DB.t(t[2])) + '</span></a>').join('') + '</div>');
  };

  /* ---------- Family ---------- */
  DB.routes.family = async () => {
    const ps = DB.profiles(); const act = DB.pid(); const k = DB.kids();
    let h = '<div class="notice">' + DB.esc(DB.t('family_local_note')) + '</div>';
    h += '<div class="card"><h2>' + DB.esc(DB.t('profiles')) + '</h2><ul class="list">' + ps.map((p) =>
      '<li class="item"><span class="num">' + DB.esc((profName(p).trim()[0] || '?').toUpperCase()) + '</span><span class="grow"><b>' + DB.esc(profName(p)) + '</b><br><span class="muted small">' + DB.esc(DB.t('age_' + p.age)) + (p.id === act ? ' · ' + DB.esc(DB.t('active')) : '') + '</span></span>' +
      (p.id !== act ? '<button class="btn sm" data-act="profSwitch" data-id="' + p.id + '">' + DB.esc(DB.t('switch')) + '</button>' : '') +
      (ps.length > 1 ? '<button class="btn sm danger" data-act="profDel" data-id="' + p.id + '" aria-label="' + DB.esc(DB.t('delete')) + '">✕</button>' : '') + '</li>').join('') + '</ul></div>';
    h += '<div class="card"><h3>' + DB.esc(DB.t('add_profile')) + '</h3><form data-submit="profAdd"><div class="field-row"><div><label for="pn">' + DB.esc(DB.t('name')) + '</label><input id="pn" name="name" maxlength="30" required></div>' +
      '<div><label for="pa">' + DB.esc(DB.t('age_group')) + '</label><select id="pa" name="age">' + AGES.map((a) => '<option value="' + a + '">' + DB.esc(DB.t('age_' + a)) + '</option>').join('') + '</select></div></div><button class="btn primary" type="submit" style="margin-top:10px">' + DB.esc(DB.t('add')) + '</button></form></div>';
    h += '<div class="card"><h2>' + DB.esc(DB.t('kids_mode')) + '</h2><p class="muted">' + DB.esc(DB.t('kids_intro')) + '</p>';
    h += k.hash ? '<button class="btn primary" data-act="kidsStart">' + DB.esc(DB.t('kids_start')) + '</button>' :
      '<form data-submit="kidsPin"><label for="kp1">' + DB.esc(DB.t('set_pin')) + '</label><input id="kp1" name="p1" type="password" inputmode="numeric" pattern="[0-9]{4,8}" minlength="4" maxlength="8" autocomplete="new-password" required><label for="kp2">' + DB.esc(DB.t('confirm_pin')) + '</label><input id="kp2" name="p2" type="password" inputmode="numeric" pattern="[0-9]{4,8}" minlength="4" maxlength="8" autocomplete="new-password" required><button class="btn primary" type="submit" style="margin-top:10px">' + DB.esc(DB.t('save_pin')) + '</button></form>';
    h += '<p class="muted small">' + DB.esc(DB.t('pin_note')) + '</p></div>';
    h += '<div class="card"><h3>' + DB.esc(DB.t('ext_links')) + '</h3><label class="inline"><input type="checkbox" data-change="kidsExt" ' + (k.extOff ? 'checked' : '') + '> ' + DB.esc(DB.t('disable_ext')) + '</label>' +
      '<p class="muted small">' + DB.esc(DB.t('allowlist_note')) + '</p><ul class="list">' + (k.allow.length ? k.allow.map((u, i) => '<li class="item"><span class="grow" dir="ltr" style="word-break:break-all">' + DB.esc(u) + '</span><button class="btn sm danger" data-act="allowDel" data-i="' + i + '" aria-label="' + DB.esc(DB.t('delete')) + '">✕</button></li>').join('') : '<li class="muted small">' + DB.esc(DB.t('no_allowed')) + '</li>') + '</ul>' +
      '<form data-submit="allowAdd" class="row" style="margin-top:8px"><input name="url" type="url" placeholder="https://" required style="flex:1" aria-label="URL"><button class="btn" type="submit">' + DB.esc(DB.t('add')) + '</button></form></div>';
    return DB.page(DB.t('family'), h);
  };
  DB.acts.profAdd = (f) => { const ps = DB.profiles(); ps.push({ id: DB.uid(), name: f.name.value.trim().slice(0, 30), age: AGES.indexOf(f.age.value) >= 0 ? f.age.value : 'adult' }); DB.store.set('profiles', ps); DB.render(); };
  DB.acts.profSwitch = (el) => { DB.store.set('activeProfile', el.getAttribute('data-id')); DB.render(); };
  DB.acts.profDel = (el) => {
    const id = el.getAttribute('data-id'); const ps = DB.profiles();
    if (ps.length < 2 || !confirm(DB.t('confirm_del_profile'))) return;
    DB.store.keys().filter((k) => k.indexOf('p:' + id + ':') === 0).forEach((k) => DB.store.del(k));
    DB.store.set('profiles', ps.filter((p) => p.id !== id));
    if (DB.store.get('activeProfile', 'me') === id) DB.store.set('activeProfile', DB.profiles()[0].id);
    DB.render();
  };
  DB.acts.kidsPin = async (f) => {
    if (f.p1.value !== f.p2.value || !/^[0-9]{4,8}$/.test(f.p1.value)) { DB.toast(DB.t('pin_mismatch')); return; }
    try { const salt = DB.uid() + DB.uid(); const k = DB.kids(); k.salt = salt; k.hash = await DB.hashPin(f.p1.value, salt); DB.saveKids(k); DB.render(); }
    catch (e) { DB.toast(DB.t('pin_unsupported')); }
  };
  DB.acts.kidsStart = () => { const k = DB.kids(); k.on = true; DB.saveKids(k); DB.go('#/home'); DB.render(); };
  DB.changes.kidsExt = (el) => { const k = DB.kids(); k.extOff = el.checked; DB.saveKids(k); };
  DB.acts.allowAdd = (f) => {
    try { const u = new URL(f.url.value.trim()); if (u.protocol !== 'https:') throw new Error('x'); const k = DB.kids(); if (k.allow.indexOf(u.href) < 0) k.allow.push(u.href); DB.saveKids(k); DB.render(); }
    catch (e) { DB.toast(DB.t('bad_url')); }
  };
  DB.acts.allowDel = (el) => { const k = DB.kids(); k.allow.splice(parseInt(el.getAttribute('data-i'), 10), 1); DB.saveKids(k); DB.render(); };

  let fails = 0, lockUntil = 0;
  DB.routes.exitkids = async () => {
    if (!DB.kids().on) { DB.go('#/family'); return ''; }
    return DB.page(DB.t('exit_kids'), '<div class="card"><form data-submit="kidsExit"><label for="xp">' + DB.esc(DB.t('enter_pin')) + '</label><input id="xp" name="p" type="password" inputmode="numeric" autocomplete="off" required><button class="btn primary" type="submit" style="margin-top:10px">' + DB.esc(DB.t('exit_kids')) + '</button></form></div>', '#/home');
  };
  DB.acts.kidsExit = async (f) => {
    if (Date.now() < lockUntil) { DB.toast(DB.t('pin_locked')); return; }
    const k = DB.kids();
    let ok = false;
    try { ok = (await DB.hashPin(f.p.value, k.salt)) === k.hash; } catch (e) { ok = false; }
    if (ok) { fails = 0; k.on = false; DB.saveKids(k); DB.go('#/family'); DB.render(); return; }
    fails++; if (fails >= 5) { lockUntil = Date.now() + 30000; fails = 0; DB.toast(DB.t('pin_locked')); } else DB.toast(DB.t('pin_wrong'));
  };

  /* ---------- Safe DNS ---------- */
  const PROVIDERS = [
    { n: 'CleanBrowsing — Family Filter', host: 'family-filter-dns.cleanbrowsing.org', url: 'https://cleanbrowsing.org/' },
    { n: 'Cloudflare for Families', host: 'family.cloudflare-dns.com', url: 'https://one.one.one.one/family/' }
  ];
  DB.routes.safe = async () => {
    let h = '<div class="notice">' + DB.esc(DB.t('safe_honest')) + '</div>';
    h += '<div class="card"><h2>' + DB.esc(DB.t('safe_h1')) + '</h2>' + [1, 2, 3].map((i) => '<h3>' + DB.esc(DB.t('safe_t' + i)) + '</h3><p>' + DB.esc(DB.t('safe_d' + i)) + '</p>').join('') + '</div>';
    h += '<div class="card"><h2>' + DB.esc(DB.t('safe_steps_h')) + '</h2><ol>' + [1, 2, 3, 4, 5].map((i) => '<li>' + DB.esc(DB.t('safe_s' + i)) + '</li>').join('') + '</ol><p class="muted small">' + DB.esc(DB.t('safe_verify')) + '</p></div>';
    h += '<div class="card"><h2>' + DB.esc(DB.t('safe_providers')) + '</h2><ul class="list">' + PROVIDERS.map((p) => '<li class="item"><span class="grow"><b>' + DB.esc(p.n) + '</b><br><span class="muted small" dir="ltr">' + DB.esc(DB.t('hostname')) + ': ' + DB.esc(p.host) + '</span></span>' + DB.ext(p.url, DB.t('open_official')) + '</li>').join('') + '</ul><p class="muted small">' + DB.esc(DB.t('safe_noaffil')) + '</p></div>';
    return DB.page(DB.t('safe_dns'), h);
  };

  /* ---------- Reminders (meal / routine) ---------- */
  const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const PRESETS = [['breakfast', '08:00'], ['lunch', '13:00'], ['dinner', '20:00'], ['water', '11:00'], ['study', '17:00'], ['quran', '05:30']];
  const rget = () => DB.pget('reminders', []);
  const nextIn = (r) => {
    const [hh, mm] = r.time.split(':').map(Number); const now = new Date();
    for (let i = 0; i < 8; i++) { const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, hh, mm, 0); if (r.days.indexOf(d.getDay()) >= 0 && d > now) return Math.floor((d - now) / 1000); }
    return null;
  };
  const hmsStr = (s) => { if (s == null) return '—'; const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (d ? DB.num(d) + DB.t('d') + ' ' : '') + DB.num2(h) + ':' + DB.num2(m) + ':' + DB.num2(x); };
  DB.routes.reminders = async () => {
    const list = rget();
    let h = '<div class="notice">' + DB.esc(DB.t('rem_note')) + '</div>';
    h += '<div class="card"><h2>' + DB.esc(DB.t('my_reminders')) + ' <span class="muted small">(' + DB.esc(profName(DB.profile())) + ')</span></h2>' + (list.length ? '<ul class="list">' + list.map((r) =>
      '<li class="item" style="flex-wrap:wrap"><span class="grow"><b>' + DB.esc(r.label) + '</b> · ' + DB.esc(DB.fmtTime(r.time)) + '<br><span class="muted small">' + r.days.map((d) => DB.esc(DB.t('day_' + DAYS[d]))).join(' ') + (r.on ? ' · ' + DB.esc(DB.t('in')) + ' <span data-remcd="' + r.id + '">' + hmsStr(nextIn(r)) + '</span>' : '') + '</span></span>' +
      '<label class="inline" style="margin:0"><input type="checkbox" data-change="remOn" data-id="' + r.id + '" ' + (r.on ? 'checked' : '') + ' aria-label="' + DB.esc(DB.t('enabled')) + '"></label>' +
      '<button class="btn sm danger" data-act="remDel" data-id="' + r.id + '" aria-label="' + DB.esc(DB.t('delete')) + '">✕</button></li>').join('') + '</ul>' : '<div class="empty">' + DB.esc(DB.t('no_reminders')) + '</div>') + '</div>';
    h += '<div class="card"><h3>' + DB.esc(DB.t('add_reminder')) + '</h3><div class="chips">' + PRESETS.map((p) => '<button type="button" class="chip" data-act="remPreset" data-k="' + p[0] + '" data-t="' + p[1] + '">' + DB.esc(DB.t('rem_' + p[0])) + '</button>').join('') + '</div>' +
      '<form data-submit="remAdd"><div class="field-row"><div><label for="rl">' + DB.esc(DB.t('label')) + '</label><input id="rl" name="label" maxlength="40" required></div><div><label for="rt">' + DB.esc(DB.t('time')) + '</label><input id="rt" name="time" type="time" required></div></div>' +
      '<div class="row" style="margin-top:8px">' + DAYS.map((d, i) => '<label class="inline" style="margin:4px 8px 4px 0"><input type="checkbox" name="d' + i + '" checked> ' + DB.esc(DB.t('day_' + d)) + '</label>').join('') + '</div>' +
      '<button class="btn primary" type="submit" style="margin-top:8px">' + DB.esc(DB.t('add')) + '</button></form></div>';
    return DB.page(DB.t('reminders'), h);
  };
  DB.acts.remPreset = (el) => { DB.$('#rl').value = DB.t('rem_' + el.getAttribute('data-k')); DB.$('#rt').value = el.getAttribute('data-t'); };
  DB.acts.remAdd = (f) => {
    const days = []; for (let i = 0; i < 7; i++) if (f['d' + i].checked) days.push(i);
    if (!days.length || !f.time.value) { DB.toast(DB.t('pick_days')); return; }
    const l = rget(); l.push({ id: DB.uid(), label: f.label.value.trim().slice(0, 40), time: f.time.value, days, on: true }); DB.pset('reminders', l); DB.render();
  };
  DB.changes.remOn = (el) => { const l = rget(); const r = l.find((x) => x.id === el.getAttribute('data-id')); if (r) r.on = el.checked; DB.pset('reminders', l); DB.render(); };
  DB.acts.remDel = (el) => { DB.pset('reminders', rget().filter((r) => r.id !== el.getAttribute('data-id'))); DB.render(); };
  DB.tickers.push(() => {
    const list = rget(); if (!list.length) return;
    DB.$$('[data-remcd]').forEach((el) => { const r = list.find((x) => x.id === el.getAttribute('data-remcd')); if (r) el.textContent = hmsStr(nextIn(r)); });
    const now = new Date(); const hm = DB.pad(now.getHours()) + ':' + DB.pad(now.getMinutes()); const key = DB.dateKey();
    const F = DB.store.get('remfired', {}); Object.keys(F).forEach((k) => { if (k.indexOf(key) !== 0) delete F[k]; });
    list.forEach((r) => { const fk = key + ':' + DB.pid() + ':' + r.id + ':' + r.time; if (r.on && r.time === hm && r.days.indexOf(now.getDay()) >= 0 && !F[fk]) { F[fk] = 1; DB.store.set('remfired', F); DB.notify(r.label, DB.t('rem_time'), 'rem-' + r.id); } });
  });

  /* ---------- Settings ---------- */
  DB.routes.settings = async () => {
    let h = '<div class="card"><label for="lang">' + DB.esc(DB.t('language')) + '</label><select id="lang" data-change="lang"><option value="bn"' + (DB.S.lang === 'bn' ? ' selected' : '') + '>বাংলা</option><option value="en"' + (DB.S.lang === 'en' ? ' selected' : '') + '>English</option><option value="ar"' + (DB.S.lang === 'ar' ? ' selected' : '') + '>العربية</option></select>' +
      '<label for="fs">' + DB.esc(DB.t('arabic_size')) + ': <b id="fsv">' + DB.num(DB.S.fs) + '</b></label><input id="fs" type="range" min="20" max="56" step="2" value="' + DB.S.fs + '" data-input="fsRange">' +
      '<div class="ar big" lang="ar" id="fsPrev" style="text-align:center">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div></div>';
    h += '<div class="card"><h2>' + DB.esc(DB.t('privacy')) + '</h2><p>' + DB.esc(DB.t('privacy_text')) + '</p><div class="row"><button class="btn" data-act="exportAll">' + DB.esc(DB.t('export_all')) + '</button><button class="btn danger" data-act="wipeAll">' + DB.esc(DB.t('wipe_all')) + '</button></div></div>';
    h += '<div class="card"><h2>' + DB.esc(DB.t('about')) + '</h2><p>' + DB.esc(DB.t('about_text')) + '</p><p class="muted small" dir="ltr" style="text-align:start">Prayer times: AlAdhan API (aladhan.com)<br>Quran text &amp; translations: AlQuran Cloud API (alquran.cloud) — Uthmani text; Bangla: Muhiuddin Khan; English: Saheeh International<br>Recitation audio: Mishary Alafasy via cdn.islamic.network<br>Fonts: Hind Siliguri, Noto Naskh Arabic (Google Fonts, OFL)</p><p class="muted small">' + DB.esc(DB.t('no_ads')) + '</p><p class="muted small">v1.0.0 · ' + DB.esc(DB.t('mvp_note')) + '</p></div>';
    return DB.page(DB.t('nav_settings'), h);
  };
  DB.changes.lang = (el) => { DB.S.lang = el.value; DB.saveSettings(); DB.render(); };
  DB.inputs.fsRange = (el) => { DB.S.fs = parseInt(el.value, 10); DB.saveSettings(); DB.applyLang(); DB.$('#fsv').textContent = DB.num(DB.S.fs); };
  DB.acts.exportAll = () => {
    const out = { app: 'DeenBondhu BD', exportedAt: new Date().toISOString(), data: {} };
    DB.store.keys().forEach((k) => { out.data[k] = DB.store.get(k, null); });
    delete out.data.kids; // never export the PIN hash
    DB.download('deenbondhu-all-' + DB.dateKey() + '.json', JSON.stringify(out, null, 2));
  };
  DB.acts.wipeAll = () => {
    if (!confirm(DB.t('confirm_wipe'))) return;
    DB.store.keys().forEach((k) => DB.store.del(k));
    try { indexedDB.deleteDatabase('dbbd'); } catch (e) { /* ignore */ }
    location.hash = '#/home'; location.reload();
  };
})();
