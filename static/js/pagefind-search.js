/* Elysia Pagefind local search — sidebar dropdown glue (ES module, injected in
 * <head> when [extra.search] provider = "pagefind").
 * The dedicated search page uses Pagefind's own UI (see search.html) instead.
 * Result URLs are rebased onto the deployment subpath (e.g. /repo/) when needed.
 */
'use strict';

function qs(id) { return document.getElementById(id); }

function escapeHtml(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* "/repo/" style base path derived from the absolute site root rendered by Tera. */
function basePathOf(siteRoot) {
  try {
    let p = new URL(siteRoot || '/', window.location.href).pathname;
    if (p.charAt(p.length - 1) !== '/') p += '/';
    return p;
  } catch (_) {
    return '/';
  }
}

/* Pagefind records root-absolute URLs (/wiki/...); rebase them under a subpath deploy. */
function fixUrl(url, basePath) {
  if (!url) return '#';
  if (/^(https?:)?\/\//i.test(url) || url.charAt(0) === '#') return url;
  if (basePath && basePath !== '/' && url.indexOf(basePath) !== 0 && url.charAt(0) === '/') {
    return basePath.replace(/\/$/, '') + url;
  }
  return url;
}

function sidebarCtx() {
  const root = qs('searchRoot');
  if (!root || root.getAttribute('data-provider') !== 'pagefind') return null;
  return {
    bundle: root.getAttribute('data-bundle') || 'pagefind/pagefind.js',
    basePath: basePathOf(root.getAttribute('data-site-root') || '/'),
    searchPage: root.getAttribute('data-search-page') || fixUrl('/search/', basePathOf(root.getAttribute('data-site-root') || '/')),
    limit: parseInt(root.getAttribute('data-hits-per-page') || '8', 10) || 8
  };
}

let pfModule = null;
let pfFailed = false;

async function pf(bundle) {
  if (pfModule) return pfModule;
  if (pfFailed) return null;
  try {
    pfModule = await import(bundle);
    try { await pfModule.init(); } catch (_) { /* init is optional */ }
    return pfModule;
  } catch (e) {
    pfFailed = true;
    console.warn('[elysia] pagefind bundle not found — run `pagefind --site public` after build', e);
    return null;
  }
}

function missingNotice() {
  return '<div class="search__empty">本地搜索索引缺失，请先运行 <code>pagefind --site public</code> 生成索引</div>';
}

function renderHits(items, container, basePath, query) {
  if (!container) return;
  if (!items || items.length === 0) {
    container.innerHTML = '<div class="search__empty">未找到 “' + escapeHtml(query) + '” 相关结果</div>';
    return;
  }
  container.innerHTML = items.map(function (d) {
    const pageUrl = fixUrl(d.url || '#', basePath);
    const title = (d.meta && d.meta.title) || (d.sub_results && d.sub_results[0] && d.sub_results[0].title) || d.url || '无标题';
    // 主链接直达最匹配的小节锚点（sub_results 按相关度排序），无锚点时回退页面顶部
    let url = pageUrl;
    let excerpt = d.excerpt;
    const subs = (d.sub_results || []).filter(function (s) {
      return s && s.url && fixUrl(s.url, basePath) !== pageUrl;
    });
    if (subs.length > 0) {
      url = fixUrl(subs[0].url, basePath);
      if (subs[0].excerpt) excerpt = subs[0].excerpt;
    }
    let html = '<a class="search__hit" href="' + escapeHtml(url) + '" role="option">'
      + '<div class="search__hit-title">' + escapeHtml(title) + '</div>'
      + (excerpt ? '<div class="search__hit-desc">' + excerpt + '</div>' : '')
      + '<div class="search__hit-url">' + escapeHtml(url) + '</div>'
      + '</a>';
    return html;
  }).join('');
}

async function doSearch(query, ctx, container) {
  if (!container) return;
  if (!query || query.trim().length < 1) {
    container.innerHTML = '';
    container.hidden = true;
    return;
  }
  const mod = await pf(ctx.bundle);
  if (!mod) {
    container.innerHTML = missingNotice();
    container.hidden = false;
    return;
  }
  try {
    const res = await mod.search(query);
    const items = await Promise.all(((res && res.results) || []).slice(0, ctx.limit).map(function (r) { return r.data(); }));
    renderHits(items, container, ctx.basePath, query);
    container.hidden = false;
  } catch (e) {
    console.error('[elysia] pagefind search error', e);
    container.innerHTML = '<div class="search__empty">搜索出错，请稍后重试</div>';
    container.hidden = false;
  }
}

function debounce(fn, wait) {
  let t;
  return function () {
    const args = arguments;
    clearTimeout(t);
    t = setTimeout(function () { fn.apply(null, args); }, wait);
  };
}

/* ── Sidebar ── */
function bindSidebar(ctx) {
  const input = qs('searchInput');
  const results = qs('searchResults');
  const clear = qs('searchClear');
  if (!input || !results) return;
  let activeIndex = -1;

  function updateActive() {
    const hits = results.querySelectorAll('.search__hit');
    hits.forEach(function (el, i) {
      el.classList.toggle('is-active', i === activeIndex);
      if (i === activeIndex) el.scrollIntoView({ block: 'nearest' });
    });
  }

  // Warm up the index on first focus so typing feels instant.
  input.addEventListener('focus', function () { pf(ctx.bundle); }, { once: true });

  const run = debounce(function () {
    const q = input.value.trim();
    if (clear) clear.hidden = !q;
    activeIndex = -1;
    doSearch(q, ctx, results);
  }, 260);

  input.addEventListener('input', run);
  // Enter without an arrow selection goes to the full search page.
  input.addEventListener('keydown', function (e) {
    const hits = results.querySelectorAll('.search__hit');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, hits.length - 1);
      updateActive();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, -1);
      updateActive();
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && hits[activeIndex]) {
        e.preventDefault();
        hits[activeIndex].click();
      } else if (input.value.trim()) {
        window.location.href = ctx.searchPage + '?q=' + encodeURIComponent(input.value.trim());
      }
    } else if (e.key === 'Escape') {
      results.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.blur();
    }
  });

  if (clear) {
    clear.addEventListener('click', function () {
      input.value = '';
      clear.hidden = true;
      results.innerHTML = '';
      results.hidden = true;
      input.focus();
    });
  }

  document.addEventListener('click', function (e) {
    const root = qs('searchRoot');
    if (root && !root.contains(e.target)) {
      results.hidden = true;
      input.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      input.focus();
    }
  });

  // Keep aria-expanded in sync when results show.
  new MutationObserver(function () {
    input.setAttribute('aria-expanded', String(!results.hidden && results.innerHTML !== ''));
  }).observe(results, { childList: true, attributes: true, attributeFilter: ['hidden'] });
}

const sctx = sidebarCtx();
if (sctx) bindSidebar(sctx);
