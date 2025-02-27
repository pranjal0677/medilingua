// client/src/utils/exportResults.js
export const exportToPDF = async (result) => {
  try {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Medical Report Analysis', 20, 20);

    doc.setFontSize(12);
    doc.text('Summary:', 20, 40);
    doc.setFontSize(10);
    doc.text(result.summary, 20, 50);

    doc.save('medical-report-analysis.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
};
  
  export const exportToCSV = (result) => {
    const csvContent = `
  Summary,${result.summary}
  Key Points,${result.keyPoints.join('; ')}
  Actions,${result.actions.join('; ')}
  Warnings,${result.warnings.join('; ')}
    `.trim();
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'medical-report-analysis.csv';
    link.click();
  };