import React from 'react';
import { ExternalLink, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import type { AcademicTask } from '@/types';

interface DailyPanelProps {
  selectedDate: string | null;
  tasks: AcademicTask[];
}

export function DailyPanel({ selectedDate, tasks }: DailyPanelProps) {
  if (!selectedDate) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-[#1E2230] rounded-2xl bg-[#12141C] min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-[#1A1D27] flex items-center justify-center mb-4">
          <Clock size={24} className="text-[#636A7E]" />
        </div>
        <h3 className="text-white font-medium mb-1">Nenhum dia selecionado</h3>
        <p className="text-sm text-[#8E95A5]">
          Selecione um dia no calendário para ver as atividades programadas.
        </p>
      </div>
    );
  }

  const dateObj = new Date(`${selectedDate}T12:00:00`);
  const formattedDate = dateObj.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white capitalize">{formattedDate}</h2>
        <p className="text-sm text-[#8E95A5] mt-1">
          {tasks.length === 0
            ? 'Nenhuma atividade para este dia.'
            : `${tasks.length} atividade${tasks.length === 1 ? '' : 's'} programada${tasks.length === 1 ? '' : 's'}.`}
        </p>
      </div>

      <div className="space-y-4 overflow-y-auto pr-2 pb-8">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: AcademicTask }) {
  const isCompleted = task.status === 'completed';
  const isOverdue = task.status === 'overdue';
  
  const getTypeColor = () => {
    if (task.task_type === 'peer_review') return 'bg-[#7C5CFC]/15 text-[#7C5CFC] border-[#7C5CFC]/30';
    if (task.task_type === 'exam') return 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30';
    if (task.task_type === 'reading') return 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30';
    return 'bg-[#F43F5E]/15 text-[#F43F5E] border-[#F43F5E]/30'; // deadline/default
  };

  const getStatusIcon = () => {
    if (isCompleted) return <CheckCircle2 size={16} className="text-[#10B981]" />;
    if (isOverdue) return <AlertCircle size={16} className="text-[#F43F5E]" />;
    return <Clock size={16} className="text-[#EAB308]" />;
  };

  return (
    <div className={clsx(
      "p-5 rounded-xl border transition-all",
      isCompleted 
        ? "bg-[#12141C]/50 border-[#1E2230] opacity-60" 
        : "bg-[#12141C] border-[#1E2230] hover:border-[#282E42] shadow-sm hover:shadow-md"
    )}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border", getTypeColor())}>
              {task.task_type || 'Atividade'}
            </span>
            <span className="text-xs text-[#8E95A5] font-medium">
              {task.course_code || task.course}
            </span>
          </div>
          <h3 className={clsx("font-semibold text-base leading-snug", isCompleted ? "text-[#8E95A5] line-through" : "text-white")}>
            {task.title}
          </h3>
        </div>
        
        <div className="shrink-0 flex items-center gap-2 mt-1">
          {getStatusIcon()}
        </div>
      </div>
      
      {task.description && (
        <p className="text-sm text-[#636A7E] line-clamp-2 mb-4 leading-relaxed">
          {task.description}
        </p>
      )}
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#1E2230]">
        <div className="text-xs text-[#8E95A5]">
          {task.due_date && (
            <span>Prazo: {new Date(task.due_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>
        
        {task.ava_url && !isCompleted && (
          <a
            href={task.ava_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#7C5CFC] hover:text-[#9074FF] transition-colors"
          >
            ACESSAR AVA
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}
