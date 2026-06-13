'use client';

import { useState, useEffect, useRef, FormEvent, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  getMangaById, createChapter, updateChapter, deleteChapter,
  uploadPages, deletePage, updateMangaCover, parseChapterNumber, formatDate
} from '@/lib/api';
import type { MangaDetails, ChapterSummary, AdminPageItem, ChapterPage } from '@/lib/types';
import { getChapterById } from '@/lib/api';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import styles from '../page.module.css';
import detailStyles from './page.module.css';

type Params = Promise<{ id: string }>;

export default function AdminMangaDetailPage(props: { params: Params }) {
  const params = use(props.params);
  const mangaId = params.id;

  const [manga, setManga] = useState<MangaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Chapter form
  const [chapterNum, setChapterNum] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [editingChapter, setEditingChapter] = useState<ChapterSummary | null>(null);
  const [chapterSubmitting, setChapterSubmitting] = useState(false);
  const [chapterError, setChapterError] = useState('');

  // Delete chapter
  const [deleteChapterTarget, setDeleteChapterTarget] = useState<ChapterSummary | null>(null);
  const [deletingChapter, setDeletingChapter] = useState(false);

  // Pages section
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [chapterPages, setChapterPages] = useState<ChapterPage[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [deletePageTarget, setDeletePageTarget] = useState<string | null>(null);
  const [deletingPage, setDeletingPage] = useState(false);
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter(f => f.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        setUploadFiles(prev => [...prev, ...imageFiles]);
        setUploadError('');
      } else {
        setUploadError('يرجى اختيار ملفات صور صالحة فقط (JPEG, PNG, WebP)');
      }
    }
  }

  // Cover update
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [newCoverPreview, setNewCoverPreview] = useState('');
  const [updatingCover, setUpdatingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  async function loadManga() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await getMangaById(mangaId);
      setManga(res.data);
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        // تمييز 404 عن الأخطاء الأخرى
        if (e.message.includes('404') || e.message.includes('غير موجود') || e.message.includes('not found')) {
          setLoadError('404');
        } else {
          setLoadError(e.message || 'خطأ في الاتصال بالـ API');
        }
      } else {
        setLoadError('خطأ غير متوقع');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadManga(); }, [mangaId]);

  // ---- Chapter CRUD ----
  async function handleChapterSubmit(e: FormEvent) {
    e.preventDefault();
    if (!chapterNum) return;
    setChapterSubmitting(true);
    setChapterError('');
    try {
      if (editingChapter) {
        await updateChapter(editingChapter.id, {
          chapter_number: parseFloat(chapterNum),
          title: chapterTitle || undefined,
        });
      } else {
        await createChapter(mangaId, {
          chapter_number: parseFloat(chapterNum),
          title: chapterTitle || undefined,
        });
      }
      setChapterNum(''); setChapterTitle(''); setEditingChapter(null);
      loadManga();
    } catch (err: unknown) {
      setChapterError(err instanceof Error ? err.message : 'حصل خطأ');
    } finally {
      setChapterSubmitting(false);
    }
  }

  async function handleDeleteChapter() {
    if (!deleteChapterTarget) return;
    setDeletingChapter(true);
    try {
      await deleteChapter(deleteChapterTarget.id);
      setDeleteChapterTarget(null);
      if (selectedChapterId === deleteChapterTarget.id) {
        setSelectedChapterId(null);
        setChapterPages([]);
      }
      loadManga();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'فشل الحذف');
    } finally {
      setDeletingChapter(false);
    }
  }

  // ---- Pages ----
  async function loadChapterPages(chapterId: string) {
    setSelectedChapterId(chapterId);
    setPagesLoading(true);
    setChapterPages([]);
    try {
      const res = await getChapterById(chapterId);
      const sorted = [...res.data.pages].sort((a, b) => a.page_number - b.page_number);
      setChapterPages(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setPagesLoading(false);
    }
  }

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadFiles(prev => [...prev, ...files]);
      setUploadError('');
    }
  }

  async function handleUpload() {
    if (!selectedChapterId || uploadFiles.length === 0) return;
    setUploading(true);
    setUploadError('');
    try {
      await uploadPages(selectedChapterId, uploadFiles);
      setUploadFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadChapterPages(selectedChapterId);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'فشل الرفع');
    } finally {
      setUploading(false);
    }
  }

  async function handleDeletePage() {
    if (!deletePageTarget) return;
    setDeletingPage(true);
    try {
      await deletePage(deletePageTarget);
      setDeletePageTarget(null);
      if (selectedChapterId) loadChapterPages(selectedChapterId);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'فشل الحذف');
    } finally {
      setDeletingPage(false);
    }
  }

  // ---- Cover Update ----
  async function handleCoverUpdate() {
    if (!newCoverFile || !manga) return;
    setUpdatingCover(true);
    try {
      const fd = new FormData();
      fd.append('cover', newCoverFile);
      await updateMangaCover(manga.id, fd);
      setNewCoverFile(null);
      setNewCoverPreview('');
      loadManga();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'فشل تحديث الغلاف');
    } finally {
      setUpdatingCover(false);
    }
  }

  const sortedChapters = manga
    ? [...manga.chapters].sort((a, b) => parseChapterNumber(a.chapter_number) - parseChapterNumber(b.chapter_number))
    : [];

  if (loading) {
    return <div className={styles.page}><div className={styles.emptyState}><p>جاري التحميل...</p></div></div>;
  }

  if (!manga) {
    const isNotFound = loadError === '404';
    return (
      <div className={styles.page}>
        <div className={styles.errorBox}>
          <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            {isNotFound ? '🔍' : '⚠️'}
          </p>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
            {isNotFound ? 'المانجا مش موجودة في قاعدة البيانات' : 'مشكلة في تحميل المانجا'}
          </p>
          {!isNotFound && loadError && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', direction: 'ltr', background: 'rgba(255,100,100,0.1)', padding: '0.5rem', borderRadius: '6px' }}>
              {loadError}
            </p>
          )}
          {!isNotFound && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
              تأكد أن الباك اند شغال وإن NEXT_PUBLIC_API_URL متضبط صح على Vercel
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            {!isNotFound && (
              <button className="btn btn-accent" onClick={loadManga}>
                🔄 إعادة المحاولة
              </button>
            )}
            <Link href="/admin/manga" className="btn btn-ghost">← رجوع</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={detailStyles.breadcrumb}>
        <Link href="/admin/manga">📚 إدارة المانجا</Link>
        <span>/</span>
        <span>{manga.title}</span>
      </div>

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{manga.title}</h1>
          <p className={styles.pageSubtitle}>{manga.chapters.length} فصل • {manga.views.toLocaleString('ar-EG')} مشاهدة</p>
        </div>
        <Link href="/admin/manga" className="btn btn-ghost">← رجوع</Link>
      </div>

      <div className={detailStyles.layout}>
        {/* Sidebar — Cover + Info */}
        <div className={detailStyles.sidebar}>
          <div className={detailStyles.coverCard}>
            <Image
              src={newCoverPreview || manga.cover_url}
              alt={manga.title}
              width={180}
              height={260}
              className={detailStyles.cover}
              unoptimized
            />
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) { setNewCoverFile(f); setNewCoverPreview(URL.createObjectURL(f)); }
            }}
          />
          <button className="btn btn-ghost" onClick={() => coverInputRef.current?.click()} style={{ width: '100%', fontSize: '0.85rem' }}>
            🖼️ تغيير الغلاف
          </button>
          {newCoverFile && (
            <button className="btn btn-accent" onClick={handleCoverUpdate} disabled={updatingCover} style={{ width: '100%', fontSize: '0.85rem' }}>
              {updatingCover ? 'جاري الرفع...' : '✓ حفظ الغلاف الجديد'}
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className={detailStyles.content}>
          {/* ======= Chapter Form ======= */}
          <section className={detailStyles.section}>
            <h2 className={styles.sectionTitle}>
              {editingChapter ? `✏️ تعديل الفصل ${parseChapterNumber(editingChapter.chapter_number)}` : '➕ إضافة فصل جديد'}
            </h2>
            <form onSubmit={handleChapterSubmit} className={detailStyles.chapterForm}>
              <div className={detailStyles.chapterFormFields}>
                <div>
                  <label>رقم الفصل *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={chapterNum}
                    onChange={e => setChapterNum(e.target.value)}
                    placeholder="مثل: 1 أو 1.5"
                    className={styles.searchInput}
                    required
                  />
                </div>
                <div>
                  <label>عنوان الفصل (اختياري)</label>
                  <input
                    type="text"
                    value={chapterTitle}
                    onChange={e => setChapterTitle(e.target.value)}
                    placeholder="مثل: البداية"
                    className={styles.searchInput}
                  />
                </div>
              </div>
              {chapterError && <p className={detailStyles.fieldError}>{chapterError}</p>}
              <div className={detailStyles.chapterFormActions}>
                <button type="submit" className="btn btn-accent" disabled={chapterSubmitting}>
                  {chapterSubmitting ? 'جاري...' : editingChapter ? 'حفظ التعديل' : 'إضافة الفصل'}
                </button>
                {editingChapter && (
                  <button type="button" className="btn btn-ghost" onClick={() => { setEditingChapter(null); setChapterNum(''); setChapterTitle(''); }}>
                    إلغاء
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* ======= Chapters List ======= */}
          <section className={detailStyles.section}>
            <h2 className={styles.sectionTitle}>📋 قائمة الفصول ({sortedChapters.length})</h2>
            {sortedChapters.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: 'var(--space-4) 0' }}>لا توجد فصول بعد</p>
            ) : (
              <div className={detailStyles.chaptersList}>
                {sortedChapters.map(ch => (
                  <div key={ch.id} className={`${detailStyles.chapterRow} ${selectedChapterId === ch.id ? detailStyles.chapterSelected : ''}`}>
                    <div className={detailStyles.chapterInfo}>
                      <span className={detailStyles.chNum}>فصل {parseChapterNumber(ch.chapter_number)}</span>
                      {ch.title && <span className={detailStyles.chTitle}>{ch.title}</span>}
                      <span className={detailStyles.chDate}>{formatDate(ch.created_at)}</span>
                    </div>
                    <div className={detailStyles.chapterActions}>
                      <button
                        className={`${styles.iconBtn} ${selectedChapterId === ch.id ? detailStyles.activeBtn : ''}`}
                        onClick={() => loadChapterPages(ch.id)}
                        title="إدارة الصفحات"
                      >
                        🖼️
                      </button>
                      <button
                        className={styles.iconBtn}
                        onClick={() => { setEditingChapter(ch); setChapterNum(String(parseChapterNumber(ch.chapter_number))); setChapterTitle(ch.title || ''); }}
                        title="تعديل"
                      >
                        ✏️
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.danger}`}
                        onClick={() => setDeleteChapterTarget(ch)}
                        title="حذف"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ======= Pages Manager ======= */}
          {selectedChapterId && (
            <section className={detailStyles.section}>
              <h2 className={styles.sectionTitle}>
                🖼️ صفحات الفصل {parseChapterNumber(
                  sortedChapters.find(c => c.id === selectedChapterId)?.chapter_number ?? '0'
                )}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: 'var(--space-2)' }}>
                  ({chapterPages.length} صفحة)
                </span>
              </h2>

              {/* Upload Zone */}
              <div
                className={`${detailStyles.uploadZone} ${dragActive ? detailStyles.dragActive : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFilePick}
                  style={{ display: 'none' }}
                />
                <span className={detailStyles.uploadIcon}>📂</span>
                <p className={detailStyles.uploadText}>
                  {dragActive
                    ? 'أفلت صور الفصل هنا...'
                    : uploadFiles.length > 0
                    ? `${uploadFiles.length} صورة مختارة — اضغط أو اسحب صورًا أخرى للتغيير`
                    : 'اضغط أو اسحب الصور هنا لاختيار صور الفصل'}
                </p>
                <p className={detailStyles.uploadHint}>JPEG/PNG/WebP • الترتيب حسب ترتيب الاختيار</p>
              </div>

              {uploadFiles.length > 0 && (
                <div className={detailStyles.uploadPreview}>
                  {uploadFiles.map((f, i) => (
                    <div key={i} className={detailStyles.previewThumb}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL.createObjectURL(f)} alt={`${i + 1}`} className={detailStyles.thumbImg} />
                      <span className={detailStyles.thumbNum}>{i + 1}</span>
                      <button
                        type="button"
                        className={detailStyles.removeThumbBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadFiles(prev => prev.filter((_, idx) => idx !== i));
                        }}
                        title="إزالة هذه الصورة"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploadError && <p className={detailStyles.fieldError}>{uploadError}</p>}

              {uploadFiles.length > 0 && (
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                  <button
                    className="btn btn-accent"
                    onClick={handleUpload}
                    disabled={uploading}
                    style={{ flex: 1 }}
                  >
                    {uploading ? 'جاري الرفع...' : `⬆️ رفع ${uploadFiles.length} صفحة`}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setUploadFiles([]);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    disabled={uploading}
                  >
                    إلغاء التحديد
                  </button>
                </div>
              )}

              {/* Existing Pages */}
              {pagesLoading ? (
                <p style={{ color: 'var(--text-muted)' }}>جاري تحميل الصفحات...</p>
              ) : chapterPages.length > 0 ? (
                <div className={detailStyles.pagesGrid}>
                  {chapterPages.map(page => (
                    <div key={page.id} className={detailStyles.pageCard}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={page.image_url} alt={`صفحة ${page.page_number}`} className={detailStyles.pageImg} loading="lazy" />
                      <div className={detailStyles.pageOverlay}>
                        <span className={detailStyles.pageNum}>{page.page_number}</span>
                        <button
                          className={detailStyles.deletePageBtn}
                          onClick={() => setDeletePageTarget(page.id)}
                          title="حذف الصفحة"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>لا توجد صفحات مرفوعة لهذا الفصل</p>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={!!deleteChapterTarget}
        title="حذف الفصل"
        message={`هل أنت متأكد من حذف الفصل ${parseChapterNumber(deleteChapterTarget?.chapter_number ?? '0')}؟ سيتم حذف كل صفحاته نهائياً.`}
        onConfirm={handleDeleteChapter}
        onCancel={() => setDeleteChapterTarget(null)}
        loading={deletingChapter}
      />

      <ConfirmDialog
        open={!!deletePageTarget}
        title="حذف الصفحة"
        message="هل أنت متأكد من حذف هذه الصفحة نهائياً؟"
        confirmLabel="حذف الصفحة"
        onConfirm={handleDeletePage}
        onCancel={() => setDeletePageTarget(null)}
        loading={deletingPage}
      />
    </div>
  );
}
