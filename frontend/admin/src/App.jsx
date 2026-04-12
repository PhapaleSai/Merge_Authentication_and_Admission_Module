import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link, NavLink } from 'react-router-dom';
import api from './api';
import { AuthContext, useAuth } from './AuthContext';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Audit from './pages/Audit';
import UserProfile from './pages/UserProfile';
import Export from './pages/Export';

// AuthContext is imported from ./AuthContext.js

function AuthProvider({ children }) {
    // Pre-load from cache for instant render (no spinner flash)
    const cachedUser = (() => {
        try { return JSON.parse(localStorage.getItem('admin_user')); } catch { return null; }
    })();

    const [user, setUser] = useState(cachedUser);
    const [loading, setLoading] = useState(!cachedUser); // skip loading if we have cache

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            localStorage.removeItem('admin_user');
            setUser(null);
            setLoading(false);
            return;
        }
        // Refresh user data from API in background
        api.get('/users/me')
            .then(res => {
                setUser(res.data);
                localStorage.setItem('admin_user', JSON.stringify(res.data));
            })
            .catch(() => {
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const logout = () => {
        api.post('/auth/logout').finally(() => {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            setUser(null);
            window.location.href = '/login';
        });
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// ── Protected Route ───────────────────────────────────────────────────────────
function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--erp-bg)' }}>
            <div className="erp-loader"></div>
        </div>
    );

    if (!localStorage.getItem('admin_token') || !user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(user.role?.toLowerCase())) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

// ── Sidebar Nav Link ─────────────────────────────────────────────────────────
function SidebarLink({ to, icon, label, iconColor }) {
    return (
        <NavLink to={to} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.6rem 0.75rem', borderRadius: '12px', marginBottom: '2px',
                    background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                    cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: isActive ? `0 4px 12px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.1)` : 'none',
                }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                    <div style={{
                        width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                        background: isActive ? iconColor + '30' : 'rgba(255,255,255,0.07)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                    }}>
                        <i className={`fa-solid ${icon}`} style={{ fontSize: '0.8rem', color: isActive ? iconColor : 'rgba(255,255,255,0.5)' }}></i>
                    </div>
                    <span style={{
                        fontSize: '0.85rem', fontWeight: isActive ? 700 : 500,
                        color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                        transition: 'color 0.2s'
                    }}>
                        {label}
                    </span>
                    {isActive && (
                        <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: iconColor, boxShadow: `0 0 8px ${iconColor}` }}></div>
                    )}
                </div>
            )}
        </NavLink>
    );
}

