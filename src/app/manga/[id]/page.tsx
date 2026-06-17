import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import StatusBadge from '@/components/manga/StatusBadge';
import { getMangaBySlug, formatViews, formatDate, parseChapterNumber } from '@/lib/api';
import styles from './page.module.css';

// الـ [id] parameter يقبل slug أو UUID — الباك اند يتعامل مع الاتنين
type Params = Promise<{ id: string }>;

// توليد الـ metadata لصفحة تفاصيل المانجا ديناميكياً
export async function generateMetadata(props: { params: Params }) {
  const params = await props.params;
  try {
    const response = await getMangaBySlug(params.id);
    const manga = response.data;
    return {
      title: `${manga.title} — تفاصيل المانجا | MANGATAK`,
      description: manga.description.substring(0, 160),
      openGraph: {
        title: `${manga.title} | MANGATAK`,
        description: manga.description.substring(0, 160),
        images: [{ url: manga.cover_url }],
      },
    };
  } catch {
    return {
      title: 'تفاصيل المانجا | MANGATAK',
    };
  }
}

export default async function MangaDetailPage(props: { params: Params }) {
  const params = await props.params;
  // الـ id قد يكون slug (مثل "one-piece") أو UUID — الباك اند يقبل الاتنين
  const { id: slugOrId } = params;

  let manga;
  try {
    const response = await getMangaBySlug(slugOrId);
    manga = response.data;
  } catch (error) {
    console.error('Error loading manga details:', error);
    return (
      <>
        <Navbar />
        <main className="container" style={{ padding: 'var(--space-20) 0', textAlign: 'center' }}>
          <div className={styles.errorCard}>
            <div className={styles.errorIcon}>⚠️</div>
            <h2>المانجا دي مش موجودة أو حصل مشكلة في التحميل</h2>
            <p>اتأكد من الرابط أو حاول تاني في وقت لاحق.</p>
            <Link href="/manga" className="btn btn-accent" style={{ marginTop: 'var(--space-4)' }}>
              الرجوع للتصفح
            </Link>
          </div>
        </main>
      </>
    );
  }

  // ترتيب الفصول تصاعدياً لضمان البدء من الفصل الأول
  const sortedChapters = [...manga.chapters].sort((a, b) =>
    parseFloat(a.chapter_number) - parseFloat(b.chapter_number)
  );

  // helper: chapter_number → URL segment (1.0 → "1", 1.5 → "1.5")
  const chapterNumToSlug = (num: string) => String(parseChapterNumber(num));

  // استخدام الـ slug الحقيقي من الـ API response لبناء الروابط الصحيحة
  const mangaSlug = manga.slug;

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* الخلفية المموّهة (Blurred Backdrop) للمانجا */}
        <div className={styles.backdrop}>
          <Image
            src={manga.cover_url}
            alt=""
            fill
            priority
            className={styles.backdropImage}
          />
          <div className={styles.backdropOverlay} />
        </div>

        <div className="container">
          {/* breadcrumbs */}
          <nav className={styles.breadcrumbs} aria-label="مسار التنقل">
            <Link href="/">الرئيسية</Link>
            <span className={styles.separator}>/</span>
            <Link href="/manga">كل المانجا</Link>
            <span className={styles.separator}>/</span>
            <span className={styles.activePage}>{manga.title}</span>
          </nav>

          <div className={styles.mangaDetailsWrapper}>
            {/* الجزء الأيمن: الغلاف وبيانات سريعة */}
            <div className={styles.sidebar}>
              <div className={styles.coverCard}>
                <Image
                  src={manga.cover_url}
                  alt={manga.title}
                  width={280}
                  height={420}
                  priority
                  className={styles.coverImage}
                />
              </div>

              {/* أزرار سريعة */}
              <div className={styles.sidebarActions}>
                {sortedChapters.length > 0 ? (
                  <Link
                    href={`/manga/${mangaSlug}/chapter/${chapterNumToSlug(sortedChapters[0].chapter_number)}`}
                    className="btn btn-accent"
                  >
                    بدء القراءة (فصل {parseChapterNumber(sortedChapters[0].chapter_number)})
                  </Link>
                ) : (
                  <button className="btn btn-ghost" disabled>
                    لا توجد فصول حالياً
                  </button>
                )}
              </div>
            </div>

            {/* الجزء الأيسر: المعلومات، الوصف، الفصول */}
            <div className={styles.content}>
              <header className={styles.header}>
                <div className={styles.badgeRow}>
                  <StatusBadge status={manga.status} />
                  <span className={styles.typeLabel}>{manga.type.toUpperCase()}</span>
                </div>

                <h1 className={styles.mangaTitle}>{manga.title}</h1>
                {manga.title_alt && <h2 className={styles.mangaTitleAlt}>{manga.title_alt}</h2>}

                {/* Genres */}
                {manga.genres.length > 0 && (
                  <div className={styles.genres}>
                    {manga.genres.map((genre) => (
                      <Link key={genre.id} href={`/manga?genre=${genre.slug}`} className={styles.genreTag}>
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                )}
              </header>

              {/* شبكة البيانات (Metadata Grid) */}
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>المؤلف</span>
                  <span className={styles.metaValue}>{manga.author}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>الرسام</span>
                  <span className={styles.metaValue}>{manga.artist}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>سنة الإصدار</span>
                  <span className={styles.metaValue}>{manga.release_year}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>المشاهدات</span>
                  <span className={styles.metaValue}>{formatViews(manga.views)}</span>
                </div>
              </div>

              {/* الوصف القصة */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>القصة</h3>
                <p className={styles.description}>{manga.description}</p>
              </div>

              {/* قائمة الفصول */}
              <div className={styles.section} id="chapters">
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>الفصول المتوفرة</h3>
                  <span className={styles.chaptersCount}>{manga.chapters.length} فصل</span>
                </div>

                {manga.chapters.length === 0 ? (
                  <div className={styles.noChapters}>
                    <p>مفيش فصول اتضافت للمانجا دي لسه.</p>
                  </div>
                ) : (
                  <div className={styles.chaptersList}>
                    {manga.chapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        id={`chapter-${parseChapterNumber(chapter.chapter_number)}`}
                        className={styles.chapterRow}
                      >
                        <div className={styles.chapterInfo}>
                          <span className={styles.chapterNumber}>
                            الفصل {parseChapterNumber(chapter.chapter_number)}
                          </span>
                          {chapter.title && (
                            <span className={styles.chapterTitle}>{chapter.title}</span>
                          )}
                        </div>

                        <div className={styles.chapterMeta}>
                          <span className={styles.chapterViews}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                            {formatViews(chapter.views)}
                          </span>
                          <span className={styles.chapterDate}>{formatDate(chapter.created_at)}</span>

                          {/* زر القراءة — رابط SEO نظيف */}
                          <Link
                            href={`/manga/${mangaSlug}/chapter/${chapterNumToSlug(chapter.chapter_number)}`}
                            className={`btn btn-ghost ${styles.readBtn}`}
                          >
                            اقرأ الآن
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
