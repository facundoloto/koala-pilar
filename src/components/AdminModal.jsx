/**
 * @fileoverview Admin Modal with Complete CRUD for Tasks and Staff Management.
 */

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, FolderPlus, Loader2, Eye, EyeOff, Save, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AdminModal({ 
  onClose, 
  onAddTask, 
  onEditTask, 
  editingTask, 
  onCancelEdit, 
  availableSectors, 
  onAddSector 
}) {
  const { currentUser, userDirectory, registerUserByAdmin, revokeUserByAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('tasks');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);

  // Form State: Tareas
  const [title, setTitle] = useState('');
  const [sector, setSector] = useState(availableSectors.filter(s => s !== 'Todos')[0] || 'Bacha');
  const [frequencyDays, setFrequencyDays] = useState(7);
  const [assignedRole, setAssignedRole] = useState(userDirectory[0]?.fullName || 'Equipo');
  const [assignedShift, setAssignedShift] = useState('AM');
  const [isDowntimeTask, setIsDowntimeTask] = useState(false);

  // Form State: Empleados
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [role, setRole] = useState('operator');

  // Form State: Sectores
  const [newSectorName, setNewSectorName] = useState('');

  // ✏️ Carga de datos al hacer clic en Editar
  useEffect(() => {
    if (editingTask) {
      setActiveTab('tasks');
      setTitle(editingTask.title);
      setSector(editingTask.sector);
      setFrequencyDays(editingTask.frequencyDays);
      setAssignedRole(editingTask.assignedRole || userDirectory[0]?.fullName || 'Equipo');
      setAssignedShift(editingTask.assignedShift || 'AM');
      setIsDowntimeTask(editingTask.isDowntimeTask || false);
    } else {
      setTitle('');
      setFrequencyDays(7);
      setIsDowntimeTask(false);
    }
  }, [editingTask, userDirectory]);

  // Guardar (Crear o Editar Tarea)
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmittingTask(true);
    const payload = {
      title: title.trim(),
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
      onClose();
    } catch (err) {
      console.error('Error al guardar tarea:', err);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Crear Personal
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !userPassword) return;

    setIsSubmittingUser(true);
    setTimeout(() => {
      try {
        registerUserByAdmin({
          fullName: fullName.trim(),
          email: email.trim(),
          password: userPassword,
          role,
          defaultShift: 'AM'
        });
        setFullName('');
        setEmail('');
        setUserPassword('');
        alert('¡Usuario registrado con éxito!');
      } catch (err) {
        alert(err.message);
      } finally {
        setIsSubmittingUser(false);
      }
    }, 450);
  };

  // Eliminar Usuario
  const handleDeleteUser = async (userId) => {
    if (userId === currentUser?.id) {
      alert('No puedes eliminar tu propia cuenta en sesión.');
      return;
    }
    if (window.confirm('¿Deseas eliminar este usuario del sistema?')) {
      setDeletingUserId(userId);
      setTimeout(() => {
        revokeUserByAdmin(userId);
        setDeletingUserId(null);
      }, 400);
    }
  };

  // Crear Sector
  const handleSectorSubmit = (e) => {
    e.preventDefault();
    if (!newSectorName.trim()) return;
    onAddSector(newSectorName.trim());
    setNewSectorName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl text-slate-800 dark:text-slate-100">
        
        {/* Cabecera Modal */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">
            {editingTask ? '✏️ Modificar Tarea Asignada' : '⚙️ Panel Administrador'}
          </h2>
          <button 
            onClick={() => {
              if (editingTask) onCancelEdit();
              onClose();
            }} 
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-2 px-3 font-semibold text-xs border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'tasks' ? 'border-sky-500 text-sky-500' : 'border-transparent text-slate-400'
            }`}
          >
            {editingTask ? '✏️ Editando Tarea' : '📋 Asignación de Tareas'}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-2 px-3 font-semibold text-xs border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'users' ? 'border-sky-500 text-sky-500' : 'border-transparent text-slate-400'
            }`}
          >
            👥 Gestión de Personal ({userDirectory.length})
          </button>
          <button
            onClick={() => setActiveTab('sectors')}
            className={`pb-2 px-3 font-semibold text-xs border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'sectors' ? 'border-sky-500 text-sky-500' : 'border-transparent text-slate-400'
            }`}
          >
            🏢 Nuevos Sectores
          </button>
        </div>

        {/* TAB 1: FORMULARIO TAREAS Y ASIGNACIÓN SEMANAL */}
        {activeTab === 'tasks' && (
          <form onSubmit={handleTaskSubmit} className="space-y-3">
            {editingTask && (
              <div className="flex justify-between items-center bg-sky-500/10 p-2.5 rounded-xl border border-sky-500/30 text-xs text-sky-600 dark:text-sky-400">
                <span>Modificando: <strong>{editingTask.title}</strong></span>
                <button type="button" onClick={onCancelEdit} className="text-rose-500 font-bold hover:underline cursor-pointer">
                  Cancelar Edición
                </button>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold block mb-1">Nombre de la Tarea</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                placeholder="Ej: Desinfección semanal de cámaras de frío"
                disabled={isSubmittingTask}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Sector</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  disabled={isSubmittingTask}
                >
                  {availableSectors.filter(s => s !== 'Todos').map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Frecuencia Máxima (Días)</label>
                <input
                  type="number"
                  min="1"
                  value={frequencyDays}
                  onChange={(e) => setFrequencyDays(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  placeholder="7 para semanal"
                  disabled={isSubmittingTask}
                  required
                />
              </div>
            </div>

            {/* Asignación de Responsable del Personal Registrado */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Responsable Semanal</label>
                <select
                  value={assignedRole}
                  onChange={(e) => setAssignedRole(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  disabled={isSubmittingTask}
                >
                  <option value="Equipo General">Equipo General</option>
                  {userDirectory.map((user) => (
                    <option key={user.id} value={user.fullName}>
                      {user.fullName} ({user.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Turno Predeterminado</label>
                <select
                  value={assignedShift}
                  onChange={(e) => setAssignedShift(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  disabled={isSubmittingTask}
                >
                  <option value="AM">Turno Mañana (AM)</option>
                  <option value="PM">Turno Tarde/Noche (PM)</option>
                  <option value="Ambos">Ambos Turnos</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="downtimeTask"
                checked={isDowntimeTask}
                onChange={(e) => setIsDowntimeTask(e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 cursor-pointer"
                disabled={isSubmittingTask}
              />
              <label htmlFor="downtimeTask" className="text-xs cursor-pointer select-none">
                Habilitar para Modo <span className="text-emerald-500 font-bold">Caza de Huecos</span> (Tiempos Muertos)
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmittingTask}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 mt-4 cursor-pointer transition-colors shadow-sm"
            >
              {isSubmittingTask ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando en Firebase...</span>
                </>
              ) : editingTask ? (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios de Tarea</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Crear y Asignar Tarea</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: GESTIÓN DE PERSONAL (CREAR Y ELIMINAR CON CONTRASEÑA) */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <form onSubmit={handleUserSubmit} className="space-y-2.5">
              <div>
                <label className="text-xs font-semibold block mb-1">Nombre Completo del Empleado</label>
                <input
                  type="text"
                  placeholder="Ej: Sofía Herrera"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  disabled={isSubmittingUser}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="sofia@koala.com.ar"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  disabled={isSubmittingUser}
                  required
                />
              </div>

              {/* Contraseña con Toggle de Visibilidad */}
              <div>
                <label className="text-xs font-semibold block mb-1">Contraseña Inicial</label>
                <div className="relative">
                  <input
                    type={showUserPassword ? 'text' : 'password'}
                    placeholder="Clave de acceso para la demo"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="w-full p-2 pr-9 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    disabled={isSubmittingUser}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserPassword(!showUserPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showUserPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Rol</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  disabled={isSubmittingUser}
                >
                  <option value="operator">Operador (Chequeo de tareas)</option>
                  <option value="admin">Administrador (Asignaciones y control total)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmittingUser}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              >
                {isSubmittingUser ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando Empleado...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Dar de Alta Empleado</span>
                  </>
                )}
              </button>
            </form>

            {/* Listado con Opción de Borrar Usuarios */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 block mb-2">Personal Registrado:</span>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {userDirectory.map((user) => (
                  <div key={user.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl text-xs border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-bold">{user.fullName}</span> 
                      <span className="text-[10px] text-slate-400 block">{user.email} · <strong className="text-sky-500">{user.role}</strong></span>
                    </div>
                    {user.id !== currentUser?.id ? (
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deletingUserId === user.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer disabled:opacity-50"
                        title="Eliminar Cuenta"
                      >
                        {deletingUserId === user.id ? <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sesión actual</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SECTORES */}
        {activeTab === 'sectors' && (
          <div className="space-y-4">
            <form onSubmit={handleSectorSubmit} className="space-y-2">
              <label className="text-xs font-semibold">Nombre del Nuevo Sector</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: Cava, Patio Exterior, Barra..."
                  value={newSectorName}
                  onChange={(e) => setNewSectorName(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <FolderPlus className="w-4 h-4" /> Agregar
                </button>
              </div>
            </form>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-2">Sectores Activos:</span>
              <div className="flex flex-wrap gap-1.5">
                {availableSectors.map((sec) => (
                  <span key={sec} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium">
                    {sec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}