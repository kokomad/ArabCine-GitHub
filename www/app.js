/* السينما موبايل - ArabCine
 * تطبيق Capacitor: بث مباشر + أفلام + مسلسلات + مشغّل متقدم.
 * المطوّر: khader abo salha - mankhader@gmail.com
 */
(function () {
  'use strict';

  var APP_VERSION = '1.0.0';
  var DEV_NAME = 'khader abo salha';
  var DEV_MAIL = 'mankhader@gmail.com';
  var ARA_LIST_URL = 'https://iptv-org.github.io/iptv/languages/ara.m3u';

  /* ---------- أدوات ---------- */
  function $(s) { return document.querySelector(s); }
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function hash(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }
  function fmt(t) {
    if (!isFinite(t) || t < 0) t = 0;
    var h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = Math.floor(t % 60);
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return h ? h + ':' + p(m) + ':' + p(s) : p(m) + ':' + p(s);
  }
  var toastT;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove('on'); }, 2600);
  }
  function copyText(txt) {
    var done = function () { toast('تم نسخ الرابط'); };
    var fallback = function () {
      try {
        var ta = document.createElement('textarea');
        ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy');
        document.body.removeChild(ta); done();
      } catch (e) { toast('تعذّر النسخ'); }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done, fallback);
    } else fallback();
  }

  /* ---------- الأيقونات ---------- */
  var IC = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
    live: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 010 8.4M7.8 16.2a6 6 0 010-8.4M19 5a10 10 0 010 14M5 19a10 10 0 010-14"/>',
    film: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M3 12h4M3 16h4M17 8h4M17 12h4M17 16h4"/>',
    series: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 3l4 4 4-4"/>',
    settings: '<path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    star: '<path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9z"/>',
    play: '<path d="M7 4v16l13-8z" fill="currentColor"/>',
    pause: '<path d="M7 4h4v16H7zM13 4h4v16h-4z" fill="currentColor"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    next: '<path d="M6 5l9 7-9 7z" fill="currentColor"/><path d="M19 5v14"/>',
    prev: '<path d="M18 5l-9 7 9 7z" fill="currentColor"/><path d="M5 5v14"/>',
    vol: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/>',
    mute: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    aspect: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10v4M17 10v4"/>',
    pip: '<rect x="3" y="5" width="18" height="14" rx="2"/><rect x="12" y="12" width="7" height="5" rx="1" fill="currentColor"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h9"/>',
    share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6"/>',
    refresh: '<path d="M20 11a8 8 0 10-2.3 5.7"/><path d="M20 4v7h-7"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    file: '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>'
  };
  function ic(n, s, fill) {
    return '<svg viewBox="0 0 24 24" width="' + (s || 22) + '" height="' + (s || 22) + '" fill="' + (fill || 'none') +
      '" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + (IC[n] || '') + '</svg>';
  }

  /* ---------- الحالة والبيانات ---------- */
  var SAT = { nilesat: 'نايل سات', arabsat: 'عرب سات', eu: 'أوروبا' };
  var CAT = { news: 'أخبار', sports: 'رياضة', religious: 'دينية', kids: 'أطفال', music: 'موسيقى', general: 'عامة' };

  var S = {
    tab: 'home', q: '', sat: 'all', cat: 'all',
    limit: { live: 120, movie: 90, series: 90 },
    settings: LS.get('ac_set', { mode: 'auto' }),
    fav: LS.get('ac_fav', []),
    hist: LS.get('ac_hist', []),
    lists: LS.get('ac_lists', [])
  };
  var ITEMS = [], MAP = {};

  function buildItems() {
    var D = window.ARABCINE_DATA || { channels: [], movies: [], series: [] };
    ITEMS = [];
    (D.channels || []).forEach(function (c) {
      ITEMS.push({ key: 'live:' + c.id, type: 'live', name: c.name, logo: c.logo || '', cat: c.cat || 'general',
        sat: c.sat || [], streams: c.streams || [], src: 'built' });
    });
    (D.movies || []).forEach(function (m) {
      ITEMS.push({ key: 'movie:' + m.id, type: 'movie', name: m.title, year: m.year, desc: m.desc || '',
        logo: m.poster || '', streams: [m.url], src: 'built', sat: [], cat: 'movie' });
    });
    (D.series || []).forEach(function (m) {
      ITEMS.push({ key: 'series:' + m.id, type: 'series', name: m.title, year: m.year, desc: m.desc || '',
        logo: m.poster || '', streams: [m.url], src: 'built', sat: [], cat: 'series' });
    });
    S.lists.forEach(function (l) {
      if (!l.on) return;
      (LS.get('ac_c_' + l.id, []) || []).forEach(function (it) { ITEMS.push(it); });
    });
    MAP = {};
    ITEMS.forEach(function (it) { MAP[it.key] = it; });
  }

  /* ---------- قراءة قوائم M3U ---------- */
  function classify(group, name) {
    var g = (group + ' ' + name).toLowerCase();
    if (/(movie|film|cinema|vod|فيلم|أفلام|افلام|سينما)/.test(g)) return 'movie';
    if (/(series|مسلسل|episode|حلقة|حلقات)/.test(g)) return 'series';
    return 'live';
  }
  function guessCat(group, name) {
    var g = (group + ' ' + name).toLowerCase();
    if (/(news|أخبار|اخبار|إخبار)/.test(g)) return 'news';
    if (/(sport|رياض|كأس|دوري)/.test(g)) return 'sports';
    if (/(relig|quran|islam|قرآن|قران|دين|سنة)/.test(g)) return 'religious';
    if (/(kids|child|cartoon|أطفال|اطفال|كرتون)/.test(g)) return 'kids';
    if (/(music|موسيق|أغاني|اغاني|clip|كليب)/.test(g)) return 'music';
    return 'general';
  }
  function parseM3U(text, listId) {
    var out = [], seen = {}, meta = null;
    var lines = String(text).split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i].trim();
      if (!l) continue;
      if (l.indexOf('#EXTINF') === 0) {
        var ci = l.lastIndexOf(',');
        var attr = function (k) {
          var m = l.match(new RegExp(k + '="([^"]*)"', 'i'));
          return m ? m[1] : '';
        };
        meta = { name: (ci >= 0 ? l.slice(ci + 1) : '').trim() || attr('tvg-name'), logo: attr('tvg-logo'), group: attr('group-title') };
      } else if (l.charAt(0) === '#') {
        continue;
      } else if (/^https?:\/\//i.test(l)) {
        if (seen[l]) { meta = null; continue; }
        seen[l] = 1;
        var mt = meta || { name: l, logo: '', group: '' };
        var type = classify(mt.group, mt.name);
        out.push({
          key: type + ':r' + listId + hash(l), type: type, name: mt.name || l, logo: mt.logo, group: mt.group,
          cat: type === 'live' ? guessCat(mt.group, mt.name) : type, sat: [], streams: [l], src: listId,
          year: '', desc: mt.group ? 'المجموعة: ' + mt.group : ''
        });
        meta = null;
      }
    }
    return out;
  }
  function withTimeout(p, ms) {
    return new Promise(function (res, rej) {
      var t = setTimeout(function () { rej(new Error('timeout')); }, ms);
      p.then(function (v) { clearTimeout(t); res(v); }, function (e) { clearTimeout(t); rej(e); });
    });
  }
  function fetchList(l) {
    return withTimeout(fetch(l.url, { cache: 'no-store' }), 25000).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    }).then(function (t) {
      var items = parseM3U(t, l.id);
      if (!items.length) throw new Error('empty');
      LS.set('ac_c_' + l.id, items);
      l.count = items.length; l.ts = Date.now();
      saveLists();
      return items.length;
    });
  }
  function saveLists() { LS.set('ac_lists', S.lists); }
  function addList(name, url, text) {
    var id = hash((url || 'local') + Date.now());
    var l = { id: id, name: name || 'قائمتي', url: url || '', on: true, count: 0, ts: 0 };
    S.lists.push(l);
    saveLists();
    if (text != null) {
      var items = parseM3U(text, id);
      if (!items.length) { S.lists.pop(); saveLists(); toast('لم يتم العثور على روابط صالحة في النص'); return Promise.resolve(false); }
      LS.set('ac_c_' + id, items); l.count = items.length; l.ts = Date.now(); saveLists();
      buildItems(); render();
      toast('تمت إضافة ' + items.length + ' عنصر');
      return Promise.resolve(true);
    }
    toast('جارٍ تحميل القائمة...');
    return fetchList(l).then(function (n) {
      buildItems(); render(); toast('تمت إضافة ' + n + ' عنصر');
      return true;
    }).catch(function () {
      S.lists = S.lists.filter(function (x) { return x.id !== id; }); saveLists();
      toast('تعذّر تحميل القائمة. تأكد من الرابط والاتصال');
      return false;
    });
  }
  function refreshAll(silent) {
    var ls = S.lists.filter(function (l) { return l.url && l.on; });
    if (!ls.length) { if (!silent) toast('لا توجد قوائم للتحديث'); return Promise.resolve(); }
    if (!silent) toast('جارٍ تحديث القوائم...');
    return Promise.all(ls.map(function (l) { return fetchList(l).then(function () { return 1; }, function () { return 0; }); }))
      .then(function (r) {
        var ok = r.reduce(function (a, b) { return a + b; }, 0);
        buildItems(); render();
        if (!silent) toast(ok === ls.length ? 'تم التحديث' : 'تم تحديث ' + ok + ' من ' + ls.length);
      });
  }

  /* ---------- المفضلة والسجل ---------- */
  function isFav(k) { return S.fav.indexOf(k) >= 0; }
  function toggleFav(k) {
    var i = S.fav.indexOf(k);
    if (i >= 0) S.fav.splice(i, 1); else S.fav.unshift(k);
    LS.set('ac_fav', S.fav);
    toast(i >= 0 ? 'أُزيلت من المفضلة' : 'أُضيفت إلى المفضلة');
  }
  function addHist(k) {
    S.hist = [k].concat(S.hist.filter(function (x) { return x !== k; })).slice(0, 24);
    LS.set('ac_hist', S.hist);
  }

  /* ---------- مكونات العرض ---------- */
  function hue(s) { return parseInt(hash(s), 36) % 360; }
  function avatar(it) {
    var nm = String(it.name).replace(/^[^\p{L}\p{N}]+/u, '');
    if (/^ال.{2,}/.test(nm)) nm = nm.slice(2);
    var ch = nm.charAt(0) || '•';
    return '<div class="av" style="background:hsl(' + hue(it.name) + ' 42% 30%)"><span>' + esc(ch) + '</span>' +
      (it.logo ? '<img src="' + esc(it.logo) + '" loading="lazy" alt="" onerror="this.remove()">' : '') + '</div>';
  }
  function liveCard(it) {
    var f = isFav(it.key);
    var tags = (it.sat || []).slice(0, 2).map(function (s) { return SAT[s]; }).filter(Boolean).join(' • ');
    return '<div class="ch" data-play="' + esc(it.key) + '" role="button" tabindex="0">' +
      '<button class="fav' + (f ? ' on' : '') + '" data-fav="' + esc(it.key) + '" aria-label="المفضلة">' + ic('star', 17, f ? 'currentColor' : 'none') + '</button>' +
      avatar(it) +
      '<div class="ch-n">' + esc(it.name) + '</div>' +
      '<div class="ch-m"><span class="live"><i></i>مباشر</span>' + (tags ? '<span>' + esc(tags) + '</span>' : '') + '</div></div>';
  }
  function vodCard(it) {
    var h = hue(it.name);
    return '<div class="mv" data-play="' + esc(it.key) + '" role="button" tabindex="0">' +
      '<div class="pst" style="background:linear-gradient(160deg,hsl(' + h + ' 45% 34%),hsl(' + ((h + 40) % 360) + ' 50% 16%))">' +
      '<span class="big">' + esc(String(it.name).charAt(0)) + '</span>' +
      (it.logo ? '<img src="' + esc(it.logo) + '" loading="lazy" alt="" onerror="this.remove()">' : '') + '</div>' +
      '<div class="mv-t">' + esc(it.name) + '</div>' + (it.year ? '<div class="mv-y">' + esc(it.year) + '</div>' : '') + '</div>';
  }
  function card(it) { return it.type === 'live' ? liveCard(it) : vodCard(it); }
  function rowSec(title, items, more) {
    if (!items.length) return '';
    return '<section class="sec"><div class="sec-h"><h2>' + esc(title) + '</h2>' +
      (more ? '<button class="more" ' + more + '>عرض الكل</button>' : '') + '</div><div class="row">' +
      items.slice(0, 14).map(card).join('') + '</div></section>';
  }
  function chips(list, cur, attr) {
    return list.map(function (c) {
      return '<button class="chip' + (c[0] === cur ? ' on' : '') + '" ' + attr + '="' + esc(c[0]) + '">' + esc(c[1]) + '</button>';
    }).join('');
  }
  function emptyBox(title, text, btn) {
    return '<div class="empty"><b>' + esc(title) + '</b>' + esc(text) + (btn || '') + '</div>';
  }
  function ofType(t) { return ITEMS.filter(function (i) { return i.type === t; }); }
  function hasAra() { return S.lists.some(function (l) { return l.url === ARA_LIST_URL; }); }

  /* ---------- الشاشات ---------- */
  function viewHome() {
    var hist = S.hist.map(function (k) { return MAP[k]; }).filter(Boolean);
    var favs = S.fav.map(function (k) { return MAP[k]; }).filter(Boolean);
    var live = ofType('live');
    var last = hist[0];
    var hero = last
      ? '<small>تابع المشاهدة</small><h1>' + esc(last.name) + '</h1><div class="hero-b"><button class="btn pri" data-play="' + esc(last.key) + '">' + ic('play', 18, 'currentColor') + 'تشغيل</button></div>'
      : '<small>أهلاً بك في السينما موبايل</small><h1>قنوات عربية وأفلام<br>في جيبك</h1><div class="hero-b"><button class="btn pri" data-tab="live">تصفّح القنوات</button></div>';
    var h = '<div class="hero"><div class="hero-in">' + hero + '</div></div>';
    h += rowSec('شاهدتَ مؤخراً', hist.slice(1), '');
    h += rowSec('المفضلة', favs, '');
    ['nilesat', 'arabsat', 'eu'].forEach(function (s) {
      var title = s === 'eu' ? 'قنوات موجّهة لأوروبا' : 'قنوات ' + SAT[s];
      h += rowSec(title, live.filter(function (i) { return i.sat.indexOf(s) >= 0; }), 'data-go="live" data-sat="' + s + '"');
    });
    h += rowSec('أفلام مميزة', ofType('movie'), 'data-tab="movie"');
    var ser = ofType('series');
    h += ser.length ? rowSec('مسلسلات', ser, 'data-tab="series"') :
      '<section class="sec"><div class="sec-h"><h2>مسلسلات</h2></div>' +
      emptyBox('لا توجد مسلسلات بعد', 'أضف قائمة M3U تحتوي على مسلسلات لتظهر هنا.', '<br><button class="btn pri sm" data-tab="settings">إضافة قائمة</button>') + '</section>';
    return h;
  }

  function liveFiltered() {
    return ofType('live').filter(function (i) {
      if (S.sat !== 'all' && i.sat.indexOf(S.sat) < 0) return false;
      if (S.cat !== 'all' && i.cat !== S.cat) return false;
      return true;
    });
  }
  function viewLive() {
    var all = ofType('live');
    var sats = [['all', 'كل الأقمار']].concat(Object.keys(SAT).filter(function (s) {
      return all.some(function (i) { return i.sat.indexOf(s) >= 0; });
    }).map(function (s) { return [s, SAT[s]]; }));
    var bySat = all.filter(function (i) { return S.sat === 'all' || i.sat.indexOf(S.sat) >= 0; });
    var cats = [['all', 'الكل']].concat(Object.keys(CAT).filter(function (c) {
      return bySat.some(function (i) { return i.cat === c; });
    }).map(function (c) { return [c, CAT[c]]; }));
    if (!cats.some(function (c) { return c[0] === S.cat; })) S.cat = 'all';
    var list = liveFiltered();
    var h = '<div class="chips">' + chips(sats, S.sat, 'data-chip-sat') + '</div>' +
      '<div class="chips sm">' + chips(cats, S.cat, 'data-chip-cat') + '</div>';
    if (!hasAra()) {
      h += '<div class="act-row"><button class="btn sec sm" data-act="addara">' + ic('globe', 16) + 'إضافة قنوات عربية من الإنترنت</button></div>';
    } else {
      h += '<div class="act-row"><button class="btn sec sm" data-act="refresh">' + ic('refresh', 16) + 'تحديث القنوات</button></div>';
    }
    if (!list.length) return h + emptyBox('لا توجد قنوات', 'جرّب تغيير الفلتر أو أضف قائمة قنوات من الإعدادات.');
    h += '<div class="grid">' + list.slice(0, S.limit.live).map(liveCard).join('') + '</div>';
    if (list.length > S.limit.live) h += '<button class="btn sec more-btn" data-act="more" data-arg="live">عرض المزيد (' + (list.length - S.limit.live) + ')</button>';
    return h;
  }

  function viewVod(type) {
    var list = ofType(type);
    var name = type === 'movie' ? 'أفلام' : 'مسلسلات';
    if (!list.length) {
      return emptyBox('لا توجد ' + name + ' بعد',
        'التطبيق مشغّل ولا يحتوي على محتوى مرخّص. أضف قائمة M3U للمحتوى الذي تملك حق مشاهدته وسيظهر هنا تلقائياً.',
        '<br><button class="btn pri" data-tab="settings">إضافة قائمة</button>');
    }
    var h = '<div class="grid mv-g" style="padding-top:12px">' + list.slice(0, S.limit[type]).map(vodCard).join('') + '</div>';
    if (list.length > S.limit[type]) h += '<button class="btn sec more-btn" data-act="more" data-arg="' + type + '">عرض المزيد</button>';
    return h;
  }

  function viewSearch() {
    var q = S.q.trim().toLowerCase();
    var res = ITEMS.filter(function (i) { return String(i.name).toLowerCase().indexOf(q) >= 0; });
    if (!res.length) return emptyBox('لا توجد نتائج', 'لم نجد "' + q + '". جرّب كلمة أخرى.');
    var h = '';
    [['live', 'قنوات مباشرة'], ['movie', 'أفلام'], ['series', 'مسلسلات']].forEach(function (g) {
      var r = res.filter(function (i) { return i.type === g[0]; });
      if (!r.length) return;
      h += '<section class="sec"><div class="sec-h"><h2>' + g[1] + ' (' + r.length + ')</h2></div><div class="' + (g[0] === 'live' ? 'grid' : 'grid mv-g') + '">' +
        r.slice(0, 60).map(card).join('') + '</div></section>';
    });
    return h;
  }

  function viewSettings() {
    var mode = S.settings.mode || 'auto';
    var h = '<div style="height:12px"></div>';
    h += '<div class="set"><div class="set-h">مصادر القنوات والأفلام</div>';
    S.lists.forEach(function (l) {
      h += '<div class="srow"><div class="grow"><div>' + esc(l.name) + ' <span style="color:var(--mu);font-size:12px">(' + (l.count || 0) + ')</span></div>' +
        (l.url ? '<small>' + esc(l.url) + '</small>' : '<small style="direction:rtl">قائمة محلية</small>') + '</div>' +
        '<button class="sw' + (l.on ? ' on' : '') + '" data-act="togglelist" data-arg="' + l.id + '" aria-label="تفعيل"></button>' +
        '<button class="ico" style="background:none;border:0" data-act="dellist" data-arg="' + l.id + '" aria-label="حذف">' + ic('trash', 19) + '</button></div>';
    });
    h += '<button class="srow" data-act="addlist"><span class="ico">' + ic('plus', 20) + '</span><span class="grow">إضافة قائمة M3U (رابط)</span></button>' +
      '<button class="srow" data-act="paste"><span class="ico">' + ic('file', 20) + '</span><span class="grow">لصق نص M3U أو استيراد ملف</span></button>' +
      (hasAra() ? '' : '<button class="srow" data-act="addara"><span class="ico">' + ic('globe', 20) + '</span><span class="grow">إضافة القنوات العربية العامة<small style="direction:rtl;text-align:start">من مشروع iptv-org المفتوح، تتحدّث باستمرار</small></span></button>') +
      '<button class="srow" data-act="refresh"><span class="ico">' + ic('refresh', 20) + '</span><span class="grow">تحديث كل القوائم الآن</span></button></div>';

    h += '<div class="set"><div class="set-h">المشغّل</div><div class="srow" style="border-top:0"><span class="grow">محرّك التشغيل</span></div>' +
      '<div class="seg">' + [['auto', 'تلقائي'], ['native', 'المدمج'], ['hls', 'HLS.js']].map(function (m) {
        return '<button class="' + (mode === m[0] ? 'on' : '') + '" data-act="mode" data-arg="' + m[0] + '">' + m[1] + '</button>';
      }).join('') + '</div>' +
      '<div class="note">إذا لم تعمل قناة معيّنة، جرّب تغيير المحرّك. يمكنك أيضاً فتح أي بث في VLC أو MX Player من زر المشغّل الخارجي داخل شاشة التشغيل.</div></div>';

    h += '<div class="set"><div class="set-h">البيانات</div>' +
      '<button class="srow" data-act="clearhist"><span class="ico">' + ic('trash', 20) + '</span><span class="grow">مسح سجل المشاهدة</span></button>' +
      '<button class="srow" data-act="clearfav"><span class="ico">' + ic('star', 20) + '</span><span class="grow">مسح المفضلة</span></button></div>';

    h += '<div class="set"><div class="set-h">حول التطبيق</div>' +
      '<div class="srow" style="border-top:0"><span class="grow">السينما موبايل<small style="direction:rtl;text-align:start">الإصدار ' + APP_VERSION + '</small></span></div>' +
      '<button class="srow" data-act="mail"><span class="ico">' + ic('mail', 20) + '</span><span class="grow">تواصل مع المطوّر<small>' + esc(DEV_MAIL) + '</small></span></button>' +
      '<button class="srow" data-act="share"><span class="ico">' + ic('share', 20) + '</span><span class="grow">مشاركة التطبيق</span></button></div>';

    h += '<div class="about">تطوير: ' + esc(DEV_NAME) + '<br>التطبيق مشغّل فقط ولا يستضيف أي محتوى. المسؤولية عن المحتوى المضاف تقع على مصدره.</div>';
    return h;
  }

  /* ---------- العرض الرئيسي ---------- */
  var lastTab = null;
  function render() {
    var v = $('#view');
    var q = S.q.trim();
    var keep = v.scrollTop;
    var html;
    if (q) html = viewSearch();
    else if (S.tab === 'home') html = viewHome();
    else if (S.tab === 'live') html = viewLive();
    else if (S.tab === 'movie') html = viewVod('movie');
    else if (S.tab === 'series') html = viewVod('series');
    else html = viewSettings();
    v.innerHTML = html;
    v.scrollTop = (lastTab === S.tab) ? keep : 0;
    lastTab = S.tab;
    var tabs = [['home', 'الرئيسية', 'home'], ['live', 'مباشر', 'live'], ['movie', 'أفلام', 'film'], ['series', 'مسلسلات', 'series'], ['settings', 'الإعدادات', 'settings']];
    $('#nav').innerHTML = tabs.map(function (t) {
      return '<button class="' + (!q && S.tab === t[0] ? 'on' : '') + '" data-tab="' + t[0] + '">' + ic(t[2], 23) + '<span>' + t[1] + '</span></button>';
    }).join('');
  }
  function goTab(t) {
    S.tab = t;
    if (S.q) { S.q = ''; $('#q').value = ''; $('#q-clear').hidden = true; }
    render();
  }

  /* ---------- النوافذ السفلية ---------- */
  function openSheet(html) { $('#sheet-box').innerHTML = html; $('#sheet').classList.add('open'); }
  function closeSheet() { $('#sheet').classList.remove('open'); }
  function sheetOpen() { return $('#sheet').classList.contains('open'); }

  function openDetail(it) {
    var h = hue(it.name);
    var f = isFav(it.key);
    openSheet('<div class="det"><div class="pst" style="background:linear-gradient(160deg,hsl(' + h + ' 45% 34%),hsl(' + ((h + 40) % 360) + ' 50% 16%))">' +
      '<span class="big">' + esc(String(it.name).charAt(0)) + '</span>' + (it.logo ? '<img src="' + esc(it.logo) + '" alt="" onerror="this.remove()">' : '') + '</div>' +
      '<div><h3>' + esc(it.name) + '</h3><div class="mv-y">' + esc(it.year || '') + '</div><p>' + esc(it.desc || 'لا يوجد وصف.') + '</p></div></div>' +
      '<div class="sheet-b"><button class="btn pri" data-act="playsheet" data-arg="' + esc(it.key) + '">' + ic('play', 18, 'currentColor') + 'تشغيل</button>' +
      '<button class="btn sec" data-act="favsheet" data-arg="' + esc(it.key) + '">' + ic('star', 18, f ? 'currentColor' : 'none') + (f ? 'في المفضلة' : 'إضافة للمفضلة') + '</button></div>');
  }
  function sheetAddList() {
    openSheet('<h3>إضافة قائمة M3U</h3><label class="lbl">الاسم</label><input class="inp" id="f-name" placeholder="مثال: قنواتي" maxlength="40">' +
      '<label class="lbl">رابط القائمة</label><input class="inp" id="f-url" placeholder="https://example.com/list.m3u" dir="ltr" inputmode="url" autocapitalize="off">' +
      '<div class="sheet-b"><button class="btn pri" data-act="savelist">إضافة</button><button class="btn sec" data-act="closesheet">إلغاء</button></div>');
  }
  function sheetPaste() {
    openSheet('<h3>لصق أو استيراد ملف</h3><label class="lbl">الاسم</label><input class="inp" id="f-name" placeholder="مثال: أفلامي" maxlength="40">' +
      '<label class="lbl">محتوى M3U</label><textarea class="inp" id="f-text" placeholder="#EXTM3U&#10;#EXTINF:-1,اسم القناة&#10;https://..."></textarea>' +
      '<input type="file" id="f-file" accept=".m3u,.m3u8,.txt,audio/x-mpegurl,application/vnd.apple.mpegurl,text/plain" hidden>' +
      '<div class="sheet-b"><button class="btn sec" data-act="pickfile">' + ic('file', 18) + 'اختيار ملف</button><button class="btn pri" data-act="savetext">إضافة</button></div>');
    $('#f-file').addEventListener('change', function () {
      var f = this.files && this.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () { $('#f-text').value = String(r.result || ''); if (!$('#f-name').value) $('#f-name').value = f.name.replace(/\.[^.]+$/, ''); };
      r.readAsText(f);
    });
  }

  /* ---------- المشغّل ---------- */
  var V = $('#vid'), PLY = $('#player');
  var PL = {
    active: false, item: null, list: [], plan: [], pi: 0, si: 0, engine: '', hls: null, tok: 0, timers: {},
    live: true, played: false, dragging: false, speedI: 0, fitI: 0, rot: false, stalls: 0, netRetry: 0, mediaTried: false, uiT: null
  };
  var SPEEDS = [1, 1.25, 1.5, 2, 0.75];
  var FITS = [['contain', 'ملاءمة'], ['cover', 'ملء'], ['fill', 'تمديد']];

  var hlsP = null;
  function ensureHls() {
    if (window.Hls) return Promise.resolve();
    if (hlsP) return hlsP;
    hlsP = new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = 'vendor/hls.min.js';
      s.onload = res;
      s.onerror = function () { hlsP = null; rej(new Error('hls')); };
      document.head.appendChild(s);
    });
    return hlsP;
  }
  function isHlsUrl(u) { return /m3u8/i.test(u); }
  function buildPlan(item) {
    var plan = [], mode = S.settings.mode || 'auto';
    var nat = !!V.canPlayType('application/vnd.apple.mpegurl');
    item.streams.forEach(function (u, i) {
      if (!isHlsUrl(u)) { plan.push({ si: i, eng: 'native' }); return; }
      if (mode === 'native') plan.push({ si: i, eng: 'native' });
      else if (mode === 'hls') plan.push({ si: i, eng: 'hls' });
      else { if (nat) plan.push({ si: i, eng: 'native' }); plan.push({ si: i, eng: 'hls' }); }
    });
    return plan;
  }
  function clearTimers() { Object.keys(PL.timers).forEach(function (k) { clearTimeout(PL.timers[k]); }); PL.timers = {}; }
  function cleanupEngine() {
    if (PL.hls) { try { PL.hls.destroy(); } catch (e) { /* ignore */ } PL.hls = null; }
    try { V.pause(); } catch (e) { /* ignore */ }
    V.removeAttribute('src');
    try { V.load(); } catch (e) { /* ignore */ }
    $('#pb-q').hidden = true;
  }
  function spin(on) { $('#pspin').hidden = !on; }
  function showErr(msg) { spin(false); $('#perr-t').textContent = msg; $('#perr').hidden = false; showUI(true); }
  function hideErr() { $('#perr').hidden = true; }
  function setPlayIcon() { $('#pb-play').innerHTML = ic(V.paused ? 'play' : 'pause', 34, 'currentColor'); }
  function setSub() {
    var it = PL.item; if (!it) return;
    var parts = [];
    if (it.streams.length > 1) parts.push('المصدر ' + (PL.si + 1) + '/' + it.streams.length);
    if (PL.engine) parts.push(PL.engine === 'hls' ? 'HLS.js' : 'مشغّل مدمج');
    $('#p-sub').textContent = parts.join(' • ');
  }
  function setLiveMode() {
    var live = PL.item.type === 'live' || V.duration === Infinity;
    PL.live = live;
    PLY.classList.toggle('is-live', live);
    PLY.classList.toggle('is-vod', !live);
    $('#pb-prev').hidden = $('#pb-next').hidden = !(PL.list.length > 1 && PL.item.type === 'live');
  }
  function play() {
    var p = V.play();
    if (p && p.catch) p.catch(function () { spin(false); showUI(true); });
  }
  function runStep() {
    clearTimers();
    cleanupEngine();
    if (PL.pi >= PL.plan.length) { showErr('تعذّر تشغيل هذا البث. قد يكون الرابط متوقفاً حالياً أو غير متاح في منطقتك. جرّب فتحه في مشغّل خارجي.'); return; }
    var st = PL.plan[PL.pi];
    PL.si = st.si; PL.engine = st.eng; PL.netRetry = 0; PL.mediaTried = false;
    var url = PL.item.streams[st.si];
    hideErr(); spin(true); setSub(); setLiveMode();
    var tok = ++PL.tok;
    PL.timers.load = setTimeout(function () { if (PL.tok === tok) failStep(); }, st.eng === 'hls' ? 20000 : (isHlsUrl(url) ? 10000 : 30000));
    if (st.eng === 'native') {
      V.src = url; V.load(); play();
      return;
    }
    ensureHls().then(function () {
      if (PL.tok !== tok) return;
      if (!window.Hls || !window.Hls.isSupported()) { failStep(); return; }
      var h = new window.Hls({ maxBufferLength: 30, enableWorker: true, manifestLoadingMaxRetry: 2, levelLoadingMaxRetry: 3, fragLoadingMaxRetry: 4 });
      PL.hls = h;
      h.on(window.Hls.Events.MANIFEST_PARSED, function () { buildQuality(); play(); });
      h.on(window.Hls.Events.ERROR, function (ev, d) {
        if (PL.tok !== tok || !d || !d.fatal) return;
        if (d.type === window.Hls.ErrorTypes.NETWORK_ERROR && PL.netRetry < 2) { PL.netRetry++; h.startLoad(); }
        else if (d.type === window.Hls.ErrorTypes.MEDIA_ERROR && !PL.mediaTried) { PL.mediaTried = true; h.recoverMediaError(); }
        else failStep();
      });
      h.loadSource(url);
      h.attachMedia(V);
    }).catch(function () { if (PL.tok === tok) failStep(); });
  }
  function failStep() {
    if (!PL.active) return;
    PL.pi++;
    if (PL.pi < PL.plan.length) toast('جارٍ تجربة مصدر أو محرّك بديل...');
    runStep();
  }
  function buildQuality() {
    var h = PL.hls;
    $('#pb-q').hidden = !(h && h.levels && h.levels.length > 1);
  }
  function openQuality() {
    var h = PL.hls; if (!h || !h.levels) return;
    var cur = h.currentLevel;
    var html = '<h3>جودة الفيديو</h3><div class="q-list"><button class="' + (cur === -1 ? 'on' : '') + '" data-act="setq" data-arg="-1">تلقائي</button>';
    h.levels.forEach(function (l, i) {
      html += '<button class="' + (cur === i ? 'on' : '') + '" data-act="setq" data-arg="' + i + '">' + (l.height ? l.height + 'p' : Math.round(l.bitrate / 1000) + ' kbps') + '</button>';
    });
    openSheet(html + '</div>');
  }
  function showUI(keep) {
    $('#pui').classList.add('show');
    clearTimeout(PL.uiT);
    if (!keep) PL.uiT = setTimeout(function () { if (!V.paused && $('#perr').hidden && !sheetOpen()) $('#pui').classList.remove('show'); }, 3600);
  }
  function openPlayer(item, list) {
    PL.item = item; PL.list = list && list.length ? list : [item];
    PL.active = true; PL.played = false; PL.stalls = 0; PL.pi = 0; PL.speedI = 0; PL.fitI = 0;
    PL.plan = buildPlan(item);
    V.playbackRate = 1; V.style.objectFit = 'contain';
    $('#pb-speed').textContent = '1x';
    $('#p-name').textContent = item.name;
    $('#p-sub').textContent = '';
    $('#p-range').value = 0; $('#p-cur').textContent = '00:00'; $('#p-dur').textContent = '00:00';
    PLY.hidden = false;
    setLiveMode(); setPlayIcon();
    $('#pb-mute').innerHTML = ic(V.muted ? 'mute' : 'vol', 24);
    showUI(true);
    if (!PL.plan.length) { showErr('لا يوجد رابط بث لهذا العنصر.'); return; }
    runStep();
  }
  function closePlayer() {
    if (!PL.active) return;
    PL.active = false; PL.tok++;
    clearTimers(); cleanupEngine(); hideErr(); spin(false);
    if (document.fullscreenElement) { try { document.exitFullscreen(); } catch (e) { /* ignore */ } }
    try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) { /* ignore */ }
    PL.rot = false; PLY.classList.remove('rot');
    PLY.hidden = true;
    render();
  }
  function stepChannel(d) {
    var l = PL.list, i = l.indexOf(PL.item);
    if (i < 0 || l.length < 2) return;
    var n = l[(i + d + l.length) % l.length];
    openPlayer(n, l);
  }
  function openExternal(url) {
    if (!url) return;
    toast('اختر VLC أو MX Player من القائمة');
    setTimeout(function () { window.location.href = url; }, 250);
  }
  function curUrl() { return PL.item ? PL.item.streams[PL.si] || PL.item.streams[0] : ''; }
  function toggleFull() {
    if (PL.rot) { PL.rot = false; PLY.classList.remove('rot'); return; }
    if (document.fullscreenElement) { document.exitFullscreen(); return; }
    var go = PLY.requestFullscreen ? PLY.requestFullscreen() : null;
    if (go && go.then) {
      go.then(function () { try { screen.orientation.lock('landscape').catch(function () { /* ignore */ }); } catch (e) { /* ignore */ } })
        .catch(function () { cssRotate(); });
    } else cssRotate();
  }
  function cssRotate() {
    if (window.innerWidth > window.innerHeight) { toast('أدر الهاتف أفقياً للحصول على ملء الشاشة'); return; }
    PL.rot = true; PLY.classList.add('rot');
  }

  function bindPlayer() {
    V.addEventListener('playing', function () {
      if (!PL.active) return;
      spin(false); clearTimeout(PL.timers.load); clearTimeout(PL.timers.stall);
      setPlayIcon(); setLiveMode(); showUI(false);
      if (!PL.played) { PL.played = true; addHist(PL.item.key); }
    });
    V.addEventListener('waiting', function () {
      if (!PL.active) return;
      spin(true);
      clearTimeout(PL.timers.stall);
      if (!PL.live) return;
      PL.timers.stall = setTimeout(function () {
        if (!PL.active) return;
        PL.stalls++;
        if (PL.stalls <= 2) { toast('انقطع البث، جارٍ إعادة الاتصال...'); runStep(); } else failStep();
      }, 15000);
    });
    V.addEventListener('canplay', function () { if (PL.active) spin(false); });
    V.addEventListener('pause', function () { setPlayIcon(); showUI(true); });
    V.addEventListener('play', setPlayIcon);
    V.addEventListener('loadedmetadata', function () { if (PL.active) setLiveMode(); });
    V.addEventListener('durationchange', function () { if (PL.active) { setLiveMode(); $('#p-dur').textContent = fmt(V.duration); } });
    V.addEventListener('error', function () { if (PL.active && PL.engine === 'native' && V.getAttribute('src')) failStep(); });
    V.addEventListener('ended', function () { if (PL.active && PL.live) runStep(); });
    V.addEventListener('timeupdate', function () {
      if (!PL.active) return;
      clearTimeout(PL.timers.stall);
      if (PL.live || PL.dragging || !V.duration) return;
      $('#p-range').value = Math.round(V.currentTime / V.duration * 1000);
      $('#p-cur').textContent = fmt(V.currentTime);
    });

    var rg = $('#p-range');
    rg.addEventListener('input', function () { PL.dragging = true; showUI(true); if (V.duration) $('#p-cur').textContent = fmt(rg.value / 1000 * V.duration); });
    rg.addEventListener('change', function () { if (V.duration) V.currentTime = rg.value / 1000 * V.duration; PL.dragging = false; showUI(false); });

    // اللمس: إظهار/إخفاء الأدوات + نقر مزدوج للتقديم/التأخير
    var lastTap = 0, lastX = 0;
    PLY.addEventListener('click', function (e) {
      if (e.target.closest('button,input,.p-err')) return;
      var now = Date.now(), r = PLY.getBoundingClientRect();
      var x = PL.rot ? e.clientY : e.clientX, w = PL.rot ? r.height : r.width;
      if (now - lastTap < 320 && Math.abs(x - lastX) < 90 && !PL.live) {
        var right = x > w / 2;
        V.currentTime = Math.max(0, V.currentTime + (right ? 10 : -10));
        var el = $(right ? '#ptap-r' : '#ptap-l');
        el.textContent = right ? '+10 ث' : '-10 ث'; el.classList.add('on');
        setTimeout(function () { el.classList.remove('on'); }, 500);
        lastTap = 0; return;
      }
      lastTap = now; lastX = x;
      var ui = $('#pui');
      if (ui.classList.contains('show')) { if (!V.paused) ui.classList.remove('show'); } else showUI(false);
    });

    PLY.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pa]');
      if (!b) return;
      var a = b.getAttribute('data-pa');
      showUI(false);
      if (a === 'back') closePlayer();
      else if (a === 'play') { if (V.paused) play(); else V.pause(); }
      else if (a === 'prev') stepChannel(-1);
      else if (a === 'next') stepChannel(1);
      else if (a === 'rew') V.currentTime = Math.max(0, V.currentTime - 10);
      else if (a === 'ff') V.currentTime = Math.min(V.duration || 1e9, V.currentTime + 10);
      else if (a === 'mute') { V.muted = !V.muted; b.innerHTML = ic(V.muted ? 'mute' : 'vol', 24); }
      else if (a === 'speed') { PL.speedI = (PL.speedI + 1) % SPEEDS.length; V.playbackRate = SPEEDS[PL.speedI]; b.textContent = SPEEDS[PL.speedI] + 'x'; }
      else if (a === 'fit') { PL.fitI = (PL.fitI + 1) % FITS.length; V.style.objectFit = FITS[PL.fitI][0]; toast('حجم الصورة: ' + FITS[PL.fitI][1]); }
      else if (a === 'pip') {
        try { if (document.pictureInPictureElement) document.exitPictureInPicture(); else V.requestPictureInPicture(); }
        catch (err) { toast('الميزة غير مدعومة على هذا الجهاز'); }
      }
      else if (a === 'full') toggleFull();
      else if (a === 'ext') openExternal(curUrl());
      else if (a === 'copy') copyText(curUrl());
      else if (a === 'quality') openQuality();
      else if (a === 'retry') { PL.pi = 0; PL.stalls = 0; runStep(); }
    });

    // أيقونات ثابتة
    $('#pb-back').innerHTML = ic('back', 26);
    $('#pb-ext').innerHTML = ic('ext', 22);
    $('#pb-prev').innerHTML = ic('prev', 24);
    $('#pb-next').innerHTML = ic('next', 24);
    $('#pb-fit').innerHTML = ic('aspect', 24);
    $('#pb-copy').innerHTML = ic('copy', 22);
    $('#pb-full').innerHTML = ic('expand', 24);
    if (document.pictureInPictureEnabled) $('#pb-pip').innerHTML = ic('pip', 24); else $('#pb-pip').hidden = true;
    $('#pb-mute').innerHTML = ic('vol', 24);
    setPlayIcon();
  }

  /* ---------- الأحداث العامة ---------- */
  function playKey(key) {
    var it = MAP[key]; if (!it) return;
    var ctx;
    if (it.type === 'live') ctx = (S.tab === 'live' && !S.q) ? liveFiltered() : ofType('live');
    else ctx = ofType(it.type);
    closeSheet();
    openPlayer(it, ctx);
  }

  function onClick(e) {
    var t;
    if ((t = e.target.closest('[data-fav]'))) {
      e.stopPropagation();
      toggleFav(t.getAttribute('data-fav'));
      render();
      return;
    }
    if (e.target.closest('#player')) return;
    if ((t = e.target.closest('[data-chip-sat]'))) { S.sat = t.getAttribute('data-chip-sat'); render(); return; }
    if ((t = e.target.closest('[data-chip-cat]'))) { S.cat = t.getAttribute('data-chip-cat'); render(); return; }
    if ((t = e.target.closest('[data-go]'))) {
      S.sat = t.getAttribute('data-sat') || 'all'; S.cat = 'all'; goTab(t.getAttribute('data-go')); return;
    }
    if ((t = e.target.closest('[data-tab]'))) { goTab(t.getAttribute('data-tab')); return; }
    if ((t = e.target.closest('[data-play]'))) {
      var it = MAP[t.getAttribute('data-play')];
      if (!it) return;
      if (it.type === 'live') playKey(it.key); else openDetail(it);
      return;
    }
    if ((t = e.target.closest('[data-act]'))) { act(t.getAttribute('data-act'), t.getAttribute('data-arg')); }
  }

  function act(a, arg) {
    if (a === 'closesheet') closeSheet();
    else if (a === 'playsheet') playKey(arg);
    else if (a === 'favsheet') { toggleFav(arg); openDetail(MAP[arg]); render(); }
    else if (a === 'more') { S.limit[arg] += 120; render(); }
    else if (a === 'addara') {
      addList('قنوات عربية (iptv-org)', ARA_LIST_URL, null);
    }
    else if (a === 'refresh') refreshAll(false);
    else if (a === 'addlist') sheetAddList();
    else if (a === 'paste') sheetPaste();
    else if (a === 'pickfile') $('#f-file').click();
    else if (a === 'savelist') {
      var url = ($('#f-url').value || '').trim();
      if (!/^https?:\/\/\S+$/i.test(url)) { toast('أدخل رابطاً صحيحاً يبدأ بـ http أو https'); return; }
      var nm = ($('#f-name').value || '').trim() || 'قائمتي';
      closeSheet(); addList(nm, url, null);
    }
    else if (a === 'savetext') {
      var tx = ($('#f-text').value || '').trim();
      if (!tx) { toast('الصق محتوى القائمة أولاً'); return; }
      var nm2 = ($('#f-name').value || '').trim() || 'قائمة محلية';
      closeSheet(); addList(nm2, '', tx);
    }
    else if (a === 'togglelist') {
      S.lists.forEach(function (l) { if (l.id === arg) l.on = !l.on; });
      saveLists(); buildItems(); render();
    }
    else if (a === 'dellist') {
      S.lists = S.lists.filter(function (l) { return l.id !== arg; });
      LS.del('ac_c_' + arg); saveLists(); buildItems(); render(); toast('تم حذف القائمة');
    }
    else if (a === 'mode') { S.settings.mode = arg; LS.set('ac_set', S.settings); render(); }
    else if (a === 'clearhist') { S.hist = []; LS.set('ac_hist', []); toast('تم مسح السجل'); }
    else if (a === 'clearfav') { S.fav = []; LS.set('ac_fav', []); toast('تم مسح المفضلة'); }
    else if (a === 'mail') { window.location.href = 'mailto:' + DEV_MAIL + '?subject=' + encodeURIComponent('السينما موبايل'); }
    else if (a === 'share') {
      var txt = 'جرّب تطبيق السينما موبايل: قنوات عربية مباشرة وأفلام.';
      if (navigator.share) navigator.share({ title: 'السينما موبايل', text: txt }).catch(function () { /* ignore */ });
      else copyText(txt);
    }
    else if (a === 'setq') {
      if (PL.hls) { PL.hls.currentLevel = parseInt(arg, 10); toast(arg === '-1' ? 'الجودة: تلقائي' : 'تم تغيير الجودة'); }
      closeSheet();
    }
  }

  /* ---------- زر الرجوع ---------- */
  var exitArmed = false;
  function onBack() {
    if (sheetOpen()) { closeSheet(); return; }
    if (PL.active) { if (PL.rot) { PL.rot = false; PLY.classList.remove('rot'); } else closePlayer(); return; }
    if (S.q) { S.q = ''; $('#q').value = ''; $('#q-clear').hidden = true; render(); return; }
    if (S.tab !== 'home') { goTab('home'); return; }
    if (exitArmed) {
      var A = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
      if (A && A.exitApp) A.exitApp(); else history.back();
      return;
    }
    exitArmed = true; toast('اضغط رجوع مرة أخرى للخروج');
    setTimeout(function () { exitArmed = false; }, 2200);
  }

  /* ---------- التشغيل ---------- */
  function init() {
    $('#ic-search').innerHTML = ic('search', 20);
    $('#q-clear').innerHTML = ic('close', 18);
    buildItems();
    render();
    bindPlayer();

    document.addEventListener('click', onClick);
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[data-play]')) { e.preventDefault(); e.target.click(); }
    });
    var qt;
    $('#q').addEventListener('input', function () {
      var v = this.value;
      $('#q-clear').hidden = !v;
      clearTimeout(qt);
      qt = setTimeout(function () { S.q = v; render(); }, 160);
    });
    $('#q').addEventListener('keydown', function (e) { if (e.key === 'Enter') this.blur(); });
    $('#q-clear').addEventListener('click', function () { S.q = ''; $('#q').value = ''; this.hidden = true; render(); });

    window.addEventListener('online', function () { $('#offline').hidden = true; });
    window.addEventListener('offline', function () { $('#offline').hidden = false; });
    if (!navigator.onLine) $('#offline').hidden = false;

    var A = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if (A && A.addListener) A.addListener('backButton', onBack);

    // تحديث صامت للقوائم القديمة (أكثر من 24 ساعة)
    var stale = S.lists.some(function (l) { return l.url && l.on && Date.now() - (l.ts || 0) > 86400000; });
    if (stale && navigator.onLine) setTimeout(function () { refreshAll(true); }, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
