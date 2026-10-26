/**
 * @fileoverview Task Item Card Component with Weekly Incident Detection & Admin CRUD triggers.
 */

import React, { useState } from 'react';
import { Clock, User, Calendar, Check, Loader2, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function TaskCard({ task, onComplete, onEdit, onDelete }) {
  const { isAdmin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Calcula días transcurridos desde el último cumplimiento
  const calculateDaysAgo = (dateString) => {
    if (!dateString) return 999;
    const today = new Date();
    const lastDate = new Date(dateString);
    const diffTime = Math.abs(today - lastDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysAgo = calculateDaysAgo(task.lastCompletedAt);
  const isToday = daysAgo === 0;

  // Lógica Semanal: si pasaron 7 o más días sin checkear, es una INCIDENCIA
  const isWeeklyIncident = daysAgo >= 7;
  const isOverdue = daysAgo >= task.frequencyDays;

  const handleCheckClick = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(task.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async () => {
    if (window.confirm(`¿Estás seguro de eliminar la tarea "${task.title}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(task.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className={`rounded-2xl p-4 transition-all border relative flex flex-col justify-between ${
      isWeeklyIncident 
        ? 'bg-rose-500/10 dark:bg-rose-950/20 border-rose-500/60 shadow-md' 
        : isOverdue 
          ? 'bg-amber-500/10 dark:bg-amber-950/20 border-amber-500/50 shadow-sm' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
    }`}>
      <div>
        {/* Cabecera de la Tarjeta */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              {task.sector}
            </span>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-snug">
              {task.title}
            </h3>
          </div>

          {/* Botones de Admin: Editar y Borrar */}
          {isAdmin && (
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => onEdit(task)}
                className="p-1 rounded-md text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Editar Tarea"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                title="Eliminar Tarea"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Badge de Estado e Incidencia Semanal */}
        <div className="mb-3">
          {isWeeklyIncident ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40">
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
              INCIDENCIA: Sin cumplir hace {daysAgo} días
            </span>
          ) : isOverdue ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40">
              <Clock className="w-3 h-3" />
              Vencido (Hace {daysAgo}d)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40">
              <Clock className="w-3 h-3" />
              {isToday ? 'Al día (Completado hoy)' : `Al día (Hace ${daysAgo}d)`}
            </span>
          )}
        </div>

        {/* Metadatos: Responsable Semanal y Frecuencia */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl mb-3 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block leading-tight">Responsable:</span>
              <span className="font-semibold">{task.assignedRole || 'Sin asignar'}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block leading-tight">Turno / Frec:</span>
              <span className="font-semibold">{task.assignedShift || 'AM'} (Cada {task.frequencyDays}d)</span>
            </div>
          </div>
        </div>

        {/* Log de Auditoría */}
        {task.auditLog && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic mb-3">
            Último check: <span className="font-semibold text-slate-600 dark:text-slate-300">{task.auditLog.completedBy}</span> [{task.auditLog.shift}]
          </p>
        )}
      </div>

      {/* Botón de Check con Loader */}
      <button
        onClick={handleCheckClick}
        disabled={isSubmitting}
        className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer mt-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Guardando Check...</span>
          </>
        ) : (
          <>
            <Check className="w-4 h-4" />
            <span>Marcar Realizado</span>
          </>
        )}
      </button>
    </div>
  );
}