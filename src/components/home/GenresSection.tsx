import Link from 'next/link';
import type { GenreWithCount } from '@/lib/types';
import styles from './GenresSection.module.css';

interface Props {
  genres: GenreWithCount[];
}

export default function GenresSection({ genres }: Props) {
  if (genres.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className="section-title">التصنيفات</h2>
          <p className={styles.subtitle}>اكتشف المانجا حسب تصنيفك المفضل</p>
        </div>

        <div className={styles.grid}>
          {genres.map((genre, i) => (
            <Link
              key={genre.id}
              href={`/genres/${genre.id}`}
              className={styles.card}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className={styles.cardName}>{genre.name}</span>
              <span className={styles.cardCount}>{genre.mangaCount}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
