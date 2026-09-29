"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body><main className="error-page"><div className="error-card"><p className="eyebrow">System recovery</p><h1>eTulaMaan needs a refresh.</h1><p>The application encountered a temporary loading problem.</p><button className="button button-primary" onClick={() => reset()}>Refresh portal</button></div></main></body></html>;
}
