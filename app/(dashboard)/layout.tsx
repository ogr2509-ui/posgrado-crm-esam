import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Panel de Control General',
  '/registrations': 'Gestión de Inscripciones & Leads',
  '/links': 'Enlaces Promocionales Rastreables',
  '/programs': 'Gestión de Oferta Académica',
  '/users': 'Equipo de Ventas & Asesores',
  '/audit': 'Auditoría & Logs del Sistema',
  '/profile': 'Mi Perfil de Usuario',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar
        userRole={session.role}
        userName={session.name}
        userEmail={session.email}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          title={PAGE_TITLES['/dashboard']}
          userName={session.name}
          userRole={session.role}
        />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
