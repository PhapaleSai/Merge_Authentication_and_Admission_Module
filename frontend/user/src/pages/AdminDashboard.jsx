import React, { useState, useEffect } from 'react';
import api from '../api';
import TiltCard from '../components/TiltCard';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, usersRes, rolesRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/users'),
          api.get('/roles')
        ]);

        if (meRes.data.role !== 'admin') {
          navigate('/welcome');
          return;
        }

        setCurrentUser(meRes.data);
        setUsers(usersRes.data);
        setRoles(rolesRes.data);
      } catch (err) {
        setError('Failed to fetch data. Are you an admin?');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.post('/roles/assign', { user_id: userId, role: newRole });
      // Refresh user list
      const usersRes = await api.get('/users');
      setUsers(usersRes.data);
    } catch (err) {
      alert('Failed to update role');
    }
  };

  if (loading) return <div className="loading-screen"><span className="spinner" /></div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', margin: 0, background: 'linear-gradient(90deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Admin Control Center
          </h1>
          <p style={{ color: '#888', marginTop: '0.5rem' }}>Management & RBAC Capabilities</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-logout" onClick={() => navigate('/welcome')} style={{ background: '#333' }}>Back to Home</button>
          <button className="btn-logout" onClick={() => {
              const token = localStorage.getItem('token');
              window.location.href = `http://localhost:5174/admin/dashboard?token=${token}`;
          }} style={{ background: '#4a9eff', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Launch Admission Admin <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </header>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <TiltCard style={{ padding: '1.5rem', background: 'rgba(20, 20, 20, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>User Directory</h2>
          <div className="user-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {users.map(user => (
              <div key={user.user_id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{user.username}</div>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>{user.email}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`badge ${user.role === 'admin' ? 'danger' : 'success'}`} style={{ fontSize: '0.7rem' }}>
                    {user.role}
                  </span>
                  <select 
                    value={user.role} 
                    onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                    style={{ background: '#222', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.8rem' }}
                  >
                    {roles.map(r => (
                      <option key={r.role_id} value={r.role_name}>{r.role_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </TiltCard>

        <TiltCard style={{ padding: '1.5rem', background: 'rgba(20, 20, 20, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Role Status</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {roles.map(role => (
              <div key={role.role_id} className="role-stat-card" style={{ padding: '1rem', borderLeft: '4px solid #4a9eff', background: 'rgba(74, 158, 255, 0.05)' }}>
                <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{role.role_name}</div>
                <div style={{ fontSize: '0.8rem', color: '#bbb' }}>{role.description || 'No description provided'}</div>
              </div>
            ))}
          </div>
        </TiltCard>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-grid { animation: fadeIn 1s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        select:focus { outline: none; box-shadow: 0 0 5px rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
};

export default AdminDashboard;
