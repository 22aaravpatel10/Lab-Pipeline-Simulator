import ThroughputDashboard from "@/components/throughput-dashboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-paper px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.35em] text-terracotta">
            Throughput Architect
          </p>
          <h1 className="font-display text-4xl font-semibold text-ink">
            Lab Pipeline Simulator
          </h1>
          <p className="max-w-2xl text-base text-neutral-700">
            Deterministically parse plate workflows, simulate 156-plate
            pipelining, and visualize MOVE Function contention in seconds.
          </p>
        </header>

        <ThroughputDashboard />
      </div>
    </main>
  );
}
