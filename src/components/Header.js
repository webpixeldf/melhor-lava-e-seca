'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { site } from '@/lib/site';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="logo" aria-label={`${site.name} — voltar ao início`}>
          {/* A logomarca ja tem o nome escrito, entao o texto ao lado viraria
              repeticao. Fica so a tagline. */}
          <Image
            src={site.logoWebp}
            alt={site.name}
            width={site.logoWidth}
            height={site.logoHeight}
            priority
          />
          <span className="logo-tag">
            <small>Comparativos e guias</small>
          </span>
        </Link>

        <button
          className="nav-toggle"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-controls="menu-principal"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          ☰
        </button>

        <nav id="menu-principal" className={`main-nav ${open ? 'open' : ''}`} aria-label="Menu principal">
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
