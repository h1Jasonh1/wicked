import type { ReactNode } from "react";

export function SectionHeading({
  children,
  eyebrow,
}: {
  children: ReactNode;
  eyebrow: string;
}) {
  return (
    <div className="section-header">
      <span className="eyebrow">{eyebrow}</span>
      {children}
    </div>
  );
}
