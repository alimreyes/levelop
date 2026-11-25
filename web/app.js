(function(){
  var btn=document.getElementById('themebtn');
  if(btn){
    btn.querySelector('.ti').innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" stroke="none"/></svg>';
    btn.addEventListener('click',function(){
      var next=(document.documentElement.getAttribute('data-theme')||'dark')==='dark'?'light':'dark';
      document.documentElement.setAttribute('data-theme',next);
      try{localStorage.setItem('lvl-tema',next)}catch(e){}
    });
  }
  document.querySelectorAll('.price').forEach(function(c){
    c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect();
      c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');});
  });
  var f=document.getElementById('demoForm');
  /* No hay backend de leads todavía: se arma un correo listo para enviar. Honesto > simular un "enviado". */
  var DEMO_EMAIL='hola@levelop.app';
  if(f){f.addEventListener('submit',function(ev){
    ev.preventDefault();var req=['n','e','c'];
    for(var i=0;i<req.length;i++){var el=f.elements[req[i]];
      if(!el.value.trim()||(req[i]==='e'&&!/.+@.+\..+/.test(el.value))){el.focus();el.style.boxShadow='inset 0 0 0 1px var(--risk)';return;}
      el.style.boxShadow='inset 0 0 0 1px var(--line)';}
    var val=function(k){var e=f.elements[k];return e?String(e.value||'').trim():'';};
    var cuerpo='Nombre: '+val('n')+'\nCorreo: '+val('e')+'\nEmpresa: '+val('c')+(val('s')?'\nTamaño: '+val('s'):'')+(val('m')?'\nCómo reparten beneficios hoy: '+val('m'):'');
    location.href='mailto:'+DEMO_EMAIL+'?subject='+encodeURIComponent('Demo Levelop — '+val('c'))+'&body='+encodeURIComponent(cuerpo);
    var ok=document.getElementById('formOk');ok.textContent='Se abrió tu correo con la solicitud lista. Si no se abrió, escríbenos a '+DEMO_EMAIL+'.';
    ok.classList.add('on');ok.scrollIntoView({block:'center'});
  });}
  var grid=document.getElementById('charGrid');
  if(grid){var bs=[].slice.call(grid.querySelectorAll('.char'));
    var img=document.getElementById('stImg'),nm=document.getElementById('stName'),ln=document.getElementById('stLine'),tg=document.getElementById('stTag');
    bs.forEach(function(b){b.addEventListener('click',function(){
      bs.forEach(function(x){x.setAttribute('aria-pressed','false')});b.setAttribute('aria-pressed','true');
      img.src=b.querySelector('.a').getAttribute('src');img.alt=b.dataset.n+' caminando';
      nm.textContent=b.dataset.n;ln.textContent=b.dataset.l;tg.textContent='Personaje '+b.dataset.i;});});}
  var s=document.getElementById('seats');
  if(s){var upd=function(){var n=+s.value,extra=Math.max(0,n-10),t=30+extra*4;
      document.getElementById('seatsOut').textContent=n;
      document.getElementById('calcTotal').textContent='$'+t;
      document.getElementById('calcNote').textContent=extra?('$30 base + '+extra+' asientos adicionales × $4.'):'Hasta 10 personas, todo incluido en el plan base.';};
    s.addEventListener('input',upd);upd();}

  /* animaciones solo cuando están a la vista */
  if('IntersectionObserver' in window){
    document.documentElement.classList.add('js-io');
    var io=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('in',e.isIntersecting)})},{rootMargin:'80px'});
    document.querySelectorAll('[data-live]').forEach(function(el){io.observe(el)});
  }
  /* personajes que saltan en orden aleatorio */
  document.querySelectorAll('.hop-row').forEach(function(row){
    var cs=[].slice.call(row.querySelectorAll('.hc'));
    function hop(c){c.classList.remove('hop');void c.offsetWidth;c.classList.add('hop');}
    cs.forEach(function(c){c.addEventListener('mouseenter',function(){hop(c)});c.addEventListener('animationend',function(){c.classList.remove('hop')});});
    var host=row.closest('.card')||row;
    function burst(){cs.slice().sort(function(){return Math.random()-.5}).forEach(function(c,i){setTimeout(function(){hop(c)},i*120)});}
    host.addEventListener('mouseenter',burst);host.addEventListener('click',burst);
  });
  document.querySelectorAll('.menu-panel a').forEach(function(a){a.addEventListener('click',function(){a.closest('details').removeAttribute('open')})});
})();
