export default function Stat({ label, value, unit }) {
  return (
    <div className="stat">
      <span className="stat-value">
        {value}
        {unit ? <small> {unit}</small> : null}
      </span>
      <span className="stat-label">{label}</span>
    </div>
  )
}
