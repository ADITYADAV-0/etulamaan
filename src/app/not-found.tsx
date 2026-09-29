import Link from "next/link";

export default function NotFound() {
  return <main className="error-page"><div className="error-card"><p className="eyebrow">404</p><h1>Page not found.</h1><p>The page you requested does not exist or has moved.</p><Link className="button button-primary" href="/">Return home</Link></div></main>;
}
