"use client";

import { useState } from 'react';
import Featuresdropdown from './Featuresdropdown';
import Link from 'next/link';
import { FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-4 z-40 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <nav className="surface-panel-soft rounded-full px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0d1a2b] text-sm font-semibold tracking-[0.24em] text-[#7df2c8] ring-1 ring-white/10">
              SM
            </span>
            <div>
              <p className="text-sm font-semibold tracking-[0.16em] text-white">SM PAY</p>
              <p className="text-xs text-[#8ea4ba]">Payments command center</p>
            </div>
          </Link>

          <div className="hidden items-center gap-7 text-sm text-[#dce6f0] md:flex">
            <Link href="/" className="transition hover:text-[#7df2c8]">Home</Link>
            <Featuresdropdown />
            <Link href="/about" className="transition hover:text-[#7df2c8]">About</Link>
            <Link href="/contact" className="transition hover:text-[#7df2c8]">Contact</Link>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/signup" className="button-secondary px-5 py-2.5 text-sm">
              Sign up
            </Link>
            <Link href="/login" className="button-primary px-5 py-2.5 text-sm">
              Login
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 text-white md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <FiX className="text-lg" /> : <FiMenu className="text-lg" />}
          </button>
        </div>

        {menuOpen ? (
          <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 text-sm text-[#dce6f0] md:hidden">
            <Link href="/" onClick={() => setMenuOpen(false)} className="rounded-2xl px-2 py-2 hover:bg-white/5">Home</Link>
            <Link href="/about" onClick={() => setMenuOpen(false)} className="rounded-2xl px-2 py-2 hover:bg-white/5">About</Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)} className="rounded-2xl px-2 py-2 hover:bg-white/5">Contact</Link>
            <Link href="/signup" onClick={() => setMenuOpen(false)} className="rounded-2xl px-2 py-2 hover:bg-white/5">Sign up</Link>
            <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-2xl px-2 py-2 hover:bg-white/5">Login</Link>
          </div>
        ) : null}
      </nav>
    </header>
  );
}
