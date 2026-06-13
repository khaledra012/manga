// ============================================================
// 🌐 MANGATK — API Client
// ============================================================

import type {
  MangaListItem,
  MangaDetails,
  LatestUpdateItem,
  MangaQueryParams,
  GenreWithCount,
  Genre,
  GenreMangaQueryParams,
  ApiResponse,
  ApiListResponse,
  ChapterDetails,
  AdminStats,
  AdminMangaListItem,
  AdminMangaQueryParams,
  AdminChapterItem,
  AdminPageItem,
  CreateChapterData,
  UpdateMangaData,
} from './types';


const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// --- Helper: بناء URL مع Query Params ---
function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

// --- Helper: Fetch wrapper مع Error Handling ---
async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    next: { revalidate: 60 }, // ISR — كل دقيقة
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'حصل خطأ في السيرفر' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// ============================================================
// 📚 MANGA ENDPOINTS
// ============================================================

/**
 * GET /api/manga — قايمة المانجا مع بحث وفلترة
 */
export async function getMangaList(params?: MangaQueryParams): Promise<ApiListResponse<MangaListItem>> {
  const url = buildUrl('/api/manga', params as Record<string, string | number | undefined>);
  return apiFetch<ApiListResponse<MangaListItem>>(url);
}

/**
 * GET /api/manga/:slug — تفاصيل مانجا + فصولها (عن طريق slug)
 */
export async function getMangaBySlug(slug: string): Promise<ApiResponse<MangaDetails>> {
  const url = buildUrl(`/api/manga/${slug}`);
  return apiFetch<ApiResponse<MangaDetails>>(url);
}

/**
 * GET /api/admin/manga/:id — جلب بيانات مانجا واحدة للأدمن (بالـ UUID)
 */
