import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Posgrado Enterprise CRM | Gestión de Inscripciones y Enlaces',
  description: 'Sistema empresarial para la gestión de registros de inscripción de estudiantes y seguimiento comercial de programas de posgrado.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen font-sans antialiased selection:bg-blue-500 selection:text-white">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
