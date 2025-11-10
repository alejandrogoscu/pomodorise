/*
 * Componente StatsCard - Tarjeta para mostrar una métrica individual
 *
 * Teacher note:
 * - Componente presentacional (recibe props, solo renderiza)
 * - Reutilizable para diferentes métricas (sesiones, minutos, puntos)
 * - CSS separado para mantener componente limpio
 * - Sin lógica de negocio (el padre usa useStats)
 *
 * Analogía: StatsCard es como un panel informativo en un dashboard
 * (solo muestra un número y su etiqueta, no calcula nada)
 */

import "./StatsCard.css";

/*
 * Props del componente StatsCard
 *
 * Teacher note:
 * - icon: emoji o carácter para representar visualmente la métrica
 * - label: descripción de la métrica ("Total sesiones", "Puntos ganados")
 * - value: número a mostrar
 */
interface StatsCardProps {
  icon: string;
  label: string;
  value: number | string;
}

/*
 * Componente StatsCard
 *
 * @param props - Propiedades del componente
 * @returns Tarjeta con icono, etiqueta y valor
 *
 * @example
 * <StatsCard
 *   icon="🎯"
 *   label="Total sesiones"
 *   value={stats.totalSessions}
 *   color="primary"
 * />
 *
 * Teacher note:
 * - Componente simple sin estado interno
 * - El color se aplica como clase CSS para personalización
 * - Puede recibir números o strings (útil para "N/A" si no hay datos)
 */
function StatsCard({ icon, label, value }: StatsCardProps) {
  return (
    <div className="stats-card">
      {/* Icono visual */}
      <span className="stats-card-icon">
        <svg
          width={32}
          height={32}
          fill="var(--color-accent)"
          aria-hidden="true"
        >
          <use href={`/icons.svg#${icon}`} />
        </svg>
      </span>

      {/* Contenido */}
      <div className="stats-card-content">
        <span className="stats-card-label">{label}</span>
        <span className="stats-card-value">{value}</span>
      </div>
    </div>
  );
}

export default StatsCard;
