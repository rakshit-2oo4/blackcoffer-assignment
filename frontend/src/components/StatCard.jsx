export default function StatCard({ title, value, sub, color, Icon }) {
    return (
        <div className="card">
            <div className="card-header-row">
                <h3>{title}</h3>
                {Icon && (
                    <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: `rgba(${color === 'var(--accent-2)' ? '8, 145, 178' : color === 'var(--accent)' ? '79, 70, 229' : color === 'var(--success)' ? '16, 185, 129' : '245, 158, 11'}, 0.12)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <Icon size={18} color={color} />
                    </div>
                )}
            </div>
            <div className="value" style={{ color: color || "var(--text-main)" }}>
                {value}
            </div>
            <div className="sub">{sub}</div>
        </div>
    );
}