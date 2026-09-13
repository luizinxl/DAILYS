import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/config/supabase';

export interface TaskItem {
  id: string;
  title: string;
  done: boolean;
  due_date: string | null;      // Opcional, usado como prazo final
  scheduled_date: string | null; // Novo: quando a tarefa deve ser feita (ex: Hoje)
  reminder_at: string | null;    // Novo: data/hora do lembrete
  priority: 'low' | 'medium' | 'high';
  notes: string | null;
  created_at: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('household_tasks')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setTasks((data as TaskItem[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (taskData: Partial<TaskItem>) => {
    if (!taskData.title?.trim()) return;
    const { error: insertError } = await supabase
      .from('household_tasks')
      .insert({
        title: taskData.title.trim(),
        due_date: taskData.due_date || null,
        scheduled_date: taskData.scheduled_date || null,
        reminder_at: taskData.reminder_at || null,
        priority: taskData.priority || 'medium',
        notes: taskData.notes || null,
        done: false
      });
      
    if (insertError) {
      setError(insertError.message);
      return;
    }
    await fetchTasks();
  };

  const updateTask = async (id: string, updates: Partial<TaskItem>) => {
    const { error: updateError } = await supabase
      .from('household_tasks')
      .update(updates)
      .eq('id', id);
      
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await fetchTasks();
  };

  const toggleDone = async (id: string, done: boolean) => {
    return updateTask(id, { done });
  };

  const deleteTask = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('household_tasks')
      .delete()
      .eq('id', id);
      
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    await fetchTasks();
  };

  return { tasks, loading, error, addTask, updateTask, toggleDone, deleteTask, refresh: fetchTasks };
}
