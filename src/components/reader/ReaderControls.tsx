'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ChapterSummary } from '@/lib/types';
import { parseChapterNumber } from '@/lib/api';
import styles from './ReaderControls.module.css';

interface ReaderControlsProps {
  mangaId: string;
  mangaTitle: string;
  chapters: ChapterSummary[];
  currentChapterId: string;
  currentChapterNumber: string;
  prevChapterId: string | null;
  nextChapterId: string | null;
}

export default function ReaderControls({
  mangaId,
  mangaTitle,
  chapters,
  currentChapterId,
  currentChapterNumber,
  prevChapterId,
  nextChapterId,
}: ReaderControlsProps) {
  const router = useRouter();

  // ترتيب الفصول تصاعدياً للقائمة المنسدلة
  const sortedChapters = [...chapters].sort(
    (a, b) => parseFloat(a.chapter_number) - parseFloat(b.chapter_number)
  );

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetId = e.target.value;
    if (targetId && targetId !== currentChapterId) {
      router.push(`/manga/${mangaId}/chapter/${targetId}`);
    }
  };

  return (
    <div className={styles.controlsWrapper}>
      {/* زر العودة للمانجا */}
      <Link href={`/manga/${mangaId}`} className={styles.backLink}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span>{mangaTitle}</span>
      </Link>

      {/* أدوات التنقل */}
      <div className={styles.navigation}>
        {/* زر الفصل السابق (في الترتيب التصاعدي يعني الرقم الأصغر) */}
        {prevChapterId ? (
          <Link href={`/manga/${mangaId}/chapter/${prevChapterId}`} className={styles.navBtn} title="الفصل السابق">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className={styles.btnText}>السابق</span>
          </Link>
        ) : (
          <button className={styles.navBtn} disabled title="لا يوجد فصل سابق">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className={styles.btnText}>السابق</span>
          </button>
        )}

        {/* القائمة المنسدلة للفصول */}
        <div className={styles.selectWrapper}>
          <select
            value={currentChapterId}
            onChange={handleChapterChange}
            className={styles.chapterSelect}
          >
            {sortedChapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                الفصل {parseChapterNumber(ch.chapter_number)}
                {ch.title ? ` - ${ch.title}` : ''}
              </option>
            ))}
          </select>
          <div className={styles.selectChevron}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* زر الفصل التالي (في الترتيب التصاعدي يعني الرقم الأكبر) */}
        {nextChapterId ? (
          <Link href={`/manga/${mangaId}/chapter/${nextChapterId}`} className={styles.navBtn} title="الفصل التالي">
            <span className={styles.btnText}>التالي</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        ) : (
          <button className={styles.navBtn} disabled title="وصلت لآخر فصل">
            <span className={styles.btnText}>التالي</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
