/**
 * @fileoverview Visual KPI Cards & Status Filter Buttons.
 */
import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, ListFilter } from 'lucide-react';

export function StatusSummaryBar({ tasks, activeStatusFilter, onSelectStatusFilter }) {
  // Conteo dinámico
  const overdueCount = tasks.filter((t) => t._statusInfo?.status === 'OVERDUE').length;
  const dueSoonCount = tasks.filter((t) => t._statusInfo?.status === 'DUE_TODAY' || (t._statusInfo?.daysLeft <= 2 && t._statusInfo?.daysLeft > 0)).length;
  const completedTodayCount = tasks.filter((t) => t._statusInfo?.isCompletedToday).length;

  return (
    <div className="space-y-3 mb-6">
      {/* 1. Tarjetas de Resumen Numérico (KPIs) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <button
          onClick={() => onSelectStatusFilter(activeStatusFilter === 'OVERDUE' ? 'ALL' : 'OVERDUE')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            activeStatusFilter === 'OVERDUE'
              ? 'bg-rose-500/20 border-rose-500 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-rose-500">Vencidas</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 block mt-1">
            {overdueCount}
          </span>
          <span className="text-[10px] text-slate-400 block">Requieren atención urgente</span>
        </button>

        <button
          onClick={() => onSelectStatusFilter(activeStatusFilter === 'DUE_SOON' ? 'ALL' : 'DUE_SOON')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            activeStatusFilter === 'DUE_SOON'
              ? 'bg-amber-500/20 border-amber-500 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-amber-500">Por Vencer</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 block mt-1">
            {dueSoonCount}
          </span>
          <span className="text-[10px] text-slate-400 block">Vencen hoy o en 48hs</span>
        </button>

        <button
          onClick={() => onSelectStatusFilter(activeStatusFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            activeStatusFilter === 'COMPLETED'
              ? 'bg-emerald-500/20 border-emerald-500 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-emerald-500">Realizadas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">
            {completedTodayCount}
          </span>
          <span className="text-[10px] text-slate-400 block">Completadas hoy</span>
        </button>
      </div>

      {/* 2. Pestañas de Filtro Rápido */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        <span className="text-slate-400 flex items-center gap-1 text-[11px] mr-1">
          <ListFilter className="w-3.5 h-3.5" /> Estado:
        </span>
        <button
          onClick={() => onSelectStatusFilter('ALL')}
          className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
            activeStatusFilter === 'ALL'
              ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Ver Todas ({tasks.length})
        </button>
        <button
          onClick={() => onSelectStatusFilter('OVERDUE')}
          className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
            activeStatusFilter === 'OVERDUE'
              ? 'bg-rose-500 text-white font-bold'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
          }`}
        >
          🚨 Solo Vencidas ({overdueCount})
        </button>
        <button
          onClick={() => onSelectStatusFilter('DUE_SOON')}
          className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
            activeStatusFilter === 'DUE_SOON'
              ? 'bg-amber-500 text-white font-bold'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
          }`}
        >
          ⏳ Por Vencer ({dueSoonCount})
        </button>
        <button
          onClick={() => onSelectStatusFilter('COMPLETED')}
          className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
            activeStatusFilter === 'COMPLETED'
              ? 'bg-emerald-500 text-white font-bold'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
          }`}
        >
          ✅ Realizadas Hoy ({completedTodayCount})
        </button>
      </div>
    </div>
  );
}