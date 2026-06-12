import styles from './SkeletonCard.module.css';

export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={`skeleton ${styles.cover}`} />
      <div className={styles.info}>
        <div className={`skeleton ${styles.title}`} />
        <div className={`skeleton ${styles.titleShort}`} />
        <div className={`skeleton ${styles.meta}`} />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 20 }: { count?: number }) {
  return (
    <div className="manga-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
