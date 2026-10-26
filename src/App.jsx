/**
 * @fileoverview Main Application Shell Component.
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { TaskCard } from './components/TaskCard';
import { AdminModal } from './components/AdminModal';
import { LoginModal } from './components/LoginModal';
import { useAuth } from './context/AuthContext';
import { useTasks } from './hooks/useTasks';
import { initializeFirestoreDatabase } from './services/seedService';
import { Sparkles, Database, Loader2 } from 'lucide-react';

export default function App() {
  const { currentUser, activeShift } = useAuth();
  const { tasks, loading, completeTask, addTask, editTask, deleteTask } = useTasks();

  const [selectedSector, setSelectedSector] = useState('Todos');
  const [isDowntimeFilterActive, setIsDowntimeFilterActive] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingTaskTarget, setEditingTaskTarget] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const [availableSectors, setAvailableSectors] = useState([
    'Todos', 'Bacha', 'Cocina', 'Salón', 'Market', 'Pastelería', 'Baños', 'Exterior'
  ]);

  if (!currentUser) return <LoginModal />;

  // Abre el modal cargando la tarea a modificar
  const handleOpenEditModal = (taskToEdit) => {
    setEditingTaskTarget(taskToEdit);
    setIsAdminModalOpen(true);
  };

  const handleAddSector = (newSector) => {
    if (!availableSectors.includes(newSector)) {
      setAvailableSectors([...availableSectors, newSector]);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSector = selectedSector === 'Todos' || task.sector === selectedSector;
    const matchesDowntime = isDowntimeFilterActive ? task.isDowntimeTask : true;
    return matchesSector && matchesDowntime;
  });

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      await initializeFirestoreDatabase();
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors">
      <Header onOpenAdmin={() => { setEditingTaskTarget(null); setIsAdminModalOpen(true); }} />

      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        
        {/* Selector de Sectores y Caza de Huecos */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {availableSectors.map((sector) => (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSector === sector
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {sector}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsDowntimeFilterActive(!isDowntimeFilterActive)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isDowntimeFilterActive
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isDowntimeFilterActive ? 'Mostrar Todas' : 'Caza de Huecos (Tiempos Muertos)'}
          </button>
        </div>

        {/* Loader o Grilla de Tareas */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-sky-500 space-y-3">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="text-xs font-semibold text-slate-400">Sincronizando tareas en tiempo real...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              La base de datos en Firebase Firestore no tiene tareas registradas aún.
            </p>
            <button
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              {isSeeding ? 'Creando Colecciones...' : 'Crear Colecciones e Inicializar Datos'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={(taskId) => completeTask(taskId, currentUser.fullName, activeShift)}
                onEdit={handleOpenEditModal}
                onDelete={deleteTask}
              />
            ))}
          </div>
        )}

      </main>

      {/* Admin Modal con Soporte CRUD Completo */}
      {isAdminModalOpen && (
        <AdminModal 
          onClose={() => {
            setIsAdminModalOpen(false);
            setEditingTaskTarget(null);
          }} 
          onAddTask={addTask}
          onEditTask={editTask}
          editingTask={editingTaskTarget}
          onCancelEdit={() => setEditingTaskTarget(null)}
          availableSectors={availableSectors}
          onAddSector={handleAddSector}
        />
      )}
    </div>
  );
}