import { useState } from 'react';
import { Trash2, Search, Plus, CheckCircle2, Circle } from 'lucide-react';
import Card from '@/components/common/Card';
import { useHouseholdTasks } from '@/hooks/useHouseholdTasks';
import { useShoppingList } from '@/hooks/useShoppingList';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Page() {
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    addTask,
    toggleDone,
    deleteTask,
  } = useHouseholdTasks();

  const {
    items,
    loading: itemsLoading,
    error: itemsError,
    lookingUp,
    totalEstimated,
    addItem,
    toggleChecked,
    deleteItem,
    lookupPrice,
  } = useShoppingList();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle, newTaskDue || undefined);
    setNewTaskTitle('');
    setNewTaskDue('');
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    addItem(newItemName, newItemQty);
    setNewItemName('');
    setNewItemQty(1);
  };

  const pendingTasks = tasks.filter((t) => !t.done);
  const doneTasks = tasks.filter((t) => t.done);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Casa</h1>
        <p className="text-[#8E95A5] text-sm mt-1">
          Tarefas domésticas e lista de compras com preços do Atacadão.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="household">
          <h2 className="text-lg font-bold text-white mb-4">Tarefas domésticas</h2>

          <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Nova tarefa..."
              className="flex-1 bg-[#000000] border border-[#232735] rounded-lg px-3 py-2 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#7C5CFC]"
            />
            <input
              type="date"
              value={newTaskDue}
              onChange={(e) => setNewTaskDue(e.target.value)}
              className="bg-[#000000] border border-[#232735] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7C5CFC]"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-1 bg-[#7C5CFC] hover:bg-[#6B4CE0] text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors"
            >
              <Plus size={16} />
              Adicionar
            </button>
          </form>

          {tasksError && <p className="text-[#F43F5E] text-sm mb-3">{tasksError}</p>}

          {tasksLoading ? (
            <p className="text-[#8E95A5] text-sm">Carregando...</p>
          ) : tasks.length === 0 ? (
            <p className="text-[#8E95A5] text-sm">Nenhuma tarefa cadastrada ainda.</p>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 bg-[#1D2029] border border-[#232735] rounded-lg px-3 py-2"
                >
                  <button onClick={() => toggleDone(task.id, true)} className="text-[#8E95A5] hover:text-[#2ECC71]">
                    <Circle size={18} />
                  </button>
                  <div className="flex-1">
                    <p className="text-sm text-white">{task.title}</p>
                    {task.due_date && (
                      <p className="text-xs text-[#64748B]">
                        Prazo: {new Date(task.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <button onClick={() => deleteTask(task.id)} className="text-[#64748B] hover:text-[#F43F5E]">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {doneTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 bg-[#1D2029]/50 border border-[#232735] rounded-lg px-3 py-2 opacity-60"
                >
                  <button onClick={() => toggleDone(task.id, false)} className="text-[#2ECC71]">
                    <CheckCircle2 size={18} />
                  </button>
                  <div className="flex-1">
                    <p className="text-sm text-white line-through">{task.title}</p>
                  </div>
                  <button onClick={() => deleteTask(task.id)} className="text-[#64748B] hover:text-[#F43F5E]">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card variant="household">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Lista de compras</h2>
            {totalEstimated > 0 && (
              <span className="text-sm text-[#8E95A5]">
                Estimado: <span className="text-white font-semibold">{formatCurrency(totalEstimated)}</span>
              </span>
            )}
          </div>

          <form onSubmit={handleAddItem} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Novo item (ex: arroz)..."
              className="flex-1 bg-[#000000] border border-[#232735] rounded-lg px-3 py-2 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#7C5CFC]"
            />
            <input
              type="number"
              min={1}
              value={newItemQty}
              onChange={(e) => setNewItemQty(Number(e.target.value) || 1)}
              className="w-16 bg-[#000000] border border-[#232735] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7C5CFC]"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-1 bg-[#7C5CFC] hover:bg-[#6B4CE0] text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors"
            >
              <Plus size={16} />
            </button>
          </form>

          {itemsError && <p className="text-[#F43F5E] text-sm mb-3">{itemsError}</p>}

          {itemsLoading ? (
            <p className="text-[#8E95A5] text-sm">Carregando...</p>
          ) : items.length === 0 ? (
            <p className="text-[#8E95A5] text-sm">Lista de compras vazia.</p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 bg-[#1D2029] border border-[#232735] rounded-lg px-3 py-2 ${
                    item.checked ? 'opacity-60' : ''
                  }`}
                >
                  <button
                    onClick={() => toggleChecked(item.id, !item.checked)}
                    className={item.checked ? 'text-[#2ECC71]' : 'text-[#8E95A5] hover:text-[#2ECC71]'}
                  >
                    {item.checked ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm text-white ${item.checked ? 'line-through' : ''}`}>
                      {item.name}{' '}
                      <span className="text-[#64748B]">
                        ({item.quantity} {item.unit})
                      </span>
                    </p>
                    {item.estimated_price != null && (
                      <p className="text-xs text-[#818CF8]">
                        {formatCurrency(item.estimated_price)} · {item.price_source}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => lookupPrice(item.id, item.name)}
                    disabled={lookingUp === item.id}
                    title="Buscar preço no Atacadão"
                    className="text-[#64748B] hover:text-[#7C5CFC] disabled:opacity-40"
                  >
                    <Search size={16} className={lookingUp === item.id ? 'animate-pulse' : ''} />
                  </button>
                  <button onClick={() => deleteItem(item.id)} className="text-[#64748B] hover:text-[#F43F5E]">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
