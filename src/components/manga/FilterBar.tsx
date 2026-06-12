'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { MangaStatus, MangaType, SortOption, GenreWithCount } from '@/lib/types';
import { getGenres } from '@/lib/api';
import styles from './FilterBar.module.css';

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [type, setType] = useState<MangaType | ''>((searchParams.get('type') as MangaType) || '');
  const [status, setStatus] = useState<MangaStatus | ''>((searchParams.get('status') as MangaStatus) || '');
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'latest');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    searchParams.get('genre') ? searchParams.get('genre')!.split(',') : []
  );

  // جلب التصنيفات من الـ API
  const [genres, setGenres] = useState<GenreWithCount[]>([]);
  const [genresLoading, setGenresLoading] = useState(true);

  useEffect(() => {
    getGenres()
      .then(res => setGenres(res.data))
      .catch(() => setGenres([]))
      .finally(() => setGenresLoading(false));
  }, []);

  // مزامنة الحالة مع الـ URL
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setType((searchParams.get('type') as MangaType) || '');
    setStatus((searchParams.get('status') as MangaStatus) || '');
    setSort((searchParams.get('sort') as SortOption) || 'latest');
    setSelectedGenres(searchParams.get('genre') ? searchParams.get('genre')!.split(',') : []);
  }, [searchParams]);

  const applyFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') params.delete(key);
      else params.set(key, value);
    });
    router.push(`/manga?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: search.trim() });
  };

  const toggleGenre = (slug: string) => {
    const next = selectedGenres.includes(slug)
      ? selectedGenres.filter(g => g !== slug)
      : [...selectedGenres, slug];
    applyFilters({ genre: next.length > 0 ? next.join(',') : null });
  };

  const clearFilters = () => router.push('/manga');

  const hasActiveFilters =
    searchParams.get('search') ||
    searchParams.get('type') ||
    searchParams.get('status') ||
    searchParams.get('genre') ||
    (searchParams.get('sort') && searchParams.get('sort') !== 'latest');

  return (
    <div className={styles.container}>
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
        <div className={styles.searchField}>
          <input
            type="text"
            placeholder="ابحث بالاسم، الكاتب أو الرسام..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={`btn btn-accent ${styles.searchBtn}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </div>
      </form>

      {/* Dropdowns */}
      <div className={styles.filtersRow}>
        <div className={styles.selectGroup}>
          <div className={styles.selectWrapper}>
            <label htmlFor="filter-type" className={styles.label}>النوع</label>
            <select id="filter-type" value={type}
              onChange={e => { setType(e.target.value as MangaType | ''); applyFilters({ type: e.target.value }); }}
              className={styles.select}>
              <option value="">كل الأنواع</option>
              <option value="manga">مانجا (Manga)</option>
              <option value="manhwa">مانهوا (Manhwa)</option>
              <option value="manhua">مانهوا صيني (Manhua)</option>
            </select>
          </div>

          <div className={styles.selectWrapper}>
            <label htmlFor="filter-status" className={styles.label}>الحالة</label>
            <select id="filter-status" value={status}
              onChange={e => { setStatus(e.target.value as MangaStatus | ''); applyFilters({ status: e.target.value }); }}
              className={styles.select}>
              <option value="">كل الحالات</option>
              <option value="ongoing">مستمر</option>
              <option value="completed">مكتمل</option>
              <option value="hiatus">متوقف مؤقتاً</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>

          <div className={styles.selectWrapper}>
            <label htmlFor="filter-sort" className={styles.label}>الترتيب</label>
            <select id="filter-sort" value={sort}
              onChange={e => { setSort(e.target.value as SortOption); applyFilters({ sort: e.target.value }); }}
              className={styles.select}>
              <option value="latest">آخر التحديثات</option>
              <option value="popular">الأكثر شعبية</option>
              <option value="a-z">أبجدي أ-ي</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <button onClick={clearFilters} className={`btn btn-ghost ${styles.clearBtn}`}>
            ✕ حذف التصفية
          </button>
        )}
      </div>

      {/* Genres — من الـ API */}
      <div className={styles.genresSection}>
        <span className={styles.genresTitle}>التصنيفات:</span>
        <div className={styles.genresContainer}>
          {genresLoading ? (
            // Skeleton للتصنيفات
            Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className={`skeleton ${styles.genreTagSkeleton}`} />
            ))
          ) : genres.length > 0 ? (
            genres.map((g) => {
              const isActive = selectedGenres.includes(g.slug);
              return (
                <button
                  key={g.id}
                  onClick={() => toggleGenre(g.slug)}
                  className={`${styles.genreTag} ${isActive ? styles.genreTagActive : ''}`}
                  aria-pressed={isActive}
                  title={`${g.mangaCount} مانجا`}
                >
                  {g.name}
                  <span className={styles.genreCount}>{g.mangaCount}</span>
                </button>
              );
            })
          ) : (
            <span className={styles.genresEmpty}>لا توجد تصنيفات متاحة</span>
          )}
        </div>
      </div>
    </div>
  );
}
