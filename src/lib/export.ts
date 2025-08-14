import jsPDF from 'jspdf';
import { QwePeriod, Reflection } from './types';

export function exportQwePeriodToPDF(period: QwePeriod): void {
  const doc = new jsPDF();
  
  // Set up fonts and styling
  doc.setFont('helvetica');
  
  // Header with LOD branding
  doc.setFillColor(26, 191, 155); // LOD mint color
  doc.rect(0, 0, 210, 30, 'F');
  
  // Logo placeholder (you can replace this with actual logo)
  doc.setFillColor(255, 255, 255);
  doc.rect(20, 8, 40, 14, 'F');
  doc.setTextColor(26, 191, 155);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('LOD', 40, 17, { align: 'center' });
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('QWE Period Report', 105, 20, { align: 'center' });
  
  // Reset text color and font
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  // Summary section with modern styling
  doc.setFillColor(248, 250, 252); // Light gray background
  doc.rect(20, 40, 170, 50, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(20, 40, 170, 50, 'S');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Period Summary', 25, 55);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  doc.text(`Company: ${period.companyName}`, 25, 65);
  doc.text(`Position: ${period.jobTitle}`, 25, 72);
  doc.text(`Period: ${new Date(period.startDate).toLocaleDateString()} - ${new Date(period.endDate).toLocaleDateString()}`, 25, 79);
  doc.text(`Assignment Type: ${period.assignmentType}`, 25, 86);
  
  // Confirming Solicitor section
  doc.setFillColor(248, 250, 252);
  doc.rect(20, 100, 170, 35, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(20, 100, 170, 35, 'S');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Confirming Solicitor', 25, 115);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  doc.text(`Name: ${period.confirmingSolicitor.fullName}`, 25, 125);
  doc.text(`SRA Number: ${period.confirmingSolicitor.sraNumber}`, 25, 132);
  doc.text(`Email: ${period.confirmingSolicitor.email}`, 25, 139);
  
  // Reflections section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Reflections', 20, 155);
  doc.setFont('helvetica', 'normal');
  
  let yPosition = 165;
  let pageNumber = 1;
  
  period.reflections.forEach((reflection, index) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      pageNumber++;
      yPosition = 30;
      
      // Add header to new page
      doc.setFillColor(26, 191, 155);
      doc.rect(0, 0, 210, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`QWE Period Report - ${period.companyName}`, 105, 12, { align: 'center' });
      doc.text(`Page ${pageNumber}`, 190, 12, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
    }
    
    // Reflection card styling
    doc.setFillColor(255, 255, 255);
    doc.rect(20, yPosition, 170, 60, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(20, yPosition, 170, 60, 'S');
    
    // Reflection title
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 191, 155);
    doc.text(`Reflection ${index + 1}: ${reflection.projectName}`, 25, yPosition + 8);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // What did you do
    doc.setFont('helvetica', 'bold');
    doc.text('What did you do:', 25, yPosition + 18);
    doc.setFont('helvetica', 'normal');
    
    const activityLines = doc.splitTextToSize(reflection.activity, 160);
    doc.text(activityLines, 25, yPosition + 24);
    const activityHeight = activityLines.length * 4;
    
    // What was the outcome
    doc.setFont('helvetica', 'bold');
    doc.text('What was the outcome:', 25, yPosition + 18 + activityHeight + 8);
    doc.setFont('helvetica', 'normal');
    
    const outcomeText = reflection.outcome || "Not specified";
    const outcomeLines = doc.splitTextToSize(outcomeText, 160);
    doc.text(outcomeLines, 25, yPosition + 18 + activityHeight + 14);
    const outcomeHeight = outcomeLines.length * 4;
    
    // What did you learn
    doc.setFont('helvetica', 'bold');
    doc.text('What did you learn:', 25, yPosition + 18 + activityHeight + 8 + outcomeHeight + 8);
    doc.setFont('helvetica', 'normal');
    
    const learningLines = doc.splitTextToSize(reflection.learning, 160);
    doc.text(learningLines, 25, yPosition + 18 + activityHeight + 8 + outcomeHeight + 14);
    const learningHeight = learningLines.length * 4;
    
    // Calculate total height for this reflection
    const totalReflectionHeight = Math.max(60, 18 + activityHeight + 8 + outcomeHeight + 8 + learningHeight + 10);
    
    yPosition += totalReflectionHeight + 10;
  });
  
  // Footer
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString()} by LOD QWE Tracker`, 20, 280);
  
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

