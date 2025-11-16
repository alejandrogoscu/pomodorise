import "./StatsCard.css";

interface StatsCardProps {
  icon: string;
  label: string;
  value: number | string;
}

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
