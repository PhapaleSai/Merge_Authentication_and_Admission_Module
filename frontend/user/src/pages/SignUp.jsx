import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import TiltCard from '../components/TiltCard';
import PasswordStrength from '../components/PasswordStrength';

function SignUp() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        student_class: '',
        phone: '',
        username: '',
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
            const res = await api.post('/signup', form);
            localStorage.setItem('token', res.data.access_token);
            navigate('/welcome');
        } catch (err) {
            setError(err.response?.data?.detail || 'Sign up failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="erp-auth-page">
            <div className="erp-auth-page__brand">
                <img src="/assets/wordmark.jpg" alt="PVG Logo" style={{ maxWidth: '180px', marginBottom: '2rem', filter: 'brightness(0) invert(1)' }} />
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>PVG COET&M</h1>
                <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>Start your journey with Pune's premier engineering institute.</p>
                <div style={{ marginTop: '3rem', opacity: 0.6, fontSize: '0.9rem' }}>
                    &copy; {new Date().getFullYear()} Pune Vidyarthi Griha's COET&M
                </div>
            </div>

            <div className="erp-auth-page__form">
                <div className="erp-auth-box" style={{ maxWidth: '550px' }}>
                    <div className="erp-auth-box__header">
                        <h2>Create Student Account</h2>
                        <p>Join the PVG digital campus today.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="erp-form-group">
                            <label htmlFor="name">Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <i className="fa-solid fa-user-tag" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}></i>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    className="erp-form-control"
                                    style={{ paddingLeft: '2.8rem' }}
                                    placeholder="Enter your full name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="erp-form-grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="erp-form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="student_class">Class / Year</label>
                                <input
                                    id="student_class"
                                    type="text"
                                    name="student_class"
                                    className="erp-form-control"
                                    placeholder="e.g. SY BSc"
                                    value={form.student_class}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="erp-form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    className="erp-form-control"
                                    placeholder="9876543210"
                                    value={form.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid var(--erp-border)', margin: '1.5rem 0' }} />

                        <div className="erp-form-group">
                            <label htmlFor="username">Choose Username</label>
                            <div style={{ position: 'relative' }}>
                                <i className="fa-solid fa-at" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}></i>
                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    className="erp-form-control"
                                    style={{ paddingLeft: '2.8rem' }}
                                    placeholder="username_123"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="erp-form-group">
                            <label htmlFor="password">Security Password</label>
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
                            <PasswordStrength password={form.password} />
                        </div>

                        {error && (
                            <div className="erp-alert erp-alert--danger" style={{ marginBottom: '1.5rem' }}>
                                <i className="fa-solid fa-circle-exclamation"></i>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="erp-btn erp-btn--primary erp-btn--lg" style={{ width: '100%' }} disabled={loading}>
                            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Create Account'}
                        </button>
                    </form>

                    <div className="erp-auth-box__footer" style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem', color: 'var(--erp-text-muted)' }}>
                        Already have an account? {' '}
                        <Link to="/login" style={{ color: 'var(--erp-primary)', fontWeight: 700, textDecoration: 'none' }}>Login here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
