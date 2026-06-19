import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../utils/api.js';
import './Dashboard.css';

// ─── Utilities ────────────────────────────────────────────────────────────────

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const bearerHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

const jsonHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

const JOB_TYPES = ['full-time', 'part-time', 'remote', 'contract'];
const COVER_LIMIT = 220;

// ─── Badges ───────────────────────────────────────────────────────────────────

const STATUS_CLASS = {
  pending: 'jb-status--pending',
  reviewed: 'jb-status--reviewed',
  hired: 'jb-status--hired',
  rejected: 'jb-status--rejected',
};

const StatusBadge = ({ status }) => (
  <span className={`jb-status-badge ${STATUS_CLASS[status] ?? ''}`}>{status}</span>
);

const TYPE_CLASS = {
  'full-time': 'jb-badge--accent',
  remote: 'jb-badge--green',
  'part-time': 'jb-badge--orange',
  contract: 'jb-badge--purple',
};

const TypeBadge = ({ type }) => (
  <span className={`jb-badge ${TYPE_CLASS[type] ?? ''}`}>{type}</span>
);

// ─── Skeleton rows ────────────────────────────────────────────────────────────

const SkeletonRows = ({ count = 3 }) => (
  <div className="jb-dash-skeletons">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="jb-card jb-dash-skeleton-card">
        <div className="jb-dash-skeleton jb-dash-skeleton--title" />
        <div className="jb-dash-skeleton jb-dash-skeleton--text" style={{ width: '40%' }} />
        <div className="jb-dash-skeleton jb-dash-skeleton--text" style={{ width: '65%' }} />
      </div>
    ))}
  </div>
);

// ─── Job Form Modal (create + edit) ──────────────────────────────────────────

const FORM_EMPTY = {
  title: '', company: '', location: '', type: 'full-time',
  salary: '', description: '', requirements: '',
};

const jobToForm = (job) => ({
  title: job.title ?? '',
  company: job.company ?? '',
  location: job.location ?? '',
  type: job.type ?? 'full-time',
  salary: job.salary ?? '',
  description: job.description ?? '',
  requirements: job.requirements ?? '',
});

