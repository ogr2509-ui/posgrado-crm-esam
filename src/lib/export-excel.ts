import ExcelJS from 'exceljs';

export interface ExportRegistrationData {
  id: string;
  fullName: string;
  ci: string;
  ciExpedition: string;
  email: string;
  phone: string;
  whatsapp: string;
  profession: string;
  university: string;
  company: string;
  position: string;
  experienceYears: number;
  programName: string;
  advisorName: string;
  modality: string;
  status: string;
  city: string;
  createdAt: string;
}

export async function generateExcelReport(registrations: ExportRegistrationData[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema Posgrado Enterprise';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Inscripciones', {
    pageSetup: { orientation: 'landscape', fitToPage: true },
  });

  // Header Title Block
  worksheet.mergeCells('A1:O1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'REPORTE GENERAL DE INSCRIPCIONES Y LEADS DE POSGRADO';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0C8EE9' }, // Brand blue
  };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 35;

  // Subtitle Timestamp
  worksheet.mergeCells('A2:O2');
  const subCell = worksheet.getCell('A2');
  subCell.value = `Generado el: ${new Date().toLocaleString('es-ES')} | Total Registros: ${registrations.length}`;
  subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF4A5568' } };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(2).height = 20;

  // Column Header Definitions
  worksheet.getRow(4).values = [
    'ID',
    'Fecha / Hora',
    'Estudiante',
    'CI',
    'Expedición',
    'Correo Electrónico',
    'Teléfono / Celular',
    'WhatsApp',
    'Profesión',
    'Universidad',
    'Programa de Posgrado',
    'Asesor de Ventas',
    'Modalidad',
    'Ciudad',
    'Estado',
  ];

  const headerRow = worksheet.getRow(4);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }, // Slate 800
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'medium', color: { argb: 'FF0070C7' } },
    };
  });

  // Populate Rows
  registrations.forEach((reg, idx) => {
    const rowNumber = idx + 5;
    const row = worksheet.getRow(rowNumber);
    row.values = [
      reg.id.substring(0, 8),
      reg.createdAt,
      reg.fullName,
      reg.ci,
      reg.ciExpedition,
      reg.email,
      reg.phone,
      reg.whatsapp,
      reg.profession,
      reg.university,
      reg.programName,
      reg.advisorName,
      reg.modality,
      reg.city,
      reg.status,
    ];

    row.height = 22;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10 };
      cell.alignment = { vertical: 'middle' };

      // Zebra Striping
      if (idx % 2 === 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' },
        };
      }

      // Format status column
      if (colNumber === 15) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { name: 'Calibri', size: 10, bold: true };
      }
    });
  });

  // Auto-fit Column Widths
  worksheet.columns.forEach((column) => {
    let maxLength = 12;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const val = cell.value ? cell.value.toString() : '';
      if (val.length > maxLength && val.length < 50) {
        maxLength = val.length;
      }
    });
    column.width = maxLength + 4;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
