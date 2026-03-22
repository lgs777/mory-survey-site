import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const authenticated = isValidAdminSession(token);

  if (!authenticated) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
}
