export function lin({ year, week, day }) {
  return (year - 1975) * 30 + (week - 1) * 3 + day;
}
