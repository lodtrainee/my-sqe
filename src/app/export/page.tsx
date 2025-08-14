'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppData } from '@/lib/types';
import { generateQWESummary, generateReflectionsSummary, generateEmailTemplate, downloadAsPDF, openEmailClient } from '@/lib/export';

export default function ExportPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [includeReflections, setIncludeReflections] = useState(true);
  const [solicitorDetails, setSolicitorDetails] = useState({
    name: '',
    sraNumber: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedData = localStorage.getItem('appData');
    if (savedData) {
      setData(JSON.parse(savedData));
    }
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your QWE data...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleExportPDF = () => {
    setIsLoading(true);
    
    try {
      let content = generateQWESummary(data);
      if (includeReflections) {
        content += generateReflectionsSummary(data);
      }
      
      const filename = `QWE_Report_${new Date().toISOString().split('T')[0]}.txt`;
      downloadAsPDF(content, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignOff = () => {
    if (!solicitorDetails.name || !solicitorDetails.email) {
      alert('Please fill in the solicitor details.');
      return;
    }

    try {
      const { subject, body } = generateEmailTemplate(data, solicitorDetails);
      openEmailClient(subject, body);
    } catch (error) {
      console.error('Email generation failed:', error);
      alert('Email generation failed. Please try again.');
    }
  };

  const totalMonths = data.periods.reduce((total, period) => {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                   (end.getMonth() - start.getMonth()) + 1;
    return total + months;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Export QWE</h1>
          <p className="text-gray-600">Generate reports and request solicitor sign-off</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">{data.periods.length}</div>
            <div className="text-gray-600">QWE Periods</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600 mb-1">{totalMonths}</div>
            <div className="text-gray-600">Total Months</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-purple-600 mb-1">{data.reflections.length}</div>
            <div className="text-gray-600">Reflections</div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Export Options</h2>
          
          <div className="space-y-6">
            {/* PDF Export */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Download QWE Report</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeReflections"
                    checked={includeReflections}
                    onChange={(e) => setIncludeReflections(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="includeReflections" className="ml-2 text-gray-700">
                    Include reflections in the report
                  </label>
                </div>
                <button
                  onClick={handleExportPDF}
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Generating...' : 'Download PDF Report'}
                </button>
              </div>
            </div>

            {/* Email Sign-off */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Request Solicitor Sign-off</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Solicitor Name *
                    </label>
                    <input
                      type="text"
                      value={solicitorDetails.name}
                      onChange={(e) => setSolicitorDetails(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter solicitor name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SRA Number
                    </label>
                    <input
                      type="text"
                      value={solicitorDetails.sraNumber}
                      onChange={(e) => setSolicitorDetails(prev => ({ ...prev, sraNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter SRA number"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={solicitorDetails.email}
                    onChange={(e) => setSolicitorDetails(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
                <button
                  onClick={handleEmailSignOff}
                  disabled={!solicitorDetails.name || !solicitorDetails.email}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Generate Email Template
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Report Preview</h2>
          <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {generateQWESummary(data)}
              {includeReflections && generateReflectionsSummary(data)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