export async function getMangaById(id: string): Promise<ApiResponse<MangaDetails>> {


  /**
   * GET /api/manga/latest — آخر 20 فصل اتضاف
   */
  export async function getLatestUpdates(): Promise<ApiResponse<LatestUpdateItem[]>> {
    const url = buildUrl('/api/manga/latest');
    return apiFetch<ApiResponse<LatestUpdateItem[]>>(url);
  }

  /**
   * GET /api/manga/popular — أكثر 20 مانجا مشاهدة
   */
  export async function getPopularManga(): Promise<ApiResponse<MangaListItem[]>> {
    const url = buildUrl('/api/manga/popular');
    return apiFetch<ApiResponse<MangaListItem[]>>(url);
  }

  /**
   * توليد أو جلب session_id من localStorage
   * يُستخدم لتتبع المشاهدات مرة واحدة لكل جلسة لكل فصل
   */
  export function getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return '';
    const stored = localStorage.getItem('manga_session_id');
    if (stored) return stored;
    const id = crypto.randomUUID();
    localStorage.setItem('manga_session_id', id);
    return id;
  }

  /**
   * GET /api/chapters/:mangaSlug/:chapterNumber — صفحات وقراءة فصل معين (SEO URLs)
   * @param mangaSlug - slug المانجا مثل "one-piece"
   * @param chapterNumber - رقم الفصل مثل "1" أو "1.5"
   * @param sessionId - اختياري: لو موجود يُرسل مع الطلب لمنع تكرار عد المشاهدات
   */
  export async function getChapterBySlugAndNumber(
    mangaSlug: string,
    chapterNumber: string,
    sessionId?: string
  ): Promise<ApiResponse<ChapterDetails>> {
    const params = sessionId ? { session_id: sessionId } : undefined;
    const url = buildUrl(`/api/chapters/${mangaSlug}/${chapterNumber}`, params);
    return apiFetch<ApiResponse<ChapterDetails>>(url);
  }

  /**
   * GET /api/chapters/:id — محتفظين بيها كـ fallback للأدمن
   * @deprecated استخدم getChapterBySlugAndNumber للصفحات العامة
   */
  export async function getChapterById(
    id: string,
    sessionId?: string
  ): Promise<ApiResponse<ChapterDetails>> {
    const params = sessionId ? { session_id: sessionId } : undefined;
    const url = buildUrl(`/api/chapters/${id}`, params);
    return apiFetch<ApiResponse<ChapterDetails>>(url);
  }

  // ============================================================
  // 🎭 GENRES ENDPOINTS
  // ============================================================

  /**
   * GET /api/genres — كل التصنيفات مع عدد المانجا
   */
  export async function getGenres(): Promise<ApiResponse<GenreWithCount[]>> {
    const url = buildUrl('/api/genres');
    return apiFetch<ApiResponse<GenreWithCount[]>>(url);
  }

  /**
   * GET /api/genres/:id/manga — مانجا تصنيف معين مع فلترة و pagination
   */
  export async function getGenreManga(
    genreId: number | string,
    params?: GenreMangaQueryParams
  ): Promise<ApiListResponse<MangaListItem>> {
    const url = buildUrl(`/api/genres/${genreId}/manga`, params as Record<string, string | number | undefined>);
    return apiFetch<ApiListResponse<MangaListItem>>(url);
  }

  // ============================================================
  // 🛠️ UTILITY HELPERS
  // ============================================================

  /**
   * تنسيق عدد المشاهدات (مثل 15420 → "15.4K")
   */
  export function formatViews(views: number): string {
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
    return views.toString();
  }

  /**
   * تحويل chapter_number من string لـ number (مثل "1.5" → 1.5)
   */
  export function parseChapterNumber(chapter_number: string): number {
    return parseFloat(chapter_number);
  }

  /**
   * تنسيق التاريخ بالعربي
   */
  export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * الحصول على اسم الـ status بالعربي
   */
  export function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      ongoing: 'مستمر',
      completed: 'مكتمل',
      hiatus: 'متوقف مؤقتاً',
      cancelled: 'ملغي',
    };
    return labels[status] || status;
  }

  /**
   * الحصول على اسم الـ type بالعربي
   */
  export function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      manga: 'مانجا',
      manhwa: 'مانهوا',
      manhua: 'مانهوا صيني',
    };
    return labels[type] || type;
  }

  // ============================================================
  // 🔥 ADMIN API — محمية بـ X-Admin-Key
  // ============================================================

  /**
   * Helper: قراءة Admin Key من localStorage
   */
  function getAdminKey(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('adminKey') || '';
  }

  /**
   * Helper: Fetch للأدمن مع X-Admin-Key header
   */
  async function adminFetch<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const key = getAdminKey();
    const headers: Record<string, string> = {
      'X-Admin-Key': key,
      ...(options.headers as Record<string, string> || {}),
    };

    const res = await fetch(url, {
      ...options,
      headers,
      cache: 'no-store',
    });

    // 204 No Content — حذف ناجح
    if (res.status === 204) return undefined as T;

    const json = await res.json().catch(() => ({ message: 'حصل خطأ في السيرفر' }));

    if (!res.ok) {
      throw new Error(json.message || `HTTP ${res.status}`);
    }

    return json;
  }

  // --- Stats ---

  /**
   * GET /api/admin/stats — إحصائيات لوحة التحكم
   */
  export async function getAdminStats(): Promise<ApiResponse<AdminStats>> {
    return adminFetch<ApiResponse<AdminStats>>(buildUrl('/api/admin/stats'));
  }

  // --- Admin Manga ---

  /**
   * GET /api/admin/manga — قائمة المانجا الإدارية
   */
  export async function getAdminMangaList(
    params?: AdminMangaQueryParams
  ): Promise<ApiListResponse<AdminMangaListItem>> {
    const url = buildUrl('/api/admin/manga', params as Record<string, string | number | undefined>);
    return adminFetch<ApiListResponse<AdminMangaListItem>>(url);
  }

  /**
   * POST /api/admin/manga — إضافة مانجا جديدة (multipart/form-data)
   */
  export async function createManga(formData: FormData): Promise<ApiResponse<AdminMangaListItem>> {
    return adminFetch<ApiResponse<AdminMangaListItem>>(buildUrl('/api/admin/manga'), {
      method: 'POST',
      body: formData,
      // لا تضع Content-Type — المتصفح يضبطه تلقائياً مع boundary للـ multipart
    });
  }

  /**
   * PUT /api/admin/manga/:id — تعديل بيانات مانجا (JSON)
   */
  export async function updateManga(
    id: string,
    data: UpdateMangaData
  ): Promise<ApiResponse<AdminMangaListItem>> {
    return adminFetch<ApiResponse<AdminMangaListItem>>(buildUrl(`/api/admin/manga/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH /api/admin/manga/:id/cover — تحديث غلاف مانجا (multipart)
   */
  export async function updateMangaCover(
    id: string,
    formData: FormData
  ): Promise<ApiResponse<{ cover_url: string }>> {
    return adminFetch<ApiResponse<{ cover_url: string }>>(
      buildUrl(`/api/admin/manga/${id}/cover`),
      { method: 'PATCH', body: formData }
    );
  }

  /**
   * DELETE /api/admin/manga/:id — حذف مانجا بالكامل
   */
  export async function deleteManga(id: string): Promise<void> {
    return adminFetch<void>(buildUrl(`/api/admin/manga/${id}`), { method: 'DELETE' });
  }

  // --- Admin Genres ---

  /**
   * POST /api/admin/genres — إضافة تصنيف جديد
   */
  export async function createGenre(name: string): Promise<ApiResponse<Genre>> {
    return adminFetch<ApiResponse<Genre>>(buildUrl('/api/admin/genres'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  }

  /**
   * PUT /api/admin/genres/:id — تعديل تصنيف
   */
  export async function updateGenre(id: number, name: string): Promise<ApiResponse<Genre>> {
    return adminFetch<ApiResponse<Genre>>(buildUrl(`/api/admin/genres/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  }

  /**
   * DELETE /api/admin/genres/:id — حذف تصنيف
   */
  export async function deleteGenre(id: number): Promise<void> {
    return adminFetch<void>(buildUrl(`/api/admin/genres/${id}`), { method: 'DELETE' });
  }

  // --- Admin Chapters ---

  /**
   * POST /api/admin/chapters/manga/:mangaId — إضافة فصل
   */
  export async function createChapter(
    mangaId: string,
    data: CreateChapterData
  ): Promise<ApiResponse<AdminChapterItem>> {
    return adminFetch<ApiResponse<AdminChapterItem>>(
      buildUrl(`/api/admin/chapters/manga/${mangaId}`),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
  }

  /**
   * PUT /api/admin/chapters/:id — تعديل فصل
   */
  export async function updateChapter(
    id: string,
    data: Partial<CreateChapterData>
  ): Promise<ApiResponse<AdminChapterItem>> {
    return adminFetch<ApiResponse<AdminChapterItem>>(buildUrl(`/api/admin/chapters/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE /api/admin/chapters/:id — حذف فصل + صفحاته
   */
  export async function deleteChapter(id: string): Promise<void> {
    return adminFetch<void>(buildUrl(`/api/admin/chapters/${id}`), { method: 'DELETE' });
  }

  // --- Admin Pages ---

  /**
   * POST /api/admin/pages/chapter/:chapterId/bulk — رفع صفحات متعددة
   */
  export async function uploadPages(
    chapterId: string,
    files: File[]
  ): Promise<ApiResponse<AdminPageItem[]>> {
    const formData = new FormData();
    files.forEach((file) => formData.append('pages', file));
    return adminFetch<ApiResponse<AdminPageItem[]>>(
      buildUrl(`/api/admin/pages/chapter/${chapterId}/bulk`),
      { method: 'POST', body: formData }
    );
  }

  /**
   * DELETE /api/admin/pages/:id — حذف صفحة
   */
  export async function deletePage(id: string): Promise<void> {
    return adminFetch<void>(buildUrl(`/api/admin/pages/${id}`), { method: 'DELETE' });
  }

  /**
   * التحقق من صحة Admin Key (عبر جلب الإحصائيات)
   */
  export async function verifyAdminKey(key: string): Promise<boolean> {
    try {
      const res = await fetch(buildUrl('/api/admin/stats'), {
        headers: { 'X-Admin-Key': key },
        cache: 'no-store',
      });
      return res.ok;
    } catch {
      return false;
    }
  }

