/* =========================================================================
   levelop-escenas.js — Escenarios animados de Levelop! (v4, 13/10/26)
   -------------------------------------------------------------------------
   Motor común de los cuatro escenarios (Inicio, Misiones, Tienda, Ranking).
   Sigue el «Plan de incorporación — Escenarios animados» (v4) y el prototipo
   del paquete `levelop_escenarios_pack/`; donde el prototipo y este archivo se
   parecen es a propósito: lo que se ve ahí es lo que se espera aquí.

   Cómo está armado
   - Lienzo lógico de 400 × 120 px (v4). Un <canvas> de ESE tamaño se estira con CSS
     (`image-rendering:pixelated`), así que todo se dibuja en píxeles enteros
     del arte y nunca en sub-píxeles.
   - Capas, de abajo hacia arriba: fondo → (Ranking: fuegos → sobre_fuegos →
     estatuas/plintos) → sombra → personaje → frente (lo que tapa al personaje).
     El texto del cartel (Inicio) y los nombres del podio (Ranking) son HTML
     por encima del lienzo.
   - Un solo reloj (requestAnimationFrame, delta tope de 100 ms), pausado
     cuando la pestaña está oculta. Con «reducir movimiento» no hay patrulla,
     ni fuegos, ni salticos, ni rotación del cartel.
   - Nada de esto habla con el backend. Quien lo usa le pasa lo que hay que
     dibujar (`cfg`) y el motor solo dibuja.

   API (window.Escenas)
     montar(host, cfg)   dibuja la escena dentro de `host` (reemplaza su contenido)
     desmontar()         detiene la animación
     componerCartel(o)   arma los mensajes del cartel de Inicio
     horaActual()        'manana' | 'tarde' | 'atardecer' | 'noche'
   Para ver otra hora sin esperar: agregar ?hora=manana|tarde|atardecer|noche
   a la dirección. (Desde v4 las cuatro escenas tienen las cuatro horas; si
   alguna faltara, esa escena cae en 'tarde'.)

   Los nombres de los PNG son <escena>_<hora>.png en escenas/fondo y
   escenas/frente (Ranking además: <escena>_<hora>_sobre_fuegos.png en fondo).
   ========================================================================= */
