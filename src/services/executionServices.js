/**
 * @fileoverview Data Access Layer for Task Executions and Audit History.
 */
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  limit 
} from 'firebase/firestore';
import { db } from './firebase';

const EXECUTIONS_COLLECTION = 'executions';

/**
 * Registra un evento de cumplimiento en el libro de actas.
 */
export async function recordExecutionInFirestore({
  taskId,
  taskTitle,
  sector,
  completedBy,
  completedByUserId,
  shift
}) {
  const now = new Date();
  
  // Cálculo de semana ISO (ej: "2026-W44")
  const dateCopy = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = dateCopy.getUTCDay() || 7;
  dateCopy.setUTCDate(dateCopy.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(dateCopy.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((dateCopy - yearStart) / 86400000) + 1) / 7);
  const weekString = `${dateCopy.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;

  const payload = {
    taskId,
    taskTitle,
    sector,
    completedBy,
    completedByUserId,
    shift,
    completedAt: now.toISOString(),
    dateString: now.toISOString().split('T')[0], // "2026-10-30"
    weekString,                                   // "2026-W44"
    monthString: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`, // "2026-10"
    year: now.getFullYear()
  };

  await addDoc(collection(db, EXECUTIONS_COLLECTION), payload);
}

/**
 * Escucha los últimos eventos de auditoría en tiempo real.
 */
export function subscribeToExecutions(onUpdateCallback, maxResults = 100) {
  const q = query(
    collection(db, EXECUTIONS_COLLECTION),
    orderBy('completedAt', 'desc'),
    limit(maxResults)
  );

  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
    onUpdateCallback(records);
  });
}