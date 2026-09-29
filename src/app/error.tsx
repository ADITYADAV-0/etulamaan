"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="error-page"><div className="error-card"><p className="eyebrow">Something went wrong</p><h1>We could not load this page.</h1><p>Refresh the page or return to the eTulaMaan home screen.</p><div className="error-actions"><button className="button button-primary" onClick={() => reset()}>Try again</button><a className="button button-quiet" href="/">Go home</a></div></div></main>;
}
