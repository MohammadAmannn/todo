
import React from 'react';
import { Todo, TodoCategory, UserRole } from '../types';
import { Button } from './Button';

interface TodoCardProps {
  todo: Todo;
  currentUserRole: UserRole;
  currentUserId: string;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

export const TodoCard: React.FC<TodoCardProps> = ({ 
  todo, 
  currentUserRole, 
  currentUserId, 
  onToggle, 
  onDelete, 
  onEdit 
}) => {
  const isOwner = todo.userId === currentUserId;
  const isAdmin = currentUserRole === UserRole.ADMIN;
  const canModify = isOwner || isAdmin;

  const isUrgent = todo.category === TodoCategory.URGENT;

  return (
    <div className={`p-5 rounded-xl border-2 transition-all duration-200 ${
      todo.completed ? 'bg-slate-50 border-slate-100 opacity-75' : 'bg-white border-white shadow-sm hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              isUrgent ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {todo.category}
            </span>
            {isAdmin && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700">
                User: {todo.userName || todo.userId}
              </span>
            )}
          </div>
          
          <h3 className={`text-lg font-semibold text-slate-800 ${todo.completed ? 'line-through text-slate-400' : ''}`}>
            {todo.title}
          </h3>
          
          {todo.description && (
            <p className="mt-1 text-sm text-slate-600 line-clamp-2">
              {todo.description}
            </p>
          )}

          {todo.dueDate && (
            <div className="mt-3 flex items-center text-xs text-slate-500 gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Due: {new Date(todo.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input 
            type="checkbox" 
            checked={todo.completed}
            onChange={(e) => onToggle(todo.id, e.target.checked)}
            disabled={!canModify}
            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
        {canModify && (
          <>
            <Button variant="ghost" size="sm" onClick={() => onEdit(todo)} className="text-sm">
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(todo.id)} className="text-sm text-red-600 hover:bg-red-50">
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
