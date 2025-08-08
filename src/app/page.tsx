import clsx from "clsx";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[22px] font-semibold text-[color:var(--color-heading)] mb-4">
      {children}
    </h2>
  );
}

export default function Home() {
  const progress = 0.34; // placeholder, will be dynamic

  const dialStates: Array<"empty" | "partial" | "full"> = [
    "partial",
    "empty",
    "partial",
    "empty",
    "full",
    "full",
    "empty",
    "full",
    "partial",
    "empty",
    "empty",
    "empty",
    "empty",
    "empty",
    "empty",
    "empty",
    "partial",
    "full",
  ];

  const labels = [
    "A1",
    "A2",
    "A3",
    "A4",
    "A5",
    "B1",
    "B2",
    "B3",
    "B4",
    "B5",
    "B6",
    "B7",
    "C1",
    "C2",
    "C3",
    "D1",
    "D2",
    "D3",
  ];

  return (
    <div className="max-w-[1160px]">
      <h1 className={clsx("display-title", "text-[72px] font-extrabold mb-10")}>DASHBOARD</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left column */}
        <div className="space-y-12">
          <div>
            <SectionTitle>QWE Progress Bar</SectionTitle>
            <div className="pill-track h-[64px] w-full max-w-[520px] flex items-center p-2">
              <div
                className="pill-fill h-full"
                style={{ width: `${Math.max(6, progress * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <SectionTitle>Total Placements</SectionTitle>
            <div className="card p-6 flex items-center gap-8">
              <div className="w-40 h-24 rounded-b-full bg-[color:var(--color-heading)] relative overflow-hidden">
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-20 bg-[color:var(--progress-red)] rotate-[-40deg] rounded-full" />
              </div>
              <div className="text-lg text-[color:var(--color-heading)] font-semibold">
                3 out of a maximum 4
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          <SectionTitle>Competency Dials</SectionTitle>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-8 w-full max-w-[420px]">
            {dialStates.map((state, idx) => (
              <div key={idx} className="flex items-center justify-center flex-col gap-2">
                <div
                  className={clsx(
                    "dial-ring w-16 h-16",
                    state === "empty" && "dial-empty",
                    state === "partial" && "dial-partial",
                    state === "full" && "dial-full"
                  )}
                />
                <span className="text-sm font-semibold text-[color:var(--color-heading)]">
                  {labels[idx]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
