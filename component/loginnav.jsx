"use client";
import Featuresdropdown from './Featuresdropdown';
import Link from 'next/link';
export default function loginnav() {
    return (
        <nav className="flex justify-between items-center px-10 py-5 bg-white shadow-[10px 10px 10px rgba(0,0,0,0.1)]">
            <h1 className="text-2xl font-bold text-blue-800">SM Pay</h1>

            <div className="space-x-6 hidden md:flex">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <Featuresdropdown />
                <Link href="/about" className="hover:text-blue-600">About</Link>
                <Link href="/contact" className="hover:text-blue-600">Contact</Link>
            </div>
            <div className="">
                <Link href={'/profile'}>
                    <button className="bg-white-500 text-blue-600 px-5 py-2 rounded cursor-pointer rounded-[50%] h-[60px]">
                        Profile
                    </button>
                </Link>


            </div>

        </nav>
    );
}
