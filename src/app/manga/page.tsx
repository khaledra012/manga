import { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import FilterBar from '@/components/manga/FilterBar';
import MangaCard from '@/components/manga/MangaCard';
import Pagination from '@/components/ui/Pagination';
import { SkeletonGrid } from '@/components/ui/SkeletonCard';
import { getMangaList } from '@/lib/api';
import type { MangaStatus, MangaType, SortOption } from '@/lib/types';
import styles from './page.module.css';

// نوع الـ Props لـ Next.js 16/15
type SearchParams = Promise<{
  search?: string;
  genre?: string;
  status?: string;
  type?: string;
  sort?: string;
  page?: string;
  limit?: string;
}>;

export const metadata = {
  title: 'كل المانجا',
  description: 'تصفح وابحث في قائمة المانجا والمانهوا المتاحة بقراءة مباشرة مجاناً',
};

// مكون جلب البيانات
async function MangaListResults({ searchParamsPromise }: { searchParamsPromise: SearchParams }) {
  const searchParams = await searchParamsPromise;

  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const limit = searchParams.limit ? parseInt(searchParams.limit, 10) : 24;

  const queryParams = {
    search: searchParams.search || undefined,
    genre: searchParams.genre || undefined,
    status: (searchParams.status as MangaStatus) || undefined,
    type: (searchParams.type as MangaType) || undefined,
    sort: (searchParams.sort as SortOption) || 'latest',
    page,
    limit,
  };

  try {
    const response = await getMangaList(queryParams);
    const mangaList = response.data;
    const pagination = response.pagination;

    if (mangaList.length === 0) {
      return (
        <div className={styles.noResults}>
          <div className={styles.noResultsIcon}>🔍</div>
          <h3>مفيش نتائج تطابق بحثك</h3>
          <p>جرب تبحث بكلمات تانية أو تغير الفلاتر</p>
        </div>
      );
    }

    return (
      <>
        <div className="manga-grid">
          {mangaList.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
        <Pagination pagination={pagination} />
      </>
    );
  } catch (error) {
    console.error('Error fetching manga list:', error);
    return (
      <div className={styles.errorState}>
        <h3>فشل تحميل المانجا</h3>
        <p>تأكد أن السيرفر شغال وحاول تاني</p>
      </div>
    );
  }
}

export default async function MangaListPage(props: { searchParams: SearchParams }) {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <header className={styles.header}>
            <h1 className={styles.title}>تصفح المانجا</h1>
            <p className={styles.subtitle}>ابحث في مكتبة المانجا والمانهوا بالاسم أو التصنيف</p>
          </header>

          <Suspense fallback={<div className="skeleton" style={{ height: '180px', width: '100%', marginBottom: 'var(--space-8)' }} />}>
            <FilterBar />
          </Suspense>

          <Suspense fallback={<SkeletonGrid count={12} />}>
            <MangaListResults searchParamsPromise={props.searchParams} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
