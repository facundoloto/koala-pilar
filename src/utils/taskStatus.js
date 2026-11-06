/**
 * @fileoverview Task Deadline and State Calculator.
 */

export function getTaskStatusInfo(lastCompletedAt, frequencyDays = 7) {
  if (!lastCompletedAt) {
    return {
      status: 'OVERDUE',
      daysPassed: 999,
      daysLeft: -999,
      badgeText: '🚨 Sin registro previo',
      badgeClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
      cardBorder: 'border-rose-500/50 bg-rose-500/5',
      isIncident: true,
      isCompletedToday: false,
    };
  }

  // Normaliza fechas a medianoche para evitar desfases de horario
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastDate = new Date(lastCompletedAt);
  lastDate.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - lastDate.getTime();
  const daysPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const daysLeft = frequencyDays - daysPassed;

  // 1. ¿Fue realizada hoy?
  if (daysPassed === 0) {
    return {
      status: 'COMPLETED_TODAY',
      daysPassed,
      daysLeft,
      badgeText: '✅ Realizada hoy',
      badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      cardBorder: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900',
      isIncident: false,
      isCompletedToday: true,
    };
  }

  // 2. ¿Incidencia grave (7 o más días vencida o sin hacerse)?
  if (daysLeft < 0) {
    const overdueDays = Math.abs(daysLeft);
    return {
      status: 'OVERDUE',
      daysPassed,
      daysLeft,
      badgeText: `🚨 Vencida hace ${overdueDays}d`,
      badgeClass: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40 animate-pulse',
      cardBorder: 'border-rose-500/60 bg-rose-500/10 dark:bg-rose-950/20 shadow-md',
      isIncident: true,
      isCompletedToday: false,
    };
  }

  // 3. ¿Vence hoy?
  if (daysLeft === 0) {
    return {
      status: 'DUE_TODAY',
      daysPassed,
      daysLeft,
      badgeText: '⚠️ Vence hoy',
      badgeClass: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40',
      cardBorder: 'border-amber-500/50 bg-amber-500/5',
      isIncident: false,
      isCompletedToday: false,
    };
  }

  // 4. En fecha (Al día)
  return {
    status: 'ON_TRACK',
    daysPassed,
    daysLeft,
    badgeText: `⏳ Quedan ${daysLeft}d`,
    badgeClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
    cardBorder: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900',
    isIncident: false,
    isCompletedToday: false,
  };
}