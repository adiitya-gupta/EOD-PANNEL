export const getTodayDateISO = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (dateString?: string): string => {
  const date = dateString ? new Date(dateString + 'T00:00:00') : new Date();
  const day = date.getDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export const formatShortDate = (dateString?: string): string => {
  const date = dateString ? new Date(dateString + 'T00:00:00') : new Date();
  const day = date.getDate();
  const monthShorts = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const month = monthShorts[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export const formatTimeOnly = (isoString?: string): string => {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return '—';
  }
};

export const getWorkingDaysInMonth = (year?: number, monthIndex?: number): number => {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = monthIndex ?? now.getMonth();
  
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  let workingDays = 0;
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = new Date(y, m, day).getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Sunday (0) and Saturday (6)
      workingDays++;
    }
  }
  return workingDays;
};
