import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        try {
            const response = await api.post('/auth/login', formData);
            const data = response.data;

            // Store token in localStorage
            localStorage.setItem('admin_token', data.access_token);
            localStorage.setItem('admin_user', JSON.stringify({
                user_id: data.user_id,
                username: data.username,
                full_name: data.full_name,
                email: data.email || '',
                role: data.role,
                permissions: data.permissions || [],
            }));

            // Hard redirect — ensures AuthProvider re-initializes fresh with the new token
            window.location.href = '/dashboard';
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
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
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3), 0 0 20px rgba(15, 66, 124, 0.4)',
                        border: '4px solid rgba(255,255,255,0.1)'
                    }}>
                        <img 
                            src="/assets/wordmark.jpg" 
                            alt="PVG Logo" 
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'contain'
                            }} 
                        />
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Portal.</h1>
                    <p style={{ fontSize: '1.25rem', opacity: 0.7, marginTop: '1rem', fontWeight: 300 }}>Unified Identity & Access Management for PVG COET&M</p>
                    
                    <div style={{ marginTop: 'auto', paddingTop: '4rem', opacity: 0.4, fontSize: '0.85rem', fontWeight: 500 }}>
                        &copy; {new Date().getFullYear()} PUNE VIDYARTHI GRIHA
                    </div>
                </div>
            </div>

            <div className="erp-auth-page__form">
                <div className="erp-auth-box glass-effect animate-premium" style={{ animationDelay: '0.1s' }}>
                    <div className="erp-auth-box__header">
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Welcome Back</h2>
                        <p style={{ marginTop: '0.5rem', opacity: 0.6 }}>Please sign in to your campus account</p>
                    </div>

                    {error && (
                        <div className="erp-alert erp-alert--danger animate-premium" style={{ marginBottom: '2rem', borderRadius: '12px' }}>
                            <i className="fa-solid fa-circle-exclamation"></i>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="erp-form-group">
                            <label htmlFor="username">Identity ID</label>
                            <div style={{ position: 'relative' }}>
                                <i className="fa-solid fa-id-card" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, fontSize: '1.1rem' }}></i>
                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    className="erp-form-control"
                                    style={{ paddingLeft: '3.2rem', height: '56px', borderRadius: '16px' }}
                                    placeholder="Username or Staff Email"
                                    value={credentials.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="erp-form-group">
                            <label htmlFor="password">Secret Key</label>
                            <div style={{ position: 'relative' }}>
                                <i className="fa-solid fa-fingerprint" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, fontSize: '1.1rem' }}></i>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    className="erp-form-control"
                                    style={{ paddingLeft: '3.2rem', height: '56px', borderRadius: '16px' }}
                                    placeholder="••••••••"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="erp-btn erp-btn--primary erp-btn--lg glow-btn" 
                            style={{ 
                                width: '100%', 
                                marginTop: '1.5rem', 
                                height: '56px', 
                                borderRadius: '16px',
                                fontSize: '1rem',
                                fontWeight: 700,
                                boxShadow: '0 10px 20px -5px var(--erp-glow-primary)'
                            }} 
                            disabled={loading}
                        >
                            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Authenticate Account'}
                        </button>
                    </form>

                    <div className="erp-auth-box__footer" style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.9rem' }}>
                        <span style={{ opacity: 0.6 }}>New to the portal?</span> {' '}
                        <Link to="/signup" style={{ color: 'var(--erp-primary)', fontWeight: 700, textDecoration: 'none' }}>Create Account</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
