/**
 * @fileoverview Task Item Card with Status Indicator, Edit, Delete and Check Loaders.
 */
import React, { useState } from 'react';
import { User, Calendar, Check, Loader2, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTaskStatusInfo } from '../utils/taskStatus';

export function TaskCard({ task, onComplete, onEdit, onDelete }) {
  const { isAdmin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusInfo = getTaskStatusInfo(task.lastCompletedAt, task.frequencyDays);

  const handleCheck = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(task.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`¿Eliminar la tarea "${task.title}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(task.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className={`rounded-2xl p-4 transition-all border flex flex-col justify-between ${statusInfo.cardBorder}`}>
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
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                title="Eliminar Tarea"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Badge Visual de Estado */}
        <div className="mb-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusInfo.badgeClass}`}>
            {statusInfo.badgeText}
          </span>
        </div>

        {/* Metadatos: Responsable y Frecuencia */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl mb-3 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block leading-tight">Responsable:</span>
              <span className="font-semibold">{task.assignedRole || 'Equipo General'}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block leading-tight">Turno / Frec:</span>
              <span className="font-semibold">{task.assignedShift || 'AM'} (c/{task.frequencyDays}d)</span>
            </div>
          </div>
        </div>

        {/* Auditoría del último check */}
        {task.auditLog && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic mb-3">
            Último check: <span className="font-semibold text-slate-600 dark:text-slate-300">{task.auditLog.completedBy}</span> [{task.auditLog.shift}]
          </p>
        )}
      </div>

      {/* Botón de Check */}
      <button
        onClick={handleCheck}
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
            <span>{statusInfo.isCompletedToday ? 'Completada Hoy (Volver a marcar)' : 'Marcar Realizado'}</span>
          </>
        )}
      </button>
    </div>
  );
}