(function(){
"use strict";

/* Datos del paquete (escena.json, caminata.json, podio.json, fuegos.json),
   copiados tal cual. La ruta `y` son los pies del personaje por columna,
   indexados desde `x_min`. */
const DATOS = {"lienzo":[400,120],"escenas":{"inicio":{"horas":["manana","tarde","atardecer","noche"],"x_min":8,"x_max":333,"y":[111.5,111.5,111.5,111.5,111.5,111.5,111.5,111.5,111.0,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.0,110.0,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.0,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.0,108.0,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.0,107.0,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.0,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.0,105.0,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.0,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.0,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.0,102.0,101.5,101.5,101.5,101.5,101.5,101.5,101.5,101.5,101.5,101.5,101.5,101.5,101.5,101.5,101.5,101.5,101.5,101.5,101.5,101.5,101.5,101.5,101.5,101.5,101.0,100.5,100.5,100.5,100.5,100.5,100.5,100.5,100.5,100.5,100.5,100.5,100.5,100.5,100.5,100.5,100.5,100.5,100.5,100.5,100.5,100.5,100.5,100.5,100.5,100.0,100.0,99.5,99.5,99.5,99.5,99.5,99.5,99.5,99.5,99.5,99.5,99.5,99.5,99.5,99.5,99.5,99.5,99.5,99.5,99.5,99.5,99.5,99.5,99.5,99.5,99.0,99.0,98.5,98.5,98.5,98.5,98.5,98.5,98.5,98.5,99.0],"oclusores":[[258,64,265,103]],"cartel":{"cara":[24,63,83,95],"colores":{"manana":"#f0e7c9","tarde":"#f3ebcf","atardecer":"#efd3a8","noche":"#d8d5b0"},"texto":"#121215"}},"misiones":{"horas":["manana","tarde","atardecer","noche"],"x_min":8,"x_max":303,"y":[105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,106.0,106.0],"oclusores":[[23,54,49,110],[170,70,204,104]],"letrero":"MISIONES"},"tienda":{"horas":["manana","tarde","atardecer","noche"],"x_min":8,"x_max":308,"y":[102.0,102.0,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.0,102.5],"oclusores":[],"letrero":"TIENDA"},"ranking":{"horas":["manana","tarde","atardecer","noche"],"x_min":8,"x_max":169,"y":[111.0,111.0,111.0,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.5,110.0,110.0,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.5,109.0,109.0,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.5,108.0,108.0,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.5,107.0,107.0,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.5,106.0,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.5,105.0,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.5,104.0,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.5,103.0,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,102.5,101.5,101.5,102.0,102.5],"oclusores":[],"letrero":"RANKING"}},"pivoteFrontal":{"caballero":20,"elfo":20,"sirena":20,"duende":20,"mago":20,"dragon":24,"barbaro":20,"bardo":20},"caminata":{"ms":110,"freno":110,"pausa":[2500,4500],"salto":{"nota":"Saltico en el podio con la pose frontal (mirando al usuario), sin espejo. Ciclo de 1500 ms: durante los primeros 600 ms (40 %) el personaje sube y baja con curva de seno; el resto del ciclo reposa en el plinto.","ciclo_ms":1500,"fraccion_salto":0.4,"curva":"seno","amplitud_px_por_puesto":{"1":4,"2":8,"3":8},"y_reposo":"base_y - 2 (parte alta del plinto)"}},"podio":{"puestos":{"1":{"metal":"oro","cx":268,"base_y":69},"2":{"metal":"plata","cx":241,"base_y":77},"3":{"metal":"bronce","cx":295,"base_y":83}},"sprites":{"caballero":{"tam":[27,38],"pivote_plinto":[15,37]},"elfo":{"tam":[24,32],"pivote_plinto":[13,31]},"sirena":{"tam":[22,32],"pivote_plinto":[11,31]},"duende":{"tam":[28,33],"pivote_plinto":[15,32]},"mago":{"tam":[24,38],"pivote_plinto":[13,37]},"dragon":{"tam":[30,34],"pivote_plinto":[16,33]},"barbaro":{"tam":[25,35],"pivote_plinto":[10,34]},"bardo":{"tam":[29,38],"pivote_plinto":[16,37]}}},"fuegos":{"dur":[70,60,70,80,80,90,90,100,100,110,110,120,130,150],"slots":[[84,26],[130,43],[215,17],[322,19]],"colores":["cian","lima","oro","rosa"]}};

const BASE = "escenas/";
const SLUGS = ["caballero","elfo","sirena","duende","mago","dragon","barbaro","bardo"];
const W = DATOS.lienzo[0], H = DATOS.lienzo[1], FW = 40, FH = 48;   // 400 × 120
const PIV = { right:20, left:19 };             // columna de los pies dentro del cuadro
const MS = 110, VEL = 24, PASO_MS = 330;       // 110 ms por cuadro, 24 px/s sin patinar
/* PASOS_ANTES_DE_PARAR: cuántos «pasos» da el personaje antes de detenerse y mirar a la cámara.
   Un paso = medio ciclo = 3 cuadros = 330 ms (definición del paquete, caminata.json).
   6 pasos = 3 ciclos completos = 18 cuadros = 1980 ms ≈ 47,5 px a 24 px/s.
   (Pedido de Alim, 12/10/26; el paquete trae 2.) 0 = camina sin parar. */
const PASOS_ANTES_DE_PARAR = 6;
const IDLE = { pasos:PASOS_ANTES_DE_PARAR, pausaMin:2500, pausaMax:4500, freno:110, inicio:1000 };
const CARTEL_MS = 7000;
const SALTO = { ciclo:1500, fraccion:0.4, amp:{ 1:4, 2:8, 3:8 } };
const HORAS = ["manana","tarde","atardecer","noche"];

/* ------------------------------------------------------------------ hora */
function horaActual(){
  let forzada = null;
  try{ forzada = new URLSearchParams(location.search).get("hora"); }catch(e){}
  if(HORAS.indexOf(forzada) >= 0) return forzada;
  const h = new Date().getHours();
  return h>=6 && h<11 ? "manana" : h>=11 && h<17 ? "tarde" : h>=17 && h<19 ? "atardecer" : "noche";
}
/* Si la escena no tiene la hora pedida, `tarde`. */
function horaDe(esc){ const h = horaActual(); return DATOS.escenas[esc].horas.indexOf(h)>=0 ? h : "tarde"; }

/* ---------------------------------------------------------------- imágenes */
const IMG = {};
function img(url){
  let i = IMG[url];
  if(i) return i;
  i = new Image(); i.decoding = "async";
  i.onerror = function(){ i._err = true; };
  i.src = url; IMG[url] = i; return i;
}
const listo = i => !!(i && i.complete && !i._err && i.naturalWidth > 0);
const reducido = () => !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

/* ------------------------------------------------------------------- ruta */
function yPies(esc, x){
  const e = DATOS.escenas[esc], y = e.y;
  const i = Math.max(0, Math.min(y.length-1, x - e.x_min));
  const a = Math.floor(i), b = Math.min(y.length-1, a+1);
  return y[a] + (y[b]-y[a]) * (i-a);
}

/* ---------------------------------------------------------------- estado
   Cada escena guarda el suyo y lo conserva aunque la pantalla se redibuje:
   el personaje sigue donde iba, no vuelve a la casilla de salida. */
const ESTADOS = {};
function estadoDe(esc){
  if(ESTADOS[esc]) return ESTADOS[esc];
  const e = DATOS.escenas[esc];
  return ESTADOS[esc] = {
    x: esc==="ranking" ? 40 : Math.round(e.x_min + (e.x_max-e.x_min)*0.25),
    dir: 1, modo: "front", t: 0, pausa: IDLE.inicio, walkT: 0, frame: 2,
    saltoT: 0, msg: 0, msgT: 0,
    fx: DATOS.fuegos.slots.map(function(_,i){ return { t:-1, c:DATOS.fuegos.colores[i%DATOS.fuegos.colores.length], espera:i*450 }; })
  };
}
const azar = (a,b) => a + Math.random()*(b-a);

/* ------------------------------------------------------------ instancia */
let inst = null;
let raf = 0, tmo = 0;

function desmontar(){
  if(raf) cancelAnimationFrame(raf);
  if(tmo) clearTimeout(tmo);
  raf = 0; tmo = 0; inst = null;
}

function montar(host, cfg){
  desmontar();
  if(!host || !DATOS.escenas[cfg.escena]) return;
  const esc = cfg.escena, e = DATOS.escenas[esc];
  const slug = cfg.personaje && SLUGS.indexOf(cfg.personaje)>=0 ? cfg.personaje : null;
  const rk = esc==="ranking" ? (cfg.ranking || {}) : null;
  const msgs = esc==="inicio" ? (cfg.mensajes || []) : [];

  host.innerHTML =
    '<div class="esc-in">' +
      '<canvas class="esc-cv" width="'+W+'" height="'+H+'" aria-hidden="true"></canvas>' +
      (msgs.length ? '<button type="button" class="esc-cartel" aria-label="Mensaje del cartel. Toca para ver el siguiente."><span class="esc-ct"></span></button>' : '') +
      (rk ? '<div class="esc-tags" aria-hidden="true"></div>' : '') +
    '</div>';
  const cv = host.querySelector(".esc-cv");
  const I = inst = {
    host: host, esc: esc, cv: cv, ctx: cv.getContext("2d"), st: estadoDe(esc),
    slug: slug, msgs: msgs, rk: rk, hora: horaDe(esc), horaChk: 0,
    cartel: host.querySelector(".esc-cartel"), ct: host.querySelector(".esc-ct"),
    tagsEl: host.querySelector(".esc-tags")
  };
  I.ctx.imageSmoothingEnabled = false;

  /* Podio: quién ocupa cada puesto y si el usuario está en él. */
  if(rk){
    const top = Array.isArray(rk.top3) ? rk.top3 : null;      // null = no sabemos quién va arriba
    I.top3 = top;
    I.slot = 0;
    if(top && rk.yo){ for(let i=0;i<top.length;i++){ if(top[i] && top[i].membershipId === rk.yo){ I.slot = i+1; break; } } }
    I.fuegos = I.slot>0 && rk.puesto === 1;                   // fuegos: #1 del alcance que se ve
    pintarTags();
  }
  if(I.cartel){
    mostrarCartel();
    I.cartel.addEventListener("click", function(){ avanzarCartel(); });
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ if(inst===I) ajustarCartel(); });
  }
  dibujar(); programar();
}

