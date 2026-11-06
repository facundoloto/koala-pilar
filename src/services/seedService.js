/**
 * @fileoverview Database Seed Service with realistic past dates to demonstrate overdue logic.
 */
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function initializeFirestoreDatabase() {
  const getPastDateISO = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const seedTasks = [
    {
      title: 'Limpieza de paredes y azulejos de bacha',
      sector: 'Bacha',
      frequencyDays: 3,
      assignedRole: 'Carlos Gómez',
      assignedShift: 'AM',
      isDowntimeTask: true,
      lastCompletedAt: getPastDateISO(6), // 🚨 VENCIDA (Pasaron 6 días, frecuencia 3)
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      title: 'Limpieza de campana, filtros y extractores',
      sector: 'Cocina',
      frequencyDays: 7,
      assignedRole: 'María Rodríguez',
      assignedShift: 'AM',
      isDowntimeTask: true,
      lastCompletedAt: getPastDateISO(10), // 🚨 VENCIDA / INCIDENCIA (Pasaron 10 días)
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      title: 'Desinfección de cortadoras de fiambre',
      sector: 'Cocina',
      frequencyDays: 1,
      assignedRole: 'Sofía Herrera',
      assignedShift: 'PM',
      isDowntimeTask: false,
      lastCompletedAt: getPastDateISO(1), // ⚠️ VENCE HOY (Frecuencia diaria y se hizo ayer)
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      title: 'Desinfección de islas y macetas de salón',
      sector: 'Salón',
      frequencyDays: 4,
      assignedRole: 'Carlos Gómez',
      assignedShift: 'AM',
      isDowntimeTask: true,
      lastCompletedAt: getPastDateISO(0), // ✅ REALIZADA HOY
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

  const colRef = collection(db, 'tasks');
  for (const task of seedTasks) {
    await addDoc(colRef, task);
  }
}