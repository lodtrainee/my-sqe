export default function ReflectionsPage() {
  return (
    <div className="max-w-[1160px]">
      <h1 className="display-title text-[72px] font-extrabold mb-10">JOURNAL REFLECTIONS</h1>

      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-6">
            <div className="text-xs text-slate-500 mb-2">Logged on: 08 Aug 2025</div>
            <div className="font-semibold text-[color:var(--color-heading)] mb-3">
              {i === 1 ? "C1, C2, C3" : i === 2 ? "A1, A2, B1, B4, B5, B6" : "D1, D2, D3"}
            </div>
            <div className="bg-[color:var(--muted)] rounded-md p-4 text-sm mb-3">
              What experience have I had to demonstrate this competency and what did I do to achieve it?
            </div>
            <div className="bg-[color:var(--muted)] rounded-md p-4 text-sm">What did I learn?</div>
          </div>
        ))}
      </div>
    </div>
  );
}


