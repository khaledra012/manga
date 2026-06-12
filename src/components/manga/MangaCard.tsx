import Link from 'next/link';
import Image from 'next/image';
import type { MangaListItem } from '@/lib/types';
import { formatViews } from '@/lib/api';
import StatusBadge from './StatusBadge';
import styles from './MangaCard.module.css';

interface Props {
  manga: MangaListItem;
  priority?: boolean;
}

export default function MangaCard({ manga, priority = false }: Props) {
  return (
    <Link href={`/manga/${manga.id}`} className={styles.card} aria-label={manga.title}>
      {/* Cover Image */}
      <div className={styles.coverWrapper}>
        <Image
          src={manga.cover_url}
          alt={manga.title}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 200px"
          className={styles.cover}
          priority={priority}
        />
        {/* Gradient Overlay */}
        <div className={styles.gradient} />

        {/* Type Badge */}
        <span className={styles.typeBadge}>{manga.type}</span>

        {/* Status Badge */}
        <div className={styles.statusWrapper}>
          <StatusBadge status={manga.status} size="sm" />
        </div>

        {/* Chapters count */}
        {manga.chapters_count > 0 && (
          <div className={styles.chaptersCount}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            {manga.chapters_count} فصل
          </div>
        )}
      </div>

      {/* Info */}
      <div className={styles.info}>
        <h3 className={styles.title}>{manga.title}</h3>
        {manga.title_alt && (
          <p className={styles.titleAlt}>{manga.title_alt}</p>
        )}

        {/* Views */}
        <div className={styles.meta}>
          <span className={styles.views}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            {formatViews(manga.views)}
          </span>
          {manga.release_year && (
            <span className={styles.year}>{manga.release_year}</span>
          )}
        </div>

        {/* Genres */}
        {manga.genres.length > 0 && (
          <div className={styles.genres}>
            {manga.genres.slice(0, 2).map((genre) => (
              <span key={genre.id} className={styles.genre}>
                {genre.name}
              </span>
            ))}
            {manga.genres.length > 2 && (
              <span className={styles.genreMore}>+{manga.genres.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
