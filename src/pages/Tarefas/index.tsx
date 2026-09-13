import React, { useState } from 'react';
import { 
  Sun, Star, CalendarDays, ListTodo, CheckCircle2, Plus, 
  Trash2, Bell, Clock, AlertCircle, X, Check, Calendar
} from 'lucide-react';
import clsx from 'clsx';
import { useTasks, TaskItem } from '@/hooks/useTasks';
import { useModuleColors } from '@/hooks/useModuleColors';
import Card from '@/components/common/Card';

type FilterType = 'today' | 'important' | 'planned' | 'all' | 'completed';

export default function TarefasDashboard() {
  const { tasks, loading, error, addTask, updateTask, toggleDone, deleteTask } = useTasks();
  const { colors, defaultModuleColors } = useModuleColors();
  const themeColor = colors['casa'] || defaultModuleColors['casa'] || '#7C5CFC';

  const [activeFilter, setActiveFilter] = useState<FilterType>('today');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    due_date: '',
    scheduled_date: '',
    reminder_at: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    notes: ''
  });

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    await addTask(newTask);
    setNewTask({
      title: '',
      due_date: '',
      scheduled_date: '',
      reminder_at: '',
      priority: 'medium',
      notes: ''
    });
    setShowAddForm(false);
  };

  const getFilteredTasks = () => {
    const todayStr = new Date().toISOString().substring(0, 10);
    
    switch (activeFilter) {
      case 'today':
        return tasks.filter(t => !t.done && (t.scheduled_date === todayStr || t.due_date === todayStr));
      case 'important':
        return tasks.filter(t => !t.done && t.priority === 'high');
      case 'planned':
        return tasks.filter(t => !t.done && (t.scheduled_date || t.due_date));
      case 'completed':
        return tasks.filter(t => t.done);
      case 'all':
      default:
        return tasks.filter(t => !t.done);
    }
  };

  const filteredTasks = getFilteredTasks();

  const sidebarFilters = [
    { id: 'today', label: 'Meu Dia', icon: Sun },
    { id: 'important', label: 'Importantes', icon: Star },
    { id: 'planned', label: 'Planejadas', icon: CalendarDays },
    { id: 'all', label: 'Todas', icon: ListTodo },
    { id: 'completed', label: 'Concluídas', icon: CheckCircle2 },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full w-full max-w-[1400px] mx-auto">
      
      {/* Sub-sidebar for Tasks */}
      <div className="lg:w-64 shrink-0 flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2 px-2">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-opacity-15"
            style={{ backgroundColor: `${themeColor}26`, color: themeColor }}
          >
            <ListTodo size={20} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Tarefas</h1>
        </div>

        {/* Capsule Navigation (Mini Sidebar) */}
        <div className="bg-[#1A1D27]/80 rounded-3xl p-3 border border-[#232735] flex flex-col gap-1">
          {sidebarFilters.map((filter) => {
            const isActive = activeFilter === filter.id;
            const Icon = filter.icon;
            
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as FilterType)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-medium group",
                  isActive 
                    ? "bg-[#202535] text-white shadow-sm" 
                    : "text-[#8E95A5] hover:bg-[#202535]/50 hover:text-white"
                )}
                style={isActive ? { borderLeft: `4px solid ${themeColor}` } : { borderLeft: '4px solid transparent' }}
              >
                <Icon 
                  size={18} 
                  className={clsx(
                    "transition-colors", 
                    isActive ? "" : "group-hover:text-white"
                  )} 
                  style={isActive ? { color: themeColor } : {}}
                />
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Task Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#12141C] border border-[#1E2230] rounded-3xl overflow-hidden relative">
        
        {/* Header for Active Filter */}
        <div className="px-8 py-6 border-b border-[#1E2230] flex items-center justify-between bg-[#161924]/50">
          <h2 className="text-xl font-bold text-white capitalize flex items-center gap-2">
            {sidebarFilters.find(f => f.id === activeFilter)?.label}
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-transform active:scale-95 shadow-lg"
            style={{ backgroundColor: themeColor, boxShadow: `0 4px 14px -4px ${themeColor}80` }}
          >
            <Plus size={18} />
            Nova Tarefa
          </button>
        </div>

        {error && (
          <div className="m-6 p-4 rounded-xl bg-[#F43F5E]/10 border border-[#F43F5E]/20 flex items-start gap-3">
            <AlertCircle size={20} className="text-[#F43F5E] shrink-0 mt-0.5" />
            <div className="text-sm text-[#F43F5E]">
              <p className="font-semibold mb-1">Erro de conexão</p>
              <p className="leading-relaxed opacity-90">{error}</p>
              <p className="mt-2 text-xs opacity-75">
                Se você adicionou novos campos, lembre-se de rodar o script SQL no seu Supabase.
              </p>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeColor }} />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
              <ListTodo size={48} className="text-[#384058] mb-4" />
              <p className="text-[#8E95A5]">Nenhuma tarefa encontrada aqui.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map(task => (
                <div 
                  key={task.id} 
                  className={clsx(
                    "group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200",
                    task.done ? "bg-[#161924] border-[#1E2230] opacity-60" : "bg-[#1A1D27] border-[#282E42] hover:border-[#384058]"
                  )}
                >
                  <button
                    onClick={() => toggleDone(task.id, !task.done)}
                    className={clsx(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                      task.done ? "bg-[#10B981] border-[#10B981]" : "border-[#636A7E] hover:border-[#8E95A5]"
                    )}
                  >
                    {task.done && <Check size={14} className="text-[#12141C]" strokeWidth={3} />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className={clsx(
                      "text-[15px] font-medium leading-snug break-words",
                      task.done ? "text-[#8E95A5] line-through" : "text-white"
                    )}>
                      {task.title}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {task.scheduled_date && (
                        <span className="flex items-center gap-1.5 text-xs text-[#8E95A5]">
                          <Calendar size={12} />
                          {new Date(`${task.scheduled_date}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      
                      {task.due_date && (
                        <span className="flex items-center gap-1.5 text-xs text-[#F43F5E]">
                          <Clock size={12} />
                          Até {new Date(`${task.due_date}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      
                      {task.reminder_at && (
                        <span className="flex items-center gap-1.5 text-xs text-[#7C5CFC]">
                          <Bell size={12} />
                          {new Date(task.reminder_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}

                      {task.priority === 'high' && (
                        <span className="flex items-center gap-1 text-xs text-[#EAB308] font-medium">
                          <Star size={12} className="fill-current" />
                          Importante
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#636A7E] hover:text-[#F43F5E] hover:bg-[#F43F5E]/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Task Overlay */}
        {showAddForm && (
          <div className="absolute inset-0 bg-[#12141C]/90 backdrop-blur-sm z-10 p-6 flex flex-col justify-end lg:justify-center items-center">
            <div className="bg-[#1A1D27] border border-[#282E42] w-full max-w-lg rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Nova Tarefa</h3>
                <button onClick={() => setShowAddForm(false)} className="text-[#8E95A5] hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="O que precisa ser feito?"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full bg-[#12141C] border border-[#282E42] text-white text-base rounded-2xl px-4 py-3 focus:outline-none focus:border-[#7C5CFC] transition-colors"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#8E95A5] uppercase tracking-wider">Fazer no Dia</label>
                    <input
                      type="date"
                      value={newTask.scheduled_date}
                      onChange={(e) => setNewTask({ ...newTask, scheduled_date: e.target.value })}
                      className="bg-[#12141C] border border-[#282E42] text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#7C5CFC]"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#8E95A5] uppercase tracking-wider">Prazo (Deadline)</label>
                    <input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                      className="bg-[#12141C] border border-[#282E42] text-[#F43F5E] text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F43F5E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#8E95A5] uppercase tracking-wider">Lembrete</label>
                    <input
                      type="datetime-local"
                      value={newTask.reminder_at}
                      onChange={(e) => setNewTask({ ...newTask, reminder_at: e.target.value })}
                      className="bg-[#12141C] border border-[#282E42] text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#7C5CFC]"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#8E95A5] uppercase tracking-wider">Prioridade</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low'|'medium'|'high' })}
                      className="bg-[#12141C] border border-[#282E42] text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#7C5CFC] appearance-none"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta / Importante</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-5 py-2.5 rounded-xl font-semibold text-[#8E95A5] hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!newTask.title.trim()}
                    className="px-6 py-2.5 rounded-xl font-semibold text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: themeColor, boxShadow: newTask.title.trim() ? `0 4px 14px -4px ${themeColor}80` : 'none' }}
                  >
                    Salvar Tarefa
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
