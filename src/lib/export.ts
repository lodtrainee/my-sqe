import jsPDF from 'jspdf';
import { QwePeriod, Reflection } from './types';

// Function to add the LOD logo (simplified approach)
function addLODLogo(doc: jsPDF, x: number, y: number, width: number, height: number) {
  // For now, use a stylized text logo that matches the app's vibe
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('LAWYERS ON DEMAND', x + width/2, y + height/2 + 3, { align: 'center' });
}

export function exportQwePeriodToPDF(period: QwePeriod): void {
  const doc = new jsPDF();
  
  // Set up fonts and styling
  doc.setFont('helvetica');
  
  // SLICK HEADER - Modern gradient background
  const gradient = doc.setFillColor(26, 191, 155); // LOD mint
  doc.rect(0, 0, 210, 40, 'F');
  
  // Add subtle gradient effect with darker overlay
  doc.setFillColor(18, 199, 179, 0.3); // Semi-transparent overlay
  doc.rect(0, 0, 210, 40, 'F');
  
  // LOD Logo - Using actual logo file
  addLODLogo(doc, 20, 8, 60, 24);
  
  // Modern title with gradient text effect
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('QWE REPORT', 105, 35, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(28, 46, 75); // Dark blueberry color
  
  // MODERN SUMMARY CARDS - Slick pill-shaped design
  // Company Info Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 50, 170, 45, 8, 8, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 50, 170, 45, 8, 8, 'S');
  
  // Gradient accent line
  doc.setFillColor(26, 191, 155);
  doc.rect(20, 50, 170, 3, 'F');
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PERIOD SUMMARY', 25, 65);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  doc.text(`${period.companyName}`, 25, 75);
  doc.text(`${period.jobTitle} • ${period.assignmentType}`, 25, 82);
  doc.text(`${new Date(period.startDate).toLocaleDateString()} - ${new Date(period.endDate).toLocaleDateString()}`, 25, 89);
  
  // Solicitor Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 105, 170, 35, 8, 8, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, 105, 170, 35, 8, 8, 'S');
  
  // Gradient accent line
  doc.setFillColor(26, 191, 155);
  doc.rect(20, 105, 170, 3, 'F');
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CONFIRMING SOLICITOR', 25, 120);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  doc.text(`${period.confirmingSolicitor.fullName}`, 25, 130);
  doc.text(`SRA: ${period.confirmingSolicitor.sraNumber} • ${period.confirmingSolicitor.email}`, 25, 137);
  
  // REFLECTIONS SECTION - Modern card design
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('REFLECTIONS', 20, 155);
  doc.setFont('helvetica', 'normal');
  
  let yPosition = 165;
  let pageNumber = 1;
  
  period.reflections.forEach((reflection, index) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      pageNumber++;
      yPosition = 30;
      
      // SLICK PAGE HEADER
      doc.setFillColor(26, 191, 155);
      doc.rect(0, 0, 210, 25, 'F');
      doc.setFillColor(18, 199, 179, 0.3);
      doc.rect(0, 0, 210, 25, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${period.companyName} • Page ${pageNumber}`, 105, 15, { align: 'center' });
      doc.setTextColor(28, 46, 75);
      doc.setFont('helvetica', 'normal');
    }
    
    // MODERN REFLECTION CARD - Slick design with shadows
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(20, yPosition, 170, 80, 12, 12, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(20, yPosition, 170, 80, 12, 12, 'S');
    
    // Gradient accent line
    doc.setFillColor(26, 191, 155);
    doc.roundedRect(20, yPosition, 170, 4, 12, 12, 'F');
    
    // Reflection number badge
    doc.setFillColor(26, 191, 155);
    doc.circle(35, yPosition + 12, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}`, 35, yPosition + 15, { align: 'center' });
    
    // Project title
    doc.setTextColor(28, 46, 75);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(reflection.projectName, 50, yPosition + 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Content sections with modern styling
    const sections = [
      { label: 'What did you do', content: reflection.activity },
      { label: 'What was the outcome', content: reflection.outcome || "Not specified" },
      { label: 'What did you learn', content: reflection.learning }
    ];
    
    let contentY = yPosition + 25;
    sections.forEach((section, sectionIndex) => {
      // Section label with accent
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 191, 155);
      doc.text(section.label.toUpperCase(), 25, contentY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(28, 46, 75);
      
      // Content with proper wrapping
      const lines = doc.splitTextToSize(section.content, 150);
      doc.text(lines, 25, contentY + 5);
      
      contentY += (lines.length * 4) + 8;
    });
    
    // Calculate dynamic height
    const totalHeight = Math.max(80, contentY - yPosition + 10);
    yPosition += totalHeight + 15;
  });
  
  // SLICK FOOTER
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 270, 210, 30, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(0, 270, 210, 30, 'S');
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated ${new Date().toLocaleDateString()} • LOD QWE Tracker`, 105, 285, { align: 'center' });
  
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

