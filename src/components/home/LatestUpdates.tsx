import Link from 'next/link';
import Image from 'next/image';
import type { LatestUpdateItem } from '@/lib/types';
import { formatDate, parseChapterNumber } from '@/lib/api';
import StatusBadge from '@/components/manga/StatusBadge';
import styles from './LatestUpdates.module.css';

interface Props {
  updates: LatestUpdateItem[];
}

export default function LatestUpdates({ updates }: Props) {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className="section-title">
          آخر التحديثات
        </h2>

        <div className={styles.grid}>
          {updates.map((item, i) => (
            <Link
              key={item.id}
              href={`/manga/${item.manga.id}`}
              className={styles.card}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              {/* Cover */}
              <div className={styles.coverWrapper}>
                <Image
                  src={item.manga.cover_url}
                  alt={item.manga.title}
                  fill
                  sizes="60px"
                  className={styles.cover}
                />
              </div>

              {/* Info */}
              <div className={styles.info}>
                <p className={styles.mangaTitle}>{item.manga.title}</p>
                <div className={styles.chapterInfo}>
                  <span className={styles.chapterNum}>
                    فصل {parseChapterNumber(item.chapter_number)}
                  </span>
                  {item.title && (
                    <span className={styles.chapterTitle}>{item.title}</span>
                  )}
                </div>
                <div className={styles.meta}>
                  <StatusBadge status={item.manga.status} size="sm" />
                  <span className={styles.date}>{formatDate(item.created_at)}</span>
                </div>
              </div>

              {/* Arrow */}
              <svg className={styles.arrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </Link>
          ))}
        </div>

        <div className={styles.viewAll}>
          <Link href="/manga" className="btn btn-ghost">
            عرض كل المانجا
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
