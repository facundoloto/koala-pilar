import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { getTaskStatusInfo } from '../utils/taskStatus';

export function WeeklyScheduleView({ tasks, executions, weekDays }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
        <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] font-bold text-slate-400 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="p-3">Tarea / Sector</th>
            <th className="p-3">Responsable</th>
            {weekDays.map((day) => (
              <th 
                key={day.dateString} 
                className={`p-3 text-center ${day.isToday ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400' : ''}`}
              >
                <div>{day.label}</div>
                <div className="text-[11px] font-black">{day.dateNumber}</div>
              </th>
            ))}
            <th className="p-3 text-right">Contador a Vencer</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {tasks.map((task) => {
            const status = getTaskStatusInfo(task.lastCompletedAt, task.frequencyDays);

            return (
              <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">
                  <span className="block text-[10px] text-sky-500 uppercase font-bold">{task.sector}</span>
                  {task.title}
                </td>
                <td className="p-3 whitespace-nowrap">
                  <span className="font-medium">{task.assignedRole || 'Equipo'}</span>
                </td>

                {/* Días Lunes a Domingo */}
                {weekDays.map((day) => {
                  // Revisa si existe un registro en el historial para esta tarea en este día
                  const wasDone = executions.some(
                    (e) => e.taskId === task.id && e.dateString === day.dateString
                  );

                  return (
                    <td 
                      key={day.dateString} 
                      className={`p-3 text-center ${day.isToday ? 'bg-sky-500/5' : ''}`}
                    >
                      {wasDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 mx-auto" />
                      )}
                    </td>
                  );
                })}

                {/* Contador */}
                <td className="p-3 text-right whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.badgeClass}`}>
                    {status.badgeText}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}