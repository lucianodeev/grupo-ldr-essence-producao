(function(){
  'use strict';
  const KEY_THEME='ldr-public-theme';
  const KEY_SCALE='ldr-public-scale';
  function apply(){
    const theme=localStorage.getItem(KEY_THEME)||'dark';
    const scale=Math.min(1.3,Math.max(.9,Number(localStorage.getItem(KEY_SCALE)||1)));
    document.documentElement.style.setProperty('--ldr-a11y-scale',String(scale));
    document.body.style.fontSize=`calc(1em * ${scale})`;
    document.body.classList.toggle('ldr-light-mode',theme==='light');
    document.body.classList.toggle('ldr-dark-mode',theme!=='light');
  }
  function styles(){
    if(document.getElementById('ldr-a11y-style'))return;
    const s=document.createElement('style');s.id='ldr-a11y-style';s.textContent=`
    .ldr-a11y{position:fixed;left:14px;bottom:14px;z-index:9999;display:flex;flex-wrap:wrap;gap:6px;padding:8px;border:1px solid rgba(214,173,99,.65);border-radius:14px;background:rgba(38,8,17,.94);box-shadow:0 8px 30px rgba(0,0,0,.25);backdrop-filter:blur(10px)}
    .ldr-a11y button{min-width:44px;min-height:44px;padding:8px 10px;border:1px solid rgba(255,255,255,.25);border-radius:10px;background:#fff;color:#45101d;font-weight:900;cursor:pointer}
    .ldr-a11y button:focus-visible{outline:3px solid #d6ad63;outline-offset:2px}
    body.ldr-light-mode{background:#fffaf3!important;color:#2b0a11!important}
    body.ldr-light-mode section,body.ldr-light-mode .section{filter:none}
    @media(max-width:560px){.ldr-a11y{left:8px;bottom:8px}.ldr-a11y button{min-width:40px;min-height:40px;padding:6px 8px;font-size:12px}}
    `;document.head.appendChild(s);
  }
  function mount(){
    if(document.querySelector('.ldr-a11y'))return;
    styles();apply();
    const bar=document.createElement('div');bar.className='ldr-a11y';bar.setAttribute('aria-label','Controles de acessibilidade');
    bar.innerHTML='<button type="button" data-a="light" aria-label="Tema claro">☀ Claro</button><button type="button" data-a="dark" aria-label="Tema escuro">☾ Escuro</button><button type="button" data-a="minus" aria-label="Diminuir letra">A−</button><button type="button" data-a="plus" aria-label="Aumentar letra">A+</button>';
    bar.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;if(a==='light'||a==='dark')localStorage.setItem(KEY_THEME,a);else{let v=Number(localStorage.getItem(KEY_SCALE)||1);v=a==='plus'?Math.min(1.3,v+.1):Math.max(.9,v-.1);localStorage.setItem(KEY_SCALE,v.toFixed(1));}apply();});
    document.body.appendChild(bar);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
