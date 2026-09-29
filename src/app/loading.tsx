import { BrandLogo } from "@/components/brand-logo";

export default function Loading() {
  return <main className="loading-page" aria-label="Loading"><BrandLogo className="loading-mark" /><div className="loading-line" /><p>Loading eTulaMaan</p></main>;
}
