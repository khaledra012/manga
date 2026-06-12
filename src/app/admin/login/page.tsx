'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { verifyAdminKey } from '@/lib/api';
import styles from './page.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!key.trim()) return;

    setLoading(true);
    setError('');

    try {
      const valid = await verifyAdminKey(key.trim());

      if (valid) {
        // حفظ الـ Key في localStorage وفي Cookie
        localStorage.setItem('adminKey', key.trim());
        document.cookie = `admin_key=${key.trim()}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
        router.push('/admin');
      } else {
        setError('المفتاح غلط أو منتهي — جرب تاني');
      }
    } catch {
      setError('مفيش اتصال بالسيرفر — تأكد إن الباك اند شغال');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <Image
            src="/logo.png"
            alt="MANGATK"
            width={150}
            height={50}
            className={styles.logoImg}
            priority
          />
        </div>

        <h1 className={styles.title}>لوحة التحكم</h1>
        <p className={styles.subtitle}>أدخل مفتاح الأدمن للمتابعة</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="admin-key">
              🔑 Admin Key
            </label>
            <input
              id="admin-key"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="أدخل المفتاح السري..."
              className={styles.input}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && (
            <div className={styles.errorMsg}>
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            className={`btn btn-accent ${styles.submitBtn}`}
            disabled={loading || !key.trim()}
          >
            {loading ? (
              <>
                <span className={styles.spinner} />
                جاري التحقق...
              </>
            ) : (
              'دخول →'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
