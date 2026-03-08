const oneDay = 24 * 60 * 60 * 1000;

export function toDateString(input: Date | string) {
  if (typeof input === "string") {
    return input.slice(0, 10);
  }

  const year = input.getFullYear();
  const month = `${input.getMonth() + 1}`.padStart(2, "0");
  const day = `${input.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function today() {
  return toDateString(new Date());
}

export function parseDate(value: string) {
  return new Date(`${value}T12:00:00`);
}

export function diffInDays(start: string, end: string) {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  return Math.round((endDate.getTime() - startDate.getTime()) / oneDay);
}

export function addDays(date: string, amount: number) {
  const next = parseDate(date);
  next.setDate(next.getDate() + amount);
  return toDateString(next);
}

export function startOfMonth(date: string) {
  const value = parseDate(date);
  value.setDate(1);
  return toDateString(value);
}

export function formatLongDate(date: string) {
  return parseDate(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(date: string) {
  return parseDate(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function monthLabel(date: string) {
  return parseDate(date).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function isSameDay(left: string, right: string) {
  return toDateString(left) === toDateString(right);
}

export function getMonthGrid(date: string) {
  const start = parseDate(startOfMonth(date));
  const month = start.getMonth();
  const firstWeekDay = start.getDay();
  const cursor = new Date(start);
  cursor.setDate(cursor.getDate() - firstWeekDay);

  const cells: string[] = [];
  while (cells.length < 42) {
    cells.push(toDateString(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    month,
    cells,
  };
}

export function relativeDayLabel(date: string) {
  const delta = diffInDays(today(), date);

  if (delta === 0) {
    return "Today";
  }

  if (delta === 1) {
    return "Tomorrow";
  }

  if (delta === -1) {
    return "Yesterday";
  }

  if (delta > 1) {
    return `In ${delta} days`;
  }

  return `${Math.abs(delta)} days ago`;
}
