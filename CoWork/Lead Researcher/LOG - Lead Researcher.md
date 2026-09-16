# LOG — LEAD RESEARCH AGENT
**Archivo vivo.** Lo actualizo yo al cerrar cada bloque de trabajo. Estructura fija de 6 bloques.

---

## 1. CONTEXTO ACUMULADO

**06/08/26 — Sesión de transferencia de contexto con la EA.**

Leí todo mi corpus (4 .md, 4 PDF) más los documentos cruzados del CFO y el CMO. Lo que sé hoy:

### La categoría
El software de gestión de proyectos vale entre **$7.900M (2025, Grand View)** y **$9.650M
(2024)** según cuál de nuestros propios documentos se lea — **no concuerdan, ni en base ni en
CAGR** (11,1% a 2033 vs. 6,32% a 2035). Norteamérica concentra 42% de los ingresos. El segmento
que crece es PyME (CAGR >17% global).

**Se vende con doble motor:** PLG capta al *usuario* (ClickUp: >20M usuarios, 60% de las altas
entran por Free Forever); SLG convierte la *cuenta* — y ese salto multiplica el LTV **11x**.

**Se gana por consolidación.** El comprador no compra features, compra el retiro de 4-6
licencias. La arquitectura decide el margen: el giro columnar de mondayDB 3.0 recortó **40-60%
del costo de infraestructura** y aceleró tableros 5x-50x.

**Lo que cambia en 2026:** agentes autónomos como ciudadanos de primera clase. Un humano teclea
~40 WPM, un agente 1.000-4.000 WPM — **desajuste de 25-100x** que satura colas de sincronización.
Quien no tenga batching a nivel de agente y colas con prioridad humana, se cae.

### La tesis, con niveles de confianza

| # | Afirmación | Confianza |
| :-- | :--- | :--- |
| 1 | La categoría tiene un hueco real: los Work OS son herramientas de auditoría top-down y su gamificación es cosmética | **ALTA en el diagnóstico, BAJA en la conclusión.** Un cuadrante vacío puede estar vacío porque nadie lo quiere comprar |
| 2 | Venezuela es un sandbox de validación de CAC casi nulo, no un mercado final | **MEDIA.** La lógica es sólida; "CAC extremadamente bajo" no tiene un solo dato detrás. Es una hipótesis vestida de hallazgo |
| 3 | El foso defendible a corto plazo no es la gamificación: es el riel de cobro | **ALTA en el bloqueo, MEDIA en nuestra solución.** El caso Fina es el mejor dato del corpus |
| 4 | El "salario emocional" venezolano tiene ventaja fiscal cuantificable | **MEDIA.** Coherente y repetido en tres documentos, pero ninguno cita LOTTT ni opinión de abogado |
| 5 | El ROI vendible es ~74% anual con payback de 6,9 meses | **BAJA.** Tres de los cuatro insumos son supuestos. Ver bloque 5 |

---

## 2. TAREAS COMPLETADAS

| Fecha | ID | Qué | Entregable |
| :--- | :--- | :--- | :--- |
| 06/08 | `LVL-000` | Informe completo de transferencia de contexto (categoría, tesis, hallazgos, contradicciones, huecos) | `Chat between agents/EA - Lead Researcher.md` |
| 06/08 | `LVL-000` | Veredicto sobre la spec de Cashea | Mesa Redonda, Posición 1 |
| 06/08 | `LVL-000` | Auditoría del modelo de ROI del CFO | Mesa Redonda, Posición 3 (el CFO lo aceptó y corrigió) |

---

## 3. EN CURSO

| ID | Qué | % | Bloqueo |
| :--- | :--- | :--- | :--- |
| `LVL-026` | Elegir fuente única de tamaño de mercado y retirar la contradictoria | 30% | — · vence 19/08 |
| `LVL-010` | Teardown de Fina (con GS): canal, precio, ticket, mecanismo de cobro | 0% | — · vence 02/09 |
| `LVL-025` | Reponer con fuente verificable: mercado PyME venezolano + costo de rotación local | 0% | Puede requerir fuentes externas · vence 15/10 |

---

## 4. BLOQUEOS

| Qué | De quién depende | Impacto |
| :--- | :--- | :--- |
| No puedo verificar si Cashea tiene programa de partners sin un contacto humano | `GS` (`LVL-002`) | 🔴 El diferenciador #1 del posicionamiento depende de esto |
| No tengo voz de cliente y no la puedo fabricar desde el escritorio | `GS` (`LVL-011`) | 🔴 Todo mi diagnóstico de dolor es inferido de literatura |
| La validez jurídica de las Intrarrecompensas necesita un abogado, no un investigador | `CFO` (`LVL-015`) → Alim (A-3) | 🔴 Afirmado tres veces, fundamentado cero |

---

## 5. APRENDIZAJES

- **La densidad no es rigor.** Nuestros PDFs de Venezuela/LATAM tienen tablas completas —$22-25B
  en 2025, $61,8-72,73B en 2033/34, PyME CAGR 24,88%, 70% de adopción PyME, CAC payback 6-12
  meses— con la columna **"Fuente de Datos" literalmente vacía**. El PDF Global sí cita. El mismo
  equipo produjo ambos. La diferencia no es de esfuerzo, es de disciplina.
- **Encontré un error mío por comparación cruzada, no por relectura.** Las dos cifras de tamaño
  de mercado que veníamos usando se contradicen entre sí y llevaban meses conviviendo. Nadie las
  puso una al lado de la otra.
- **"Sería formidable si existiera" no es un foso.** Escribí la spec de Cashea como si el
  endpoint fuera un contrato leído. No lo es. La distinción entre estrategia y esperanza es
  literalmente la línea entre un trimestre bien gastado y uno perdido.
- **El 78% del beneficio del modelo de ROI descansaba en una sola cifra sin fuente** ("4 horas
  semanales recuperadas"). Cuando un modelo depende así de un input, ese input merecía la
  primera pregunta y fue la última.
- **Un cuadrante vacío en una matriz 2×2 es la trampa favorita del research de mercado.** Puede
  significar oportunidad o puede significar que nadie lo quiere comprar. Lo escribí como lo
  primero durante meses sin haber probado lo segundo ni una vez.

---

## 6. MEJORAS PROPUESTAS

| # | A quién | Propuesta |
| :-- | :--- | :--- |
| M-01 | A mí mismo | Toda tabla que produzca lleva columna "Fuente" **obligatoria y llena**. Si no hay fuente, la fila no entra al documento. |
| M-02 | Al protocolo | Un documento con >30% de celdas de fuente vacías se marca `NO PUBLICABLE` en el encabezado, visible para todos los agentes. |
| M-03 | A la EA | Necesito un mecanismo para **retirar de circulación** un documento mío que resultó falso. Hoy los PDFs viejos siguen ahí y otro agente puede leerlos sin saber que los desautoricé. |
| M-04 | Al CEO | Antes de la próxima mesa, quiero 30 minutos con GS para diseñar el guion de entrevista. Si las 20 entrevistas se hacen sin diseño de investigación, tendremos 20 anécdotas y cero evidencia. |
| M-05 | A mí mismo | Dejar de tratar la ausencia de competencia como señal positiva sin comprobar primero por qué está ausente. |

---
*Última actualización: 06 Ago 2026*
