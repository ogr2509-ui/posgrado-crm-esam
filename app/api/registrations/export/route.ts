import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeRequest } from '@/lib/middleware';
import { generateExcelReport, ExportRegistrationData } from '@/lib/export-excel';
import { generatePDFReport } from '@/lib/export-pdf';
import { RegistrationStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { user, response } = await authorizeRequest(req);
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'excel'; // 'excel' | 'pdf'
    const programId = searchParams.get('programId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (user!.role !== 'ADMIN') {
      where.advisorId = user!.userId;
    }
    if (programId && programId !== 'ALL') where.programId = programId;
    if (status && status !== 'ALL') where.status = status as RegistrationStatus;
    if (search && search.trim() !== '') {
      const query = search.trim();
      where.OR = [
        { fullName: { contains: query, mode: 'insensitive' } },
        { ci: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }

    const rawRegistrations = await prisma.registration.findMany({
      where,
      include: {
        program: { select: { name: true } },
        advisor: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const exportData: ExportRegistrationData[] = rawRegistrations.map((r) => ({
      id: r.id,
      fullName: r.fullName,
      ci: r.ci,
      ciExpedition: r.ciExpedition,
      email: r.email,
      phone: r.phone,
      whatsapp: r.whatsapp,
      profession: r.profession,
      university: r.university,
      company: r.company,
      position: r.position,
      experienceYears: r.experienceYears,
      programName: r.program.name,
      advisorName: r.advisor.name,
      modality: r.modality,
      status: r.status,
      city: r.city,
      createdAt: r.createdAt.toISOString(),
    }));

    await prisma.auditLog.create({
      data: {
        userId: user!.userId,
        action: `EXPORT_${format.toUpperCase()}`,
        entity: 'Registration',
        details: `Exportación de ${exportData.length} registros realizada en formato ${format.toUpperCase()}`,
      },
    });

    if (format === 'pdf') {
      const pdfBuffer = generatePDFReport(exportData);
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="reporte_inscripciones_${Date.now()}.pdf"`,
        },
      });
    } else {
      const excelBuffer = await generateExcelReport(exportData);
      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="reporte_inscripciones_${Date.now()}.xlsx"`,
        },
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Error al generar la exportación.' }, { status: 500 });
  }
}
