/**
 * LEVELOP — cliente API compartido por las 4 superficies.
 *
 * Un solo archivo, cargado por los 4 HTML (`<script src="levelop-api.js">`),
 * para no repetir manejo de JWT/errores cuatro veces con cuatro sutiles bugs
 * distintos. Todo lo que toca autenticación y red vive aquí; lo que es
 * específico de cada superficie (qué endpoint pintar en qué panel) vive en
 * el `<script>` propio de cada HTML.
 *
 * DECISIÓN: el JWT vive en `sessionStorage`, no en `localStorage`.
 * `localStorage` sobrevive cerrar la pestaña y el navegador — un token que
 * vive ahí es un token que sigue siendo válido si alguien más abre el mismo
 * navegador después. `sessionStorage` se limpia al cerrar la pestaña. Es más
 * fricción (hay que loguearse de nuevo cada sesión de navegador) a cambio de
 * no dejar una sesión abierta indefinidamente en una compu compartida — en
 * un producto de RRHH/beneficios eso importa más que la comodidad.
 */
(function (global) {
  'use strict';

  // Cambiar aquí cuando el backend tenga un dominio real. Sin protocolo
  // relativo a propósito: durante desarrollo local esto apunta a
  // localhost:3000, que es donde corre `npm run start:dev`.
  const API_BASE = (global.LEVELOP_API_BASE) || 'http://localhost:3000/api/v1';

  const TOKEN_KEY = 'lvl-access-token';
  const REFRESH_KEY = 'lvl-refresh-token';
  const TENANT_KEY = 'lvl-tenant-id';
  const TIPO_KEY = 'lvl-tipo-sesion'; // 'usuario' | 'interno'

  function getToken() { try { return sessionStorage.getItem(TOKEN_KEY); } catch (e) { return null; } }
  function getRefresh() { try { return sessionStorage.getItem(REFRESH_KEY); } catch (e) { return null; } }
  function getTenantId() { try { return sessionStorage.getItem(TENANT_KEY); } catch (e) { return null; } }
  function getTipoSesion() { try { return sessionStorage.getItem(TIPO_KEY); } catch (e) { return null; } }

  function guardarSesion({ accessToken, refreshToken, tenantId, tipo }) {
    try {
      sessionStorage.setItem(TOKEN_KEY, accessToken);
      sessionStorage.setItem(REFRESH_KEY, refreshToken);
      if (tenantId) sessionStorage.setItem(TENANT_KEY, tenantId);
      if (tipo) sessionStorage.setItem(TIPO_KEY, tipo);
    } catch (e) {
      // Modo incógnito o storage bloqueado: la sesión no persiste entre
      // recargas, pero la pestaña actual sigue funcionando en memoria porque
      // las llamadas ya en curso no dependen de releer el storage.
      console.warn('No se pudo guardar la sesión (storage bloqueado):', e);
    }
  }

  function cerrarSesion() {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_KEY);
      sessionStorage.removeItem(TENANT_KEY);
      sessionStorage.removeItem(TIPO_KEY);
    } catch (e) { /* nada que limpiar si el storage ya falló */ }
  }

  /**
   * Error tipado para que el código de cada HTML pueda distinguir "el
   * servidor rechazó la operación con un motivo conocido" (mostrar el copy
   * correcto, LVL-023) de "algo se rompió de verdad" (mostrar un error
   * genérico). `motivoRechazo` viene tal cual del backend cuando existe.
   */
  class ErrorAPI extends Error {
    constructor(status, cuerpo) {
      const mensaje = (cuerpo && (cuerpo.message || cuerpo.motivoRechazo)) || `Error HTTP ${status}`;
      super(typeof mensaje === 'string' ? mensaje : JSON.stringify(mensaje));
      this.status = status;
      this.motivoRechazo = cuerpo && cuerpo.motivoRechazo;
      this.cuerpo = cuerpo;
    }
  }

  let refrescando = null; // promesa en curso, para no disparar N refresh en paralelo

  async function refrescarToken() {
    if (refrescando) return refrescando;
    const refreshToken = getRefresh();
    if (!refreshToken) throw new ErrorAPI(401, { message: 'Sesión expirada, inicia sesión de nuevo' });

    refrescando = fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (r) => {
        if (!r.ok) throw new ErrorAPI(r.status, await r.json().catch(() => null));
        return r.json();
      })
      .then((datos) => {
        guardarSesion({
          accessToken: datos.accessToken,
          refreshToken: datos.refreshToken,
          tenantId: getTenantId(),
          tipo: getTipoSesion(),
        });
        return datos.accessToken;
      })
      .finally(() => { refrescando = null; });

    return refrescando;
  }

  /**
   * `request()` es el único lugar que llama a `fetch`. Reintenta UNA vez con
   * token refrescado si el servidor devuelve 401 — el JWT expira a los 15
   * minutos (`JWT_EXPIRES_IN`) y una persona con la pestaña abierta más
   * tiempo que eso no debería tener que loguearse de nuevo a media tarea.
   */
  async function request(path, { method = 'GET', body, reintentando = false } = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const resp = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (resp.status === 401 && !reintentando) {
      await refrescarToken();
      return request(path, { method, body, reintentando: true });
    }

    let cuerpo = null;
    try { cuerpo = await resp.json(); } catch (e) { /* respuesta sin cuerpo (204, etc.) */ }

    if (!resp.ok) throw new ErrorAPI(resp.status, cuerpo);
    return cuerpo;
  }

  function urlTenant(path) {
    const tenantId = getTenantId();
    if (!tenantId) throw new Error('No hay tenantId en la sesión — hay que loguearse primero');
    return `/tenants/${tenantId}${path}`;
  }

  const LevelopAPI = {
    ErrorAPI,
    sesion: { getToken, getTenantId, getTipoSesion, cerrarSesion, haySesion: () => !!getToken() },

    // ---- Auth --------------------------------------------------------
    /**
     * El hueco de `tenantId` que estaba anotado aquí ya se cerró (14/09/26).
     *
     * Era esto: `POST /auth/login` devuelve solo tokens —correcto, el JWT
     * prueba identidad y no autorización— y eso dejaba al frontend sin forma
     * de saber a qué empresa pertenece quien se acaba de loguear. La salida
     * barata era hardcodear el UUID del cliente piloto en cada HTML; la
     * salida correcta era un endpoint, y costó una consulta:
     * `GET /auth/mis-membresias`.
     *
     * `login()` ahora lo llama solo. Si la persona tiene UNA membresía, queda
     * fijada sin que nadie elija nada. Si tiene varias, devuelve la lista
     * para que la página pregunte cuál. Si el backend todavía no tiene el
     * endpoint (no se reinició), no revienta: devuelve `membresias: null` y
     * la página cae a su plan B.
     */
    async login(email, password) {
      const datos = await request('/auth/login', { method: 'POST', body: { email, password } });
      guardarSesion({
        accessToken: datos.accessToken,
        refreshToken: datos.refreshToken,
        tenantId: getTenantId(), // conserva el que ya estuviera fijado, si alguno
        tipo: 'usuario',
      });

      let membresias = null;
      try {
        membresias = await request('/auth/mis-membresias');
      } catch (e) {
        // 404 = backend sin reiniciar. No es fatal: la página lo resuelve.
        if (!(e instanceof ErrorAPI) || e.status !== 404) throw e;
      }

      if (membresias && membresias.length === 1) {
        LevelopAPI.fijarTenant(membresias[0].tenantId);
      }
      return { ...datos, membresias };
    },

    /** Las empresas a las que pertenece la sesión actual. */
    misMembresias: () => request('/auth/mis-membresias'),

    async loginInterno(email, password) {
      const datos = await request('/auth/interno/login', { method: 'POST', body: { email, password } });
      guardarSesion({ accessToken: datos.accessToken, refreshToken: datos.refreshToken, tipo: 'interno' });
      return datos;
    },

    /** Solo hace falta si el login no trae el tenantId (ver nota arriba). */
    fijarTenant(tenantId) {
      try { sessionStorage.setItem(TENANT_KEY, tenantId); } catch (e) { /* ver guardarSesion */ }
    },

    logout: cerrarSesion,

    // ---- Invitaciones (16/09/26) — el único camino de alta ---------------
    /** Qué dice el link antes de escribir nada: empresa, rol, área, si sigue vivo, si el correo ya tiene cuenta. Público. */
    verInvitacion: (token) => request(`/auth/invitacion/${encodeURIComponent(token)}`),
    /**
     * Acepta y deja la sesión iniciada en esa empresa. `nombre` solo hace
     * falta si el correo es nuevo; si ya tiene cuenta, `password` es la de
     * siempre (no crea otra cuenta, agrega la membresía).
     */
    async aceptarInvitacion(token, { nombre, password }) {
      const datos = await request(`/auth/invitacion/${encodeURIComponent(token)}/aceptar`, {
        method: 'POST',
        body: nombre ? { nombre, password } : { password },
      });
      guardarSesion({
        accessToken: datos.accessToken,
        refreshToken: datos.refreshToken,
        tenantId: datos.tenantId,
        tipo: 'usuario',
      });
      return datos;
    },
    /** El link que se comparte. Lo arma el navegador con su propio origen — el servidor no sabe dónde está servida la app. */
    linkInvitacion: (token) => {
      const loc = global.location;
      // Servido (Vercel): ruta limpia desde la raíz del dominio. Importa porque
      // la vista interna vive en /levelop-interno/ y un link relativo quedaría
      // colgando de esa carpeta (17/09/26).
      if (loc && /^https?:$/.test(loc.protocol)) {
        return `${loc.origin}/app?invitacion=${encodeURIComponent(token)}`;
      }
      const base = loc ? loc.href.replace(/[^/]*$/, '') : '';
      return `${base}levelop-mvp.html?invitacion=${encodeURIComponent(token)}`;
    },

    /**
     * Cerrar sesión desde una superficie de empresa (app, líder, gerencia):
     * servido, vuelve a la web pública con el acceso abierto; como archivo
     * local, recarga la misma página (su propio login).
     */
    salir() {
      cerrarSesion();
      const loc = global.location;
      if (loc && /^https?:$/.test(loc.protocol)) loc.href = '/?entrar=1';
      else if (loc) loc.reload();
    },

    // ---- App del empleado --------------------------------------------
    misiones: {
      /**
       * Pedido de Alim 14/09: por defecto ve TODAS las misiones del tenant
       * (estilo Asana — carga completa de la empresa, para que alguien libre
       * pueda ofrecerse a una que no es suya). `soloPropias: true` vuelve al
       * comportamiento viejo: solo lo que uno creó, tiene asignado, o aceptó.
       */
      listar: (soloPropias) => request(urlTenant(`/missions${soloPropias ? '?propias=true' : ''}`)),
      // dto acepta: titulo, descripcion, areaId, urgencia, importancia, esfuerzo,
      // fechaLimite, y ahora (14/09) asignadoMembershipId (opcional, para
      // mencionar a quien debería tomarla) y enlaces (string[], opcional).
      crear: (dto) => request(urlTenant('/missions'), { method: 'POST', body: dto }),
      aceptar: (id) => request(urlTenant(`/missions/${id}/aceptar`), { method: 'POST' }),
      cerrar: (id, dto) => request(urlTenant(`/missions/${id}/cerrar`), { method: 'POST', body: dto }),
    },
    economia: {
      saldo: () => request(urlTenant('/economy/saldo')),
      /**
       * Ranking entre pares (Maestro §4.3), no gestión — R-07 no aplica acá.
       * Respeta optInJuego + participaEnRanking (si cualquiera está apagado,
       * vuelve `{ participo: false, tabla: [] }`) y verTablaCompleta (±3 por
       * defecto, tabla entera si la persona lo pidió).
       */
      ranking: () => request(urlTenant('/economy/ranking')),
      actualizarPrefsRanking: (dto) =>
        request(urlTenant('/economy/ranking/prefs'), { method: 'PATCH', body: dto }),
      /**
       * 16/09/26 — nivel, XP y los dos umbrales del nivel (`xpInicioNivel`,
       * `xpSiguienteNivel`) para dibujar la barra sin inventar el número.
       * Responde aunque el juego esté apagado (la XP no se pierde).
       */
      miProgreso: () => request(urlTenant('/economy/mi-progreso')),
      /**
       * 16/09/26 — R-03: prender/apagar el juego desde la propia app. Apagar
       * = deja de ganar Oro (CH-2); el saldo sigue caducando a los 90 días.
       */
      cambiarJuego: (optInJuego) =>
        request(urlTenant('/economy/juego'), { method: 'PATCH', body: { optInJuego } }),
    },
    // ---- Compañeros (16/09/26) --------------------------------------------
    // Nombre, área y rol de cada membresía activa del tenant — lo que un
    // compañero ya sabe de otro por trabajar en la misma empresa. Sirve para
    // resolver un membershipId a un nombre y para el selector de "sugerir a
    // alguien" al montar una misión. No devuelve email, zona, saldo ni XP.
    equipo: {
      miembros: () => request(urlTenant('/members')),
    },
    // ---- Avisos ---------------------------------------------------------
    // MVP por polling (no hay WebSocket todavía) — llamar `listar()` cada
    // cierto intervalo o al entrar a la pantalla de avisos.
    avisos: {
      listar: (soloNoLeidas) =>
        request(urlTenant(`/notifications${soloNoLeidas ? '?soloNoLeidas=true' : ''}`)),
      marcarLeida: (id) => request(urlTenant(`/notifications/${id}/leer`), { method: 'POST' }),
    },
    tienda: {
      catalogo: () => request(urlTenant('/catalog')),
      misCanjes: () => request(urlTenant('/redemptions')),
      solicitar: (itemId, idempotencyKeyCliente) =>
        request(urlTenant('/redemptions'), { method: 'POST', body: { itemId, idempotencyKeyCliente } }),
      confirmar: (id, evidenciaUrl) =>
        request(urlTenant(`/redemptions/${id}/confirmar`), { method: 'POST', body: { evidenciaUrl } }),
      revertir: (id, motivo) =>
        request(urlTenant(`/redemptions/${id}/revertir`), { method: 'POST', body: { motivo } }),
    },

    // ---- BackOffice de gerencia ---------------------------------------
    gerencia: {
      dashboard: () => request(urlTenant('/backoffice/dashboard')),
      catalogo: () => request(urlTenant('/backoffice/catalog')),
      // dto acepta requiereAprobacion (opcional, default true en el backend
      // — un canje nuevo es "necesita aprobación" hasta que alguien diga lo
      // contrario, mismo criterio seguro que ya regía para "Café de Cortesía").
      crearItem: (dto) => request(urlTenant('/backoffice/catalog'), { method: 'POST', body: dto }),
      cambiarPrecio: (id, precioOro) =>
        request(urlTenant(`/backoffice/catalog/${id}/precio`), { method: 'PATCH', body: { precioOro } }),
      /**
       * Pedido de Alim 14/09: no todo ítem de tienda necesita pasar por
       * aprobación (un café no; una reunión con gerencia sí). Este es el
       * toggle para ítems que ya existían antes de este campo.
       */
      cambiarAprobacion: (id, requiereAprobacion) =>
        request(urlTenant(`/backoffice/catalog/${id}/aprobacion`), {
          method: 'PATCH',
          body: { requiereAprobacion },
        }),
      areas: () => request(urlTenant('/backoffice/areas')),

      // ---- Personas, áreas e invitaciones (16/09/26) ----------------------
      // Administración, no evaluación: nombres y roles sin ningún número de
      // desempeño (ver comentario largo en gerencia.controller.ts).
      personas: () => request(urlTenant('/backoffice/personas')),
      actualizarPersona: (membershipId, dto) =>
        request(urlTenant(`/backoffice/personas/${membershipId}`), { method: 'PATCH', body: dto }),
      crearArea: (nombre) => request(urlTenant('/backoffice/areas'), { method: 'POST', body: { nombre } }),
      // dto: { nombre?, liderMembershipId? } — null explícito en liderMembershipId = quitar líder.
      actualizarArea: (id, dto) =>
        request(urlTenant(`/backoffice/areas/${id}`), { method: 'PATCH', body: dto }),
      invitaciones: () => request(urlTenant('/backoffice/invitaciones')),
      // dto: { email, rol?, areaId?, zona? } → devuelve la invitación con su token.
      invitar: (dto) => request(urlTenant('/backoffice/invitaciones'), { method: 'POST', body: dto }),
      anularInvitacion: (id) =>
        request(urlTenant(`/backoffice/invitaciones/${id}/anular`), { method: 'PATCH' }),
    },

    // ---- BackOffice de líder de área -----------------------------------
    lider: {
      ayuda: () => request(urlTenant('/lider/ayuda')),
      ayudaPendientes: () => request(urlTenant('/lider/ayuda/pendientes')),
      // 15/09/26 — nuevo: historial de lo que ESTE líder ya registró (help_interactions).
      // Responde "¿ya hablé con esta persona?" — antes solo se podía crear (POST), no releer.
      historialInteracciones: () => request(urlTenant('/lider/ayuda/historial')),
      registrarInteraccion: (dto) => request(urlTenant('/lider/ayuda/interaccion'), { method: 'POST', body: dto }),
      colaboracion: () => request(urlTenant('/lider/colaboracion')),
      ausencias: () => request(urlTenant('/lider/ausencias')),
      resumenArea: () => request(urlTenant('/lider/resumen-area')),
      loQuePideTuArea: () => request(urlTenant('/lider/lo-que-pide-tu-area')),
    },

    // ---- Vista interna de Levelop ---------------------------------------
    interno: {
      usuarios: (tenantId) => request(`/interno/usuarios${tenantId ? `?tenantId=${tenantId}` : ''}`),
      // 15/09/26 — gateLanzamiento() y canjesAgregados() no pasaban el filtro
      // ?tenantId= aunque el backend (interno.controller.ts) ya lo acepta en
      // los tres endpoints por igual (FiltroTenantDto es el mismo DTO para
      // los tres). Faltaba solo en el cliente, no en el servidor: se agrega
      // aquí para que los tres se comporten igual, sin tocar ningún llamador
      // existente (el parámetro es opcional, como en usuarios()).
      gateLanzamiento: (tenantId) => request(`/interno/gate-lanzamiento${tenantId ? `?tenantId=${tenantId}` : ''}`),
      canjesAgregados: (tenantId) => request(`/interno/canjes-agregados${tenantId ? `?tenantId=${tenantId}` : ''}`),
      // ---- Empresas (16/09/26): alta con primera invitación al admin --------
      tenants: () => request('/interno/tenants'),
      // dto: { nombre, rif?, zonaDefault, adminEmail } → { tenant, invitacion }
      crearTenant: (dto) => request('/interno/tenants', { method: 'POST', body: dto }),
      invitaciones: (tenantId) => request(`/interno/invitaciones?tenantId=${tenantId}`),
    },
  };

  global.LevelopAPI = LevelopAPI;
})(window);
