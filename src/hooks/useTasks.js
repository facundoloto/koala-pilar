import { useState, useEffect } from 'react';
import { 
  subscribeToTasks, 
  completeTaskInFirestore, 
  createTaskInFirestore, 
  updateTaskInFirestore,
  deleteTaskInFirestore 
} from '../services/tasksService';
import { 
  subscribeToExecutions, 
  recordExecutionInFirestore 
} from '../services/executionServices';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Escuchar tareas
    const unsubTasks = subscribeToTasks((updatedTasks) => {
      setTasks(updatedTasks);
      setLoading(false);
    });

    // 2. Escuchar historial de auditoría
    const unsubExecs = subscribeToExecutions((logs) => {
      setExecutions(logs);
    });

    return () => {
      unsubTasks();
      unsubExecs();
    };
  }, []);

  const completeTask = async (task, currentUser, activeShift) => {
    // Actualiza la tarea en Firestore (último check y semáforo al día)
    await completeTaskInFirestore(task.id, currentUser.fullName, activeShift);

    // Escribe la línea permanente en el historial de auditoría
    await recordExecutionInFirestore({
      taskId: task.id,
      taskTitle: task.title,
      sector: task.sector,
      completedBy: currentUser.fullName,
      completedByUserId: currentUser.id,
      shift: activeShift
    });
  };

  const addTask = (payload) => createTaskInFirestore(payload);
  const editTask = (id, payload) => updateTaskInFirestore(id, payload);
  const deleteTask = (id) => deleteTaskInFirestore(id);

  return { tasks, executions, loading, completeTask, addTask, editTask, deleteTask };
}