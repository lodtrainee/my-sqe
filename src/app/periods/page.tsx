export default function PeriodsPage() {
  return (
    <div className="max-w-[1160px]">
      <h1 className="display-title text-[72px] font-extrabold mb-10">QWE PERIODS</h1>

      <div className="space-y-6">
        {/* Collapsed card example */}
        <div className="card p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-[color:var(--progress-red)]" />
            <div>
              <div className="font-semibold text-[color:var(--color-heading)]">Deliveroo</div>
              <div className="text-sm text-slate-500">Paralegal</div>
            </div>
          </div>
          <div className="text-sm text-slate-600">02 Jun 2022 - 01 Apr 2025</div>
        </div>

        {/* Expanded card example */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[color:var(--brand-teal)]" />
              <div>
                <div className="font-semibold text-[color:var(--color-heading)]">HSBC</div>
                <div className="text-sm text-slate-500">Paralegal</div>
              </div>
            </div>
            <div className="text-sm text-slate-600">01 Jul 2025 - 08 Aug 2025</div>
          </div>

          <div className="grid sm:grid-cols-2 gap-2 mt-6 text-sm">
            <div><span className="font-semibold">Company SRA No:</span> 345678</div>
            <div><span className="font-semibold">Assignment Type:</span> Not through LOD</div>
            <div><span className="font-semibold">Confirming Solicitor:</span> Joe Bloggs</div>
            <div><span className="font-semibold">Solicitor SRA No:</span> 123456</div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button className="px-4 py-2 rounded-full border border-[color:var(--progress-red)] text-[color:var(--progress-red)]">Edit Period</button>
            <button className="px-4 py-2 rounded-full bg-[color:var(--progress-red)] text-white">Add Reflection</button>
            <button className="px-4 py-2 rounded-full bg-black text-white">Generate Sign-off Email</button>
            <button className="px-4 py-2 rounded-full border border-[color:var(--progress-red)] text-[color:var(--progress-red)]">Delete Period</button>
          </div>

          <div className="mt-6">
            <div className="font-semibold mb-3">Reflections (1)</div>
            <div className="card p-4">
              <div className="font-semibold text-[color:var(--color-heading)]">A1, A2, B3, C1, C3</div>
              <div className="text-xs text-slate-500 mb-2">Logged on: 08 Aug 2025</div>
              <div className="bg-[color:var(--muted)] rounded-md p-3 text-sm mb-3">What experience have I had to demonstrate this competency and what did I do to achieve it?</div>
              <div className="bg-[color:var(--muted)] rounded-md p-3 text-sm">What did I learn?</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


