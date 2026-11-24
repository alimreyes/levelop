/* Acceso unificado de Levelop (copiado de la web pública anterior). Depende de levelop-config.js y levelop-api.js. */
/* ---------- Acceso ---------- */
(function(){
  'use strict';
  var acc = document.getElementById('acc');
  var card = document.getElementById('accCard');
  var ultimoFoco = null;

  var ROLES = {
    empleado:     { nombre:'Colaborador',     destino:'/app',      panel:null },
    lider_area:   { nombre:'Líder de área',   destino:'/lider',    panel:'Panel de líder de área' },
    gerencia:     { nombre:'Gerencia',        destino:'/gerencia', panel:'BackOffice de gerencia' },
    admin_tenant: { nombre:'Administrador',   destino:'/gerencia', panel:'BackOffice de gerencia' }
  };

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function servido(){ return /^https?:$/.test(location.protocol); }
  /* En Vercel las rutas limpias existen; abierto como archivo local, se usan los .html. */
  function ruta(r){
    if(servido()) return r;
    return { '/app':'levelop-mvp.html', '/lider':'levelop-lider.html', '/gerencia':'levelop-backoffice.html' }[r] || r;
  }

  var X = '<button class="acc-x" type="button" data-cerrar aria-label="Cerrar">×</button>';
  var DEMO = '<div class="acc-demo"><p><b>¿Quieres Levelop! en tu empresa?</b> Te mostramos cómo repartir los beneficios que ya das, con criterio y sin planillas.</p>' +
             '<a class="btn btn-p" href="index.html#demo" data-cerrar>Agenda una demo →</a></div>';

  function abrir(){
    ultimoFoco = document.activeElement;
    acc.classList.add('on');
    document.body.style.overflow = 'hidden';
    if(LevelopAPI.sesion.haySesion() && LevelopAPI.sesion.getTipoSesion() === 'usuario') return reanudar();
    pintarLogin();
  }
  function cerrar(){
    acc.classList.remove('on');
    document.body.style.overflow = '';
    if(location.hash === '#entrar') history.replaceState(null, '', location.pathname + location.search);
    if(ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }

  function pintarLogin(msg, sinCuenta){
    card.innerHTML = X +
      '<a class="brand" href="index.html" data-cerrar aria-label="Levelop"><img class="logo logo-d" src="assets/imagotipo-claro.png" alt="Levelop" width="175" height="30"><img class="logo logo-l" src="assets/imagotipo-oscuro.png" alt="" width="175" height="30" aria-hidden="true"></a>' +
      '<h2 id="accTitulo">Inicia sesión</h2>' +
      '<p class="sub">Entra con el correo que te dio de alta tu empresa. Te llevamos directo a tu área: colaborador, líder de área o gerencia.</p>' +
      '<form id="accForm" novalidate>' +
        '<div class="field"><label for="accEmail">Correo</label><input id="accEmail" type="email" autocomplete="username" required placeholder="nombre@empresa.com"></div>' +
        '<div class="field"><label for="accPass">Contraseña</label><input id="accPass" type="password" autocomplete="current-password" required minlength="8"></div>' +
        '<button class="btn btn-p" id="accBtn" type="submit">Entrar →</button>' +
      '</form>' +
      (msg ? '<div class="acc-msg ' + (sinCuenta ? 'info' : 'err') + '" role="alert">' + msg + '</div>' : '') +
      (sinCuenta ? DEMO : '') +
      '<p class="acc-foot">¿No tienes cuenta? En Levelop! no hay registro abierto: <b>tu empleador te envía una invitación</b> y con ese enlace creas tu contraseña. ¿Olvidaste la tuya? Pídele ayuda a RRHH o a la gerencia de tu empresa.</p>' +
      (sinCuenta ? '' : '<p class="acc-foot">¿Tu empresa aún no usa Levelop!? <a href="index.html#demo" data-cerrar>Agenda una demo</a>.</p>');

    var em = document.getElementById('accEmail');
    em.focus();
    document.getElementById('accForm').addEventListener('submit', enviar);
  }

  var SIN_CUENTA =
    '<b>No encontramos una cuenta con ese correo y contraseña.</b><br>' +
    'Si trabajas en una empresa que usa Levelop!, <b>contacta a tu empleador</b> (RRHH o gerencia) para que te cree el usuario: te llegará un enlace de invitación. ' +
    'Si ya tienes cuenta, revisa que la contraseña esté bien escrita.';

  async function enviar(ev){
    ev.preventDefault();
    var email = document.getElementById('accEmail').value.trim().toLowerCase();
    var pass = document.getElementById('accPass').value;
    if(!/.+@.+\..+/.test(email)) return pintarLogin('Escribe un correo válido.');
    if(pass.length < 8) return pintarLogin('La contraseña tiene al menos 8 caracteres.');
    var btn = document.getElementById('accBtn');
    btn.disabled = true; btn.textContent = 'Entrando…';
    try{
      var r = await LevelopAPI.login(email, pass);
      resolver(r.membresias);
    }catch(err){
      LevelopAPI.logout();
      if(err && (err.status === 401 || err.status === 400)) return pintarLogin(SIN_CUENTA, true);
      pintarLogin(err && err.status ? 'No se pudo entrar: ' + esc(err.message) : 'No pudimos conectar con el servidor. Intenta de nuevo en unos minutos.');
    }
  }

  async function reanudar(){
    card.innerHTML = X + '<h2 id="accTitulo">Un momento…</h2><p class="sub">Recuperando tu sesión.</p>';
    try{ resolver(await LevelopAPI.misMembresias()); }
    catch(e){ LevelopAPI.logout(); pintarLogin(); }
  }

  function resolver(ms){
    if(!Array.isArray(ms)){ LevelopAPI.logout(); return pintarLogin('El servidor no respondió a qué empresa perteneces. Intenta de nuevo.'); }
    if(ms.length === 0){
      LevelopAPI.logout();
      return pintarLogin('<b>Tu cuenta existe, pero no está activa en ninguna empresa.</b><br>Contacta a tu empleador para que te vuelva a dar acceso.', true);
    }
    if(ms.length === 1) return elegirArea(ms[0], false);
    card.innerHTML = X + '<h2 id="accTitulo">¿A qué empresa entras?</h2><p class="sub">Tu cuenta está activa en más de una.</p>' +
      '<div class="acc-pick">' + ms.map(function(m, i){
        var r = ROLES[m.rol] || ROLES.empleado;
        return '<button type="button" data-emp="' + i + '"><span><b>' + esc(m.tenantNombre) + '</b><small>' + esc(r.nombre) + (m.areaNombre ? ' · ' + esc(m.areaNombre) : '') + '</small></span><span class="arr">→</span></button>';
      }).join('') + '</div>' + salirBtn();
    card.querySelectorAll('[data-emp]').forEach(function(b){
      b.addEventListener('click', function(){ elegirArea(ms[+b.dataset.emp], true); });
    });
  }

  /* Colaborador: directo a la app. Líder y gerencia: su panel es lo primero,
     pero también participan en misiones, así que se les ofrece la app. */
  function elegirArea(m, varias){
    LevelopAPI.fijarTenant(m.tenantId);
    var r = ROLES[m.rol] || ROLES.empleado;
    if(!r.panel) return ir(r.destino);
    var hola = m.usuarioNombre ? 'Hola, ' + esc(String(m.usuarioNombre).split(' ')[0]) : 'Hola';
    card.innerHTML = X + '<h2 id="accTitulo">' + hola + '</h2>' +
      '<p class="sub">' + esc(m.tenantNombre) + ' · ' + esc(r.nombre) + (m.areaNombre ? ' · ' + esc(m.areaNombre) : '') + '</p>' +
      '<div class="acc-pick">' +
        '<button type="button" data-ir="' + r.destino + '"><span><b>' + r.panel + '</b><small>Tu área asignada</small></span><span class="arr">→</span></button>' +
        '<button type="button" data-ir="/app"><span><b>App de misiones</b><small>Crear, aceptar y cerrar misiones · tienda · ranking</small></span><span class="arr">→</span></button>' +
      '</div>' + salirBtn();
    card.querySelectorAll('[data-ir]').forEach(function(b){
      b.addEventListener('click', function(){ ir(b.dataset.ir); });
    });
    card.querySelector('[data-ir]').focus();
  }

  function salirBtn(){ return '<p class="acc-foot"><a href="#" data-salir>No soy yo · cerrar sesión</a></p>'; }
  function ir(destino){
    card.innerHTML = '<h2 id="accTitulo">Entrando…</h2>';
    location.href = ruta(destino);
  }

  document.addEventListener('click', function(ev){
    var t = ev.target.closest('[data-entrar],[data-cerrar],[data-salir]');
    if(!t) return;
    if(t.hasAttribute('data-entrar')){ ev.preventDefault(); abrir(); }
    else if(t.hasAttribute('data-salir')){ ev.preventDefault(); LevelopAPI.logout(); pintarLogin(); }
    else { cerrar(); }
  });
  acc.addEventListener('click', function(ev){ if(ev.target === acc) cerrar(); });
  document.addEventListener('keydown', function(ev){ if(ev.key === 'Escape' && acc.classList.contains('on')) cerrar(); });

  /* /#entrar abre el acceso directo (útil para compartir). Las superficies
     mandan aquí al cerrar sesión con ?entrar=1. */
  var q = new URLSearchParams(location.search);
  if(q.get('invitacion')){ location.replace(ruta('/app') + '?invitacion=' + encodeURIComponent(q.get('invitacion'))); return; }
  if(location.hash === '#entrar' || q.get('entrar') === '1') abrir();
})();
