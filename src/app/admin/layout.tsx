import type { Metadata } from 'next';
import AdminSidebar from '@/components/admin/AdminSidebar';
import styles from './layout.module.css';

export const metadata: Metadata = {
  title: 'لوحة التحكم — MangaTeach Admin',
  description: 'لوحة تحكم إدارة موقع MangaTeach',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.adminShell} style={{ direction: 'rtl' }}>
      <AdminSidebar />
      <main className={styles.adminMain}>
        {children}
      </main>
    </div>
  );
}
