import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExportRegistrationData } from './export-excel';

export function generatePDFReport(registrations: ExportRegistrationData[]): Buffer {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header Branding Box
  doc.setFillColor(12, 142, 233); // Brand Blue #0C8EE9
  doc.rect(0, 0, 297, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SISTEMA CORPORATIVO DE POSGRADO - REPORTE DE LEADS', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 240, 15);

  // Metadata Subheader
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Registros Exportados: ${registrations.length}`, 14, 32);

  // Table Columns & Rows
  const tableHead = [
    ['Fecha', 'Estudiante', 'CI', 'Correo', 'Teléfono', 'Programa', 'Asesor', 'Modalidad', 'Estado'],
  ];

  const tableData = registrations.map((r) => [
    r.createdAt.split('T')[0] || r.createdAt,
    r.fullName,
    `${r.ci} (${r.ciExpedition})`,
    r.email,
    r.phone,
    r.programName,
    r.advisorName,
    r.modality,
    r.status,
  ]);

  autoTable(doc, {
    startY: 36,
    head: tableHead,
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 30, 30],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 22 }, // Date
      1: { cellWidth: 42 }, // Student Name
      2: { cellWidth: 24 }, // CI
      3: { cellWidth: 45 }, // Email
      4: { cellWidth: 24 }, // Phone
      5: { cellWidth: 52 }, // Program
      6: { cellWidth: 30 }, // Advisor
      7: { cellWidth: 22 }, // Modality
      8: { cellWidth: 26, halign: 'center' }, // Status
    },
    margin: { left: 14, right: 14 },
  });

  // Footer Page Numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Página ${i} de ${pageCount} | Documento Oficial Generado por el CRM de Ventas de Posgrado`,
      14,
      202
    );
  }

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
