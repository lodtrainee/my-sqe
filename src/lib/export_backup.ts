import jsPDF from 'jspdf';
import { QwePeriod, Reflection, LOW_LEVEL_DESCRIPTIONS, COMPETENCY_DESCRIPTIONS } from './types';
import { AppData } from './store';

// Modern PDF styling constants
const COLORS = {
  primary: [26, 191, 155], // LOD mint green
  secondary: [28, 46, 75], // Dark blue
  accent: [59, 130, 246], // Blue
  text: [55, 65, 81], // Gray
  lightGray: [243, 244, 246],
  white: [255, 255, 255],
  border: [229, 231, 235]
};

const MARGINS = {
  left: 25,
  right: 25,
  top: 50,
  bottom: 30
};

const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGINS.left - MARGINS.right;

// EMBEDDED LOGO - Base64 encoded white-transparent.png
const LOD_LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAAyCAYAAAAZUZThAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF0WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78i iglkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4yLWMwMDAgNzkuMWI2NWE3OWI0LCAyMDIyLzA2LzEzLTIyOjAxOjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpypmY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjQuMCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjUtMDgtMTRUMTg6MTU6NDErMDE6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjUtMDgtMTRUMTg6MTU6NDErMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI1LTA4LTE0VDE4OjE1OjQxKzAxOjAwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjY5ZDM4YmM1LTM4ZTAtNDI0Ny1hMzA0LTNmODM3NzM3NzM3NyIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjY5ZDM4YmM1LTM4ZTAtNDI0Ny1hMzA0LTNmODM3NzM3NzM3NyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjY5ZDM4YmM1LTM4ZTAtNDI0Ny1hMzA0LTNmODM3NzM3NzM3NyIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjY5ZDM4YmM1LTM4ZTAtNDI0Ny1hMzA0LTNmODM3NzM3NzM3NyIgc3RFdnQ6d2hlbj0iMjAyNS0wOC0xNFQxODoxNTo0MSswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjAgKE1hY2ludG9zaCkiLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+';

// Helper function to add LOD logo and header with EMBEDDED logo
async function addLODHeader(doc: jsPDF, title: string, pageNumber?: number) {
  // Header background - MINT GREEN BANNER
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, PAGE_WIDTH, 35, 'F');
  
  // Add the EMBEDDED WHITE logo image on top of mint banner
  try {
    doc.addImage(LOD_LOGO_BASE64, 'PNG', 25, 8, 50, 20);
  } catch (error) {
    // Fallback to text if image fails
    console.warn('Could not load embedded logo, using text fallback');
    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('LAWYERS ON DEMAND', 25, 18);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('A Consilio COMPANY', 25, 25);
  }
  
  // Title with better positioning - WHITE TEXT on mint background
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.text(title, PAGE_WIDTH / 2, 22, { align: 'center' });
  
  // Page number if provided - WHITE TEXT on mint background
  if (pageNumber) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.text(`Page ${pageNumber}`, PAGE_WIDTH - 25, 18, { align: 'right' });
  }
  
  // Reset text color
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
}

// Helper function to add modern section header
function addSectionHeader(doc: jsPDF, title: string, y: number) {
  // Modern section header with accent
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(MARGINS.left, y, 4, 12, 'F');
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.text(title, MARGINS.left + 10, y + 9);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  
  return y + 18;
}

// Helper function to add competency headers
function addCompetencyHeaders(doc: jsPDF, reflection: Reflection, y: number) {
  let currentY = y;
  
  // High Level Competency Header
  const highLevelCount = reflection.highLevelAreas.length;
  const highLevelText = highLevelCount === 1 ? 'High Level Competency:' : 'High Level Competencies:';
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.text(highLevelText, MARGINS.left, currentY);
  currentY += 6;
  
  // List high level competencies
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  
  reflection.highLevelAreas.forEach(area => {
    const description = COMPETENCY_DESCRIPTIONS[area as keyof typeof COMPETENCY_DESCRIPTIONS];
    const text = `${area}. ${description}`;
    const wrappedLines = doc.splitTextToSize(text, CONTENT_WIDTH - 10);
    wrappedLines.forEach((line: string) => {
      doc.text(line, MARGINS.left + 5, currentY);
      currentY += 4;
    });
    currentY += 2;
  });
  
  currentY += 4;
  
  // Low Level Competency Header
  const lowLevelCount = reflection.lowLevelCompetencies.length;
  const lowLevelText = lowLevelCount === 1 ? 'Low Level Competency:' : 'Low Level Competencies:';
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.text(lowLevelText, MARGINS.left, currentY);
  currentY += 6;
  
  // List low level competencies
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  
  reflection.lowLevelCompetencies.forEach(comp => {
    const description = LOW_LEVEL_DESCRIPTIONS[comp as keyof typeof LOW_LEVEL_DESCRIPTIONS];
    const text = `${comp}. ${description}`;
    const wrappedLines = doc.splitTextToSize(text, CONTENT_WIDTH - 10);
    wrappedLines.forEach((line: string) => {
      doc.text(line, MARGINS.left + 5, currentY);
      currentY += 4;
    });
    currentY += 2;
  });
  
  return currentY;
}

