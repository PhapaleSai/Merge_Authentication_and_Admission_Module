import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import TiltCard from '../components/TiltCard';

function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const formData = new URLSearchParams();
            formData.append('username', form.username);
            formData.append('password', form.password);
            
            const res = await api.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            localStorage.setItem('token', res.data.access_token);
            
            // Redirect based on role
            const userRole = res.data.role;
            if (['admin', 'vice_principal', 'hod', 'management'].includes(userRole)) {
                // Instantly teleport Admin directly to Admission Admin Dashboard correctly
                window.location.href = `http://localhost:5174/admin/dashboard?token=${res.data.access_token}`;
            } else {
                // Students/Applicants go directly to Admission Module frontend
                window.location.href = `http://localhost:5174/?token=${res.data.access_token}`;
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="erp-auth-page">
            <div className="erp-auth-page__brand">
                <div className="animate-premium" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ 
                        width: '180px', 
                        height: '180px', 
                        background: 'white', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        border: '4px solid rgba(255,255,255,0.1)'
                    }}>
                        <img 
                            src="/assets/pvg_logo.png" 
                            alt="PVG Logo" 
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'contain'
                            }} 
                        />
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Portal.</h1>
                    <p style={{ fontSize: '1.25rem', opacity: 0.7, marginTop: '1rem', fontWeight: 300 }}>Unified Student & Applicant Gateway for PVG COET&M</p>
                    
                    <div style={{ marginTop: 'auto', paddingTop: '4rem', opacity: 0.4, fontSize: '0.85rem', fontWeight: 500 }}>
                        &copy; {new Date().getFullYear()} PUNE VIDYARTHI GRIHA
                    </div>
                </div>
            </div>

            <div className="erp-auth-page__form">
                <div className="erp-auth-box animate-premium" style={{ animationDelay: '0.1s' }}>
                    <div className="erp-auth-box__header" style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>Welcome Back</h2>
                        <p style={{ marginTop: '0.5rem', opacity: 0.6, color: '#64748b' }}>Access your academic and admission profile</p>
                    </div>

                    {error && (
                        <div style={{ 
                            background: '#fee2e2', color: '#ef4444', padding: '1rem', 
                            borderRadius: '12px', marginBottom: '2rem', fontSize: '0.88rem',
                            display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500,
                            border: '1px solid rgba(239, 68, 68, 0.1)'
                        }} className="animate-premium">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="erp-form-group">
                            <label htmlFor="username">Student / Applicant ID</label>
                            <div style={{ position: 'relative' }}>
                                <i className="fa-solid fa-user-graduate" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, fontSize: '1.1rem' }}></i>
                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    className="erp-form-control"
                                    style={{ paddingLeft: '3.2rem', height: '56px', borderRadius: '16px', color: '#0f172a' }}
                                    placeholder="Your registered email or ID"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="erp-form-group">
                            <label htmlFor="password">Security Credentials</label>
                            <div style={{ position: 'relative' }}>
                                <i className="fa-solid fa-key" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, fontSize: '1.1rem' }}></i>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    className="erp-form-control"
                                    style={{ paddingLeft: '3.2rem', height: '56px', borderRadius: '16px', color: '#0f172a' }}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="btn-primary" 
                            style={{ 
                                width: '100%', 
                                marginTop: '1.5rem', 
                                height: '56px', 
                                borderRadius: '16px',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                background: '#0c1e47',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer'
                            }} 
                            disabled={loading}
                        >
                            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Secure Sign In'}
                        </button>
                    </form>

                    <div className="divider" style={{ 
                        margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem',
                        color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase'
                    }}>
                        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                        <span>Access Gateway</span>
                        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                    </div>

                    <div className="switch-link" style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
                        Don't have an account? {' '}
                        <Link to="/signup" style={{ color: '#0c1e47', fontWeight: 700, textDecoration: 'none' }}>Create one here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
