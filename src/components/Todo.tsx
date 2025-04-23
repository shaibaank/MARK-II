import React, { useState } from 'react';
import { Input, Button, Checkbox } from './FormControl';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card';

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
    <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Todo List</h1>
      
      <form onSubmit={handleAddTodo} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new todo..."
              error={error}
            />
          </div>
          <Button type="submit" variant="primary">
            Add
          </Button>
        </div>
      </form>

      <ul className="space-y-3">
        {todos.length === 0 ? (
          <li className="text-center text-gray-500">No todos yet. Add one above!</li>
        ) : (
          todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id)}
                  className="mr-3 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span
                  className={`${
                    todo.completed ? 'line-through text-gray-400' : 'text-gray-700'
                  }`}
                >
                  {todo.text}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Todo; 