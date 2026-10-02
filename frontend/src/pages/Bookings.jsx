import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAllBookings, getMyBookings, approveBooking, rejectBooking, cancelBooking
} from '../services/bookingService';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';

const formatDate = (value) => new Date(value).toLocaleString(undefined, {
  dateStyle: 'medium', timeStyle: 'short'
});

const Bookings = () => {
  const { user } = useAuth();
  const isStaff = ['ADMIN', 'LAB_ASSISTANT'].includes(user?.role);

  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = isStaff
        ? await getAllBookings(statusFilter ? { status: statusFilter } : {})
        : await getMyBookings();
      setBookings(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, [isStaff, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const act = async (action, id) => {
    setActingId(id);
    try {
      if (action === 'approve') await approveBooking(id);
      if (action === 'reject') await rejectBooking(id);
      if (action === 'cancel') {
        if (!window.confirm('Cancel this booking?')) { setActingId(null); return; }
        await cancelBooking(id);
      }
      load();
    } catch (err) {
      alert(err.response?.data?.error || `Failed to ${action} booking.`);
    } finally {
      setActingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isStaff ? 'All Bookings' : 'My Bookings'}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isStaff ? 'Review, approve, or reject booking requests.' : 'Track the status of your equipment bookings.'}
          </p>
        </div>
        {isStaff && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            {['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <LoadingSpinner label="Loading bookings..." />
      ) : bookings.length === 0 ? (
        <EmptyState title="No bookings found" description={isStaff ? 'No requests match this filter.' : 'Book equipment from the Equipment page to see it here.'} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Equipment</th>
                  {isStaff && <th className="px-4 py-3 text-left font-medium text-gray-500">Requested By</th>}
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Start</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">End</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Purpose</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{b.equipment_name}</p>
                      <p className="text-xs text-gray-400">{b.serial_number}</p>
                    </td>
                    {isStaff && <td className="px-4 py-3 text-gray-600">{b.user_name || b.user_email}</td>}
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(b.start_time)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(b.end_time)}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{b.purpose || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {isStaff && b.status === 'PENDING' && (
                          <>
                            <Button variant="success" className="text-xs px-3 py-1.5" disabled={actingId === b.id} onClick={() => act('approve', b.id)}>Approve</Button>
                            <Button variant="danger" className="text-xs px-3 py-1.5" disabled={actingId === b.id} onClick={() => act('reject', b.id)}>Reject</Button>
                          </>
                        )}
                        {!isStaff && ['PENDING', 'APPROVED'].includes(b.status) && (
                          <Button variant="secondary" className="text-xs px-3 py-1.5" disabled={actingId === b.id} onClick={() => act('cancel', b.id)}>Cancel</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
