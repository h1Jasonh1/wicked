export function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-auren-muted">
      <span>{label}</span>
      <strong className="text-auren-text">{value}</strong>
    </div>
  );
}
