import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import TiltCard from '../components/TiltCard';
import TypeWriter from '../components/TypeWriter';
import JwtDisplay from '../components/JwtDisplay';

function Welcome() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [token] = useState(() => localStorage.getItem('token') || '');

    useEffect(() => {
        api.get('/users/me')
            .then((res) => setUser(res.data))
            .catch(() => {
                api.get('/me')
                    .then((res) => setUser(res.data))
                    .catch(() => {
                        localStorage.removeItem('token');
                        navigate('/login');
                    });
            });
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error("Logout failed on server", e);
        }
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!user) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--erp-surface)' }}>
                <div className="erp-loader"></div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--erp-surface)', padding: '3rem 1rem' }}>
            <div className="erp-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="erp-alert erp-alert--success" style={{ marginBottom: '2rem', animation: 'slideDown 0.5s ease-out' }}>
                    <i className="fa-solid fa-circle-check"></i>
                    <div>Authentication successful! Your JWT session is active.</div>
                </div>

                <div className="erp-card" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2rem', animation: 'fadeIn 0.6s ease-out' }}>
                    <div className="erp-avatar erp-avatar--lg" style={{ width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto 1.5rem', background: 'var(--erp-primary)' }}>
                        {user.username[0].toUpperCase()}
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Welcome, {user.username}!</h1>
                    <p style={{ color: 'var(--erp-text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>You are now signed into the PVG Unified Portal.</p>
                    
                    <div className="erp-form-grid-2" style={{ textAlign: 'left', gap: '1.5rem', borderTop: '1px solid var(--erp-border)', paddingTop: '2rem' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--erp-text-muted)', fontWeight: 700 }}>Email Identity</label>
                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{user.email}</div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--erp-text-muted)', fontWeight: 700 }}>Account Privilege</label>
                            <div>
                                <span className={`erp-pill ${user.role === 'admin' ? 'erp-pill--active' : 'erp-pill--pending'}`} style={{ textTransform: 'uppercase' }}>
                                    {user.role || 'Guest'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {['admin', 'vice_principal', 'hod'].includes(user.role) && (
                    <div className="erp-card" style={{ marginBottom: '2rem', background: 'var(--erp-primary)', border: 'none', color: 'white' }}>
                        <div className="erp-card__body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>Administrative Access Detected</div>
                                <div style={{ opacity: 0.8 }}>You have permission to manage the system environment.</div>
                            </div>
                            <button className="erp-btn erp-btn--light" onClick={() => window.location.href = '/admin/dashboard'}>
                                Launch Admin <i className="fa-solid fa-arrow-up-right-from-square"></i>
                            </button>
                        </div>
                    </div>
                )}

                <div className="erp-card" style={{ marginBottom: '2rem' }}>
                    <div className="erp-card__header">
                        <div className="erp-card__title"><i className="fa-solid fa-key" style={{ marginRight: '0.5rem', opacity: 0.5 }}></i> Current JWT Integrity</div>
                    </div>
                    <div className="erp-card__body">
                        <JwtDisplay token={token} />
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button className="erp-btn erp-btn--ghost erp-btn--lg" onClick={handleLogout}>
                        <i className="fa-solid fa-right-from-bracket"></i> Terminate Session
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Welcome;
