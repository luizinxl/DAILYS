import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

export type PersonalStatus = 'em_andamento' | 'concluido' | 'pausado';

export interface PersonalCourse {
  id: string;
  title: string;
  institution: string | null;
  status: PersonalStatus;
  progress: number;
  start_date: string | null;
  expected_end_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface PersonalGoal {
  id: string;
  title: string;
  category: string | null;
  target_date: string | null;
  status: PersonalStatus;
  progress: number;
  notes: string | null;
  created_at: string;
}

export function usePersonal() {
  const [courses, setCourses] = useState<PersonalCourse[]>([]);
  const [goals, setGoals] = useState<PersonalGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesRes, goalsRes] = await Promise.all([
        supabase.from('personal_courses').select('*').order('created_at', { ascending: false }),
        supabase.from('personal_goals').select('*').order('created_at', { ascending: false }),
      ]);
      if (coursesRes.error) throw coursesRes.error;
      if (goalsRes.error) throw goalsRes.error;
      setCourses(coursesRes.data ?? []);
      setGoals(goalsRes.data ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar dados pessoais');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addCourse = useCallback(async (course: Partial<PersonalCourse>) => {
    const { error: insertError } = await supabase.from('personal_courses').insert(course);
    if (insertError) throw insertError;
    await fetchAll();
  }, [fetchAll]);

  const updateCourse = useCallback(async (id: string, patch: Partial<PersonalCourse>) => {
    const { error: updateError } = await supabase.from('personal_courses').update(patch).eq('id', id);
    if (updateError) throw updateError;
    await fetchAll();
  }, [fetchAll]);

  const deleteCourse = useCallback(async (id: string) => {
    const { error: deleteError } = await supabase.from('personal_courses').delete().eq('id', id);
    if (deleteError) throw deleteError;
    await fetchAll();
  }, [fetchAll]);

  const addGoal = useCallback(async (goal: Partial<PersonalGoal>) => {
    const { error: insertError } = await supabase.from('personal_goals').insert(goal);
    if (insertError) throw insertError;
    await fetchAll();
  }, [fetchAll]);

  const updateGoal = useCallback(async (id: string, patch: Partial<PersonalGoal>) => {
    const { error: updateError } = await supabase.from('personal_goals').update(patch).eq('id', id);
    if (updateError) throw updateError;
    await fetchAll();
  }, [fetchAll]);

  const deleteGoal = useCallback(async (id: string) => {
    const { error: deleteError } = await supabase.from('personal_goals').delete().eq('id', id);
    if (deleteError) throw deleteError;
    await fetchAll();
  }, [fetchAll]);

  return {
    courses,
    goals,
    loading,
    error,
    refresh: fetchAll,
    addCourse,
    updateCourse,
    deleteCourse,
    addGoal,
    updateGoal,
    deleteGoal,
  };
}