/* ------------------------------------------------------------------ reloj */
let ultimo = 0;
function programar(){
  if(!inst) return;
  if(reducido()){ ultimo = 0; tmo = setTimeout(tickQuieto, 250); }
  else raf = requestAnimationFrame(tick);
}
function tickQuieto(){
  tmo = 0;
  if(!inst || !inst.host.isConnected){ desmontar(); return; }
  if(!document.hidden){ revisarHora(performance.now()); dibujar(); }
  programar();
}
function tick(now){
  raf = 0;
  if(!inst || !inst.host.isConnected){ desmontar(); return; }
  if(document.hidden){ ultimo = 0; return; }                   // se reanuda en visibilitychange
  const dt = ultimo ? Math.min(100, now-ultimo) : 0;
  ultimo = now;
  if(reducido()){ programar(); return; }
  revisarHora(now);
  actualizar(dt);
  dibujar();
  raf = requestAnimationFrame(tick);
}
document.addEventListener("visibilitychange", function(){
  if(!inst) return;
  ultimo = 0;
  if(!document.hidden && !raf && !tmo) programar();
});
function revisarHora(now){
  const I = inst;
  if(now - I.horaChk < 30000) return;
  I.horaChk = now;
  const h = horaDe(I.esc);
  if(h !== I.hora){ I.hora = h; }
}

