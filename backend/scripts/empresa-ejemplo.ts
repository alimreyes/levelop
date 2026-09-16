/**
 * =============================================================================
 * EMPRESA DE EJEMPLO — "Café Andino C.A." (ficticia) con actividad real
 * =============================================================================
 *
 * Pedido de Alim, 17/09/26: una empresa completa para probar a full las
 * dinámicas de comunicación y ver cómo el dato llega a las cuatro superficies
 * (app del empleado, líder de área, gerencia y la vista interna de Levelop).
 *
 * CÓMO ESTÁ HECHO, y por qué así:
 *
 *   Casi todo pasa por la API REAL, no por INSERTs. Si el script escribiera
 *   misiones y Oro directo en la base, probaría que la base acepta filas — no
 *   que el producto funciona. Por la API pasan las reglas de verdad: el
 *   anti-cheat (misión propia no da Oro), el tope diario, el opt-out, los
 *   cupos, la aprobación de canjes, los avisos, los roles.
 *
 *   Por la base (DATABASE_URL, como los otros seeds) va SOLO lo que hoy no
 *   tiene endpoint:
 *     1. La empresa y su primer administrador (en producción lo hace la
 *        vista interna con una invitación; aquí se ahorra ese paso manual).
 *     2. Los cupos (`benefit_stock`) — no hay endpoint de inventario.
 *     3. Colaboradores de misión (`mission_collaborators`) — ningún endpoint
 *        los escribe todavía; sin esto el panel «quién trabaja con quién»
 *        del líder queda vacío.
 *     4. Señales de «quién necesita una mano» (`help_signals`) — el detector
 *        que las produce no existe todavía. Se respetan los 21 días del CHECK.
 *
 *   Todo lo demás —áreas, líderes, invitaciones y su aceptación, catálogo,
 *   misiones, cierres, canjes, aprobaciones, reversiones, opt-out, ranking,
 *   interacciones del líder— entra por HTTP con el JWT de cada persona.
 *
 * USO (desde la carpeta backend, con el backend corriendo):
 *
 *   npm run demo:empresa                                   → contra localhost:3000
 *   npm run demo:empresa -- --api=https://ALGO.up.railway.app/api/v1
 *
 * Se puede correr más de una vez: la primera arma la empresa (onboarding por
 * invitaciones); las siguientes la reconocen y solo agregan «un día más» de
 * actividad. Una misma persona no puede canjear el mismo ítem dos veces el
 * mismo día (idempotencia), así que en la segunda corrida del mismo día
 * algunos canjes salen como «ya existía» — es correcto.
 *
 * Todas las cuentas usan la contraseña DEMO_PASSWORD. Son datos de prueba:
 * correos @cafeandino.test, que no existen.
 */
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config as loadEnv } from 'dotenv';
import { ENTIDADES } from '../src/config/typeorm.config';
import { EstadoTenant, RolMembership } from '../src/common/enums';

loadEnv();

// ---------------------------------------------------------------------------
// Datos de la empresa
// ---------------------------------------------------------------------------

const EMPRESA = 'Café Andino C.A. (demo)';
const DOMINIO = 'cafeandino.test';
const DEMO_PASSWORD = 'Demo2026!';

type Rol = 'empleado' | 'lider_area' | 'gerencia' | 'admin_tenant';

interface Persona {
  clave: string;
  nombre: string;
  rol: Rol;
  area?: 'ops' | 'ventas' | 'mkt';
  zona?: string;
  /** Apaga el juego al empezar (prueba de R-03 / CH-2). */
  optOut?: boolean;
}

const AREAS: Record<'ops' | 'ventas' | 'mkt', string> = {
  ops: 'Operaciones y Tostaduría',
  ventas: 'Ventas y Tiendas',
  mkt: 'Marketing',
};

