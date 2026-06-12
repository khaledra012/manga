'use client';

import { useState, useEffect } from 'react';
import { getAdminStats, formatViews } from '@/lib/api';
import type { AdminStats } from '@/lib/types';
import styles from './page.module.css';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className={styles.statCard} style={{ '--card-color': color } as React.CSSProperties}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statInfo}>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.message || 'فشل تحميل الإحصائيات'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>📊 الإحصائيات</h1>
        </div>
        <div className={styles.statsGrid}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`${styles.statCard} skeleton`} style={{ height: '110px' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorBox}>
          <p>⚠️ {error}</p>
          <button className="btn btn-accent" onClick={() => window.location.reload()}>
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>📊 إحصائيات لوحة التحكم</h1>
          <p className={styles.pageSubtitle}>نظرة عامة على محتوى الموقع</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          icon="📚"
          label="إجمالي المانجا"
          value={stats?.total_manga.toLocaleString('ar-EG') ?? 0}
          color="#e8460a"
        />
        <StatCard
          icon="📖"
          label="إجمالي الفصول"
          value={stats?.total_chapters.toLocaleString('ar-EG') ?? 0}
          color="#8b5cf6"
        />
        <StatCard
          icon="🖼️"
          label="إجمالي الصفحات"
          value={stats?.total_pages.toLocaleString('ar-EG') ?? 0}
          color="#0ea5e9"
        />
        <StatCard
          icon="💬"
          label="إجمالي التعليقات"
          value={stats?.total_comments.toLocaleString('ar-EG') ?? 0}
          color="#10b981"
        />
        <StatCard
          icon="👁️"
          label="إجمالي المشاهدات"
          value={formatViews(stats?.total_views ?? 0)}
          color="#f59e0b"
        />
      </div>

      {/* Quick Links */}
      <div className={styles.quickLinksSection}>
        <h2 className={styles.sectionTitle}>⚡ روابط سريعة</h2>
        <div className={styles.quickLinks}>
          <a href="/admin/manga" className={styles.quickLink}>
            <span>📚</span>
            <span>إضافة مانجا جديدة</span>
          </a>
          <a href="/admin/genres" className={styles.quickLink}>
            <span>🎭</span>
            <span>إدارة التصنيفات</span>
          </a>
          <a href="/manga" target="_blank" className={styles.quickLink}>
            <span>🌐</span>
            <span>عرض الموقع</span>
          </a>
        </div>
      </div>
    </div>
  );
}
