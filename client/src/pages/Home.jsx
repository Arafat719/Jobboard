import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const HOW_IT_WORKS = [
  {
    step: 'Step 1',
    icon: '👤',
    title: 'Create an Account',
    desc: 'Sign up as a candidate or employer in seconds. No credit card required.',
  },
  {
    step: 'Step 2',
    icon: '🔍',
    title: 'Browse Jobs',
    desc: 'Filter by title, location, or job type to find the role that fits you best.',
  },
  {
    step: 'Step 3',
    icon: '✅',
    title: 'Apply Instantly',
    desc: 'Submit your application with a cover letter and track its status in real time.',
  },
];

const TYPE_CLASS = {
  'full-time': 'jb-badge--accent',
  remote: 'jb-badge--green',
  'part-time': 'jb-badge--orange',
  contract: 'jb-badge--purple',
};

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [jobCount, setJobCount] = useState(null);
  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/jobs?limit=1');
        if (res.ok) {
          const data = await res.json();
          setJobCount(data.total);
        }
      } catch { /* show placeholder */ }
    };

    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/jobs?limit=6');
        if (res.ok) {
          const data = await res.json();
          setFeatured(data.jobs ?? []);
        }
      } catch { /* show empty state */ } finally {
        setFeaturedLoading(false);
      }
    };

    fetchCount();
    fetchFeatured();
  }, []);

  const postJobHref =
    isAuthenticated && user?.role === 'employer' ? '/dashboard' : '/register';

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="jb-hero">
        <div className="jb-container">
          <h1 className="jb-hero__headline">
            Find Your Next<br />
            <span className="jb-hero__accent">Opportunity</span>
          </h1>
          <p className="jb-hero__sub">
            Browse hundreds of jobs from top companies. Post a job and find the right talent.
          </p>
          <div className="jb-hero__ctas">
            <Link to="/jobs" className="jb-btn jb-btn-primary jb-hero__cta-btn">
              Browse Jobs
            </Link>
            <Link to={postJobHref} className="jb-btn jb-btn-outline jb-hero__cta-btn">
              Post a Job
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────── */}
      <section className="jb-stats">
        <div className="jb-container">
          <div className="jb-stats__grid">
            <div className="jb-stat">
              <span className="jb-stat__number">
                {jobCount !== null ? `${jobCount}+` : '0'}
              </span>
              <span className="jb-stat__label">Jobs Listed</span>
            </div>
            <div className="jb-stat">
              <span className="jb-stat__number">4</span>
              <span className="jb-stat__label">Job Types</span>
            </div>
            <div className="jb-stat">
              <span className="jb-stat__number">Free</span>
              <span className="jb-stat__label">To Apply</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="jb-hiw">
        <div className="jb-container">
          <h2 className="jb-hiw__heading">How It Works</h2>
          <div className="jb-hiw__grid">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="jb-card jb-hiw__card">
                <p className="jb-hiw__step">{item.step}</p>
                <div className="jb-hiw__icon" aria-hidden="true">{item.icon}</div>
                <h3 className="jb-hiw__title">{item.title}</h3>
                <p className="jb-hiw__desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Jobs ─────────────────────────────────── */}
      <section className="jb-featured">
        <div className="jb-container">
          <div className="jb-featured__header">
            <h2 className="jb-featured__title">Featured Jobs</h2>
            <Link to="/jobs" className="jb-featured__viewall">View all jobs →</Link>
          </div>

          {featuredLoading ? (
            <div className="jb-jobs-grid">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="jb-card jb-home-skeleton-card">
                  <div className="jb-home-skeleton jb-home-skeleton--title" />
                  <div className="jb-home-skeleton jb-home-skeleton--text" />
                  <div className="jb-home-skeleton jb-home-skeleton--text jb-home-skeleton--short" />
                  <div className="jb-home-skeleton jb-home-skeleton--btn" />
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="jb-featured__empty">
              <p className="jb-featured__empty-title">No jobs listed yet</p>
              <p className="jb-text-muted jb-text-sm">
                Be the first to post an opportunity.
              </p>
              <Link to="/register" className="jb-btn jb-btn-primary jb-featured__empty-btn">
                Post a Job
              </Link>
            </div>
          ) : (
            <>
              <div className="jb-jobs-grid">
                {featured.map((job) => (
                  <div key={job._id} className="jb-card jb-job-card">
                    <div className="jb-job-card__top">
                      <div className="jb-job-card__header">
                        <h3 className="jb-job-card__title">{job.title}</h3>
                        <span className={`jb-badge ${TYPE_CLASS[job.type] ?? ''}`}>
                          {job.type}
                        </span>
                      </div>
                      <p className="jb-job-card__company">{job.company}</p>
                      <div className="jb-job-card__meta">
                        <span className="jb-job-card__location">📍 {job.location}</span>
                        {job.salary && (
                          <span className="jb-job-card__salary">💰 {job.salary}</span>
                        )}
                      </div>
                      <p className="jb-job-card__desc">{job.description}</p>
                    </div>
                    <Link
                      to={`/jobs/${job._id}`}
                      className="jb-btn jb-btn-outline jb-job-card__btn"
                    >
                      View Details →
                    </Link>
                  </div>
                ))}
              </div>
              <div className="jb-featured__footer">
                <Link to="/jobs" className="jb-btn jb-btn-primary">
                  View All Jobs
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
