const STYLES = {
  // Equipment statuses
  AVAILABLE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  BOOKED: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  ISSUED: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  MAINTENANCE: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  DAMAGED: 'bg-red-50 text-red-700 ring-red-600/20',
  LOST: 'bg-gray-100 text-gray-600 ring-gray-500/20',
  RETIRED: 'bg-gray-100 text-gray-500 ring-gray-500/20',

  // Booking statuses
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  APPROVED: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  REJECTED: 'bg-red-50 text-red-700 ring-red-600/20',
  CANCELLED: 'bg-gray-100 text-gray-500 ring-gray-500/20',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',

  // Issue statuses / severities
  OPEN: 'bg-red-50 text-red-700 ring-red-600/20',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  RESOLVED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  LOW: 'bg-gray-100 text-gray-600 ring-gray-500/20',
  MEDIUM: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  HIGH: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  CRITICAL: 'bg-red-50 text-red-700 ring-red-600/20',

  // Maintenance statuses
  SCHEDULED: 'bg-amber-50 text-amber-700 ring-amber-600/20',

  // Condition
  EXCELLENT: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  GOOD: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  FAIR: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  POOR: 'bg-orange-50 text-orange-700 ring-orange-600/20',
};

const StatusBadge = ({ status }) => {
  if (!status) return null;
  const style = STYLES[status] || 'bg-gray-100 text-gray-600 ring-gray-500/20';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${style}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export default StatusBadge;
