import React, { useState } from 'react';
import Button from './Button';
import { Input } from './FormControl';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

const Todo: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [error, setError] = useState('');

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTodo.trim()) {
      setError('Todo item cannot be empty');
      return;
    }

    setError('');
    setTodos([
      ...todos,
      {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
      },
    ]);
    setNewTodo('');
  };

  const handleToggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Todo List</h2>
      <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
        <Input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo"
          className="flex-grow"
        />
        <Button type="submit">Add</Button>
      </form>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <ul className="space-y-2">
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center justify-between p-2 border-b">
            <span
              className={`cursor-pointer ${todo.completed ? 'line-through text-gray-500' : ''}`}
              onClick={() => handleToggleTodo(todo.id)}
            >
              {todo.text}
            </span>
            <Button onClick={() => handleDeleteTodo(todo.id)} size="sm" variant="destructive">
              Delete
            </Button>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-sm text-gray-500">
        {todos.length} item(s)
      </div>
    </div>
  );
};

export default Todo; 