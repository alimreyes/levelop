# ✅ LVL UP V1.1 - Checklist de Implementación

## 🚀 FASE 0: FUNDACIÓN TÉCNICA (Semanas 1-3)

### Backend Setup
- [ ] Crear repositorio backend (NestJS)
- [ ] Configurar PostgreSQL local
- [ ] Configurar Docker Compose para desarrollo
- [ ] Setup de variables de entorno
- [ ] Configurar ESLint y Prettier

### Base de Datos
- [ ] Diseñar schema completo
- [ ] Crear migraciones para todas las tablas
- [ ] Seed data inicial (usuarios de prueba, shop items)
- [ ] Índices de performance

### Autenticación
- [ ] Implementar registro de usuarios
- [ ] Implementar login con JWT
- [ ] Middleware de autenticación
- [ ] Refresh token system
- [ ] Password reset flow

### Sistema de Roles
- [ ] Definir roles en base de datos
- [ ] Guards para roles
- [ ] Decorators para permisos
- [ ] Tests de permisos

### API Endpoints Básicos
- [ ] POST /auth/register
- [ ] POST /auth/login
- [ ] GET /auth/me
- [ ] GET /users
- [ ] GET /users/:id
- [ ] PUT /users/:id
- [ ] GET /tasks
- [ ] POST /tasks
- [ ] PUT /tasks/:id
- [ ] DELETE /tasks/:id
- [ ] POST /tasks/:id/complete

### Integración Frontend
- [ ] Instalar React Query
- [ ] Crear API client con axios
- [ ] Implementar interceptor para tokens
- [ ] Error handling global
- [ ] Loading states

---

## 🎯 FASE 1: MEJORAS CRÍTICAS DE UX (Semana 4-5)

### Login y Sesión
- [ ] Botón mostrar/ocultar contraseña
- [ ] Checkbox "Mantener sesión iniciada"
- [ ] Auto-login al abrir app
- [ ] Expiración de sesión después de 30 días
- [ ] Mensaje de bienvenida personalizado

### Navegación Intuitiva
- [ ] Click en oro → ir a tienda
- [ ] Click en nivel → ir a perfil/héroe
- [ ] Click en monedas header → tienda
- [ ] Breadcrumbs en navegación
- [ ] Animaciones de transición

### Permisos en UI
- [ ] Ocultar botón X (eliminar) para usuarios normales
- [ ] Mostrar badge "Jefe" en perfil
- [ ] Dashboard diferenciado para jefes
- [ ] Restricciones visuales según rol

### Acciones Rápidas en Misiones
- [ ] Botón ✓ para completar desde lista
- [ ] Modal rápido para reasignar
- [ ] Solicitud de cambio de fecha
  - [ ] Modal "Tu solicitud está en proceso"
  - [ ] Notificación al jefe
  - [ ] Sistema de aprobación/rechazo
  - [ ] Historial de cambios

### Modal Nueva Tarea
- [ ] Convertir a modal superpuesto
- [ ] Diseño mejorado
- [ ] Preview de recompensas calculadas
- [ ] Validación de campos
- [ ] Animación de entrada

### Mejoras en Filtros
- [ ] Indicador visual de dropdown (⌄)
- [ ] Botón X para cerrar
- [ ] Hacer sticky en scroll
- [ ] Contador de filtros activos
- [ ] Reset rápido de todos los filtros

### Crear Tareas Variadas
- [ ] 10 tareas con diferentes características
- [ ] Mix de urgencias (baja/media/alta)
- [ ] Mix de importancias (baja/media/alta)
- [ ] Fechas variadas (hoy, mañana, semana, mes)
- [ ] Diferentes recompensas

---

## 🎮 FASE 2: ECONOMÍA Y GAMIFICACIÓN (Semanas 6-7)

### Rebalanceo de Economía
- [ ] Calcular multiplicadores finales
- [ ] Fórmula: 1 día bueno = 1 ítem medio
- [ ] Ajustar precios de ítems:
  - [ ] Comunes: 50-100 gold
  - [ ] Raros: 200-400 gold
  - [ ] Épicos: 500-800 gold
- [ ] Ajustar recompensas de tareas
- [ ] Testing de balance con datos simulados

