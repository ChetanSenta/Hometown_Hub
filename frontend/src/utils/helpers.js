import { formatDistanceToNow, format } from 'date-fns';

export function timeAgo(date) {
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); } catch { return ''; }
}
export function formatDate(date, fmt = 'MMM d, yyyy') {
  try { return format(new Date(date), fmt); } catch { return ''; }
}
export function formatDateTime(date) { return formatDate(date, 'MMM d, yyyy · h:mm a'); }
export function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}
export function avatarGradient(name = '') {
  const colors = [
    ['#FF6B35','#FF8C5A'], ['#2EC4B6','#54D4C9'], ['#845EC2','#A07DD8'],
    ['#FFD166','#FFDF90'], ['#EF4444','#F87171'], ['#10B981','#34D399'],
  ];
  const idx = (name.charCodeAt(0) || 0) % colors.length;
  return `linear-gradient(135deg, ${colors[idx][0]}, ${colors[idx][1]})`;
}
export function truncate(str, n = 120) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '…' : str;
}
export function pluralize(n, singular, plural) {
  return `${n} ${n === 1 ? singular : plural || singular + 's'}`;
}
