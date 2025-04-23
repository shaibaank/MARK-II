import React from 'react';
import Todo from './components/Todo';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Todo Application</h1>
        <p className="text-gray-600">Built with React, TypeScript and Tailwind CSS</p>
      </header>
      <main>
        <Todo />
      </main>
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>© 2023 Todo App</p>
      </footer>
    </div>
  );
}

export default App; 