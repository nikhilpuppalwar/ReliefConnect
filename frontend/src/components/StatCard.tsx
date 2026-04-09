interface StatCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  accentColor?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  trend,
  trendUp,
  accentColor = "var(--primary-container)",
}: StatCardProps) {
  return (
    <div className="stat-card" style={{ borderTop: `2px solid ${accentColor}` }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <span
          className="label-md"
          style={{ color: "var(--on-surface-variant)", fontSize: "0.7rem" }}
        >
          {label}
        </span>
        {icon && (
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: `${accentColor}22`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: accentColor,
            }}
          >
            {icon}
          </div>
        )}
      </div>
      <div
        style={{
          fontFamily: "var(--font-headline)",
          fontSize: "2rem",
          fontWeight: 700,
          color: "var(--on-background)",
          lineHeight: 1,
          marginBottom: trend ? "0.5rem" : 0,
        }}
      >
        {value}
      </div>
      {trend && (
        <div
          style={{
            fontSize: "0.75rem",
            color: trendUp ? "#6dffb3" : "#ff9a9a",
            fontWeight: 500,
          }}
        >
          {trendUp ? "↑" : "↓"} {trend}
        </div>
      )}
    </div>
  );
}
