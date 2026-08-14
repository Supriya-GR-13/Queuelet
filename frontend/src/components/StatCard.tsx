interface StatCardProps {
  icon: string;
  color: "blue" | "purple" | "green" | "orange";
  label: string;
  value: number | string;
  hint?: string;
}

function StatCard({ icon, color, label, value, hint }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div>
        <p>{label}</p>
        <h2>{value}</h2>
        {hint && <span className="positive">{hint}</span>}
      </div>
    </div>
  );
}

export default StatCard;
