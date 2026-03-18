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
        <div className="page-container">
            <TiltCard>
                <div className="card-header">
                    <span className="badge primary">✦ Student Registration</span>
                    <div className="logo-wrapper">
                        <span className="logo">🎓</span>
                    </div>
                    <h1>PVG College of Science</h1>
                    <p className="subtitle">Create your student account to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <div className="input-wrapper">
                            <input
                                id="name"
                                type="text"
                                name="name"
                                className="has-icon"
                                placeholder="Enter your full name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                            />
                            <span className="input-icon">👤</span>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="student_class">Class / Year</label>
                            <div className="input-wrapper">
                                <input
                                    id="student_class"
                                    type="text"
                                    name="student_class"
                                    className="has-icon"
                                    placeholder="e.g. SY BSc"
                                    value={form.student_class}
                                    onChange={handleChange}
                                    required
                                />
                                <span className="input-icon">📚</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <div className="input-wrapper">
                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    className="has-icon"
                                    placeholder="9876543210"
                                    value={form.phone}
                                    onChange={handleChange}
                                    required
                                />
                                <span className="input-icon">📞</span>
                            </div>
                        </div>
                    </div>

                    <div className="divider"><span>Account Credentials</span></div>

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <div className="input-wrapper">
                            <input
                                id="username"
                                type="text"
                                name="username"
                                className="has-icon"
                                placeholder="Choose a unique username"
                                value={form.username}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                            />
                            <span className="input-icon">⚡</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <input
                                id="password"
                                type="password"
                                name="password"
                                className="has-icon"
                                placeholder="Create a strong password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                            <span className="input-icon">🔒</span>
                        </div>
                        <PasswordStrength password={form.password} />
                    </div>

                    {error && <div className="error-msg">⚠ {error}</div>}

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <span className="spinner" /> : 'Create Account →'}
                    </button>
                </form>

                <p className="switch-link">
                    Already have an account?{' '}
                    <Link to="/login">Login here</Link>
                </p>
            </TiltCard>
        </div>
    );
}

export default SignUp;
