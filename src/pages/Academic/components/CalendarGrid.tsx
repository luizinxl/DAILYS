import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import type { CalendarDayInfo } from '@/services/api/academicService';
import type { AcademicTask } from '@/types';

interface CalendarGridProps {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  dayInfos: CalendarDayInfo[];
  tasks: AcademicTask[];
}

export function CalendarGrid({
  currentDate,
  onMonthChange,
  selectedDate,
  onSelectDate,
  dayInfos,
  tasks,
}: CalendarGridProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const handlePrevMonth = () => {
    onMonthChange(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getDayInfo = (date: Date) => {
    const dateStr = date.toISOString().substring(0, 10);
    return dayInfos.find((d) => d.date === dateStr);
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().substring(0, 10);
    return tasks.filter(t => t.due_date && t.due_date.substring(0, 10) === dateStr);
  };

  const getTypeColor = (type?: string) => {
    if (type === 'peer_review') return 'bg-[#7C5CFC]';
    if (type === 'exam') return 'bg-[#3B82F6]';
    if (type === 'reading') return 'bg-[#10B981]';
    return 'bg-[#F43F5E]'; // default/deadline
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white capitalize flex items-center gap-2">
          {monthNames[month]} <span className="text-[#636A7E] font-normal">{year}</span>
        </h2>
        <div className="flex items-center gap-2 bg-[#1A1D27] rounded-xl p-1 border border-[#282E42]">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-[#2A2F42] text-[#8E95A5] hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-[#2A2F42] text-[#8E95A5] hover:text-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-3 mb-3">
        {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((day, i) => (
          <div key={i} className="text-left pl-2 text-xs font-semibold text-[#636A7E]">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-3 flex-1">
        {days.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="h-32 lg:h-40 bg-[#1A1D27]/30 rounded-2xl border border-[#1E2230]/50" />;
          }

          const dateStr = date.toISOString().substring(0, 10);
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === new Date().toISOString().substring(0, 10);
          const info = getDayInfo(date);
          const dayTasks = getTasksForDate(date);

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={clsx(
                'h-32 lg:h-40 rounded-2xl p-3 flex flex-col items-start justify-start relative transition-all border text-left overflow-hidden group',
                isSelected
                  ? 'bg-gradient-to-br from-[#7C5CFC] to-[#5C3CE0] border-[#9074FF] text-white shadow-lg shadow-[#7C5CFC]/25'
                  : 'bg-[#1A1D27] border-[#282E42] hover:border-[#384058] hover:bg-[#1E2230]',
                isToday && !isSelected && 'border-[#7C5CFC] border-opacity-50'
              )}
            >
              <span className={clsx(
                "text-sm font-semibold mb-2",
                isSelected ? "text-white" : (isToday ? "text-[#7C5CFC]" : "text-[#D1D5DB]")
              )}>
                {date.getDate()}
              </span>

              {/* Tasks List */}
              <div className="flex flex-col gap-1.5 w-full overflow-hidden">
                {dayTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center gap-1.5 w-full">
                    <div className={clsx("w-1 h-3 rounded-full shrink-0", isSelected ? "bg-white/80" : getTypeColor(task.task_type))} />
                    <span className={clsx(
                      "text-[10px] truncate leading-none font-medium",
                      isSelected ? "text-white/90" : "text-[#8E95A5] group-hover:text-[#A1A9BC]"
                    )}>
                      {task.title}
                    </span>
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-[9px] text-[#636A7E] font-medium pl-2.5 mt-0.5">
                    +{dayTasks.length - 3} mais
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
