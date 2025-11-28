export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-chilli-red">ChilliPharm Dashboard</h1>
        <p className="mb-8 text-lg text-neutral-600">
          Clinical trial asset management and reporting dashboard
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="btn-primary"
          >
            Sign In
          </a>
          <a
            href="/dashboard"
            className="btn-secondary"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
