'use client';

import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'تأكيد الحذف',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.icon}>🗑️</div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button
            onClick={onCancel}
            className="btn btn-ghost"
            disabled={loading}
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className={styles.dangerBtn}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
