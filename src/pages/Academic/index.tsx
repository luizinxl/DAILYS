import React, { useState } from 'react';
import { useAcademic } from '@/hooks/useAcademic';
import { CalendarGrid } from './components/CalendarGrid';
import { DailyPanel } from './components/DailyPanel';
import { BookOpen, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export default function AcademicDashboard() {
  const {
    tasks,
    syncState,
    calendarDays,
    selectedDayTasks,
    loading,
    error,
    refresh,
    selectDay,
    setCalendarMonth,
    counts,
  } = useAcademic();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
    setCalendarMonth(date.getFullYear(), date.getMonth() + 1);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    selectDay(date);
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C5CFC]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#7C5CFC]/15 flex items-center justify-center">
              <BookOpen size={20} className="text-[#7C5CFC]" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Acadêmico</h1>
          </div>
          <p className="text-[#8E95A5] text-sm">
            Acompanhe seus prazos, provas e atividades.
          </p>
        </div>
        
        {/* Sync Status */}
        {syncState && (
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg bg-[#12141C] border border-[#1E2230]">
            <span className={clsx("w-2 h-2 rounded-full", syncState.last_login_success ? "bg-[#10B981]" : "bg-[#F43F5E]")} />
            <span className="text-[#8E95A5]">
              Última sincronização: {syncState.last_morning_sync ? new Date(syncState.last_morning_sync).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Nunca'}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#F43F5E]/10 border border-[#F43F5E]/20 flex items-start gap-3">
          <AlertCircle size={20} className="text-[#F43F5E] shrink-0 mt-0.5" />
          <p className="text-sm text-[#F43F5E] leading-relaxed">{error}</p>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OverviewCard 
          title="Total Pendente" 
          value={counts.total.toString()} 
          icon={<BookOpen size={18} className="text-[#7C5CFC]" />} 
          colorClass="text-[#7C5CFC]" 
        />
        <OverviewCard 
          title="Urgente (P1/P2)" 
          value={counts.urgent.toString()} 
          icon={<AlertCircle size={18} className="text-[#EAB308]" />} 
          colorClass="text-[#EAB308]" 
        />
        <OverviewCard 
          title="Atrasado" 
          value={counts.overdue.toString()} 
          icon={<AlertCircle size={18} className="text-[#F43F5E]" />} 
          colorClass="text-[#F43F5E]" 
        />
        <OverviewCard 
          title="Para Hoje" 
          value={counts.dueToday.toString()} 
          icon={<Clock size={18} className="text-[#10B981]" />} 
          colorClass="text-[#10B981]" 
        />
      </div>

      {/* Main Layout: Unified Dashboard Panel */}
      <div className="bg-[#12141C] border border-[#1E2230] rounded-3xl p-6 flex flex-col lg:flex-row gap-8 h-auto lg:h-[calc(100vh-280px)] min-h-[700px]">
        {/* Calendar Area (Left - Takes ~65%) */}
        <div className="w-full lg:w-[65%] shrink-0 flex flex-col">
          <CalendarGrid 
            currentDate={currentMonth}
            onMonthChange={handleMonthChange}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            dayInfos={calendarDays}
            tasks={tasks} // We pass tasks down so CalendarGrid can render task chips inside the cells
          />
        </div>
        
        {/* Scheduled / Daily Panel Area (Right - Takes ~35%) */}
        <div className="w-full lg:w-[35%] flex flex-col border-t lg:border-t-0 lg:border-l border-[#1E2230] pt-8 lg:pt-0 lg:pl-8">
          <DailyPanel 
            selectedDate={selectedDate} 
            tasks={selectedDayTasks} 
          />
        </div>
      </div>
    </div>
  );
}

function OverviewCard({ title, value, icon, colorClass }: { title: string, value: string, icon: React.ReactNode, colorClass: string }) {
  return (
    <div className="p-4 rounded-xl bg-[#12141C] border border-[#1E2230] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#8E95A5] uppercase tracking-wider">{title}</span>
        {icon}
      </div>
      <div className={clsx("text-2xl font-bold", colorClass)}>
        {value}
      </div>
    </div>
  );
}
