// ============================================================
// 📦 MANGATAK — TypeScript Types
// ============================================================

// --- Status & Type Enums ---
export type MangaStatus = 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
export type MangaType = 'manga' | 'manhwa' | 'manhua';
export type SortOption = 'latest' | 'popular' | 'a-z';

// --- Genre ---
export interface Genre {
  id: number;
  name: string;
  slug: string;
}

// --- Genre مع عدد المانجا (من GET /api/genres) ---
export interface GenreWithCount extends Genre {
  mangaCount: number;
}

// --- Chapter (summary — داخل صفحة المانجا) ---
export interface ChapterSummary {
  id: string;
  chapter_number: string;   // بييجي كـ string من الـ API مثل "1.0"
  title: string | null;
  views: number;
  created_at: string;
  // slug الفصل = chapter_number مُعالَج (مثل 1.0 → "1", 1.5 → "1.5")
}

// --- Chapter Page (صفحة داخل الفصل) ---
export interface ChapterPage {
  id: string;
  page_number: number;
  image_url: string;
}

// --- Chapter Details (تفاصيل الفصل الكاملة للقراءة) ---
export interface ChapterDetails {
  id: string;
  manga_id: string;
  chapter_number: string;
  title: string | null;
  views: number;
  created_at: string;
  updated_at: string;
  pages: ChapterPage[];
  manga: {
    id: string;
    slug: string;          // ← slug المانجا للبناء السليم للروابط
    title: string;
    cover_url: string;
    chapters: ChapterSummary[];  // ← كل الفصول لبناء قائمة التنقل
  };
  prev_chapter_number: string | null;   // ← رقم الفصل السابق (بدل ID)
  next_chapter_number: string | null;   // ← رقم الفصل التالي (بدل ID)
  // الـ IDs القديمة — محتفظين بيها كـ fallback
  prev_chapter_id: string | null;
  next_chapter_id: string | null;
}


// --- Manga (في القوايم) ---
export interface MangaListItem {
  id: string;
  slug: string;           // ← SEO-friendly slug مثل "one-piece"
  title: string;
  title_alt: string | null;
  description: string;
  cover_url: string;
  status: MangaStatus;
  type: MangaType;
  author: string;
  artist: string;
  release_year: number;
  views: number;
  chapters_count: number;
  genres: Genre[];
  created_at: string;
  updated_at: string;
}

// --- Manga (تفاصيل كاملة) ---
export interface MangaDetails extends Omit<MangaListItem, 'chapters_count'> {
  chapters: ChapterSummary[];
}

// --- Latest Update Item ---
export interface LatestUpdateItem {
  id: string;              // chapter id
  chapter_number: string;
  title: string | null;
  created_at: string;
  manga: {
    id: string;
    slug: string;          // ← slug المانجا لبناء الرابط
    title: string;
    cover_url: string;
    type: MangaType;
    status: MangaStatus;
  };
}

// --- Pagination ---
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// --- API Response Wrappers ---
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}

// --- Query Params للبحث والفلترة ---
export interface MangaQueryParams {
  search?: string;
  genre?: string;        // slugs مفصولة بفاصلة مثل "action,fantasy"
  status?: MangaStatus;
  type?: MangaType;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

// --- Query Params لـ Genre Manga ---
export interface GenreMangaQueryParams {
  sort?: SortOption;
  page?: number;
  limit?: number;
}

// ============================================================
// 🔥 ADMIN TYPES
// ============================================================

// --- إحصائيات لوحة التحكم ---
export interface AdminStats {
  total_manga: number;
  total_chapters: number;
  total_pages: number;
  total_comments: number;
  total_views: number;
}

// --- Admin Sort Options (تشمل oldest) ---
export type AdminSortOption = 'latest' | 'oldest' | 'popular' | 'a-z';

// --- Query Params للبحث في الأدمن ---
export interface AdminMangaQueryParams {
  search?: string;
  status?: MangaStatus;
  type?: MangaType;
  sort?: AdminSortOption;
  page?: number;
  limit?: number;
}

// --- بيانات المانجا في القائمة الإدارية ---
export interface AdminMangaListItem {
  id: string;
  title: string;
  title_alt: string | null;
  description?: string;
  cover_url: string;
  status: MangaStatus;
  type: MangaType;
  author?: string;
  artist?: string;
  release_year?: number;
  views: number;
  chapters_count: number;
  genres: Genre[];
  created_at: string;
  updated_at: string;
}

// --- بيانات الفصل الإداري ---
export interface AdminChapterItem {
  id: string;
  manga_id: string;
  chapter_number: string;
  title: string | null;
  views: number;
  created_at: string;
  updated_at?: string;
}

// --- بيانات الصفحة المرفوعة ---
export interface AdminPageItem {
  id: string;
  chapter_id: string;
  page_number: number;
  image_url: string;
  image_key: string;
}

// --- بيانات إنشاء فصل ---
export interface CreateChapterData {
  chapter_number: number;
  title?: string;
}

// --- بيانات تعديل مانجا (JSON) ---
export interface UpdateMangaData {
  title?: string;
  title_alt?: string;
  description?: string;
  status?: MangaStatus;
  type?: MangaType;
  author?: string;
  artist?: string;
  release_year?: number;
  genres?: string; // IDs مفصولة بفاصلة "1,2,3"
}

