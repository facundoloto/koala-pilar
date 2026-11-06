/**
 * @fileoverview Main Application Root Component - CleanOps.
 * Integrates Kanban Cards, Weekly Schedule Matrix, and Historical Audit Log.
 */

import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { TaskCard } from './components/TaskCard';
import { WeeklyScheduleView } from './components/WeeklyScheduleView';
import { AuditLogView } from './components/AuditLogView';
import { StatusSummaryBar } from './components/StatusSummary';
import { AdminModal } from './components/AdminModal';
import { LoginModal } from './components/LoginModal';
import { useAuth } from './context/AuthContext';
import { useTasks } from './hooks/useTasks';
import { getTaskStatusInfo } from './utils/taskStatus';
import { getDaysOfWeekRange } from './utils/dateSchedule';
import { initializeFirestoreDatabase } from './services/seedService';
import { 
  Sparkles, 
  Database, 
  Loader2, 
  LayoutGrid, 
  CalendarRange, 
  ClipboardCheck, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw 
} from 'lucide-react';

export default function App() {
  // ==========================================
  // 1. REGLA DE ORO DE REACT: TODOS LOS HOOKS ARRIBA
  // ==========================================
  const { currentUser, activeShift, userDirectory } = useAuth();
  const { tasks, executions, loading, completeTask, addTask, editTask, deleteTask } = useTasks();

  // Control de Vistas: 'kanban' | 'schedule' | 'audit'
  const [currentView, setCurrentView] = useState('kanban');

  // Filtros de Tareas
  const [selectedSector, setSelectedSector] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isDowntimeFilterActive, setIsDowntimeFilterActive] = useState(false);

  // Navegación Semanal para el Cronograma (0 = Actual, -1 = Anterior, 1 = Siguiente)
  const [weekOffset, setWeekOffset] = useState(0);

  // Estados del Modal Admin
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingTaskTarget, setEditingTaskTarget] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Sectores Dinámicos
  const [availableSectors, setAvailableSectors] = useState([
    'Todos', 'Bacha', 'Cocina', 'Salón', 'Market', 'Pastelería', 'Baños', 'Exterior'
  ]);

  // Hook de cálculo: Días correspondientes a la semana visible
  const weekDays = useMemo(() => getDaysOfWeekRange(weekOffset), [weekOffset]);

  // Hook de cálculo: Enriquecer tareas con la información matemática del semáforo
  const enrichedTasks = useMemo(() => {
    return tasks.map((t) => ({
      ...t,
      _statusInfo: getTaskStatusInfo(t.lastCompletedAt, t.frequencyDays)
    }));
  }, [tasks]);

  // Hook de cálculo: Filtrado reactivo de tareas
  const filteredTasks = useMemo(() => {
    return enrichedTasks.filter((task) => {
      const matchSector = selectedSector === 'Todos' || task.sector === selectedSector;
      const matchDowntime = isDowntimeFilterActive ? task.isDowntimeTask : true;

      let matchStatus = true;
      if (statusFilter === 'OVERDUE') {
        matchStatus = task._statusInfo?.status === 'OVERDUE';
      } else if (statusFilter === 'DUE_SOON') {
        matchStatus = task._statusInfo?.status === 'DUE_TODAY' || (task._statusInfo?.daysLeft <= 2 && task._statusInfo?.daysLeft > 0);
      } else if (statusFilter === 'COMPLETED') {
        matchStatus = task._statusInfo?.isCompletedToday;
      }

      return matchSector && matchDowntime && matchStatus;
    });
  }, [enrichedTasks, selectedSector, isDowntimeFilterActive, statusFilter]);

  // ==========================================
  // 2. RETORNO TEMPRANO CONTROLADO (DESPUÉS DE LOS HOOKS)
  // ==========================================
  if (!currentUser) {
    return <LoginModal />;
  }

  // ==========================================
  // 3. HANDLERS Y LÓGICA DE MUTACIÓN
  // ==========================================
  const handleCompleteTask = async (task) => {
    await completeTask(task, currentUser, activeShift);
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      await initializeFirestoreDatabase();
    } catch (err) {
      console.error(err);
      alert('Error al inicializar la base de datos.');
    } finally {
      setIsSeeding(false);
    }
  };

  // ==========================================
  // 4. RENDER PRINCIPAL DE LA APP AUTENTICADA
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors">
      <Header onOpenAdmin={() => { setEditingTaskTarget(null); setIsAdminModalOpen(true); }} />

      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* BARRA SUPERIOR: SELECTOR DE VISTAS PRINCIPALES */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentView('kanban')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                currentView === 'kanban'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Tarjetas Kanban</span>
            </button>

            <button
              onClick={() => setCurrentView('schedule')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                currentView === 'schedule'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarRange className="w-4 h-4" />
              <span>Cronograma Semanal</span>
            </button>

            <button
              onClick={() => setCurrentView('audit')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                currentView === 'audit'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Auditoría & Rotación</span>
            </button>
          </div>

          {/* Navegador Temporal (Solo visible en Cronograma) */}
          {currentView === 'schedule' && (
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                title="Semana Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold px-2 text-slate-600 dark:text-slate-300">
                {weekDays[0].dateNumber}/{weekDays[0].dateString.split('-')[1]} al {weekDays[6].dateNumber}/{weekDays[6].dateString.split('-')[1]}
              </span>

              <button
                onClick={() => setWeekOffset((prev) => prev + 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                title="Semana Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {weekOffset !== 0 && (
                <button
                  onClick={() => setWeekOffset(0)}
                  className="px-2 py-1 text-[11px] font-semibold text-sky-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Hoy
                </button>
              )}
            </div>
          )}
        </div>

        {/* VISTA 1: TARJETAS KANBAN */}
        {currentView === 'kanban' && (
          <div className="space-y-6">
            <StatusSummaryBar 
              tasks={enrichedTasks}
              activeStatusFilter={statusFilter}
              onSelectStatusFilter={setStatusFilter}
            />

            {/* Filtros de Sector y Caza de Huecos */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                {availableSectors.map((sector) => (
                  <button
                    key={sector}
                    onClick={() => setSelectedSector(sector)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isDowntimeFilterActive
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isDowntimeFilterActive ? 'Mostrar Todas' : 'Caza de Huecos (Tiempos Muertos)'}
              </button>
            </div>

            {/* Grilla o Estado de Carga */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-sky-500 space-y-3">
                <Loader2 className="w-10 h-10 animate-spin" />
                <p className="text-xs font-semibold text-slate-400">Sincronizando tareas en tiempo real...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  No hay tareas registradas en Firestore.
                </p>
                <button
                  onClick={handleSeedDatabase}
                  disabled={isSeeding}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                  <span>{isSeeding ? 'Creando Tareas...' : 'Inicializar Datos Demo'}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={() => handleCompleteTask(task)}
                    onEdit={(t) => { setEditingTaskTarget(t); setIsAdminModalOpen(true); }}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VISTA 2: CRONOGRAMA SEMANAL */}
        {currentView === 'schedule' && (
          <WeeklyScheduleView 
            tasks={filteredTasks}
            executions={executions}
            weekDays={weekDays}
          />
        )}

        {/* VISTA 3: AUDITORÍA Y ROTACIÓN HISTÓRICA */}
        {currentView === 'audit' && (
          <AuditLogView 
            executions={executions}
            userDirectory={userDirectory}
            sectors={availableSectors}
          />
        )}

      </main>

      {/* MODAL ADMINISTRADOR */}
      {isAdminModalOpen && (
        <AdminModal 
          onClose={() => { setIsAdminModalOpen(false); setEditingTaskTarget(null); }}
          onAddTask={addTask}
          onEditTask={editTask}
          editingTask={editingTaskTarget}
          onCancelEdit={() => setEditingTaskTarget(null)}
          availableSectors={availableSectors}
          onAddSector={(newSec) => setAvailableSectors((prev) => [...prev, newSec])}
        />
      )}
    </div>
  );
}