/* ------------------------------------------------------------- movimiento */
function actualizar(dt){
  const I = inst, st = I.st, e = DATOS.escenas[I.esc];

  if(I.slot > 0){                                              // en el podio: de frente y con saltico
    st.saltoT += dt;
  } else if(I.slug){
    st.t += dt;
    if(st.modo === "front"){ if(st.t >= st.pausa){ st.modo = "walk"; st.t = 0; st.walkT = 0; } }
    else if(st.modo === "brake"){ if(st.t >= IDLE.freno){ st.modo = "front"; st.t = 0; st.pausa = azar(IDLE.pausaMin, IDLE.pausaMax); st.walkT = 0; } }
    if(st.modo === "walk"){
      st.x += st.dir*VEL*dt/1000; st.walkT += dt;
      if(st.x >= e.x_max){ st.x = e.x_max; st.dir = -1; }
      if(st.x <= e.x_min){ st.x = e.x_min; st.dir = 1; }
      if(IDLE.pasos > 0 && st.walkT >= IDLE.pasos*PASO_MS){ st.modo = "brake"; st.t = 0; }
    }
    st.frame = st.modo === "walk" ? Math.floor(st.walkT/MS) % 6 : 2;
  }

  if(I.cartel){ st.msgT += dt; if(st.msgT >= CARTEL_MS) avanzarCartel(); }

  if(I.fuegos){
    const dur = DATOS.fuegos.dur, total = dur.reduce(function(a,b){ return a+b; }, 0);
    st.fx.forEach(function(f){
      if(f.t < 0){ f.espera -= dt; if(f.espera <= 0) f.t = 0; }
      else{
        f.t += dt;
        if(f.t >= total){ f.t = -1; f.espera = azar(500, 1600); f.c = DATOS.fuegos.colores[Math.floor(Math.random()*DATOS.fuegos.colores.length)]; }
      }
    });
  }
}

/* ------------------------------------------------------------------ dibujo */
function cuadroFuego(t){ const d = DATOS.fuegos.dur; let a = 0; for(let i=0;i<d.length;i++){ a += d[i]; if(t < a) return i; } return d.length-1; }

function dibujar(){
  const I = inst, c = I.ctx, st = I.st, esc = I.esc, hora = I.hora;
  c.clearRect(0, 0, W, H);

  const fondo = img(BASE+"fondo/"+esc+"_"+hora+".png");
  if(listo(fondo)) c.drawImage(fondo, 0, 0);

  if(esc === "ranking"){
    if(I.fuegos && !reducido()){
      const vari = hora === "noche" ? "noche" : "dia";
      DATOS.fuegos.slots.forEach(function(s, i){
        const f = st.fx[i]; if(f.t < 0) return;
        const sp = img(BASE+"fuegos/"+vari+"_"+f.c+".png");
        if(listo(sp)) c.drawImage(sp, cuadroFuego(f.t)*31, 0, 31, 31, s[0]-15, s[1]-15, 31, 31);
      });
      const sf = img(BASE+"fondo/ranking_"+hora+"_sobre_fuegos.png");
      if(listo(sf)) c.drawImage(sf, 0, 0);
    }
    dibujarPodio(c);
  }

  dibujarPersonaje(c);

  const fr = img(BASE+"frente/"+esc+"_"+hora+".png");
  if(listo(fr)) c.drawImage(fr, 0, 0);
}

