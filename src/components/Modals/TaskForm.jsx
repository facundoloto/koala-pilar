/**
 * @fileoverview Modular Task Creation / Editing Form Component with Loaders.
 */

import React, { useState, useEffect } from 'react';
import { Plus, Save, Loader2 } from 'lucide-react';

export function TaskForm({ availableSectors, onAddTask, onEditTask, editingTask, onCancelEdit }) {
  const [title, setTitle] = useState('');
  const [sector, setSector] = useState(availableSectors.filter(s => s !== 'Todos')[0] || 'Bacha');
  const [frequencyDays, setFrequencyDays] = useState(1);
  const [assignedRole, setAssignedRole] = useState('Equipo');
  const [assignedShift, setAssignedShift] = useState('AM');
  const [isDowntimeTask, setIsDowntimeTask] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form when an edit task target is passed
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setSector(editingTask.sector);
      setFrequencyDays(editingTask.frequencyDays);
      setAssignedRole(editingTask.assignedRole || 'Equipo');
      setAssignedShift(editingTask.assignedShift || 'AM');
      setIsDowntimeTask(editingTask.isDowntimeTask || false);
    } else {
      setTitle('');
      setFrequencyDays(1);
      setIsDowntimeTask(false);
    }
  }, [editingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;

    setIsSubmitting(true);
    const payload = {
      title,
      sector,
      frequencyDays: Number(frequencyDays),
      assignedRole,
      assignedShift,
      isDowntimeTask
    };

    try {
      if (editingTask) {
        await onEditTask(editingTask.id, payload);
        onCancelEdit();
      } else {
        await onAddTask(payload);
        setTitle('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {editingTask && (
        <div className="flex justify-between items-center bg-sky-500/10 p-2 rounded-lg border border-sky-500/30 text-xs text-sky-600 dark:text-sky-400">
          <span>Editando tarea: <strong>{editingTask.title}</strong></span>
          <button type="button" onClick={onCancelEdit} className="font-bold hover:underline cursor-pointer">
            Cancelar Edición
          </button>
        </div>
      )}

      <div>
        <label className="text-xs font-semibold">Nombre de la Tarea</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
          placeholder="Ej: Limpieza profunda de trampas de grasa"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-semibold">Sector</label>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            disabled={isSubmitting}
          >
            {availableSectors.filter(s => s !== 'Todos').map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold">Frecuencia (Días)</label>
          <input
            type="number"
            min="1"
            value={frequencyDays}
            onChange={(e) => setFrequencyDays(e.target.value)}
            className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="downtimeTask"
          checked={isDowntimeTask}
          onChange={(e) => setIsDowntimeTask(e.target.checked)}
          className="w-4 h-4 rounded text-sky-500"
          disabled={isSubmitting}
        />
        <label htmlFor="downtimeTask" className="text-xs cursor-pointer">
          Habilitar para Modo <span className="text-emerald-500 font-bold">Caza de Huecos</span> (Tiempos Muertos)
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 mt-4 cursor-pointer transition-colors"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Guardando Cambios...</span>
          </>
        ) : editingTask ? (
          <>
            <Save className="w-4 h-4" />
            <span>Guardar Modificación</span>
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            <span>Crear Tarea en Firebase</span>
          </>
        )}
      </button>
    </form>
  );
}