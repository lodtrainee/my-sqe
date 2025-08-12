"use client";

import { useEffect, useMemo, useState } from "react";
import { addReflection, addPeriod, load, deleteReflection } from "@/lib/store";
import { LOD_DEFAULTS, HIGH_TO_LOW, HighLevelArea, LowLevelCompetency } from "@/lib/types";

export default function PeriodsPage() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(load());
  const [expanded, setExpanded] = useState<string | null>(null);

  // ensure we load from browser only after mount to avoid hydration mismatch
  useEffect(() => {
    const d = load();
    setData(d);
    setExpanded(d.periods[0]?.id ?? null);
    setMounted(true);
  }, []);

  function refresh() {
    setData(load());
  }

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    companySraNumber: "",
    jobTitle: "",
    startDate: "",
    endDate: "",
    assignmentType: "Standard" as const,
    fullName: "",
    sraNumber: "",
    email: "",
  });

  function toggleAdd() {
    setAdding((v) => !v);
  }

  function saveNewPeriod() {
    if (!form.companyName || !form.startDate || !form.endDate || !form.jobTitle) return;
    addPeriod(data, {
      companyName: form.companyName,
      companySraNumber: form.companySraNumber || undefined,
      jobTitle: form.jobTitle,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      assignmentType: form.assignmentType,
      confirmingSolicitor: {
        fullName: form.fullName,
        sraNumber: form.sraNumber,
        email: form.email,
      },
    });
    setAdding(false);
    setForm({ companyName:"", companySraNumber:"", jobTitle:"", startDate:"", endDate:"", assignmentType:"Standard", fullName:"", sraNumber:"", email:"" });
    refresh();
  }

  function handleAddReflection(periodId: string) {
    addReflection(data, periodId, {
      loggedOn: new Date().toISOString(),
      highLevelAreas: ["A"],
      lowLevelCompetencies: ["A1", "A2"],
      activity: "Demo activity",
      learning: "Demo learning",
    });
    refresh();
  }

  return (
    <div className="max-w-[1160px]">
      <h1 className="display-title text-[72px] font-extrabold mb-10">QWE PERIODS</h1>
      <div className="mb-4">
        <button className="btn btn-primary clickable" onClick={toggleAdd}>{adding ? "Cancel" : "+ Add Period"}</button>
      </div>

      {adding && (
        <div className="card p-6 mb-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <input className="border rounded p-2" placeholder="Company name" value={form.companyName} onChange={(e)=>setForm({...form, companyName:e.target.value})} />
            <input className="border rounded p-2" placeholder="Job title" value={form.jobTitle} onChange={(e)=>setForm({...form, jobTitle:e.target.value})} />
            <input type="date" className="border rounded p-2" value={form.startDate} onChange={(e)=>setForm({...form, startDate:e.target.value})} />
            <input type="date" className="border rounded p-2" value={form.endDate} onChange={(e)=>setForm({...form, endDate:e.target.value})} />
            <select className="border rounded p-2" value={form.assignmentType} onChange={(e)=>setForm({...form, assignmentType:e.target.value as any})}>
              <option value="Standard">Not through LOD</option>
              <option value="LOD">Through LOD</option>
            </select>
            <input className="border rounded p-2" placeholder="Company SRA number (optional)" value={form.companySraNumber} onChange={(e)=>setForm({...form, companySraNumber:e.target.value})} />
            <input className="border rounded p-2" placeholder="Confirming solicitor name" value={form.fullName} onChange={(e)=>setForm({...form, fullName:e.target.value})} />
            <input className="border rounded p-2" placeholder="Confirming solicitor SRA (6 digits)" value={form.sraNumber} onChange={(e)=>setForm({...form, sraNumber:e.target.value})} />
            <input className="border rounded p-2" placeholder="Confirming solicitor email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} />
          </div>
          <button className="btn btn-primary mt-4 clickable" onClick={saveNewPeriod}>Save Period</button>
        </div>
      )}

      <div className="space-y-6">
        {data.periods.map((p) => (
          <div key={p.id} className="card">
            <button className="w-full text-left p-6 flex items-center justify-between" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[color:var(--brand-teal)]" />
                <div>
                  <div className="font-semibold text-[color:var(--color-heading)]">{p.companyName}</div>
                  <div className="text-sm text-slate-500">{p.jobTitle}</div>
                </div>
              </div>
              <div className="text-sm text-slate-600">
                {formatDate(p.startDate)} - {formatDate(p.endDate)}
              </div>
            </button>

            {expanded === p.id && (
              <div className="p-6 pt-0">
                <div className="grid sm:grid-cols-2 gap-2 mt-2 text-sm">
                  <div><span className="font-semibold">Company SRA No:</span> {p.companySraNumber ?? "-"}</div>
                  <div><span className="font-semibold">Assignment Type:</span> {p.assignmentType === "LOD" ? "Through LOD" : "Not through LOD"}</div>
                  <div><span className="font-semibold">Confirming Solicitor:</span> {p.confirmingSolicitor.fullName}</div>
                  <div><span className="font-semibold">Solicitor SRA No:</span> {p.confirmingSolicitor.sraNumber}</div>
                </div>

                <div className="flex flex-wrap gap-3 mt-6">
                  <button className="btn btn-primary clickable" onClick={() => handleAddReflection(p.id)}>Add Reflection</button>
                  <button className="btn btn-black clickable">Generate Sign-off Email</button>
                </div>

                <div className="mt-6">
                  <div className="font-semibold mb-3">Reflections ({p.reflections.length})</div>
                  {p.reflections.map((r) => (
                    <div key={r.id} className="card p-4 mb-4">
                      <div className="font-semibold text-[color:var(--color-heading)]">{r.lowLevelCompetencies.join(", ")}</div>
                      <div className="text-xs text-slate-500 mb-2">Logged on: {formatDate(r.loggedOn)}</div>
                      <div className="bg-[color:var(--muted)] rounded-md p-3 text-sm mb-3">{r.activity}</div>
                      <div className="bg-[color:var(--muted)] rounded-md p-3 text-sm mb-3">{r.learning}</div>
                      <button className="btn btn-outline clickable" onClick={() => { deleteReflection(data, p.id, r.id); refresh(); }}>Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}


