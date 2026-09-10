import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/config/supabase';

export interface HouseholdTask {
  id: string;
  title: string;
  done: boolean;
  due_date: string | null;
  created_at: string;
}

export function useHouseholdTasks() {
  const [tasks, setTasks] = useState<HouseholdTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('household_tasks')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false });
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setTasks((data as HouseholdTask[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (title: string, dueDate?: string) => {
    if (!title.trim()) return;
    const { error: insertError } = await supabase
      .from('household_tasks')
      .insert({ title: title.trim(), due_date: dueDate || null, done: false });
    if (insertError) {
      setError(insertError.message);
      return;
    }
    await fetchTasks();
  };

  const toggleDone = async (id: string, done: boolean) => {
    const { error: updateError } = await supabase
      .from('household_tasks')
      .update({ done })
      .eq('id', id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await fetchTasks();
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

  return { tasks, loading, error, addTask, toggleDone, deleteTask, refresh: fetchTasks };
}