// Helper function to add modern info card with proper text wrapping
function addInfoCard(doc: jsPDF, title: string, content: string[], y: number) {
  const maxWidth = CONTENT_WIDTH - 10;
  
  // Calculate total height needed
  let totalHeight = 20; // Base height for title and padding
  
  content.forEach(line => {
    const wrappedLines = doc.splitTextToSize(line, maxWidth);
    totalHeight += wrappedLines.length * 4 + 2;
  });
  
  // Card background with modern styling
  doc.setFillColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.rect(MARGINS.left, y, CONTENT_WIDTH, totalHeight, 'F');
  doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
  doc.rect(MARGINS.left, y, CONTENT_WIDTH, totalHeight, 'S');
  
  // Accent line
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(MARGINS.left, y, CONTENT_WIDTH, 3, 'F');
  
  // Title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.text(title, MARGINS.left + 8, y + 10);
  
  // Content with proper text wrapping
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  
  let contentY = y + 18;
  content.forEach(line => {
    const wrappedLines = doc.splitTextToSize(line, maxWidth);
    wrappedLines.forEach((wrappedLine: string) => {
      doc.text(wrappedLine, MARGINS.left + 8, contentY);
      contentY += 4;
    });
    contentY += 2; // Extra spacing between items
  });
  
  return y + totalHeight + 12;
}

