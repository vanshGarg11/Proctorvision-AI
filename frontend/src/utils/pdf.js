import jsPDF from "jspdf";

export function downloadResultPdf(result) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("ProctorVision AI Result", 20, 22);
  doc.setFontSize(11);
  doc.text(`Student: ${result.user?.name || "Student"}`, 20, 42);
  doc.text(`Exam: ${result.exam?.title || "Exam"}`, 20, 52);
  doc.text(`Score: ${result.score}/${result.total_marks}`, 20, 62);
  doc.text(`Percentage: ${result.percentage}%`, 20, 72);
  doc.text(`Submitted: ${new Date(result.submitted_at).toLocaleString()}`, 20, 82);
  doc.save(`result-${result.id}.pdf`);
}
