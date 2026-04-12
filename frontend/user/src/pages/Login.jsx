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
            const res = await api.post('/login', form);
            localStorage.setItem('token', res.data.access_token);
            navigate('/welcome');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="erp-auth-page">
            <div className="erp-auth-page__brand">
                <img src="/assets/wordmark.jpg" alt="PVG Logo" style={{ maxWidth: '180px', marginBottom: '2rem', filter: 'brightness(0) invert(1)' }} />
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>PVG COET&M</h1>
                <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>Unified Authentication & Authorization System</p>
                <div style={{ marginTop: '3rem', opacity: 0.6, fontSize: '0.9rem' }}>
                    &copy; {new Date().getFullYear()} Pune Vidyarthi Griha's COET&M
                </div>
            </div>
            
            <div className="erp-auth-page__form">
                <div className="erp-auth-box">
                    <div className="erp-auth-box__header">
                        <h2>Login to your Account</h2>
                        <p>Welcome back! Please enter your details.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="erp-form-group">
                            <label htmlFor="username">Username or Email</label>
                            <div style={{ position: 'relative' }}>
                                <i className="fa-solid fa-user" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}></i>
                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    className="erp-form-control"
                                    style={{ paddingLeft: '2.8rem' }}
                                    placeholder="e.g. sidhu_12"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="erp-form-group">
                            <label htmlFor="password">Password</label>
                            <div style={{ position: 'relative' }}>
                                <i className="fa-solid fa-lock" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}></i>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    className="erp-form-control"
                                    style={{ paddingLeft: '2.8rem' }}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="erp-alert erp-alert--danger" style={{ marginBottom: '1.5rem' }}>
                                <i className="fa-solid fa-circle-exclamation"></i>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="erp-btn erp-btn--primary erp-btn--lg" style={{ width: '100%' }} disabled={loading}>
                            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Sign In'}
                        </button>
                    </form>

                    <div className="erp-auth-box__footer" style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem', color: 'var(--erp-text-muted)' }}>
                        Don't have an account? {' '}
                        <Link to="/signup" style={{ color: 'var(--erp-primary)', fontWeight: 700, textDecoration: 'none' }}>Create one here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
