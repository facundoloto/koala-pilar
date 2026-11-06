/**
 * @fileoverview Audit Log & Staff Workload Balance Component.
 * Visualizes task completions across Week, Month, and Year periods,
 * evaluates workload distribution per employee, and lists chronological audits.
 */

import React, { useState, useMemo } from 'react';
import { User, Filter, ShieldCheck, AlertCircle } from 'lucide-react';

export function AuditLogView({ executions = [], userDirectory = [], sectors = [] }) {
  // Filtros de vista
  const [timeRange, setTimeRange] = useState('week'); // 'week' | 'month' | 'year'
  const [selectedUser, setSelectedUser] = useState('ALL');
  const [selectedSector, setSelectedSector] = useState('ALL');

  // Filtrar ejecuciones por rango temporal, empleado y sector
  const filteredExecutions = useMemo(() => {
    const now = new Date();

    return executions.filter((item) => {
      const itemDate = new Date(item.completedAt);

      // 1. Filtro Temporal
      let matchesTime = true;
      if (timeRange === 'week') {
        const diffMs = now.getTime() - itemDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        matchesTime = diffDays <= 7;
      } else if (timeRange === 'month') {
        matchesTime =
          itemDate.getMonth() === now.getMonth() &&
          itemDate.getFullYear() === now.getFullYear();
      } else if (timeRange === 'year') {
        matchesTime = itemDate.getFullYear() === now.getFullYear();
      }

      // 2. Filtro de Empleado
      const matchesUser = selectedUser === 'ALL' || item.completedBy === selectedUser;

      // 3. Filtro de Sector
      const matchesSector = selectedSector === 'ALL' || item.sector === selectedSector;

      return matchesTime && matchesUser && matchesSector;
    });
  }, [executions, timeRange, selectedUser, selectedSector]);

  // Cálculo de balance de carga (tareas por persona)
  const workloadData = useMemo(() => {
    const counts = {};
    userDirectory.forEach((u) => {
      counts[u.fullName] = 0;
    });

    filteredExecutions.forEach((item) => {
      const name = item.completedBy || 'Desconocido';
      counts[name] = (counts[name] || 0) + 1;
    });

    const total = filteredExecutions.length;

    return Object.entries(counts).map(([name, count]) => {
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return {
        name,
        count,
        percentage,
        isHeavyLoad: percentage >= 45 && count >= 3 // Alerta de sobrecarga
      };
    });
  }, [filteredExecutions, userDirectory]);

  return (
    <div className="space-y-6">
      
      {/* 1. BARRA DE CONTROLES Y FILTROS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Rango Temporal: Semana / Mes / Año */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === 'week'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Esta Semana (7d)
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === 'month'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Este Mes
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === 'year'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Este Año
            </button>
          </div>

          {/* Selectores de Personal y Sector */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
              <User className="w-3.5 h-3.5 text-sky-500" />
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <option value="ALL">Todo el personal</option>
                {userDirectory.map((u) => (
                  <option key={u.id} value={u.fullName}>
                    {u.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
              <Filter className="w-3.5 h-3.5 text-sky-500" />
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <option value="ALL">Todos los sectores</option>
                {sectors.filter((s) => s !== 'Todos').map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* 2. TARJETAS DE REPARTO DE CARGA Y ROTACIÓN */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-500" />
            Balance de Carga y Rotación del Personal
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">
            Total en período: <strong className="text-slate-700 dark:text-slate-200">{filteredExecutions.length} checks</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {workloadData.map((staff) => (
            <div
              key={staff.name}
              className={`p-3 rounded-xl border transition-all ${
                staff.isHeavyLoad
                  ? 'bg-amber-500/10 border-amber-500/40 dark:bg-amber-950/20'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {staff.name}
                </span>
                {staff.isHeavyLoad && (
                  <span title="Alta concentración de tareas realizadas" className="text-amber-500">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-black text-sky-600 dark:text-sky-400">
                  {staff.count}
                </span>
                <span className="text-[10px] text-slate-400">
                  ({staff.percentage}%)
                </span>
              </div>

              {/* Barra de progreso visual */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${staff.isHeavyLoad ? 'bg-amber-500' : 'bg-sky-500'}`}
                  style={{ width: `${staff.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. LIBRO DE ACTAS CRONOLÓGICO */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Registro Cronológico de Tareas ({filteredExecutions.length} eventos)
          </h4>
        </div>

        {filteredExecutions.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            No se encontraron registros de tareas completadas para este período o filtro seleccionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Fecha y Hora</th>
                  <th className="p-3">Sector</th>
                  <th className="p-3">Tarea Realizada</th>
                  <th className="p-3">Turno</th>
                  <th className="p-3">Responsable que Firmó</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredExecutions.map((entry) => {
                  const dateObj = new Date(entry.completedAt);
                  const formattedDate = dateObj.toLocaleDateString();
                  const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 whitespace-nowrap font-medium text-slate-500">
                        {formattedDate} - {formattedTime}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-[10px]">
                          {entry.sector}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">
                        {entry.taskTitle}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                          {entry.shift || 'AM'}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap font-bold text-slate-700 dark:text-slate-200">
                        {entry.completedBy}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}