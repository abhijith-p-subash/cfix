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
        container.style.width = '190mm'; // Page width minus left/right margins (10mm each)
        container.style.maxWidth = '190mm';
        container.style.boxSizing = 'border-box';
        container.style.padding = '10mm';
        container.style.fontFamily = 'Helvetica, Arial, sans-serif';
        container.style.color = '#334155'; // Slate-700
        container.style.background = '#ffffff';

        // Build the HTML structure
        container.innerHTML = `
            <div style="margin-bottom: 30px; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h1 style="color: #1e3a8a; font-size: 28px; margin: 0; font-weight: bold;">CareerFixAI</h1>
                    <a href="${window.location.origin}" style="color: #64748b; font-size: 12px; text-decoration: none; display: block; margin-top: 5px;">${window.location.origin}</a>
                </div>
                <div style="text-align: right;">
                    <p style="color: #64748b; font-size: 14px; margin: 0;">Your Personalized Career Roadmap</p>
                    <p style="color: #0f172a; font-size: 12px; margin: 5px 0 0 0;">Prepared for: <strong>${userInputs.name || 'Future Professional'}</strong></p>
                </div>
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
                        .roadmap-content { word-break: break-word; overflow-wrap: anywhere; }
            .roadmap-content h1 { color: #1e3a8a; font-size: 24px; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
            .roadmap-content h2 { color: #1e3a8a; font-size: 20px; margin-top: 25px; margin-bottom: 12px; }
            .roadmap-content h3 { color: #0f172a; font-size: 18px; margin-top: 20px; margin-bottom: 10px; font-weight: bold; }
            .roadmap-content h4 { color: #334155; font-size: 16px; margin-top: 15px; margin-bottom: 8px; font-weight: bold; }
            .roadmap-content p { margin-bottom: 12px; text-align: justify; }
            .roadmap-content ul, .roadmap-content ol { margin-bottom: 15px; padding-left: 20px; }
            .roadmap-content li { margin-bottom: 5px; }
            .roadmap-content strong { color: #0f172a; font-weight: bold; }
            .roadmap-content table { width: 100%; table-layout: fixed; word-break: break-word; overflow-wrap: anywhere; }
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

                // Footer: Left aligned "Generated by..."
                pdf.textWithLink('Generated by CareerFixAI', 10, pageHeight - 10, { url: window.location.origin });

                // Footer: Right aligned "Page X of Y"
                const pageText = `Page ${i} of ${totalPages}`;
                const textWidth = pdf.getTextWidth(pageText);
                pdf.text(pageText, pageWidth - 10 - textWidth, pageHeight - 10);
            }
        }).save();

        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF. Please try again.');
    }
};

/**
 * Generate and download Resume Review PDF
 */
/**
 * Generate and download Resume Review PDF
 */
export const generateResumePDF = async (reportData, userInputs) => {
    try {
        // reportData is now a JSON object
        const container = document.createElement('div');
        container.style.width = '190mm';
        container.style.maxWidth = '190mm';
        container.style.boxSizing = 'border-box';
        container.style.padding = '10mm';
        container.style.fontFamily = 'Helvetica, Arial, sans-serif';
        container.style.color = '#334155';
        container.style.background = '#ffffff';

        // Helper to generate score bar
        const generateScoreBar = (score, color) => `
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-weight: bold; font-size: 14px; color: #1e293b;">${score.label}</span>
                    <span style="font-weight: bold; font-size: 14px; color: ${color};">${score.value}/100</span>
                </div>
                <div style="width: 100%; height: 8px; background-color: #e2e8f0; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${score.value}%; height: 100%; background-color: ${color}; border-radius: 4px;"></div>
                </div>
            </div>
        `;

        container.innerHTML = `
            <div style="margin-bottom: 30px; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h1 style="color: #1e3a8a; font-size: 28px; margin: 0; font-weight: bold;">CareerFixAI</h1>
                    <a href="${window.location.origin}" style="color: #64748b; font-size: 12px; text-decoration: none; display: block; margin-top: 5px;">${window.location.origin}</a>
                </div>
                <div style="text-align: right;">
                    <p style="color: #64748b; font-size: 14px; margin: 0;">Resume Review Report</p>
                    <p style="color: #0f172a; font-size: 12px; margin: 5px 0 0 0;">Prepared for: <strong>${userInputs.name || 'User'}</strong></p>
                </div>
            </div>

            <!-- Summary Section -->
            <div style="margin-bottom: 30px;">
                <h2 style="color: #1e3a8a; font-size: 20px; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Executive Summary</h2>
                <p style="font-size: 14px; line-height: 1.6; color: #334155;">${reportData.summary}</p>
            </div>

            <!-- Scores Section -->
            <div style="margin-bottom: 30px; background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <h2 style="color: #1e3a8a; font-size: 18px; margin-bottom: 15px; margin-top: 0;">Performance Scores</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        ${generateScoreBar({ label: 'Overall Score', value: reportData.scores.overall }, '#3b82f6')}
                        ${generateScoreBar({ label: 'Impact Score', value: reportData.scores.impact }, '#22c55e')}
                    </div>
                    <div>
                        ${generateScoreBar({ label: 'ATS Compatibility', value: reportData.scores.ats }, '#a855f7')}
                        ${generateScoreBar({ label: 'Content Quality', value: reportData.scores.content }, '#f59e0b')}
                    </div>
                </div>
            </div>

            <!-- Detailed Analysis -->
            <div style="margin-bottom: 30px;">
                <h2 style="color: #1e3a8a; font-size: 20px; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Detailed Analysis</h2>
                
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #0f172a; font-size: 16px; font-weight: bold; margin-bottom: 8px;">Formatting & Structure</h3>
                    <p style="font-size: 14px; line-height: 1.6; margin: 0;">${reportData.detailedAnalysis.formatting}</p>
                </div>

                <div style="margin-bottom: 20px;">
                    <h3 style="color: #0f172a; font-size: 16px; font-weight: bold; margin-bottom: 8px;">Content Quality</h3>
                    <p style="font-size: 14px; line-height: 1.6; margin: 0;">${reportData.detailedAnalysis.content}</p>
                </div>

                <div style="margin-bottom: 20px;">
                    <h3 style="color: #0f172a; font-size: 16px; font-weight: bold; margin-bottom: 8px;">Grammar & Consistency</h3>
                    <p style="font-size: 14px; line-height: 1.6; margin: 0;">${reportData.detailedAnalysis.grammar}</p>
                </div>
            </div>

            <!-- ATS Optimization -->
            <div style="margin-bottom: 30px;">
                <h2 style="color: #1e3a8a; font-size: 20px; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">ATS Optimization</h2>
                
                <div style="margin-bottom: 15px;">
                    <strong style="color: #166534; font-size: 14px;">Keywords Found:</strong>
                    <p style="font-size: 14px; margin: 5px 0 0 0;">${reportData.atsOptimization.keywordsFound.join(', ')}</p>
                </div>

                <div style="margin-bottom: 15px;">
                    <strong style="color: #dc2626; font-size: 14px;">Missing Keywords:</strong>
                    <p style="font-size: 14px; margin: 5px 0 0 0;">${reportData.atsOptimization.missingKeywords.join(', ')}</p>
                </div>
            </div>

            <!-- Value Assessment -->
            <div style="margin-bottom: 30px; background-color: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <h2 style="color: #1e3a8a; font-size: 18px; margin-top: 0; margin-bottom: 10px;">Value Assessment</h2>
                <div style="display: flex; justify-content: space-between;">
                    <div>
                        <span style="font-size: 12px; color: #64748b; text-transform: uppercase;">Estimated Salary Range</span>
                        <p style="font-size: 18px; font-weight: bold; color: #0f172a; margin: 5px 0 0 0;">${reportData.valueAssessment.salaryRange}</p>
                    </div>
                    <div>
                        <span style="font-size: 12px; color: #64748b; text-transform: uppercase;">Market Demand</span>
                        <p style="font-size: 18px; font-weight: bold; color: #0f172a; margin: 5px 0 0 0;">${reportData.valueAssessment.marketDemand}</p>
                    </div>
                </div>
            </div>

            <!-- Improvements -->
            <div style="margin-bottom: 30px;">
                <h2 style="color: #1e3a8a; font-size: 20px; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Actionable Improvements</h2>
                <ul style="padding-left: 20px; margin: 0;">
                    ${reportData.improvements.map(item => `<li style="font-size: 14px; line-height: 1.6; margin-bottom: 8px; color: #334155;">${item}</li>`).join('')}
                </ul>
            </div>
        `;

        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `Resume_Review_${timestamp}.pdf`;

        const opt = {
            margin: [10, 10, 20, 10],
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        await html2pdf().set(opt).from(container).toPdf().get('pdf').then((pdf) => {
            const totalPages = pdf.internal.getNumberOfPages();
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(8);
                pdf.setTextColor(150, 150, 150);
                pdf.textWithLink('Generated by CareerFixAI', 10, pageHeight - 10, { url: window.location.origin });
                const pageText = `Page ${i} of ${totalPages}`;
                const textWidth = pdf.getTextWidth(pageText);
                pdf.text(pageText, pageWidth - 10 - textWidth, pageHeight - 10);
            }
        }).save();

        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF. Please try again.');
    }
};
