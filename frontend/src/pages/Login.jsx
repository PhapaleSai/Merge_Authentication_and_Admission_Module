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
        <div className="page-container">
            <TiltCard>
                <div className="card-header">
                    <span className="badge primary">🔐 JWT Authentication</span>
                    <div className="logo-wrapper">
                        <span className="logo">🎓</span>
                    </div>
                    <h1>Welcome Back</h1>
                    <p className="subtitle">Sign in to access your student portal</p>
                </div>

                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <div className="input-wrapper">
                            <input
                                id="username"
                                type="text"
                                name="username"
                                className="has-icon"
                                placeholder="Enter your username"
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
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                            <span className="input-icon">🔒</span>
                        </div>
                    </div>

                    {error && <div className="error-msg">⚠ {error}</div>}

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <span className="spinner" /> : 'Sign In →'}
                    </button>
                </form>

                <p className="switch-link">
                    Don&apos;t have an account?{' '}
                    <Link to="/signup">Create one here</Link>
                </p>
            </TiltCard>
        </div>
    );
}

export default Login;
