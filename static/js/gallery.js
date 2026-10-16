/* Elysia gallery — justified layout only (vanilla, no deps).
 * Grid / masonry are pure CSS and need no script.
 * This file packs each `.gallery[data-style="justified"]` row to fill the
 * container width at a uniform row height derived from --g-size.
 * One ResizeObserver per gallery instance: multiple galleries are independent.
 * Remote images (ratio unknown at build time) are measured on load, then the
 * owning row is repacked. Broken images are hidden and the row is repacked.
 */
(function () {
  'use strict';

  var MIN_RATIO = 0.25;
  var MAX_RATIO = 4;

  function num(v, fb) {
    v = parseFloat(v);
    return isFinite(v) ? v : fb;
  }

  function clamp(v, a, b) {
    return Math.min(b, Math.max(a, v));
  }

  /* Build-time data-ratio first, natural size second, 4:3 fallback last. */
  function ratioOf(fig) {
    var r = num(fig.getAttribute('data-ratio'), 0);
    if (!(r > 0)) {
      var img = fig.querySelector('img');
      if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
        r = img.naturalWidth / img.naturalHeight;
      }
    }
    if (!(r > 0)) r = 4 / 3;
    return clamp(r, MIN_RATIO, MAX_RATIO);
  }

  function layout(root) {
    var track = root.querySelector('.gallery__track');
    if (!track) return;
    var cs = getComputedStyle(root);
    var gap = num(cs.getPropertyValue('--g-gap'), 12);
    var size = num(cs.getPropertyValue('--g-size'), 240);
    var W = track.clientWidth;
    if (!(W > 0)) return;

    var items = [];
    var figs = track.querySelectorAll('.gallery__item');
    for (var i = 0; i < figs.length; i++) {
      if (!figs[i].classList.contains('is-broken')) items.push(figs[i]);
    }
    if (!items.length) return;

    /* Target row height from target width, assuming ~4:3 average ratio. */
    var hT = clamp(size * 0.75, 120, 360);
    hT = Math.min(hT, Math.max(W * 0.7, 120));

    var row = [];
    var sum = 0;

    function paint(last) {
      if (!row.length) return;
      var n = row.length;
      var h;
      if (last) {
        h = hT; /* last row: fixed height, left aligned, never stretched */
      } else {
        h = (W - gap * (n - 1)) / sum;
        h = clamp(h, hT * 0.5, hT * 1.5);
      }
      for (var k = 0; k < row.length; k++) {
        var w = Math.min(h * row[k]._r, W);
        row[k].style.flex = '0 0 auto';
        row[k].style.width = w + 'px';
        row[k].style.height = h + 'px';
      }
      row = [];
      sum = 0;
    }

    for (var j = 0; j < items.length; j++) {
      var f = items[j];
      f._r = ratioOf(f);
      row.push(f);
      sum += f._r;
      if (hT * sum + gap * (row.length - 1) >= W) paint(false);
    }
    paint(true);
  }

  function schedule(root) {
    if (root._gRaf) return;
    root._gRaf = requestAnimationFrame(function () {
      root._gRaf = 0;
      layout(root);
    });
  }

  function init(root) {
    schedule(root);
    var track = root.querySelector('.gallery__track');
    if (!track) return;
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function () { schedule(root); });
      ro.observe(track);
    }
    /* Capture phase: img load/error do not bubble. */
    track.addEventListener('load', function (e) {
      if (e.target && e.target.tagName === 'IMG') schedule(root);
    }, true);
    track.addEventListener('error', function (e) {
      var t = e.target;
      if (t && t.tagName === 'IMG') {
        var fig = t.closest ? t.closest('.gallery__item') : null;
        if (fig) {
          fig.classList.add('is-broken');
          schedule(root);
        }
      }
    }, true);
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var all = document.querySelectorAll('.gallery[data-style="justified"]');
    for (var i = 0; i < all.length; i++) init(all[i]);
    window.addEventListener('resize', function () {
      for (var j = 0; j < all.length; j++) schedule(all[j]);
    });
  });
})();
