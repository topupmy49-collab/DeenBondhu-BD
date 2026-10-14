/* DeenBondhu BD — Tasbih, worship tracker, learning guides, kids quiz. All data is stored locally per profile. */
(function () {
  'use strict';
  const DB = window.DB;

  /* ---------- Tasbih ---------- */
  const DHIKR = [
    { k: 'sub', ar: 'سُبْحَانَ اللَّهِ', l: { bn: 'সুবহানাল্লাহ', en: 'SubhanAllah', ar: 'سبحان الله' } },
    { k: 'hamd', ar: 'الْحَمْدُ لِلَّهِ', l: { bn: 'আলহামদুলিল্লাহ', en: 'Alhamdulillah', ar: 'الحمد لله' } },
    { k: 'akbar', ar: 'اللَّهُ أَكْبَرُ', l: { bn: 'আল্লাহু আকবার', en: 'Allahu Akbar', ar: 'الله أكبر' } },
    { k: 'tahlil', ar: 'لَا إِلَهَ إِلَّا اللَّهُ', l: { bn: 'লা ইলাহা ইল্লাল্লাহ', en: 'La ilaha illallah', ar: 'لا إله إلا الله' } },
    { k: 'istighfar', ar: 'أَسْتَغْفِرُ اللَّهَ', l: { bn: 'আস্তাগফিরুল্লাহ', en: 'Astaghfirullah', ar: 'أستغفر الله' } },
    { k: 'salawat', ar: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', l: { bn: 'দরূদ', en: 'Salawat', ar: 'الصلاة على النبي' } },
    { k: 'free', ar: '', l: { bn: 'মুক্ত গণনা', en: 'Free count', ar: 'عدّ حر' } }
  ];
  const tget = () => Object.assign({ k: 'sub', count: 0, target: 33, vib: true, daily: {}, hist: [] }, DB.pget('tasbih', {}));
  const tput = (s) => DB.pset('tasbih', s);
  const bump = (s, d) => { const k = DB.dateKey(); s.daily[k] = Math.max(0, (s.daily[k] || 0) + d); const keys = Object.keys(s.daily).sort(); while (keys.length > 60) delete s.daily[keys.shift()]; };

  const tasbihCounterHtml = (s) => {
    const pct = s.target ? Math.min(100, Math.round((s.count / s.target) * 100)) : 0;
    return '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="' + (s.target || 0) + '" aria-valuenow="' + s.count + '"><i style="width:' + pct + '%"></i></div>';
  };
  DB.routes.tasbih = async () => {
    const s = tget(); const d = DHIKR.find((x) => x.k === s.k) || DHIKR[0];
    let h = '<div class="chips">' + DHIKR.map((x) => '<button class="chip' + (x.k === s.k ? ' on' : '') + '" data-act="tsPick" data-k="' + x.k + '" aria-pressed="' + (x.k === s.k) + '">' + DB.esc(DB.pick(x.l)) + '</button>').join('') + '</div>';
    h += '<div class="card center"><div class="ar big" lang="ar" style="text-align:center;min-height:64px" id="tsAr">' + DB.esc(d.ar) + '</div>' +
      '<button class="tasbih-btn" id="tsBtn" data-act="tsInc" aria-label="' + DB.esc(DB.t('count_up')) + '"><span id="tsCount">' + DB.num(s.count) + '</span></button>' +
      '<div id="tsProg">' + tasbihCounterHtml(s) + '</div>' +
      '<div class="row" style="justify-content:center;margin-top:12px"><button class="btn" data-act="tsDec" aria-label="' + DB.esc(DB.t('count_down')) + '">−</button><button class="btn danger" data-act="tsReset">' + DB.esc(DB.t('reset')) + '</button></div>' +
      '<div class="field-row" style="margin-top:12px"><div><label for="tsT">' + DB.esc(DB.t('target')) + '</label><select id="tsT" data-change="tsTarget">' + [[0, DB.t('no_target')], [33, 33], [34, 34], [99, 99], [100, 100]].map((o) => '<option value="' + o[0] + '"' + (s.target === o[0] ? ' selected' : '') + '>' + DB.esc(o[0] === 0 ? o[1] : DB.num(o[1])) + '</option>').join('') + '</select></div>' +
      '<div><label class="inline" style="margin-top:34px"><input type="checkbox" data-change="tsVib" ' + (s.vib ? 'checked' : '') + '> ' + DB.esc(DB.t('vibrate')) + '</label></div></div>' +
      '<p class="muted small">' + DB.esc(DB.t('tasbih_note')) + '</p></div>';
    const days = []; for (let i = 6; i >= 0; i--) { const dt = new Date(); dt.setDate(dt.getDate() - i); const k = DB.dateKey(dt); days.push([k, s.daily[k] || 0]); }
    h += '<div class="card"><h2>' + DB.esc(DB.t('daily_totals')) + '</h2>' + days.map((x) => '<div class="row between"><span class="muted">' + DB.esc(x[0]) + '</span><b>' + DB.num(x[1]) + '</b></div>').join('') + '</div>';
    h += '<div class="card"><h2>' + DB.esc(DB.t('sessions')) + '</h2>' + (s.hist.length ? s.hist.slice(0, 10).map((x) => { const dd = DHIKR.find((y) => y.k === x.k); const dt = new Date(x.ts); return '<div class="row between"><span>' + DB.esc(dd ? DB.pick(dd.l) : '') + '</span><span class="muted small">' + DB.esc(DB.dateKey(dt) + ' ' + DB.pad(dt.getHours()) + ':' + DB.pad(dt.getMinutes())) + '</span><b>' + DB.num(x.count) + '</b></div>'; }).join('') : '<div class="empty">' + DB.esc(DB.t('no_sessions')) + '</div>') + '</div>';
    return DB.page(DB.t('nav_tasbih'), h);
  };
  const paint = (s) => { DB.$('#tsCount').textContent = DB.num(s.count); DB.$('#tsProg').innerHTML = tasbihCounterHtml(s); };
  DB.acts.tsInc = () => {
    const s = tget(); s.count++; bump(s, 1); tput(s); paint(s);
    if (s.target && s.count === s.target) { DB.toast(DB.t('target_reached')); if (s.vib && navigator.vibrate) navigator.vibrate([80, 60, 80]); }
    else if (s.vib && navigator.vibrate) navigator.vibrate(12);
  };
  DB.acts.tsDec = () => { const s = tget(); if (s.count > 0) { s.count--; bump(s, -1); tput(s); paint(s); } };
  DB.acts.tsReset = () => {
    if (!confirm(DB.t('confirm_reset_count'))) return;
    const s = tget(); if (s.count > 0) { s.hist.unshift({ ts: Date.now(), k: s.k, count: s.count }); s.hist = s.hist.slice(0, 30); }
    s.count = 0; tput(s); DB.render();
  };
  DB.acts.tsPick = (el) => { const s = tget(); if (s.count > 0) { s.hist.unshift({ ts: Date.now(), k: s.k, count: s.count }); s.hist = s.hist.slice(0, 30); } s.k = el.getAttribute('data-k'); s.count = 0; tput(s); DB.render(); };
  DB.changes.tsTarget = (el) => { const s = tget(); s.target = parseInt(el.value, 10); tput(s); paint(s); };
  DB.changes.tsVib = (el) => { const s = tget(); s.vib = el.checked; tput(s); };

  /* ---------- Worship tracker ---------- */
  const PR = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const ITEMS = PR.concat(['quran', 'adhkar']);
  const dayGet = (k) => DB.pget('t:' + k, {});
  const dayPut = (k, v) => DB.pset('t:' + k, v);
  const goalsGet = () => DB.pget('goals', []);
  const summary = (k) => { const d = dayGet(k); const goals = goalsGet(); const done = ITEMS.filter((i) => d[i]).length + goals.filter((g) => (d.g || {})[g.id]).length; return { done, total: ITEMS.length + goals.length }; };
  DB.todayProgress = () => summary(DB.dateKey());

  DB.routes.tracker = async () => {
    const today = DB.dateKey(); const d = dayGet(today); const goals = goalsGet();
    const lbl = (i) => (PR.indexOf(i) >= 0 ? DB.t('p_' + i) : DB.t('tr_' + i));
    let h = '<div class="card"><p class="muted">' + DB.esc(DB.t('tracker_intro')) + '</p><h2>' + DB.esc(DB.t('today')) + '</h2>' +
      ITEMS.map((i) => '<label class="inline"><input type="checkbox" data-change="trk" data-i="' + i + '" ' + (d[i] ? 'checked' : '') + '> ' + DB.esc(lbl(i)) + '</label>').join('') +
      (goals.length ? '<h3 class="gold" style="margin-top:12px">' + DB.esc(DB.t('my_goals')) + '</h3>' + goals.map((g) => '<div class="row between"><label class="inline" style="flex:1"><input type="checkbox" data-change="trkGoal" data-i="' + g.id + '" ' + ((d.g || {})[g.id] ? 'checked' : '') + '> ' + DB.esc(g.text) + '</label><button class="btn sm ghost" data-act="goalDel" data-id="' + g.id + '" aria-label="' + DB.esc(DB.t('delete')) + '">✕</button></div>').join('') : '') + '</div>';
    h += '<div class="card"><form data-submit="goalAdd"><label for="goalT">' + DB.esc(DB.t('add_goal')) + '</label><div class="row"><input id="goalT" name="text" maxlength="80" placeholder="' + DB.esc(DB.t('goal_ph')) + '" required style="flex:1"><button class="btn primary" type="submit">' + DB.esc(DB.t('add')) + '</button></div></form></div>';
    h += '<div class="card"><h2>' + DB.esc(DB.t('this_week')) + '</h2>';
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(); dt.setDate(dt.getDate() - i); const k = DB.dateKey(dt); const s = summary(k); const pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
      h += '<div class="row between" style="margin:8px 0"><span class="muted small" style="min-width:92px">' + DB.esc(k) + '</span><div class="progress" style="flex:1"><i style="width:' + pct + '%"></i></div><b style="min-width:54px;text-align:end">' + DB.num(s.done) + '/' + DB.num(s.total) + '</b></div>';
    }
    h += '<p class="muted small">' + DB.esc(DB.t('gentle_note')) + '</p></div>';
    h += '<div class="card"><h2>' + DB.esc(DB.t('my_data')) + '</h2><p class="muted small">' + DB.esc(DB.t('data_local')) + '</p><div class="row"><button class="btn" data-act="exportData">' + DB.esc(DB.t('export')) + '</button><button class="btn danger" data-act="resetTracker">' + DB.esc(DB.t('reset_tracker')) + '</button></div></div>';
    return DB.page(DB.t('tracker'), h);
  };
  DB.changes.trk = (el) => { const k = DB.dateKey(); const d = dayGet(k); d[el.getAttribute('data-i')] = el.checked; dayPut(k, d); };
  DB.changes.trkGoal = (el) => { const k = DB.dateKey(); const d = dayGet(k); d.g = d.g || {}; d.g[el.getAttribute('data-i')] = el.checked; dayPut(k, d); };
  DB.acts.goalAdd = (f) => { const t = f.text.value.trim().slice(0, 80); if (!t) return; const g = goalsGet(); g.push({ id: DB.uid(), text: t }); DB.pset('goals', g); DB.render(); };
  DB.acts.goalDel = (el) => { DB.pset('goals', goalsGet().filter((g) => g.id !== el.getAttribute('data-id'))); DB.render(); };
  DB.acts.exportData = () => {
    const pre = 'p:' + DB.pid() + ':'; const out = { app: 'DeenBondhu BD', exportedAt: new Date().toISOString(), profile: DB.profile(), data: {} };
    DB.store.keys().filter((k) => k.indexOf(pre) === 0).forEach((k) => { out.data[k.slice(pre.length)] = DB.store.get(k, null); });
    DB.download('deenbondhu-' + DB.dateKey() + '.json', JSON.stringify(out, null, 2));
  };
  DB.acts.resetTracker = () => {
    if (!confirm(DB.t('confirm_reset_tracker'))) return;
    const pre = 'p:' + DB.pid() + ':';
    DB.store.keys().filter((k) => k.indexOf(pre + 't:') === 0 || k === pre + 'goals' || k === pre + 'tasbih' || k === pre + 'namesDone').forEach((k) => DB.store.del(k));
    DB.render();
  };

  /* ---------- Guides ---------- */
  DB.routes.guide = async (params) => {
    if (params[0]) {
      const g = window.GUIDES.find((x) => x.id === params[0]);
      if (!g) return DB.page(DB.t('guide'), '<div class="empty">' + DB.esc(DB.t('not_found')) + '</div>', '#/guide');
      let h = '<div class="card"><ol class="list" style="list-style:none">' + g.items.map((it, i) => '<li class="item" style="align-items:flex-start"><span class="num">' + DB.num(i + 1) + '</span><span class="grow"><span class="badge">' + DB.esc(DB.t('tag_' + it.tag)) + '</span><p style="margin-top:6px">' + DB.esc(DB.pick(it.t)) + '</p></span></li>').join('') + '</ol>' +
        '<p class="muted small" dir="ltr" style="text-align:start">' + DB.esc(DB.t('source')) + ': ' + DB.esc(g.ref) + '</p></div>' +
        '<div class="notice">' + DB.esc(DB.t('guide_disclaimer')) + '</div>';
      if (g.id === 'salah') h += '<a class="btn" href="#/duas?cat=salah">' + DB.esc(DB.t('recitations')) + ' →</a>';
      if (g.id === 'wudu' || g.id === 'ghusl') h += '<a class="btn" href="#/duas?cat=wudu">' + DB.esc(DB.t('related_duas')) + ' →</a>';
      return DB.page(DB.pick(g.title), h, '#/guide');
    }
    let h = '<div class="notice">' + DB.esc(DB.t('guide_disclaimer')) + '</div><div class="card"><ul class="list">' + window.GUIDES.map((g) => '<li><a class="item" href="#/guide/' + g.id + '">' + DB.icon(g.icon, '') + '<span class="grow"><b>' + DB.esc(DB.pick(g.title)) + '</b></span><span>›</span></a></li>').join('') + '</ul></div>';
    return DB.page(DB.t('guide'), h);
  };

  /* ---------- Quiz ---------- */
  let qz = { i: 0, score: 0, ans: null, order: null };
  const quizHtml = () => {
    const Q = window.QUIZ;
    if (qz.i >= Q.length) {
      return '<div class="card center"><h2>' + DB.esc(DB.t('quiz_done')) + '</h2><div class="big-time">' + DB.num(qz.score) + ' / ' + DB.num(Q.length) + '</div><p>' + DB.esc(DB.t('quiz_praise')) + '</p><button class="btn primary" data-act="quizRestart">' + DB.esc(DB.t('quiz_again')) + '</button></div>';
    }
    const q = Q[qz.i];
    return '<div class="card"><div class="muted small">' + DB.num(qz.i + 1) + ' / ' + DB.num(Q.length) + '</div><h2 style="color:var(--text)">' + DB.esc(DB.pick(q.q)) + '</h2><div class="grid">' +
      q.o.map((o, idx) => '<button class="btn' + (qz.ans === idx ? (idx === q.a ? ' primary' : ' danger') : (qz.ans != null && idx === q.a ? ' primary' : '')) + '" data-act="quizAns" data-i="' + idx + '" ' + (qz.ans != null ? 'disabled' : '') + ' style="justify-content:flex-start;text-align:start">' + DB.esc(o) + '</button>').join('') + '</div>' +
      (qz.ans != null ? '<p class="' + (qz.ans === q.a ? 'mint' : 'gold') + '" role="status">' + DB.esc(DB.t(qz.ans === q.a ? 'quiz_right' : 'quiz_try')) + '</p><button class="btn primary" data-act="quizNext">' + DB.esc(DB.t('next')) + '</button>' : '') + '</div>';
  };
  DB.routes.quiz = async () => { qz = { i: 0, score: 0, ans: null }; return DB.page(DB.t('quiz'), '<div id="quizBox">' + quizHtml() + '</div>'); };
  const qrepaint = () => { DB.$('#quizBox').innerHTML = quizHtml(); };
  DB.acts.quizAns = (el) => { if (qz.ans != null) return; qz.ans = parseInt(el.getAttribute('data-i'), 10); if (qz.ans === window.QUIZ[qz.i].a) qz.score++; qrepaint(); };
  DB.acts.quizNext = () => { qz.i++; qz.ans = null; qrepaint(); };
  DB.acts.quizRestart = () => { qz = { i: 0, score: 0, ans: null }; qrepaint(); };
})();
