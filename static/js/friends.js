/* Elysia friends — pure CSR for the `api` param (vanilla, no deps).
 * Build-time (`zola build`) never touches the api URL: the template only emits
 * <div class="friends-grid" data-friends-api="..."> with skeleton cards.
 * On every page visit this script fetches the api JSON and renders the cards.
 * No SEO for api cards (view-source stays empty) — by design.
 * Expected shape: {"version":"v2","content":[{title,url,icon,description,feed,
 *   posts:[{title,link,published}]}]} — only these fields are used.
 */
(function () {
  'use strict';

  var TIMEOUT_MS = 10000;

  function str(v) {
    return (v === undefined || v === null) ? '' : String(v);
  }

  function escapeHtml(s) {
    return str(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Only http(s) URLs reach the DOM; anything else becomes a harmless fallback. */
  function safeUrl(u, fallback) {
    var s = str(u).trim();
    if (/^https?:\/\//i.test(s)) return s;
    return fallback === undefined ? '#' : fallback;
  }

  function safeIcon(u) {
    var s = str(u).trim();
    if (/^https?:\/\//i.test(s) || (s.charAt(0) === '/' && s.charAt(1) !== '/')) return s;
    return '';
  }

  /* Normalize one remote entry to the same fields as static friends.yaml. */
  function normalizeItem(r) {
    r = r || {};
    var url = safeUrl(r.url, '#');
    var title = str(r.title).trim() || url;
    var posts = [];
    if (Array.isArray(r.posts)) {
      for (var i = 0; i < r.posts.length && posts.length < 3; i++) {
        var p = r.posts[i] || {};
        posts.push({
          title: str(p.title),
          href: safeUrl(p.link, '#'),
          date: str(p.published)
        });
      }
    }
    return {
      title: title,
      url: url,
      icon: safeIcon(r.icon),
      description: str(r.description),
      feed: str(r.feed).trim(),
      posts: posts
    };
  }

  /* With feed first, stable within each partition (Array#sort is stable). */
  function sortByFeed(list) {
    return list.slice().sort(function (a, b) {
      var ah = a.feed ? 0 : 1;
      var bh = b.feed ? 0 : 1;
      return ah - bh;
    });
  }

  function renderPosts(item) {
    if (item.posts && item.posts.length > 0) {
      var html = '<ul class="friend-card__post-list">';
      for (var i = 0; i < item.posts.length; i++) {
        var p = item.posts[i];
        html += '<li><a href="' + escapeHtml(p.href) + '" target="_blank" rel="noopener">' + escapeHtml(p.title) + '</a>';
        if (p.date) html += '<time>' + escapeHtml(p.date) + '</time>';
        html += '</li>';
      }
      return html + '</ul>';
    }
    if (item.feed) return '<p class="friend-card__rss-empty">订阅暂不可用</p>';
    return '<p class="friend-card__rss-empty">暂未配置 feed 订阅</p>';
  }

  function renderCard(item) {
    var initial = escapeHtml((item.title || '?').charAt(0).toUpperCase());
    var avatar = item.icon
      ? '<img src="' + escapeHtml(item.icon) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.remove()">'
      : initial;
    var html = '<article class="friend-card"><div class="friend-card__side">'
      + '<a class="friend-card__head" href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener">'
      + '<span class="friend-card__avatar">' + avatar + '</span>'
      + '<span class="friend-card__name">' + escapeHtml(item.title) + '</span></a>';
    if (item.description) html += '<p class="friend-card__desc">' + escapeHtml(item.description) + '</p>';
    html += '</div><div class="friend-card__posts">' + renderPosts(item) + '</div></article>';
    return html;
  }

  /* api 失败或空数据：整个远端网格直接隐藏，不留错误/空态。 */
  function hideGrid(grid, err) {
    if (err) console.warn('[elysia] friends api failed', err);
    if (grid && grid.parentNode) grid.parentNode.removeChild(grid);
    else if (grid) grid.style.display = 'none';
  }

  function loadGrid(grid, api) {
    grid.setAttribute('aria-busy', 'true');
    var ctrl = null;
    var timer = 0;
    try {
      if (typeof AbortController !== 'undefined') {
        ctrl = new AbortController();
        timer = setTimeout(function () { try { ctrl.abort(); } catch (_) {} }, TIMEOUT_MS);
      }
    } catch (_) { ctrl = null; }
    fetch(api, { headers: { Accept: 'application/json' }, signal: ctrl ? ctrl.signal : undefined })
      .then(function (res) {
        if (!res.ok) throw new Error('http ' + res.status);
        return res.json();
      })
      .then(function (json) {
        if (!json || !Array.isArray(json.content)) throw new Error('bad shape');
        var list = sortByFeed(json.content.map(normalizeItem));
        if (list.length === 0) {
          hideGrid(grid, null);
        } else {
          grid.innerHTML = list.map(renderCard).join('');
        }
        grid.setAttribute('aria-busy', 'false');
      })
      .catch(function (err) { hideGrid(grid, err); })
      .then(function () { if (timer) clearTimeout(timer); });
  }

  function init() {
    if (typeof fetch === 'undefined') return;
    var grids = document.querySelectorAll('[data-friends-api]');
    for (var i = 0; i < grids.length; i++) {
      (function (grid) {
        var api = grid.getAttribute('data-friends-api') || '';
        if (!api) return;
        loadGrid(grid, api);
      })(grids[i]);
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  /* Exposed for automated tests (node) only; no runtime use. */
  if (typeof window !== 'undefined') window.ElysiaFriends = { normalizeItem: normalizeItem, sortByFeed: sortByFeed, escapeHtml: escapeHtml, safeUrl: safeUrl, hideGrid: hideGrid };
  if (typeof module !== 'undefined' && module.exports) module.exports = { normalizeItem: normalizeItem, sortByFeed: sortByFeed, escapeHtml: escapeHtml, safeUrl: safeUrl, hideGrid: hideGrid };
})();
