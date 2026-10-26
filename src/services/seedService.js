/**
 * @fileoverview Database Seed Service.
 * Automatically provisions initial 'tasks' and 'users' collections directly from React.
 */

import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const SEED_TASKS = [
  {
    title: 'Paredes y azulejos de bacha',
    sector: 'Bacha',
    frequencyDays: 3,
    assignedRole: 'Equipo Bacha',
    assignedShift: 'AM',
    isDowntimeTask: true
  },
  {
    title: 'Desinfección de cortadoras de fiambre',
    sector: 'Cocina',
    frequencyDays: 1,
    assignedRole: 'Carlos Gómez',
    assignedShift: 'PM',
    isDowntimeTask: false
  },
  {
    title: 'Limpieza de estantes de vinos y macetas',
    sector: 'Market',
    frequencyDays: 7,
    assignedRole: 'Ana Martínez',
    assignedShift: 'AM',
    isDowntimeTask: true
  }
];

/**
 * Initializes Firestore collections directly from React UI.
 */
export async function initializeFirestoreDatabase() {
  const currentDateISO = new Date().toISOString().split('T')[0];

  // 1. Provision 'tasks' collection
  const tasksCollectionRef = collection(db, 'tasks');
  for (const taskItem of SEED_TASKS) {
    await addDoc(tasksCollectionRef, {
      ...taskItem,
      isActive: true,
      lastCompletedAt: currentDateISO,
      auditLog: null,
      createdAt: new Date().toISOString()
    });
  }

  // 2. Provision 'users' collection
  const defaultAdminRef = doc(db, 'users', 'admin-seed-01');
  await setDoc(defaultAdminRef, {
    fullName: 'Admin Koala',
    email: 'admin@koala.com.ar',
    role: 'admin',
    defaultShift: 'AM',
    isActive: true,
    createdAt: new Date().toISOString()
  });

  return true;
}