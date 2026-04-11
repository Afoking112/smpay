"use client";

import Featuresdropdown from './Featuresdropdown';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 md:px-10 py-5 bg-white shadow-[10px_10px_10px_rgba(0,0,0,0.1)]">
      <Link href="/" className="text-2xl font-bold text-blue-800">
        SM Pay
      </Link>

      <div className="space-x-6 hidden md:flex">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <Featuresdropdown />
        <Link href="/about" className="hover:text-blue-600">About</Link>
        <Link href="/contact" className="hover:text-blue-600">Contact</Link>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/signup"
          className="rounded px-5 py-2 text-blue-600 transition hover:bg-blue-50"
        >
          Sign up
        </Link>

        <Link
          href="/login"
          className="rounded bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
        >
          Login
        </Link>
      </div>
    </nav>
  );
}
