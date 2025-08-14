"use client";

import { useEffect, useState } from "react";
import { addReflection, addPeriod, updateReflection, load, deleteReflection, deletePeriod, AppData, placementsCount } from "@/lib/store";
import { HighLevelArea, LowLevelCompetency, HIGH_TO_LOW, COMPETENCY_DESCRIPTIONS, LOW_LEVEL_DESCRIPTIONS } from "@/lib/types";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[24px] font-bold text-[color:var(--color-heading)] mb-6 tracking-tight">{children}</h2>
  );
}

export default function PeriodsPage() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<AppData>(() => ({ periods: [] }));
  const [expanded, setExpanded] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [addingReflection, setAddingReflection] = useState<string | null>(null);
  const [editingReflection, setEditingReflection] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [expandedReflections, setExpandedReflections] = useState<Set<string>>(new Set());
  const [expandedFields, setExpandedFields] = useState<Map<string, Set<string>>>(new Map());
  const [reflectionForm, setReflectionForm] = useState({
    highLevelAreas: [] as HighLevelArea[],
    lowLevelCompetencies: [] as LowLevelCompetency[],
    selectedLowLevelCompetencies: [] as LowLevelCompetency[],
    projectName: "",
    activity: "",
    outcome: "",
    learning: "",
  });
  const [form, setForm] = useState({
    companyName: "",
    companySraNumber: "",
    jobTitle: "",
    startDate: "",
    endDate: "",
    assignmentType: "" as any,
    fullName: "",
    sraNumber: "",
    email: "",
  });

  useEffect(() => {
    const d = load();
    setData(d);
    setExpanded(d.periods[0]?.id ?? null);
    setMounted(true);
  }, []);

  function refresh() {
    setData(load());
  }

  function toggleAdd() {
    if (adding) {
      // Reset form when canceling
      setForm({
        companyName: "",
        companySraNumber: "",
        jobTitle: "",
        startDate: "",
        endDate: "",
        assignmentType: "" as any,
        fullName: "",
        sraNumber: "",
        email: "",
      });
      setValidationErrors([]);
      setEditing(null);
    }
    setAdding((v) => !v);
  }

  function validateForm(): boolean {
    const errors: string[] = [];
    
    if (!form.companyName.trim()) errors.push("Company name is required");
    if (!form.jobTitle.trim()) errors.push("Job title is required");
    if (!form.startDate) errors.push("Start date is required");
    if (!form.endDate) errors.push("End date is required");
    if (!form.assignmentType) errors.push("Assignment type is required");
    
    // Only validate SRA number format if provided (not required)
    if (form.sraNumber.trim() && !/^\d{6}$/.test(form.sraNumber.trim())) {
      errors.push("SRA number must be exactly 6 digits");
    }
    
    // Only validate company SRA number format if provided (not required)
    if (form.companySraNumber.trim() && !/^\d{6}$/.test(form.companySraNumber.trim())) {
      errors.push("Company SRA number must be exactly 6 digits");
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  }

  function saveNewPeriod() {
    if (!validateForm()) return;
    
    if (editing) {
      // Update existing period
      const updatedData = { ...data };
      const periodIndex = updatedData.periods.findIndex(p => p.id === editing);
      if (periodIndex !== -1) {
        updatedData.periods[periodIndex] = {
          ...updatedData.periods[periodIndex],
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
        };
        // Save to localStorage
        if (typeof window !== "undefined") {
          window.localStorage.setItem("qwe-data-v1", JSON.stringify(updatedData));
        }
        setData(updatedData);
      }
    } else {
      // Add new period
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
    }
    
    setAdding(false);
    setEditing(null);
    setForm({ companyName:"", companySraNumber:"", jobTitle:"", startDate:"", endDate:"", assignmentType:"Standard", fullName:"", sraNumber:"", email:"" });
    refresh();
  }

  function handleAddReflection(periodId: string) {
    console.log("handleAddReflection called with periodId:", periodId);
    setAddingReflection(periodId);
    setEditingReflection(null);
    setValidationErrors([]);
    setReflectionForm({
      highLevelAreas: [],
      lowLevelCompetencies: [],
      selectedLowLevelCompetencies: [],
      projectName: "",
      activity: "",
      outcome: "",
      learning: "",
    });
  }

  function handleEditReflection(periodId: string, reflection: any) {
    console.log("handleEditReflection called with periodId:", periodId, "reflection:", reflection);
    setAddingReflection(periodId);
    setEditingReflection(reflection.id);
    setValidationErrors([]);
    setReflectionForm({
      highLevelAreas: reflection.highLevelAreas,
      lowLevelCompetencies: reflection.lowLevelCompetencies,
      selectedLowLevelCompetencies: reflection.lowLevelCompetencies,
      projectName: reflection.projectName || "",
      activity: reflection.activity,
      outcome: reflection.outcome || "",
      learning: reflection.learning,
    });
    

  }

  function saveReflection() {
    const errors: string[] = [];
    
    if (!reflectionForm.projectName.trim()) {
      errors.push("Project name is required");
    }
    if (!reflectionForm.activity.trim()) {
      errors.push("What did you do? field is required");
    }
    if (!reflectionForm.outcome.trim()) {
      errors.push("What was the outcome? field is required");
    }
    if (!reflectionForm.learning.trim()) {
      errors.push("What did you learn? field is required");
    }
    if (reflectionForm.highLevelAreas.length === 0) {
      errors.push("Please select at least one high-level competency");
    }
    if (reflectionForm.selectedLowLevelCompetencies.length === 0) {
      errors.push("Please select at least one low-level competency");
    }
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors([]);
    
    if (!addingReflection) return;
    
    if (editingReflection) {
      // Update existing reflection
      updateReflection(data, addingReflection, editingReflection, {
        loggedOn: new Date().toISOString(),
        highLevelAreas: reflectionForm.highLevelAreas,
        lowLevelCompetencies: reflectionForm.selectedLowLevelCompetencies,
        projectName: reflectionForm.projectName,
        activity: reflectionForm.activity,
        outcome: reflectionForm.outcome,
        learning: reflectionForm.learning,
      });
    } else {
      // Add new reflection
      addReflection(data, addingReflection, {
        loggedOn: new Date().toISOString(),
        highLevelAreas: reflectionForm.highLevelAreas,
        lowLevelCompetencies: reflectionForm.selectedLowLevelCompetencies,
        projectName: reflectionForm.projectName,
        activity: reflectionForm.activity,
        outcome: reflectionForm.outcome,
        learning: reflectionForm.learning,
      });
    }
    
    setAddingReflection(null);
    setEditingReflection(null);
    setReflectionForm({
      highLevelAreas: [],
      lowLevelCompetencies: [],
      selectedLowLevelCompetencies: [],
      projectName: "",
      activity: "",
      outcome: "",
      learning: "",
    });
    refresh();
  }

  function toggleReflectionExpanded(reflectionId: string) {
    setExpandedReflections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reflectionId)) {
        newSet.delete(reflectionId);
      } else {
        newSet.add(reflectionId);
      }
      return newSet;
    });
  }

  function toggleFieldExpanded(reflectionId: string, fieldName: string) {
    setExpandedFields(prev => {
      const newMap = new Map(prev);
      const reflectionFields = new Set(newMap.get(reflectionId) || []);
      
      if (reflectionFields.has(fieldName)) {
        reflectionFields.delete(fieldName);
      } else {
        reflectionFields.add(fieldName);
      }
      
      if (reflectionFields.size === 0) {
        newMap.delete(reflectionId);
      } else {
        newMap.set(reflectionId, reflectionFields);
      }
      
      return newMap;
    });
  }

  function toggleHighLevelArea(area: HighLevelArea) {
    setReflectionForm(prev => {
      const newAreas = prev.highLevelAreas.includes(area)
        ? prev.highLevelAreas.filter(a => a !== area)
        : [...prev.highLevelAreas, area];
      
      // Update low level competencies based on selected high level areas
      const newLowLevel = newAreas.flatMap(area => HIGH_TO_LOW[area]);
      
      return {
        ...prev,
        highLevelAreas: newAreas,
        lowLevelCompetencies: newLowLevel,
        // Reset selected low level competencies when high level areas change
        selectedLowLevelCompetencies: []
      };
    });
  }

  function toggleLowLevelCompetency(competency: LowLevelCompetency) {
    setReflectionForm(prev => ({
      ...prev,
      selectedLowLevelCompetencies: prev.selectedLowLevelCompetencies.includes(competency)
        ? prev.selectedLowLevelCompetencies.filter(c => c !== competency)
        : [...prev.selectedLowLevelCompetencies, competency]
    }));
  }

  function handleEditPeriod(period: any) {
    setForm({
      companyName: period.companyName,
      companySraNumber: period.companySraNumber || "",
      jobTitle: period.jobTitle,
      startDate: period.startDate.split('T')[0], // Convert ISO to date input format
      endDate: period.endDate.split('T')[0],
      assignmentType: period.assignmentType,
      fullName: period.confirmingSolicitor.fullName,
      sraNumber: period.confirmingSolicitor.sraNumber,
      email: period.confirmingSolicitor.email,
    });
    setEditing(period.id);
    setAdding(true);
    setValidationErrors([]);
  }

  function handleDeletePeriod(periodId: string) {
    if (confirm("Are you sure you want to delete this period? This action cannot be undone.")) {
      deletePeriod(data, periodId);
      refresh();
    }
  }

  if (!mounted) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 page-transition">
        <h1 className="display-title text-[clamp(40px,8vw,90px)] leading-[0.95] font-extrabold mb-8 sm:mb-12 tracking-tight fade-in-up">QWE PERIODS</h1>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6 w-48"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 page-transition">
      <h1 className="display-title text-[clamp(40px,8vw,90px)] leading-[0.95] font-extrabold mb-8 sm:mb-12 tracking-tight fade-in-up">QWE PERIODS</h1>
      
      <div className="mb-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
        <button 
          className="btn btn-primary clickable text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" 
          onClick={toggleAdd}
        >
          {adding ? "Cancel" : "+ Add New Period"}
        </button>
      </div>

      {adding && (
        <div className="card p-6 mb-6 rounded-2xl shadow-lg backdrop-blur-sm fade-in-up" style={{ animationDelay: '0.3s' }}>
          <SectionTitle>{editing ? "Edit QWE Period" : "Add New QWE Period"}</SectionTitle>
          
          {validationErrors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-red-700">Please fix the following errors:</span>
              </div>
              <ul className="list-disc list-inside text-red-600 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[color:var(--color-heading)] mb-2">
                Company name <span className="text-red-500">*</span>
              </label>
                            <input
                className="border-2 border-gray-200 rounded-xl p-4 text-lg transition-all duration-300 focus:border-[color:var(--brand-teal)] focus:outline-none focus:ring-4 focus:ring-[color:var(--brand-teal)]/20 w-full"
                placeholder="Enter company name"
                value={form.companyName}
                onChange={(e)=>setForm({...form, companyName:e.target.value})}
                spellCheck="true"
                autoCorrect="on"
                autoCapitalize="words"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[color:var(--color-heading)] mb-2">
                Job title <span className="text-red-500">*</span>
              </label>
                            <input
                className="border-2 border-gray-200 rounded-xl p-4 text-lg transition-all duration-300 focus:border-[color:var(--brand-teal)] focus:outline-none focus:ring-4 focus:ring-[color:var(--brand-teal)]/20 w-full"
                placeholder="Enter job title"
                value={form.jobTitle}
                onChange={(e)=>setForm({...form, jobTitle:e.target.value})}
                spellCheck="true"
                autoCorrect="on"
                autoCapitalize="words"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[color:var(--color-heading)] mb-2">
                Start date <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                className="border-2 border-gray-200 rounded-xl p-4 text-lg transition-all duration-300 focus:border-[color:var(--brand-teal)] focus:outline-none focus:ring-4 focus:ring-[color:var(--brand-teal)]/20 w-full" 
                value={form.startDate} 
                onChange={(e)=>setForm({...form, startDate:e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[color:var(--color-heading)] mb-2">
                End date <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                className="border-2 border-gray-200 rounded-xl p-4 text-lg transition-all duration-300 focus:border-[color:var(--brand-teal)] focus:outline-none focus:ring-4 focus:ring-[color:var(--brand-teal)]/20 w-full" 
                value={form.endDate} 
                onChange={(e)=>setForm({...form, endDate:e.target.value})} 
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[color:var(--color-heading)] mb-3">
                Assignment type <span className="text-red-500">*</span>
              </label>
              <div className="relative bg-gray-100 rounded-2xl p-1 border-2 border-gray-200">
                <div 
                  className={`absolute top-1 bottom-1 w-1/2 rounded-xl shadow-sm transition-all duration-300 ease-out ${
                    form.assignmentType === "LOD" 
                      ? "left-1 bg-[color:var(--brand-teal)]" 
                      : form.assignmentType === "Standard"
                      ? "left-1/2 bg-[color:var(--brand-teal)]"
                      : "opacity-0"
                  }`}
                />
                <div className="relative flex gap-4">
                  <button
                    type="button"
                    onClick={() => setForm({...form, assignmentType: "LOD"})}
                    className={`flex-1 py-4 px-6 rounded-xl text-center font-semibold text-lg transition-all duration-300 border-2 ${
                      form.assignmentType === "LOD" 
                        ? "text-white border-[color:var(--brand-teal)]" 
                        : "text-gray-500 border-gray-300 bg-white hover:border-gray-400 hover:text-gray-700"
                    }`}
                  >
                    Through LOD
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({...form, assignmentType: "Standard"})}
                    className={`flex-1 py-4 px-6 rounded-xl text-center font-semibold text-lg transition-all duration-300 border-2 ${
                      form.assignmentType === "Standard" 
                        ? "text-white border-[color:var(--brand-teal)]" 
                        : "text-gray-500 border-gray-300 bg-white hover:border-gray-400 hover:text-gray-700"
                    }`}
                  >
                    Not through LOD
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[color:var(--color-heading)] mb-2">
                Confirming solicitor name
              </label>
                            <input
                className="border-2 border-gray-200 rounded-xl p-4 text-lg transition-all duration-300 focus:border-[color:var(--brand-teal)] focus:outline-none focus:ring-4 focus:ring-[color:var(--brand-teal)]/20 w-full"
                placeholder="Enter solicitor name (optional)"
                value={form.fullName}
                onChange={(e)=>setForm({...form, fullName:e.target.value})}
                spellCheck="true"
                autoCorrect="on"
                autoCapitalize="words"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[color:var(--color-heading)] mb-2">
                Confirming solicitor email
              </label>
              <input 
                className="border-2 border-gray-200 rounded-xl p-4 text-lg transition-all duration-300 focus:border-[color:var(--brand-teal)] focus:outline-none focus:ring-4 focus:ring-[color:var(--brand-teal)]/20 w-full" 
                placeholder="Enter solicitor email (optional)" 
                value={form.email} 
                onChange={(e)=>setForm({...form, email:e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[color:var(--color-heading)] mb-2">
                Confirming solicitor SRA
              </label>
              <input 
                className="border-2 border-gray-200 rounded-xl p-4 text-lg transition-all duration-300 focus:border-[color:var(--brand-teal)] focus:outline-none focus:ring-4 focus:ring-[color:var(--brand-teal)]/20 w-full" 
                placeholder="Enter solicitor SRA number (optional)" 
                value={form.sraNumber} 
                onChange={(e)=>setForm({...form, sraNumber:e.target.value.replace(/\D/g, '').slice(0, 6)})} 
                maxLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[color:var(--color-heading)] mb-2">
                Company SRA number (if applicable)
              </label>
              <input 
                className="border-2 border-gray-200 rounded-xl p-4 text-lg transition-all duration-300 focus:border-[color:var(--brand-teal)] focus:outline-none focus:ring-4 focus:ring-[color:var(--brand-teal)]/20 w-full" 
                placeholder="Enter company SRA number (optional)" 
                value={form.companySraNumber} 
                onChange={(e)=>setForm({...form, companySraNumber:e.target.value.replace(/\D/g, '').slice(0, 6)})} 
                maxLength={6}
              />
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button 
              className="btn btn-primary clickable text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" 
              onClick={saveNewPeriod}
            >
              {editing ? "Update Period" : "Save Period"}
            </button>
            <button 
              className="btn btn-outline clickable text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" 
              onClick={() => {
                setAdding(false);
                setEditing(null);
                setValidationErrors([]);
                // Reset form to original values if editing
                if (editing) {
                  setForm({
                    companyName: "",
                    jobTitle: "",
                    startDate: "",
                    endDate: "",
                    assignmentType: "",
                    fullName: "",
                    email: "",
                    sraNumber: "",
                    companySraNumber: ""
                  });
                }
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Warning when exceeding 4 organisations */}
      {placementsCount(data.periods) > 4 && (
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50/50 to-teal-50/50 border border-blue-100/60 rounded-2xl backdrop-blur-sm shadow-sm">
          <div className="flex items-start gap-5">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-400/20 to-teal-400/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-gray-800 text-xl mb-3">Maximum organisations exceeded</div>
              <div className="text-gray-600 mb-4 leading-relaxed">
                You have logged <span className="font-semibold text-blue-600">{placementsCount(data.periods)} organisations</span>, but the SRA allows a maximum of 4. You can continue adding periods to review your experience, but you'll need to select your best 4 organisations when submitting your QWE.
              </div>
              <div className="text-gray-500 text-sm bg-white/50 rounded-lg p-3 border border-gray-100">
                <span className="font-semibold text-blue-600">💡 Tip:</span> Consider which periods demonstrate your best experience and competencies when preparing your final QWE submission.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 fade-in-up" style={{ animationDelay: '0.4s' }}>
        {data.periods.map((p, index) => (
          <div key={p.id} className="card rounded-2xl shadow-lg backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02]">
            <button 
              className="w-full text-left p-8 flex items-center justify-between hover:bg-gray-50 transition-all duration-300" 
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
            >
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                  index % 2 === 0 ? "bg-gradient-to-br from-red-400 to-pink-500" : // Exact same as dashboard
                  "bg-gradient-to-br from-red-400 to-pink-500" // Exact same as dashboard
                }`}>
                  <span className="text-white font-bold text-xl">{p.companyName.charAt(0)}</span>
                </div>
                <div>
                  <div className="font-bold text-2xl text-[color:var(--color-heading)] mb-2">{p.companyName}</div>
                  <div className="text-lg text-slate-600">{p.jobTitle}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-[color:var(--color-heading)]">
                  {formatDate(p.startDate)} - {formatDate(p.endDate)}
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  {p.reflections.length} reflections
                </div>
                <div className="flex items-center justify-end mt-2">
                  <svg 
                    className={`w-5 h-5 text-slate-400 transition-all duration-300 transform ${
                      expanded === p.id ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            {expanded === p.id && (
              <div className="p-8 pt-0 border-t border-gray-100">
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="font-semibold text-lg mb-4">Company Details</div>
                    <div className="space-y-3 text-sm">
                      <div><span className="font-semibold">SRA Number:</span> {p.companySraNumber ?? "Not provided"}</div>
                      <div><span className="font-semibold">Assignment Type:</span> {p.assignmentType === "LOD" ? "Through LOD" : "Not through LOD"}</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="font-semibold text-lg mb-4">Confirming Solicitor</div>
                    <div className="space-y-3 text-sm">
                      <div><span className="font-semibold">Name:</span> {p.confirmingSolicitor.fullName}</div>
                      <div><span className="font-semibold">SRA Number:</span> {p.confirmingSolicitor.sraNumber}</div>
                      <div><span className="font-semibold">Email:</span> {p.confirmingSolicitor.email}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-8">
                  <button 
                    className="btn btn-primary clickable text-lg px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" 
                    onClick={() => {
                      console.log("Add Reflection button clicked for period:", p.id);
                      handleAddReflection(p.id);
                    }}
                  >
                    + Add Reflection
                  </button>
                  <button className="btn btn-black clickable text-lg px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                    Generate Sign-off Email
                  </button>
                  <button 
                    className="btn btn-outline clickable text-lg px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" 
                    onClick={() => handleEditPeriod(p)}
                  >
                    Edit Period
                  </button>
                  <button 
                    className="btn btn-outline clickable text-lg px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400" 
                    onClick={() => handleDeletePeriod(p.id)}
                  >
                    Delete Period
                  </button>
                </div>

                <div>
                  <div className="font-bold text-2xl mb-6 text-[color:var(--color-heading)]">Reflections ({p.reflections.length})</div>
                  
                  {/* Add Reflection Form - At the top of reflections */}
                  {addingReflection === p.id && !editingReflection && (
                    <div className="mb-8 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-gray-200">
                      <SectionTitle>Add Reflection</SectionTitle>
                      
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-[color:var(--color-heading)] mb-3">
                          High Level Competencies *
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {([
                            { area: "A" as HighLevelArea, label: "Ethics, Professionalism and Judgment" },
                            { area: "B" as HighLevelArea, label: "Technical Legal Practice" },
                            { area: "C" as HighLevelArea, label: "Working with Other People" },
                            { area: "D" as HighLevelArea, label: "Self-management and Business Skills" }
                          ]).map(({ area, label }) => (
                            <button
                              key={area}
                              type="button"
                              onClick={() => toggleHighLevelArea(area)}
                              className={`p-3 rounded-xl text-center font-semibold transition-all duration-300 border-2 relative group ${
                                reflectionForm.highLevelAreas.includes(area)
                                  ? "bg-[color:var(--brand-teal)] text-white border-[color:var(--brand-teal)]"
                                  : "bg-white text-gray-600 border-gray-300 hover:border-[color:var(--brand-teal)]/50"
                              }`}
                              title={label}
                            >
                              <div className="text-lg font-bold">{area}</div>
                              <div className="text-xs mt-1 opacity-80">{label.split(' ')[0]}</div>
                              
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                                {label}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {reflectionForm.highLevelAreas.length > 0 && (
                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-[color:var(--color-heading)] mb-3">
                            Low Level Competencies *
                          </label>
                          <div className="text-sm text-gray-600 mb-3">
                            Select the specific competencies that apply to this reflection:
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="text-sm font-semibold mb-2">Competency Details:</div>
                            <div className="space-y-2 text-sm">
                              {reflectionForm.lowLevelCompetencies.map((comp) => (
                                <button
                                  key={comp}
                                  type="button"
                                  onClick={() => toggleLowLevelCompetency(comp)}
                                  className={`w-full text-left p-3 rounded-lg transition-all duration-300 border-2 ${
                                    reflectionForm.selectedLowLevelCompetencies.includes(comp)
                                      ? "bg-[color:var(--brand-teal)] text-white border-[color:var(--brand-teal)]"
                                      : "bg-white text-gray-500 border-gray-300 hover:border-gray-400 hover:text-gray-700"
                                  }`}
                                >
                                  <div className="flex">
                                    <span className="font-semibold w-8 flex-shrink-0">{comp}:</span>
                                    <span>{LOW_LEVEL_DESCRIPTIONS[comp]}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mt-3">
                            Selected: {reflectionForm.selectedLowLevelCompetencies.length > 0 ? reflectionForm.selectedLowLevelCompetencies.join(", ") : "None selected"}
                          </div>
                        </div>
                      )}

                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-[color:var(--color-heading)] mb-2">
                          Project name <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="border-2 border-gray-200 rounded-xl p-4 text-lg transition-all duration-300 focus:border-[color:var(--brand-teal)] focus:outline-none focus:ring-4 focus:ring-[color:var(--brand-teal)]/20 w-full"
                          placeholder="Enter project name"
                          value={reflectionForm.projectName}
                          onChange={(e) => setReflectionForm({...reflectionForm, projectName: e.target.value})}
                          spellCheck="true"
                          autoCorrect="on"
                          autoCapitalize="words"
                        />
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-[color:var(--color-heading)] mb-2">
                            What did you do? <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            className="border-2 border-gray-200 rounded-xl p-4 text-lg transition-all duration-300 focus:border-[color:var(--brand-teal)] focus:outline-none focus:ring-4 focus:ring-[color:var(--brand-teal)]/20 w-full h-32 resize-none"
                            placeholder="Describe the specific actions you took, tasks you completed, or work you performed..."
                            value={reflectionForm.activity}
                            onChange={(e) => setReflectionForm({...reflectionForm, activity: e.target.value})}
                            spellCheck="true"
                            autoCorrect="on"
                            autoCapitalize="sentences"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[color:var(--color-heading)] mb-2">
                            What was the outcome? <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            className="border-2 border-gray-200 rounded-xl p-4 text-lg transition-all duration-300 focus:border-[color:var(--brand-teal)] focus:outline-none focus:ring-4 focus:ring-[color:var(--brand-teal)]/20 w-full h-32 resize-none"
                            placeholder="What was the result of your actions? What impact did you have?"
                            value={reflectionForm.outcome}
                            onChange={(e) => setReflectionForm({...reflectionForm, outcome: e.target.value})}
                            spellCheck="true"
                            autoCorrect="on"
                            autoCapitalize="sentences"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[color:var(--color-heading)] mb-2">
                            What did you learn? <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            className="border-2 border-gray-200 rounded-xl p-4 text-lg transition-all duration-300 focus:border-[color:var(--brand-teal)] focus:outline-none focus:ring-4 focus:ring-[color:var(--brand-teal)]/20 w-full h-32 resize-none"
                            placeholder="What skills, knowledge, or insights did you gain from this experience?"
                            value={reflectionForm.learning}
                            onChange={(e) => setReflectionForm({...reflectionForm, learning: e.target.value})}
                            spellCheck="true"
                            autoCorrect="on"
                            autoCapitalize="sentences"
                          />
                        </div>
                      </div>

                      {validationErrors.length > 0 && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                          <div className="text-red-600 font-semibold mb-2">Please fix the following errors:</div>
                          <ul className="text-red-600 text-sm space-y-1">
                            {validationErrors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex gap-4 mt-8">
                        <button
                          className="btn btn-primary clickable px-6 py-3 rounded-xl"
                          onClick={saveReflection}
                        >
                          Save Reflection
                        </button>
                        <button
                          className="btn btn-outline clickable px-6 py-3 rounded-xl"
                          onClick={() => {
                            setAddingReflection(null);
                            setEditingReflection(null);
                            setValidationErrors([]);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    {p.reflections.map((r) => (
                      <div key={r.id} className="card p-6 rounded-xl shadow-md backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="font-bold text-lg text-[color:var(--color-heading)]">{r.projectName}</div>
                            <div className="text-sm text-gray-600">{r.lowLevelCompetencies.join(", ")}</div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              className="btn btn-outline clickable px-4 py-2 rounded-lg text-sm" 
                              onClick={() => {
                                console.log("Edit Reflection button clicked for period:", p.id, "reflection:", r);
                                handleEditReflection(p.id, r);
                              }}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-outline clickable px-4 py-2 rounded-lg text-sm border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400" 
                              onClick={() => { deleteReflection(data, p.id, r.id); refresh(); }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-slate-500 mb-4">Logged on: {formatDate(r.loggedOn)}</div>
                        
                        {/* Only show current reflection content when NOT editing */}
                        {editingReflection !== r.id && (
                          <>
                            <div className="bg-[color:var(--muted)] rounded-xl p-4 text-sm mb-4 border border-gray-200">
                              <div className="font-semibold mb-2">What did you do?</div>
                              <div className={`whitespace-pre-wrap break-words overflow-hidden ${!expandedFields.get(r.id)?.has('activity') ? 'max-h-[3rem] line-clamp-2' : ''}`}>
                                {r.activity}
                              </div>
                              {r.activity.length > 200 && (
                                <button 
                                  onClick={() => toggleFieldExpanded(r.id, 'activity')}
                                  className="text-[color:var(--brand-teal)] hover:text-[color:var(--brand-teal)]/80 text-xs font-medium mt-2"
                                >
                                  {expandedFields.get(r.id)?.has('activity') ? 'Show less' : 'Show more'}
                                </button>
                              )}
                            </div>
                            <div className="bg-[color:var(--muted)] rounded-xl p-4 text-sm mb-4 border border-gray-200">
                              <div className="font-semibold mb-2">What was the outcome?</div>
                              <div className={`whitespace-pre-wrap break-words overflow-hidden ${!expandedFields.get(r.id)?.has('outcome') ? 'max-h-[3rem] line-clamp-2' : ''}`}>
                                {r.outcome || "Not specified"}
                              </div>
                              {(r.outcome || "").length > 200 && (
                                <button 
                                  onClick={() => toggleFieldExpanded(r.id, 'outcome')}
                                  className="text-[color:var(--brand-teal)] hover:text-[color:var(--brand-teal)]/80 text-xs font-medium mt-2"
                                >
                                  {expandedFields.get(r.id)?.has('outcome') ? 'Show less' : 'Show more'}
                                </button>
                              )}
                            </div>
                            <div className="bg-[color:var(--muted)] rounded-xl p-4 text-sm border border-gray-200">
                              <div className="font-semibold mb-2">What did you learn?</div>
                              <div className={`whitespace-pre-wrap break-words overflow-hidden ${!expandedFields.get(r.id)?.has('learning') ? 'max-h-[3rem] line-clamp-2' : ''}`}>
                                {r.learning}
                              </div>
                              {r.learning.length > 200 && (
                                <button 
                                  onClick={() => toggleFieldExpanded(r.id, 'learning')}
                                  className="text-[color:var(--brand-teal)] hover:text-[color:var(--brand-teal)]/80 text-xs font-medium mt-2"
                                >
                                  {expandedFields.get(r.id)?.has('learning') ? 'Show less' : 'Show more'}
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      
                      {/* Edit Reflection Form - Inline with this specific reflection */}
                      {editingReflection === r.id && (
                        <div className="mt-6 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-gray-200 bg-white">
                          <SectionTitle>Edit Reflection</SectionTitle>
                          
                          <div className="mb-6">
                            <label className="block text-sm font-semibold text-[color:var(--color-heading)] mb-3">
                              High Level Competencies *
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {([
                                { area: "A" as HighLevelArea, label: "Ethics, Professionalism and Judgment" },
                                { area: "B" as HighLevelArea, label: "Technical Legal Practice" },
                                { area: "C" as HighLevelArea, label: "Working with Other People" },
                                { area: "D" as HighLevelArea, label: "Self-management and Business Skills" }
                              ]).map(({ area, label }) => (
                                <button
                                  key={area}
                                  type="button"
                                  onClick={() => toggleHighLevelArea(area)}
                                  className={`p-3 rounded-xl text-center font-semibold transition-all duration-300 border-2 relative group ${
                                    reflectionForm.highLevelAreas.includes(area)
                                      ? "bg-[color:var(--brand-teal)] text-white border-[color:var(--brand-teal)]"
                                      : "bg-white text-gray-600 border-gray-300 hover:border-[color:var(--brand-teal)]/50"
                                  }`}
                                  title={label}
                                >
                                  <div className="text-lg font-bold">{area}</div>
                                  <div className="text-xs mt-1 opacity-80">{label.split(' ')[0]}</div>
                                  
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                                    {label}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {reflectionForm.highLevelAreas.length > 0 && (
                            <div className="mb-6">
                              <label className="block text-sm font-semibold text-[color:var(--color-heading)] mb-3">
                                Low Level Competencies *
                              </label>
                              <div className="text-sm text-gray-600 mb-3">
                                Select the specific competencies that apply to this reflection:
                              </div>
                              <div className="bg-gray-50 rounded-xl p-4">
                                <div className="text-sm font-semibold mb-2">Competency Details:</div>
                                <div className="space-y-2 text-sm">
                                  {reflectionForm.lowLevelCompetencies.map((comp) => (
                                    <button
                                      key={comp}
                                      type="button"
                                      onClick={() => toggleLowLevelCompetency(comp)}
                                      className={`w-full text-left p-3 rounded-lg transition-all duration-300 border-2 ${
                                        reflectionForm.selectedLowLevelCompetencies.includes(comp)
                                          ? "bg-[color:var(--brand-teal)] text-white border-[color:var(--brand-teal)]"
                                          : "bg-white text-gray-500 border-gray-300 hover:border-gray-400 hover:text-gray-700"
                                      }`}
                                    >
                                      <div className="flex">
                                        <span className="font-semibold w-8 flex-shrink-0">{comp}:</span>
                                        <span>{LOW_LEVEL_DESCRIPTIONS[comp]}</span>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="text-sm text-gray-600 mt-3">
                                Selected: {reflectionForm.selectedLowLevelCompetencies.length > 0 ? reflectionForm.selectedLowLevelCompetencies.join(", ") : "None selected"}
                              </div>
                            </div>
                          )}

                          <div className="mb-6">
                            <label className="block text-sm font-semibold text-[color:var(--color-heading)] mb-2">
                              Project name <span className="text-red-500">*</span>
                            </label>
                            <input
                              className="border-2 border-gray-200 rounded-xl p-4 text-lg transition-all duration-300 focus:border-[color:var(--brand-teal)] focus:outline-none focus:ring-4 focus:ring-[color:var(--brand-teal)]/20 w-full"
                              placeholder="Enter project name"
                              value={reflectionForm.projectName}
                              onChange={(e) => setReflectionForm({...reflectionForm, projectName: e.target.value})}
                              spellCheck="true"
                              autoCorrect="on"
                              autoCapitalize="words"
                            />
                          </div>

                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-semibold text-[color:var(--color-heading)] mb-2">
                                What did you do? <span className="text-red-500">*</span>
                              </label>
                              <textarea
                                className="border-2 border-gray-200 rounded-xl p-4 text-lg transition-all duration-300 focus:border-[color:var(--brand-teal)] focus:outline-none focus:ring-4 focus:ring-[color:var(--brand-teal)]/20 w-full h-32 resize-none"
                                placeholder="Describe the specific actions you took, tasks you completed, or work you performed..."
                                value={reflectionForm.activity}
                                onChange={(e) => setReflectionForm({...reflectionForm, activity: e.target.value})}
                                spellCheck="true"
                                autoCorrect="on"
                                autoCapitalize="sentences"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-[color:var(--color-heading)] mb-2">
                                What was the outcome? <span className="text-red-500">*</span>
                              </label>
                              <textarea
                                className="border-2 border-gray-200 rounded-xl p-4 text-lg transition-all duration-300 focus:border-[color:var(--brand-teal)] focus:outline-none focus:ring-4 focus:ring-[color:var(--brand-teal)]/20 w-full h-32 resize-none"
                                placeholder="What was the result of your actions? What impact did you have?"
                                value={reflectionForm.outcome}
                                onChange={(e) => setReflectionForm({...reflectionForm, outcome: e.target.value})}
                                spellCheck="true"
                                autoCorrect="on"
                                autoCapitalize="sentences"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-[color:var(--color-heading)] mb-2">
                                What did you learn? <span className="text-red-500">*</span>
                              </label>
                              <textarea
                                className="border-2 border-gray-200 rounded-xl p-4 text-lg transition-all duration-300 focus:border-[color:var(--brand-teal)] focus:outline-none focus:ring-4 focus:ring-[color:var(--brand-teal)]/20 w-full h-32 resize-none"
                                placeholder="What skills, knowledge, or insights did you gain from this experience?"
                                value={reflectionForm.learning}
                                onChange={(e) => setReflectionForm({...reflectionForm, learning: e.target.value})}
                                spellCheck="true"
                                autoCorrect="on"
                                autoCapitalize="sentences"
                              />
                            </div>
                          </div>

                          {validationErrors.length > 0 && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                              <div className="text-red-600 font-semibold mb-2">Please fix the following errors:</div>
                              <ul className="text-red-600 text-sm space-y-1">
                                {validationErrors.map((error, index) => (
                                  <li key={index}>• {error}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="flex gap-4 mt-8">
                            <button
                              className="btn btn-primary clickable px-6 py-3 rounded-xl"
                              onClick={saveReflection}
                            >
                              Save Changes
                            </button>
                            <button
                              className="btn btn-outline clickable px-6 py-3 rounded-xl"
                              onClick={() => {
                                setAddingReflection(null);
                                setEditingReflection(null);
                                setValidationErrors([]);
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      </div>
                    ))}
                  </div>
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


