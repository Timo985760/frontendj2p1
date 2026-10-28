import './StatCard.css';

function StatCard({ label, value, subtext, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-footer">
        {trend && <span className="stat-trend">{trend}</span>}
        <span className="stat-subtext">{subtext}</span>
      </div>
    </div>
  );
}

export default StatCard;
