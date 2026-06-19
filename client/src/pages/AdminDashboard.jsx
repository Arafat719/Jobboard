import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

// ── helpers ───────────────────────────────────────────────────────────────────
const bearer = (token) => ({ Authorization: `Bearer ${token}` });

const TYPE_LABELS = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  remote: 'Remote',
  contract: 'Contract',
};
const TYPE_ORDER = ['full-time', 'part-time', 'remote', 'contract'];

const TYPE_CLS = {
  'full-time': 'jb-admin-badge--accent',
  'part-time': 'jb-admin-badge--orange',
  remote: 'jb-admin-badge--green',
  contract: 'jb-admin-badge--purple',
};

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ── atoms ─────────────────────────────────────────────────────────────────────
function StatCard({ label, value }) {
  return (
    <div className="jb-admin-stat">
      <span className="jb-admin-stat__value">{value ?? '—'}</span>
      <span className="jb-admin-stat__label">{label}</span>
    </div>
  );
}

function RoleBadge({ role }) {
  const cls =
    role === 'admin'
      ? 'jb-admin-badge--orange'
      : role === 'employer'
        ? 'jb-admin-badge--green'
        : 'jb-admin-badge--accent';
  return <span className={`jb-admin-badge ${cls}`}>{role}</span>;
}

function TypeBadge({ type }) {
  return <span className={`jb-admin-badge ${TYPE_CLS[type] || ''}`}>{type}</span>;
}

