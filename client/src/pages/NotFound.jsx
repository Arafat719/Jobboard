import { Link } from 'react-router-dom';

const NotFound = () => (
  <main
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 3.5rem)',
      textAlign: 'center',
      padding: '2rem 1.5rem',
    }}
  >
    <p
      style={{
        fontSize: '6rem',
        fontWeight: 800,
        color: 'var(--jb-border)',
        lineHeight: 1,
        marginBottom: '0.5rem',
        letterSpacing: '-0.04em',
      }}
    >
      404
    </p>
    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.625rem' }}>Page not found</h1>
    <p
      className="jb-text-muted"
      style={{ maxWidth: '360px', marginBottom: '1.75rem', lineHeight: 1.6 }}
    >
      The page you&apos;re looking for doesn&apos;t exist or has been moved.
    </p>
    <Link to="/" className="jb-btn jb-btn-primary">
      ← Back to Home
    </Link>
  </main>
);

export default NotFound;
