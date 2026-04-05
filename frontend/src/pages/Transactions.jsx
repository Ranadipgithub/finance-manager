import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Edit2, Trash2, Plus, X, Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  
  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions', {
        params: {
          page,
          limit: 10,
          search: debouncedSearch,
          category: categoryFilter
        }
      });
      setTransactions(res.data.data);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, debouncedSearch, categoryFilter]);

  const handleExportCSV = async () => {
    try {
      const toastId = toast.loading('Generating CSV...');
      const res = await api.get('/transactions', {
        params: {
          search: debouncedSearch,
          category: categoryFilter,
          export: 'true'
        }
      });
      
      const allData = res.data.data;
      if (!allData || allData.length === 0) {
        toast.dismiss(toastId);
        toast.error('No data to export.');
        return;
      }

      const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
      const csvRows = [headers.join(',')];
      
      allData.forEach(t => {
        const row = [
            new Date(t.date).toLocaleDateString(),
            `"${(t.description || '').replace(/"/g, '""')}"`,
            `"${t.category}"`,
            t.type,
            t.amount
        ];
        csvRows.push(row.join(','));
      });
      
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Transactions_Export_${new Date().toLocaleDateString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.dismiss(toastId);
      toast.success('CSV Exported successfully!');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const openModal = (transaction = null) => {
    if (transaction) {
      setFormData({
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description || '',
        date: new Date(transaction.date).toISOString().split('T')[0]
      });
      setEditingId(transaction._id);
    } else {
      setFormData({
        amount: '',
        type: 'EXPENSE',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/transactions/${editingId}`, formData);
      } else {
        await api.post('/transactions', formData);
      }
      const msg = editingId ? 'Transaction updated' : 'Transaction created';
      toast.success(msg);
      closeModal();
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save transaction');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await api.delete(`/transactions/${id}`);
        toast.success("Transaction deleted");
        fetchTransactions();
      } catch (err) {
        toast.error("Error deleting transaction");
      }
    }
  };

  return (
    <div className="transactions-container">
      <div className="page-header justify-between d-flex align-center mb-6">
        <h1 className="page-title">Transactions</h1>
        <div className="d-flex gap-4">
            <button className="btn btn-outline" onClick={handleExportCSV}>
              <Download size={18} className="mr-2" /> Export CSV
            </button>
            {isAdmin && (
              <button className="btn btn-primary" onClick={() => openModal()}>
                <Plus size={18} className="mr-2" /> Add 
              </button>
            )}
        </div>
      </div>

      <div className="filters-bar d-flex gap-4 mb-6">
        <div className="input-with-icon" style={{ flex: 1, position: 'relative' }}>
            <Search className="icon" size={18} style={{ position: 'absolute', left: 16, top: 12, color: '#94a3b8' }} />
            <input 
                type="text" 
                className="input-field pl-10" 
                placeholder="Search descriptions or categories..." 
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ paddingLeft: '40px' }}
            />
        </div>
        
        <select 
          className="input-field select-field" 
          value={categoryFilter}
          onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          style={{ width: '200px' }}
        >
            <option value="">All Categories</option>
            <option value="Rent">Rent</option>
            <option value="Groceries">Groceries</option>
            <option value="Salary">Salary</option>
            <option value="Utilities">Utilities</option>
            <option value="Transportation">Transportation</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Dining Out">Dining Out</option>
            <option value="Side Hustle">Side Hustle</option>
            <option value="Freelance Projects">Freelance Projects</option>
            <option value="Investments">Investments</option>
            <option value="Refunds">Refunds</option>
        </select>
      </div>

      <div className="card table-wrapper">
        {loading ? (
          <div className="p-8 text-center text-muted">Loading transactions...</div>
        ) : (
          <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? transactions.map(t => (
                <tr key={t._id}>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>{t.description || '-'}</td>
                  <td>{t.category}</td>
                  <td>
                    <span className={`badge ${t.type === 'INCOME' ? 'badge-success' : 'badge-danger'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={t.type === 'INCOME' ? 'text-success' : 'text-danger'}>
                    {t.type === 'INCOME' ? '+' : '-'}₹{t.amount.toLocaleString()}
                  </td>
                  {isAdmin && (
                    <td>
                      <div className="d-flex gap-2">
                        <button className="action-btn edit-btn" title="Edit" onClick={() => openModal(t)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="action-btn delete-btn" title="Delete" onClick={() => handleDelete(t._id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="text-center p-8 text-muted">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {transactions.length > 0 && (
             <div className="pagination-controls d-flex justify-between align-center p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-muted text-sm">Page {page} of {totalPages}</span>
                <div className="d-flex gap-2">
                    <button 
                        className="btn btn-outline" 
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                        <ChevronLeft size={16} /> Prev
                    </button>
                    <button 
                        className="btn btn-outline" 
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
             </div>
          )}
          </>
        )}
      </div>

      {/* Modal logic omitted for brevity, but retained below! */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header d-flex justify-between align-center mb-6">
              <h3>{editingId ? 'Edit Transaction' : 'Add Transaction'}</h3>
              <button className="close-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Type</label>
                <select 
                  className="input-field select-field"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Amount (₹)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  required
                  min="0"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Category</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g., Groceries, Salary, Rent"
                  required
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                />
              </div>
              
              <div className="input-group">
                <label className="input-label">Description (Optional)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="input-group mb-6">
                <label className="input-label">Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div className="d-flex gap-4 justify-between">
                <button type="button" className="btn btn-outline" style={{flex: 1}} onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
