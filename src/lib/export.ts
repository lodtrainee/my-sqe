import jsPDF from 'jspdf';
import { QwePeriod, Reflection } from './types';

export function exportQwePeriodToPDF(period: QwePeriod): void {
  const doc = new jsPDF();
  
  // Set up fonts and styling
  doc.setFont('helvetica');
  doc.setFontSize(20);
  
  // Title
  doc.setFillColor(37, 99, 235); // Blue color
  doc.rect(20, 20, 170, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('QWE Period Report', 105, 27, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  
  // Company Information
  doc.setFontSize(16);
  doc.text('Company Information', 20, 50);
  doc.setFontSize(12);
  doc.text(`Company: ${period.companyName}`, 20, 65);
  doc.text(`Job Title: ${period.jobTitle}`, 20, 75);
  doc.text(`Start Date: ${new Date(period.startDate).toLocaleDateString()}`, 20, 85);
  doc.text(`End Date: ${new Date(period.endDate).toLocaleDateString()}`, 20, 95);
  doc.text(`Assignment Type: ${period.assignmentType}`, 20, 105);
  
  // Confirming Solicitor Information
  doc.setFontSize(16);
  doc.text('Confirming Solicitor', 20, 125);
  doc.setFontSize(12);
  doc.text(`Name: ${period.confirmingSolicitor.fullName}`, 20, 140);
  doc.text(`SRA Number: ${period.confirmingSolicitor.sraNumber}`, 20, 150);
  doc.text(`Email: ${period.confirmingSolicitor.email}`, 20, 160);
  
  // Reflections
  doc.setFontSize(16);
  doc.text('Reflections', 20, 180);
  doc.setFontSize(12);
  
  let yPosition = 195;
  period.reflections.forEach((reflection, index) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text(`Reflection ${index + 1}: ${reflection.projectName}`, 20, yPosition);
    doc.setFontSize(10);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.text('What did you do:', 20, yPosition);
    doc.setFontSize(10);
    yPosition += 7;
    
    // Split long text into multiple lines
    const activityLines = doc.splitTextToSize(reflection.activity, 170);
    doc.text(activityLines, 20, yPosition);
    yPosition += (activityLines.length * 5) + 5;
    
    doc.setFontSize(11);
    doc.text('What was the outcome:', 20, yPosition);
    doc.setFontSize(10);
    yPosition += 7;
    
    const outcomeText = reflection.outcome || "Not specified";
    const outcomeLines = doc.splitTextToSize(outcomeText, 170);
    doc.text(outcomeLines, 20, yPosition);
    yPosition += (outcomeLines.length * 5) + 5;
    
    doc.setFontSize(11);
    doc.text('What did you learn:', 20, yPosition);
    doc.setFontSize(10);
    yPosition += 7;
    
    const learningLines = doc.splitTextToSize(reflection.learning, 170);
    doc.text(learningLines, 20, yPosition);
    yPosition += (learningLines.length * 5) + 10;
    
    // Add separator line
    if (index < period.reflections.length - 1) {
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;
    }
  });
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 280);
  
  // Save the PDF
  const fileName = `QWE_Period_${period.companyName}_${new Date(period.startDate).getFullYear()}.pdf`;
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

