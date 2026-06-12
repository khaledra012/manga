'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  getAdminMangaList, createManga, updateManga, deleteManga,
  getGenres, getStatusLabel, getTypeLabel, formatViews
} from '@/lib/api';
import type { AdminMangaListItem, GenreWithCount, MangaStatus, MangaType } from '@/lib/types';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import styles from '../page.module.css';
import mangaStyles from './page.module.css';

// ===================== Modal Form =====================
interface MangaFormProps {
  genres: GenreWithCount[];
  editTarget: AdminMangaListItem | null;
  onClose: () => void;
  onSaved: () => void;
}

function MangaFormModal({ genres, editTarget, onClose, onSaved }: MangaFormProps) {
  const [title, setTitle] = useState(editTarget?.title ?? '');
  const [titleAlt, setTitleAlt] = useState(editTarget?.title_alt ?? '');
  const [description, setDescription] = useState(editTarget?.description ?? '');
  const [status, setStatus] = useState<MangaStatus>(editTarget?.status ?? 'ongoing');
  const [type, setType] = useState<MangaType>(editTarget?.type ?? 'manga');
  const [author, setAuthor] = useState(editTarget?.author ?? '');
  const [artist, setArtist] = useState(editTarget?.artist ?? '');
  const [year, setYear] = useState(String(editTarget?.release_year ?? ''));
  const [selectedGenres, setSelectedGenres] = useState<number[]>(
    editTarget?.genres.map(g => g.id) ?? []
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(editTarget?.cover_url ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
        setError('');
      } else {
        setError('يرجى اختيار ملف صورة صالح (JPEG, PNG, WebP)');
      }
    }
  }

  function toggleGenre(id: number) {
    setSelectedGenres(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('العنوان مطلوب'); return; }
    setSubmitting(true);
    setError('');

    try {
      if (editTarget) {
        // تعديل — JSON
        await updateManga(editTarget.id, {
          title: title.trim(),
          title_alt: titleAlt.trim() || undefined,
          description: description.trim() || undefined,
          status, type,
          author: author.trim() || undefined,
          artist: artist.trim() || undefined,
          release_year: year ? Number(year) : undefined,
          genres: selectedGenres.join(',') || undefined,
        });
      } else {
        // إضافة — multipart
        const fd = new FormData();
        fd.append('title', title.trim());
        if (titleAlt) fd.append('title_alt', titleAlt.trim());
        if (description) fd.append('description', description.trim());
        fd.append('status', status);
        fd.append('type', type);
        if (author) fd.append('author', author.trim());
        if (artist) fd.append('artist', artist.trim());
        if (year) fd.append('release_year', year);
        if (selectedGenres.length > 0) fd.append('genres', selectedGenres.join(','));
        if (coverFile) fd.append('cover', coverFile);
        await createManga(fd);
      }
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حصل خطأ');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={mangaStyles.modalOverlay} onClick={onClose}>
      <div className={mangaStyles.modal} onClick={e => e.stopPropagation()}>
        <div className={mangaStyles.modalHeader}>
          <h2 className={mangaStyles.modalTitle}>
            {editTarget ? '✏️ تعديل المانجا' : '➕ إضافة مانجا جديدة'}
          </h2>
          <button className={mangaStyles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={mangaStyles.modalForm}>
          {/* Cover */}
          <div className={mangaStyles.coverSection}>
            <div
              className={`${mangaStyles.coverUpload} ${dragActive ? mangaStyles.dragActive : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              {coverPreview ? (
                <>
                  <Image
                    src={coverPreview}
                    alt="غلاف"
                    fill
                    style={{ objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
                    unoptimized
                  />
                  {dragActive && (
                    <div className={mangaStyles.coverDragOverlay}>
                      <span>أفلت الصورة هنا</span>
                    </div>
                  )}
                </>
              ) : (
                <span className={mangaStyles.coverPlaceholder}>
                  {dragActive ? 'أفلت الغلاف هنا' : <>📷<br />اختر غلاف أو اسحبه هنا</>}
                </span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleCoverChange}
              style={{ display: 'none' }}
            />
            <p className={mangaStyles.coverHint}>JPEG/PNG/WebP • حد أقصى 10MB</p>
          </div>

          {/* Fields */}
          <div className={mangaStyles.formGrid}>
            <div className={mangaStyles.fieldFull}>
              <label>العنوان *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="مثل: Naruto" required className={styles.searchInput} />
            </div>
            <div>
              <label>العنوان البديل</label>
              <input value={titleAlt} onChange={e => setTitleAlt(e.target.value)} placeholder="ناروتو" className={styles.searchInput} />
            </div>
            <div>
              <label>المؤلف</label>
              <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Masashi Kishimoto" className={styles.searchInput} />
            </div>
            <div>
              <label>الرسام</label>
              <input value={artist} onChange={e => setArtist(e.target.value)} placeholder="Masashi Kishimoto" className={styles.searchInput} />
            </div>
            <div>
              <label>سنة الإصدار</label>
              <input type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="1999" className={styles.searchInput} min="1900" max="2100" />
            </div>
            <div>
              <label>الحالة</label>
              <select value={status} onChange={e => setStatus(e.target.value as MangaStatus)} className={styles.filterSelect}>
                <option value="ongoing">مستمر</option>
                <option value="completed">مكتمل</option>
                <option value="hiatus">متوقف مؤقتاً</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>
            <div>
              <label>النوع</label>
              <select value={type} onChange={e => setType(e.target.value as MangaType)} className={styles.filterSelect}>
                <option value="manga">مانجا</option>
                <option value="manhwa">مانهوا</option>
                <option value="manhua">مانهوا صيني</option>
              </select>
            </div>
            <div className={mangaStyles.fieldFull}>
              <label>الوصف</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="وصف المانجا..." className={mangaStyles.textarea} rows={3} />
            </div>
            <div className={mangaStyles.fieldFull}>
              <label>التصنيفات</label>
              <div className={mangaStyles.genresPicker}>
                {genres.map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGenre(g.id)}
                    className={`${mangaStyles.genrePill} ${selectedGenres.includes(g.id) ? mangaStyles.genreSelected : ''}`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <p className={mangaStyles.formError}>⚠️ {error}</p>}

          <div className={mangaStyles.modalFooter}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>إلغاء</button>
            <button type="submit" className="btn btn-accent" disabled={submitting}>
              {submitting ? 'جاري الحفظ...' : editTarget ? 'حفظ التعديلات' : 'إضافة المانجا'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===================== Main Page =====================
export default function AdminMangaPage() {
  const [manga, setManga] = useState<AdminMangaListItem[]>([]);
  const [genres, setGenres] = useState<GenreWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminMangaListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminMangaListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadManga() {
    setLoading(true);
    try {
      const res = await getAdminMangaList({
        search: search || undefined,
        status: statusFilter as MangaStatus || undefined,
        type: typeFilter as MangaType || undefined,
        page,
        limit: 20,
      });
      setManga(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getGenres().then(r => setGenres(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(loadManga, 300);
    return () => clearTimeout(t);
  }, [search, statusFilter, typeFilter, page]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteManga(deleteTarget.id);
      setDeleteTarget(null);
      loadManga();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'فشل الحذف');
    } finally {
      setDeleting(false);
    }
  }

  function openAdd() { setEditTarget(null); setShowForm(true); }
  function openEdit(m: AdminMangaListItem) { setEditTarget(m); setShowForm(true); }
  function closeForm() { setShowForm(false); setEditTarget(null); }
  function onSaved() { closeForm(); loadManga(); }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>📚 إدارة المانجا</h1>
          <p className={styles.pageSubtitle}>{total} مانجا</p>
        </div>
        <div className={styles.headerActions}>
          <button className="btn btn-accent" onClick={openAdd}>
            ➕ إضافة مانجا
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="🔍 ابحث عن مانجا..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className={styles.searchInput}
        />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className={styles.filterSelect}>
          <option value="">كل الحالات</option>
          <option value="ongoing">مستمر</option>
          <option value="completed">مكتمل</option>
          <option value="hiatus">متوقف</option>
          <option value="cancelled">ملغي</option>
        </select>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className={styles.filterSelect}>
          <option value="">كل الأنواع</option>
          <option value="manga">مانجا</option>
          <option value="manhwa">مانهوا</option>
          <option value="manhua">مانهوا صيني</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className={styles.emptyState}><p>جاري التحميل...</p></div>
      ) : manga.length === 0 ? (
        <div className={styles.emptyState}>
          <p>لا توجد نتائج</p>
          <button className="btn btn-accent" onClick={openAdd}>إضافة مانجا</button>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>الغلاف</th>
                <th>العنوان</th>
                <th>النوع</th>
                <th>الحالة</th>
                <th>الفصول</th>
                <th>المشاهدات</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {manga.map((m) => (
                <tr key={m.id}>
                  <td>
                    {m.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.cover_url} alt={m.title} className={styles.coverThumb} />
                    ) : (
                      <div className={styles.noImg}>📚</div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{m.title}</div>
                    {m.title_alt && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.title_alt}</div>}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{getTypeLabel(m.type)}</td>
                  <td>
                    <span className={`badge ${mangaStyles[`status_${m.status}`]}`}>
                      {getStatusLabel(m.status)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{m.chapters_count}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{formatViews(m.views)}</td>
                  <td>
                    <div className={styles.actionBtns}>
                      <Link href={`/admin/manga/${m.id}`} className={styles.iconBtn} title="إدارة الفصول">
                        📖
                      </Link>
                      <button className={styles.iconBtn} onClick={() => openEdit(m)} title="تعديل">
                        ✏️
                      </button>
                      <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => setDeleteTarget(m)} title="حذف">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={mangaStyles.pagination}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn btn-ghost">
            ← السابق
          </button>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            صفحة {page} من {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="btn btn-ghost">
            التالي →
          </button>
        </div>
      )}

      {showForm && (
        <MangaFormModal
          genres={genres}
          editTarget={editTarget}
          onClose={closeForm}
          onSaved={onSaved}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="حذف المانجا"
        message={`هل أنت متأكد من حذف "${deleteTarget?.title}"؟ سيتم حذف كل فصولها وصورها نهائياً.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
