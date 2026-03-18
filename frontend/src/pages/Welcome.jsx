import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import TiltCard from '../components/TiltCard';
import TypeWriter from '../components/TypeWriter';
import JwtDisplay from '../components/JwtDisplay';

function Welcome() {
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [token] = useState(() => localStorage.getItem('token') || '');

    useEffect(() => {
        api.get('/me')
            .then((res) => setStudent(res.data))
            .catch(() => {
                localStorage.removeItem('token');
                navigate('/login');
            });
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!student) {
        return (
            <div className="page-container">
                <div className="loading-screen">
                    <span className="spinner large" />
                    <p>Verifying your JWT token...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">


            <TiltCard className="welcome-card">
                <span className="badge success">✓ Authenticated via JWT</span>
                <div className="welcome-icon">🎉</div>
                <h1 className="welcome-heading">
                    Hi, <span className="highlight">{student.username}</span>!
                </h1>
                <p className="welcome-subtitle">
                    <TypeWriter text="Welcome to PVG College of Science" speed={40} />
                </p>

                <div className="student-info">
                    <div className="info-row">
                        <span className="info-label">👤 Name</span>
                        <span className="info-value">{student.name}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">📚 Class</span>
                        <span className="info-value">{student.student_class}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">📞 Phone</span>
                        <span className="info-value">{student.phone}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">🏷️ Username</span>
                        <span className="info-value">{student.username}</span>
                    </div>
                </div>

                {token && (
                    <div className="token-display">
                        <div className="token-header">🔑 Your JWT Token</div>
                        <JwtDisplay token={token} />
                    </div>
                )}

                <button className="btn-logout" onClick={handleLogout}>
                    Logout
                </button>
            </TiltCard>
        </div>
    );
}

export default Welcome;