// ── Sidebar Layout ────────────────────────────────────────────────────────────
function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [theme, setTheme] = useState(localStorage.getItem('admin_theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-erp-theme', theme);
        localStorage.setItem('admin_theme', theme);
    }, [theme]);

    if (!user) return null;

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/dashboard') return 'Dashboard';
        if (path === '/users') return 'User Management';
        if (path.startsWith('/users/')) return 'User Profile';
        if (path === '/roles') return 'Roles & RBAC';
        if (path === '/audit') return 'Audit Log';
        if (path === '/export') return 'Export Hub';
        return 'Portal';
    };

    const isAdminRole = ['admin', 'vice_principal', 'hod'].includes(user.role?.toLowerCase());
    const isSuperAdmin = ['admin', 'vice_principal'].includes(user.role?.toLowerCase());

    return (
        <div className="erp-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--erp-bg)' }}>
        <aside className="erp-sidebar" style={{
            background: 'linear-gradient(180deg, #0c1e47 0%, #0d2260 50%, #0c356a 100%)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            position: 'fixed', left: 0, top: 0, bottom: 0, width: '280px',
            overflow: 'hidden', zIndex: 1000, display: 'flex', flexDirection: 'column'
        }}>
            {/* Decorative background circles */}
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(26,86,219,0.15)', pointerEvents: 'none' }}></div>
            <div style={{ position: 'absolute', bottom: '80px', left: '-40px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(26,86,219,0.08)', pointerEvents: 'none' }}></div>

            {/* Brand */}
            <div className="erp-sidebar__brand" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                    <img src="/assets/wordmark.jpg" alt="PVG Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="erp-sidebar__brand-text">
                    <h2 style={{ color: 'white', margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>PVG COET&M</h2>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Campus Portal</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="erp-sidebar__nav" style={{ flex: 1, overflowY: 'auto', padding: '0 0.75rem' }}>

                {/* General */}
                <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', padding: '0.75rem 0.75rem 0.4rem', marginTop: '0.5rem' }}>
                    General
                </div>
                <SidebarLink to="/dashboard" icon="fa-gauge-high" label="Dashboard" iconColor="#60a5fa" />

                {isAdminRole && (
                    <>
                        <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', padding: '1rem 0.75rem 0.4rem' }}>
                            Administration
                        </div>
                        {isSuperAdmin && (
                            <>
                                <SidebarLink to="/users" icon="fa-users" label="User Management" iconColor="#a78bfa" />
                                <SidebarLink to="/roles" icon="fa-shield-halved" label="Roles & RBAC" iconColor="#34d399" />
                            </>
                        )}
                        <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', padding: '1rem 0.75rem 0.4rem' }}>
                            System
                        </div>
                        <SidebarLink to="/audit" icon="fa-clipboard-list" label="Audit Log" iconColor="#fbbf24" />
                        <SidebarLink to="/export" icon="fa-file-export" label="Export Hub" iconColor="#f87171" />
                        
                        <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', padding: '1rem 0.75rem 0.4rem' }}>
                            Integrations
                        </div>
                        <a href="http://localhost:5174/admin/dashboard" style={{ textDecoration: 'none' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.6rem 0.75rem', borderRadius: '12px', marginBottom: '2px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'none'; }}
                            >
                                <div style={{
                                    width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                                    background: 'rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <i className="fa-solid fa-graduation-cap" style={{ fontSize: '0.8rem', color: '#fbbf24' }}></i>
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>
                                    Admission Module
                                </span>
                                <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}></i>
                            </div>
                        </a>
                    </>
                )}
            </nav>

            {/* User Footer */}
            <div style={{
                margin: '0.75rem', borderRadius: '16px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                backdropFilter: 'blur(10px)', position: 'relative', zIndex: 1
            }}>
                <div style={{
                    width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #1a56db, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 800, fontSize: '1rem',
                    boxShadow: '0 4px 12px rgba(26,86,219,0.4)'
                }}>
                    {user.username?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.username}
                    </p>
                    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {user.role}
                    </span>
                </div>
                <button onClick={logout} title="Logout" style={{
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px', width: '32px', height: '32px', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0
                }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#f87171'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                >
                    <i className="fa-solid fa-right-from-bracket" style={{ fontSize: '0.8rem' }}></i>
                </button>
            </div>
        </aside>

        <div style={{ flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <header className="erp-topbar" style={{
                position: 'fixed', top: 0, right: 0, left: '280px', height: '60px',
                background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--erp-border)', zIndex: 900,
                display: 'flex', alignItems: 'center', padding: '0', justifyContent: 'space-between'
            }}>
                <style>{`
                    .erp-main { margin-left: 0 !important; padding: 0 !important; }
                    .erp-topbar { left: 280px !important; padding-left: 0 !important; }
                    .erp-topbar__btn { margin-left: 0 !important; }
                `}</style>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="erp-topbar__btn" onClick={() => window.ERP?.Sidebar?.toggle?.()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--erp-text)', padding: '0 1rem' }}>
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    <nav className="erp-topbar__breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--erp-text-muted)' }}>
                        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>Portal</Link>
                        <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.6rem', opacity: 0.5 }}></i>
                        <span style={{ color: '#0c1e47', fontWeight: 700 }}>{getPageTitle()}</span>
                    </nav>
                </div>

                <div className="erp-topbar__actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        className="erp-btn erp-btn--ghost erp-btn--sm"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        style={{ width: '40px', height: '40px', padding: 0, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
                    </button>
                    <div style={{ height: '24px', width: '1px', background: 'var(--erp-border)' }}></div>
                    <div className="erp-topbar__user" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => navigate(`/users/${user.user_id}`)}>
                        <div className="erp-avatar erp-avatar--sm" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>{user.username?.[0]?.toUpperCase()}</div>
                        <span className="erp-topbar__user-name" style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.username}</span>
                    </div>
                </div>
            </header>

            <main className="erp-main" style={{ flex: 1, paddingTop: '60px', padding: 0 }}>
                <div className="erp-container" style={{ width: '100%', maxWidth: '100%', margin: '0', padding: 0 }}>
                    {children}
                </div>
            </main>
        </div>
        </div>
    );
}

// ── App Routes ────────────────────────────────────────────────────────────────
function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Layout><Dashboard /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/users" element={
                <ProtectedRoute allowedRoles={['admin', 'vice_principal']}>
                    <Layout><Users /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/users/:id" element={
                <ProtectedRoute allowedRoles={['admin', 'vice_principal']}>
                    <Layout><UserProfile /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/roles" element={
                <ProtectedRoute allowedRoles={['admin', 'vice_principal']}>
                    <Layout><Roles /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/audit" element={
                <ProtectedRoute allowedRoles={['admin', 'vice_principal', 'hod']}>
                    <Layout><Audit /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/export" element={
                <ProtectedRoute allowedRoles={['admin', 'vice_principal', 'hod']}>
                    <Layout><Export /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

// ── Root Component ────────────────────────────────────────────────────────────
// Pages like Dashboard need the user — they'll use the useAuth() hook
export default function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}
