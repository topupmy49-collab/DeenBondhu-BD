/* DeenBondhu BD — core: storage, i18n, router, UI helpers, kids lock, service worker. */
(function () {
  'use strict';
  const DB = (window.DB = { routes: {}, acts: {}, changes: {}, inputs: {}, mounts: [], tickers: [], hooks: {} });

  /* ---------- helpers ---------- */
  DB.$ = (s, r) => (r || document).querySelector(s);
  DB.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  DB.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  DB.pad = (n) => String(n).padStart(2, '0');
  DB.dateKey = (d) => { d = d || new Date(); return d.getFullYear() + '-' + DB.pad(d.getMonth() + 1) + '-' + DB.pad(d.getDate()); };
  DB.uid = () => Math.random().toString(36).slice(2, 9);

  /* ---------- storage (localStorage; all data stays on this device) ---------- */
  DB.store = {
    get(k, d) { try { const v = localStorage.getItem('dbbd:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('dbbd:' + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem('dbbd:' + k); } catch (e) { /* ignore */ } },
    keys() { const out = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('dbbd:') === 0) out.push(k.slice(5)); } } catch (e) { /* ignore */ } return out; }
  };

  const defaults = { lang: 'bn', fs: 30, showBn: true, showEn: true };
  DB.S = Object.assign({}, defaults, DB.store.get('settings', {}));
  DB.saveSettings = () => DB.store.set('settings', DB.S);

  /* profiles: each profile has its own namespace for tracker, tasbih, bookmarks, reminders */
  DB.profiles = () => { let p = DB.store.get('profiles', null); if (!p || !p.length) { p = [{ id: 'me', name: '', age: 'adult' }]; DB.store.set('profiles', p); } return p; };
  DB.pid = () => { const id = DB.store.get('activeProfile', 'me'); return DB.profiles().some((p) => p.id === id) ? id : DB.profiles()[0].id; };
  DB.profile = () => DB.profiles().find((p) => p.id === DB.pid());
  DB.pget = (k, d) => DB.store.get('p:' + DB.pid() + ':' + k, d);
  DB.pset = (k, v) => DB.store.set('p:' + DB.pid() + ':' + k, v);

  /* ---------- i18n ---------- */
  DB.t = (k) => {
    const d = window.I18N || {};
    return (d[DB.S.lang] && d[DB.S.lang][k]) || (d.en && d.en[k]) || k;
  };
  DB.pick = (o) => (o ? o[DB.S.lang] || o.en || o.bn || '' : '');
  DB.num = (n) => {
    if (n == null || isNaN(n)) return '';
    const loc = DB.S.lang === 'bn' ? 'bn-BD' : DB.S.lang === 'ar' ? 'ar-EG' : 'en-US';
    try { return Number(n).toLocaleString(loc, { useGrouping: false }); } catch (e) { return String(n); }
  };
  DB.num2 = (n) => (Number(n) < 10 ? DB.num(0) : '') + DB.num(n);
  DB.applyLang = () => {
    const l = DB.S.lang;
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.style.setProperty('--fs-ar', DB.S.fs + 'px');
    DB.$$('[data-i18n]').forEach((el) => { el.textContent = DB.t(el.getAttribute('data-i18n')); });
    document.title = DB.t('appName') + ' — DeenBondhu BD';
  };

  /* ---------- icons ---------- */
  const ICONS = {
    home: 'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
    quran: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19a2 2 0 0 1 2-2h13',
    dua: 'M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z',
    clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
    compass: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z',
    tasbih: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    names: 'M12 2l2.6 4.4L20 7l-1.6 5L22 16l-5 .6L14.6 21 12 17.6 9.4 21 7 16.6 2 16l3.6-4L4 7l5.4-.6z',
    guide: 'M5 6h14M5 12h14M5 18h9',
    family: 'M16 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0zM5 20a7 7 0 0 1 14 0',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
    bell: 'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4',
    check: 'M5 12l4 4 10-10',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12h2M3 12h2M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4',
    search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5',
    more: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
    bookmark: 'M6 3h12v18l-6-4-6 4z',
    play: 'M8 5v14l11-7z',
    copy: 'M9 9h11v11H9zM5 15V4h11',
    quiz: 'M9 9a3 3 0 1 1 4 2.8c-.7.4-1 .9-1 1.7M12 17.5h.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z'
  };
  DB.icon = (n, cls) => '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (ICONS[n] || ICONS.more) + '"/></svg>';

  /* ---------- toasts and banners ---------- */
  DB.toast = (msg, opts) => {
    opts = opts || {};
    const box = DB.$('#toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    const span = document.createElement('span');
    span.textContent = msg;
    el.appendChild(span);
    const bar = document.createElement('span');
    (opts.actions || []).concat([{ label: DB.t('dismiss'), fn: null }]).forEach((a) => {
      const b = document.createElement('button');
      b.className = 'btn sm'; b.type = 'button'; b.textContent = a.label;
      b.addEventListener('click', () => { el.remove(); if (a.fn) a.fn(); });
      bar.appendChild(b);
    });
    bar.className = 'row';
    el.appendChild(bar);
    box.appendChild(el);
    if (opts.ms !== 0) setTimeout(() => el.remove(), opts.ms || 5000);
    return el;
  };

  /* ---------- fetch with timeout ---------- */
  DB.fetchJson = async (url, ms) => {
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), ms || 12000);
    try {
      const r = await fetch(url, { signal: ctl.signal });
      if (r.status === 429) { const e = new Error('rate'); e.code = 'rate'; throw e; }
      if (!r.ok) { const e = new Error('http ' + r.status); e.code = 'http'; throw e; }
      return await r.json();
    } catch (e) {
      if (e.name === 'AbortError') { const x = new Error('timeout'); x.code = 'timeout'; throw x; }
      if (!e.code) e.code = navigator.onLine ? 'network' : 'offline';
      throw e;
    } finally { clearTimeout(to); }
  };
  DB.errText = (e) => DB.t('err_' + ((e && e.code) || 'network'));
  DB.errBox = (e, retryAct) =>
    '<div class="notice err" role="alert">' + DB.esc(DB.errText(e)) +
    (retryAct ? '<div style="margin-top:8px"><button class="btn sm" data-act="' + retryAct + '">' + DB.esc(DB.t('retry')) + '</button></div>' : '') + '</div>';
  DB.loading = () => '<div class="spinner" role="status" aria-label="' + DB.esc(DB.t('loading')) + '"></div>';

  /* ---------- kids mode lock ---------- */
  DB.kids = () => Object.assign({ on: false, hash: null, salt: null, extOff: true, allow: [] }, DB.store.get('kids', {}));
  DB.saveKids = (k) => DB.store.set('kids', k);
  DB.hashPin = async (pin, salt) => {
    const data = new TextEncoder().encode(salt + ':' + pin);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  };
  /* External links are rendered only through this helper so Kids Mode can restrict them. */
  DB.ext = (url, label) => {
    if (!/^https:\/\//i.test(url)) return DB.esc(label);
    const k = DB.kids();
    if (k.on) {
      const ok = !k.extOff && k.allow.some((u) => u === url);
      if (!ok) return '<span class="muted" title="' + DB.esc(DB.t('kids_blocked')) + '">' + DB.esc(label) + ' 🔒</span>';
    }
    return '<a href="' + DB.esc(url) + '" target="_blank" rel="noopener noreferrer">' + DB.esc(label) + '</a>';
  };

  /* ---------- navigation ---------- */
  const NAV_MAIN = [['home', 'home', 'nav_home'], ['quran', 'quran', 'nav_quran'], ['duas', 'dua', 'nav_duas'], ['prayer', 'clock', 'nav_prayer'], ['more', 'more', 'nav_more']];
  const NAV_KIDS = [['home', 'home', 'nav_home'], ['quran', 'quran', 'nav_quran'], ['quiz', 'quiz', 'nav_quiz'], ['tasbih', 'tasbih', 'nav_tasbih']];
  const KIDS_ALLOWED = ['home', 'quran', 'quiz', 'tasbih', 'names', 'exitkids'];
  DB.renderNav = (current) => {
    const kids = DB.kids().on;
    const list = kids ? NAV_KIDS : NAV_MAIN;
    DB.$('#nav').innerHTML = list.map((n) => '<a href="#/' + n[0] + '"' + (n[0] === current ? ' aria-current="page"' : '') + '>' + DB.icon(n[1]) + '<span>' + DB.esc(DB.t(n[2])) + '</span></a>').join('');
    document.documentElement.classList.toggle('kids', kids);
    DB.$('#searchBtn').innerHTML = DB.icon('search');
    DB.$('#settingsBtn').innerHTML = DB.icon('gear');
    DB.$('#searchBtn').setAttribute('aria-label', DB.t('search'));
    DB.$('#settingsBtn').setAttribute('aria-label', DB.t('nav_settings'));
    DB.$('#searchBtn').hidden = kids; DB.$('#settingsBtn').hidden = kids;
  };
  DB.parseHash = () => {
    const h = (location.hash || '#/home').replace(/^#\/?/, '');
    const qi = h.indexOf('?');
    const path = qi >= 0 ? h.slice(0, qi) : h;
    const q = {};
    if (qi >= 0) new URLSearchParams(h.slice(qi + 1)).forEach((v, k) => { q[k] = v; });
    const parts = path.split('/').filter(Boolean);
    return { name: parts[0] || 'home', params: parts.slice(1).map(decodeURIComponent), q };
  };
  DB.go = (h) => { location.hash = h; };

  let renderSeq = 0;
  DB.render = async () => {
    const seq = ++renderSeq;
    DB.mounts = [];
    let { name, params, q } = DB.parseHash();
    if (DB.kids().on && KIDS_ALLOWED.indexOf(name) < 0) { name = 'home'; params = []; q = {}; }
    const fn = DB.routes[name] || DB.routes.home;
    const view = DB.$('#view');
    DB.applyLang();
    DB.renderNav(name);
    view.innerHTML = DB.loading();
    let html;
    try { html = await fn(params, q); } catch (e) { html = DB.errBox(e); }
    if (seq !== renderSeq) return;
    view.innerHTML = html;
    DB.mounts.forEach((m) => { try { m(); } catch (e) { console.error(e); } });
    if (!q.a) window.scrollTo(0, 0);
    view.focus({ preventScroll: true });
  };
  DB.onMount = (fn) => DB.mounts.push(fn);
  window.addEventListener('hashchange', DB.render);

  /* ---------- delegated events ---------- */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const fn = DB.acts[el.getAttribute('data-act')];
    if (fn) { if (el.tagName === 'A' && !el.getAttribute('href')) e.preventDefault(); fn(el, e); }
  });
  document.addEventListener('change', (e) => { const el = e.target.closest('[data-change]'); if (el && DB.changes[el.getAttribute('data-change')]) DB.changes[el.getAttribute('data-change')](el, e); });
  document.addEventListener('input', (e) => { const el = e.target.closest('[data-input]'); if (el && DB.inputs[el.getAttribute('data-input')]) DB.inputs[el.getAttribute('data-input')](el, e); });
  document.addEventListener('submit', (e) => { const f = e.target.closest('[data-submit]'); if (f) { e.preventDefault(); const fn = DB.acts[f.getAttribute('data-submit')]; if (fn) fn(f, e); } });

  /* ---------- audio unlock (never autoplay before a user gesture) ---------- */
  DB.audioUnlocked = false;
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => document.addEventListener(ev, () => { DB.audioUnlocked = true; }, { once: true, passive: true }));

  /* ---------- online/offline + service worker ---------- */
  DB.updateOnline = () => {
    const p = DB.$('#offlinePill');
    p.hidden = navigator.onLine;
    p.textContent = DB.t('offline');
  };
  window.addEventListener('online', () => { DB.updateOnline(); if (DB.hooks.online) DB.hooks.online(); });
  window.addEventListener('offline', DB.updateOnline);

  DB.registerSW = () => {
    if (!('serviceWorker' in navigator)) return;
    if (!(location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) return; // SW requires a secure context
    navigator.serviceWorker.register('sw.js').then((reg) => {
      const showUpdate = (w) => {
        const b = DB.$('#banners');
        b.innerHTML = '<div class="notice ok">' + DB.esc(DB.t('update_ready')) + ' <button class="btn sm" id="swReload">' + DB.esc(DB.t('reload')) + '</button></div>';
        DB.$('#swReload').addEventListener('click', () => w.postMessage({ type: 'SKIP_WAITING' }));
      };
      if (reg.waiting && navigator.serviceWorker.controller) showUpdate(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => { if (nw.state === 'installed' && navigator.serviceWorker.controller) showUpdate(nw); });
      });
    }).catch((e) => console.warn('SW registration failed', e));
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloaded) return; reloaded = true; location.reload(); });
  };

  /* ---------- shared tickers (1s) ---------- */
  setInterval(() => { DB.tickers.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } }); }, 1000);

  /* ---------- common actions ---------- */
  DB.acts.reload = () => DB.render();
  DB.copyText = async (text) => {
    try { await navigator.clipboard.writeText(text); DB.toast(DB.t('copied')); }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); DB.toast(DB.t('copied')); } catch (x) { DB.toast(DB.t('copy_failed')); }
      ta.remove();
    }
  };
  DB.share = async (text, title) => {
    if (navigator.share) { try { await navigator.share({ title: title || 'DeenBondhu BD', text }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    DB.copyText(text);
  };
  DB.download = (name, text, type) => {
    const blob = new Blob([text], { type: type || 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
  DB.page = (title, body, back) =>
    '<div class="row between" style="margin-bottom:8px"><h1 style="margin:0">' + DB.esc(title) + '</h1>' +
    (back ? '<a class="btn sm ghost" href="' + back + '">← ' + DB.esc(DB.t('back')) + '</a>' : '') + '</div>' + body;
})();