// Generate QWE Summary for the main report
export function generateQWESummary(data: AppData): string {
  let summary = 'QUALIFIED WORK EXPERIENCE SUMMARY\n';
  summary += '=====================================\n\n';
  
  data.periods.forEach((period, index) => {
    const startDate = new Date(period.startDate).toLocaleDateString();
    const endDate = new Date(period.endDate).toLocaleDateString();
    const months = Math.ceil((new Date(period.endDate).getTime() - new Date(period.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    summary += `${index + 1}. ${period.companyName}\n`;
    summary += `   Position: ${period.jobTitle}\n`;
    summary += `   Period: ${startDate} - ${endDate} (${months} months)\n`;
    summary += `   Confirming Solicitor: ${period.confirmingSolicitor.fullName}\n`;
    summary += `   SRA Number: ${period.confirmingSolicitor.sraNumber}\n`;
    summary += `   Reflections Completed: ${period.reflections.length}\n\n`;
  });
  
  const totalMonths = data.periods.reduce((total, period) => {
    const months = Math.ceil((new Date(period.endDate).getTime() - new Date(period.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
    return total + months;
  }, 0);
  
  summary += `TOTAL EXPERIENCE: ${totalMonths} months across ${data.periods.length} periods\n`;
  summary += `TOTAL REFLECTIONS: ${data.periods.reduce((total, period) => total + period.reflections.length, 0)}\n\n`;
  
  return summary;
}

// Generate Reflections Summary
export function generateReflectionsSummary(data: AppData): string {
  let summary = '\nREFLECTIONS SUMMARY\n';
  summary += '==================\n\n';
  
  data.periods.forEach((period, periodIndex) => {
    summary += `${period.companyName} (${period.reflections.length} reflections):\n`;
    
    period.reflections.forEach((reflection, index) => {
      summary += `  ${index + 1}. ${reflection.projectName}\n`;
      summary += `     Date: ${new Date(reflection.loggedOn).toLocaleDateString()}\n`;
      
      // Add high-level areas
      reflection.highLevelAreas.forEach(area => {
        summary += `     High Level: ${area} - ${COMPETENCY_DESCRIPTIONS[area as keyof typeof COMPETENCY_DESCRIPTIONS]}\n`;
      });
      
      // Add low-level competencies
      reflection.lowLevelCompetencies.forEach(comp => {
        summary += `     Low Level: ${comp} - ${LOW_LEVEL_DESCRIPTIONS[comp as keyof typeof LOW_LEVEL_DESCRIPTIONS]}\n`;
      });
      
      summary += '\n';
    });
  });
  
  return summary;
}

// Generate Email Template
export function generateEmailTemplate(data: AppData, solicitorDetails: { name: string; sraNumber: string; email: string }) {
  const subject = 'QWE Period Sign-off Request';
  
  const body = `Dear ${solicitorDetails.name},

I hope this email finds you well.

I am writing to request your sign-off for my Qualified Work Experience (QWE) periods. I have completed ${data.periods.length} periods of QWE totaling ${data.periods.reduce((total, period) => {
    const months = Math.ceil((new Date(period.endDate).getTime() - new Date(period.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
    return total + months;
  }, 0)} months of experience.

Please find attached a detailed report of my QWE periods, including all reflections and competency mappings.

I would be grateful if you could review the attached documentation and confirm that:
1. The work described accurately reflects my role and responsibilities
2. I have demonstrated the required competencies to a satisfactory standard
3. You are satisfied with the quality and depth of my reflections

Please let me know if you require any additional information or have any questions.

Thank you for your time and support.

Best regards,
[Your Name]

---
SRA Number: ${solicitorDetails.sraNumber}
Email: ${solicitorDetails.email}`;

  return { subject, body };
}

// Download as PDF function
export async function downloadAsPDF(content: string, filename: string) {
  const doc = new jsPDF();
  
  // Add header
  await addLODHeader(doc, 'QWE Report');
  
  // Add content with proper text wrapping
  doc.setFontSize(10);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  
  const lines = doc.splitTextToSize(content, CONTENT_WIDTH);
  let y = MARGINS.top + 10;
  
  for (const line of lines) {
    if (y > 265) {
      doc.addPage();
      await addLODHeader(doc, 'QWE Report');
      y = MARGINS.top + 10;
    }
    doc.text(line, MARGINS.left, y);
    y += 5;
  }
  
  // Add footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated ${new Date().toLocaleDateString()} • LOD QWE Tracker`, PAGE_WIDTH / 2, 280, { align: 'center' });
  
  doc.save(filename.replace('.txt', '.pdf'));
}

// Open Email Client
export function openEmailClient(subject: string, body: string) {
  const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoLink);
}

// Generate comprehensive QWE PDF report with modern design
export async function generateComprehensiveQWEReport(data: AppData): Promise<void> {
  const doc = new jsPDF();
  let currentPage = 1;
  
  // Title Page with modern design
  await addLODHeader(doc, 'Qualified Work Experience Report', currentPage);
  
  let y = MARGINS.top + 25;
  
  // Main title with modern typography
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.text('Qualified Work Experience', PAGE_WIDTH / 2, y, { align: 'center' });
  
  y += 20;
  doc.setFontSize(18);
  doc.text('Comprehensive Report', PAGE_WIDTH / 2, y, { align: 'center' });
  
  y += 35;
  
  // Summary statistics with modern cards
  const totalMonths = data.periods.reduce((total, period) => {
    const months = Math.ceil((new Date(period.endDate).getTime() - new Date(period.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
    return total + months;
  }, 0);
  
  const totalReflections = data.periods.reduce((total, period) => total + period.reflections.length, 0);
  
  y = addInfoCard(doc, 'EXPERIENCE SUMMARY', [
    `Total Periods: ${data.periods.length}`,
    `Total Months: ${totalMonths}`,
    `Total Reflections: ${totalReflections}`,
    `Report Date: ${new Date().toLocaleDateString()}`
  ], y);
  
  y += 20;
  
  // Competency overview with descriptions and proper text wrapping
  const competencyCounts: Record<string, number> = {};
  const highLevelCounts: Record<string, number> = {};
  
  data.periods.forEach(period => {
    period.reflections.forEach(reflection => {
      // Count low-level competencies
      reflection.lowLevelCompetencies.forEach(comp => {
        competencyCounts[comp] = (competencyCounts[comp] || 0) + 1;
      });
      
      // Count high-level areas
      reflection.highLevelAreas.forEach(area => {
        highLevelCounts[area] = (highLevelCounts[area] || 0) + 1;
      });
    });
  });
  
  // Create detailed competency summary with proper formatting
  const competencySummary: string[] = [];
  
  // Add high-level areas first
  Object.entries(highLevelCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([area, count]) => {
      competencySummary.push(`${area}: ${COMPETENCY_DESCRIPTIONS[area as keyof typeof COMPETENCY_DESCRIPTIONS]} (${count} reflections)`);
    });
  
  competencySummary.push(''); // Empty line for spacing
  
  // Add low-level competencies with descriptions
  Object.entries(competencyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([comp, count]) => {
      const description = LOW_LEVEL_DESCRIPTIONS[comp as keyof typeof LOW_LEVEL_DESCRIPTIONS];
      competencySummary.push(`${comp}: ${description} (${count} reflections)`);
    });
  
  y = addInfoCard(doc, 'COMPETENCY COVERAGE', competencySummary, y);
  
  // Add new page for detailed periods
  doc.addPage();
  currentPage++;
  
  // Process each period with modern design
  for (let periodIndex = 0; periodIndex < data.periods.length; periodIndex++) {
    const period = data.periods[periodIndex];
    
    if (periodIndex > 0) {
      doc.addPage();
      currentPage++;
    }
    
    await addLODHeader(doc, 'QWE Period Details', currentPage);
    let y = MARGINS.top + 10;
    
    // Period header with modern styling
    y = addSectionHeader(doc, `PERIOD ${periodIndex + 1}: ${period.companyName}`, y);
    
    // Period details with proper text wrapping - REMOVED ASSIGNMENT TYPE
    const startDate = new Date(period.startDate).toLocaleDateString();
    const endDate = new Date(period.endDate).toLocaleDateString();
    const months = Math.ceil((new Date(period.endDate).getTime() - new Date(period.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    y = addInfoCard(doc, 'PERIOD INFORMATION', [
      `Company: ${period.companyName}`,
      `Position: ${period.jobTitle}`,
      `Period: ${startDate} - ${endDate} (${months} months)`,
      `Reflections: ${period.reflections.length}`
    ], y);
    
    y = addInfoCard(doc, 'CONFIRMING SOLICITOR', [
      `Name: ${period.confirmingSolicitor.fullName}`,
      `SRA Number: ${period.confirmingSolicitor.sraNumber}`,
      `Email: ${period.confirmingSolicitor.email}`
    ], y);
    
    // Add reflections if any with modern formatting and proper competency headers
    if (period.reflections.length > 0) {
      y += 10;
      y = addSectionHeader(doc, 'REFLECTIONS', y);
      
      for (let index = 0; index < period.reflections.length; index++) {
        const reflection = period.reflections[index];
        
        // Only create new page if absolutely necessary (content will overflow)
        const reflectionTitle = `Reflection ${index + 1}: ${reflection.projectName}`;
        const reflectionDate = new Date(reflection.loggedOn).toLocaleDateString();
        
        // Calculate approximate height needed for this reflection
        const titleHeight = 15;
        const competencyHeight = (reflection.highLevelAreas.length + reflection.lowLevelCompetencies.length) * 15;
        const activityHeight = doc.splitTextToSize(reflection.activity, CONTENT_WIDTH - 10).length * 4;
        const outcomeHeight = doc.splitTextToSize(reflection.outcome || 'Not specified', CONTENT_WIDTH - 10).length * 4;
        const learningHeight = doc.splitTextToSize(reflection.learning, CONTENT_WIDTH - 10).length * 4;
        const totalReflectionHeight = titleHeight + competencyHeight + activityHeight + outcomeHeight + learningHeight + 50;
        
        // Only create new page if content will definitely overflow
        if (y + totalReflectionHeight > 270) {
          doc.addPage();
          currentPage++;
          await addLODHeader(doc, 'QWE Period Details', currentPage);
          y = MARGINS.top + 10;
        }
        
        // Add reflection card
        y = addInfoCard(doc, reflectionTitle, [
          `Date: ${reflectionDate}`
        ], y);
        
        // Add competency headers with proper formatting
        y = addCompetencyHeaders(doc, reflection, y);
        
        // Add activity, outcome, and learning with proper text wrapping
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
        doc.text('Activity:', MARGINS.left, y);
        y += 6;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
        const activityLines = doc.splitTextToSize(reflection.activity, CONTENT_WIDTH - 10);
        for (const line of activityLines) {
          doc.text(line, MARGINS.left + 5, y);
          y += 4;
        }
        y += 6;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
        doc.text('Outcome:', MARGINS.left, y);
        y += 6;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
        const outcomeLines = doc.splitTextToSize(reflection.outcome || 'Not specified', CONTENT_WIDTH - 10);
        for (const line of outcomeLines) {
          doc.text(line, MARGINS.left + 5, y);
          y += 4;
        }
        y += 6;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
        doc.text('Learning:', MARGINS.left, y);
        y += 6;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
        const learningLines = doc.splitTextToSize(reflection.learning, CONTENT_WIDTH - 10);
        for (const line of learningLines) {
          doc.text(line, MARGINS.left + 5, y);
          y += 4;
        }
        
        y += 15; // Extra spacing between reflections
      }
    }
  }
  
  // Add footer to all pages with modern styling
  for (let i = 1; i <= currentPage; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated ${new Date().toLocaleDateString()} • LOD QWE Tracker`, PAGE_WIDTH / 2, 280, { align: 'center' });
  }
  
  // Save the PDF
  const filename = `QWE_Comprehensive_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

// Legacy function for individual period export (keeping for compatibility)
export function exportQwePeriodToPDF(period: QwePeriod): void {
  const doc = new jsPDF();
  
  addLODHeader(doc, 'QWE Period Report');
  
  let y = MARGINS.top + 10;
  
  // Period details
  y = addSectionHeader(doc, 'PERIOD DETAILS', y);
  
  const startDate = new Date(period.startDate).toLocaleDateString();
  const endDate = new Date(period.endDate).toLocaleDateString();
  const months = Math.ceil((new Date(period.endDate).getTime() - new Date(period.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
  
  y = addInfoCard(doc, 'PERIOD INFORMATION', [
    `Company: ${period.companyName}`,
    `Position: ${period.jobTitle}`,
    `Period: ${startDate} - ${endDate} (${months} months)`,
    `Reflections: ${period.reflections.length}`
  ], y);
  
  y = addInfoCard(doc, 'CONFIRMING SOLICITOR', [
    `Name: ${period.confirmingSolicitor.fullName}`,
    `SRA Number: ${period.confirmingSolicitor.sraNumber}`,
    `Email: ${period.confirmingSolicitor.email}`
  ], y);
  
  // Add reflections
  if (period.reflections.length > 0) {
    y += 10;
    y = addSectionHeader(doc, 'REFLECTIONS', y);
    
    period.reflections.forEach((reflection, index) => {
      if (y > 245) {
        doc.addPage();
        addLODHeader(doc, 'QWE Period Report');
        y = MARGINS.top + 10;
      }
      
      const reflectionTitle = `Reflection ${index + 1}: ${reflection.projectName}`;
      const reflectionDate = new Date(reflection.loggedOn).toLocaleDateString();
      
      // Create detailed competency information
      const competencyDetails: string[] = [];
      reflection.highLevelAreas.forEach(area => {
        competencyDetails.push(`High Level: ${area} - ${COMPETENCY_DESCRIPTIONS[area as keyof typeof COMPETENCY_DESCRIPTIONS]}`);
      });
      reflection.lowLevelCompetencies.forEach(comp => {
        competencyDetails.push(`Low Level: ${comp} - ${LOW_LEVEL_DESCRIPTIONS[comp as keyof typeof LOW_LEVEL_DESCRIPTIONS]}`);
      });
      
      y = addInfoCard(doc, reflectionTitle, [
        `Date: ${reflectionDate}`,
        ...competencyDetails,
        `Activity: ${reflection.activity}`,
        `Outcome: ${reflection.outcome || 'Not specified'}`,
        `Learning: ${reflection.learning}`
      ], y);
    });
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated ${new Date().toLocaleDateString()} • LOD QWE Tracker`, PAGE_WIDTH / 2, 280, { align: 'center' });
  
  const filename = `QWE_Period_${period.companyName}_${new Date().getFullYear()}.pdf`;
  doc.save(filename);
}

// Generate sign-off email
export function generateSignOffEmail(period: QwePeriod): void {
  const recipientEmail = period.assignmentType === 'LOD' 
    ? 'lottie.henville-miller@lodlaw.com'
    : period.confirmingSolicitor.email;
  
  const subject = `QWE Period Sign-off Request - ${period.companyName}`;
  
  const body = `Dear ${period.confirmingSolicitor.fullName},

I hope this email finds you well.

I am writing to request your sign-off for my Qualified Work Experience (QWE) period at ${period.companyName}, where I worked as ${period.jobTitle} from ${new Date(period.startDate).toLocaleDateString()} to ${new Date(period.endDate).toLocaleDateString()}.

During this period, I have completed ${period.reflections.length} reflections covering various aspects of legal practice, which demonstrate my development across the required competency areas.

Please find attached a detailed report of my QWE period, including all reflections and competency mappings.

I would be grateful if you could review the attached documentation and confirm that:
1. The work described accurately reflects my role and responsibilities
2. I have demonstrated the required competencies to a satisfactory standard
3. You are satisfied with the quality and depth of my reflections

Please let me know if you require any additional information or have any questions.

Thank you for your time and support.

Best regards,
[Your Name]

---
SRA Number: ${period.confirmingSolicitor.sraNumber}
Assignment Type: ${period.assignmentType}
Period: ${new Date(period.startDate).toLocaleDateString()} - ${new Date(period.endDate).toLocaleDateString()}`;

  const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoLink);
}