const METAL_FILA = { oro:0, plata:3, bronce:6 };
function dibujarPodio(c){
  const I = inst;
  if(I.top3 === null) return;                                  // sin datos: mejor un podio sin dibujar que uno que miente
  [1,2,3].forEach(function(p){
    const s = DATOS.podio.puestos[p], r = I.top3[p-1];
    const vacio = I.slot === p || !r || SLUGS.indexOf(r.personaje) < 0;
    if(vacio){
      const pl = img(BASE+"estatuas/plintos.png");
      if(listo(pl)) c.drawImage(pl, 0, METAL_FILA[s.metal], 23, 3, s.cx-11, s.base_y-2, 23, 3);
      return;
    }
    const sp = DATOS.podio.sprites[r.personaje], hoja = img(BASE+"estatuas/"+s.metal+".png");
    if(listo(hoja)) c.drawImage(hoja, SLUGS.indexOf(r.personaje)*32, 0, sp.tam[0], sp.tam[1], s.cx-sp.pivote_plinto[0], s.base_y-sp.pivote_plinto[1], sp.tam[0], sp.tam[1]);
  });
}

function dibujarPersonaje(c){
  const I = inst, st = I.st;
  if(!I.slug) return;
  const tipo = I.esc === "tienda" ? "interior" : "exterior";
  const at = [img(BASE+"personajes/"+I.hora+"_"+tipo+".png"), img(BASE+"personajes/tarde_"+tipo+".png")].filter(listo)[0];
  if(!at) return;
  const fila = SLUGS.indexOf(I.slug)*FH;
  const sombra = img(BASE+"sombra.png");
  let px, py, frontal, dir = st.dir > 0 ? "right" : "left";
  if(I.slot > 0){
    const s = DATOS.podio.puestos[I.slot];
    let salto = 0;
    if(!reducido()){
      const p = (st.saltoT % SALTO.ciclo) / SALTO.ciclo;
      salto = p < SALTO.fraccion ? Math.round(SALTO.amp[I.slot] * Math.sin(Math.PI * (p/SALTO.fraccion))) : 0;
    }
    px = s.cx; py = s.base_y - 2 - salto; frontal = true;
    if(listo(sombra)) c.drawImage(sombra, px-11, s.base_y-4);
  } else {
    px = Math.round(st.x); py = Math.round(yPies(I.esc, st.x)); frontal = st.modo === "front" || reducido();
    if(listo(sombra)) c.drawImage(sombra, px-11, py-2);
  }
  if(frontal) c.drawImage(at, 480, fila, FW, FH, px - DATOS.pivoteFrontal[I.slug], py-45, FW, FH);
  else c.drawImage(at, (dir==="right" ? 0 : 240) + st.frame*FW, fila, FW, FH, px - PIV[dir], py-45, FW, FH);
}

