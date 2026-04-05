import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { IndianRupee, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState({});
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date Picker State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const [summaryRes, categoriesRes, trendsRes] = await Promise.all([
          api.get('/dashboard/summary', { params }),
          api.get('/dashboard/categories', { params }),
          api.get('/dashboard/trends', { params })
        ]);
        setSummary(summaryRes.data.data);
        setCategories(categoriesRes.data.data);
        setTrends(trendsRes.data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [startDate, endDate]);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  const categoryKeys = Object.keys(categories || {});
  
  const categoryChartData = {
    labels: categoryKeys,
    datasets: [
      {
        data: categoryKeys.map(key => categories[key]),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const trendChartData = {
    labels: trends.map(t => new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Income',
        data: trends.map(t => t.INCOME),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 4,
      },
      {
        label: 'Expense',
        data: trends.map(t => t.EXPENSE),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 4,
      }
    ]
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8' } } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
    }
  };

  return (
    <div className="dashboard-container">
      <div className="page-header justify-between d-flex align-center mb-6">
        <h1 className="page-title">Financial Overview</h1>
        
        <div className="date-filters d-flex gap-4 align-center">
            <input 
              type="date" 
              className="input-field" 
              style={{ width: '150px' }}
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              title="Start Date"
            />
            <input 
              type="date" 
              className="input-field" 
              style={{ width: '150px' }}
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              title="End Date"
            />
            <button className="btn btn-outline" style={{ height: '100%' }} onClick={() => { setStartDate(''); setEndDate(''); }}>
                Reset
            </button>
        </div>
      </div>
      
      <div className="summary-widgets">
        <div className="card widget-card">
          <div className="widget-icon primary-bg"><Wallet /></div>
          <div className="widget-info">
            <p className="widget-label">Total Balance</p>
            <h3 className="widget-value">₹{summary?.netBalance?.toLocaleString() || 0}</h3>
          </div>
        </div>
        
        <div className="card widget-card">
          <div className="widget-icon success-bg"><TrendingUp /></div>
          <div className="widget-info">
            <p className="widget-label">Total Income</p>
            <h3 className="widget-value text-success">₹{summary?.totalIncome?.toLocaleString() || 0}</h3>
          </div>
        </div>
        
        <div className="card widget-card">
          <div className="widget-icon danger-bg"><TrendingDown /></div>
          <div className="widget-info">
            <p className="widget-label">Total Expenses</p>
            <h3 className="widget-value text-danger">₹{summary?.totalExpenses?.toLocaleString() || 0}</h3>
          </div>
        </div>
      </div>

      <div className="charts-container mt-6">
        <div className="card chart-card trend-chart-container">
          <h3 className="mb-4">Income vs Expense (30 Days)</h3>
          {trends.length > 0 ? (
             <div className="bar-wrapper" style={{ height: '300px' }}>
               <Bar data={trendChartData} options={trendOptions} />
             </div>
          ) : (
            <p className="text-muted">No trend data available.</p>
          )}
        </div>

        <div className="card chart-card">
          <h3 className="mb-4">Expense by Category</h3>
          {categoryKeys.length > 0 ? (
             <div className="doughnut-wrapper">
               <Doughnut 
                 data={categoryChartData} 
                 options={{ 
                   maintainAspectRatio: false,
                   plugins: {
                     legend: { position: 'right', labels: { color: '#94a3b8' } }
                   } 
                 }} 
               />
             </div>
          ) : (
            <p className="text-muted">No category data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
