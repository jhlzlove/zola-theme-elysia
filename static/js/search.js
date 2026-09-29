/* Elysia Algolia Search — vanilla, configurable via zola.toml [extra.algolia] */
(function(){
  const ROOT_ID = 'searchRoot';
  const INPUT_ID = 'searchInput';
  const RESULTS_ID = 'searchResults';
  const CLEAR_ID = 'searchClear';
  const POWERED_ID = 'searchPowered';
  const PAGE_INPUT_ID = 'searchPageInput';
  const PAGE_RESULTS_ID = 'searchPageResults';
  const PAGE_STATS_ID = 'searchPageStats';

  function qs(id){ return document.getElementById(id); }

  function getConfig(){
    const root = qs(ROOT_ID);
    if(!root) return null;
    const appId = root.getAttribute('data-app-id') || '';
    const apiKey = root.getAttribute('data-api-key') || '';
    const indexName = root.getAttribute('data-index-name') || '';
    const hitsPerPage = parseInt(root.getAttribute('data-hits-per-page') || '8', 10);
    const placeholder = root.getAttribute('data-placeholder') || '搜索...';
    const powered = root.getAttribute('data-powered');
    if(!appId || !apiKey || !indexName) return null;
    return { appId, apiKey, indexName, hitsPerPage, placeholder, powered: powered !== 'false' };
  }

  // Also check for page-level config (search page may have same data attributes on its own root)
  function getPageConfig(){
    const pageRoot = document.querySelector('[data-algolia-page]');
    if(pageRoot){
      return {
        appId: pageRoot.getAttribute('data-app-id') || '',
        apiKey: pageRoot.getAttribute('data-api-key') || '',
        indexName: pageRoot.getAttribute('data-index-name') || '',
        hitsPerPage: parseInt(pageRoot.getAttribute('data-hits-per-page') || '12', 10),
      };
    }
    return null;
  }

  let client = null;
  let index = null;
  let lastQuery = '';
  let lastHits = [];
  let activeIndex = -1;

  function escapeHtml(s){
    return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function getHighlight(hit, attr, fallback){
    if(hit._highlightResult && hit._highlightResult[attr] && hit._highlightResult[attr].value){
      return hit._highlightResult[attr].value; // already <mark>
    }
    if(hit._snippetResult && hit._snippetResult[attr] && hit._snippetResult[attr].value){
      return hit._snippetResult[attr].value;
    }
    return escapeHtml(fallback || hit[attr] || '');
  }

  function getCrawlerTitle(hit){
    // Algolia Crawler (DocSearch) stores title in hierarchy.lvl1/lvl0
    if(hit.hierarchy){
      for(const lvl of ['lvl1','lvl2','lvl3','lvl0','lvl4','lvl5','lvl6']){
        if(hit.hierarchy[lvl]) return hit.hierarchy[lvl];
      }
    }
    return hit.title || hit.objectID || '无标题';
  }

  function getCrawlerHighlight(hit){
    if(hit._highlightResult && hit._highlightResult.hierarchy){
      for(const lvl of ['lvl1','lvl2','lvl3','lvl0','lvl4','lvl5','lvl6']){
        const h = hit._highlightResult.hierarchy[lvl];
        if(h && h.value && h.value.indexOf('<mark>') !== -1) return h.value;
      }
    }
    return null;
  }

  function getCrawlerBreadcrumb(hit){
    if(!hit.hierarchy) return '';
    const parts = [];
    for(const lvl of ['lvl0','lvl1','lvl2','lvl3']){
      if(hit.hierarchy[lvl]) parts.push(hit.hierarchy[lvl]);
    }
    // dedupe and limit
    const uniq = [...new Set(parts)];
    return uniq.slice(0,3).join(' › ');
  }

  function formatUrl(hit){
    let url = hit.url || hit.permalink || hit.path || hit.slug || '#';
    // Crawler may have anchor separate
    if(hit.anchor && url.indexOf('#') === -1){
      url += '#' + hit.anchor;
    }
    return url;
  }

  function renderHits(hits, container){
    if(!container) return;
    if(!hits || hits.length === 0){
      container.innerHTML = '<div class="search__empty">未找到 “' + escapeHtml(lastQuery) + '” 相关结果</div>';
      return;
    }
    container.innerHTML = hits.map(function(hit){
      const isCrawler = !!hit.hierarchy;
      const url = formatUrl(hit);
      let titleHtml;
      let summaryHtml;
      let breadcrumb = '';

      if(isCrawler){
        // Use highlighted hierarchy if available, else plain
        titleHtml = getCrawlerHighlight(hit) || escapeHtml(getCrawlerTitle(hit));
        // content snippet
        const rawContent = hit.content || hit._snippetResult && hit._snippetResult.content && hit._snippetResult.content.value || '';
        const hlContent = (hit._highlightResult && hit._highlightResult.content && hit._highlightResult.content.value) || (hit._snippetResult && hit._snippetResult.content && hit._snippetResult.content.value) || escapeHtml(rawContent);
        summaryHtml = hlContent;
        breadcrumb = getCrawlerBreadcrumb(hit);
        // content may already contain <mark>, so don't escape
        if(summaryHtml && summaryHtml.indexOf('<mark>') === -1){
          summaryHtml = escapeHtml(summaryHtml);
        }
      } else {
        // Manual push: expects title, content/summary
        const titleRaw = hit.title || '无标题';
        titleHtml = getHighlight(hit, 'title', titleRaw);
        const rawSummary = hit.summary || hit.description || hit.excerpt || hit.content || '';
        summaryHtml = getHighlight(hit, 'content', rawSummary);
        if(summaryHtml && summaryHtml.indexOf('<mark>') === -1){
          // plain fallback already escaped
        }
      }

      const cleanSummary = summaryHtml ? (summaryHtml.length > 180 ? summaryHtml.slice(0,180) + '…' : summaryHtml) : '';
      const date = hit.date ? new Date(hit.date * 1000).toISOString().slice(0,10) : (hit.year || hit.date_str || '');
      const typeBadge = isCrawler && hit.type && hit.type !== 'content' ? '<span style="font-size:10px;padding:1px 5px;border:1px solid var(--border);border-radius:999px;background:var(--bg-muted);margin-left:6px">' + escapeHtml(hit.type) + '</span>' : '';

      return '<a class="search__hit" href="' + escapeHtml(url) + '" role="option">'
        + '<div class="search__hit-title">' + titleHtml + typeBadge + '</div>'
        + (breadcrumb && !isCrawler ? '' : (breadcrumb ? '<div class="search__hit-desc" style="font-size:11px;opacity:.8">' + escapeHtml(breadcrumb) + '</div>' : ''))
        + (cleanSummary ? '<div class="search__hit-desc">' + cleanSummary + '</div>' : '')
        + '<div class="search__hit-url">' + escapeHtml(url) + '</div>'
        + (date ? '<div class="search__hit-meta">' + escapeHtml(date) + '</div>' : '')
        + '</a>';
    }).join('');
  }

  function showResults(container, poweredEl){
    if(container) container.hidden = false;
    if(poweredEl) poweredEl.hidden = false;
    const input = qs(INPUT_ID);
    if(input) input.setAttribute('aria-expanded', 'true');
  }

  function hideResults(container, poweredEl){
    if(container) container.hidden = true;
    if(poweredEl) poweredEl.hidden = true;
    const input = qs(INPUT_ID);
    if(input) input.setAttribute('aria-expanded', 'false');
    activeIndex = -1;
  }

  function updateActive(container){
    if(!container) return;
    const hits = container.querySelectorAll('.search__hit');
    hits.forEach((el,i)=>{
      el.classList.toggle('is-active', i===activeIndex);
      if(i===activeIndex) el.scrollIntoView({block:'nearest'});
    });
  }

  function debounce(fn, wait){
    let t;
    return function(){
      const args = arguments;
      clearTimeout(t);
      t = setTimeout(function(){ fn.apply(null, args); }, wait);
    };
  }

  async function doSearch(query, hitsPerPage, container, statsEl){
    lastQuery = query;
    if(!index){
      console.warn('[elysia] Algolia index not ready');
      return;
    }
    if(!query || query.trim().length < 1){
      if(container) container.innerHTML = '';
      hideResults(container, qs(POWERED_ID));
      if(statsEl) statsEl.textContent = '';
      return;
    }
    try{
      const res = await index.search(query, {
        hitsPerPage: hitsPerPage || 8,
        attributesToSnippet: ['content:35','hierarchy.lvl1:20','hierarchy.lvl0:20','title:20'],
        attributesToHighlight: ['title','content','hierarchy.lvl1','hierarchy.lvl0','hierarchy.lvl2'],
        snippetEllipsisText: '…',
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>'
      });
      lastHits = res.hits || [];
      renderHits(lastHits, container);
      showResults(container, qs(POWERED_ID));
      if(statsEl){
        const nb = res.nbHits || lastHits.length;
        const ms = res.processingTimeMS || 0;
        statsEl.textContent = '找到 ' + nb + ' 条结果 · ' + ms + 'ms';
      }
    }catch(e){
      console.error('[elysia] Algolia search error', e);
      if(container) container.innerHTML = '<div class="search__empty">搜索出错，请稍后重试</div>';
      showResults(container, qs(POWERED_ID));
    }
  }

  function initAlgolia(){
    const cfg = getConfig();
    const pageCfg = getPageConfig();
    const effectiveCfg = cfg || pageCfg;
    if(!effectiveCfg || !effectiveCfg.appId || !effectiveCfg.apiKey || !effectiveCfg.indexName){
      // hide search if not configured
      const root = qs(ROOT_ID);
      if(root) root.style.display = 'none';
      return null;
    }
    if(typeof algoliasearch === 'undefined'){
      console.warn('[elysia] algoliasearch not loaded');
      const root = qs(ROOT_ID);
      if(root) root.style.display = 'none';
      return null;
    }
    client = algoliasearch(effectiveCfg.appId, effectiveCfg.apiKey);
    index = client.initIndex(effectiveCfg.indexName);
    return effectiveCfg;
  }

  function bindSidebar(cfg){
    const root = qs(ROOT_ID);
    const input = qs(INPUT_ID);
    const results = qs(RESULTS_ID);
    const clear = qs(CLEAR_ID);
    const powered = qs(POWERED_ID);
    if(!root || !input || !results) return;

    root.style.display = ''; // ensure visible

    // 清除按钮：仅有内容时显示，空白时隐藏（即时切换，不等防抖）
    function syncClear(){ if(clear) clear.hidden = !input.value.trim(); }
    syncClear();

    const debounced = debounce(function(){
      const q = input.value.trim();
      syncClear();
      doSearch(q, cfg.hitsPerPage, results, null);
    }, 260);

    input.addEventListener('input', function(){ syncClear(); debounced(); });
    input.addEventListener('focus', function(){
      if(input.value.trim() && lastHits.length){
        showResults(results, powered);
      }
    });
    input.addEventListener('keydown', function(e){
      const hits = results.querySelectorAll('.search__hit');
      if(e.key === 'ArrowDown'){
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, hits.length - 1);
        updateActive(results);
      } else if(e.key === 'ArrowUp'){
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, -1);
        updateActive(results);
      } else if(e.key === 'Enter'){
        if(activeIndex >= 0 && hits[activeIndex]){
          e.preventDefault();
          hits[activeIndex].click();
        }
      } else if(e.key === 'Escape'){
        hideResults(results, powered);
        input.blur();
      }
    });

    if(clear){
      clear.addEventListener('click', function(){
        input.value = '';
        clear.hidden = true;
        results.innerHTML = '';
        hideResults(results, powered);
        input.focus();
        lastQuery = '';
        lastHits = [];
      });
    }

    // click outside to close
    document.addEventListener('click', function(e){
      if(!root.contains(e.target)){
        hideResults(results, powered);
      }
    });

    // "/" to focus
    document.addEventListener('keydown', function(e){
      if(e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)){
        e.preventDefault();
        input.focus();
      }
    });
  }

  function bindPage(cfg){
    const input = qs(PAGE_INPUT_ID);
    const results = qs(PAGE_RESULTS_ID);
    const stats = qs(PAGE_STATS_ID);
    if(!input || !results) return;
    // use larger hits per page for dedicated page
    const pageCfg = getPageConfig() || cfg;
    const hitsPerPage = (pageCfg && pageCfg.hitsPerPage) ? pageCfg.hitsPerPage : 12;

    const debounced = debounce(function(){
      const q = input.value.trim();
      // update URL ?query=
      try{
        const url = new URL(window.location.href);
        if(q) url.searchParams.set('q', q);
        else url.searchParams.delete('q');
        history.replaceState(null,'',url.toString());
      }catch(_){}
      doSearch(q, hitsPerPage, results, stats);
    }, 280);

    input.addEventListener('input', debounced);
    input.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){
        input.value = '';
        results.innerHTML = '';
        if(stats) stats.textContent = '';
      }
    });

    // init from ?q=
    try{
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if(q){
        input.value = q;
        doSearch(q, hitsPerPage, results, stats);
      }
    }catch(_){}
  }

  // expose for debugging
  window.ElysiaSearch = { getConfig, doSearch };

  // init after DOM and after algoliasearch script loaded
  function ready(){
    const cfg = initAlgolia();
    if(!cfg) return;
    bindSidebar(cfg);
    bindPage(cfg);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }

  // if algoliasearch loads asynchronously, retry
  let retry = 0;
  const timer = setInterval(function(){
    if(typeof algoliasearch !== 'undefined'){
      clearInterval(timer);
      if(!client) ready();
    }
    retry++;
    if(retry > 20) clearInterval(timer);
  }, 500);
})();