### Sistema de Inventario
- [ ] Tabla en base de datos
- [ ] Tab "Inventario" en Héroe
- [ ] Grid de ítems comprados
- [ ] Mostrar fecha de vencimiento
- [ ] Indicador de tiempo restante
- [ ] Botón "Equipar" para activar
- [ ] Indicador de ítems activos en header
- [ ] Animación al equipar

### Lógica de Beneficios de Ítems
- [ ] Endpoint para equipar ítem
- [ ] Validar que no esté expirado
- [ ] Aplicar efectos:
  - [ ] Arco de Hielo: +50min en tarea
  - [ ] Espada de Fuego: Bloquear asignación 1hr
  - [ ] Casco del Sabio: +25% XP en difíciles
  - [ ] Coraza del Amanecer: -50% penalización
- [ ] Cooldowns en backend
- [ ] Cron job para expiración
- [ ] Notificación cuando expira

### Mejoras de Tienda
- [ ] Audit mobile responsive
- [ ] Fix textos amuñuñados
- [ ] Filtros por beneficio:
  - [ ] Tiempo ⏰
  - [ ] Experiencia ⚡
  - [ ] Oro 💰
  - [ ] Protección 🛡️
- [ ] Sistema de descuentos por vencimiento:
  - [ ] 12hrs: 10% off
  - [ ] 6hrs: 25% off
  - [ ] 1hr: 50% off
  - [ ] Badge visual de descuento
- [ ] Al comprar, remover de disponibles
- [ ] Rotación diaria automática:
  - [ ] Cron job diario
  - [ ] Algoritmo de rotación
  - [ ] Historial de rotaciones

---

## 📱 FASE 3: NOTIFICACIONES (Semanas 8-9)

### Sistema Real-time
- [ ] Setup Socket.io en backend
- [ ] Cliente Socket.io en frontend
- [ ] Conexión automática al login
- [ ] Reconexión automática

### Tipos de Notificaciones
- [ ] Tarea asignada
- [ ] Mención en comentario
- [ ] Compra realizada
- [ ] Ítem por vencer (6hrs antes)
- [ ] Solicitud de cambio de fecha (jefes)
- [ ] Logro desbloqueado
- [ ] Nivel subido
- [ ] Título otorgado

### Funcionalidad
- [ ] Click → ir a sección correspondiente
- [ ] Marcar como leída
- [ ] Marcar todas como leídas
- [ ] Badge con contador en tab
- [ ] Sonido al recibir (opcional)

### Filtros de Notificaciones
- [ ] Tab: Todas
- [ ] Tab: Menciones
- [ ] Tab: Tareas
- [ ] Tab: Compras
- [ ] Tab: Logros
- [ ] Badge con contador por categoría

---

## 📊 FASE 4: ANALYTICS Y LÍDERES (Semanas 10-11)

### Reestructuración UI
- [ ] Sección 1: Top 5 Líderes (destacado)
- [ ] Sección 2: Tu Progreso (colapsable)
- [ ] Sección 3: Gráficas (colapsable)
- [ ] Sub-menú con tabs:
  - [ ] Ranking
  - [ ] Analytics
  - [ ] Tips IA

### Analytics Backend
- [ ] Endpoint: Ranking global
- [ ] Endpoint: Ranking por departamento
- [ ] Endpoint: Estadísticas de usuario
- [ ] Endpoint: Comparación de períodos
- [ ] Setup Redis para cache
- [ ] Cron job para pre-calcular stats

### Mejoras de UI
- [ ] Fix scroll en gráficas mobile
- [ ] Filtro semana/mes sticky
- [ ] Remover fechas de eje X
- [ ] Tooltips en hover
- [ ] Mostrar posición en header
- [ ] Rediseñar "Ver Ranking por"

### Detalle de Usuario
- [ ] Modal al click en usuario
- [ ] Avatar y nombre
- [ ] Nivel, XP, Oro, Tareas
- [ ] Gráfica de progreso
- [ ] Botón "Desafiar" (para Fase 7)
- [ ] Estadística: "Para superarlo necesitas..."

### Pop-up de Resumen
- [ ] Detectar primera entrada a Líderes
- [ ] Modal con cambios desde última visita
- [ ] Nuevos líderes destacados
- [ ] Récords de la semana
- [ ] Redacción épica
- [ ] Logros destacados del usuario
- [ ] Botón "Cerrar" que no vuelva a mostrar hoy

---

