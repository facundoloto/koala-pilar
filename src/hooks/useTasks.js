import { useState, useEffect } from 'react';
import { 
  subscribeToTasks, 
  completeTaskInFirestore, 
  createTaskInFirestore, 
  updateTaskInFirestore,
  deleteTaskInFirestore 
} from '../services/tasksService';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToTasks((updatedTasks) => {
      setTasks(updatedTasks);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const completeTask = async (taskId, operatorName, shift) => {
    await completeTaskInFirestore(taskId, operatorName, shift);
  };

  const addTask = async (newTaskPayload) => {
    await createTaskInFirestore(newTaskPayload);
  };

  const editTask = async (taskId, updatedPayload) => {
    await updateTaskInFirestore(taskId, updatedPayload);
  };

  const deleteTask = async (taskId) => {
    await deleteTaskInFirestore(taskId);
  };

  return { tasks, loading, completeTask, addTask, editTask, deleteTask };
}