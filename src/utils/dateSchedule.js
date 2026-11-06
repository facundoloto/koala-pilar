/**
 * Retorna los 7 días (Lunes a Domingo) para un offset de semana dado.
 * @param {number} weekOffset - 0 para semana actual, -1 para anterior, 1 para siguiente.
 */
export function getDaysOfWeekRange(weekOffset = 0) {
  const now = new Date();
  now.setDate(now.getDate() + weekOffset * 7);

  const currentDay = now.getDay(); // 0 = Domingo, 1 = Lunes...
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMonday);

  const days = [];
  const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);
    const dateString = dayDate.toISOString().split('T')[0];

    days.push({
      label: dayLabels[i],
      dateNumber: dayDate.getDate(),
      dateString: dateString,
      isToday: dateString === new Date().toISOString().split('T')[0]
    });
  }

  return days;
}