/* ------------------------------------------------------------- HTML: tags */
function esc_(s){ return String(s==null ? "" : s).replace(/[&<>"]/g, function(ch){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]; }); }
/* Solo el primer nombre: los tres carteles van a 27 px de distancia entre sí y no
   caben nombres largos sin pisarse. (El nombre completo está en la tabla de abajo.) */
function etiquetaNombre(n){
  const p = String(n||"").trim().split(/\s+/).filter(Boolean);
  return p.length ? p[0].slice(0, 10) : "";
}
function pintarTags(){
  const I = inst; if(!I.tagsEl) return;
  let h = "";
  if(I.top3){
    [1,2,3].forEach(function(p){
      const r = I.top3[p-1], s = DATOS.podio.puestos[p];
      const t = I.slot === p ? "TÚ" : r ? etiquetaNombre(r.nombre) : "";
      if(t) h += '<span class="esc-tag" style="left:calc('+s.cx+'*var(--px)); top:calc(110*var(--px))">'+esc_(t)+'</span>';
    });
  }
  I.tagsEl.innerHTML = h;
}

/* ----------------------------------------------------------- HTML: cartel */
function mostrarCartel(){
  const I = inst, st = I.st;
  if(!I.cartel) return;
  const m = I.msgs[st.msg % I.msgs.length];
  I.ct.innerHTML = m.lineas.map(function(l, i){ return '<span class="esc-l'+(i===0 ? " l1" : "")+'">'+esc_(l)+'</span>'; }).join("");
  I.cartel.style.setProperty("--fs", String(m.fs/5));
  ajustarCartel();
}
function avanzarCartel(){
  const I = inst; if(!I || !I.cartel) return;
  I.st.msg = (I.st.msg + 1) % I.msgs.length; I.st.msgT = 0;
  mostrarCartel();
}
/* Red de seguridad: si con la tipografía real algo no cupo, se achica hasta que quepa
   (nunca se recorta texto a la fuerza). */
function ajustarCartel(){
  const I = inst; if(!I || !I.cartel || !I.cartel.clientWidth) return;
  const el = I.cartel;
  let f = parseFloat(el.style.getPropertyValue("--fs")) || 1;
  for(let n=0; n<8; n++){
    const ls = el.querySelectorAll(".esc-l");
    const ancho = [].some.call(ls, function(s){ return s.scrollWidth > el.clientWidth + 1; });
    const alto = [].reduce.call(ls, function(a, s){ return a + s.offsetHeight; }, 0);
    if(!ancho && alto <= el.clientHeight + 1) break;
    f *= 0.9; el.style.setProperty("--fs", f.toFixed(3));
  }
}

/* Arma los mensajes del cartel. Cada uno: líneas en MAYÚSCULAS, la primera en
   negrita, y un tamaño relativo (5 = el normal; menor = letra más chica para que
   entren textos largos). Lo que no cabe ni así se omite en vez de recortarse. */
const DISPOSICIONES = [ { fs:5, cpl:13, max:3 }, { fs:4, cpl:16, max:4 }, { fs:3.4, cpl:19, max:5 } ];
function envolver(texto, cpl){
  const out = []; let linea = "";
  String(texto||"").toUpperCase().split(/\s+/).filter(Boolean).forEach(function(p){
    while(p.length > cpl){                                    // palabra más larga que la línea: se parte con guion
      if(linea){ out.push(linea); linea = ""; }
      out.push(p.slice(0, cpl-1)+"-"); p = p.slice(cpl-1);
    }
    if(!linea) linea = p;
    else if((linea+" "+p).length <= cpl) linea += " "+p;
    else{ out.push(linea); linea = p; }
  });
  if(linea) out.push(linea);
  return out;
}
function disponer(etiqueta, valor){
  const etq = etiqueta ? String(etiqueta).toUpperCase() : "";
  if(!valor || !String(valor).trim()) return etq ? { fs:5, lineas:[etq] } : null;
  for(let i=0;i<DISPOSICIONES.length;i++){
    const d = DISPOSICIONES[i], ls = envolver(valor, d.cpl);
    if(etq && etq.length <= d.cpl+2 && 1+ls.length <= d.max) return { fs:d.fs, lineas:[etq].concat(ls) };
  }
  for(let i=0;i<DISPOSICIONES.length;i++){                    // sin etiqueta, para que quepa el valor
    const d = DISPOSICIONES[i], ls = envolver(valor, d.cpl);
    if(ls.length <= d.max) return { fs:d.fs, lineas:ls };
  }
  return null;
}
function componerCartel(o){
  const f = o.fecha || new Date();
  const h = f.getHours();
  const saludo = h < 12 ? "Buenos días," : h < 19 ? "Buenas tardes," : "Buenas noches,";
  const dia = f.toLocaleDateString("es-VE", { weekday:"long" });
  const resto = f.getDate()+" de "+f.toLocaleDateString("es-VE", { month:"long" });
  const lista = [
    disponer(saludo, o.nombre),
    disponer(dia, resto),
    o.area ? disponer("Área", o.area) : null,
    o.empresa ? disponer("Empresa", o.empresa) : null
  ].filter(Boolean);
  return lista;
}

window.Escenas = { montar: montar, desmontar: desmontar, componerCartel: componerCartel, horaActual: horaActual, _datos: DATOS,
  _estado: function(){ return inst ? { esc:inst.esc, hora:inst.hora, slot:inst.slot||0, fuegos:!!inst.fuegos, top3:inst.top3||null, st:inst.st, slug:inst.slug } : null; } };
})();
