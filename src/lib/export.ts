import { AppData, QWEPeriod, Reflection } from './types';

export interface ExportOptions {
  includeReflections: boolean;
  format: 'pdf' | 'email';
  solicitorDetails?: {
    name: string;
    sraNumber: string;
    email: string;
  };
}

export function generateQWESummary(data: AppData): string {
  const totalMonths = data.periods.reduce((total, period) => {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                   (end.getMonth() - start.getMonth()) + 1;
    return total + months;
  }, 0);

  const throughLODCount = data.periods.filter(p => p.assignmentType === 'Through LOD').length;
  const notThroughLODCount = data.periods.filter(p => p.assignmentType === 'Not through LOD').length;

  return `
QWE Summary Report
Generated: ${new Date().toLocaleDateString('en-GB')}

Total QWE Periods: ${data.periods.length}
Total Months: ${totalMonths}
Through LOD Periods: ${throughLODCount}
Not Through LOD Periods: ${notThroughLODCount}

Organisations: ${new Set(data.periods.map(p => p.companyName)).size} out of 4 maximum

QWE Periods:
${data.periods.map((period, index) => `
${index + 1}. ${period.companyName}
   Position: ${period.title}
   Period: ${new Date(period.startDate).toLocaleDateString('en-GB')} - ${new Date(period.endDate).toLocaleDateString('en-GB')}
   Assignment Type: ${period.assignmentType}
   ${period.companySraNumber ? `Company SRA: ${period.companySraNumber}` : ''}
   ${period.confirmingSolicitorName ? `Confirming Solicitor: ${period.confirmingSolicitorName}` : ''}
   ${period.confirmingSolicitorSra ? `Solicitor SRA: ${period.confirmingSolicitorSra}` : ''}
   ${period.confirmingSolicitorEmail ? `Solicitor Email: ${period.confirmingSolicitorEmail}` : ''}
`).join('')}
`;
}

export function generateReflectionsSummary(data: AppData): string {
  const reflectionsByPeriod = data.periods.map(period => {
    const periodReflections = data.reflections.filter(r => r.periodId === period.id);
    return {
      period,
      reflections: periodReflections
    };
  }).filter(item => item.reflections.length > 0);

  if (reflectionsByPeriod.length === 0) {
    return '\nNo reflections recorded.';
  }

  return `
Reflections Summary:
${reflectionsByPeriod.map(({ period, reflections }) => `
${period.companyName} (${new Date(period.startDate).toLocaleDateString('en-GB')} - ${new Date(period.endDate).toLocaleDateString('en-GB')}):
${reflections.map((reflection, index) => `
  Reflection ${index + 1} (${new Date(reflection.loggedOn).toLocaleDateString('en-GB')}):
  Project: ${reflection.projectName}
  Competencies: ${reflection.highLevelAreas.join(', ')} - ${reflection.lowLevelCompetencies.map(c => c.code).join(', ')}
  Activity: ${reflection.activity}
  Learning: ${reflection.learning}
`).join('')}
`).join('')}
`;
}

export function generateEmailTemplate(data: AppData, solicitorDetails: any): string {
  const subject = `QWE Period Review Request - ${data.periods.length} periods`;
  
  const body = `
Dear ${solicitorDetails.name},

I hope this email finds you well. I am writing to request your review and sign-off of my Qualified Work Experience (QWE) periods as part of my SQE qualification.

Please find attached a detailed summary of my QWE experience, including:
- ${data.periods.length} QWE periods
- Total of ${data.periods.reduce((total, period) => {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                   (end.getMonth() - start.getMonth()) + 1;
    return total + months;
  }, 0)} months of experience
- Detailed reflections on my learning and development

I would be grateful if you could review this documentation and confirm that:
1. The periods listed accurately reflect my work experience
2. The work undertaken was of an appropriate nature and level
3. I demonstrated the required competencies during these periods

Please let me know if you require any additional information or clarification.

Thank you for your time and support.

Best regards,
[Your Name]

---
SRA Number: ${solicitorDetails.sraNumber}
Email: ${solicitorDetails.email}
`;

  return { subject, body };
}

export function downloadAsPDF(content: string, filename: string) {
  // This would integrate with a PDF library like jsPDF
  // For now, we'll create a downloadable text file
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function openEmailClient(subject: string, body: string) {
  const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoLink);
}
