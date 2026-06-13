'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ChapterSummary } from '@/lib/types';
import { parseChapterNumber } from '@/lib/api';
import styles from './ReaderControls.module.css';

interface ReaderControlsProps {
  mangaSlug: string;
  mangaTitle: string;
  chapters: ChapterSummary[];
  currentChapterNumber: string;
  prevChapterNumber: string | null;
  nextChapterNumber: string | null;
}

// chapter_number → URL segment (1.0 → "1", 1.5 → "1.5")
function numToSlug(num: string): string {
  return String(parseChapterNumber(num));
}

export default function ReaderControls({
  mangaSlug,
  mangaTitle,
  chapters,
  currentChapterNumber,
  prevChapterNumber,
  nextChapterNumber,
}: ReaderControlsProps) {
  const router = useRouter();

  // ترتيب الفصول تصاعدياً للقائمة المنسدلة
  const sortedChapters = [...chapters].sort(
    (a, b) => parseFloat(a.chapter_number) - parseFloat(b.chapter_number)
  );

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetNum = e.target.value;
    if (targetNum && targetNum !== currentChapterNumber) {
      router.push(`/manga/${mangaSlug}/chapter/${numToSlug(targetNum)}`);
    }
  };

  return (
    <div className={styles.controlsWrapper}>
      {/* زر العودة للمانجا */}
      <Link href={`/manga/${mangaSlug}`} className={styles.backLink}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span>{mangaTitle}</span>
      </Link>

      {/* أدوات التنقل */}
      <div className={styles.navigation}>
        {/* زر الفصل السابق */}
        {prevChapterNumber ? (
          <Link
            href={`/manga/${mangaSlug}/chapter/${numToSlug(prevChapterNumber)}`}
            className={styles.navBtn}
            title="الفصل السابق"
          >
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
            value={currentChapterNumber}
            onChange={handleChapterChange}
            className={styles.chapterSelect}
          >
            {sortedChapters.map((ch) => (
              <option key={ch.id} value={ch.chapter_number}>
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

        {/* زر الفصل التالي */}
        {nextChapterNumber ? (
          <Link
            href={`/manga/${mangaSlug}/chapter/${numToSlug(nextChapterNumber)}`}
            className={styles.navBtn}
            title="الفصل التالي"
          >
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
