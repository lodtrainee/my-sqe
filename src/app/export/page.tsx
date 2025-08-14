'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ExportPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    const loadData = () => {
      try {
        const storedData = localStorage.getItem('appData');
        if (storedData) {
          setData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleExportPDF = async () => {
    // Temporarily disabled
    alert('PDF Export is temporarily disabled. Please check back later.');
  };

  const generateEmailTemplate = () => {
    if (!data || !data.qwePeriods || data.qwePeriods.length === 0) {
      alert('No QWE periods found. Please add some periods first.');
      return;
    }

    if (!userName.trim()) {
      alert('Please enter your name.');
      return;
    }

    const periodsList = data.qwePeriods.map((period: any) => {
      const startDate = new Date(period.startDate).toLocaleDateString('en-GB');
      const endDate = new Date(period.endDate).toLocaleDateString('en-GB');
      return `• **${period.companyName}**: ${period.jobTitle}, ${startDate} - ${endDate}`;
    }).join('\n');

    const emailBody = `Hi Lottie,

I hope you're well.

I am writing to request sign-off for my QWE period for the following:

${periodsList}

You will find my journal entries for each assignment attached.

Many thanks,
${userName}`;

    const emailSubject = 'QWE Sign-off Request - LOD Assignments';

    // Create mailto link
    const mailtoLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Open email client
    window.open(mailtoLink);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Data Found</h1>
          <p className="text-gray-600">Please add some QWE periods and reflections first.</p>
          <Link href="/" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const totalMonths = data.qwePeriods ? data.qwePeriods.reduce((total: number, period: any) => {
    return total + (period.duration || 0);
  }, 0) : 0;

  const totalReflections = data.qwePeriods ? data.qwePeriods.reduce((total: number, period: any) => {
    return total + (period.reflections ? period.reflections.length : 0);
  }, 0) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Export QWE Report</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Periods</p>
                <p className="text-2xl font-bold text-blue-900">{data.qwePeriods ? data.qwePeriods.length : 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Total Months</p>
                <p className="text-2xl font-bold text-green-900">{totalMonths}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Total Reflections</p>
                <p className="text-2xl font-bold text-purple-900">{totalReflections}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Export Options</h2>
            
            <div className="space-y-4">
              <button
                onClick={handleExportPDF}
                disabled={true}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium cursor-not-allowed opacity-50"
              >
                Download Comprehensive PDF Report
              </button>

              <button
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
              >
                Generate Email Sign-off Request
              </button>
            </div>

            {showEmailForm && (
              <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Email Sign-off Request</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">QWE Periods to Include:</h4>
                  <div className="space-y-2">
                    {data.qwePeriods && data.qwePeriods.map((period: any, index: number) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked={true}
                          className="mr-3"
                        />
                        <span className="text-sm text-gray-600">
                          {period.companyName} - {period.jobTitle} ({new Date(period.startDate).toLocaleDateString('en-GB')} - {new Date(period.endDate).toLocaleDateString('en-GB')})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateEmailTemplate}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
                >
                  Generate Email
                </button>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Report Preview</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4">
                The comprehensive PDF report will include:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Professional header with LOD branding</li>
                <li>Summary statistics and competency coverage</li>
                <li>Detailed QWE periods with all reflections</li>
                <li>High-level and low-level competency descriptions</li>
                <li>Clean, modern formatting suitable for professional use</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

