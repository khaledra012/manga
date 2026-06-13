import Link from 'next/link';
import { getChapterBySlugAndNumber, getMangaBySlug, parseChapterNumber } from '@/lib/api';
import ReaderControls from '@/components/reader/ReaderControls';
import ChapterViewTracker from '@/components/reader/ChapterViewTracker';
import styles from './page.module.css';

// الـ [id] يقبل slug أو UUID للمانجا، والـ [chapterId] يقبل chapter_number أو UUID
type Params = Promise<{ id: string; chapterId: string }>;

// توليد الميتاداتا ديناميكياً لصفحة قارئ المانجا
export async function generateMetadata(props: { params: Params }) {
  const params = await props.params;
  try {
    const response = await getChapterBySlugAndNumber(params.id, params.chapterId);
    const chapter = response.data;
    return {
      title: `${chapter.manga.title} — الفصل ${parseChapterNumber(chapter.chapter_number)} — MANGATK`,
      description: `اقرأ الفصل ${parseChapterNumber(chapter.chapter_number)} ${
        chapter.title ? `(${chapter.title})` : ''
      } من مانجا ${chapter.manga.title} بالكامل ومترجم على MANGATK.`,
      openGraph: {
        title: `${chapter.manga.title} — الفصل ${parseChapterNumber(chapter.chapter_number)} | MANGATK`,
        images: [{ url: chapter.manga.cover_url }],
      },
    };
  } catch {
    return {
      title: 'قارئ المانجا — MANGATK',
    };
  }
}

export default async function ChapterReaderPage(props: { params: Params }) {
  const params = await props.params;
  // [id] = manga slug أو UUID  |  [chapterId] = chapter_number أو UUID
  const { id: mangaSlugOrId, chapterId: chapterNumOrId } = params;

  let chapter;
  let mangaChapters;
  let mangaSlug: string;

  try {
    // جلب بيانات الفصل ومانجا التفاصيل بالتوازي
    const [chapterResponse, mangaResponse] = await Promise.all([
      getChapterBySlugAndNumber(mangaSlugOrId, chapterNumOrId),
      getMangaBySlug(mangaSlugOrId),
    ]);

    chapter = chapterResponse.data;
    mangaChapters = mangaResponse.data.chapters;
    // استخدام الـ slug الحقيقي من الـ API response لبناء الروابط الصحيحة
    mangaSlug = chapter.manga.slug || mangaResponse.data.slug || mangaSlugOrId;
  } catch (error) {
    console.error('Error loading chapter reader:', error);
    return (
      <main className={styles.errorContainer} style={{ direction: 'rtl' }}>
        <div className={styles.errorCard}>
          <span className={styles.errorIcon}>⚠️</span>
          <h2>حصل مشكلة أثناء تحميل الفصل</h2>
          <p>اتأكد من اتصالك بالإنترنت أو حاول تفتح الفصل مرة تانية.</p>
          <div className={styles.errorActions}>
            <Link href={`/manga/${mangaSlugOrId}`} className="btn btn-accent">
              العودة للمانجا
            </Link>
            <Link href="/" className="btn btn-ghost">
              الرئيسية
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // helper: chapter_number → URL segment (1.0 → "1", 1.5 → "1.5")
  const numToSlug = (num: string) => String(parseChapterNumber(num));

  // الفصل السابق والتالي بالرقم (من الـ API الجديد)
  const prevNum = chapter.prev_chapter_number ?? null;
  const nextNum = chapter.next_chapter_number ?? null;

  // ترتيب الصفحات تصاعدياً بحسب page_number
  const sortedPages = [...chapter.pages].sort((a, b) => a.page_number - b.page_number);

  return (
    <div className={styles.readerPage} style={{ direction: 'rtl' }}>
      {/* تتبع المشاهدة — يعمل بالـ UUID الحقيقي للفصل */}
      <ChapterViewTracker chapterId={chapter.id} />

      {/* شريط التحكم والتنقل */}
      <ReaderControls
        mangaSlug={mangaSlug}
        mangaTitle={chapter.manga.title}
        chapters={mangaChapters ?? chapter.manga.chapters ?? []}
        currentChapterNumber={chapter.chapter_number}
        prevChapterNumber={prevNum}
        nextChapterNumber={nextNum}
      />

      {/* منطقة عرض الصفحات */}
      <main className={styles.readingArea}>
        <div className={styles.pagesContainer}>
          {sortedPages.length === 0 ? (
            <div className={styles.noPagesCard}>
              <p>مفيش صفحات مرفوعة للفصل ده لسه.</p>
            </div>
          ) : (
            sortedPages.map((page) => (
              <div key={page.id} className={styles.pageImageWrapper}>
                {/* استخدام img القياسي مع lazy-loading لصور المانجا ذات الأبعاد الديناميكية */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={page.image_url}
                  alt={`الصفحة ${page.page_number}`}
                  loading="lazy"
                  className={styles.pageImage}
                />
                <span className={styles.pageIndicator}>{page.page_number}</span>
              </div>
            ))
          )}
        </div>
      </main>

      {/* لوحة نهاية الفصل */}
      <section className={styles.endChapterSection}>
        <div className={`container ${styles.endChapterCard}`}>
          <h3>لقد أنهيت الفصل {parseChapterNumber(chapter.chapter_number)} 🎉</h3>
          {chapter.title && <p className={styles.chTitle}>&quot;{chapter.title}&quot;</p>}

          <div className={styles.endActions}>
            {nextNum ? (
              <Link
                href={`/manga/${mangaSlug}/chapter/${numToSlug(nextNum)}`}
                className="btn btn-accent"
              >
                الفصل التالي 🚀
              </Link>
            ) : (
              <div className={styles.lastChapterNote}>
                <p>لقد وصلت لآخر فصل متوفر حالياً لهذه المانجا. سيتم إضافة الفصول الجديدة فور صدورها!</p>
              </div>
            )}
            <Link href={`/manga/${mangaSlug}`} className="btn btn-ghost">
              الرجوع لتفاصيل المانجا
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
