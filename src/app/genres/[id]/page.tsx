import { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import MangaCard from '@/components/manga/MangaCard';
import Pagination from '@/components/ui/Pagination';
import { SkeletonGrid } from '@/components/ui/SkeletonCard';
import { getGenres, getGenreManga } from '@/lib/api';
import type { SortOption } from '@/lib/types';
import styles from './page.module.css';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ sort?: string; page?: string; limit?: string }>;

export async function generateMetadata(props: { params: Params }) {
  const params = await props.params;
  try {
    const res = await getGenres();
    const genre = res.data.find(g => g.id === parseInt(params.id));
    return {
      title: genre ? `مانجا ${genre.name}` : 'تصنيف المانجا',
      description: genre ? `تصفح كل مانجا تصنيف ${genre.name} — ${genre.mangaCount} مانجا متاحة` : '',
    };
  } catch {
    return { title: 'تصنيف المانجا' };
  }
}

async function GenreMangaResults({
  genreId,
  genreName,
  searchParamsPromise,
}: {
  genreId: string;
  genreName: string;
  searchParamsPromise: SearchParams;
}) {
  const sp = await searchParamsPromise;
  const page = sp.page ? parseInt(sp.page, 10) : 1;
  const sort = (sp.sort as SortOption) || 'latest';

  try {
    const response = await getGenreManga(genreId, { sort, page, limit: 24 });
    const mangaList = response.data;
    const pagination = response.pagination;

    if (mangaList.length === 0) {
      return (
        <div className={styles.noResults}>
          <div className={styles.noResultsIcon}>📭</div>
          <h3>مفيش مانجا في تصنيف {genreName} لحد دلوقتي</h3>
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
  } catch {
    return (
      <div className={styles.errorState}>
        <h3>فشل تحميل المانجا</h3>
        <p>تأكد أن السيرفر شغال وحاول تاني</p>
      </div>
    );
  }
}

export default async function GenrePage(props: { params: Params; searchParams: SearchParams }) {
  const params = await props.params;
  const { id } = params;

  // جلب اسم التصنيف
  let genreName = 'التصنيف';
  let mangaCount = 0;
  try {
    const res = await getGenres();
    const genre = res.data.find(g => g.id === parseInt(id));
    if (!genre) {
      return (
        <>
          <Navbar />
          <main className="container" style={{ padding: 'var(--space-20) 0', textAlign: 'center' }}>
            <div className={styles.errorState}>
              <h3>⚠️ التصنيف ده مش موجود</h3>
              <p>اتأكد من الرابط أو ارجع لصفحة التصنيفات</p>
            </div>
          </main>
        </>
      );
    }
    genreName = genre.name;
    mangaCount = genre.mangaCount;
  } catch {
    // نكمل بالاسم الافتراضي
  }

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.breadcrumbs}>
              <a href="/manga">كل المانجا</a>
              <span>/</span>
              <span>تصنيف: {genreName}</span>
            </div>

            <div className={styles.titleRow}>
              <h1 className={styles.title}>
                <span className={styles.titleTag}>#</span>
                {genreName}
              </h1>
              {mangaCount > 0 && (
                <span className={styles.countBadge}>{mangaCount} مانجا</span>
              )}
            </div>
          </header>

          {/* Sort Controls */}
          <Suspense fallback={null}>
            <GenreSortBar />
          </Suspense>

          {/* Results */}
          <Suspense fallback={<SkeletonGrid count={12} />}>
            <GenreMangaResults
              genreId={id}
              genreName={genreName}
              searchParamsPromise={props.searchParams}
            />
          </Suspense>
        </div>
      </main>
    </>
  );
}

// مكون الفرز — Client Component داخل Suspense
function GenreSortBar() {
  return null; // هنضيف فرز لو احتجنا - الـ URL params بتتحكم فيه
}
