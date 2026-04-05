import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { UserPlus, Power, PowerOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VIEWER'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/users/${userId}/status`, { isActive: !currentStatus });
      toast.success("User status updated");
      fetchUsers();
    } catch (err) {
      toast.error("Error updating user status");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      toast.success("User created successfully");
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'VIEWER' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <div className="users-container">
      <div className="page-header justify-between d-flex align-center mb-6">
        <h1 className="page-title">User Management</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={18} className="mr-2" /> Add User
        </button>
      </div>

      <div className="card table-wrapper">
        {loading ? (
          <div className="p-8 text-center text-muted">Loading users...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td className="font-medium">{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-primary' : 'badge-success'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={`btn ${u.isActive ? 'btn-danger' : 'btn-outline'} btn-sm d-flex align-center gap-2`}
                      onClick={() => handleToggleStatus(u._id, u.isActive)}
                    >
                      {u.isActive ? <><PowerOff size={14} /> Deactivate</> : <><Power size={14} /> Activate</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header d-flex justify-between align-center mb-6">
              <h3>Create New User</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input 
                  type="text" className="input-field" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Email</label>
                <input 
                  type="email" className="input-field" required
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <input 
                  type="password" className="input-field" required
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div className="input-group mb-6">
                <label className="input-label">Role</label>
                <select 
                  className="input-field select-field"
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="VIEWER">Viewer</option>
                  <option value="ANALYST">Analyst</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="d-flex gap-4 justify-between">
                <button type="button" className="btn btn-outline" style={{flex: 1}} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
