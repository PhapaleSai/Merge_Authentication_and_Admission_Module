import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import PasswordStrength from '../components/PasswordStrength';

const SignUp = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        full_name: '',
        username: '',
        email: '',
        password: '',
    });
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
            // Self-registration for students
            const payload = {
                ...form,
            };
            await api.post('/auth/register', payload);
            
            // Auto login after signup
            const loginData = new FormData();
            loginData.append('username', form.username);
            loginData.append('password', form.password);
            
            const loginRes = await api.post('/auth/login', loginData);
            localStorage.setItem('admin_token', loginRes.data.access_token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Sign up failed. Please try again.');
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
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Join.</h1>
                    <p style={{ fontSize: '1.25rem', opacity: 0.7, marginTop: '1rem', fontWeight: 300 }}>Start your journey with PVG COET&M's digital campus.</p>
                </div>
            </div>

            <div className="erp-auth-page__form">
                <div className="erp-auth-box glass-effect animate-premium" style={{ maxWidth: '550px' }}>
                    <div className="erp-auth-box__header">
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Identity Registration</h2>
                        <p style={{ marginTop: '0.5rem', opacity: 0.6 }}>Create your student or staff account</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="erp-form-group">
                            <label htmlFor="full_name">Legal Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <i className="fa-solid fa-user-tag" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}></i>
                                <input
                                    id="full_name"
                                    type="text"
                                    name="full_name"
                                    className="erp-form-control"
                                    style={{ paddingLeft: '3.2rem', height: '52px', borderRadius: '14px' }}
                                    placeholder="Enter your full name"
                                    value={form.full_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="erp-form-group">
                            <label htmlFor="email">Institutional Email</label>
                            <div style={{ position: 'relative' }}>
                                <i className="fa-solid fa-envelope" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}></i>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    className="erp-form-control"
                                    style={{ paddingLeft: '3.2rem', height: '52px', borderRadius: '14px' }}
                                    placeholder="e.g. name@pvgcoet.ac.in"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="erp-form-grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                            <div className="erp-form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="username">Username</label>
                                <input id="username" type="text" name="username" className="erp-form-control" style={{ height: '52px', borderRadius: '14px' }} placeholder="user_123" value={form.username} onChange={handleChange} required />
                            </div>
                            <div className="erp-form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="password">Password</label>
                                <input id="password" type="password" name="password" className="erp-form-control" style={{ height: '52px', borderRadius: '14px' }} placeholder="••••••••" value={form.password} onChange={handleChange} required />
                            </div>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <PasswordStrength password={form.password} />
                        </div>

                        {error && (
                            <div className="erp-alert erp-alert--danger" style={{ marginBottom: '1.5rem' }}>
                                <i className="fa-solid fa-circle-exclamation"></i>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="erp-btn erp-btn--primary erp-btn--lg glow-btn" style={{ width: '100%', height: '56px', borderRadius: '16px' }} disabled={loading}>
                            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Continue Registration'}
                        </button>
                    </form>

                    <div className="erp-auth-box__footer" style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
                        <span style={{ opacity: 0.6 }}>Already have an account?</span> {' '}
                        <Link to="/login" style={{ color: 'var(--erp-primary)', fontWeight: 700, textDecoration: 'none' }}>Back to Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
