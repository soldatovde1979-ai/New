/* MASHIKA — поведение страницы. Версия 1.0 */
(function () {
  'use strict';

  // Ожидаемая версия схемы данных в works.js (см. шапку works.js)
  var WORKS_SCHEMA = 1;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Утилиты ---------- */

  // Детерминированный генератор случайных чисел: один seed — один и тот же узор
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Гладкая кривая через точки (Catmull-Rom → кубические Безье)
  function smoothPath(pts, closed) {
    var n = pts.length, d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    var last = closed ? n : n - 1;
    for (var i = 0; i < last; i++) {
      var p0 = pts[closed ? (i - 1 + n) % n : Math.max(i - 1, 0)];
      var p1 = pts[i];
      var p2 = pts[closed ? (i + 1) % n : i + 1];
      var p3 = pts[closed ? (i + 2) % n : Math.min(i + 2, n - 1)];
      d += ' C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) +
           ' ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) +
           ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return closed ? d + 'Z' : d;
  }

  /* ---------- Заглушка картины: генеративная абстракция в SVG ---------- */

  function artSVG(work) {
    var r = rng(work.seed || 1);
    var pal = work.palette;
    var W = 1000, H = Math.round(1000 * work.h / work.w);
    var m = Math.min(W, H);
    var pick = function () { return pal[1 + Math.floor(r() * (pal.length - 1))]; };
    var out = [];

    out.push('<rect width="' + W + '" height="' + H + '" fill="' + pal[0] + '"/>');

    // Крупные цветовые поля
    var fields = 2 + Math.floor(r() * 2);
    for (var i = 0; i < fields; i++) {
      var fw = W * (0.4 + r() * 0.6), fh = H * (0.2 + r() * 0.4);
      out.push('<rect x="' + (r() * W - fw / 3).toFixed(0) + '" y="' + (r() * H - fh / 3).toFixed(0) +
        '" width="' + fw.toFixed(0) + '" height="' + fh.toFixed(0) + '" fill="' + pick() +
        '" opacity="' + (0.55 + r() * 0.4).toFixed(2) + '" transform="rotate(' + ((r() - 0.5) * 24).toFixed(1) +
        ' ' + W / 2 + ' ' + H / 2 + ')" filter="url(#brush)"/>');
    }

    // Пятна
    var blobs = 2 + Math.floor(r() * 3);
    for (i = 0; i < blobs; i++) {
      var cx = r() * W, cy = r() * H, rad = m * (0.12 + r() * 0.22), k = 6 + Math.floor(r() * 3), pts = [];
      for (var j = 0; j < k; j++) {
        var a = (j / k) * Math.PI * 2, rr = rad * (0.65 + r() * 0.6);
        pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
      }
      out.push('<path d="' + smoothPath(pts, true) + '" fill="' + pick() + '" opacity="' +
        (0.7 + r() * 0.3).toFixed(2) + '" filter="url(#brush)"/>');
    }

    // Жесты кистью
    var strokes = 2 + Math.floor(r() * 3);
    for (i = 0; i < strokes; i++) {
      var sp = [], x = r() * W, y = r() * H, n = 3 + Math.floor(r() * 3);
      for (j = 0; j < n; j++) {
        sp.push([x, y]);
        x += (r() - 0.5) * W * 0.6; y += (r() - 0.5) * H * 0.5;
      }
      out.push('<path d="' + smoothPath(sp, false) + '" fill="none" stroke="' + pick() +
        '" stroke-width="' + (6 + r() * 34).toFixed(0) + '" stroke-linecap="round" opacity="' +
        (0.75 + r() * 0.25).toFixed(2) + '" filter="url(#brush)"/>');
    }

    // Брызги
    var dots = 6 + Math.floor(r() * 14), dc = pick();
    for (i = 0; i < dots; i++) {
      out.push('<circle cx="' + (r() * W).toFixed(0) + '" cy="' + (r() * H).toFixed(0) + '" r="' +
        (2 + r() * 9).toFixed(1) + '" fill="' + dc + '" opacity=".85"/>');
    }

    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H +
      '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(work.title || 'абстракция') + '">' +
      out.join('') + '</svg>';
  }

  function artHTML(work) {
    if (work.image) {
      return '<img src="' + esc(work.image) + '" alt="' + esc(work.title) + '" loading="lazy" decoding="async">';
    }
    return artSVG(work);
  }

  /* ---------- Первый экран: живые цветовые пятна ---------- */

  function initHero() {
    var canvas = document.getElementById('paint');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var colors = ['#e3a33a', '#d2453f', '#2b3f9e', '#1f9e8f', '#e86a92', '#f6bd60'];
    var SCALE = 6; // рисуем в низком разрешении — дёшево, а размытие скрывает пиксели
    var w = 0, h = 0, t0 = performance.now(), running = false;
    var pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

    var blobs = colors.map(function (c, i) {
      return { c: c, fx: 0.13 + i * 0.037, fy: 0.11 + i * 0.029, ph: i * 1.7, r: 0.32 + (i % 3) * 0.07 };
    });

    function resize() {
      w = canvas.width = Math.max(1, Math.round(canvas.clientWidth / SCALE));
      h = canvas.height = Math.max(1, Math.round(canvas.clientHeight / SCALE));
    }

    function draw(now) {
      var t = (now - t0) / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#0f0d0c';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'screen';
      var m = Math.max(w, h);
      blobs.forEach(function (b, i) {
        var x = 0.5 + Math.sin(t * b.fx + b.ph) * 0.38;
        var y = 0.5 + Math.cos(t * b.fy + b.ph * 1.3) * 0.34;
        // Пятна тянутся к курсору, каждое со своей силой
        var pull = 0.12 + (i % 3) * 0.1;
        x += (pointer.x - 0.5) * pull;
        y += (pointer.y - 0.5) * pull;
        var px = x * w, py = y * h, rad = b.r * m * (1 + Math.sin(t * 0.3 + i) * 0.12);
        var g = ctx.createRadialGradient(px, py, 0, px, py, rad);
        g.addColorStop(0, b.c);
        g.addColorStop(1, 'rgba(15,13,12,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fill();
      });
      if (running) requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', function (e) {
      pointer.tx = e.clientX / window.innerWidth;
      pointer.ty = e.clientY / window.innerHeight;
    }, { passive: true });

    if (reduceMotion) { draw(t0 + 4000); return; }

    // Анимация работает только пока первый экран виден
    new IntersectionObserver(function (entries) {
      var vis = entries[0].isIntersecting;
      if (vis && !running) { running = true; requestAnimationFrame(draw); }
      else if (!vis) running = false;
    }).observe(canvas);
  }

  function splitName() {
    var el = document.querySelector('.name');
    if (!el) return;
    var text = el.textContent;
    el.textContent = '';
    text.split('').forEach(function (ch, i) {
      var s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i);
      s.textContent = ch;
      el.appendChild(s);
    });
  }

  /* ---------- Галерея ---------- */

  var STATUS = { available: 'доступна', reserved: 'забронирована', sold: 'в частной коллекции' };

  function priceText(p) {
    return p ? p.toLocaleString('ru-RU') + ' ₽' : 'цена по запросу';
  }

  function initGallery(works) {
    var grid = document.getElementById('grid');
    grid.innerHTML = works.map(function (wk, i) {
      return '<article class="card" tabindex="0" data-i="' + i + '" style="--d:' + ((i % 3) * 0.12) + 's">' +
        '<div class="card-frame">' + artHTML(wk) + '</div>' +
        '<div class="card-cap"><h3>' + esc(wk.title) + '</h3><span>' + wk.w + '×' + wk.h + ' см</span></div>' +
        '<p class="status ' + esc(wk.status) + '">' + (STATUS[wk.status] || '') + '</p>' +
        '</article>';
    }).join('');

    var cards = grid.querySelectorAll('.card');
    cards.forEach(function (card) {
      var i = +card.dataset.i;
      card.addEventListener('click', function () { openViewer(i); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openViewer(i); }
      });
      if (!finePointer || reduceMotion) return;
      // 3D-наклон и блик за мышью
      var frame = card.querySelector('.card-frame');
      card.addEventListener('pointermove', function (e) {
        var b = frame.getBoundingClientRect();
        var x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
        frame.style.setProperty('--ry', ((x - 0.5) * 12).toFixed(2) + 'deg');
        frame.style.setProperty('--rx', ((0.5 - y) * 10).toFixed(2) + 'deg');
        frame.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
        frame.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      });
      card.addEventListener('pointerleave', function () {
        frame.style.setProperty('--rx', '0deg');
        frame.style.setProperty('--ry', '0deg');
      });
    });
    return cards;
  }

  /* ---------- Просмотр картины ---------- */

  var viewer, current = 0, list = [];

  function openViewer(i) {
    current = (i + list.length) % list.length;
    var wk = list[current];
    document.getElementById('v-art').innerHTML = artHTML(wk);
    document.getElementById('v-title').textContent = wk.title;
    document.getElementById('v-meta').textContent =
      wk.technique + ' · ' + wk.w + '×' + wk.h + ' см · ' + wk.year + ' · ' + priceText(wk.price);
    var st = document.getElementById('v-status');
    st.className = 'status ' + wk.status;
    st.textContent = STATUS[wk.status] || '';
    document.getElementById('v-ask').style.display = wk.status === 'sold' ? 'none' : '';
    if (!viewer.open) viewer.showModal();
  }

  function initViewer() {
    viewer = document.getElementById('viewer');
    if (!viewer.showModal) return; // очень старый браузер — просто без просмотра
    viewer.addEventListener('click', function (e) {
      if (e.target === viewer || e.target.closest('[data-close]')) viewer.close();
      else if (e.target.closest('[data-prev]')) openViewer(current - 1);
      else if (e.target.closest('[data-next]')) openViewer(current + 1);
    });
    document.addEventListener('keydown', function (e) {
      if (!viewer.open) return;
      if (e.key === 'ArrowLeft') openViewer(current - 1);
      if (e.key === 'ArrowRight') openViewer(current + 1);
    });
  }

  /* ---------- Мелочи: появление, шапка, курсор ---------- */

  function initReveal() {
    var els = document.querySelectorAll('.reveal, .card');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  function initHeader() {
    var top = document.querySelector('.top');
    var onScroll = function () { top.classList.toggle('scrolled', window.scrollY > 40); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initCursor() {
    if (!finePointer) return;
    var dot = document.querySelector('.cursor');
    var x = 0, y = 0, cx = 0, cy = 0;
    window.addEventListener('pointermove', function (e) {
      x = e.clientX; y = e.clientY;
      dot.classList.add('on');
      dot.classList.toggle('big', !!e.target.closest('a, button, .card'));
    }, { passive: true });
    document.addEventListener('pointerleave', function () { dot.classList.remove('on'); });
    (function loop() {
      cx += (x - cx) * 0.22; cy += (y - cy) * 0.22;
      dot.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Старт ---------- */

  var data = window.MASHIKA_WORKS;
  if (!data || data.schema !== WORKS_SCHEMA) {
    console.error('MASHIKA: works.js не найден или схема ' + (data && data.schema) +
      ' не совпадает с ожидаемой ' + WORKS_SCHEMA);
    data = { items: [] };
  }
  list = data.items;

  document.getElementById('year').textContent = new Date().getFullYear();
  splitName();
  initHero();
  initGallery(list);
  initViewer();
  initReveal();
  initHeader();
  initCursor();

  document.getElementById('about-art').innerHTML = artSVG({
    title: 'МАШИКА', w: 4, h: 5, seed: 2024,
    palette: ['#f3e6d0', '#e3a33a', '#d2453f', '#2b3f9e', '#1f9e8f']
  });
})();
