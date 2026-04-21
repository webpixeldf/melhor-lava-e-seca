'use client';

import Link from 'next/link';
import { useState } from 'react';
import { site } from '@/lib/site';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="logo" aria-label={`${site.name} — voltar ao início`}>
          <svg viewBox="0 0 48 48" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="44" height="44" rx="11" fill="url(#gLogo)" />
            <circle cx="24" cy="24" r="11" fill="#fff" />
            <circle cx="24" cy="24" r="6.5" fill="#E8F1FF" />
            <circle cx="24" cy="24" r="2.5" fill="#0B5FFF" />
            <circle cx="37" cy="11" r="2.2" fill="#fff" />
            <defs>
              <linearGradient id="gLogo" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0B5FFF" />
                <stop offset="1" stopColor="#0847B8" />
              </linearGradient>
            </defs>
          </svg>
          <span className="logo-tag">
            <span>Melhor Lava e Seca</span>
            <small>Reviews e ofertas 2026</small>
          </span>
        </Link>

        <button
          className="nav-toggle"
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          ☰
        </button>

        <nav className={`main-nav ${open ? 'open' : ''}`} aria-label="Menu principal">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
