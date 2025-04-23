'use client';

import { useState } from 'react';
import Todo from '../components/Todo';

export default function Home() {
  const [activeScreen, setActiveScreen] = useState('todo');

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Todo Application</h1>
          <p className="text-gray-600">Built with Next.js, TypeScript and Tailwind CSS</p>
        </header>
        <div className="bg-white rounded-lg shadow-md p-6">
          <Todo />
        </div>
      </div>
    </main>
  );
}
