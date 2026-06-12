import Link from 'next/link';
import type { MangaListItem } from '@/lib/types';
import MangaCard from '@/components/manga/MangaCard';
import styles from './PopularSection.module.css';

interface Props {
  manga: MangaListItem[];
}

export default function PopularSection({ manga }: Props) {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className="section-title">
            🔥 الأكثر مشاهدة
          </h2>
          <Link href="/manga?sort=popular" className={`btn btn-ghost ${styles.viewAllBtn}`}>
            عرض الكل
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </Link>
        </div>

        <div className="manga-grid">
          {manga.map((item, i) => (
            <MangaCard key={item.id} manga={item} priority={i < 4} />
          ))}
        </div>
      </div>
    </section>
  );
}
