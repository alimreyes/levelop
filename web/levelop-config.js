/**
 * LEVELOP — configuración de entorno del frontend.
 *
 * Es el ÚNICO archivo que cambia entre local y producción, y se carga antes
 * que `levelop-api.js` en los 4 HTML. Decide a qué backend hablar según
 * desde dónde se abrió la página:
 *
 *   - localhost / 127.0.0.1 / red local / archivo abierto a mano (file://)
 *       → el backend local: `npm run start:dev` en :3000.
 *   - cualquier otro dominio (Vercel)
 *       → el backend en Railway.
 *
 * Para cambiar el dominio de Railway se edita SOLO la constante de abajo.
 * No hay variables de entorno en el frontend: son archivos estáticos.
 */
(function (g) {
  var RAILWAY_API = 'https://PONER-DOMINIO-RAILWAY.up.railway.app/api/v1';

  var h = (g.location && g.location.hostname) || '';
  var esLocal =
    h === '' || h === 'localhost' || h === '127.0.0.1' ||
    /^10\./.test(h) || /^192\.168\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h);

  g.LEVELOP_API_BASE = esLocal ? 'http://localhost:3000/api/v1' : RAILWAY_API;
  g.LEVELOP_ENTORNO = esLocal ? 'local' : 'produccion';
})(window);
