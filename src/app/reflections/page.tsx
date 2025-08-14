"use client";

import { useState, useEffect } from "react";
import { AppData } from "@/lib/store";
import { Reflection } from "@/lib/types";
import { ALL_LOW, HIGH_TO_LOW } from "@/lib/types";

interface CompetencyGroup {
  highLevel: string;
  lowLevel: string[];
  reflections: Reflection[];
  duplicateGroups: Reflection[][];
}

export default function ReflectionsPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [expandedCompetencies, setExpandedCompetencies] = useState<Set<string>>(new Set());
  const [selectedReflections, setSelectedReflections] = useState<Set<string>>(new Set());
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [expandedReflections, setExpandedReflections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedData = localStorage.getItem("qwe-data-v1");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setData(parsedData);
      } catch (error) {
        setData({ periods: [] });
      }
    } else {
      setData({ periods: [] });
    }
  }, []);

  const getHighLevelForLowLevel = (lowLevel: string): string => {
    for (const [highLevel, competencies] of Object.entries(HIGH_TO_LOW)) {
      if (competencies.includes(lowLevel as any)) {
        return highLevel;
      }
    }
    return "";
  };

  const calculateSimilarity = (ref1: Reflection, ref2: Reflection): number => {
    const text1 = `${ref1.projectName} ${ref1.activity} ${ref1.learning}`.toLowerCase();
    const text2 = `${ref2.projectName} ${ref2.activity} ${ref2.learning}`.toLowerCase();
    
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
    
    const competencyWords = new Set([
      'critical', 'thinking', 'analysis', 'analyze', 'analyse', 'solve', 'problem', 'problems', 'solving',
      'facts', 'relevant', 'obtain', 'obtaining', 'information', 'research',
      'legal', 'research', 'case', 'law', 'precedent', 'statute', 'legislation',
      'advise', 'advice', 'options', 'strategies', 'solutions', 'develop',
      'draft', 'drafting', 'document', 'documents', 'legal', 'effective',
      'advocacy', 'advocate', 'speaking', 'written', 'oral', 'presentation',
      'negotiate', 'negotiation', 'negotiating', 'settlement', 'agreement',
      'case', 'management', 'manage', 'progress', 'transaction', 'matter',
      'client', 'relationship', 'professional', 'establish', 'maintain',
      'professional', 'relationship', 'colleague', 'team', 'work',
      'communicate', 'communication', 'oral', 'written', 'speaking', 'writing',
      'manage', 'management', 'plan', 'planning', 'prioritise', 'prioritize', 'efficient',
      'decision', 'decisions', 'reasoned', 'informed', 'sound',
      'learning', 'development', 'continuing', 'professional', 'development', 'training'
    ]);
    
    const words1 = new Set(text1.split(/\s+/).filter(word => 
      !commonWords.has(word) && 
      !competencyWords.has(word) && 
      word.length > 2
    ));
    const words2 = new Set(text2.split(/\s+/).filter(word => 
      !commonWords.has(word) && 
      !competencyWords.has(word) && 
      word.length > 2
    ));
    
    if (words1.size === 0 && words2.size === 0) return 0;
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  };

  const detectDuplicates = (reflections: Reflection[]): Reflection[][] => {
    const groups: Reflection[][] = [];
    const processed = new Set<string>();

    reflections.forEach(reflection => {
      if (processed.has(reflection.id)) return;

      const similarReflections = [reflection];
      processed.add(reflection.id);

      reflections.forEach(otherReflection => {
        if (otherReflection.id === reflection.id || processed.has(otherReflection.id)) return;

        const similarity = calculateSimilarity(reflection, otherReflection);
        const daysBetween = getDaysBetween(reflection.loggedOn, otherReflection.loggedOn);
        
        const threshold = daysBetween <= 30 ? 0.2 : 0.3;
        
        if (similarity >= threshold) {
          similarReflections.push(otherReflection);
          processed.add(otherReflection.id);
        }
      });

      if (similarReflections.length > 1) {
        groups.push(similarReflections);
      }
    });

    return groups;
  };

  const getDaysBetween = (date1: string, date2: string): number => {
    try {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return Infinity;
    }
  };

  // Group reflections by competency
  const competencyGroups: CompetencyGroup[] = ALL_LOW.map(lowLevel => {
    const reflections = data?.periods.flatMap(period => 
      period.reflections.filter(reflection => 
        reflection.lowLevelCompetencies.includes(lowLevel as any)
      )
    ) || [];

    const duplicateGroups = detectDuplicates(reflections);

    return {
      highLevel: getHighLevelForLowLevel(lowLevel),
      lowLevel: [lowLevel],
      reflections,
      duplicateGroups
    };
  }).filter(group => group.reflections.length > 0);

  // Group by high-level competency areas
  const groupedByHighLevel = competencyGroups.reduce((acc, group) => {
    const highLevel = group.highLevel;
    if (!acc[highLevel]) {
      acc[highLevel] = [];
    }
    acc[highLevel].push(group);
    return acc;
  }, {} as Record<string, CompetencyGroup[]>);

  const toggleExpanded = (competency: string) => {
    const newExpanded = new Set(expandedCompetencies);
    if (newExpanded.has(competency)) {
      newExpanded.delete(competency);
    } else {
      newExpanded.add(competency);
    }
    setExpandedCompetencies(newExpanded);
  };

  const toggleReflectionSelection = (reflectionId: string) => {
    const newSelected = new Set(selectedReflections);
    if (newSelected.has(reflectionId)) {
      newSelected.delete(reflectionId);
    } else {
      newSelected.add(reflectionId);
    }
    setSelectedReflections(newSelected);
  };

  const toggleReflectionExpanded = (reflectionId: string) => {
    setExpandedReflections(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(reflectionId)) {
        newExpanded.delete(reflectionId);
      } else {
        newExpanded.add(reflectionId);
      }
      return newExpanded;
    });
  };

  const handleRemoveSelected = () => {
    setShowDeleteWarning(true);
  };

  const confirmDelete = () => {
    if (!data) return;
    
    // Create a new data object with selected reflections removed
    const updatedData = {
      ...data,
      periods: data.periods.map(period => ({
        ...period,
        reflections: period.reflections.filter(reflection => !selectedReflections.has(reflection.id))
      }))
    };
    
    // Update localStorage
    localStorage.setItem("qwe-data-v1", JSON.stringify(updatedData));
    
    // Update state
    setData(updatedData);
    
    // Clear selected reflections and close warning
    setSelectedReflections(new Set());
    setShowDeleteWarning(false);
  };

  const cancelDelete = () => {
    setShowDeleteWarning(false);
  };

  const getCompetencyTitle = (competency: string): string => {
    const titles: Record<string, string> = {
      A: "Ethics, Professionalism and Judgment",
      B: "Technical Legal Practice",
      C: "Working with Other People",
      D: "Managing Themselves and Their Own Work"
    };
    return titles[competency] || competency;
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading reflections...</div>
      </div>
    );
  }

  const totalReflections = data.periods.flatMap(p => p.reflections).length;
  
  if (totalReflections === 0) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 page-transition">
        <h1 className="display-title text-[clamp(40px,8vw,90px)] leading-[0.95] font-extrabold mb-8 sm:mb-12 tracking-tight fade-in-up">REFLECTIONS</h1>
        <div className="text-center py-12">
          <div className="text-2xl font-semibold text-gray-600 mb-4">No reflections found</div>
          <p className="text-gray-500 mb-6">
            You haven't added any reflections yet. Go to the QWE Periods page to add your first reflection.
          </p>
          <a 
            href="/periods" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to QWE Periods
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 page-transition">
      {/* Header - EXACTLY like QWE periods */}
      <h1 className="display-title text-[clamp(40px,8vw,90px)] leading-[0.95] font-extrabold mb-8 sm:mb-12 tracking-tight fade-in-up">REFLECTIONS</h1>
      
      {/* Summary Stats - EXACTLY like QWE periods cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="card p-6 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02]">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {data.periods.flatMap(p => p.reflections).length}
          </div>
          <div className="text-sm text-gray-600 font-medium">Total Reflections</div>
        </div>
        <div className="card p-6 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02]">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {Object.keys(groupedByHighLevel).length}
          </div>
          <div className="text-sm text-gray-600 font-medium">Competency Areas</div>
        </div>
        <div className="card p-6 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02]">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {competencyGroups.reduce((sum, group) => sum + group.duplicateGroups.length, 0)}
          </div>
          <div className="text-sm text-gray-600 font-medium">Duplicate Groups</div>
        </div>
        <div className="card p-6 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02]">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {selectedReflections.size}
          </div>
          <div className="text-sm text-gray-600 font-medium">Selected</div>
        </div>
      </div>

      {/* Competency Areas */}
      <div className="space-y-8">
        {Object.entries(groupedByHighLevel).map(([highLevel, groups]) => (
          <div key={highLevel} className="card rounded-2xl shadow-lg backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:scale-[1.01]">
            <button 
              className="w-full text-left bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-8 hover:bg-gradient-to-r hover:from-blue-100 hover:via-purple-100 hover:to-pink-100 transition-all duration-300" 
              onClick={() => toggleExpanded(highLevel)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[color:var(--color-heading)] tracking-tight">
                    {highLevel}: {getCompetencyTitle(highLevel)}
                  </h2>
                  <p className="text-sm text-[color:var(--foreground)] mt-2 font-medium">
                    {groups.length} competency areas • {groups.reduce((sum, group) => sum + group.reflections.length, 0)} reflections
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-[color:var(--color-heading)]">
                      {groups.length} areas
                    </div>
                    <div className="text-sm text-slate-500">
                      {groups.reduce((sum, group) => sum + group.reflections.length, 0)} reflections
                    </div>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-slate-400 transition-all duration-300 transform ${
                      expandedCompetencies.has(highLevel) ? 'rotate-180' : ''
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
            
            {expandedCompetencies.has(highLevel) && (
              <div className="divide-y divide-gray-100">
                {groups.map((group) => (
                  <div key={group.lowLevel[0]} className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-[color:var(--color-heading)] tracking-tight">
                          {group.lowLevel[0]}
                        </h3>
                        <p className="text-sm text-[color:var(--foreground)] font-medium">
                          {group.reflections.length} reflection{group.reflections.length !== 1 ? 's' : ''}
                          {group.duplicateGroups.length > 0 && (
                            <span className="ml-2 text-orange-600 font-semibold">
                              • {group.duplicateGroups.length} potential duplicate group{group.duplicateGroups.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleExpanded(group.lowLevel[0])}
                        className="flex items-center gap-3 px-6 py-3 text-sm font-semibold text-[color:var(--color-heading)] bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border border-gray-200 hover:shadow-md transform hover:scale-105"
                      >
                        {expandedCompetencies.has(group.lowLevel[0]) ? 'Hide' : 'Show'} Reflections
                        <svg className={`w-4 h-4 transition-transform duration-300 ${expandedCompetencies.has(group.lowLevel[0]) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {expandedCompetencies.has(group.lowLevel[0]) && (
                      <div className="space-y-4">
                        {/* Duplicate Groups */}
                        {group.duplicateGroups.map((duplicateGroup, index) => (
                          <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span className="font-medium text-orange-800">
                                Potential Duplicates ({duplicateGroup.length} similar reflections)
                              </span>
                              <div className="text-xs text-orange-700 mt-1">
                                {getDaysBetween(duplicateGroup[0].loggedOn, duplicateGroup[1].loggedOn) <= 30 
                                  ? "⚠️ Same time period - consider if this is the same experience"
                                  : "⚠️ Similar content across different periods - review for quality"
                                }
                              </div>
                            </div>
                            <div className="space-y-3">
                              {duplicateGroup.map((reflection) => (
                                <div key={reflection.id} className="bg-white rounded-lg p-4 border border-orange-200">
                                  <div className="flex items-start gap-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedReflections.has(reflection.id)}
                                      onChange={() => toggleReflectionSelection(reflection.id)}
                                      className="mt-1"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2 min-w-0">
                                        <span className="font-medium text-gray-900 truncate">{reflection.projectName}</span>
                                        <span className="text-xs text-gray-500 flex-shrink-0">
                                          {new Date(reflection.loggedOn).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <div className="w-full">
                                        <div className={`text-sm break-words ${!expandedReflections.has(reflection.id) ? 'line-clamp-2' : ''}`}>
                                          <div className="text-gray-700 mb-2">
                                            <div className="font-bold text-gray-800 mb-1">What did you do:</div>
                                            <div>{reflection.activity}</div>
                                          </div>
                                          <div className="text-gray-600 mb-2">
                                            <div className="font-bold text-gray-800 mb-1">What was the outcome:</div>
                                            <div>{reflection.outcome || "Not specified"}</div>
                                          </div>
                                          <div className="text-gray-600">
                                            <div className="font-bold text-gray-800 mb-1">What did you learn:</div>
                                            <div>{reflection.learning}</div>
                                          </div>
                                        </div>
                                        {(reflection.activity.length > 200 || reflection.outcome?.length > 200 || reflection.learning.length > 200) && (
                                          <button 
                                            onClick={() => toggleReflectionExpanded(reflection.id)}
                                            className="text-[color:var(--brand-teal)] hover:text-[color:var(--brand-teal)]/80 text-xs font-medium mt-2"
                                          >
                                            {expandedReflections.has(reflection.id) ? 'Show less' : 'Show more'}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* Other Reflections */}
                        {group.reflections.filter(reflection => 
                          !group.duplicateGroups.flat().some(dup => dup.id === reflection.id)
                        ).map((reflection) => (
                          <div key={reflection.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={selectedReflections.has(reflection.id)}
                                onChange={() => toggleReflectionSelection(reflection.id)}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 min-w-0">
                                  <span className="font-medium text-gray-900 truncate">{reflection.projectName}</span>
                                  <span className="text-xs text-gray-500 flex-shrink-0">
                                    {new Date(reflection.loggedOn).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="w-full">
                                  <div className={`text-sm break-words ${!expandedReflections.has(reflection.id) ? 'line-clamp-2' : ''}`}>
                                    <div className="text-gray-700 mb-2">
                                      <div className="font-bold text-gray-800 mb-1">What did you do:</div>
                                      <div>{reflection.activity}</div>
                                    </div>
                                    <div className="text-gray-600 mb-2">
                                      <div className="font-bold text-gray-800 mb-1">What was the outcome:</div>
                                      <div>{reflection.outcome || "Not specified"}</div>
                                    </div>
                                    <div className="text-gray-600">
                                      <div className="font-bold text-gray-800 mb-1">What did you learn:</div>
                                      <div>{reflection.learning}</div>
                                    </div>
                                  </div>
                                  {(reflection.activity.length > 200 || reflection.outcome?.length > 200 || reflection.learning.length > 200) && (
                                    <button 
                                      onClick={() => toggleReflectionExpanded(reflection.id)}
                                      className="text-[color:var(--brand-teal)] hover:text-[color:var(--brand-teal)]/80 text-xs font-medium mt-2"
                                    >
                                      {expandedReflections.has(reflection.id) ? 'Show less' : 'Show more'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Bar */}
      {selectedReflections.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-40">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 font-medium">
              {selectedReflections.size} reflection{selectedReflections.size !== 1 ? 's' : ''} selected
            </span>
            <button 
              onClick={() => setSelectedReflections(new Set())}
              className="px-4 py-2 text-[color:var(--color-heading)] bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border border-gray-200 hover:shadow-md transform hover:scale-105 font-semibold"
            >
              Cancel
            </button>
            <button 
              onClick={handleRemoveSelected}
              className="px-6 py-3 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-xl hover:from-red-500 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              Remove Selected
            </button>
          </div>
        </div>
      )}

      {/* Delete Warning Modal */}
      {showDeleteWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-8 rounded-t-2xl border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[color:var(--color-heading)] tracking-tight">
                    Delete Reflections?
                  </h3>
                  <p className="text-sm text-[color:var(--foreground)] mt-1 font-medium">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <p className="text-[color:var(--foreground)] mb-8 leading-relaxed text-lg">
                You're about to permanently delete <span className="font-semibold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">{selectedReflections.size} reflection{selectedReflections.size !== 1 ? 's' : ''}</span>. 
                This action will remove the reflection{selectedReflections.size !== 1 ? 's' : ''} from all linked competency areas, 
                both this page and the QWE Periods page, and cannot be undone.
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-6 py-4 text-[color:var(--color-heading)] bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border border-gray-200 hover:shadow-md transform hover:scale-105 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-xl hover:from-red-500 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
