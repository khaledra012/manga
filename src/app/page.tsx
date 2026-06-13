import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import LatestUpdates from '@/components/home/LatestUpdates';
import PopularSection from '@/components/home/PopularSection';
import GenresSection from '@/components/home/GenresSection';
import { getLatestUpdates, getPopularManga, getGenres } from '@/lib/api';
import styles from './page.module.css';

export default async function HomePage() {
  // جلب البيانات من الـ API
  const [latestRes, popularRes, genresRes] = await Promise.allSettled([
    getLatestUpdates(),
    getPopularManga(),
    getGenres(),
  ]);

  const latest = latestRes.status === 'fulfilled' ? latestRes.value.data : [];
  const popular = popularRes.status === 'fulfilled' ? popularRes.value.data : [];
  const genres = genresRes.status === 'fulfilled' ? genresRes.value.data : [];

  return (
    <>
      <Navbar />
      <main>
        {/* ====== Hero Section ====== */}
        <section className={styles.hero}>
          <div className={styles.heroBg}>
            <div className={styles.heroOrb1} />
            <div className={styles.heroOrb2} />
            <div className={styles.heroGrid} />
          </div>

          <div className={`container ${styles.heroContent}`}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} />
              موقع المانجا الأول بالعربي
            </div>

            <h1 className={styles.heroTitle}>
              اقرأ المانجا
              <br />
              <span className={styles.heroAccent}>بدون حدود</span>
            </h1>

            <p className={styles.heroSubtitle}>
              آلاف الفصول من المانجا والمانهوا والمانهوا الصيني
              <br />
              مجاناً وبجودة عالية — بدون إعلانات مزعجة
            </p>

            <div className={styles.heroActions}>
              <Link href="/manga" className="btn btn-accent" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                تصفح المانجا
              </Link>
              <Link href="#latest" className="btn btn-ghost" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
                آخر التحديثات
              </Link>
            </div>

            {/* Stats */}
            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>+1000</span>
                <span className={styles.statLabel}>مانجا</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statNumber}>+50K</span>
                <span className={styles.statLabel}>فصل</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statNumber}>مجاناً</span>
                <span className={styles.statLabel}>100%</span>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className={styles.scrollIndicator}>
            <span>اسكرول للأسفل</span>
            <div className={styles.scrollArrow}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </div>
        </section>

        {/* ====== Latest Updates ====== */}
        <div id="latest">
          {latest.length > 0 ? (
            <LatestUpdates updates={latest} />
          ) : (
            <div className="container" style={{ padding: 'var(--space-16) var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
              لا توجد تحديثات حالياً
            </div>
          )}
        </div>

        {/* ====== Popular Manga ====== */}
        {popular.length > 0 && <PopularSection manga={popular} />}

        {/* ====== Genres ====== */}
        {genres.length > 0 && <GenresSection genres={genres} />}

        {/* ====== Footer ====== */}
        <footer className={styles.footer}>
          <div className={`container ${styles.footerInner}`}>
            <div className={styles.footerLogo}>
              <span>⚡</span>
              <span className={styles.footerLogoText}>MANGA<span style={{ color: 'var(--accent)' }}>TK</span></span>
            </div>
            <p className={styles.footerText}>
              جميع حقوق المانجا محفوظة لأصحابها الأصليين
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
