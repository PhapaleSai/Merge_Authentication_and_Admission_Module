export default function JwtDisplay({ token }) {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return <span>{token}</span>;

    const colors = {
        header: '#fb7185',  // rose/red
        payload: '#a78bfa',  // purple
        signature: '#38bdf8',  // sky blue
    };

    const labels = ['HEADER', 'PAYLOAD', 'SIGNATURE'];

    return (
        <div className="jwt-display">
            <div className="jwt-legend">
                {labels.map((label, i) => (
                    <span key={label} className="jwt-legend-item">
                        <span className="jwt-dot" style={{ background: Object.values(colors)[i] }} />
                        <span style={{ color: Object.values(colors)[i] }}>{label}</span>
                    </span>
                ))}
            </div>
            <div className="jwt-token-box">
                <span style={{ color: colors.header }}>{parts[0]}</span>
                <span className="jwt-dot-sep">.</span>
                <span style={{ color: colors.payload }}>{parts[1]}</span>
                <span className="jwt-dot-sep">.</span>
                <span style={{ color: colors.signature }}>{parts[2]}</span>
            </div>
        </div>
    );
}