const JobFormModal = ({ job, token, onClose, onSuccess }) => {
  const isEdit = Boolean(job);
  const [form, setForm] = useState(isEdit ? jobToForm(job) : { ...FORM_EMPTY });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(apiUrl(isEdit ? `/api/jobs/${job._id}` : '/api/jobs'), {
        method: isEdit ? 'PUT' : 'POST',
        headers: jsonHeaders(token),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Something went wrong. Please try again.');
        return;
      }
      onSuccess();
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="jb-modal-overlay" onClick={onClose}>
      <div
        className="jb-modal"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit job' : 'Post new job'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="jb-modal-header">
          <h2 className="jb-modal-title">{isEdit ? 'Edit Job' : 'Post New Job'}</h2>
          <button className="jb-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="jb-modal-body" noValidate>
          <div className="jb-modal-grid">
            <div className="jb-form-group">
              <label className="jb-label" htmlFor="jf-title">Job Title *</label>
              <input id="jf-title" name="title" className="jb-input" value={form.title} onChange={handleChange} required />
            </div>
            <div className="jb-form-group">
              <label className="jb-label" htmlFor="jf-company">Company *</label>
              <input id="jf-company" name="company" className="jb-input" value={form.company} onChange={handleChange} required />
            </div>
            <div className="jb-form-group">
              <label className="jb-label" htmlFor="jf-location">Location *</label>
              <input id="jf-location" name="location" className="jb-input" value={form.location} onChange={handleChange} required />
            </div>
            <div className="jb-form-group">
              <label className="jb-label" htmlFor="jf-type">Type *</label>
              <select id="jf-type" name="type" className="jb-input" value={form.type} onChange={handleChange}>
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1).replace(/-/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="jb-form-group jb-modal-grid-full">
              <label className="jb-label" htmlFor="jf-salary">Salary</label>
              <input id="jf-salary" name="salary" className="jb-input" value={form.salary} onChange={handleChange} placeholder="e.g. $80k – $100k / year" />
            </div>
          </div>

          <div className="jb-form-group">
            <label className="jb-label" htmlFor="jf-description">Description *</label>
            <textarea
              id="jf-description"
              name="description"
              className="jb-input jb-modal-textarea"
              value={form.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>
          <div className="jb-form-group">
            <label className="jb-label" htmlFor="jf-requirements">Requirements</label>
            <textarea
              id="jf-requirements"
              name="requirements"
              className="jb-input jb-modal-textarea"
              value={form.requirements}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {error && <div className="jb-dash-error" role="alert">{error}</div>}

          <div className="jb-modal-footer">
            <button type="button" className="jb-btn jb-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="jb-btn jb-btn-primary" disabled={loading}>
              {loading
                ? isEdit ? 'Saving…' : 'Posting…'
                : isEdit ? 'Save Changes' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Candidate: My Applications ───────────────────────────────────────────────

const CandidateApplications = ({ token }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(apiUrl('/api/applications/my'), { headers: bearerHeaders(token) });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) setApplications(data);
      } catch {
        if (!cancelled) setError('Failed to load your applications.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [token]);

  if (loading) return <SkeletonRows count={3} />;

  if (error) {
    return (
      <div className="jb-dash-feedback">
        <p className="jb-text-muted">{error}</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="jb-dash-feedback">
        <p className="jb-dash-empty-title">No applications yet</p>
        <p className="jb-text-muted jb-text-sm">Browse open roles and submit your first application.</p>
        <Link to="/jobs" className="jb-btn jb-btn-primary" style={{ marginTop: '0.75rem' }}>
          Browse Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="jb-dash-list">
      {applications.map((app) => (
        <div key={app._id} className="jb-card jb-app-card">
          <div className="jb-app-card__header">
            <div>
              <h3 className="jb-app-card__title">{app.job?.title ?? 'Job removed'}</h3>
              <p className="jb-app-card__company">{app.job?.company}</p>
            </div>
            <StatusBadge status={app.status} />
          </div>
          <div className="jb-app-card__meta">
            {app.job?.location && <span>📍 {app.job.location}</span>}
            {app.job?.type && <TypeBadge type={app.job.type} />}
            <span className="jb-text-muted jb-text-sm">Applied {formatDate(app.appliedAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Employer: Job Card ───────────────────────────────────────────────────────

const EmployerJobCard = ({ job: initial, token, onEdit, onDelete }) => {
  const [job, setJob] = useState(initial);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleToggleActive = async () => {
    setToggling(true);
    try {
      const res = await fetch(apiUrl(`/api/jobs/${job._id}`), {
        method: 'PUT',
        headers: jsonHeaders(token),
        body: JSON.stringify({ isActive: !job.isActive }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      // preserve applicationCount which is not in the PUT response
      setJob((prev) => ({ ...updated, applicationCount: prev.applicationCount }));
    } catch {
      // revert silently — no state update means the pill stays correct
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(apiUrl(`/api/jobs/${job._id}`), {
        method: 'DELETE',
        headers: bearerHeaders(token),
      });
      if (!res.ok) throw new Error();
      onDelete(job._id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="jb-card jb-emp-job-card">
      <div className="jb-emp-job-card__body">
        <div className="jb-emp-job-card__top">
          <div className="jb-emp-job-card__title-row">
            <h3 className="jb-emp-job-card__title">{job.title}</h3>
            <TypeBadge type={job.type} />
          </div>
          <button
            className={`jb-active-pill ${job.isActive ? 'jb-active-pill--on' : 'jb-active-pill--off'}`}
            onClick={handleToggleActive}
            disabled={toggling}
            title={job.isActive ? 'Click to pause listing' : 'Click to activate listing'}
          >
            {toggling ? '…' : job.isActive ? 'Active' : 'Paused'}
          </button>
        </div>
        <p className="jb-emp-job-card__meta">
          📍 {job.location}{job.salary ? ` · 💰 ${job.salary}` : ''}
        </p>
        <p className="jb-emp-job-card__count">
          {job.applicationCount ?? 0} application{job.applicationCount !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="jb-emp-job-card__footer">
        {confirmDelete ? (
          <div className="jb-confirm-delete">
            <span className="jb-confirm-delete__msg">Delete this job?</span>
            <button
              className="jb-btn jb-btn-danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button
              className="jb-btn jb-btn-outline"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="jb-emp-job-card__actions">
            <button className="jb-btn jb-btn-outline" onClick={() => onEdit(job)}>
              Edit
            </button>
            <button className="jb-btn jb-btn-danger" onClick={() => setConfirmDelete(true)}>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Employer: My Job Listings tab ───────────────────────────────────────────

const EmployerJobsTab = ({ jobs, loading, error, token, onRefresh, onJobsChange }) => {
  // null = closed, {} = create, { ...job } = edit
  const [modal, setModal] = useState(null);

  const handleDelete = (deletedId) => {
    onJobsChange((prev) => prev.filter((j) => j._id !== deletedId));
  };

  if (loading) return <SkeletonRows count={3} />;

  if (error) {
    return (
      <div className="jb-dash-feedback">
        <p className="jb-text-muted">{error}</p>
        <button className="jb-btn jb-btn-outline" onClick={onRefresh} style={{ marginTop: '0.75rem' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="jb-dash-tab-toolbar">
        <p className="jb-text-muted jb-text-sm">
          {jobs.length} job{jobs.length !== 1 ? 's' : ''} posted
        </p>
        <button className="jb-btn jb-btn-primary" onClick={() => setModal({})}>
          + Post New Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="jb-dash-feedback">
          <p className="jb-dash-empty-title">No jobs posted yet</p>
          <p className="jb-text-muted jb-text-sm">
            Create your first listing to start receiving applications.
          </p>
        </div>
      ) : (
        <div className="jb-emp-jobs-grid">
          {jobs.map((job) => (
            <EmployerJobCard
              key={job._id}
              job={job}
              token={token}
              onEdit={(j) => setModal(j)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modal !== null && (
        <JobFormModal
          job={Object.keys(modal).length > 0 ? modal : undefined}
          token={token}
          onClose={() => setModal(null)}
          onSuccess={() => { setModal(null); onRefresh(); }}
        />
      )}
    </>
  );
};

// ─── Employer: Application Card ───────────────────────────────────────────────

const UPDATABLE_STATUSES = ['reviewed', 'hired', 'rejected'];

const EmployerApplicationCard = ({ application: initial, token }) => {
  const [app, setApp] = useState(initial);
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setUpdating(true);
    try {
      const res = await fetch(apiUrl(`/api/applications/${app._id}/status`), {
        method: 'PUT',
        headers: jsonHeaders(token),
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      setApp((prev) => ({ ...prev, status: newStatus }));
    } catch {
      // silent — dropdown reverts because state wasn't changed
    } finally {
      setUpdating(false);
    }
  };

  const cover = app.coverLetter;
  const isLong = cover && cover.length > COVER_LIMIT;

  return (
    <div className="jb-card jb-applic-card">
      <div className="jb-applic-card__header">
        <div className="jb-applic-card__candidate">
          <p className="jb-applic-card__name">{app.candidate?.name ?? 'Unknown'}</p>
          <p className="jb-text-muted jb-text-sm">{app.candidate?.email}</p>
        </div>
        <div className="jb-applic-card__meta-right">
          <StatusBadge status={app.status} />
          <p className="jb-text-muted jb-text-sm jb-applic-card__date">
            {formatDate(app.appliedAt)}
          </p>
        </div>
      </div>

      {cover ? (
        <div className="jb-applic-card__cover">
          <p className="jb-applic-card__cover-text">
            {expanded || !isLong ? cover : `${cover.slice(0, COVER_LIMIT)}…`}
          </p>
          {isLong && (
            <button
              className="jb-applic-card__readmore"
              onClick={() => setExpanded((p) => !p)}
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      ) : (
        <p className="jb-text-muted jb-text-sm jb-applic-card__no-cover">
          No cover letter provided.
        </p>
      )}

      <div className="jb-applic-card__footer">
        <label className="jb-label jb-applic-card__status-label" htmlFor={`status-${app._id}`}>
          Update status
        </label>
        <select
          id={`status-${app._id}`}
          className="jb-input jb-applic-card__status-select"
          value={app.status}
          onChange={handleStatusChange}
          disabled={updating}
        >
          <option value="pending" disabled>pending</option>
          {UPDATABLE_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

// ─── Employer: Applications Received tab ──────────────────────────────────────

const EmployerApplicationsTab = ({ jobs, token }) => {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchApplications = useCallback(
    async (jobId) => {
      setLoading(true);
      setError('');
      setApplications([]);
      try {
        const res = await fetch(apiUrl(`/api/applications/job/${jobId}`), {
          headers: bearerHeaders(token),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setApplications(data);
      } catch {
        setError('Failed to load applications for this job.');
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const handleJobSelect = (e) => {
    const jobId = e.target.value;
    setSelectedJobId(jobId);
    if (jobId) fetchApplications(jobId);
    else setApplications([]);
  };

  if (jobs.length === 0) {
    return (
      <div className="jb-dash-feedback">
        <p className="jb-dash-empty-title">No jobs posted yet</p>
        <p className="jb-text-muted jb-text-sm">Post a job first to start receiving applications.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="jb-dash-tab-toolbar">
        <select
          className="jb-input jb-applic-job-select"
          value={selectedJobId}
          onChange={handleJobSelect}
          aria-label="Select job listing"
        >
          <option value="">Select a job listing…</option>
          {jobs.map((j) => (
            <option key={j._id} value={j._id}>
              {j.title} · {j.applicationCount ?? 0} application
              {j.applicationCount !== 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </div>

      {!selectedJobId && (
        <div className="jb-dash-feedback">
          <p className="jb-text-muted">Choose a listing above to view its applicants.</p>
        </div>
      )}

      {selectedJobId && loading && <SkeletonRows count={3} />}

      {selectedJobId && !loading && error && (
        <div className="jb-dash-feedback">
          <p className="jb-text-muted">{error}</p>
        </div>
      )}

      {selectedJobId && !loading && !error && applications.length === 0 && (
        <div className="jb-dash-feedback">
          <p className="jb-dash-empty-title">No applications yet</p>
          <p className="jb-text-muted jb-text-sm">No one has applied to this listing yet.</p>
        </div>
      )}

      {!loading && applications.length > 0 && (
        <div className="jb-dash-list">
          {applications.map((app) => (
            <EmployerApplicationCard key={app._id} application={app} token={token} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Employer root (shared job fetch) ────────────────────────────────────────

const EmployerDashboard = ({ token }) => {
  const [activeTab, setActiveTab] = useState('listings');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(apiUrl('/api/jobs/my'), { headers: bearerHeaders(token) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setJobs(data);
    } catch {
      setError('Failed to load your job listings.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return (
    <>
      <div className="jb-dash-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'listings'}
          className={`jb-dash-tab ${activeTab === 'listings' ? 'jb-dash-tab--active' : ''}`}
          onClick={() => setActiveTab('listings')}
        >
          My Job Listings
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'received'}
          className={`jb-dash-tab ${activeTab === 'received' ? 'jb-dash-tab--active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          Applications Received
        </button>
      </div>

      <div className="jb-dash-content">
        {activeTab === 'listings' && (
          <EmployerJobsTab
            jobs={jobs}
            loading={loading}
            error={error}
            token={token}
            onRefresh={fetchJobs}
            onJobsChange={setJobs}
          />
        )}
        {activeTab === 'received' && (
          <EmployerApplicationsTab jobs={jobs} token={token} />
        )}
      </div>
    </>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const ROLE_LABEL = { candidate: 'Candidate', employer: 'Employer', admin: 'Admin' };
const ROLE_BADGE_CLASS = {
  candidate: 'jb-role-badge--candidate',
  employer: 'jb-role-badge--employer',
  admin: 'jb-role-badge--admin',
};

const Dashboard = () => {
  const { user, token } = useAuth();

  return (
    <main className="jb-page">
      <div className="jb-container">
        <div className="jb-dash-header">
          <div>
            <h1 className="jb-dash-heading">Welcome back, {user?.name ?? 'User'}</h1>
            <span className={`jb-role-badge ${ROLE_BADGE_CLASS[user?.role] ?? ''}`}>
              {ROLE_LABEL[user?.role] ?? user?.role}
            </span>
          </div>
        </div>

        {user?.role === 'candidate' && (
          <>
            <div className="jb-dash-tabs" role="tablist">
              <button role="tab" aria-selected="true" className="jb-dash-tab jb-dash-tab--active">
                My Applications
              </button>
            </div>
            <div className="jb-dash-content">
              <CandidateApplications token={token} />
            </div>
          </>
        )}

        {(user?.role === 'employer' || user?.role === 'admin') && (
          <EmployerDashboard token={token} />
        )}
      </div>
    </main>
  );
};

export default Dashboard;
