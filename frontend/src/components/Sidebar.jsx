import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  LogOut,
  Wallet,
  UserCircle
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout, isAdmin, isAnalyst } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <Wallet className="brand-icon" size={32} />
        <h2>FinTrack</h2>
      </div>

      <div className="user-profile">
        <div className="avatar">
          <UserCircle size={28} />
        </div>
        <div className="user-info">
          <p className="user-name">{user?.name}</p>
          <span className={`badge ${isAdmin ? 'badge-primary' : 'badge-success'} role-badge`}>
            {user?.role}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        {(isAdmin || isAnalyst) && (
          <NavLink to="/transactions" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Receipt size={20} />
            <span>Transactions</span>
          </NavLink>
        )}

        {isAdmin && (
          <NavLink to="/users" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            <span>Users</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
