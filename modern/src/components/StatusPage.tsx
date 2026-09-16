type StatusPageProps = {
  title: string;
  description: string;
  apiOrigin: string | null;
};

export function StatusPage({ title, description, apiOrigin }: StatusPageProps) {
  return (
    <section className="status-page" aria-labelledby="status-title">
      <p className="eyebrow">Foundation B1 · 2026</p>
      <h1 id="status-title">{title}</h1>
      <p>{description}</p>
      <dl className="runtime-status">
        <div>
          <dt>Frontend</dt>
          <dd>React + Vite + TypeScript</dd>
        </div>
        <div>
          <dt>API</dt>
          <dd>{apiOrigin ?? "No configurada todavía"}</dd>
        </div>
      </dl>
    </section>
  );
}
