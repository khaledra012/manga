import Link from 'next/link';
import { getChapterById, getMangaById, parseChapterNumber } from '@/lib/api';
import ReaderControls from '@/components/reader/ReaderControls';
import ChapterViewTracker from '@/components/reader/ChapterViewTracker';
import styles from './page.module.css';

type Params = Promise<{ id: string; chapterId: string }>;

// توليد الميتاداتا ديناميكياً لصفحة قارئ المانجا
export async function generateMetadata(props: { params: Params }) {
  const params = await props.params;
  try {
    const response = await getChapterById(params.chapterId);
    const chapter = response.data;
    return {
      title: `${chapter.manga.title} — الفصل ${parseChapterNumber(chapter.chapter_number)} — MangaTeach`,
      description: `اقرأ الفصل ${parseChapterNumber(chapter.chapter_number)} ${
        chapter.title ? `(${chapter.title})` : ''
      } من مانجا ${chapter.manga.title} بالكامل ومترجم على مانجا تيتش.`,
    };
  } catch {
    return {
      title: 'قارئ المانجا — MangaTeach',
    };
  }
}

export default async function ChapterReaderPage(props: { params: Params }) {
  const params = await props.params;
  const { id: mangaId, chapterId } = params;

  let chapter;
  let manga;

  try {
    // جلب بيانات الفصل ومانجا التفاصيل بالتوازي لملء الـ Dropdown
    const [chapterResponse, mangaResponse] = await Promise.all([
      getChapterById(chapterId),
      getMangaById(mangaId),
    ]);

    chapter = chapterResponse.data;
    manga = mangaResponse.data;
  } catch (error) {
    console.error('Error loading chapter reader:', error);
    return (
      <main className={styles.errorContainer} style={{ direction: 'rtl' }}>
        <div className={styles.errorCard}>
          <span className={styles.errorIcon}>⚠️</span>
          <h2>حصل مشكلة أثناء تحميل الفصل</h2>
          <p>اتأكد من اتصالك بالإنترنت أو حاول تفتح الفصل مرة تانية.</p>
          <div className={styles.errorActions}>
            <Link href={`/manga/${mangaId}`} className="btn btn-accent">
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

  // ترتيب الصفحات تصاعدياً بحسب page_number للتأكد من تسلسل القراءة
  const sortedPages = [...chapter.pages].sort((a, b) => a.page_number - b.page_number);

  return (
    <div className={styles.readerPage} style={{ direction: 'rtl' }}>
      {/* تتبع المشاهدة مع session_id — يعمل من جانب العميل فقط */}
      <ChapterViewTracker chapterId={chapterId} />

      {/* شريط التحكم والتنقل */}
      <ReaderControls
        mangaId={mangaId}
        mangaTitle={manga?.title || chapter.manga.title}
        chapters={manga?.chapters || []}
        currentChapterId={chapterId}
        currentChapterNumber={chapter.chapter_number}
        prevChapterId={chapter.prev_chapter_id}
        nextChapterId={chapter.next_chapter_id}
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
          {chapter.title && <p className={styles.chTitle}>"{chapter.title}"</p>}

          <div className={styles.endActions}>
            {chapter.next_chapter_id ? (
              <Link href={`/manga/${mangaId}/chapter/${chapter.next_chapter_id}`} className="btn btn-accent">
                الفصل التالي 🚀
              </Link>
            ) : (
              <div className={styles.lastChapterNote}>
                <p>لقد وصلت لآخر فصل متوفر حالياً لهذه المانجا. سيتم إضافة الفصول الجديدة فور صدورها!</p>
              </div>
            )}
            <Link href={`/manga/${mangaId}`} className="btn btn-ghost">
              الرجوع لتفاصيل المانجا
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
