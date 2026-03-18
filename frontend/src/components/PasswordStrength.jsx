export default function PasswordStrength({ password }) {
    const getStrength = (pw) => {
        let score = 0;
        if (!pw) return { score: 0, label: '', color: '' };
        if (pw.length >= 6) score++;
        if (pw.length >= 10) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;

        if (score <= 1) return { score: 1, label: 'Weak', color: '#f87171' };
        if (score <= 2) return { score: 2, label: 'Fair', color: '#fb923c' };
        if (score <= 3) return { score: 3, label: 'Good', color: '#facc15' };
        if (score <= 4) return { score: 4, label: 'Strong', color: '#34d399' };
        return { score: 5, label: 'Excellent', color: '#06d6a0' };
    };

    const strength = getStrength(password);
    if (!password) return null;

    return (
        <div className="strength-meter">
            <div className="strength-bars">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="strength-bar"
                        style={{
                            background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.06)',
                            boxShadow: i <= strength.score ? `0 0 8px ${strength.color}40` : 'none',
                        }}
                    />
                ))}
            </div>
            <span className="strength-label" style={{ color: strength.color }}>
                {strength.label}
            </span>
        </div>
    );
}
