import { useState } from 'react';
import { Trash2, Plus, CheckCircle2, Circle, Calendar } from 'lucide-react';
import { useHouseholdTasks } from '@/hooks/useHouseholdTasks';

export default function Casa() {
  const {
    tasks,
    loading,
    error,
    addTask,
    toggleDone,
    deleteTask,
  } = useHouseholdTasks();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle, newTaskDue || undefined);
    setNewTaskTitle('');
    setNewTaskDue('');
  };

  const pendingTasks = tasks.filter((t) => !t.done);
  const doneTasks = tasks.filter((t) => t.done);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Tarefas Domésticas</h1>
        <p className="text-[#8E95A5] text-sm mt-1">
          Acompanhe suas tarefas de casa.
        </p>
      </div>

      <div className="bg-[#12141C] p-4 rounded-xl border border-[#232735]">
        <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="O que precisa ser feito?"
            className="flex-1 bg-[#1A1D27] border border-[#282E42] rounded-lg px-4 py-2 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#7C5CFC]"
          />
          <input
            type="date"
            value={newTaskDue}
            onChange={(e) => setNewTaskDue(e.target.value)}
            className="bg-[#1A1D27] border border-[#282E42] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#7C5CFC] w-full sm:w-auto"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-[#7C5CFC] hover:bg-[#6B4CE0] text-white text-sm font-semibold rounded-lg px-5 py-2 transition-colors"
          >
            <Plus size={16} />
            Adicionar
          </button>
        </form>
      </div>

      {error && <p className="text-[#F43F5E] text-sm mb-3">{error}</p>}

      {loading ? (
        <p className="text-[#8E95A5] text-sm">Carregando...</p>
      ) : tasks.length === 0 ? (
        <p className="text-[#8E95A5] text-sm">Nenhuma tarefa cadastrada ainda.</p>
      ) : (
        <div className="space-y-8">
          {/* Tarefas Pendentes */}
          {pendingTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4">A Fazer</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col bg-[#1A1D27] border border-[#282E42] hover:border-[#384058] rounded-xl p-4 transition-colors group relative"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <button onClick={() => toggleDone(task.id, true)} className="text-[#8E95A5] hover:text-[#2ECC71] transition-colors mt-0.5">
                        <Circle size={20} />
                      </button>
                      <button onClick={() => deleteTask(task.id)} className="text-[#64748B] hover:text-[#F43F5E] opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-sm font-medium text-white mb-3 flex-1">{task.title}</p>
                    {task.due_date && (
                      <div className="flex items-center gap-1.5 text-xs text-[#8E95A5] bg-[#12141C] w-fit px-2 py-1 rounded-md">
                        <Calendar size={12} />
                        <span>{new Date(task.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tarefas Concluídas */}
          {doneTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4 opacity-60">Concluídas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {doneTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col bg-[#1A1D27]/40 border border-[#282E42]/50 rounded-xl p-4 opacity-60 group relative"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <button onClick={() => toggleDone(task.id, false)} className="text-[#2ECC71] transition-colors mt-0.5">
                        <CheckCircle2 size={20} />
                      </button>
                      <button onClick={() => deleteTask(task.id)} className="text-[#64748B] hover:text-[#F43F5E] opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-sm font-medium text-white line-through mb-3 flex-1">{task.title}</p>
                    {task.due_date && (
                      <div className="flex items-center gap-1.5 text-xs text-[#8E95A5] bg-[#12141C]/50 w-fit px-2 py-1 rounded-md">
                        <Calendar size={12} />
                        <span>{new Date(task.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
