'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // تأثير الـ Navbar عند الـ scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // إغلاق الـ menu عند تغيير الصفحة
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/manga?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { href: '/',       label: 'الرئيسية' },
    { href: '/manga',  label: 'المانجا'  },
  ];

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <Image
            src="/logo.png"
            alt="MANGATAK"
            width={130}
            height={44}
            className={styles.logoImg}
            priority
          />
        </Link>

        {/* Nav Links — Desktop */}
        <nav className={styles.navLinks}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search Bar */}
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              ref={searchRef}
              type="text"
              className={styles.searchInput}
              placeholder="ابحث عن مانجا..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="بحث"
            />
          </div>
        </form>

        {/* Mobile Menu Button */}
        <button
          className={styles.menuBtn}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="فتح القائمة"
          aria-expanded={menuOpen}
        >
          <span className={`${styles.menuLine} ${menuOpen ? styles.menuOpen1 : ''}`} />
          <span className={`${styles.menuLine} ${menuOpen ? styles.menuOpen2 : ''}`} />
          <span className={`${styles.menuLine} ${menuOpen ? styles.menuOpen3 : ''}`} />
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        <nav className={styles.mobileLinks}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.mobileLink} ${pathname === link.href ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <form className={styles.mobileSearch} onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="ابحث عن مانجا..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.mobileSearchInput}
          />
          <button type="submit" className="btn btn-accent" style={{ padding: '0.6rem 1rem' }}>بحث</button>
        </form>
      </div>
    </header>
  );
}