const PERSONAS: Persona[] = [
  { clave: 'mariana', nombre: 'Mariana Duarte', rol: 'admin_tenant' },
  { clave: 'andres', nombre: 'Andrés Salazar', rol: 'gerencia' },
  // Operaciones
  { clave: 'carlos', nombre: 'Carlos Méndez', rol: 'empleado', area: 'ops' }, // pasa a líder
  { clave: 'luisa', nombre: 'Luisa Fernández', rol: 'empleado', area: 'ops' },
  { clave: 'jose', nombre: 'José Rivas', rol: 'empleado', area: 'ops' },
  { clave: 'daniela', nombre: 'Daniela Ortiz', rol: 'empleado', area: 'ops' },
  { clave: 'pedro', nombre: 'Pedro Gómez', rol: 'empleado', area: 'ops' },
  { clave: 'valentina', nombre: 'Valentina Rojas', rol: 'empleado', area: 'ops', zona: 'Valencia' },
  // Ventas
  { clave: 'gabriela', nombre: 'Gabriela Pérez', rol: 'empleado', area: 'ventas' }, // pasa a líder
  { clave: 'miguel', nombre: 'Miguel Torres', rol: 'empleado', area: 'ventas' },
  { clave: 'sofia', nombre: 'Sofía Castillo', rol: 'empleado', area: 'ventas' },
  { clave: 'ricardo', nombre: 'Ricardo Blanco', rol: 'empleado', area: 'ventas' },
  { clave: 'camila', nombre: 'Camila Herrera', rol: 'empleado', area: 'ventas' },
  // Marketing
  { clave: 'alejandro', nombre: 'Alejandro Díaz', rol: 'empleado', area: 'mkt' }, // pasa a líder
  { clave: 'isabella', nombre: 'Isabella Morales', rol: 'empleado', area: 'mkt' },
  { clave: 'diego', nombre: 'Diego Navarro', rol: 'empleado', area: 'mkt' },
  { clave: 'paola', nombre: 'Paola Suárez', rol: 'empleado', area: 'mkt' },
  { clave: 'andrea', nombre: 'Andrea León', rol: 'empleado', area: 'mkt', optOut: true },
];

const LIDERES: Record<'ops' | 'ventas' | 'mkt', string> = { ops: 'carlos', ventas: 'gabriela', mkt: 'alejandro' };

/** Invitaciones que quedan SIN aceptar, para ver el estado «pendiente» en gerencia. */
const PENDIENTES = [
  { email: `nuevo.barista@${DOMINIO}`, area: 'ops' as const },
  { email: `pasante.mkt@${DOMINIO}`, area: 'mkt' as const },
];

const CATALOGO = [
  { k: 'cafe', familia: 'impulsos', nombre: 'Café y pastelito de cortesía', descripcion: 'En cualquier tienda, cualquier día.', precioOro: 40, requiereAprobacion: false, cupos: 60 },
  { k: 'salida', familia: 'tiempo', nombre: 'Salida 2 horas antes', descripcion: 'Coordínalo con tu líder.', precioOro: 100, requiereAprobacion: true, cupos: 12 },
  { k: 'remoto', familia: 'tiempo', nombre: 'Día de trabajo remoto', descripcion: 'Solo roles que lo permitan.', precioOro: 160, requiereAprobacion: true, cupos: 8 },
  { k: 'mediodia', familia: 'tiempo', nombre: 'Medio día libre', descripcion: 'Mañana o tarde, a elección.', precioOro: 260, requiereAprobacion: true, cupos: 4 },
  { k: 'almuerzo', familia: 'consumo', nombre: 'Almuerzo pagado', descripcion: 'Hasta el tope acordado con RRHH.', precioOro: 50, requiereAprobacion: true, cupos: 10 },
  // Un solo cupo a propósito: dos personas lo piden y una recibe CUPO_AGOTADO.
  { k: 'cine', familia: 'aliados', nombre: '2x1 en cine (aliado)', descripcion: 'Entrada doble, fines de semana.', precioOro: 60, requiereAprobacion: true, cupos: 1 },
];

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const arg = (nombre: string) => {
  const a = process.argv.find((x) => x.startsWith(`--${nombre}=`));
  return a ? a.slice(nombre.length + 3) : undefined;
};
const API = (arg('api') || process.env.DEMO_API_URL || 'http://localhost:3000/api/v1').replace(/\/$/, '');
const email = (p: Persona) => `${p.clave}@${DOMINIO}`;

interface Resultado { ok: boolean; texto: string }
const checks: Resultado[] = [];
function check(ok: boolean, texto: string) {
  checks.push({ ok, texto });
  console.log(`  ${ok ? '✓' : '✗'} ${texto}`);
}
function paso(t: string) { console.log(`\n▸ ${t}`); }

class HttpError extends Error {
  constructor(public status: number, public cuerpo: any) {
    super(`HTTP ${status}: ${typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo)}`);
  }
  get motivo(): string | undefined {
    const c = this.cuerpo;
    return c?.motivoRechazo ?? c?.message?.motivoRechazo;
  }
}

