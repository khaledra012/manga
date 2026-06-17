import { MetadataRoute } from 'next';
import { getMangaList, getMangaBySlug, parseChapterNumber } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // استخدام رابط الموقع الفعلي أو الافتراضي
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mangatk-gilt.vercel.app';

  // 1. الصفحات الثابتة (Static Routes)
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/manga`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/genres`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'not-set';

  const debugRoutes = [
    {
      url: `${baseUrl}/debug-api-url-${encodeURIComponent(apiUrl)}`,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 0.1,
    }
  ];

  try {
    // جلب المانجا على دفعات (صفحات) لتجنب قيود الباك اند (الحد الأقصى للـ limit هو 100)
    const mangas: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 5) {
      const res = await getMangaList({ limit: 100, page });
      if (res && res.data && res.data.length > 0) {
        mangas.push(...res.data);
        hasMore = res.data.length === 100;
        page++;
      } else {
        hasMore = false;
      }
    }

    const mangaRoutes: MetadataRoute.Sitemap = [];
    const chapterRoutes: MetadataRoute.Sitemap = [];

    // جلب الفصول لكل مانجا بالتوازي لتحسين الأداء
    const mangaDetailsPromises = mangas.map((m) =>
      getMangaBySlug(m.slug).catch((err) => {
        console.error(`[Sitemap] Error fetching details for ${m.slug}:`, err);
        return null;
      })
    );

    const mangaDetailsList = await Promise.all(mangaDetailsPromises);

    for (const detailsRes of mangaDetailsList) {
      if (!detailsRes || !detailsRes.data) continue;
      const manga = detailsRes.data;

      // إضافة رابط المانجا الرئيسي
      mangaRoutes.push({
        url: `${baseUrl}/manga/${manga.slug}`,
        lastModified: new Date(manga.updated_at || manga.created_at || new Date()),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      });

      // إضافة روابط جميع فصول هذه المانجا
      if (manga.chapters && manga.chapters.length > 0) {
        for (const chapter of manga.chapters) {
          const chapterNum = String(parseChapterNumber(chapter.chapter_number));
          chapterRoutes.push({
            url: `${baseUrl}/manga/${manga.slug}/chapter/${chapterNum}`,
            lastModified: new Date(chapter.created_at || new Date()),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
          });
        }
      }
    }

    return [...staticRoutes, ...debugRoutes, ...mangaRoutes, ...chapterRoutes];
  } catch (error: any) {
    console.error('[Sitemap] Failed to generate dynamic routes:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorRoutes = [
      {
        url: `${baseUrl}/debug-error-${encodeURIComponent(errorMsg)}`,
        lastModified: new Date(),
        changeFrequency: 'always' as const,
        priority: 0.1,
      }
    ];
    return [...staticRoutes, ...debugRoutes, ...errorRoutes];
  }
}
