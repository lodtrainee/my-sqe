import jsPDF from 'jspdf';
import { QwePeriod, Reflection } from './types';

// Function to add the LOD logo
function addLODLogo(doc: jsPDF, x: number, y: number, width: number, height: number) {
  // For now, use a stylized text logo that looks professional
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LAWYERS ON DEMAND', x + width/2, y + height/2 + 2, { align: 'center' });
}

export function exportQwePeriodToPDF(period: QwePeriod): void {
  const doc = new jsPDF();
  
  // Set up fonts and styling
  doc.setFont('helvetica');
  
  // HEADER
  doc.setFillColor(26, 191, 155); // LOD mint
  doc.rect(0, 0, 210, 30, 'F');
  
  // LOD Logo
  addLODLogo(doc, 20, 5, 80, 20);
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('QWE REPORT', 105, 20, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(28, 46, 75); // Dark blueberry color
  
  // SUMMARY SECTION
  // Company Info Card
  doc.setFillColor(255, 255, 255);
  doc.rect(20, 40, 170, 35, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(20, 40, 170, 35, 'S');
  
  // Accent line
  doc.setFillColor(26, 191, 155);
  doc.rect(20, 40, 170, 2, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PERIOD SUMMARY', 25, 52);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  doc.text(`${period.companyName}`, 25, 60);
  doc.text(`${period.jobTitle} • ${period.assignmentType}`, 25, 67);
  doc.text(`${new Date(period.startDate).toLocaleDateString()} - ${new Date(period.endDate).toLocaleDateString()}`, 25, 74);
  
  // Solicitor Card
  doc.setFillColor(255, 255, 255);
  doc.rect(20, 85, 170, 25, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(20, 85, 170, 25, 'S');
  
  // Accent line
  doc.setFillColor(26, 191, 155);
  doc.rect(20, 85, 170, 2, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CONFIRMING SOLICITOR', 25, 97);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  doc.text(`${period.confirmingSolicitor.fullName}`, 25, 105);
  doc.text(`SRA: ${period.confirmingSolicitor.sraNumber} • ${period.confirmingSolicitor.email}`, 25, 112);
  
  // REFLECTIONS SECTION
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('REFLECTIONS', 20, 130);
  doc.setFont('helvetica', 'normal');
  
  let yPosition = 140;
  let pageNumber = 1;
  
  period.reflections.forEach((reflection, index) => {
    // Check if we need a new page - VERY conservative page break
    if (yPosition > 200) {
      doc.addPage();
      pageNumber++;
      yPosition = 30;
      
      // Page header
      doc.setFillColor(26, 191, 155);
      doc.rect(0, 0, 210, 15, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${period.companyName} • Page ${pageNumber}`, 105, 9, { align: 'center' });
      doc.setTextColor(28, 46, 75);
      doc.setFont('helvetica', 'normal');
    }
    
    // Reflection card
    doc.setFillColor(255, 255, 255);
    doc.rect(20, yPosition, 170, 50, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(20, yPosition, 170, 50, 'S');
    
    // Accent line
    doc.setFillColor(26, 191, 155);
    doc.rect(20, yPosition, 170, 2, 'F');
    
    // Reflection number
    doc.setFillColor(26, 191, 155);
    doc.circle(35, yPosition + 8, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}`, 35, yPosition + 11, { align: 'center' });
    
    // Project title
    doc.setTextColor(28, 46, 75);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(reflection.projectName, 50, yPosition + 11);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    // Content sections - SIMPLIFIED and FIXED
    const sections = [
      { label: 'What did you do', content: reflection.activity },
      { label: 'What was the outcome', content: reflection.outcome || "Not specified" },
      { label: 'What did you learn', content: reflection.learning }
    ];
    
    let contentY = yPosition + 15;
    sections.forEach((section) => {
      // Section label
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 191, 155);
      doc.text(section.label.toUpperCase(), 25, contentY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(28, 46, 75);
      
      // Content with proper wrapping - NARROWER text area to prevent overflow
      const lines = doc.splitTextToSize(section.content, 130);
      doc.text(lines, 25, contentY + 3);
      
      contentY += (lines.length * 3) + 5;
    });
    
    // Calculate height and move to next position - SIMPLIFIED calculation
    const totalHeight = Math.max(50, contentY - yPosition + 5);
    yPosition += totalHeight + 8;
  });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated ${new Date().toLocaleDateString()} • LOD QWE Tracker`, 105, 280, { align: 'center' });
  
  // Save the PDF
  const fileName = `QWE_Period_${period.companyName}_${new Date().getFullYear()}.pdf`;
  doc.save(fileName);
}

export function generateSignOffEmail(period: QwePeriod): void {
  // Determine recipient email
  const recipientEmail = period.assignmentType === 'LOD' 
    ? 'lottie.henville-miller@lodlaw.com'
    : period.confirmingSolicitor.email;
  
  // Email template
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

  // Create mailto link
  const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  // Open email client
  window.open(mailtoLink);
}

