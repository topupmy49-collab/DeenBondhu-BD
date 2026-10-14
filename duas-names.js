/* DeenBondhu BD — Duas library, Asma ul Husna, global search. */
(function () {
  'use strict';
  const DB = window.DB;
  const strip = (s) => String(s || '').replace(/[ً-ٰٟۖ-ۭـ]/g, '');
  const catOf = (id) => window.DUA_CATS.find((c) => c.id === id);
  const favs = () => DB.pget('fav:duas', []);
  const nfavs = () => DB.pget('fav:names', []);
  const dayIndex = () => { const d = new Date(); return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000); };
  DB.dailyDua = () => { const list = window.DUAS.filter((d) => d.ar); return list[dayIndex() % list.length]; };

  const duaMatches = (d, q) => {
    if (!q) return true;
    q = q.toLowerCase();
    const hay = [d.t.bn, d.t.en, d.bn, d.en, d.src, strip(d.ar)].join(' ').toLowerCase();
    return hay.indexOf(q) >= 0 || hay.indexOf(strip(q)) >= 0;
  };
  const duaRow = (d) => {
    const c = catOf(d.cat);
    return '<li><a class="item" href="#/dua/' + d.id + '"><span class="grow"><b>' + DB.esc(DB.pick(d.t)) + '</b><br><span class="muted small">' + DB.esc(DB.pick(c)) + ' · ' + DB.esc(d.src) + '</span></span>' +
      (d.ar ? '<span class="ar" lang="ar">' + DB.esc(strip(d.ar).split(' ').slice(0, 3).join(' ')) + '</span>' : '') + '</a></li>';
  };

  let flt = { cat: 'all', q: '' };
  const filterDuas = () => {
    let list = window.DUAS;
    if (flt.cat === 'fav') { const f = favs(); list = list.filter((d) => f.indexOf(d.id) >= 0); }
    else if (flt.cat === 'recent') { const r = DB.pget('recent:duas', []); list = r.map((id) => window.DUAS.find((d) => d.id === id)).filter(Boolean); }
    else if (flt.cat !== 'all') list = list.filter((d) => d.cat === flt.cat);
    return list.filter((d) => duaMatches(d, flt.q));
  };
  const renderDuaList = () => {
    const list = filterDuas();
    DB.$('#duaList').innerHTML = list.length ? list.map(duaRow).join('') : '<li class="empty">' + DB.esc(DB.t(flt.cat === 'fav' ? 'no_favs' : 'no_results')) + '</li>';
    DB.$$('#duaChips .chip').forEach((c) => { const on = c.getAttribute('data-cat') === flt.cat; c.classList.toggle('on', on); c.setAttribute('aria-pressed', String(on)); });
    DB.$('#duaCount').textContent = DB.num(list.length);
  };

  DB.routes.duas = async (params, q) => {
    if (q.cat) flt.cat = q.cat;
    const chips = [['all', DB.t('all')], ['fav', DB.t('favorites')], ['recent', DB.t('recent')]].concat(window.DUA_CATS.map((c) => [c.id, DB.pick(c)]));
    let h = '<input type="search" id="duaQ" data-input="duaSearch" value="' + DB.esc(flt.q) + '" placeholder="' + DB.esc(DB.t('search_duas')) + '" aria-label="' + DB.esc(DB.t('search_duas')) + '">';
    h += '<div class="chips" id="duaChips" style="margin-top:10px">' + chips.map((c) => '<button class="chip" data-act="duaCat" data-cat="' + c[0] + '" aria-pressed="false">' + DB.esc(c[1]) + '</button>').join('') + '</div>';
    h += '<div class="muted small" style="margin:0 0 6px">' + DB.esc(DB.t('showing')) + ' <b id="duaCount"></b> / ' + DB.num(window.DUAS.length) + '</div>';
    h += '<div class="card"><ul class="list" id="duaList"></ul></div>';
    h += '<div class="notice">' + DB.esc(DB.t('dua_scope_note')) + '</div>';
    DB.onMount(renderDuaList);
    return DB.page(DB.t('nav_duas'), h);
  };
  DB.inputs.duaSearch = (el) => { flt.q = el.value.trim(); renderDuaList(); };
  DB.acts.duaCat = (el) => { flt.cat = el.getAttribute('data-cat'); renderDuaList(); };

  DB.routes.dua = async (params) => {
    const d = window.DUAS.find((x) => x.id === params[0]);
    if (!d) return DB.page(DB.t('nav_duas'), '<div class="empty">' + DB.esc(DB.t('not_found')) + '</div>', '#/duas');
    let r = DB.pget('recent:duas', []).filter((id) => id !== d.id); r.unshift(d.id); DB.pset('recent:duas', r.slice(0, 12));
    const c = catOf(d.cat);
    const fav = favs().indexOf(d.id) >= 0;
    let h = '<div class="card">';
    h += '<span class="badge">' + DB.esc(DB.pick(c)) + '</span>';
    h += '<h1 style="margin-top:8px">' + DB.esc(d.t.bn) + '</h1>';
    if (DB.S.lang !== 'bn') h += '<div class="muted" style="margin-top:-6px">' + DB.esc(DB.pick(d.t)) + '</div>';
    if (d.ar) h += '<div class="ar big" lang="ar" dir="rtl" style="margin:14px 0">' + DB.esc(d.ar) + '</div>';
    if (d.ar) h += '<p class="muted small">' + DB.esc(DB.t('pron_note')) + '</p>';
    h += '<h3 class="gold">' + DB.esc(DB.t('meaning_bn')) + '</h3><p lang="bn">' + DB.esc(d.bn) + '</p>';
    h += '<h3 class="gold">' + DB.esc(DB.t('meaning_en')) + '</h3><p lang="en" dir="ltr">' + DB.esc(d.en) + '</p>';
    h += '<h3 class="gold">' + DB.esc(DB.t('source')) + '</h3><p dir="ltr" style="text-align:start">' + DB.esc(d.src) + '</p>';
    h += '<p><span class="pill ok">' + DB.esc(DB.t('grade_' + d.g)) + '</span></p>';
    if (d.n) h += '<div class="notice">' + DB.esc(DB.pick(d.n)) + '</div>';
    h += '<div class="row" style="margin-top:12px"><button class="btn' + (fav ? ' primary' : '') + '" data-act="favDua" data-id="' + d.id + '" aria-pressed="' + fav + '">' + DB.icon('bookmark') + ' ' + DB.esc(DB.t('bookmark')) + '</button>' +
      (d.ar ? '<button class="btn" data-act="copyDua" data-id="' + d.id + '">' + DB.icon('copy') + ' ' + DB.esc(DB.t('copy')) + '</button><button class="btn" data-act="shareDua" data-id="' + d.id + '">' + DB.esc(DB.t('share')) + '</button>' : '') + '</div>';
    h += '<p class="muted small" style="margin-top:10px">' + DB.esc(DB.t('audio_unavailable')) + '</p>';
    h += '</div>';
    return DB.page(DB.pick(c), h, '#/duas');
  };
  const duaText = (d) => [d.ar, d.bn, d.en, '— ' + d.src].filter(Boolean).join('\n\n');
  DB.acts.favDua = (el) => { const id = el.getAttribute('data-id'); let f = favs(); const i = f.indexOf(id); if (i >= 0) f.splice(i, 1); else f.push(id); DB.pset('fav:duas', f); el.classList.toggle('primary', i < 0); el.setAttribute('aria-pressed', String(i < 0)); };
  DB.acts.copyDua = (el) => DB.copyText(duaText(window.DUAS.find((d) => d.id === el.getAttribute('data-id'))));
  DB.acts.shareDua = (el) => DB.share(duaText(window.DUAS.find((d) => d.id === el.getAttribute('data-id'))));

  /* ---------- Asma ul Husna ---------- */
  let nflt = { q: '', fav: false };
  const nameRow = (n, i, f) =>
    '<li><a class="item" href="#/names/' + (i + 1) + '"><span class="num">' + DB.num(i + 1) + '</span><span class="grow"><b>' + DB.esc(n[1]) + '</b><br><span class="muted small">' + DB.esc(DB.S.lang === 'en' ? n[3] : n[2]) + '</span></span>' +
    (f.indexOf(i + 1) >= 0 ? '<span aria-label="' + DB.esc(DB.t('favorites')) + '">★</span>' : '') + '<span class="ar" lang="ar">' + DB.esc(n[0]) + '</span></a></li>';
  const renderNames = () => {
    const f = nfavs(); const q = nflt.q.toLowerCase();
    const out = [];
    window.NAMES.forEach((n, i) => {
      if (nflt.fav && f.indexOf(i + 1) < 0) return;
      if (q && ![strip(n[0]), n[1], n[2], n[3]].join(' ').toLowerCase().includes(q) && !strip(n[0]).includes(strip(q)) && String(i + 1) !== q) return;
      out.push(nameRow(n, i, f));
    });
    DB.$('#nameList').innerHTML = out.length ? out.join('') : '<li class="empty">' + DB.esc(DB.t(nflt.fav ? 'no_favs' : 'no_results')) + '</li>';
  };
  DB.routes.names = async (params) => {
    if (params[0]) {
      const i = parseInt(params[0], 10) - 1; const n = window.NAMES[i];
      if (!n) return DB.page(DB.t('names'), '<div class="empty">' + DB.esc(DB.t('not_found')) + '</div>', '#/names');
      const fav = nfavs().indexOf(i + 1) >= 0;
      let h = '<div class="card center"><span class="badge">' + DB.num(i + 1) + ' / ' + DB.num(99) + '</span><div class="ar big" lang="ar" style="text-align:center;font-size:calc(var(--fs-ar) * 1.8)">' + DB.esc(n[0]) + '</div>' +
        '<h1>' + DB.esc(n[1]) + '</h1><p lang="bn">' + DB.esc(n[2]) + '</p><p dir="ltr" lang="en">' + DB.esc(n[3]) + '</p>' +
        '<div class="row" style="justify-content:center"><button class="btn' + (fav ? ' primary' : '') + '" data-act="favName" data-i="' + (i + 1) + '" aria-pressed="' + fav + '">★ ' + DB.esc(DB.t('favorites')) + '</button></div></div>' +
        '<div class="row between">' + (i > 0 ? '<a class="btn" href="#/names/' + i + '">←</a>' : '<span></span>') + (i < 98 ? '<a class="btn" href="#/names/' + (i + 2) + '">→</a>' : '<span></span>') + '</div>';
      return DB.page(DB.t('names'), h, '#/names');
    }
    const di = dayIndex() % 99; const dn = window.NAMES[di];
    const done = DB.pget('namesDone', {}); const today = DB.dateKey();
    let h = '<div class="card hero"><div class="muted small">' + DB.esc(DB.t('name_of_day')) + '</div><div class="row between"><div><b>' + DB.esc(dn[1]) + '</b> — ' + DB.esc(DB.S.lang === 'en' ? dn[3] : dn[2]) + '</div><div class="ar" lang="ar" style="font-size:1.8rem">' + DB.esc(dn[0]) + '</div></div>' +
      '<label class="inline"><input type="checkbox" data-change="nameDone" ' + (done[today] ? 'checked' : '') + '> ' + DB.esc(DB.t('reflected_today')) + '</label>' +
      '<div class="muted small">' + DB.esc(DB.t('days_reflected')) + ': <b id="nameDays">' + DB.num(Object.keys(done).filter((k) => done[k]).length) + '</b></div></div>';
    h += '<input type="search" data-input="nameSearch" placeholder="' + DB.esc(DB.t('search_names')) + '" aria-label="' + DB.esc(DB.t('search_names')) + '" value="' + DB.esc(nflt.q) + '">';
    h += '<div class="chips" style="margin-top:10px"><button class="chip' + (!nflt.fav ? ' on' : '') + '" data-act="nameFav" data-fav="0">' + DB.esc(DB.t('all')) + '</button><button class="chip' + (nflt.fav ? ' on' : '') + '" data-act="nameFav" data-fav="1">' + DB.esc(DB.t('favorites')) + '</button></div>';
    h += '<div class="card"><ul class="list" id="nameList"></ul></div><div class="notice">' + DB.esc(DB.t('names_note')) + '</div>';
    DB.onMount(renderNames);
    return DB.page(DB.t('names') + ' (99)', h);
  };
  DB.inputs.nameSearch = (el) => { nflt.q = el.value.trim(); renderNames(); };
  DB.acts.nameFav = (el) => { nflt.fav = el.getAttribute('data-fav') === '1'; DB.$$('[data-act=nameFav]').forEach((b) => b.classList.toggle('on', b === el)); renderNames(); };
  DB.acts.favName = (el) => { const i = parseInt(el.getAttribute('data-i'), 10); let f = nfavs(); const k = f.indexOf(i); if (k >= 0) f.splice(k, 1); else f.push(i); DB.pset('fav:names', f); el.classList.toggle('primary', k < 0); el.setAttribute('aria-pressed', String(k < 0)); };
  DB.changes.nameDone = (el) => { const d = DB.pget('namesDone', {}); d[DB.dateKey()] = el.checked; DB.pset('namesDone', d); DB.$('#nameDays').textContent = DB.num(Object.keys(d).filter((k) => d[k]).length); };

  /* ---------- global search ---------- */
  const runSearch = async (q) => {
    const box = DB.$('#searchRes');
    q = q.trim();
    if (!q) { box.innerHTML = '<div class="empty">' + DB.esc(DB.t('type_to_search')) + '</div>'; return; }
    const ql = q.toLowerCase();
    const duas = window.DUAS.filter((d) => duaMatches(d, q)).slice(0, 15);
    const names = window.NAMES.map((n, i) => [n, i]).filter(([n, i]) => [strip(n[0]), n[1], n[2], n[3]].join(' ').toLowerCase().includes(ql) || strip(n[0]).includes(strip(q))).slice(0, 15);
    let surahs = [];
    try { const l = await DB.loadSurahs(); surahs = l.filter((s) => String(s.n) === q || s.en.toLowerCase().includes(ql) || s.tr.toLowerCase().includes(ql) || strip(s.ar).includes(strip(q))).slice(0, 15); } catch (e) { /* offline: skip surahs */ }
    let h = '';
    if (surahs.length) h += '<h2>' + DB.esc(DB.t('nav_quran')) + '</h2><div class="card"><ul class="list">' + surahs.map((s) => '<li><a class="item" href="#/quran/' + s.n + '"><span class="num">' + DB.num(s.n) + '</span><span class="grow">' + DB.esc(s.en) + '</span><span class="ar">' + DB.esc(s.ar) + '</span></a></li>').join('') + '</ul></div>';
    if (duas.length) h += '<h2>' + DB.esc(DB.t('nav_duas')) + '</h2><div class="card"><ul class="list">' + duas.map(duaRow).join('') + '</ul></div>';
    if (names.length) h += '<h2>' + DB.esc(DB.t('names')) + '</h2><div class="card"><ul class="list">' + names.map(([n, i]) => nameRow(n, i, nfavs())).join('') + '</ul></div>';
    box.innerHTML = h || '<div class="empty">' + DB.esc(DB.t('no_results')) + '</div>';
  };
  DB.routes.search = async (params, q) => {
    DB.onMount(() => { const el = DB.$('#gq'); if (q.q) { el.value = q.q; } runSearch(el.value); el.focus(); });
    return DB.page(DB.t('search'), '<input type="search" id="gq" data-input="gsearch" placeholder="' + DB.esc(DB.t('search_all')) + '" aria-label="' + DB.esc(DB.t('search_all')) + '"><div id="searchRes" style="margin-top:12px"></div>');
  };
  let st = null;
  DB.inputs.gsearch = (el) => { clearTimeout(st); st = setTimeout(() => runSearch(el.value), 200); };
})();
