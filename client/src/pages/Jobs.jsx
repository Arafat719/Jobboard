import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Jobs.css';

const JOB_TYPES = ['full-time', 'part-time', 'remote', 'contract'];
const LIMIT = 9;

const TYPE_BADGE_CLASS = {
  'full-time': 'jb-badge--accent',
  'remote': 'jb-badge--green',
  'part-time': 'jb-badge--orange',
  'contract': 'jb-badge--purple',
};

const JobCard = ({ job, onView }) => (
  <div className="jb-card jb-job-card">
    <div className="jb-job-card__top">
      <div className="jb-job-card__header">
        <h3 className="jb-job-card__title">{job.title}</h3>
        <span className={`jb-badge ${TYPE_BADGE_CLASS[job.type] ?? ''}`}>{job.type}</span>
      </div>
      <p className="jb-job-card__company">{job.company}</p>
      <div className="jb-job-card__meta">
        <span className="jb-job-card__location">📍 {job.location}</span>
        {job.salary && <span className="jb-job-card__salary">💰 {job.salary}</span>}
      </div>
      <p className="jb-job-card__desc">{job.description}</p>
    </div>
    <button className="jb-btn jb-btn-outline jb-job-card__btn" onClick={onView}>
      View Details →
    </button>
  </div>
);

const SkeletonCard = () => (
  <div className="jb-card jb-job-card jb-job-card--skeleton">
    <div className="jb-skeleton jb-skeleton--title" />
    <div className="jb-skeleton jb-skeleton--text" />
    <div className="jb-skeleton jb-skeleton--text jb-skeleton--short" />
    <div className="jb-skeleton jb-skeleton--text" />
    <div className="jb-skeleton jb-skeleton--text jb-skeleton--short" />
    <div className="jb-skeleton jb-skeleton--btn" />
  </div>
);

const Jobs = () => {
  const navigate = useNavigate();

  // Inputs track what's typed; filters track what's applied to the API
  const [inputs, setInputs] = useState({ search: '', location: '', type: '' });
  const [filters, setFilters] = useState({ search: '', location: '', type: '' });
  const [page, setPage] = useState(1);

  const [jobs, setJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setFetchError('');

    const params = new URLSearchParams({ page, limit: LIMIT });
    if (filters.search) params.set('search', filters.search);
    if (filters.location) params.set('location', filters.location);
    if (filters.type) params.set('type', filters.type);

    try {
      const res = await fetch(`/api/jobs?${params}`);
      if (!res.ok) throw new Error('Failed to load jobs');
      const data = await res.json();
      setJobs(data.jobs);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch {
      setFetchError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const applyFilters = () => {
    setFilters({ ...inputs });
    setPage(1);
  };

  const clearFilters = () => {
    const empty = { search: '', location: '', type: '' };
    setInputs(empty);
    setFilters(empty);
    setPage(1);
  };

  const handleInputChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') applyFilters();
  };

  const hasActiveFilters = filters.search || filters.location || filters.type;

  return (
    <main className="jb-page">
      <div className="jb-container">
        <h1 className="jb-jobs-heading">Browse Jobs</h1>

        {/* Filter bar */}
        <div className="jb-jobs-filters">
          <input
            name="search"
            type="text"
            placeholder="Search title or company…"
            className="jb-input jb-jobs-filter-search"
            value={inputs.search}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            aria-label="Search jobs"
          />
          <input
            name="location"
            type="text"
            placeholder="Location…"
            className="jb-input jb-jobs-filter-location"
            value={inputs.location}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            aria-label="Filter by location"
          />
          <select
            name="type"
            className="jb-input jb-jobs-filter-type"
            value={inputs.type}
            onChange={handleInputChange}
            aria-label="Filter by job type"
          >
            <option value="">All types</option>
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
          <button className="jb-btn jb-btn-primary" onClick={applyFilters}>
            Search
          </button>
        </div>

        {/* Results area */}
        {loading ? (
          <div className="jb-jobs-grid">
            {Array.from({ length: 3 }, (_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : fetchError ? (
          <div className="jb-jobs-feedback">
            <p className="jb-text-muted">{fetchError}</p>
            <button className="jb-btn jb-btn-outline" onClick={fetchJobs}>
              Retry
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="jb-jobs-feedback">
            <p className="jb-jobs-empty-title">No jobs found</p>
            <p className="jb-text-muted jb-text-sm">
              {hasActiveFilters
                ? 'Try adjusting your filters or search terms.'
                : 'Check back soon — new jobs are posted regularly.'}
            </p>
            {hasActiveFilters && (
              <button className="jb-btn jb-btn-outline" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="jb-jobs-count">
              {total} job{total !== 1 ? 's' : ''} found
              {hasActiveFilters && (
                <button className="jb-jobs-clear-link" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </p>
            <div className="jb-jobs-grid">
              {jobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onView={() => navigate(`/jobs/${job._id}`)}
                />
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && !fetchError && totalPages > 1 && (
          <div className="jb-jobs-pagination">
            <button
              className="jb-btn jb-btn-outline"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              ← Prev
            </button>
            <span className="jb-jobs-page-info">
              Page {page} of {totalPages}
            </span>
            <button
              className="jb-btn jb-btn-outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Jobs;