async function http<T = any>(metodo: string, ruta: string, token?: string, body?: unknown): Promise<T> {
  const r = await fetch(`${API}${ruta}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const texto = await r.text();
  let cuerpo: any = texto;
  try { cuerpo = texto ? JSON.parse(texto) : null; } catch { /* texto plano */ }
  if (!r.ok) throw new HttpError(r.status, cuerpo);
  return cuerpo as T;
}

/** Una sesión por persona: token + membresía en la empresa demo. */
interface Sesion { p: Persona; token: string; mId: string; t: (ruta: string) => string }
const S: Record<string, Sesion> = {};

async function login(p: Persona, tenantId: string): Promise<Sesion> {
  const tok = await http<{ accessToken: string }>('POST', '/auth/login', undefined, {
    email: email(p), password: DEMO_PASSWORD,
  });
  const ms = await http<any[]>('GET', '/auth/mis-membresias', tok.accessToken);
  const m = ms.find((x) => x.tenantId === tenantId);
  if (!m) throw new Error(`${p.nombre} no tiene membresía activa en la empresa demo`);
  const s: Sesion = { p, token: tok.accessToken, mId: m.membershipId, t: (r) => `/tenants/${tenantId}${r}` };
  S[p.clave] = s;
  return s;
}
const yo = (k: string) => S[k];
const persona = (k: string) => PERSONAS.find((p) => p.clave === k)!;

async function intentar<T>(f: () => Promise<T>): Promise<{ ok: true; v: T } | { ok: false; e: HttpError | Error }> {
  try { return { ok: true, v: await f() }; } catch (e) { return { ok: false, e: e as Error }; }
}

// ---------------------------------------------------------------------------
// Principal
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\nEMPRESA DE EJEMPLO → ${EMPRESA}\nAPI: ${API}`);

  const salud = await intentar(() => http('GET', '/health'));
  if (!salud.ok) {
    throw new Error(`El backend no responde en ${API}/health. ¿Está corriendo? (${salud.e.message})`);
  }

  const ds = new DataSource({ type: 'postgres', url: process.env.DATABASE_URL, synchronize: false, entities: ENTIDADES });
  await ds.initialize();

  try {
    // -----------------------------------------------------------------------
    paso('1 · Empresa y administrador (base de datos)');
    let tenantId: string;
    let primeraVez = false;
    const existente = await ds.query(`SELECT id FROM tenants WHERE nombre = $1 LIMIT 1`, [EMPRESA]);
    if (existente.length) {
      tenantId = existente[0].id;
      console.log(`  La empresa ya existe (${tenantId}). Se agrega un día más de actividad.`);
    } else {
      primeraVez = true;
      const admin = persona('mariana');
      tenantId = await ds.transaction(async (tx) => {
        const [t] = await tx.query(
          `INSERT INTO tenants (nombre, rif, "zonaDefault", estado) VALUES ($1, $2, 'Caracas', $3) RETURNING id`,
          [EMPRESA, 'J-00000000-0', EstadoTenant.ACTIVO],
        );
        await tx.query(`SELECT set_config('app.tenant_id', $1, true)`, [t.id]);
        // economy_config no se siembra: EconomyService la crea con los valores por defecto al primer cierre.
        const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
        let [u] = await tx.query(`SELECT id FROM users WHERE email = $1`, [email(admin)]);
        if (!u) {
          [u] = await tx.query(
            `INSERT INTO users (email, "passwordHash", nombre) VALUES ($1, $2, $3) RETURNING id`,
            [email(admin), hash, admin.nombre],
          );
        }
        await tx.query(
          `INSERT INTO memberships ("tenantId", "userId", rol, zona, activo, "optInJuego") VALUES ($1, $2, $3, 'Caracas', true, true)`,
          [t.id, u.id, RolMembership.ADMIN_TENANT],
        );
        return t.id as string;
      });
      check(true, `Empresa creada: ${tenantId}`);
    }

    const gerente = await login(persona('mariana'), tenantId);

    // -----------------------------------------------------------------------
    paso('2 · Áreas, invitaciones y alta de cada persona (API)');
    const areasApi = await http<any[]>('GET', gerente.t('/backoffice/areas'), gerente.token);
    const areaId: Record<string, string> = {};
    for (const [k, nombre] of Object.entries(AREAS)) {
      const a = areasApi.find((x) => x.nombre === nombre)
        ?? (await http('POST', gerente.t('/backoffice/areas'), gerente.token, { nombre }));
      areaId[k] = a.id;
    }
    check(Object.keys(areaId).length === 3, 'Tres áreas disponibles');

    let aceptadas = 0;
    for (const p of PERSONAS) {
      if (p.clave === 'mariana') continue;
      const inv = await intentar(() => http('POST', gerente.t('/backoffice/invitaciones'), gerente.token, {
        email: email(p),
        rol: p.rol,
        ...(p.area ? { areaId: areaId[p.area] } : {}),
        ...(p.zona ? { zona: p.zona } : {}),
      }));
      if (!inv.ok) {
        if (inv.e instanceof HttpError && inv.e.motivo === 'YA_ES_MIEMBRO') continue; // corrida anterior
        throw inv.e;
      }
      const token = (inv.v as any).token as string;
      const vista = await http<any>('GET', `/auth/invitacion/${token}`);
      await http('POST', `/auth/invitacion/${token}/aceptar`, undefined,
        vista.usuarioExiste ? { password: DEMO_PASSWORD } : { nombre: p.nombre, password: DEMO_PASSWORD });
      aceptadas++;
    }
    if (primeraVez) check(aceptadas === PERSONAS.length - 1, `${aceptadas} personas entraron por su link de invitación`);

    for (const inv of PENDIENTES) {
      await intentar(() => http('POST', gerente.t('/backoffice/invitaciones'), gerente.token, {
        email: inv.email, rol: 'empleado', areaId: areaId[inv.area],
      }));
    }
    const invs = await http<any[]>('GET', gerente.t('/backoffice/invitaciones'), gerente.token);
    check(invs.filter((i) => i.vigente).length >= PENDIENTES.length, 'Invitaciones pendientes visibles en gerencia');

    // Líderes: asignarlos por la API hace dos cosas (área + rol lider_area).
    for (const [k, clave] of Object.entries(LIDERES)) {
      const s = await login(persona(clave), tenantId);
      await http('PATCH', gerente.t(`/backoffice/areas/${areaId[k]}`), gerente.token, { liderMembershipId: s.mId });
    }
    const personasApi = await http<any[]>('GET', gerente.t('/backoffice/personas'), gerente.token);
    check(
      Object.values(LIDERES).every((c) => personasApi.find((x) => x.email === email(persona(c)))?.rol === 'lider_area'),
      'Los 3 líderes quedaron con rol lider_area',
    );

    for (const p of PERSONAS) if (!S[p.clave]) await login(p, tenantId);
    check(Object.keys(S).length === PERSONAS.length, `${PERSONAS.length} sesiones abiertas (una por persona)`);

    // -----------------------------------------------------------------------
    paso('3 · Catálogo y cupos');
    let catalogo = await http<any[]>('GET', gerente.t('/backoffice/catalog'), gerente.token);
    const item: Record<string, any> = {};
    for (const c of CATALOGO) {
      let it = catalogo.find((x) => x.nombre === c.nombre);
      if (!it) {
        const { k, cupos, ...dto } = c;
        it = await http('POST', gerente.t('/backoffice/catalog'), gerente.token, dto);
      }
      item[c.k] = it;
      // Cupos (DB): un periodo vigente por ítem; si ya hay, se deja como está.
      await ds.transaction(async (tx) => {
        await tx.query(`SELECT set_config('app.tenant_id', $1, true)`, [tenantId]);
        const vig = await tx.query(
          `SELECT 1 FROM benefit_stock WHERE "itemId" = $1 AND "periodoFin" > now() LIMIT 1`, [it.id]);
        if (!vig.length) {
          await tx.query(
            `INSERT INTO benefit_stock ("tenantId", "itemId", "cuposTotales", "cuposReservados", "cuposConsumidos", "periodoInicio", "periodoFin")
             VALUES ($1, $2, $3, 0, 0, now() - interval '1 day', now() + interval '30 days')`,
            [tenantId, it.id, c.cupos],
          );
        }
      });
    }
    catalogo = await http<any[]>('GET', gerente.t('/backoffice/catalog'), gerente.token);
    check(catalogo.filter((x) => x.familia === 'tiempo' && x.activo).length >= 3, 'Gate: 3 intrarrecompensas de tiempo activas');

    // -----------------------------------------------------------------------
    paso('4 · Opt-out y preferencias de ranking');
    for (const p of PERSONAS.filter((x) => x.optOut)) {
      await http('PATCH', yo(p.clave).t('/economy/juego'), yo(p.clave).token, { optInJuego: false });
    }
    await http('PATCH', yo('sofia').t('/economy/ranking/prefs'), yo('sofia').token, { verTablaCompleta: true });
    await http('PATCH', yo('ricardo').t('/economy/ranking/prefs'), yo('ricardo').token, { participaEnRanking: false });
    check(true, 'Andrea apagó el juego · Sofía ve la tabla completa · Ricardo no aparece en el ranking');

    // -----------------------------------------------------------------------
    paso('5 · Misiones: comunicación entre personas');
    const colaboraciones: Array<{ missionId: string; a: string; b: string }> = [];
    const oroInicial: Record<string, number> = {};
    for (const k of Object.keys(S)) {
      oroInicial[k] = (await http<any>('GET', yo(k).t('/economy/saldo'), yo(k).token)).oro;
    }

    const hoy = new Date().toISOString().slice(0, 10);
    const en = (dias: number) => new Date(Date.now() + dias * 86400000).toISOString();

    /** A crea (sugiriendo a B), B acepta y B cierra: el flujo completo con Oro. */
    async function ciclo(a: string, b: string, titulo: string, o: { u?: string; i?: string; e?: string; cerrar?: boolean; enlaces?: string[]; dias?: number } = {}) {
      const mision = await http<any>('POST', yo(a).t('/missions'), yo(a).token, {
        titulo: `${titulo} · ${hoy}`,
        descripcion: `Misión de ejemplo creada por ${persona(a).nombre}.`,
        urgencia: o.u ?? 'media', importancia: o.i ?? 'media', esfuerzo: o.e ?? 'medio',
        asignadoMembershipId: yo(b).mId,
        fechaLimite: en(o.dias ?? 5),
        enlaces: o.enlaces ?? [],
      });
      await http('POST', yo(b).t(`/missions/${mision.id}/aceptar`), yo(b).token);
      colaboraciones.push({ missionId: mision.id, a, b });
      if (o.cerrar === false) return { mision, cierre: null };
      const cierre = await http<any>('POST', yo(b).t(`/missions/${mision.id}/cerrar`), yo(b).token, {
        clientOccurredAt: new Date().toISOString(),
      });
      return { mision, cierre };
    }

    // Líder → su equipo
    await ciclo('carlos', 'luisa', 'Calibrar tostadora 2 antes del lote grande', { u: 'alta', i: 'alta', e: 'alto' });
    await ciclo('carlos', 'jose', 'Inventario de sacos de café verde', { e: 'bajo' });
    await ciclo('carlos', 'daniela', 'Probar el nuevo perfil de tueste medio', { i: 'alta', cerrar: false });
    await ciclo('carlos', 'valentina', 'Revisar cadena de frío de la tienda Valencia', { u: 'alta' });
    await ciclo('gabriela', 'miguel', 'Cerrar pedido corporativo de 40 kg', { u: 'alta', i: 'alta', e: 'alto' });
    await ciclo('gabriela', 'sofia', 'Actualizar precios en las 3 tiendas', { i: 'alta', e: 'bajo' });
    await ciclo('gabriela', 'camila', 'Llamar a los 10 clientes mayoristas del mes', { u: 'alta', i: 'alta', e: 'alto' });
    await ciclo('alejandro', 'isabella', 'Fotos del nuevo empaque para redes', { i: 'alta', enlaces: ['https://drive.example.com/empaque'] });
    await ciclo('alejandro', 'paola', 'Calendario de contenidos de octubre', { e: 'alto' });
    await ciclo('alejandro', 'andrea', 'Brief para la campaña de temporada'); // Andrea: XP sí, Oro no (opt-out)

    // Entre pares y entre áreas (esto alimenta «quién trabaja con quién»)
    await ciclo('luisa', 'pedro', 'Cubrir turno de apertura del jueves', { u: 'alta', e: 'bajo' });
    await ciclo('miguel', 'luisa', 'Preparar muestras para cliente corporativo', { i: 'alta' });
    await ciclo('sofia', 'isabella', 'Material POP para la tienda Chacao', { u: 'media', i: 'alta' });
    await ciclo('isabella', 'ricardo', 'Validar precios del catálogo web', { e: 'bajo' });
    await ciclo('jose', 'daniela', 'Ordenar el depósito de empaques', { u: 'baja', i: 'baja', e: 'medio' });
    await ciclo('paola', 'miguel', 'Testimonios de clientes para Instagram', { u: 'baja' });
    await ciclo('ricardo', 'jose', 'Etiquetas del lote de exportación', { u: 'alta', e: 'alto' });
    await ciclo('andres', 'gabriela', 'Reporte de ventas del trimestre', { i: 'alta', e: 'alto' });
    await ciclo('mariana', 'carlos', 'Plan de mantenimiento de equipos', { i: 'alta', e: 'alto' });
    await ciclo('camila', 'sofia', 'Guion de atención telefónica', { u: 'media' });

    // Abiertas, sin tomar: carga visible de la empresa (estilo Asana)
    for (const [k, t] of [
      ['pedro', 'Reparar molino de la tienda Altamira'],
      ['valentina', 'Buscar proveedor de leche vegetal en Valencia'],
      ['diego', 'Revisar métricas de la campaña de agosto'],
    ] as const) {
      await http('POST', yo(k).t('/missions'), yo(k).token, {
        titulo: `${t} · ${hoy}`, urgencia: 'media', importancia: 'media', esfuerzo: 'medio', fechaLimite: en(7),
      });
    }

    // Anti-cheat: Diego crea, acepta y cierra su propia misión → XP sí, Oro 0.
    const propia = await http<any>('POST', yo('diego').t('/missions'), yo('diego').token, {
      titulo: `Ordenar mi carpeta de diseños · ${hoy}`, urgencia: 'alta', importancia: 'alta', esfuerzo: 'alto',
    });
    await http('POST', yo('diego').t(`/missions/${propia.id}/aceptar`), yo('diego').token);
    const cierrePropia = await http<any>('POST', yo('diego').t(`/missions/${propia.id}/cerrar`), yo('diego').token);
    check(cierrePropia.oroOtorgado === 0 && cierrePropia.xp > 0, `Anti-cheat: misión propia da ${cierrePropia.xp} XP y 0 Oro`);

    // Deriva de reloj: un cierre con hora del futuro se rechaza.
    const futura = await http<any>('POST', yo('pedro').t('/missions'), yo('pedro').token, {
      titulo: `Cierre con reloj adelantado · ${hoy}`, asignadoMembershipId: yo('jose').mId,
    });
    await http('POST', yo('jose').t(`/missions/${futura.id}/aceptar`), yo('jose').token);
    const deriva = await intentar(() => http('POST', yo('jose').t(`/missions/${futura.id}/cerrar`), yo('jose').token, {
      clientOccurredAt: en(1),
    }));
    check(!deriva.ok && (deriva.e as HttpError).motivo === 'DERIVA_RELOJ', 'Deriva de reloj: cierre con fecha futura rechazado (DERIVA_RELOJ)');

    // Opt-out: Andrea no ganó Oro.
    const oroAndrea = (await http<any>('GET', yo('andrea').t('/economy/saldo'), yo('andrea').token)).oro;
    check(oroAndrea === oroInicial['andrea'], `Opt-out: Andrea cerró una misión y su Oro no cambió (${oroAndrea})`);

    // Tope diario: nadie supera 150 Oro ganados hoy.
    const saldos: Record<string, number> = {};
    for (const k of Object.keys(S)) {
      saldos[k] = (await http<any>('GET', yo(k).t('/economy/saldo'), yo(k).token)).oro;
    }
    const ganadoMax = Math.max(...Object.keys(S).map((k) => saldos[k] - oroInicial[k]));
    check(ganadoMax <= 150, `Tope diario respetado (máximo ganado hoy: ${ganadoMax} Oro)`);

    // Colaboradores (DB) — creador y quien aceptó, en cada misión compartida.
    await ds.transaction(async (tx) => {
      await tx.query(`SELECT set_config('app.tenant_id', $1, true)`, [tenantId]);
      for (const c of colaboraciones) {
        for (const k of [c.a, c.b]) {
          await tx.query(
            `INSERT INTO mission_collaborators ("tenantId", "missionId", "membershipId") VALUES ($1, $2, $3)
             ON CONFLICT ("missionId", "membershipId") DO NOTHING`,
            [tenantId, c.missionId, yo(k).mId],
          );
        }
      }
    });
    check(true, `${colaboraciones.length} misiones compartidas registradas como colaboración (Diego queda trabajando solo)`);

    // -----------------------------------------------------------------------
    paso('6 · Tienda: canjes, aprobaciones y fallos esperados');
    const canjear = (k: string, it: string) => intentar(() =>
      http<any>('POST', yo(k).t('/redemptions'), yo(k).token, { itemId: item[it].id }));

    // Café: no requiere aprobación → queda CONFIRMADO de una vez.
    for (const k of ['luisa', 'jose', 'sofia', 'isabella']) {
      const r = await canjear(k, 'cafe');
      if (!r.ok) console.log(`    (café de ${k}: ${(r.e as HttpError).motivo ?? r.e.message})`);
    }
    const canjesLuisa = await http<any[]>('GET', yo('luisa').t('/redemptions'), yo('luisa').token);
    check(canjesLuisa.some((c) => c.itemId === item.cafe.id && c.estado === 'CONFIRMADO'), 'Café de cortesía: confirmado sin aprobación');

    // Salida 2h: requiere aprobación → RESERVADO, el líder confirma.
    const salidaLuisa = await canjear('luisa', 'salida');
    const salidaMiguel = await canjear('miguel', 'salida');
    const aConfirmar: Array<[string, any]> = [];
    if (salidaLuisa.ok && salidaLuisa.v.redemptionId) aConfirmar.push(['carlos', salidaLuisa.v.redemptionId]);
    if (salidaMiguel.ok && salidaMiguel.v.redemptionId) aConfirmar.push(['gabriela', salidaMiguel.v.redemptionId]);
    for (const [lider, id] of aConfirmar) {
      await intentar(() => http('POST', yo(lider).t(`/redemptions/${id}/confirmar`), yo(lider).token, {}));
    }
    const canjesMiguel = await http<any[]>('GET', yo('miguel').t('/redemptions'), yo('miguel').token);
    check(
      canjesMiguel.some((c) => c.itemId === item.salida.id && c.estado === 'CONFIRMADO'),
      'Salida 2h de Miguel: reservada y aprobada por su líder (aparece en «quién no va a estar»)',
    );

    // Almuerzo de Valentina: queda RESERVADO, esperando aprobación (para ver pendientes).
    await canjear('valentina', 'almuerzo');

    // Un empleado NO puede aprobar canjes.
    const almuerzoCamila = await canjear('camila', 'almuerzo');
    const estadoAlmuerzo = almuerzoCamila.ok
      ? (await http<any[]>('GET', yo('camila').t('/redemptions'), yo('camila').token))
          .find((c) => c.id === almuerzoCamila.v.redemptionId)?.estado
      : undefined;
    if (almuerzoCamila.ok && estadoAlmuerzo !== 'RESERVADO') {
      console.log('    (el almuerzo de Camila ya se probó hoy — la reversión se vuelve a probar mañana)');
    } else if (almuerzoCamila.ok && almuerzoCamila.v.redemptionId) {
      const auto = await intentar(() => http('POST', yo('camila').t(`/redemptions/${almuerzoCamila.v.redemptionId}/confirmar`), yo('camila').token, {}));
      check(!auto.ok && (auto.e as HttpError).status === 403, 'Roles: un empleado no puede aprobarse su propio canje (403)');
      // Gerencia lo revierte: el Oro vuelve.
      const antes = (await http<any>('GET', yo('camila').t('/economy/saldo'), yo('camila').token)).oro;
      await http('POST', gerente.t(`/redemptions/${almuerzoCamila.v.redemptionId}/revertir`), gerente.token, {
        motivo: 'Ejemplo: el restaurante cerró ese día',
      });
      const despues = (await http<any>('GET', yo('camila').t('/economy/saldo'), yo('camila').token)).oro;
      check(despues > antes, `Reversión: el Oro de Camila volvió (${antes} → ${despues})`);
    }

    // Cine: 1 solo cupo, dos interesados.
    const cine1 = await canjear('gabriela', 'cine');
    const cine2 = await canjear('carlos', 'cine');
    const motivoCine2 = !cine2.ok ? (cine2.e as HttpError).motivo : undefined;
    check(cine1.ok && motivoCine2 === 'CUPO_AGOTADO', `Cupo agotado: el segundo pedido de cine recibe ${motivoCine2 ?? 'OK (¿ya había stock?)'}`);

    // Saldo insuficiente y opt-out.
    const caro = await canjear('diego', 'mediodia');
    check(!caro.ok && (caro.e as HttpError).motivo === 'SALDO_INSUFICIENTE', 'Saldo insuficiente: Diego no alcanza el medio día libre');
    const andreaCanje = await canjear('andrea', 'cafe');
    check(!andreaCanje.ok && (andreaCanje.e as HttpError).motivo === 'OPT_OUT_ACTIVO', 'Opt-out: Andrea no puede canjear con el juego apagado');

    // -----------------------------------------------------------------------
    paso('7 · Líder de área: «quién necesita una mano»');
    await ds.transaction(async (tx) => {
      await tx.query(`SELECT set_config('app.tenant_id', $1, true)`, [tenantId]);
      const señales: Array<[string, string, string, number]> = [
        ['pedro', 'ops', 'FECHAS_MAL_PUESTAS', 24],
        ['diego', 'mkt', 'TRABAJA_SOLO', 35],
        ['camila', 'ventas', 'BLOQUEADO_POR_TERCEROS', 22],
      ];
      for (const [k, area, patron, dias] of señales) {
        await tx.query(
          `INSERT INTO help_signals ("tenantId", "areaId", "membershipId", patron, "detectadoDesde", "ultimaEvaluacion")
           VALUES ($1, $2, $3, $4, current_date - $5::int, current_date)
           ON CONFLICT ("tenantId", "membershipId", patron) DO UPDATE SET "ultimaEvaluacion" = current_date`,
          [tenantId, areaId[area], yo(k).mId, patron, dias],
        );
      }
    });
    const ayudaCarlos = await http<any[]>('GET', yo('carlos').t('/lider/ayuda'), yo('carlos').token);
    check(ayudaCarlos.length === 1 && ayudaCarlos[0].nombreMembership === 'Pedro Gómez', 'Carlos ve solo a Pedro en su área (no ve otras áreas)');
    await http('POST', yo('carlos').t('/lider/ayuda/interaccion'), yo('carlos').token, {
      membershipId: yo('pedro').mId, tipo: 'CONVERSO', nota: 'Revisamos juntos las fechas de sus misiones.',
    });
    const hist = await http<any[]>('GET', yo('carlos').t('/lider/ayuda/historial'), yo('carlos').token);
    check(hist.length > 0, 'Carlos registró una conversación y la ve en su historial');
    const ajeno = await intentar(() => http('GET', yo('luisa').t('/lider/ayuda'), yo('luisa').token));
    check(!ajeno.ok && (ajeno.e as HttpError).status === 403, 'Roles: un empleado no entra al panel de líder (403)');
    const ajenoG = await intentar(() => http('GET', yo('carlos').t('/backoffice/dashboard'), yo('carlos').token));
    check(!ajenoG.ok && (ajenoG.e as HttpError).status === 403, 'Roles: un líder no entra al BackOffice de gerencia (403)');

    // -----------------------------------------------------------------------
    paso('8 · Lo que ve cada superficie');
    const avisosCarlos = await http<any[]>('GET', yo('carlos').t('/notifications'), yo('carlos').token);
    check(avisosCarlos.length > 0, `Avisos: Carlos tiene ${avisosCarlos.length} (misiones de su área, aceptaciones, cierres)`);
    const avisosDaniela = await http<any[]>('GET', yo('daniela').t('/notifications'), yo('daniela').token);
    check(avisosDaniela.some((n) => n.tipo === 'MISION_SUGERIDA'), 'Avisos: Daniela recibió «te sugirieron para una misión»');
    const ranking = await http<any>('GET', yo('sofia').t('/economy/ranking'), yo('sofia').token);
    const tabla: any[] = ranking.tabla ?? [];
    check(tabla.length > 7, `Ranking: Sofía pidió la tabla completa y ve ${tabla.length} personas`);
    check(!tabla.some((f) => f.membershipId === yo('ricardo').mId), 'Ranking: Ricardo (se excluyó) no aparece en la tabla de Sofía');
    check(!tabla.some((f) => f.membershipId === yo('andrea').mId), 'Ranking: Andrea (juego apagado) tampoco aparece');
    const dash = await http<any>('GET', gerente.t('/backoffice/dashboard'), gerente.token);
    check(!!dash.gate?.lanzado, 'Gerencia: gate de lanzamiento cumplido (3 de tiempo + un canje confirmado)');
    check((dash.areas ?? []).length === 3, 'Gerencia: resumen agregado de las 3 áreas (sin nombres)');
    const resumen = await http<any[]>('GET', yo('gabriela').t('/lider/resumen-area'), yo('gabriela').token);
    check(resumen.length === 1 && resumen[0].mostrarDesempeno === true, 'Líder: su área tiene ≥4 personas, se muestra el agregado');
    const colab = await http<any[]>('GET', yo('alejandro').t('/lider/colaboracion'), yo('alejandro').token);
    const diego = colab.find((c) => c.nombreMembership === 'Diego Navarro');
    check(!!diego && Number(diego.colaboradores) === 0, 'Líder: Diego aparece con 0 colaboradores (trabaja solo)');

    // Vista interna: se lee con la conexión de su rol, igual que el endpoint.
    const interna = await ds.query(`SELECT count(*)::int AS n FROM v_resumen_usuario_interno WHERE "tenantId" = $1`, [tenantId]);
    check(interna[0].n >= PERSONAS.length, `Vista interna: ${interna[0].n} filas por persona para esta empresa`);

    // -----------------------------------------------------------------------
    console.log('\n──────────────────────────────────────────────────────────────');
    const fallos = checks.filter((c) => !c.ok);
    console.log(`RESULTADO: ${checks.length - fallos.length}/${checks.length} verificaciones OK`);
    if (fallos.length) {
      console.log('Fallaron:');
      for (const f of fallos) console.log(`  ✗ ${f.texto}`);
    }
    console.log(`\nEmpresa: ${EMPRESA}  ·  tenantId ${tenantId}`);
    console.log(`Contraseña de todas las cuentas: ${DEMO_PASSWORD}\n`);
    console.log('  Gerencia        mariana@' + DOMINIO + ' (admin) · andres@' + DOMINIO);
    console.log('  Líderes         carlos@ (Operaciones) · gabriela@ (Ventas) · alejandro@ (Marketing)');
    console.log('  Colaboradores   luisa@ pedro@ daniela@ miguel@ sofia@ camila@ isabella@ diego@ andrea@ …');
    console.log(`                  (todas @${DOMINIO})`);
    console.log('\nQué mirar:');
    console.log('  /app            luisa: Oro, canjes, avisos · daniela: misión en curso · valentina: almuerzo esperando aprobación · andrea: juego apagado');
    console.log('  /lider          carlos: Pedro necesita una mano + conversación · alejandro: Diego trabaja solo');
    console.log('  /gerencia       mariana: gate cumplido, canjes por familia, personas, 2 invitaciones pendientes');
    console.log('  /levelop-interno/  tu cuenta interna: la empresa en «Empresas» y sus usuarios con Oro y tareas\n');
    if (fallos.length) process.exitCode = 2;
  } finally {
    await ds.destroy();
  }
}

main().catch((e) => {
  console.error('\nError armando la empresa de ejemplo:', e instanceof HttpError ? e.message : e?.message ?? e);
  process.exit(1);
});
