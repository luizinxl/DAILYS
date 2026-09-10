import { useState } from 'react';
import { Card } from '@/components/common/Card';
import { usePersonal, type PersonalStatus } from '../../hooks/usePersonal';

const statusLabel: Record<PersonalStatus, string> = {
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  pausado: 'Pausado',
};

const statusColor: Record<PersonalStatus, string> = {
  em_andamento: '#818CF8',
  concluido: '#2ECC71',
  pausado: '#8E95A5',
};

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-1.5 rounded-full bg-[#1D2029] overflow-hidden">
      <div className="h-full bg-[#818CF8]" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export default function Page() {
  const { courses, goals, loading, error, addCourse, deleteCourse, addGoal, deleteGoal, updateCourse, updateGoal } = usePersonal();
  const [courseTitle, setCourseTitle] = useState('');
  const [courseInstitution, setCourseInstitution] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState('');

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) return;
    await addCourse({ title: courseTitle.trim(), institution: courseInstitution.trim() || null });
    setCourseTitle('');
    setCourseInstitution('');
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    await addGoal({ title: goalTitle.trim(), category: goalCategory.trim() || null });
    setGoalTitle('');
    setGoalCategory('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Pessoal</h1>
        <p className="text-[#8E95A5] text-sm mt-1">Cursos, metas e trilhas de conhecimento.</p>
      </div>

      {error && (
        <Card variant="personal" className="p-6">
          <p className="text-sm text-[#F43F5E]">{error}</p>
        </Card>
      )}

      <Card variant="personal" className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Cursos</h2>

        <form onSubmit={handleAddCourse} className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            placeholder="Nome do curso"
            className="flex-1 rounded-lg bg-[#1D2029] border border-[#232735] px-3 py-2 text-sm text-white placeholder:text-[#64748B] outline-none focus:border-[#818CF8]"
          />
          <input
            type="text"
            value={courseInstitution}
            onChange={(e) => setCourseInstitution(e.target.value)}
            placeholder="Instituição (opcional)"
            className="flex-1 rounded-lg bg-[#1D2029] border border-[#232735] px-3 py-2 text-sm text-white placeholder:text-[#64748B] outline-none focus:border-[#818CF8]"
          />
          <button type="submit" className="px-4 py-2 rounded-lg bg-[#818CF8] hover:bg-[#6366F1] text-white text-sm font-medium transition-colors">
            Adicionar
          </button>
        </form>

        {!loading && courses.length === 0 && (
          <p className="text-sm text-[#8E95A5]">Nenhum curso cadastrado ainda.</p>
        )}

        <div className="space-y-3">
          {courses.map((c) => (
            <div key={c.id} className="rounded-xl bg-[#1D2029] border border-[#232735] p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{c.title}</p>
                  {c.institution && <p className="text-xs text-[#8E95A5] mt-0.5">{c.institution}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={c.status}
                    onChange={(e) => updateCourse(c.id, { status: e.target.value as PersonalStatus })}
                    className="text-xs rounded-md bg-[#12141C] border border-[#232735] px-2 py-1 text-white"
                    style={{ color: statusColor[c.status] }}
                  >
                    <option value="em_andamento">Em andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="pausado">Pausado</option>
                  </select>
                  <button onClick={() => deleteCourse(c.id)} className="text-xs text-[#F43F5E] hover:text-[#ff6b81]">Remover</button>
                </div>
              </div>
              <div className="mt-3">
                <ProgressBar value={c.progress} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card variant="personal" className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Metas</h2>

        <form onSubmit={handleAddGoal} className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            value={goalTitle}
            onChange={(e) => setGoalTitle(e.target.value)}
            placeholder="Descreva a meta"
            className="flex-1 rounded-lg bg-[#1D2029] border border-[#232735] px-3 py-2 text-sm text-white placeholder:text-[#64748B] outline-none focus:border-[#818CF8]"
          />
          <input
            type="text"
            value={goalCategory}
            onChange={(e) => setGoalCategory(e.target.value)}
            placeholder="Categoria (opcional)"
            className="flex-1 rounded-lg bg-[#1D2029] border border-[#232735] px-3 py-2 text-sm text-white placeholder:text-[#64748B] outline-none focus:border-[#818CF8]"
          />
          <button type="submit" className="px-4 py-2 rounded-lg bg-[#818CF8] hover:bg-[#6366F1] text-white text-sm font-medium transition-colors">
            Adicionar
          </button>
        </form>

        {!loading && goals.length === 0 && (
          <p className="text-sm text-[#8E95A5]">Nenhuma meta cadastrada ainda.</p>
        )}

        <div className="space-y-3">
          {goals.map((g) => (
            <div key={g.id} className="rounded-xl bg-[#1D2029] border border-[#232735] p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{g.title}</p>
                  {g.category && <p className="text-xs text-[#8E95A5] mt-0.5">{g.category}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={g.status}
                    onChange={(e) => updateGoal(g.id, { status: e.target.value as PersonalStatus })}
                    className="text-xs rounded-md bg-[#12141C] border border-[#232735] px-2 py-1 text-white"
                    style={{ color: statusColor[g.status] }}
                  >
                    <option value="em_andamento">Em andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="pausado">Pausado</option>
                  </select>
                  <button onClick={() => deleteGoal(g.id)} className="text-xs text-[#F43F5E] hover:text-[#ff6b81]">Remover</button>
                </div>
              </div>
              <div className="mt-3">
                <ProgressBar value={g.progress} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
