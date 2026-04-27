"use client";

import { useState } from 'react';

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [feedback, setFeedback] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!email.trim()) {
            setFeedback('Please enter an email address.');
            return;
        }
        setFeedback('Thanks for subscribing! We will keep you updated.');
        setEmail('');
    };

    return (
        <section className="py-20 px-10 bg-gray-100 text-center">

            <h2 className="text-3xl font-bold mb-4">
                Join Our Newsletter
            </h2>

            <p className="mb-6">
                Get updates on new features and offers.
            </p>

            <form onSubmit={handleSubmit} className="flex justify-center gap-4 flex-wrap">

                <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email"
                    className="px-4 py-2 border rounded w-72"
                    required
                />

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded"
                >
                    Subscribe
                </button>

            </form>

            {feedback ? (
                <p className="mt-4 text-sm text-gray-600">{feedback}</p>
            ) : null}

        </section>
    )
}
