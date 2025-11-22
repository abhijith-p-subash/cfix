import jsPDF from 'jspdf';

/**
 * Generate and download PDF from roadmap content
 */
export const generatePDF = (roadmapContent, userInputs) => {
    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Set up fonts and colors
        const primaryColor = [30, 58, 138]; // Deep blue
        const secondaryColor = [71, 85, 105]; // Slate gray
        const accentColor = [5, 150, 105]; // Emerald

        let yPosition = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);

        // Add header with logo/branding
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('CareerFix.AI', margin, 20);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Your Personalized Career Roadmap', margin, 30);

        yPosition = 55;

        // Add user input summary box
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPosition, contentWidth, 35, 'F');

        doc.setTextColor(...secondaryColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');

        yPosition += 8;
        doc.text(`Current Role: `, margin + 5, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(userInputs.currentRole, margin + 35, yPosition);

        yPosition += 7;
        doc.setFont('helvetica', 'bold');
        doc.text(`Career Goal: `, margin + 5, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(userInputs.careerGoal, margin + 35, yPosition);

        yPosition += 7;
        doc.setFont('helvetica', 'bold');
        doc.text(`Timeline: `, margin + 5, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(userInputs.timeline, margin + 35, yPosition);

        yPosition += 7;
        doc.setFont('helvetica', 'bold');
        doc.text(`Skills: `, margin + 5, yPosition);
        doc.setFont('helvetica', 'normal');
        const skillsText = doc.splitTextToSize(userInputs.skills, contentWidth - 35);
        doc.text(skillsText, margin + 35, yPosition);

        yPosition += 20;

        // Process roadmap content
        doc.setTextColor(...secondaryColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Remove markdown and process text
        const lines = roadmapContent.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (!line) {
                yPosition += 4;
                continue;
            }

            // Check if we need a new page
            if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = 20;
            }

            // Handle headers
            if (line.startsWith('###')) {
                yPosition += 6;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.setTextColor(...accentColor);
                const headerText = line.replace(/^###\s*/, '');
                doc.text(headerText, margin, yPosition);
                yPosition += 7;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(...secondaryColor);
            }
            else if (line.startsWith('##')) {
                yPosition += 8;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(13);
                doc.setTextColor(...primaryColor);
                const headerText = line.replace(/^##\s*/, '');
                doc.text(headerText, margin, yPosition);
                yPosition += 7;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(...secondaryColor);
            }
            else if (line.startsWith('#')) {
                yPosition += 10;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.setTextColor(...primaryColor);
                const headerText = line.replace(/^#\s*/, '');
                doc.text(headerText, margin, yPosition);
                yPosition += 8;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(...secondaryColor);
            }
            // Handle bullet points
            else if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
                const bulletText = line.replace(/^[-•*]\s*/, '');
                const wrappedText = doc.splitTextToSize('• ' + bulletText, contentWidth - 5);
                doc.text(wrappedText, margin + 3, yPosition);
                yPosition += wrappedText.length * 5;
            }
            // Regular text
            else {
                // Remove markdown formatting
                let cleanLine = line
                    .replace(/\*\*/g, '')
                    .replace(/\*/g, '')
                    .replace(/`/g, '');

                const wrappedText = doc.splitTextToSize(cleanLine, contentWidth);
                doc.text(wrappedText, margin, yPosition);
                yPosition += wrappedText.length * 5;
            }
        }

        // Add footer on last page
        const totalPages = doc.internal.pages.length - 1;
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.setFont('helvetica', 'italic');
            doc.text(
                `Generated by CareerFix.AI • Page ${i} of ${totalPages}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
        }

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `CareerRoadmap_${userInputs.careerGoal.replace(/\s+/g, '_')}_${timestamp}.pdf`;

        // Download PDF
        doc.save(filename);

        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF. Please try again.');
    }
};
