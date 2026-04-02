import jsPDF from "jspdf";

export function downloadAsTxt(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadAsPdf(
  text: string,
  language: string,
  duration: number,
  filename: string
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(18);
  doc.setTextColor(88, 64, 174);
  doc.text("VaaniScript Transcript", 20, 20);

  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Language: ${language}`, 20, 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 36);
  doc.text(
    `Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`,
    20,
    42
  );
  doc.line(20, 46, pageWidth - 20, 46);

  // Body
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  const lines = doc.splitTextToSize(text, pageWidth - 40);
  let y = 56;
  for (const line of lines) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 20, y);
    y += 7;
  }

  // Footer
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(`Words: ${wordCount} | Characters: ${text.length}`, 20, 285);

  doc.save(filename);
}
