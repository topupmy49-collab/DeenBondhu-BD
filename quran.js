/* DeenBondhu BD — Quran module (data: AlQuran Cloud API, https://api.alquran.cloud/v1).
   Arabic: edition quran-uthmani. Bangla: bn.bengali (Muhiuddin Khan). English: en.sahih (Saheeh International).
   The Arabic text is displayed exactly as returned by the API; the only presentation change is that the leading Bismillah
   that the API prepends to ayah 1 of most surahs is shown on its own line above the surah instead of inside ayah 1. */
(function () {
  'use strict';
  const DB = window.DB;
  const API = 'https://api.alquran.cloud/v1';
  const EDS = 'quran-uthmani,bn.bengali,en.sahih';
  let surahs = null;
  let cur = null; // current surah data
  const audioMap = {};
  let audioEl = null;

  const stripMarks = (s) => s.replace(/[ً-ٰٟۖ-ۭـ]/g, '');

  DB.loadSurahs = async (force) => {
    if (surahs && !force) return surahs;
    const cache = DB.store.get('surahs', null);
    if (cache && cache.list && cache.list.length === 114 && !force) { surahs = cache.list; return surahs; }
    const j = await DB.fetchJson(API + '/surah');
    if (!j || !j.data || j.data.length !== 114) { const e = new Error('bad'); e.code = 'http'; throw e; }
    surahs = j.data.map((s) => ({ n: s.number, ar: s.name, en: s.englishName, tr: s.englishNameTranslation, type: s.revelationType, c: s.numberOfAyahs }));
    DB.store.set('surahs', { list: surahs, at: Date.now() });
    return surahs;
  };

  const bmKey = () => 'bm:quran';
  const getBm = () => DB.pget(bmKey(), []);
  DB.lastRead = () => DB.pget('lastRead', null);

  const surahRow = (s) =>
    '<li><a class="item" href="#/quran/' + s.n + '"><span class="num">' + DB.num(s.n) + '</span>' +
    '<span class="grow"><b>' + DB.esc(s.en) + '</b> <span class="muted small">— ' + DB.esc(s.tr) + '</span><br>' +
    '<span class="muted small">' + DB.esc(DB.t(s.type === 'Meccan' ? 'makki' : 'madani')) + ' · ' + DB.num(s.c) + ' ' + DB.esc(DB.t('ayahs')) + '</span></span>' +
    '<span class="ar">' + DB.esc(s.ar.replace(/^سُورَةُ\s*/, '')) + '</span></a></li>';

  DB.routes.quran = async (params, q) => {
    if (params[0]) return readSurah(parseInt(params[0], 10), q);
    let list;
    try { list = await DB.loadSurahs(); } catch (e) { return DB.page(DB.t('nav_quran'), DB.errBox(e, 'reload')); }
    const lr = DB.lastRead();
    const bms = getBm();
    let h = '';
    if (lr) h += '<a class="card hero" style="display:block;text-decoration:none;color:inherit" href="#/quran/' + lr.s + '?a=' + lr.a + '"><div class="muted small">' + DB.esc(DB.t('continue_reading')) + '</div><h2 style="margin:4px 0 0">' + DB.esc(lr.name || '') + ' · ' + DB.num(lr.s) + ':' + DB.num(lr.a) + '</h2></a>';
    h += '<input type="search" id="surahQ" data-input="surahSearch" placeholder="' + DB.esc(DB.t('search_surah')) + '" aria-label="' + DB.esc(DB.t('search_surah')) + '">';
    h += '<div class="chips" style="margin-top:10px"><button class="chip on" id="tabAll" data-act="quranTab" data-tab="all" aria-pressed="true">' + DB.esc(DB.t('all_surahs')) + ' (114)</button>' +
      '<button class="chip" id="tabBm" data-act="quranTab" data-tab="bm" aria-pressed="false">' + DB.esc(DB.t('bookmarks')) + ' (' + DB.num(bms.length) + ')</button></div>';
    h += '<div class="card"><ul class="list" id="surahList">' + list.map(surahRow).join('') + '</ul></div>';
    h += '<p class="muted small">' + DB.esc(DB.t('quran_credit')) + '</p>';
    return DB.page(DB.t('nav_quran'), h);
  };

  DB.inputs.surahSearch = (el) => {
    const q = el.value.trim().toLowerCase();
    const ul = DB.$('#surahList');
    if (!surahs) return;
    const res = surahs.filter((s) => !q || String(s.n) === q || s.en.toLowerCase().includes(q) || s.tr.toLowerCase().includes(q) || stripMarks(s.ar).includes(stripMarks(q)));
    ul.innerHTML = res.length ? res.map(surahRow).join('') : '<li class="empty">' + DB.esc(DB.t('no_results')) + '</li>';
  };
  DB.acts.quranTab = (el) => {
    const bm = el.getAttribute('data-tab') === 'bm';
    DB.$('#tabAll').classList.toggle('on', !bm); DB.$('#tabAll').setAttribute('aria-pressed', String(!bm));
    DB.$('#tabBm').classList.toggle('on', bm); DB.$('#tabBm').setAttribute('aria-pressed', String(bm));
    const ul = DB.$('#surahList');
    if (!bm) { ul.innerHTML = surahs.map(surahRow).join(''); return; }
    const bms = getBm();
    ul.innerHTML = bms.length ? bms.map((k) => {
      const [s, a] = k.split(':').map(Number); const sj = surahs.find((x) => x.n === s);
      return '<li><a class="item" href="#/quran/' + s + '?a=' + a + '"><span class="num">' + DB.num(s) + '</span><span class="grow"><b>' + DB.esc(sj ? sj.en : '') + '</b> · ' + DB.num(s) + ':' + DB.num(a) + '</span></a></li>';
    }).join('') : '<li class="empty">' + DB.esc(DB.t('no_bookmarks')) + '</li>';
  };

  async function readSurah(n, q) {
    if (!(n >= 1 && n <= 114)) return DB.page(DB.t('nav_quran'), '<div class="empty">' + DB.esc(DB.t('not_found')) + '</div>', '#/quran');
    let list = null;
    try { list = await DB.loadSurahs(); } catch (e) { /* list is optional for reading */ }
    let j;
    try { j = await DB.fetchJson(API + '/surah/' + n + '/editions/' + EDS, 20000); }
    catch (e) { return DB.page(DB.t('nav_quran'), DB.errBox(e, 'reload'), '#/quran'); }
    const eds = {};
    (j.data || []).forEach((d) => { eds[d.edition.identifier] = d; });
    const arEd = eds['quran-uthmani'];
    if (!arEd) return DB.page(DB.t('nav_quran'), '<div class="notice err">' + DB.esc(DB.t('err_edition')) + '</div>', '#/quran');
    const bnEd = eds['bn.bengali'], enEd = eds['en.sahih'];
    const sj = list ? list.find((x) => x.n === n) : null;
    const name = sj ? sj.en : arEd.englishName;
    const bms = getBm();

    let bism = '';
    const ay = arEd.ayahs.map((a, i) => {
      let text = a.text;
      if (i === 0 && n !== 1 && n !== 9) {
        const w = text.split(' ');
        if (w.length > 4 && stripMarks(w[0]).indexOf('بسم') === 0) { bism = w.slice(0, 4).join(' '); text = w.slice(4).join(' '); }
      }
      return { a: a.numberInSurah, ar: text, arFull: a.text, bn: bnEd ? (bnEd.ayahs[i] || {}).text : '', en: enEd ? (enEd.ayahs[i] || {}).text : '' };
    });
    cur = { n, name, ay };

    let h = '';
    h += '<div class="card hero center"><div class="muted small">' + DB.num(n) + ' · ' + DB.esc(sj ? DB.t(sj.type === 'Meccan' ? 'makki' : 'madani') : '') + ' · ' + DB.num(arEd.numberOfAyahs) + ' ' + DB.esc(DB.t('ayahs')) + '</div>' +
      '<h1 style="margin:4px 0">' + DB.esc(name) + '</h1><div class="ar big" style="text-align:center">' + DB.esc(arEd.name) + '</div><div class="muted small">' + DB.esc(arEd.englishNameTranslation) + '</div></div>';
    h += '<div class="card"><div class="row between"><div class="row"><button class="btn sm" data-act="fsDown" aria-label="' + DB.esc(DB.t('font_smaller')) + '">A−</button><button class="btn sm" data-act="fsUp" aria-label="' + DB.esc(DB.t('font_larger')) + '">A+</button></div>' +
      '<div class="row"><label class="inline" style="margin:0"><input type="checkbox" data-change="trBn" ' + (DB.S.showBn ? 'checked' : '') + '> বাংলা</label><label class="inline" style="margin:0"><input type="checkbox" data-change="trEn" ' + (DB.S.showEn ? 'checked' : '') + '> English</label></div></div>' +
      '<div class="row" style="margin-top:8px"><input type="number" id="jumpAyah" min="1" max="' + arEd.numberOfAyahs + '" placeholder="' + DB.esc(DB.t('go_ayah')) + '" style="max-width:140px" aria-label="' + DB.esc(DB.t('go_ayah')) + '"><button class="btn sm" data-act="jumpAyah">' + DB.esc(DB.t('go')) + '</button></div></div>';
    if (!bnEd) h += '<div class="notice err">' + DB.esc(DB.t('err_bn_missing')) + '</div>';
    if (!enEd) h += '<div class="notice err">' + DB.esc(DB.t('err_en_missing')) + '</div>';
    h += '<div class="card">';
    if (bism) h += '<div class="bismillah" lang="ar" dir="rtl">' + DB.esc(bism) + '</div>';
    h += ay.map((x) => {
      const key = n + ':' + x.a;
      const on = bms.indexOf(key) >= 0;
      return '<article class="ayah" id="ay' + x.a + '" data-a="' + x.a + '"><div class="row between"><span class="badge">' + DB.num(n) + ':' + DB.num(x.a) + '</span></div>' +
        '<div class="ar" lang="ar" dir="rtl">' + DB.esc(x.ar) + '</div>' +
        (bnEd ? '<div class="tr tr-bn" lang="bn" ' + (DB.S.showBn ? '' : 'hidden') + '>' + DB.esc(x.bn) + '</div>' : '') +
        (enEd ? '<div class="tr tr-en" lang="en" dir="ltr" ' + (DB.S.showEn ? '' : 'hidden') + '>' + DB.esc(x.en) + '</div>' : '') +
        '<div class="ayah-tools"><button class="btn sm" data-act="playAyah" data-a="' + x.a + '" aria-label="' + DB.esc(DB.t('play')) + '">' + DB.icon('play', 'fill') + '</button>' +
        '<button class="btn sm' + (on ? ' primary' : '') + '" data-act="bmAyah" data-a="' + x.a + '" aria-pressed="' + on + '" aria-label="' + DB.esc(DB.t('bookmark')) + '">' + DB.icon('bookmark') + '</button>' +
        '<button class="btn sm" data-act="copyAyah" data-a="' + x.a + '" aria-label="' + DB.esc(DB.t('copy')) + '">' + DB.icon('copy') + '</button>' +
        '<button class="btn sm" data-act="shareAyah" data-a="' + x.a + '">' + DB.esc(DB.t('share')) + '</button>' +
        '<button class="btn sm ghost" data-act="markHere" data-a="' + x.a + '">' + DB.esc(DB.t('mark_here')) + '</button></div></article>';
    }).join('');
    h += '</div>';
    h += '<div class="row between">' +
      (n > 1 ? '<a class="btn" href="#/quran/' + (n - 1) + '">← ' + DB.esc(DB.t('prev_surah')) + '</a>' : '<span></span>') +
      (n < 114 ? '<a class="btn" href="#/quran/' + (n + 1) + '">' + DB.esc(DB.t('next_surah')) + ' →</a>' : '<span></span>') + '</div>';
    h += '<p class="muted small">' + DB.esc(DB.t('quran_credit')) + '</p>';

    DB.onMount(() => {
      const target = q && q.a ? DB.$('#ay' + parseInt(q.a, 10)) : null;
      if (target) { target.classList.add('active'); target.scrollIntoView({ block: 'center' }); }
      let timer = null;
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const a = parseInt(en.target.getAttribute('data-a'), 10);
            clearTimeout(timer);
            timer = setTimeout(() => DB.pset('lastRead', { s: n, a, name }), 700);
          }
        });
      }, { threshold: 0.7 });
      DB.$$('.ayah').forEach((el) => obs.observe(el));
      if (!target) DB.pset('lastRead', DB.lastRead() && DB.lastRead().s === n ? DB.lastRead() : { s: n, a: 1, name });
    });
    return DB.page(name, h, '#/quran');
  }

  const ayahText = (a) => {
    const x = cur.ay.find((y) => y.a === a);
    return [x.arFull, DB.S.showBn && x.bn ? x.bn : '', DB.S.showEn && x.en ? x.en : '', '— Qur\'an ' + cur.n + ':' + a + ' (' + cur.name + ')'].filter(Boolean).join('\n\n');
  };
  DB.acts.fsUp = () => { DB.S.fs = Math.min(56, DB.S.fs + 2); DB.saveSettings(); DB.applyLang(); };
  DB.acts.fsDown = () => { DB.S.fs = Math.max(20, DB.S.fs - 2); DB.saveSettings(); DB.applyLang(); };
  DB.changes.trBn = (el) => { DB.S.showBn = el.checked; DB.saveSettings(); DB.$$('.tr-bn').forEach((x) => { x.hidden = !el.checked; }); };
  DB.changes.trEn = (el) => { DB.S.showEn = el.checked; DB.saveSettings(); DB.$$('.tr-en').forEach((x) => { x.hidden = !el.checked; }); };
  DB.acts.jumpAyah = () => { const v = parseInt(DB.$('#jumpAyah').value, 10); const t = v ? DB.$('#ay' + v) : null; if (t) t.scrollIntoView({ block: 'center' }); else DB.toast(DB.t('not_found')); };
  DB.acts.copyAyah = (el) => DB.copyText(ayahText(parseInt(el.getAttribute('data-a'), 10)));
  DB.acts.shareAyah = (el) => DB.share(ayahText(parseInt(el.getAttribute('data-a'), 10)));
  DB.acts.markHere = (el) => { const a = parseInt(el.getAttribute('data-a'), 10); DB.pset('lastRead', { s: cur.n, a, name: cur.name }); DB.toast(DB.t('saved_pos')); };
  DB.acts.bmAyah = (el) => {
    const key = cur.n + ':' + el.getAttribute('data-a');
    let b = getBm();
    const i = b.indexOf(key);
    if (i >= 0) b.splice(i, 1); else b.push(key);
    DB.pset(bmKey(), b);
    el.classList.toggle('primary', i < 0); el.setAttribute('aria-pressed', String(i < 0));
  };
  DB.acts.playAyah = async (el) => {
    const a = parseInt(el.getAttribute('data-a'), 10);
    if (!DB.audioUnlocked) DB.audioUnlocked = true; // this click is the user gesture
    try {
      if (!audioMap[cur.n]) {
        const j = await DB.fetchJson(API + '/surah/' + cur.n + '/ar.alafasy', 15000);
        audioMap[cur.n] = {};
        (j.data.ayahs || []).forEach((x) => { audioMap[cur.n][x.numberInSurah] = [x.audio].concat(x.audioSecondary || []); });
      }
      const urls = audioMap[cur.n][a];
      if (!urls) throw Object.assign(new Error('x'), { code: 'http' });
      if (!audioEl) audioEl = new Audio();
      audioEl.pause();
      let i = 0;
      audioEl.onerror = () => { i++; if (urls[i]) { audioEl.src = urls[i]; audioEl.play().catch(() => {}); } else DB.toast(DB.t('err_audio')); };
      audioEl.src = urls[0];
      await audioEl.play();
    } catch (e) { DB.toast(e.code ? DB.errText(e) : DB.t('err_audio')); }
  };
})();
