/**
 * @fileoverview Data Access Layer (DAL) for Tasks Management in Firebase Firestore.
 * Handles full CRUD operations and real-time subscription.
 */

import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from './firebase';

const TASKS_COLLECTION = 'tasks';

/**
 * Subscribes to active tasks in real time.
 */
export function subscribeToTasks(onUpdateCallback) {
  const tasksRef = collection(db, TASKS_COLLECTION);
  const activeQuery = query(tasksRef, where('isActive', '==', true));

  return onSnapshot(
    activeQuery,
    (snapshot) => {
      const taskList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      onUpdateCallback(taskList);
    },
    (error) => {
      console.error('Error listening to tasks collection:', error);
    }
  );
}

/**
 * Marks a task as completed and saves audit metadata.
 */
export async function completeTaskInFirestore(taskId, operatorName, shift) {
  const taskDocRef = doc(db, TASKS_COLLECTION, taskId);
  const currentDateISO = new Date().toISOString().split('T')[0];

  await updateDoc(taskDocRef, {
    lastCompletedAt: currentDateISO,
    auditLog: {
      completedBy: operatorName,
      shift: shift,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Creates a new task in Firestore.
 */
export async function createTaskInFirestore(taskPayload) {
  const tasksRef = collection(db, TASKS_COLLECTION);
  const currentDateISO = new Date().toISOString().split('T')[0];

  await addDoc(tasksRef, {
    ...taskPayload,
    isActive: true,
    lastCompletedAt: taskPayload.lastCompletedAt || currentDateISO,
    auditLog: null,
    createdAt: new Date().toISOString()
  });
}

/**
 * Updates an existing task with new data (responsible, title, frequency, etc.).
 */
export async function updateTaskInFirestore(taskId, updatedPayload) {
  const taskDocRef = doc(db, TASKS_COLLECTION, taskId);
  await updateDoc(taskDocRef, {
    ...updatedPayload,
    updatedAt: new Date().toISOString()
  });
}

/**
 * Deletes a task from Firestore.
 */
export async function deleteTaskInFirestore(taskId) {
  const taskDocRef = doc(db, TASKS_COLLECTION, taskId);
  await deleteDoc(taskDocRef);
}