## 🦸 FASE 5: LOGROS Y TÍTULOS (Semanas 12-13)

### Sistema de Logros
- [ ] Tabla de logros en BD
- [ ] Definir 20 logros:
  - [ ] Primera tarea
  - [ ] 5 tareas en un día
  - [ ] Racha de 7 días
  - [ ] 0 tareas atrasadas (mes)
  - [ ] Colaborador activo
  - [ ] Top 3 del mes
  - [ ] Compra primera arma
  - [ ] Etc.
- [ ] Cron job para verificar logros
- [ ] Endpoint para verificar logros
- [ ] Notificación al desbloquear
- [ ] Badge en perfil
- [ ] Beneficios asociados:
  - [ ] 5 tareas diarias → 5min salida temprano
  - [ ] Racha 7 días → +10% XP 1 semana
  - [ ] 0 atrasadas → Escudo 1 semana

### Sistema de Títulos
- [ ] Análisis de patrones:
  - [ ] Entrega anticipada → "el Veloz"
  - [ ] Alta precisión → "el Preciso"
  - [ ] Colaborador → "el Cooperativo"
  - [ ] Top performer → "el Implacable"
- [ ] Algoritmo de asignación
- [ ] Cron job semanal para actualizar
- [ ] Mostrar en perfil
- [ ] Mostrar en ranking
- [ ] Notificación al obtener
- [ ] Historial de títulos

### Generador de Lore
- [ ] Botón "Mi Historia" en Héroe
- [ ] Endpoint para generar lore
- [ ] Integración con IA
- [ ] Analizar última semana
- [ ] Analizar último mes
- [ ] Narrativa épica personalizada
- [ ] Resaltar logros
- [ ] Sugerir áreas de mejora

---

## 🤖 FASE 6: INTELIGENCIA ARTIFICIAL (Semanas 14-16)

### LVL UP AI
- [ ] Sección en Líderes
- [ ] 3 modos:
  - [ ] "Cómo ser #1"
  - [ ] "Quién me puede superar"
  - [ ] "Mejorar mi posición"
- [ ] Integración con Claude API
- [ ] Prompt engineering para cada modo
- [ ] Cache de respuestas (5 min)
- [ ] Rate limiting

### IA para Tareas
- [ ] Detectar menciones en descripción
- [ ] Modal: "¿Crear tarea para @usuario?"
- [ ] Auto-completar campos sugeridos
- [ ] Confirmación antes de crear

### Indicador de Disponibilidad
- [ ] Calcular carga de trabajo
- [ ] En modal de asignación:
  - [ ] Mostrar tareas activas
  - [ ] Porcentaje de carga
  - [ ] Sugerencia visual:
    - [ ] 🟢 Disponible (0-40%)
    - [ ] 🟡 Ocupado (41-70%)
    - [ ] 🔴 Saturado (71-100%)

### Sistema de Dificultad
- [ ] Calcular automáticamente:
  - [ ] Urgencia + Importancia + Tiempo
- [ ] Niveles: Fácil / Media / Difícil / Épica
- [ ] Badge visual en tarea
- [ ] Aplicar multiplicadores de ítems
- [ ] Ajustar recompensas según dificultad

---

## 🏢 FASE 8: DASHBOARD JEFES (Semanas 17-18)

### Vista Especial
- [ ] Route /dashboard/leader
- [ ] Métricas del equipo:
  - [ ] Tareas completadas (semana/mes)
  - [ ] Promedio de XP del equipo
  - [ ] Tareas atrasadas
  - [ ] Mejor performer
  - [ ] Performer que necesita ayuda
- [ ] Gráficas de evolución
- [ ] Comparación con otros equipos

### Aprobaciones
- [ ] Lista de solicitudes pendientes
- [ ] Detalle de cada solicitud
- [ ] Botones Aprobar/Rechazar
- [ ] Notificación al usuario

### Análisis Automático
- [ ] IA analiza problemas del equipo
- [ ] Sugerencias de mejora
- [ ] Identificar cuellos de botella
- [ ] Recomendar redistribución de tareas

### Informes Automáticos
- [ ] Setup de email service (Resend o SendGrid)
- [ ] Template de email
- [ ] Cron job semanal
- [ ] Cron job mensual
- [ ] Resumen personalizado (jefes vs usuarios)
- [ ] Énfasis en mejoras
- [ ] Redacción motivacional

