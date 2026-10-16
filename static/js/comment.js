/* Elysia — comment.js — vanilla, no deps
 * 评论区行为：主题同步（giscus/artalk/waline）+ Artalk/Waline 初始化。
 * 仅文章页按需加载（见 partials/comments-scripts.html），与 main.js 通过
 * `elysia:theme-change` 自定义事件解耦（detail: { isDark }）。 */
(function(){
  function getIsDark(){
    try{
      return document.documentElement.getAttribute('data-theme') === 'dark';
    }catch(e){ return false; }
  }
  function syncCommentTheme(isDark){
    if(typeof isDark !== 'boolean'){ isDark = getIsDark(); }
    // Giscus — postMessage to iframe (supports late load via retry)
    try{
      var iframe = document.querySelector('iframe.giscus-frame');
      if(iframe && iframe.contentWindow){
        iframe.contentWindow.postMessage({ giscus: { setConfig: { theme: isDark ? 'dark' : 'light' } } }, 'https://giscus.app');
      }
    }catch(e){}
    // Artalk — official setDarkMode
    try{
      if(window.Artalk && typeof window.Artalk.setDarkMode === 'function'){
        window.Artalk.setDarkMode(isDark);
      } else if(window.artalk && typeof window.artalk.setDarkMode === 'function'){
        window.artalk.setDarkMode(isDark);
      }
      var artalkEl = document.getElementById('artalk');
      if(artalkEl){
        artalkEl.setAttribute('data-dark', String(isDark));
      }
    }catch(e){}
    try{
      var walineEl = document.getElementById('waline');
      if(walineEl){
        walineEl.setAttribute('data-waline-dark', String(isDark));
      }
    }catch(e){}
  }
  // 确保 giscus 异步加载后也能同步暗色：观察 iframe 插入 + 轮询 + load 事件
  function initGiscusWatcher(){
    try{
      var retrySync = function(){ setTimeout(function(){ syncCommentTheme(); }, 80); setTimeout(function(){ syncCommentTheme(); }, 400); setTimeout(function(){ syncCommentTheme(); }, 1200); };
      var observer = new MutationObserver(function(muts){
        muts.forEach(function(m){
          m.addedNodes.forEach(function(n){
            if(!n || n.nodeType!==1) return;
            if(n.tagName==='IFRAME' && n.classList.contains('giscus-frame')){
              n.addEventListener('load', function(){ syncCommentTheme(); });
              retrySync();
            }
            if(n.querySelectorAll){
              var f = n.querySelector('iframe.giscus-frame');
              if(f){
                f.addEventListener('load', function(){ syncCommentTheme(); });
                retrySync();
              }
            }
          });
        });
      });
      observer.observe(document.body, {childList:true, subtree:true});
      // 轮询：client.js 可能晚于 DOMContentLoaded 数秒才创建 iframe
      var tries=0;
      var iv=setInterval(function(){
        var f=document.querySelector('iframe.giscus-frame');
        if(f){ syncCommentTheme(); clearInterval(iv); }
        if(++tries>30) clearInterval(iv);
      }, 400);
      // 已存在的 iframe 直接绑定
      var existing=document.querySelector('iframe.giscus-frame');
      if(existing){
        existing.addEventListener('load', function(){ syncCommentTheme(); });
        retrySync();
      }
    }catch(e){}
  }
  function initArtalk(){
    var el = document.getElementById('artalk');
    if(!el) return;
    if(!(window.Artalk && window.ARTALK_CONFIG)) return;
    try{
      var cfg = window.ARTALK_CONFIG;
      window.Artalk.init({
        el: '#artalk',
        pageKey: cfg.pageKey || location.pathname,
        pageTitle: document.title,
        server: cfg.server,
        site: cfg.site || document.title,
        placeholder: cfg.placeholder || '',
        noComment: cfg.noComment || '',
        gravatar: { mirror: cfg.gravatarMirror || '' },
        avatarURL: cfg.avatarMirror || ''
      });
    }catch(e){ console.error('Artalk init failed', e); }
  }
  function initWaline(){
    var el = document.getElementById('waline');
    if(!el) return;
    var c = window.WALINE_CONFIG || {};
    if(!c.serverURL) return;
    import('https://unpkg.com/@waline/client@v3/dist/waline.js').then(function(m){
      try{
        m.init({
          el: '#waline',
          serverURL: c.serverURL,
          lang: c.lang || 'zh-CN',
          dark: c.dark === 'auto' ? 'html[data-theme="dark"]' : c.dark,
          emoji: c.emoji,
          meta: c.meta,
          requiredMeta: c.requiredMeta,
          login: c.login || 'enable',
          placeholder: c.placeholder || undefined
        });
      }catch(e){ console.error('Waline init failed', e); }
    }).catch(function(e){ console.error('Waline load failed', e); });
  }
  // 主题切换由 main.js 广播，本文件只订阅（已做存在性兜底：无 detail 时自读 data-theme）
  document.addEventListener('elysia:theme-change', function(ev){
    var isDark = (ev && ev.detail && typeof ev.detail.isDark === 'boolean') ? ev.detail.isDark : getIsDark();
    syncCommentTheme(isDark);
    setTimeout(function(){ syncCommentTheme(isDark); }, 250);
  });
  document.addEventListener('DOMContentLoaded', function(){
    initArtalk();
    initWaline();
    initGiscusWatcher();
    // 首次渲染后再次同步，确保 giscus iframe 已生成
    setTimeout(function(){ syncCommentTheme(); }, 500);
  });
  // 尽早监听 giscus iframe，避免错过首次插入
  try{ initGiscusWatcher(); }catch(e){}
  // 额外兜底：监听 giscus 异步加载完成后同步
  window.addEventListener('load', function(){ setTimeout(function(){ syncCommentTheme(); }, 400); });
})();
