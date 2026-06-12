'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { Pagination } from '@/lib/types';
import styles from './Pagination.module.css';

interface Props {
  pagination: Pagination;
}

export default function Pagination({ pagination }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { page, totalPages } = pagination;

  if (totalPages <= 1) return null;

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // بناء أرقام الصفحات مع الـ ellipsis
  function getPageNumbers(): (number | '...')[] {
    const pages: (number | '...')[] = [];
    const delta = 1;
    const range: number[] = [];

    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }

    if (range[0] > 2) pages.push(1, '...');
    else pages.push(1);

    pages.push(...range);

    if (range[range.length - 1] < totalPages - 1) pages.push('...', totalPages);
    else if (totalPages > 1) pages.push(totalPages);

    return pages;
  }

  return (
    <nav className={styles.pagination} aria-label="تنقل بين الصفحات">
      {/* Previous */}
      <button
        className={`${styles.btn} ${styles.arrow}`}
        onClick={() => goToPage(page - 1)}
        disabled={page === 1}
        aria-label="الصفحة السابقة"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>

      {/* Page Numbers */}
      <div className={styles.pages}>
        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
          ) : (
            <button
              key={p}
              className={`${styles.btn} ${p === page ? styles.active : ''}`}
              onClick={() => goToPage(p as number)}
              aria-label={`صفحة ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}
      </div>

      {/* Next */}
      <button
        className={`${styles.btn} ${styles.arrow}`}
        onClick={() => goToPage(page + 1)}
        disabled={page === totalPages}
        aria-label="الصفحة التالية"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>
    </nav>
  );
}