### Ente Regulador "Alim"
- [ ] Avatar del ente
- [ ] Mensajes contextuales
- [ ] Otorga títulos y logros
- [ ] Voz consistente
- [ ] Easter eggs

---

## 🎨 FASE 9: OPTIMIZACIÓN (Semanas 19-20)

### Performance
- [ ] React.memo en componentes pesados
- [ ] useMemo para cálculos complejos
- [ ] useCallback para funciones
- [ ] Lazy loading de tabs
- [ ] Code splitting por ruta
- [ ] Optimización de imágenes
- [ ] Bundle size analysis
- [ ] Lighthouse audit (score > 90)

### Mobile Responsive
- [ ] Audit completo
- [ ] Touch targets mínimo 44px
- [ ] Modales mobile-friendly
- [ ] Tienda responsive
- [ ] Gráficas responsive
- [ ] Tablas responsive
- [ ] Testing en devices reales

### Testing
- [ ] Setup Jest
- [ ] Tests unitarios:
  - [ ] Funciones de cálculo
  - [ ] Hooks
  - [ ] Utilidades
- [ ] Tests de componentes:
  - [ ] Login
  - [ ] TaskCard
  - [ ] Modal
  - [ ] Filtros
- [ ] Tests de integración
- [ ] Setup Playwright
- [ ] Tests E2E:
  - [ ] Login flow
  - [ ] Create task
  - [ ] Complete task
  - [ ] Shop purchase
- [ ] Coverage > 70%

### Búsqueda Mejorada
- [ ] Búsqueda global (todos los tabs)
- [ ] Resultados en tiempo real
- [ ] Highlighting de matches
- [ ] Filtros rápidos
- [ ] Atajo Cmd/Ctrl + K
- [ ] Animación de apertura
- [ ] Historial de búsquedas

---

## 🚢 DEPLOYMENT Y PRODUCCIÓN

### CI/CD
- [ ] GitHub Actions workflow
- [ ] Tests automáticos en PR
- [ ] Build automático
- [ ] Deploy automático a staging
- [ ] Deploy manual a production

### Hosting
- [ ] Frontend en Vercel
- [ ] Backend en Railway o Render
- [ ] PostgreSQL managed (Supabase o Neon)
- [ ] Redis managed (Upstash)
- [ ] Domain setup
- [ ] SSL certificates

### Monitoring
- [ ] Sentry para error tracking
- [ ] Analytics (PostHog o Mixpanel)
- [ ] Logs centralizados
- [ ] Health checks
- [ ] Uptime monitoring

### Documentation
- [ ] README completo
- [ ] Setup instructions
- [ ] API documentation (Swagger)
- [ ] Arquitectura diagram
- [ ] Deployment guide

---

## 🎯 FEATURES OPCIONALES (V1.2)

### Sistema de Batallas (Fase 7)
- [ ] Atributos de personajes
- [ ] Sistema de combate
- [ ] Apuestas de oro/objetos
- [ ] Historial de batallas
- [ ] Ranking de batallas

### Amenazas Grupales
- [ ] Eventos aleatorios
- [ ] Sistema de votación
- [ ] Recompensas/penalizaciones
- [ ] Narrativa épica

### Monetización (Fase 10)
- [ ] Stripe integration
- [ ] Planes de pricing
- [ ] Página de checkout
- [ ] Portal de suscripción
- [ ] Facturación automática

---

## 📊 MÉTRICAS DE PROGRESO

**Completado:** 0 / 200+ items  
**Progreso:** ░░░░░░░░░░ 0%

### Por Fase:
- Fase 0: ░░░░░░░░░░ 0%
- Fase 1: ░░░░░░░░░░ 0%
- Fase 2: ░░░░░░░░░░ 0%
- Fase 3: ░░░░░░░░░░ 0%
- Fase 4: ░░░░░░░░░░ 0%
- Fase 5: ░░░░░░░░░░ 0%
- Fase 6: ░░░░░░░░░░ 0%
- Fase 8: ░░░░░░░░░░ 0%
- Fase 9: ░░░░░░░░░░ 0%

---

## 💪 ¡VAMOS A COMENZAR!

**Próximo paso:** Marcar el primer checkbox ✅

¿Quieres que te ayude a implementar algo específico de esta lista?
