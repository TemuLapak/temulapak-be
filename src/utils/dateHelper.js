export function isValidDate(value) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export function isWithinPeriod(startDate, endDate, now = new Date()) {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }
  const current = new Date(now).getTime();
  return current >= new Date(startDate).getTime() && current <= new Date(endDate).getTime();
}

export function isExpired(expiresAt, now = new Date()) {
  if (!expiresAt || !isValidDate(expiresAt)) {
    return false;
  }
  return new Date(now).getTime() > new Date(expiresAt).getTime();
}

export function addHoursToIso(hours, baseDate = new Date()) {
  const date = new Date(baseDate);
  date.setHours(date.getHours() + Number(hours));
  return date.toISOString();
}