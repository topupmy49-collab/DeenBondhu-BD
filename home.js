/* DeenBondhu BD — Home dashboard + app boot. */
(function () {
  'use strict';
  const DB = window.DB;
  const PR = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  const prayerCardInner = (pt, err) => {
    let h = '';
    if (err) h += DB.errBox(err, 'homeRetry');
    if (!pt) return h;
    const np = DB.nextPrayer();
    if (pt.stale) h += '<div class="notice small">' + DB.esc(DB.t('stale_times')) + '</div>';
    h += '<div class="muted small">' + DB.esc(DB.cityLabel()) + '</div><div class="muted">' + DB.esc(DB.t('next_prayer')) + '</div>' +
      '<div class="row between"><h2 style="margin:0" data-nextname>' + DB.esc(DB.t('p_' + np.name)) + '</h2><div class="big-time" data-countdown style="font-size:1.9rem"></div></div>' +
      '<div class="grid g3d" style="grid-template-columns:repeat(5,1fr);margin-top:10px;gap:6px">' + PR.map((p) => '<div class="center" style="padding:6px 2px;border-radius:12px;background:' + (np.name === p ? 'rgba(233,203,123,.12)' : 'transparent') + '"><div class="muted" style="font-size:.72rem">' + DB.esc(DB.t('p_' + p)) + '</div><div style="font-size:.82rem;font-variant-numeric:tabular-nums">' + DB.esc(DB.fmtTime(pt.timings[p])) + '</div></div>').join('') + '</div>' +
      '<div class="muted small" style="margin-top:6px">' + DB.esc(DB.t('p_Sunrise')) + ': ' + DB.esc(DB.fmtTime(pt.timings.Sunrise)) + ' · ' + DB.esc(DB.t('last_updated')) + ': ' + DB.esc(DB.num2(new Date(pt.at).getHours()) + ':' + DB.num2(new Date(pt.at).getMinutes())) + '</div>';
    return h;
  };

  const fillPrayer = async () => {
    const box = DB.$('#homePrayer'); if (!box) return;
    let pt = null, err = null;
    try { pt = await DB.loadTimings(false); } catch (e) { err = e; pt = DB.PT(); if (pt && pt.key !== undefined && err) { pt = Object.assign({}, pt, { stale: true }); } }
    if (!DB.$('#homePrayer')) return;
    DB.$('#homePrayer').innerHTML = prayerCardInner(pt && pt.timings ? pt : null, err);
    const hd = DB.$('#homeHijri'); if (hd) hd.textContent = DB.hijriText();
  };
  DB.acts.homeRetry = () => { DB.$('#homePrayer').innerHTML = DB.loading(); DB.loadTimings(true).then(fillPrayer).catch(fillPrayer); };

  DB.routes.home = async () => {
    const k = DB.kids();
    if (k.on) {
      let h = '<div class="card hero center"><h1>' + DB.esc(DB.t('kids_hello')) + '</h1><p>' + DB.esc(DB.t('tagline')) + '</p></div><div class="grid g2">' +
        [['quran', 'quran', 'nav_quran'], ['quiz', 'quiz', 'quiz'], ['tasbih', 'tasbih', 'nav_tasbih'], ['names', 'names', 'names']].map((t) => '<a class="tile" href="#/' + t[0] + '" style="min-height:130px">' + DB.icon(t[1]) + '<b>' + DB.esc(DB.t(t[2])) + '</b></a>').join('') + '</div>';
      if (!k.extOff && k.allow.length) h += '<div class="card" style="margin-top:14px"><h3>' + DB.esc(DB.t('parent_links')) + '</h3><ul class="list">' + k.allow.map((u) => '<li class="item">' + DB.ext(u, u) + '</li>').join('') + '</ul></div>';
      h += '<p class="center"><a class="btn sm ghost" href="#/exitkids">' + DB.esc(DB.t('parent_area')) + '</a></p>';
      return h;
    }
    const lr = DB.lastRead();
    const dd = DB.dailyDua();
    const prog = DB.todayProgress();
    const name = DB.profile() && DB.profile().name;
    let h = '<div class="card hero"><div class="muted small">' + DB.esc(DB.fmtDateLong()) + '</div><div class="gold small" id="homeHijri">' + DB.esc(DB.hijriText()) + '</div>' +
      '<h1 style="margin:6px 0 2px">' + DB.esc(DB.t('salam')) + (name ? ', ' + DB.esc(name) : '') + '</h1><div class="muted">' + DB.esc(DB.t('tagline')) + '</div></div>';
    h += '<form data-submit="homeSearch" class="row" style="margin-bottom:14px" role="search"><input type="search" name="q" placeholder="' + DB.esc(DB.t('search_all')) + '" aria-label="' + DB.esc(DB.t('search_all')) + '" style="flex:1"><button class="btn primary" type="submit" aria-label="' + DB.esc(DB.t('search')) + '">' + DB.icon('search') + '</button></form>';
    h += '<div class="card" id="homePrayer">' + DB.loading() + '</div>';
    h += '<div class="grid g4" style="margin-bottom:14px">' + [['quran', 'quran', 'nav_quran'], ['duas', 'dua', 'nav_duas'], ['guide', 'guide', 'guide'], ['qibla', 'compass', 'nav_qibla'], ['tasbih', 'tasbih', 'nav_tasbih'], ['names', 'names', 'names'], ['family', 'family', 'family'], ['settings', 'gear', 'nav_settings']].map((t) => '<a class="tile" href="#/' + t[0] + '">' + DB.icon(t[1]) + '<span>' + DB.esc(DB.t(t[2])) + '</span></a>').join('') + '</div>';
    if (lr) h += '<a class="card" style="display:block;text-decoration:none;color:inherit" href="#/quran/' + lr.s + '?a=' + lr.a + '"><div class="muted small">' + DB.esc(DB.t('continue_reading')) + '</div><div class="row between"><b>' + DB.esc(lr.name || '') + '</b><span class="gold">' + DB.num(lr.s) + ':' + DB.num(lr.a) + ' →</span></div></a>';
    h += '<a class="card" style="display:block;text-decoration:none;color:inherit" href="#/dua/' + dd.id + '"><div class="muted small">' + DB.esc(DB.t('daily_dua')) + '</div><div class="ar big" lang="ar" dir="rtl" style="margin:6px 0">' + DB.esc(dd.ar) + '</div><div>' + DB.esc(DB.S.lang === 'en' ? dd.en : dd.bn) + '</div><div class="muted small" dir="ltr" style="text-align:start;margin-top:4px">' + DB.esc(dd.src) + '</div></a>';
    h += '<a class="card" style="display:block;text-decoration:none;color:inherit" href="#/tracker"><div class="row between"><div><div class="muted small">' + DB.esc(DB.t('daily_checklist')) + '</div><b>' + DB.num(prog.done) + ' / ' + DB.num(prog.total) + '</b></div><span class="gold">' + DB.esc(DB.t('open')) + ' →</span></div><div class="progress" style="margin-top:8px"><i style="width:' + (prog.total ? Math.round((prog.done / prog.total) * 100) : 0) + '%"></i></div></a>';
    h += '<div class="center"><a class="btn sm ghost" href="#/more">' + DB.esc(DB.t('nav_more')) + '</a></div>';
    DB.onMount(fillPrayer);
    return h;
  };
  DB.acts.homeSearch = (f) => { const q = f.q.value.trim(); DB.go('#/search' + (q ? '?q=' + encodeURIComponent(q) : '')); };

  /* ---------- boot ---------- */
  const boot = () => {
    DB.applyLang();
    DB.updateOnline();
    DB.registerSW();
    DB.render();
    DB.loadTimings(false).catch(() => {}); // keeps alarms scheduled for today when possible
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
