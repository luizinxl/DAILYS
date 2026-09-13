import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import type { CalendarDayInfo } from '@/services/api/academicService';

interface CalendarGridProps {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  dayInfos: CalendarDayInfo[];
}

export function CalendarGrid({
  currentDate,
  onMonthChange,
  selectedDate,
  onSelectDate,
  dayInfos,
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

  return (
    <div className="bg-[#12141C] border border-[#1E2230] rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white capitalize">
          {monthNames[month]} <span className="text-[#636A7E] font-normal">{year}</span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-[#1A1D27] text-[#8E95A5] hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-[#1A1D27] text-[#8E95A5] hover:text-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
          <div key={i} className="text-center text-[11px] font-semibold text-[#636A7E] py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="h-12" />;
          }

          const dateStr = date.toISOString().substring(0, 10);
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === new Date().toISOString().substring(0, 10);
          const info = getDayInfo(date);

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={clsx(
                'h-12 rounded-xl flex flex-col items-center justify-center relative transition-all',
                isSelected
                  ? 'bg-[#7C5CFC] text-white font-bold shadow-md shadow-[#7C5CFC]/20'
                  : 'hover:bg-[#1A1D27] text-[#D1D5DB] hover:text-white',
                isToday && !isSelected && 'text-[#7C5CFC] font-bold',
                info?.isExamPeriod && !isSelected && 'bg-[#3B82F6]/5'
              )}
            >
              <span className="text-sm z-10">{date.getDate()}</span>

              {/* Event Dots */}
              {info && (
                <div className="flex gap-0.5 mt-1 absolute bottom-2">
                  {info.hasDeadline && <div className="w-1 h-1 rounded-full bg-[#F43F5E]" />}
                  {info.hasPeerReview && <div className="w-1 h-1 rounded-full bg-[#7C5CFC]" />}
                  {info.hasStart && <div className="w-1 h-1 rounded-full bg-[#10B981]" />}
                  {info.hasExam && <div className="w-1 h-1 rounded-full bg-[#3B82F6]" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-[11px] text-[#8E95A5] justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#F43F5E]" />
          <span>Prazo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#7C5CFC]" />
          <span>Peer Review</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span>Leitura/Início</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
          <span>Prova</span>
        </div>
      </div>
    </div>
  );
}
