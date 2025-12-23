import { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

function App() {
  const [projects, setProjects] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, investorSearch
  const [loading, setLoading] = useState(true);

  // Forms & Modals
  const [formData, setFormData] = useState({ name: '', description: '', targetAmount: '' });
  const [investModal, setInvestModal] = useState({ open: false, projectId: null, projectName: '' });
  const [investData, setInvestData] = useState({ investorName: '', amount: '' });

  // Edit State
  const [editProjectModal, setEditProjectModal] = useState({ open: false, project: null });
  const [editInvestmentModal, setEditInvestmentModal] = useState({ open: false, investment: null });

  // Drill-down State
  const [selectedProjectInvestments, setSelectedProjectInvestments] = useState(null); // List of investments for a project
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Search State
  const [investorSearch, setInvestorSearch] = useState('');
  const [investorResults, setInvestorResults] = useState(null);

  // --- Data Fetching ---

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/projects`);
      setProjects(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setLoading(false);
    }
  };

  const fetchProjectInvestments = async (projectId) => {
    try {
      const res = await axios.get(`${API_BASE}/investments/project/${projectId}`);
      setSelectedProjectInvestments(res.data);
      setSelectedProjectId(projectId);
    } catch (err) {
      alert("Error fetching investments: " + err.message);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // --- Project Actions ---

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.targetAmount) return;
      await axios.post(`${API_BASE}/projects`, {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount)
      });
      setFormData({ name: '', description: '', targetAmount: '' });
      fetchProjects();
    } catch (err) {
      alert("Error creating project: " + getErrorMsg(err));
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const p = editProjectModal.project;
      await axios.put(`${API_BASE}/projects/${p.id}`, {
        name: p.name,
        description: p.description,
        targetAmount: parseFloat(p.targetAmount),
        raisedAmount: p.raisedAmount // Pass existing raised amount
      });
      setEditProjectModal({ open: false, project: null });
      fetchProjects();
    } catch (err) {
      alert("Error updating project: " + getErrorMsg(err));
    }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm("Are you sure? This will delete the project and all investments.")) return;
    try {
      await axios.delete(`${API_BASE}/projects/${id}`);
      fetchProjects();
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
        setSelectedProjectInvestments(null);
      }
    } catch (err) {
      alert("Error deleting project: " + getErrorMsg(err));
    }
  };

  // --- Investment Actions ---

  const handleInvest = async (e) => {
    e.preventDefault();
    try {
      if (!investData.investorName || !investData.amount) return;
      await axios.post(`${API_BASE}/investments`, {
        projectId: investModal.projectId,
        investorName: investData.investorName,
        amount: parseFloat(investData.amount)
      });
      setInvestModal({ open: false, projectId: null, projectName: '' });
      setInvestData({ investorName: '', amount: '' });
      fetchProjects();
      // If we are viewing this project's investments, refresh them
      if (selectedProjectId === investModal.projectId) {
        fetchProjectInvestments(investModal.projectId);
      }
    } catch (err) {
      alert("Error processing investment: " + getErrorMsg(err));
    }
  };

  const handleUpdateInvestment = async (e) => {
    e.preventDefault();
    try {
      const inv = editInvestmentModal.investment;
      await axios.put(`${API_BASE}/investments/${inv.id}`, {
        projectId: inv.projectId,
        investorName: inv.investorName,
        amount: parseFloat(inv.amount)
      });
      setEditInvestmentModal({ open: false, investment: null });
      fetchProjects(); // Refresh project totals
      // Refresh investment lists
      if (selectedProjectId) fetchProjectInvestments(selectedProjectId);
      if (currentView === 'investorSearch') handleInvestorSearch(null); // Re-run search
    } catch (err) {
      alert("Error updating investment: " + getErrorMsg(err));
    }
  };

  const handleDeleteInvestment = async (id, projectId) => {
    if (!confirm("Are you sure? This will remove the investment funds from the project.")) return;
    try {
      await axios.delete(`${API_BASE}/investments/${id}`);
      fetchProjects(); // Refresh project totals
      if (selectedProjectId) fetchProjectInvestments(selectedProjectId);
      if (currentView === 'investorSearch') {
        // Remove from local list or re-search
        const updated = investorResults.filter(i => i.id !== id);
        setInvestorResults(updated);
      }
    } catch (err) {
      alert("Error deleting investment: " + getErrorMsg(err));
    }
  };

  // --- Search Actions ---

  const handleInvestorSearch = async (e) => {
    if (e) e.preventDefault();
    const term = investorSearch;
    if (!term) return;
    try {
      const res = await axios.get(`${API_BASE}/investments/investor/${term}`);
      setInvestorResults(res.data);
    } catch (err) {
      console.error(err);
      setInvestorResults([]);
    }
  };

  // Helper
  const getErrorMsg = (err) => err.response?.data?.message || err.message;

  const getProgress = (raised, target) => {
    const pct = (raised / target) * 100;
    return Math.min(pct, 100);
  };

  return (
    <div className="container">
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="title" style={{ margin: 0 }}>🚀 Crowdfundr</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Full API Test Dashboard</p>
        </div>
        <div>
          <button
            className="button"
            style={{ background: currentView === 'dashboard' ? 'var(--text-main)' : '#e5e7eb', color: currentView === 'dashboard' ? 'white' : 'black', marginRight: '1rem', width: 'auto' }}
            onClick={() => setCurrentView('dashboard')}
          >
            Projects Dashboard
          </button>
          <button
            className="button"
            style={{ background: currentView === 'investorSearch' ? 'var(--text-main)' : '#e5e7eb', color: currentView === 'investorSearch' ? 'white' : 'black', width: 'auto' }}
            onClick={() => setCurrentView('investorSearch')}
          >
            Investor Search
          </button>
        </div>
      </header>

      {/* DASHBOARD VIEW */}
      {currentView === 'dashboard' && (
        <div className="grid">
          {/* LEFT: Create Form */}
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label className="label">Project Name</label>
                <input
                  className="input"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Eco Bottle"
                />
              </div>
              <div className="form-group">
                <label className="label">Target Goal ($)</label>
                <input
                  className="input"
                  type="number"
                  value={formData.targetAmount}
                  onChange={e => setFormData({ ...formData, targetAmount: e.target.value })}
                  placeholder="5000"
                />
              </div>
              <div className="form-group">
                <label className="label">Description</label>
                <textarea
                  className="textarea"
                  rows="3"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description..."
                />
              </div>
              <button className="button" type="submit">POST /api/projects</button>
            </form>
          </div>

          {/* RIGHT: Project List */}
          <div>
            <div className="project-list">
              {loading ? <p>Loading projects...</p> : projects.map(project => (
                <div key={project.id} className="project-card">
                  <div className="proj-header">
                    <span className="proj-title">{project.name}</span>
                    <div>
                      <button
                        style={{ marginRight: '0.5rem', cursor: 'pointer', border: 'none', background: 'none', color: 'blue' }}
                        onClick={() => setEditProjectModal({ open: true, project: { ...project } })}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        style={{ cursor: 'pointer', border: 'none', background: 'none', color: 'red' }}
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        🗑️ Del
                      </button>
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {project.description}
                  </p>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${getProgress(project.raisedAmount, project.targetAmount)}%` }}
                    ></div>
                  </div>

                  <div className="stats">
                    <span>Raised: <strong>${project.raisedAmount}</strong></span>
                    <span>Goal: <strong>${project.targetAmount}</strong></span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="invest-btn"
                      onClick={() => setInvestModal({ open: true, projectId: project.id, projectName: project.name })}
                    >
                      💰 Invest
                    </button>
                    <button
                      className="invest-btn"
                      style={{ background: '#f3f4f6', borderColor: '#d1d5db', color: 'black' }}
                      onClick={() => fetchProjectInvestments(project.id)}
                    >
                      📜 View Investments
                    </button>
                  </div>

                  {/* Inline Investments List */}
                  {selectedProjectId === project.id && (
                    <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Investments for {project.name}:</h4>
                      {selectedProjectInvestments && selectedProjectInvestments.length === 0 && <small>No investments yet.</small>}
                      <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem' }}>
                        {selectedProjectInvestments && selectedProjectInvestments.map(inv => (
                          <li key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', background: '#f9fafb', padding: '0.5rem', borderRadius: '4px' }}>
                            <span><strong>{inv.investorName}</strong>: ${inv.amount}</span>
                            <div>
                              <span
                                style={{ cursor: 'pointer', marginRight: '8px' }}
                                onClick={() => setEditInvestmentModal({ open: true, investment: { ...inv } })}
                              >✏️</span>
                              <span
                                style={{ cursor: 'pointer', color: 'red' }}
                                onClick={() => handleDeleteInvestment(inv.id, project.id)}
                              >🗑️</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SEARCH VIEW */}
      {currentView === 'investorSearch' && (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2>Find Investments by Investor</h2>
          <form onSubmit={handleInvestorSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <input
              className="input"
              placeholder="Enter investor name (e.g. John Doe)"
              value={investorSearch}
              onChange={e => setInvestorSearch(e.target.value)}
            />
            <button className="button" style={{ width: '200px' }} type="submit">Search</button>
          </form>

          {investorResults && (
            <div>
              <h3>Results for "{investorSearch}"</h3>
              {investorResults.length === 0 && <p>No investments found.</p>}
              <div className="project-list" style={{ display: 'block' }}>
                {investorResults.map(inv => (
                  <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #eee' }}>
                    <div>
                      <strong>Project ID: {inv.projectId}</strong><br />
                      Amount: ${inv.amount}
                    </div>
                    <div>
                      <button
                        className="invest-btn"
                        style={{ width: 'auto', marginRight: '1rem' }}
                        onClick={() => setEditInvestmentModal({ open: true, investment: { ...inv } })}
                      >
                        Edit
                      </button>
                      <button
                        className="invest-btn"
                        style={{ width: 'auto', borderColor: 'red', color: 'red' }}
                        onClick={() => handleDeleteInvestment(inv.id, inv.projectId)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- MODALS --- */}

      {/* Invest Modal */}
      {investModal.open && (
        <div className="modal-overlay" onClick={() => setInvestModal({ open: false, projectId: null })}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1rem' }}>Invest in {investModal.projectName}</h2>
            <form onSubmit={handleInvest}>
              <div className="form-group">
                <label className="label">Your Name</label>
                <input
                  className="input"
                  value={investData.investorName}
                  onChange={e => setInvestData({ ...investData, investorName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="form-group">
                <label className="label">Amount ($)</label>
                <input
                  className="input"
                  type="number"
                  value={investData.amount}
                  onChange={e => setInvestData({ ...investData, amount: e.target.value })}
                  placeholder="100"
                />
              </div>
              <button className="button" type="submit">Confirm Investment</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editProjectModal.open && (
        <div className="modal-overlay" onClick={() => setEditProjectModal({ open: false, project: null })}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1rem' }}>Edit Project</h2>
            <form onSubmit={handleUpdateProject}>
              <div className="form-group">
                <label className="label">Project Name</label>
                <input
                  className="input"
                  value={editProjectModal.project.name}
                  onChange={e => setEditProjectModal({
                    ...editProjectModal,
                    project: { ...editProjectModal.project, name: e.target.value }
                  })}
                />
              </div>
              <div className="form-group">
                <label className="label">Target Goal ($)</label>
                <input
                  className="input"
                  type="number"
                  value={editProjectModal.project.targetAmount}
                  onChange={e => setEditProjectModal({
                    ...editProjectModal,
                    project: { ...editProjectModal.project, targetAmount: e.target.value }
                  })}
                />
              </div>
              <div className="form-group">
                <label className="label">Description</label>
                <textarea
                  className="textarea"
                  rows="3"
                  value={editProjectModal.project.description}
                  onChange={e => setEditProjectModal({
                    ...editProjectModal,
                    project: { ...editProjectModal.project, description: e.target.value }
                  })}
                />
              </div>
              <button className="button" type="submit">Update Project</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Investment Modal */}
      {editInvestmentModal.open && (
        <div className="modal-overlay" onClick={() => setEditInvestmentModal({ open: false, investment: null })}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1rem' }}>Edit Investment</h2>
            <form onSubmit={handleUpdateInvestment}>
              <div className="form-group">
                <label className="label">Investor Name</label>
                <input
                  className="input"
                  value={editInvestmentModal.investment.investorName}
                  onChange={e => setEditInvestmentModal({
                    ...editInvestmentModal,
                    investment: { ...editInvestmentModal.investment, investorName: e.target.value }
                  })}
                />
              </div>
              <div className="form-group">
                <label className="label">Amount ($)</label>
                <input
                  className="input"
                  type="number"
                  value={editInvestmentModal.investment.amount}
                  onChange={e => setEditInvestmentModal({
                    ...editInvestmentModal,
                    investment: { ...editInvestmentModal.investment, amount: e.target.value }
                  })}
                />
              </div>
              <button className="button" type="submit">Update Investment</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
