import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './JobDetail.css';

const TYPE_BADGE_CLASS = {
  'full-time': 'jb-badge--accent',
  'remote': 'jb-badge--green',
  'part-time': 'jb-badge--orange',
  'contract': 'jb-badge--purple',
};

/* ─── Apply sidebar section ─── */
const ApplySection = ({ jobId, token, isAuthenticated, userRole, navigate }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [duplicate, setDuplicate] = useState(false);

  if (!isAuthenticated) {
    return (
      <button
        className="jb-btn jb-btn-primary jb-detail-apply-btn"
        onClick={() => navigate('/login')}
      >
        Sign in to Apply
      </button>
    );
  }

  if (userRole !== 'candidate') {
    return (
      <p className="jb-detail-apply-note">Only candidates can apply for jobs.</p>
    );
  }

  if (success) {
    return (
      <div className="jb-detail-apply-success" role="status">
        ✓ Application submitted successfully!
      </div>
    );
  }

  if (duplicate) {
    return (
      <div className="jb-detail-apply-duplicate" role="status">
        You have already applied for this job.
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId, coverLetter }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setDuplicate(true);
        return;
      }

      if (!res.ok) {
        setError(data.message || 'Application failed. Please try again.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="jb-detail-apply-form">
      <label className="jb-label" htmlFor="coverLetter">
        Cover Letter <span className="jb-text-muted">(optional)</span>
      </label>
      <textarea
        id="coverLetter"
        className="jb-input jb-detail-textarea"
        value={coverLetter}
        onChange={(e) => setCoverLetter(e.target.value)}
        placeholder="Tell the employer why you're a great fit…"
        rows={5}
      />
      {error && (
        <div className="jb-detail-error" role="alert">
          {error}
        </div>
      )}
      <button
        type="submit"
        className="jb-btn jb-btn-primary jb-detail-apply-btn"
        disabled={loading}
      >
        {loading ? 'Submitting…' : 'Submit Application'}
      </button>
    </form>
  );
};

/* ─── Loading skeleton ─── */
const DetailSkeleton = () => (
  <main className="jb-page">
    <div className="jb-container">
      <div className="jb-detail-back-placeholder jb-skeleton jb-skeleton--back" />
      <div className="jb-detail-layout">
        <div className="jb-card">
          <div className="jb-skeleton jb-skeleton--title jb-skeleton--xl" />
          <div className="jb-skeleton jb-skeleton--text" style={{ marginTop: '0.75rem' }} />
          <div className="jb-skeleton jb-skeleton--text jb-skeleton--short" />
          <div className="jb-skeleton jb-skeleton--text" style={{ marginTop: '1.5rem' }} />
          <div className="jb-skeleton jb-skeleton--text" />
          <div className="jb-skeleton jb-skeleton--text jb-skeleton--short" />
        </div>
        <div className="jb-card">
          <div className="jb-skeleton jb-skeleton--text" />
          <div className="jb-skeleton jb-skeleton--text jb-skeleton--short" style={{ marginTop: '0.5rem' }} />
          <div className="jb-skeleton jb-skeleton--btn" style={{ marginTop: '1.5rem' }} />
        </div>
      </div>
    </div>
  </main>
);

/* ─── Main component ─── */
const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchJob = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const res = await fetch(`/api/jobs/${id}`);
        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch job');
        const data = await res.json();
        if (!cancelled) setJob(data);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchJob();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <DetailSkeleton />;

  if (notFound || !job) {
    return (
      <main className="jb-page">
        <div className="jb-container jb-detail-not-found">
          <h2>Job not found</h2>
          <p className="jb-text-muted">
            This listing may have been removed or the link is incorrect.
          </p>
          <Link to="/jobs" className="jb-btn jb-btn-primary" style={{ marginTop: '1.25rem' }}>
            ← Back to Jobs
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="jb-page">
      <div className="jb-container">
        <Link to="/jobs" className="jb-detail-back">← Back to Jobs</Link>

        <div className="jb-detail-layout">
          {/* ── Main content ── */}
          <div className="jb-detail-main">
            <div className="jb-card">
              <div className="jb-detail-header">
                <h1 className="jb-detail-title">{job.title}</h1>
                <span className={`jb-badge ${TYPE_BADGE_CLASS[job.type] ?? ''}`}>
                  {job.type}
                </span>
              </div>

              <div className="jb-detail-meta">
                <span className="jb-detail-meta-item">{job.company}</span>
                <span className="jb-detail-meta-sep" aria-hidden="true">·</span>
                <span className="jb-detail-meta-item">📍 {job.location}</span>
                {job.salary && (
                  <>
                    <span className="jb-detail-meta-sep" aria-hidden="true">·</span>
                    <span className="jb-detail-meta-item">💰 {job.salary}</span>
                  </>
                )}
              </div>

              <hr className="jb-divider" />

              <h2 className="jb-detail-section-title">Description</h2>
              <p className="jb-detail-body">{job.description}</p>

              {job.requirements && (
                <>
                  <h2 className="jb-detail-section-title jb-detail-section-title--spaced">
                    Requirements
                  </h2>
                  <p className="jb-detail-body">{job.requirements}</p>
                </>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="jb-detail-sidebar">
            <div className="jb-card jb-detail-sidebar-card">
              <h3 className="jb-detail-section-title">About the Employer</h3>
              {job.employer ? (
                <div className="jb-detail-employer">
                  <p className="jb-detail-employer-name">{job.employer.name}</p>
                  <p className="jb-text-muted jb-text-sm">{job.employer.email}</p>
                </div>
              ) : (
                <p className="jb-text-muted jb-text-sm">Company details not available.</p>
              )}

              <hr className="jb-divider" />

              <h3 className="jb-detail-section-title">Apply for this Role</h3>
              <ApplySection
                jobId={id}
                token={token}
                isAuthenticated={isAuthenticated}
                userRole={user?.role}
                navigate={navigate}
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default JobDetail;
