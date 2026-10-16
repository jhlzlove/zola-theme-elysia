/* Elysia sitemap — link-card metadata enhancement (vanilla, no deps).
 * Build-time (`zola build`) never touches the api: the `link` component renders
 * user-written title/desc/icon as-is, and base.html only emits window.SITEMAP_API
 * plus this script when [extra.api.sitemap] is enabled. On every page visit this
 * script fetches metadata per link card: success → overwrite with the returned
 * title/desc/icon (api first); failure/timeout/bad shape → keep the user-written
 * content untouched (fallback).
 * Expected shape: {"url":"...","title":"...","desc":"...","icon":"..."}.
 */
(function () {
  'use strict';

  var TIMEOUT_MS = 10000;

  function str(v) {
    return (v === undefined || v === null) ? '' : String(v);
  }

  /* Only http(s) URLs are fetched or reach the DOM; anything else is skipped. */
  function safeHttpUrl(u) {
    var s = str(u).trim();
    if (/^https?:\/\//i.test(s)) return s;
    return '';
  }

  /* {href} 直接拼 raw 地址（不对 href 做 encode，避免已含 % 转义的地址被二次编码搞坏；
   * 服务端按原始 url 参数解析）。href 中若含 & / # 可能截断参数，属已知取舍。 */
  function buildApiUrl(template, href) {
    if (String.prototype.replaceAll) return template.replaceAll('{href}', href);
    return template.split('{href}').join(href);
  }

  function setTitle(card, title) {
    var el = card.querySelector('.link-card__title');
    if (!el) return;
    el.textContent = title;
  }

  function setDesc(card, desc) {
    var el = card.querySelector('.link-card__desc');
    if (el) {
      el.textContent = desc;
      return;
    }
    var body = card.querySelector('.link-card__body');
    if (!body || typeof document === 'undefined') return;
    var div = document.createElement('div');
    div.className = 'link-card__desc';
    div.textContent = desc;
    body.appendChild(div);
  }

  function setIcon(card, icon) {
    if (typeof document === 'undefined') return;
    var box = card.querySelector('.link-card__icon');
    if (box) {
      var img = box.querySelector('img');
      if (img) {
        img.src = icon;
        img.alt = '';
        return;
      }
      /* User wrote an emoji/text icon — api first, replace with fetched favicon. */
      box.innerHTML = '';
      var ni = document.createElement('img');
      ni.src = icon;
      ni.alt = '';
      ni.setAttribute('loading', 'lazy');
      box.appendChild(ni);
      return;
    }
    var link = card.querySelector('.link-card__link');
    var body = card.querySelector('.link-card__body');
    if (!link || !body) return;
    var wrap = document.createElement('div');
    wrap.className = 'link-card__icon';
    var im = document.createElement('img');
    im.src = icon;
    im.alt = '';
    im.setAttribute('loading', 'lazy');
    wrap.appendChild(im);
    link.insertBefore(wrap, body);
  }

  function applyMeta(card, meta) {
    var title = str(meta.title).trim();
    var desc = str(meta.desc).trim();
    var icon = safeHttpUrl(meta.icon);
    if (!title && !desc && !icon) return;
    if (title) setTitle(card, title);
    if (desc) setDesc(card, desc);
    if (icon) setIcon(card, icon);
  }

  function enhance(card, template, href) {
    var ctrl = null, timer = 0;
    try {
      if (typeof AbortController !== 'undefined') {
        ctrl = new AbortController();
        timer = setTimeout(function () { try { ctrl.abort(); } catch (_) {} }, TIMEOUT_MS);
      }
    } catch (_) { ctrl = null; }
    fetch(buildApiUrl(template, href), { headers: { Accept: 'application/json' }, signal: ctrl ? ctrl.signal : undefined })
      .then(function (res) {
        if (!res.ok) throw new Error('http ' + res.status);
        return res.json();
      })
      .then(function (json) {
        if (!json || typeof json !== 'object') throw new Error('bad shape');
        applyMeta(card, json);
      })
      .catch(function (err) {
        /* Fallback: keep user-written content, never clear. */
        console.warn('[elysia] sitemap api failed', href, err);
      })
      .then(function () { if (timer) clearTimeout(timer); });
  }

  function init() {
    if (typeof fetch === 'undefined' || typeof document === 'undefined' || typeof window === 'undefined') return;
    var template = str(window.SITEMAP_API).trim();
    if (!template || template.indexOf('{href}') === -1) return;
    var cards = document.querySelectorAll('.link-card');
    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        if (card.getAttribute('data-sitemap-done') === '1') return;
        var anchor = card.querySelector('.link-card__link');
        var href = anchor ? safeHttpUrl(anchor.getAttribute('href')) : '';
        if (!href) return;
        card.setAttribute('data-sitemap-done', '1');
        enhance(card, template, href);
      })(cards[i]);
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})();
