/* Elysia — main.js — vanilla, no deps */
(function(){
  const html = document.documentElement;
  const LS_THEME = 'elysia-theme';
  const LS_PALETTE = 'elysia-palette';

  // ── Theme ── 仅亮/暗两档，默认亮色
  function applyTheme(t){
    const theme = (t==='dark') ? 'dark' : 'light';
    html.setAttribute('data-theme', theme);
    localStorage.setItem(LS_THEME, theme);
    syncThemeIcon();
  }
  function syncThemeIcon(){
    const cur = localStorage.getItem(LS_THEME) || 'light';
    const normalized = (cur==='dark') ? 'dark' : 'light';
    const sun=document.getElementById('iconSun'), moon=document.getElementById('iconMoon'), monitor=document.getElementById('iconMonitor');
    if(sun&&moon&&monitor){
      // 亮色下显示月亮（提示切暗色），暗色下显示太阳（提示切亮色）
      sun.style.display = normalized==='dark' ? 'block' : 'none';
      moon.style.display = normalized==='light' ? 'block' : 'none';
      monitor.style.display = 'none';
    }
    const btn=document.getElementById('themeToggle');
    if(btn){
      if(normalized==='dark') btn.title = '暗色模式 - 点击切换为亮色';
      else btn.title = '亮色模式 - 点击切换为暗色';
      btn.setAttribute('aria-label', btn.title);
    }
  }
  function getIsDark(){
    const attr = html.getAttribute('data-theme');
    if(attr === 'dark') return true;
    if(attr === 'light') return false;
    // 兼容历史 auto 值：视为亮色
    return false;
  }
  function syncCommentTheme(){
    const isDark = getIsDark();
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
      var retrySync = function(){ setTimeout(syncCommentTheme, 80); setTimeout(syncCommentTheme, 400); setTimeout(syncCommentTheme, 1200); };
      var observer = new MutationObserver(function(muts){
        muts.forEach(function(m){
          m.addedNodes.forEach(function(n){
            if(!n || n.nodeType!==1) return;
            if(n.tagName==='IFRAME' && n.classList.contains('giscus-frame')){
              n.addEventListener('load', syncCommentTheme);
              retrySync();
            }
            if(n.querySelectorAll){
              var f = n.querySelector('iframe.giscus-frame');
              if(f){
                f.addEventListener('load', syncCommentTheme);
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
        existing.addEventListener('load', syncCommentTheme);
        retrySync();
      }
    }catch(e){}
  }
  let _themeClickBound = false;
  function initTheme(){
    var saved = localStorage.getItem(LS_THEME);
    // 兼容历史 auto 值，统一迁移为 light
    if(saved==='auto' || (saved!=='light' && saved!=='dark')){
      saved = 'light';
      localStorage.setItem(LS_THEME, saved);
    }
    var theme = saved || 'light';
    if(theme!=='dark' && theme!=='light') theme='light';
    html.setAttribute('data-theme', theme);
    syncThemeIcon();
    // 初始即尝试同步，覆盖首屏 giscus 已渲染为 light 的情况
    setTimeout(syncCommentTheme, 300);
    setTimeout(syncCommentTheme, 1000);
    if(_themeClickBound) return;
    const btn=document.getElementById('themeToggle');
    if(btn){
      _themeClickBound = true;
      btn.addEventListener('click', ()=>{
        var cur = localStorage.getItem(LS_THEME) || 'light';
        if(cur!=='dark' && cur!=='light') cur='light';
        var next = cur==='light' ? 'dark' : 'light';
        html.setAttribute('data-theme', next);
        localStorage.setItem(LS_THEME, next);
        syncThemeIcon();
        syncCommentTheme();
        setTimeout(syncCommentTheme, 250);
        setTimeout(syncCommentTheme, 900);
      });
    }
  }

  // ── Palette ──
  function applyPalette(p){
    html.setAttribute('data-palette', p);
    localStorage.setItem(LS_PALETTE, p);
    document.querySelectorAll('.palette__dot').forEach(el=>{
      el.classList.toggle('is-active', el.getAttribute('data-palette')===p);
    });
    document.querySelectorAll('.palette__option').forEach(el=>{
      const isActive = el.getAttribute('data-palette')===p;
      el.classList.toggle('is-active', isActive);
      el.setAttribute('aria-selected', String(isActive));
    });
  }
  let _paletteBound = false;
  function initPalette(){
    const saved = localStorage.getItem(LS_PALETTE);
    const def = html.getAttribute('data-palette') || 'default';
    const cur = saved || def;
    applyPalette(cur);
    if(_paletteBound) return;
    // 若 DOM 尚未就绪（defer 异常），延迟到下一次
    if(!document.getElementById('paletteToggle') && !document.querySelector('.palette__dot')) return;
    _paletteBound = true;
    // legacy direct dots (if any)
    document.querySelectorAll('.palette__dot').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const p = btn.getAttribute('data-palette');
        if(p) applyPalette(p);
      });
    });
    // new dropdown options
    document.querySelectorAll('.palette__option').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const p = btn.getAttribute('data-palette');
        if(p){
          applyPalette(p);
          // close dropdown
          const dd = document.getElementById('paletteDropdown');
          const tg = document.getElementById('paletteToggle');
          if(dd){ dd.hidden = true; dd.classList.remove('is-open'); }
          if(tg) tg.setAttribute('aria-expanded','false');
        }
      });
    });
    // dropdown toggle
    const toggle = document.getElementById('paletteToggle');
    const dropdown = document.getElementById('paletteDropdown');
    const wrap = document.getElementById('paletteWrap');
    if(toggle && dropdown && wrap){
      toggle.addEventListener('click', (e)=>{
        e.stopPropagation();
        const isHidden = dropdown.hidden;
        dropdown.hidden = !isHidden;
        dropdown.classList.toggle('is-open', isHidden);
        toggle.setAttribute('aria-expanded', String(isHidden));
        // close lang if open
        const ld=document.getElementById('langDropdown');
        const lt=document.getElementById('langToggle');
        if(ld && !ld.hidden){
          ld.hidden=true; ld.classList.remove('is-open'); if(lt) lt.setAttribute('aria-expanded','false');
        }
      });
      // close on outside click
      document.addEventListener('click', (e)=>{
        try{
          if(!wrap.contains(e.target)){
            dropdown.hidden = true;
            dropdown.classList.remove('is-open');
            toggle.setAttribute('aria-expanded','false');
          }
        }catch(err){}
      });
      // close on Escape
      document.addEventListener('keydown', (e)=>{
        if(e.key === 'Escape' && !dropdown.hidden){
          dropdown.hidden = true;
          dropdown.classList.remove('is-open');
          toggle.setAttribute('aria-expanded','false');
          toggle.focus();
        }
      });
    } else if(toggle && dropdown){
      // fallback without wrap
      toggle.addEventListener('click', (e)=>{
        e.stopPropagation();
        const willShow = dropdown.hidden;
        dropdown.hidden = !willShow;
        dropdown.classList.toggle('is-open', willShow);
        toggle.setAttribute('aria-expanded', String(willShow));
      });
    }
  }

  // ── Language switch ──
  function initLang(){
    const toggle=document.getElementById('langToggle');
    const dropdown=document.getElementById('langDropdown');
    const wrap=document.getElementById('langWrap');
    if(!toggle||!dropdown) return;
    const w = wrap || toggle.parentElement;
    toggle.addEventListener('click', (e)=>{
      e.stopPropagation();
      const isHidden = dropdown.hidden;
      dropdown.hidden = !isHidden;
      dropdown.classList.toggle('is-open', isHidden);
      toggle.setAttribute('aria-expanded', String(isHidden));
      // close palette if open
      const pd=document.getElementById('paletteDropdown');
      const pt=document.getElementById('paletteToggle');
      if(pd && !pd.hidden){
        pd.hidden=true; pd.classList.remove('is-open'); if(pt) pt.setAttribute('aria-expanded','false');
      }
    });
    document.addEventListener('click', (e)=>{
      try{
        if(w && w.contains(e.target)) return;
        if(!dropdown.hidden){
          dropdown.hidden=true;
          dropdown.classList.remove('is-open');
          toggle.setAttribute('aria-expanded','false');
        }
      }catch(err){}
    });
    document.addEventListener('keydown', (e)=>{
      if(e.key==='Escape' && !dropdown.hidden){
        dropdown.hidden=true;
        dropdown.classList.remove('is-open');
        toggle.setAttribute('aria-expanded','false');
        toggle.focus();
      }
    });
    // also close lang when palette opens — handled in palette toggle via sync
  }

  // ── Year progress ──
  function initYearProgress(){
    const bar=document.getElementById('yearProgressBar');
    const tip=document.getElementById('yearProgressTip');
    const wrap=document.getElementById('yearProgress');
    if(!bar||!tip) return;
    const now=new Date();
    const year=now.getFullYear();
    const start=new Date(year,0,1);
    const end=new Date(year+1,0,1);
    const total=end-start;
    const elapsed=now-start;
    const pct=(elapsed/total*100);
    const daysTotal = Math.round(total/86400000);
    const daysPassed = Math.floor(elapsed/86400000)+1;
    const pctFixed = pct.toFixed(2);
    bar.style.width=pctFixed+'%';
    if(wrap){
      wrap.setAttribute('aria-valuenow', pctFixed);
      wrap.setAttribute('aria-valuetext', pctFixed+'%');
    }
    tip.textContent='今年已过去 '+daysPassed+' / '+daysTotal+' 天 · '+pctFixed+'%';
    // also update tooltip on hover position?
  }

  // ── Article Expiry — client live correction (supports rebuild staleness) ──
  function initExpiry(){
    var el=document.getElementById('articleExpiry');
    if(!el) return;
    try{
      var daysAttr=el.getAttribute('data-expiry-days');
      var days=parseInt(daysAttr,10);
      if(isNaN(days) || days < 0) days=90;
      var tsAttr=el.getAttribute('data-expiry-ts');
      var ts=parseInt(tsAttr,10);
      if(isNaN(ts)) return;
      var nowSec=Math.floor(Date.now()/1000);
      var diff=Math.floor((nowSec - ts)/86400);
      if(diff < 0) diff=0;
      var raw=el.getAttribute('data-expiry-text') || '';
      var dateStr=el.getAttribute('data-expiry-date') || '';
      var body=el.querySelector('.article-expiry__body');
      if(diff >= days){
        if(body && raw){
          var rendered=raw;
          // simple replaceAll with fallback for old browsers
          if(String.prototype.replaceAll){
            rendered=rendered.replaceAll('{days}', String(days)).replaceAll('{date}', dateStr).replaceAll('{diff}', String(diff));
          } else {
            rendered=rendered.split('{days}').join(String(days)).split('{date}').join(dateStr).split('{diff}').join(String(diff));
          }
          body.textContent=rendered;
        } else if(body){
          // fallback: ensure {diff} inside already-rendered body is updated
          var cur=body.textContent || '';
          if(cur.indexOf('{diff}') !== -1){
            if(String.prototype.replaceAll) body.textContent=cur.replaceAll('{diff}', String(diff));
            else body.textContent=cur.split('{diff}').join(String(diff));
          }
        }
        el.hidden=false;
        el.style.display='';
        el.removeAttribute('hidden');
      } else {
        el.hidden=true;
        el.style.display='none';
      }
    }catch(e){
      console.warn('expiry init failed', e);
    }
  }

  // ── Scroll to top ──
  function initToTop(){
    const btn=document.getElementById('toTop');
    if(!btn) return;
    const onScroll=()=>{
      if(window.scrollY>320) btn.classList.add('is-visible');
      else btn.classList.remove('is-visible');
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
    btn.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));
  }

  // ── Drawer (mobile) — collapsed by default, floating panel + backdrop ──
  function initDrawer(){
    const btn=document.getElementById('drawerBtn');
    const sb=document.getElementById('sidebar');
    const backdrop=document.getElementById('drawerBackdrop');
    if(!btn||!sb) return;
    const mq=window.matchMedia('(max-width: 768px)');
    function syncBackdrop(){
      if(!backdrop) return;
      if(!mq.matches || sb.classList.contains('is-collapsed')){
        backdrop.hidden = true;
        backdrop.classList.remove('is-visible');
      } else {
        backdrop.hidden = false;
        // force reflow then show
        void backdrop.offsetWidth;
        backdrop.classList.add('is-visible');
      }
    }
    function apply(){
      if(mq.matches){
        sb.classList.add('is-collapsed');
        btn.setAttribute('aria-expanded','false');
        document.body.style.overflow = '';
      } else {
        sb.classList.remove('is-collapsed');
        btn.setAttribute('aria-expanded','true');
        document.body.style.overflow = '';
      }
      syncBackdrop();
    }
    apply();
    if(mq.addEventListener) mq.addEventListener('change', apply);
    else if(mq.addListener) mq.addListener(apply);
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const collapsed=sb.classList.toggle('is-collapsed');
      btn.setAttribute('aria-expanded', String(!collapsed));
      try{
        if(mq.matches){
          document.body.style.overflow = collapsed ? '' : 'hidden';
        }
      }catch(err){}
      syncBackdrop();
    });
    if(backdrop){
      backdrop.addEventListener('click', ()=>{
        if(!mq.matches) return;
        sb.classList.add('is-collapsed');
        btn.setAttribute('aria-expanded','false');
        document.body.style.overflow = '';
        syncBackdrop();
      });
    }
    // close on outside click
    document.addEventListener('click', function(e){
      try{
        if(!mq.matches) return;
        if(sb.classList.contains('is-collapsed')) return;
        if(sb.contains(e.target) || btn.contains(e.target) || (backdrop && backdrop.contains(e.target))) return;
        sb.classList.add('is-collapsed');
        btn.setAttribute('aria-expanded','false');
        document.body.style.overflow = '';
        syncBackdrop();
      }catch(err){}
    });
    // close on Escape
    document.addEventListener('keydown', function(e){
      if(e.key==='Escape' && !sb.classList.contains('is-collapsed') && mq.matches){
        sb.classList.add('is-collapsed');
        btn.setAttribute('aria-expanded','false');
        document.body.style.overflow = '';
        syncBackdrop();
        btn.focus();
      }
    });
  }

  // ── Code blocks ──
  function initCodeBlocks(){
    const lineNumbersEnabled = html.getAttribute('data-code-line-numbers') !== 'false';
    const pres=document.querySelectorAll('#articleContent pre, .article__content pre, .tabs__panel pre');
    pres.forEach(pre=>{
      // skip if already wrapped
      if(pre.closest('.code-wrap')) return;
      // Detect if it's a code block (has code child)
      const code=pre.querySelector('code');
      if(!code) return;
      // Extract meta - giallo/Zola puts data-lang/data-name on <code> (not <pre>)
      let lang = pre.getAttribute('data-lang') || code.getAttribute('data-lang') || pre.dataset.lang || code.dataset.lang || pre.getAttribute('data-language') || code.getAttribute('data-language') || '';
      let name = pre.getAttribute('data-name') || code.getAttribute('data-name') || pre.getAttribute('data-filename') || code.getAttribute('data-filename') || pre.dataset.name || code.dataset.name || pre.dataset.filename || code.dataset.filename || '';
      if(!lang){
        const cls = (code.className || '') + ' ' + (pre.className || '');
        const m = cls.match(/language-([a-z0-9+#-]+)/i) || cls.match(/lang-([a-z0-9+#-]+)/i);
        if(m) lang=m[1];
      }
      if(!name){
        name='';
      }
      // Normalize lang lowercase
      lang = (lang||'text').toLowerCase();
      // Line numbers — 以真实渲染行数为准，彻底对齐
      const hasGialloLn = !!code.querySelector('.giallo-ln');
      const text = code.textContent || '';
      // 统一步骤：只要存在 giallo 行，就先清除行间的空白文本节点，避免 pre white-space:pre 产生额外行距（无论是否显示 gutter）
      const gialloCheck = code.querySelectorAll('.giallo-l');
      if(gialloCheck.length){
        Array.from(code.childNodes).forEach(n=>{
          if(n.nodeType===3 && /^\s*$/.test(n.textContent||'')) n.remove();
        });
      }
      let gutter = null;
      if (lineNumbersEnabled && !hasGialloLn) {
        // 优先以 giallo 渲染的行数为准，保证与 .giallo-l 1:1
        const gialloLines = code.querySelectorAll('.giallo-l');
        let lineCount = 0;
        if(gialloLines.length){
          lineCount = gialloLines.length;
        } else {
          // 纯文本：按 \n 分割，保留末行空行语义，空文本为 1 行
          const raw = text;
          if(raw === '') lineCount = 1;
          else {
            // 保留末尾空行： "a\nb\n" -> 3 行（a,b,""），与 giallo 行为一致
            lineCount = raw.split('\n').length;
            // 若以 \n 结尾且最后为空字符串，giallo 会生成空行，保留
          }
        }
        gutter = document.createElement('div');
        gutter.className='code-wrap__gutter';
        gutter.setAttribute('aria-hidden','true');
        gutter.innerHTML = Array.from({length: lineCount}, (_,i)=> `<span class="gutter-line">${i+1}</span>`).join('');
      }
      // Wrapper
      const wrap=document.createElement('div');
      wrap.className='code-wrap';
      // Header
      const header=document.createElement('div');
      header.className='code-wrap__header';
      const left=document.createElement('span');
      left.className='code-wrap__lang';
      left.textContent=lang;
      const fname=document.createElement('span');
      fname.className='code-wrap__filename';
      if(name){
        fname.textContent=name;
        fname.title=name;
      } else {
        fname.style.display='none';
      }
      const copy=document.createElement('button');
      copy.className='code-wrap__copy';
      copy.type='button';
      copy.setAttribute('aria-label','复制');
      copy.title='复制';
      // 图标来自 static/icons.svg sprite（base.html 注入 window.ELYSIA_ICONS_URL）
      const spriteUrl = (function(){
        if(window.ELYSIA_ICONS_URL) return window.ELYSIA_ICONS_URL;
        var u = document.querySelector('use[href*="icons.svg"]');
        if(u){
          var h = u.getAttribute('href') || '';
          if(h) return h.split('#')[0];
        }
        return 'icons.svg';
      })();
      const iconCopy='<svg viewBox="0 0 24 24" aria-hidden="true"><use href="'+spriteUrl+'#i-copy"></use></svg>';
      const iconDone='<svg viewBox="0 0 24 24" aria-hidden="true"><use href="'+spriteUrl+'#i-check"></use></svg>';
      copy.innerHTML=iconCopy;
      copy.addEventListener('click', async ()=>{
        try{
          await navigator.clipboard.writeText(text);
          copy.innerHTML=iconDone;
          copy.setAttribute('aria-label','已复制');
          setTimeout(()=>{ copy.innerHTML=iconCopy; copy.setAttribute('aria-label','复制'); }, 1500);
        }catch(e){
          const ta=document.createElement('textarea');
          ta.value=text; document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); ta.remove();
          copy.innerHTML=iconDone;
          setTimeout(()=>{ copy.innerHTML=iconCopy; },1500);
        }
      });
      header.appendChild(left);
      header.appendChild(fname);
      header.appendChild(copy);
      // Body
      const body=document.createElement('div');
      body.className='code-wrap__body';
      // Move pre into body
      // Style pre
      pre.classList.add('code-wrap__pre');
      if(code.querySelector('.giallo-l')) pre.classList.add('has-giallo');
      // Ensure code has no bg
      if (gutter) body.appendChild(gutter);
      // Need to clone? Actually move pre
      wrap.appendChild(header);
      wrap.appendChild(body);
      // Insert wrap before pre's parent position
      pre.parentNode.insertBefore(wrap, pre);
      body.appendChild(pre);
      // ── Highlight lines (hl_lines → z-hl) — sync gutter with code ──
      try{
        const hlNodes = code.querySelectorAll('.giallo-l.z-hl, .giallo-l.hll, .z-hl');
        if(hlNodes.length && gutter){
          const gutterLines = gutter.querySelectorAll('.gutter-line');
          // giallo-l are the same count as gutter lines when generated by Zola
          const codeLines = code.querySelectorAll('.giallo-l');
          if(codeLines.length === gutterLines.length){
            codeLines.forEach((ln, idx)=>{
              if(ln.classList.contains('z-hl') || ln.classList.contains('hll')){
                if(gutterLines[idx]) gutterLines[idx].classList.add('hl');
              }
            });
          } else {
            // Fallback: mark gutter lines by index of hlNodes
            hlNodes.forEach((n)=>{
              // find index of this hl node among .giallo-l
              const all = Array.from(code.querySelectorAll('.giallo-l'));
              const idx = all.indexOf(n);
              if(idx >=0 && gutterLines[idx]) gutterLines[idx].classList.add('hl');
            });
          }
        }
        // Also support hl_lines specified via data attribute on pre/code (e.g., data-hl-lines="1 3-5")
        const hlAttr = pre.getAttribute('data-hl-lines') || code.getAttribute('data-hl-lines') || pre.getAttribute('hl_lines') || code.getAttribute('hl_lines');
        if(hlAttr && gutter){
          const parseHl = (str)=>{
            const set=new Set();
            str.split(/[\s,]+/).forEach(tok=>{
              if(!tok) return;
              if(tok.includes('-')){
                const [a,b]=tok.split('-').map(x=>parseInt(x,10));
                if(!isNaN(a)&&!isNaN(b)) for(let i=Math.min(a,b); i<=Math.max(a,b); i++) set.add(i);
              } else {
                const n=parseInt(tok,10);
                if(!isNaN(n)) set.add(n);
              }
            });
            return set;
          };
          const hlSet=parseHl(hlAttr);
          const gutterLines=gutter.querySelectorAll('.gutter-line');
          const codeLines=code.querySelectorAll('.giallo-l');
          // highlight code lines
          if(codeLines.length){
            codeLines.forEach((ln, idx)=>{
              if(hlSet.has(idx+1)) ln.classList.add('z-hl');
            });
          } else {
            // plain code without giallo-l: wrap lines?
            const lines=text.split('\n');
            // if plain, we could add hl to gutter only
          }
          gutterLines.forEach((gl, idx)=>{
            if(hlSet.has(idx+1)) gl.classList.add('hl');
          });
        }
      }catch(e){}
      // Sync scroll? no
    });
  }

  // ── Tabs ──
  function initTabs(){
    document.querySelectorAll('[data-component="tabs"]').forEach(root=>{
      const nav=root.querySelector('.tabs__nav');
      const panels=root.querySelector('.tabs__panels');
      if(!nav||!panels) return;
      const rawEl=root.querySelector('.tabs__raw');
      // Server-rendered path (new): nav already has buttons from Tera
      if(!rawEl){
        const btns=nav.querySelectorAll('.tabs__btn');
        const tabPanels=panels.querySelectorAll('.tabs__panel');
        if(!btns.length||!tabPanels.length) return;
        function activateTab(idx){
          btns.forEach(b=>{b.classList.remove('is-active');b.setAttribute('aria-selected','false')});
          tabPanels.forEach(p=>p.classList.remove('is-active'));
          btns[idx].classList.add('is-active'); btns[idx].setAttribute('aria-selected','true');
          if(tabPanels[idx]){
            tabPanels[idx].classList.add('is-active');
            // Fix code blocks inside tabs: force reflow to ensure gutter aligns after hidden->visible
            tabPanels[idx].querySelectorAll('.code-wrap').forEach(function(w){
              // trigger reflow
              void w.offsetHeight;
              var body = w.querySelector('.code-wrap__body');
              if(body){ body.style.overflow='auto'; void body.offsetWidth; }
            });
          }
        }
        btns.forEach((btn, idx)=>{
          btn.addEventListener('click', ()=> activateTab(idx));
        });
        return;
      }
      // Legacy JS split path (hidden raw)
      let html = rawEl.innerHTML;
      const parts = html.split(/<!--\s*tab\s+([^>]+?)\s*-->/i);
      if(parts.length<3){
        const fallback=document.createElement('div');
        fallback.className='tabs__panel is-active';
        fallback.innerHTML=html;
        panels.appendChild(fallback);
        return;
      }
      const tabs=[];
      for(let i=1;i<parts.length;i+=2){
        const label=(parts[i]||'').trim();
        const content=(parts[i+1]||'').trim();
        if(label) tabs.push({label, content});
      }
      if(tabs.length===0){
        tabs.push({label:'Tab', content:html});
      }
      nav.innerHTML='';
      panels.innerHTML='';
      tabs.forEach((t, idx)=>{
        const btn=document.createElement('button');
        btn.className='tabs__btn'+(idx===0?' is-active':'');
        btn.type='button';
        btn.textContent=t.label;
        btn.setAttribute('role','tab');
        btn.setAttribute('aria-selected', String(idx===0));
        btn.addEventListener('click', ()=>{
          nav.querySelectorAll('.tabs__btn').forEach(b=>{b.classList.remove('is-active');b.setAttribute('aria-selected','false')});
          panels.querySelectorAll('.tabs__panel').forEach(p=>p.classList.remove('is-active'));
          btn.classList.add('is-active'); btn.setAttribute('aria-selected','true');
          panels.children[idx].classList.add('is-active');
          // reflow code blocks in newly visible panel
          var ap = panels.children[idx];
          if(ap) ap.querySelectorAll('.code-wrap').forEach(function(w){ void w.offsetHeight; });
          // also handle yet-unwrapped pre inside panel (if content was markdown with pre)
          if(ap) initCodeBlocks();
        });
        nav.appendChild(btn);
        const panel=document.createElement('div');
        panel.className='tabs__panel'+(idx===0?' is-active':'');
        panel.setAttribute('role','tabpanel');
        panel.innerHTML=t.content;
        panels.appendChild(panel);
      });
      rawEl.remove();
      // after legacy tabs built, wrap any code blocks inside them
      setTimeout(initCodeBlocks, 0);
    });
  }

  // ── Encryption ── 解密由 static/js/site-decrypt.js（SSG 通用，无主题依赖）执行；此处仅做两件事：
  // 1) 未走加密脚本的页面（锁面板无载荷，如本地预览）→ 直接展示正文；
  // 2) 监听 site-encrypt:unlocked → 解密成功后重初始化组件。
  function initEncryption(){
    const box=document.getElementById('encryptedBox');
    const content=document.getElementById('articleContent');
    if(box && !box.hasAttribute('data-site-encrypt')){
      box.style.display='none';
      if(content) content.hidden=false;
    }
    // 清理历史残留（旧版明文密码键）
    try{
      const legacyKey='elysia-pwd-'+location.pathname;
      localStorage.removeItem(legacyKey);
      sessionStorage.removeItem(legacyKey);
    }catch(e){}
    document.addEventListener('site-encrypt:unlocked', (e)=>{
      try{
        const t=e && e.detail && e.detail.target;
        if(t && content && t===content){
          initCodeBlocks();
          initTabs();
          try{ initVideo(); }catch(err){}
          try{ initAudioPlayers(); }catch(err2){}
        }
      }catch(err){}
    });
  }

  // ── TOC spy ── 桌面与移动端共用，高亮同步
  function initTOC(){
    const toc=document.getElementById('toc');
    const tocMobile=document.querySelector('.toc-mobile .toc');
    const aside=document.getElementById('tocAside');
    const seriesNav = aside ? aside.querySelector('.series-nav') : null;
    if(seriesNav && aside){
      aside.classList.add('is-visible');
      aside.classList.add('has-series');
    }
    // 无任何 TOC 时仅处理 Wiki 目录导航
    if(!toc && !tocMobile){
      if(!seriesNav) return;
      return;
    }
    if(toc && aside) aside.classList.add('is-visible');
    const headings=document.querySelectorAll('#articleContent h1, #articleContent h2, #articleContent h3, #articleContent h4');
    if(!headings.length) return;
    const allLinks = [];
    if(toc) allLinks.push(...toc.querySelectorAll('a'));
    if(tocMobile) allLinks.push(...tocMobile.querySelectorAll('a'));
    if(!allLinks.length) return;
    const map=new Map();
    // 去重 id -> 多个 link（桌面+移动端）
    allLinks.forEach(a=>{
      const href=a.getAttribute('href')||'';
      const id=href.split('#')[1];
      if(!id) return;
      const did=decodeURIComponent(id);
      if(!map.has(did)) map.set(did, []);
      map.get(did).push(a);
    });
    const observer=new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const id=entry.target.id;
          const links=map.get(id);
          if(links){
            allLinks.forEach(l=>l.classList.remove('is-active'));
            links.forEach(l=>l.classList.add('is-active'));
          }
        }
      });
    }, {rootMargin:'-20% 0px -70% 0px', threshold:0});
    headings.forEach(h=>{ if(h.id) observer.observe(h); });
    allLinks.forEach(a=>{
      a.addEventListener('click', (e)=>{
        const href=a.getAttribute('href')||'';
        const id=href.split('#')[1];
        if(!id) return;
        const target=document.getElementById(decodeURIComponent(id));
        if(target){
          e.preventDefault();
          target.scrollIntoView({behavior:'smooth', block:'start'});
          history.pushState(null,'','#'+id);
        }
      });
    });
  }

  // ── Infinite pagination ──
  function initInfinite(){
    const sentinel=document.getElementById('sentinel');
    const pagination=document.getElementById('pagination');
    const list=document.getElementById('postList');
    const loader=document.getElementById('infiniteLoader');
    if(!sentinel||!pagination||!list) return;
    let next = pagination.getAttribute('data-next')||'';
    // If pagination has links but data-next empty, parse from next anchor
    if(!next){
      const nextLink=pagination.querySelector('a[href*="page"]');
      if(nextLink) next=nextLink.getAttribute('href');
    }
    if(!next) return;
    let loading=false;
    let currentNext=next;
    const observer=new IntersectionObserver(async (entries)=>{
      if(!entries[0].isIntersecting || loading || !currentNext) return;
      loading=true;
      if(loader) loader.classList.add('is-loading');
      pagination.style.opacity='.5';
      try{
        const url=currentNext;
        const res=await fetch(url, {headers:{'X-Requested-With':'fetch'}});
        if(!res.ok) throw new Error('fetch failed');
        const html=await res.text();
        const doc=new DOMParser().parseFromString(html,'text/html');
        const newList=doc.getElementById('postList');
        const newPagination=doc.getElementById('pagination');
        if(newList){
          // append children — filter out pinned duplicates (pinned only on first page)
          Array.from(newList.children).forEach(child=>{
            if(child.nodeType !== 1) return;
            if(child.matches && child.matches('[data-pinned="true"]')) return;
            if(child.querySelector && child.querySelector('.post-card__pin')) return;
            list.appendChild(document.importNode(child,true));
          });
        }
        // update next
        if(newPagination){
          const dnext=newPagination.getAttribute('data-next')||'';
          currentNext=dnext;
          // update pagination element's data-next for future
          pagination.setAttribute('data-next', dnext);
          if(!dnext){
            // no more pages: hide pagination and sentinel
            observer.disconnect();
            sentinel.remove();
            if(loader) loader.style.display='none';
            pagination.style.display='none';
            // show end message
            const end=document.createElement('div');
            end.textContent='— 已加载全部 —';
            end.style.cssText='text-align:center;padding:14px;color:var(--muted);font-size:13px';
            list.parentNode.appendChild(end);
          } else {
            pagination.style.opacity='';
          }
        } else {
          observer.disconnect();
        }
      }catch(e){
        console.error('infinite load error', e);
        observer.disconnect();
      }finally{
        loading=false;
        if(loader) loader.classList.remove('is-loading');
      }
    }, {rootMargin:'400px'});
    observer.observe(sentinel);
  }

  // ── Enhance tables wrapping? CSS now uses width:fit-content + overflow ──
  function initTables(){
    // Table CSS handles fit-content width and horizontal scroll; no parent wrapper needed
  }

  // ── Video/Audio — autoplay 默认关闭，仅当 data-autoplay="1" 时允许 ──
  function initVideo(){
    function kill(root){
      root.querySelectorAll('video').forEach(function(v){
        var wrap = v.closest('.video-wrap') || v.closest('.audio-wrap');
        var allowAuto = v.getAttribute('data-autoplay') === '1' || (wrap && wrap.getAttribute('data-autoplay') === '1');
        if(allowAuto) return;
        if(v.hasAttribute('autoplay')) v.removeAttribute('autoplay');
        v.autoplay = false;
        if(!v.hasAttribute('preload')) v.setAttribute('preload','metadata');
        try{ if(!v.paused) v.pause(); }catch(e){}
      });
      root.querySelectorAll('.audio-wrap audio').forEach(function(a){
        var wrap = a.closest('.audio-wrap') || a.closest('.audio-player');
        var allowAuto = a.getAttribute('data-autoplay') === '1' || (wrap && wrap.getAttribute('data-autoplay') === '1');
        if(allowAuto) return;
        if(a.hasAttribute('autoplay')) a.removeAttribute('autoplay');
        a.autoplay = false;
        try{ if(!a.paused) a.pause(); }catch(e){}
      });
      root.querySelectorAll('audio').forEach(function(a){
        var wrap = a.closest('.audio-wrap');
        // 兼容旧结构：仅当明确允许时保留
        var isAllowed = wrap && wrap.getAttribute('data-autoplay') === '1';
        if(isAllowed) return;
        // 已由上一段处理，此处仅兜底
      });
      root.querySelectorAll('.video-wrap iframe').forEach(function(f){
        try{
          var wrap = f.closest('.video-wrap');
          var allowAuto = wrap && wrap.getAttribute('data-autoplay') === '1';
          if(allowAuto) return;
          var u = new URL(f.src, location.href);
          var cur = u.searchParams.get('autoplay');
          if(cur !== '0'){
            u.searchParams.set('autoplay','0');
            var ns = u.toString();
            if(f.src !== ns) f.src = ns;
          }
          if(f.hasAttribute('allow') && f.getAttribute('allow').indexOf('autoplay') !== -1){
            var allow = f.getAttribute('allow').replace(/\bautoplay\b\s*;?\s*/g,'').replace(/;;/g,';').replace(/^\s*;\s*|\s*;\s*$/g,'').trim();
            allow = allow.replace(/\s*;\s*/g,'; ').replace(/;\s*$/,'').replace(/^;\s*/,'');
            if(allow) f.setAttribute('allow', allow); else f.removeAttribute('allow');
          }
        }catch(e){}
      });
      root.querySelectorAll('.audio-wrap iframe').forEach(function(f){
        try{
          var wrap = f.closest('.audio-wrap');
          var allowAuto = wrap && wrap.getAttribute('data-autoplay') === '1';
          if(allowAuto) return;
          var u = new URL(f.src, location.href);
          var ap = u.searchParams.get('auto');
          if(ap !== '0' && ap !== null){
            u.searchParams.set('auto','0');
            var ns2 = u.toString();
            if(f.src !== ns2) f.src = ns2;
          }
        }catch(e){}
      });
    }
    kill(document);
    try{
      var obs = new MutationObserver(function(muts){
        muts.forEach(function(m){
          m.addedNodes.forEach(function(n){
            if(n.nodeType!==1) return;
            if(n.matches && (n.matches('video') || n.matches('audio') || n.matches('.video-wrap iframe') || n.matches('.video-wrap') || n.matches('.audio-wrap'))){
              kill(document);
            } else if(n.querySelectorAll){
              kill(n);
            }
          });
        });
      });
      obs.observe(document.body, {childList:true, subtree:true});
    }catch(e){}
    try{
      var obs2 = new MutationObserver(function(){ try{ initAudioPlayers(); }catch(e){} });
      obs2.observe(document.body, {childList:true, subtree:true});
    }catch(e){}
  }

  // ── Audio player — Image1 简约播放器，适配亮暗 ──
  function initAudioPlayers(){
    var players = document.querySelectorAll('.audio-player');
    if(!players.length) return;
    function fmt(t){
      if(isNaN(t) || !isFinite(t)) return '00:00';
      var m = Math.floor(t/60), s = Math.floor(t%60);
      return (m<10?'0'+m:m) + ':' + (s<10?'0'+s:s);
    }
    players.forEach(function(pl){
      if(pl._elysiaBound) return; pl._elysiaBound = true;
      var audio = pl.querySelector('audio');
      var btn = pl.querySelector('.audio-player__play');
      var fill = pl.querySelector('.audio-player__fill');
      var timeEl = pl.querySelector('.audio-player__time');
      var bar = pl.querySelector('.audio-player__bar');
      var volBtn = pl.querySelector('.audio-player__vol');
      if(!audio || !btn) return;
      var isSeeking = false;
      function updateTime(){
        var cur = audio.currentTime || 0, dur = audio.duration || 0;
        if(timeEl) timeEl.textContent = fmt(cur) + ' / ' + fmt(dur);
        if(fill && dur>0 && !isSeeking) fill.style.width = (cur/dur*100).toFixed(2) + '%';
      }
      function setIcons(paused){
        var playIcon = btn.querySelector('.audio-player__icon--play');
        var pauseIcon = btn.querySelector('.audio-player__icon--pause');
        if(playIcon) playIcon.style.display = paused ? 'block' : 'none';
        if(pauseIcon) pauseIcon.style.display = paused ? 'none' : 'block';
        btn.setAttribute('aria-label', paused ? 'Play' : 'Pause');
      }
      audio.addEventListener('loadedmetadata', updateTime);
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('play', function(){ setIcons(false); });
      audio.addEventListener('pause', function(){ setIcons(true); });
      audio.addEventListener('ended', function(){ setIcons(true); if(fill) fill.style.width='0%'; });
      btn.addEventListener('click', function(){
        // 互斥：暂停其他
        document.querySelectorAll('.audio-player audio').forEach(function(a){
          if(a!==audio && !a.paused) try{ a.pause(); }catch(e){}
        });
        if(audio.paused){
          var p = audio.play();
          if(p && p.catch) p.catch(function(){});
        } else {
          audio.pause();
        }
      });
      if(bar){
        bar.addEventListener('click', function(e){
          var rect = bar.getBoundingClientRect();
          var x = e.clientX - rect.left;
          var pct = Math.max(0, Math.min(1, x / rect.width));
          if(audio.duration && isFinite(audio.duration)){
            audio.currentTime = pct * audio.duration;
            if(fill) fill.style.width = (pct*100).toFixed(2)+'%';
          }
        });
        bar.addEventListener('mousedown', function(){ isSeeking=true; });
        document.addEventListener('mouseup', function(){ isSeeking=false; });
      }
      if(volBtn){
        volBtn.addEventListener('click', function(){
          audio.muted = !audio.muted;
          volBtn.style.opacity = audio.muted ? '.45' : '1';
        });
      }
      // 初始状态
      setIcons(true);
      updateTime();
      // autoplay 尝试（若允许）
      if(pl.getAttribute('data-autoplay')==='1' || audio.hasAttribute('autoplay')){
        var ap = audio.play();
        if(ap && ap.catch) ap.catch(function(){});
      }
    });
  }

  // ── Netease playlist/album 展开/收起（避免大片空白，收起不占位） ──
  function initNeteaseToggle(){
    document.querySelectorAll('.audio-netease-wrap').forEach(function(wrap){
      if(wrap._neteaseBound) return; wrap._neteaseBound=true;
      var btn = wrap.querySelector('.audio-netease-toggle');
      var iframe = wrap.querySelector('iframe');
      if(!btn || !iframe) return;
      btn.addEventListener('click', function(){
        var collapsed = wrap.getAttribute('data-collapsed') === 'true';
        var h = collapsed ? wrap.getAttribute('data-height-expanded') : wrap.getAttribute('data-height-collapsed');
        iframe.setAttribute('height', h);
        iframe.style.height = h + 'px';
        // 同时更新 src 中的 height 参数以保持一致（网易 outchain 高度由 URL 参数决定）
        try{
          var u = new URL(iframe.src, location.href);
          u.searchParams.set('height', h);
          iframe.src = u.toString();
        }catch(e){}
        wrap.setAttribute('data-collapsed', collapsed ? 'false' : 'true');
        btn.textContent = collapsed ? '收起列表' : '展开列表';
        btn.setAttribute('aria-expanded', collapsed ? 'true' : 'false');
      });
    });
  }

  // ── Bookmark card desc overflow tooltip（仅确实被截断时才显示全文）──
  function initBookmarkTips(){
    document.querySelectorAll('.bookmark-card__desc[data-full]').forEach(function(el){
      if(el._tipBound) return; el._tipBound=true;
      el.addEventListener('mouseenter', function(){
        if(el.scrollHeight > el.clientHeight + 1) el.classList.add('is-overflow');
      });
      el.addEventListener('mouseleave', function(){ el.classList.remove('is-overflow'); });
    });
  }

  // ── Init all ──
  document.addEventListener('DOMContentLoaded', ()=>{
    initTheme();
    initPalette();
    initLang();
    initYearProgress();
    initExpiry();
    initToTop();
    initDrawer();
    initCodeBlocks();
    initTabs();
    initEncryption();
    initTOC();
    initInfinite();
    initTables();
    initVideo();
    initAudioPlayers();
    initNeteaseToggle();
    initBookmarkTips();
    initGiscusWatcher();
    // 首次渲染后再次同步，确保 giscus iframe 已生成
    setTimeout(syncCommentTheme, 500);
  });
  // Also run some immediately for no-FOUC
  initTheme();
  initPalette();
  // 尽早监听 giscus iframe，避免错过首次插入
  try{ initGiscusWatcher(); }catch(e){}
  // 额外兜底：监听 giscus 异步加载完成后同步
  window.addEventListener('load', function(){ setTimeout(syncCommentTheme, 400); try{ initExpiry(); }catch(e){} });
})();
