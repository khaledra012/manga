'use client';

import { useState, useEffect, FormEvent } from 'react';
import { getGenres, createGenre, updateGenre, deleteGenre } from '@/lib/api';
import type { GenreWithCount } from '@/lib/types';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import styles from '../page.module.css';
import genreStyles from './page.module.css';

export default function AdminGenresPage() {
  const [genres, setGenres] = useState<GenreWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [formName, setFormName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<GenreWithCount | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadGenres() {
    try {
      const res = await getGenres();
      setGenres(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل تحميل التصنيفات');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadGenres(); }, []);

  function startEdit(genre: GenreWithCount) {
    setEditingId(genre.id);
    setFormName(genre.name);
    setFormError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setFormName('');
    setFormError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formName.trim()) return;
    setSubmitting(true);
    setFormError('');

    try {
      if (editingId !== null) {
        await updateGenre(editingId, formName.trim());
      } else {
        await createGenre(formName.trim());
      }
      cancelEdit();
      await loadGenres();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'حصل خطأ');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteGenre(deleteTarget.id);
      setDeleteTarget(null);
      await loadGenres();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'فشل الحذف');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>🎭 إدارة التصنيفات</h1>
          <p className={styles.pageSubtitle}>{genres.length} تصنيف</p>
        </div>
      </div>

      {/* نموذج الإضافة / التعديل */}
      <div className={genreStyles.formCard}>
        <h2 className={genreStyles.formTitle}>
          {editingId ? '✏️ تعديل تصنيف' : '➕ إضافة تصنيف جديد'}
        </h2>
        <form onSubmit={handleSubmit} className={genreStyles.form}>
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="اسم التصنيف مثل: Action"
            className={styles.searchInput}
            disabled={submitting}
          />
          {formError && <p className={genreStyles.formError}>{formError}</p>}
          <div className={genreStyles.formActions}>
            <button
              type="submit"
              className="btn btn-accent"
              disabled={submitting || !formName.trim()}
            >
              {submitting ? '...' : editingId ? 'حفظ التعديل' : 'إضافة'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                إلغاء
              </button>
            )}
          </div>
        </form>
      </div>

      {/* الجدول */}
      {loading ? (
        <div className={styles.emptyState}><p>جاري التحميل...</p></div>
      ) : error ? (
        <div className={styles.errorBox}><p>⚠️ {error}</p></div>
      ) : genres.length === 0 ? (
        <div className={styles.emptyState}><p>لا توجد تصنيفات حالياً</p></div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>الاسم</th>
                <th>الـ Slug</th>
                <th>عدد المانجا</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {genres.map((genre) => (
                <tr key={genre.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{genre.id}</td>
                  <td style={{ fontWeight: 600 }}>{genre.name}</td>
                  <td>
                    <code className={genreStyles.slug}>{genre.slug}</code>
                  </td>
                  <td>
                    <span className="badge">{genre.mangaCount}</span>
                  </td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button
                        className={styles.iconBtn}
                        onClick={() => startEdit(genre)}
                        title="تعديل"
                      >
                        ✏️
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.danger}`}
                        onClick={() => setDeleteTarget(genre)}
                        title="حذف"
                      >
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="حذف التصنيف"
        message={`هل أنت متأكد من حذف تصنيف "${deleteTarget?.name}"؟ سيتم إزالته من كل المانجا المرتبطة به.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
