import html2pdf from 'html2pdf.js';
import { marked } from 'marked';

/**
 * Generate and download PDF from roadmap content using html2pdf.js
 */
export const generatePDF = async (roadmapContent, userInputs) => {
    try {
        // Convert markdown to HTML
        const htmlContent = marked(roadmapContent);

        // Create a temporary container for the PDF content
        const container = document.createElement('div');
        container.style.width = '800px'; // Fixed width for A4 consistency
        container.style.padding = '40px';
        container.style.fontFamily = 'Helvetica, Arial, sans-serif';
        container.style.color = '#334155'; // Slate-700
        container.style.background = '#ffffff';

        // Build the HTML structure
        container.innerHTML = `
            <div style="margin-bottom: 30px; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px;">
                <h1 style="color: #1e3a8a; font-size: 28px; margin: 0; font-weight: bold;">CareerFix.AI</h1>
                <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">Your Personalized Career Roadmap</p>
                <p style="color: #0f172a; font-size: 12px; margin: 10px 0 0 0;">Prepared for: <strong>${userInputs.name || 'Future Professional'}</strong></p>
            </div>

            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
                <div style="margin-bottom: 10px;">
                    <span style="color: #1e3a8a; font-weight: bold; font-size: 14px;">Current Role:</span>
                    <span style="color: #334155; font-size: 14px; margin-left: 5px;">${userInputs.currentRole}</span>
                </div>
                <div style="margin-bottom: 10px;">
                    <span style="color: #1e3a8a; font-weight: bold; font-size: 14px;">Career Goal:</span>
                    <span style="color: #334155; font-size: 14px; margin-left: 5px;">${userInputs.careerGoal}</span>
                </div>
                <div style="margin-bottom: 10px;">
                    <span style="color: #1e3a8a; font-weight: bold; font-size: 14px;">Timeline:</span>
                    <span style="color: #334155; font-size: 14px; margin-left: 5px;">${userInputs.timeline}</span>
                </div>
                <div>
                    <span style="color: #1e3a8a; font-weight: bold; font-size: 14px;">Skills:</span>
                    <span style="color: #334155; font-size: 14px; margin-left: 5px;">${userInputs.skills}</span>
                </div>
            </div>

            <div class="roadmap-content" style="font-size: 14px; line-height: 1.6;">
                ${htmlContent}
            </div>


        `;

        // Add custom styles for the markdown content
        const style = document.createElement('style');
        style.innerHTML = `
            .roadmap-content h1 { color: #1e3a8a; font-size: 24px; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
            .roadmap-content h2 { color: #1e3a8a; font-size: 20px; margin-top: 25px; margin-bottom: 12px; }
            .roadmap-content h3 { color: #0f172a; font-size: 18px; margin-top: 20px; margin-bottom: 10px; font-weight: bold; }
            .roadmap-content h4 { color: #334155; font-size: 16px; margin-top: 15px; margin-bottom: 8px; font-weight: bold; }
            .roadmap-content p { margin-bottom: 12px; text-align: justify; }
            .roadmap-content ul, .roadmap-content ol { margin-bottom: 15px; padding-left: 20px; }
            .roadmap-content li { margin-bottom: 5px; }
            .roadmap-content strong { color: #0f172a; font-weight: bold; }
            .roadmap-content em { font-style: italic; color: #475569; }
        `;
        container.appendChild(style);

        // Generate PDF options
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `CareerRoadmap_${userInputs.careerGoal.replace(/\s+/g, '_')}_${timestamp}.pdf`;

        const opt = {
            margin: [10, 10, 20, 10], // top, left, bottom (increased for footer), right
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        // Generate and save
        await html2pdf().set(opt).from(container).toPdf().get('pdf').then((pdf) => {
            const totalPages = pdf.internal.getNumberOfPages();
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(8);
                pdf.setTextColor(150, 150, 150);

                // Add footer text with link
                pdf.textWithLink('Generated by CareerFix.AI', pageWidth / 2 - 15, pageHeight - 10, { url: window.location.origin });
                pdf.text(` • Page ${i} of ${totalPages}`, pageWidth / 2 + 15, pageHeight - 10);
            }
        }).save();

        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF. Please try again.');
    }
};
