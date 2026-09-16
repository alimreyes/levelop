# ESTADO DEL `LEVELOP_ROI Pricing Model` (xlsx + 2 CSV en esta carpeta)
**Nota agregada por:** CFO Agent · 07 Ago 2026

## Superado por auditoría — se conserva como evidencia, no como fuente vigente

El modelo original en `LEVELOP_ROI Pricing Model.xlsx` (y su espejo en los 2 CSV de esta carpeta)
fue el material de partida para la Mesa Redonda de Cashea del 06/08/26, y **no sobrevivió el
escrutinio del Lead Researcher ni el mío propio**.

**Lo que se cayó, y por qué:**

- El **78% del beneficio proyectado** descansaba en "4 horas semanales recuperadas" — cifra que no
  aparece con fuente en ningún documento del corpus.
- Valor hora usado en el original: **$2,19**. El propio `Venezuelan Market Playbook` dice $240/mes
  de ingreso integrado → **$1,38/hora real**. 59% de sobreestimación en el input que multiplica el
  78% del beneficio.
- **"Ahorro fiscal" de $4.200: en gran medida ficticio en Venezuela.** La compensación real ya se
  paga vía bonos no salariales exentos (Bono de Guerra + Cestaticket) — no se puede vender un 35%
  de ahorro sobre dinero que el cliente ya paga exento.
- **Precio modelado: $8/usuario.** El precio real por empleado es **$28** ($8 de licencia + $20 de
  pool de recompensas) — el pool nunca apareció como línea en este modelo original.
- La celda **"Grounded in Rigorous Latin American Industry Case Studies ✅ Verified"** no estaba
  verificada por nada. Es la razón por la que el protocolo ahora prohíbe la palabra "Verified" o
  cualquier ✅ en un entregable sin link a la verificación (mejora M-04 del CFO).
- Reducción de rotación del 30%: es un benchmark de **Wellhub**, no un dato propio, y no estaba
  señalado como tal.

## Dónde está el modelo vigente

`CFO/LOG - CFO Agent.md`, bloque 2 (Tareas completadas) — tabla de 3 escenarios (conservador / base
/ optimista) con el origen de cada input marcado (`DATO` / `DATO DERIVADO` / `⚠️ SUPUESTO`).

**Resultado del modelo revisado (50 empleados, hora base $1,38):**

| | Conservador | Base | Optimista |
| :--- | :--- | :--- | :--- |
| Beneficio anual total | $1.288 | $3.816 | $9.410 |
| Costo suscripción | $2.628 | $2.628 | $2.628 |
| **ROI / Payback** | **−51% / nunca** | **+45% / 8,3 meses** | **+258% / 3,4 meses** |

**Precio vigente de trabajo (actualizado 07/08/26, mismo día):** $50/mes, 10 asientos incluidos +
$4/asiento adicional. Reemplaza el $79/15+$4 inicial — Alim lo pidió reevaluar por ser elevado
para el mercado venezolano; el recorte no es parejo (−37% a 10 empleados, −4% a 50, −2% a 100).
Promo trimestral $100/3 meses (Programa Fundadores) y semestral $270/6 meses activas. Anual
$480/12 meses diseñada, no publicada hasta `LVL-022`. Pool de recompensas línea aparte, default
$0. Sigue pendiente de ratificación **final** hasta que el CTO entregue el costo de inferencia de
IA por usuario/mes (`LVL-022`).

No borro ni edito los archivos originales de esta carpeta: son el registro de cómo se encontró y
corrigió el error, y eso vale más que un archivo limpio. Cualquier agente que llegue a esta carpeta
debe leer esta nota antes de usar el xlsx/csv original como fuente.

---
*CFO Agent · Regla propia: "cuando mi propio modelo se cae, lo digo yo antes de que lo diga un
cliente."*
