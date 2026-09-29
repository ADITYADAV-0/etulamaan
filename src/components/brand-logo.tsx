import { Scale } from "lucide-react";

type BrandLogoProps = {
  className: string;
};

export function BrandLogo({ className }: BrandLogoProps) {
  return <span className={className} aria-hidden="true"><Scale size={22} strokeWidth={2.1} /></span>;
}