// ── Overview tab ──────────────────────────────────────────────────────────────
function OverviewTab({ stats, loading, error }) {
  if (loading) return <p className="jb-admin-msg">Loading…</p>;
  if (error) return <p className="jb-admin-msg jb-admin-msg--error">{error}</p>;
  if (!stats) return null;

  const { totalUsers, totalJobs, totalApplications, activeJobs, jobsByType, recentJobs } = stats;

  return (
    <div className="jb-admin-overview">
      <div className="jb-admin-stats-grid">
        <StatCard label="Total Users" value={totalUsers} />
        <StatCard label="Total Jobs" value={totalJobs} />
        <StatCard label="Applications" value={totalApplications} />
        <StatCard label="Active Jobs" value={activeJobs} />
      </div>

      <div className="jb-admin-section">
        <h2 className="jb-admin-section__title">Jobs by Type</h2>
        <div className="jb-admin-bars">
          {TYPE_ORDER.map((type) => {
            const count = jobsByType[type] || 0;
            const pct = totalJobs > 0 ? Math.round((count / totalJobs) * 100) : 0;
            return (
              <div key={type} className="jb-admin-bar-row">
                <span className="jb-admin-bar-label">{TYPE_LABELS[type]}</span>
                <div className="jb-admin-bar-track">
                  <div className={`jb-admin-bar-fill jb-admin-bar-fill--${type.replace('-', '')}`} style={{ width: `${pct || 2}%` }} />
                </div>
                <span className="jb-admin-bar-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="jb-admin-section">
        <h2 className="jb-admin-section__title">Recent Jobs</h2>
        {recentJobs.length === 0 ? (
          <p className="jb-admin-msg">No jobs yet.</p>
        ) : (
          <div className="jb-admin-recent">
            {recentJobs.map((job) => (
              <div key={job._id} className="jb-admin-recent-item">
                <div className="jb-admin-recent-info">
                  <span className="jb-admin-recent-title">{job.title}</span>
                  <span className="jb-admin-recent-company">{job.company}</span>
                </div>
                <div className="jb-admin-recent-meta">
                  <TypeBadge type={job.type} />
                  <span
                    className={`jb-admin-status ${job.isActive ? 'jb-admin-status--active' : 'jb-admin-status--paused'}`}
                  >
                    {job.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Users tab ─────────────────────────────────────────────────────────────────
function UsersTab({ users, loading, error, onDelete, confirmId, setConfirmId }) {
  if (loading) return <p className="jb-admin-msg">Loading…</p>;
  if (error) return <p className="jb-admin-msg jb-admin-msg--error">{error}</p>;
  if (!users) return null;
  if (users.length === 0) return <p className="jb-admin-msg">No users found.</p>;

  return (
    <div className="jb-admin-table-wrap">
      <table className="jb-admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td className="jb-admin-td--bold">{u.name}</td>
              <td className="jb-admin-td--muted">{u.email}</td>
              <td>
                <RoleBadge role={u.role} />
              </td>
              <td className="jb-admin-td--muted">{fmtDate(u.createdAt)}</td>
              <td>
                {confirmId === u._id ? (
                  <span className="jb-admin-confirm">
                    <span className="jb-admin-confirm-text">Delete?</span>
                    <button
                      className="jb-btn jb-admin-btn-danger jb-admin-btn-sm"
                      onClick={() => onDelete(u._id)}
                    >
                      Yes
                    </button>
                    <button
                      className="jb-btn jb-btn-outline jb-admin-btn-sm"
                      onClick={() => setConfirmId(null)}
                    >
                      No
                    </button>
                  </span>
                ) : (
                  <button
                    className="jb-btn jb-admin-btn-danger jb-admin-btn-sm"
                    onClick={() => setConfirmId(u._id)}
                    disabled={u.role === 'admin'}
                    title={u.role === 'admin' ? 'Cannot delete admin accounts' : undefined}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Jobs tab ──────────────────────────────────────────────────────────────────
function JobsTab({ jobs, loading, error, onToggle }) {
  if (loading) return <p className="jb-admin-msg">Loading…</p>;
  if (error) return <p className="jb-admin-msg jb-admin-msg--error">{error}</p>;
  if (!jobs) return null;
  if (jobs.length === 0) return <p className="jb-admin-msg">No jobs found.</p>;

  return (
    <div className="jb-admin-table-wrap">
      <table className="jb-admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Company</th>
            <th>Type</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job._id}>
              <td className="jb-admin-td--bold">{job.title}</td>
              <td className="jb-admin-td--muted">{job.company}</td>
              <td>
                <TypeBadge type={job.type} />
              </td>
              <td>
                <button
                  className={`jb-admin-toggle ${job.isActive ? 'jb-admin-toggle--active' : 'jb-admin-toggle--paused'}`}
                  onClick={() => onToggle(job._id)}
                >
                  {job.isActive ? 'Active' : 'Paused'}
                </button>
              </td>
              <td className="jb-admin-td--muted">{fmtDate(job.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const TABS = ['overview', 'users', 'jobs'];

export default function AdminDashboard() {
  const { token } = useAuth();
  const [tab, setTab] = useState('overview');

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  const [users, setUsers] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [adminJobs, setAdminJobs] = useState(null);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState('');

  const usersLoadedRef = useRef(false);
  const jobsLoadedRef = useRef(false);

  useEffect(() => {
    fetch('/api/admin/stats', { headers: bearer(token) })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) throw new Error(d.message || 'Failed to load stats');
        setStats(d);
      })
      .catch((e) => setStatsError(e.message))
      .finally(() => setStatsLoading(false));
  }, [token]);

  useEffect(() => {
    if (tab === 'users' && !usersLoadedRef.current) {
      usersLoadedRef.current = true;
      setUsersLoading(true);
      fetch('/api/admin/users', { headers: bearer(token) })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (!ok) throw new Error(d.message || 'Failed to load users');
          setUsers(d);
        })
        .catch((e) => setUsersError(e.message))
        .finally(() => setUsersLoading(false));
    }

    if (tab === 'jobs' && !jobsLoadedRef.current) {
      jobsLoadedRef.current = true;
      setJobsLoading(true);
      fetch('/api/admin/jobs', { headers: bearer(token) })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (!ok) throw new Error(d.message || 'Failed to load jobs');
          setAdminJobs(d);
        })
        .catch((e) => setJobsError(e.message))
        .finally(() => setJobsLoading(false));
    }
  }, [tab, token]);

  const handleDeleteUser = async (id) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: bearer(token),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setConfirmDeleteId(null);
      // Refresh stats count
      setStats((prev) => prev ? { ...prev, totalUsers: prev.totalUsers - 1 } : prev);
    } catch (e) {
      setUsersError(e.message);
    }
  };

  const handleToggleJob = async (id) => {
    setAdminJobs((prev) =>
      prev.map((j) => (j._id === id ? { ...j, isActive: !j.isActive } : j))
    );
    try {
      const res = await fetch(`/api/admin/jobs/${id}/toggle`, {
        method: 'PUT',
        headers: bearer(token),
      });
      if (!res.ok) {
        setAdminJobs((prev) =>
          prev.map((j) => (j._id === id ? { ...j, isActive: !j.isActive } : j))
        );
      } else {
        const updated = await res.json();
        setAdminJobs((prev) => prev.map((j) => (j._id === id ? { ...j, isActive: updated.isActive } : j)));
        setStats((prev) =>
          prev
            ? { ...prev, activeJobs: prev.activeJobs + (updated.isActive ? 1 : -1) }
            : prev
        );
      }
    } catch {
      setAdminJobs((prev) =>
        prev.map((j) => (j._id === id ? { ...j, isActive: !j.isActive } : j))
      );
    }
  };

  return (
    <div className="jb-page jb-admin-page">
      <div className="jb-container">
        <header className="jb-admin-header">
          <h1 className="jb-admin-header__title">Admin Panel</h1>
          <p className="jb-admin-header__sub">Manage users, jobs, and platform data</p>
        </header>

        <div className="jb-admin-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={`jb-admin-tab${tab === t ? ' jb-admin-tab--active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="jb-admin-content">
          {tab === 'overview' && (
            <OverviewTab stats={stats} loading={statsLoading} error={statsError} />
          )}
          {tab === 'users' && (
            <UsersTab
              users={users}
              loading={usersLoading}
              error={usersError}
              onDelete={handleDeleteUser}
              confirmId={confirmDeleteId}
              setConfirmId={setConfirmDeleteId}
            />
          )}
          {tab === 'jobs' && (
            <JobsTab
              jobs={adminJobs}
              loading={jobsLoading}
              error={jobsError}
              onToggle={handleToggleJob}
            />
          )}
        </div>
      </div>
    </div>
  );
}
