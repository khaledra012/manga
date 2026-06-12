import type { MangaStatus } from '@/lib/types';
import { getStatusLabel } from '@/lib/api';
import styles from './StatusBadge.module.css';

interface Props {
  status: MangaStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  return (
    <span className={`${styles.badge} ${styles[status]} ${size === 'sm' ? styles.sm : ''}`}>
      <span className={styles.dot} />
      {getStatusLabel(status)}
    </span>
  );
}
