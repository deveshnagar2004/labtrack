import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTransactions, issueEquipment, returnEquipment } from '../services/transactionService';
import { getAllBookings } from '../services/bookingService';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';

const formatDateTime = (value) => value
  ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  : '—';

const CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'];

const Transactions = () => {
  const { user } = useAuth();
  const isStaff = ['ADMIN', 'LAB_ASSISTANT'].includes(user?.role);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);

  const [approvedBookings, setApprovedBookings] = useState([]);
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({ booking_id: '', issue_condition: 'GOOD' });
  const [issueSaving, setIssueSaving] = useState(false);
  const [issueError, setIssueError] = useState('');

  const [returnTarget, setReturnTarget] = useState(null);
  const [returnForm, setReturnForm] = useState({ return_condition: 'GOOD', remarks: '' });
  const [returnSaving, setReturnSaving] = useState(false);
  const [returnError, setReturnError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getTransactions(activeOnly ? { active: 'true' } : {});
      setTransactions(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => { load(); }, [load]);

  const openIssueModal = async () => {
    setIssueForm({ booking_id: '', issue_condition: 'GOOD' });
    setIssueError('');
    setIssueOpen(true);
    try {
      const bookings = await getAllBookings({ status: 'APPROVED' });
      setApprovedBookings(bookings);
    } catch {
      setApprovedBookings([]);
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setIssueSaving(true);
    setIssueError('');
    try {
      await issueEquipment(issueForm);
      setIssueOpen(false);
      load();
    } catch (err) {
      setIssueError(err.response?.data?.error || 'Failed to issue equipment.');
    } finally {
      setIssueSaving(false);
    }
  };

  const openReturnModal = (tx) => {
    setReturnTarget(tx);
    setReturnForm({ return_condition: 'GOOD', remarks: '' });
    setReturnError('');
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setReturnSaving(true);
    setReturnError('');
    try {
      await returnEquipment({ equipment_id: returnTarget.equipment_id, ...returnForm });
      setReturnTarget(null);
      load();
    } catch (err) {
      setReturnError(err.response?.data?.error || 'Failed to return equipment.');
    } finally {
      setReturnSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isStaff ? 'Issue / Return' : 'My Equipment'}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isStaff ? 'Hand out equipment against approved bookings and process returns.' : 'Equipment currently or previously issued to you.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} />
            Active only
          </label>
          {isStaff && <Button onClick={openIssueModal}>+ Issue Equipment</Button>}
        </div>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <LoadingSpinner label="Loading transactions..." />
      ) : transactions.length === 0 ? (
        <EmptyState title="No transactions found" description={isStaff ? 'Issue equipment against an approved booking to get started.' : 'Equipment you borrow will show up here.'} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Equipment</th>
                  {isStaff && <th className="px-4 py-3 text-left font-medium text-gray-500">Borrower</th>}
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Issued</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Returned</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Condition Out / In</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{tx.equipment_name}</p>
                      <p className="text-xs text-gray-400">{tx.serial_number}</p>
                    </td>
                    {isStaff && <td className="px-4 py-3 text-gray-600">{tx.user_name}</td>}
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDateTime(tx.issued_at)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {tx.returned_at ? formatDateTime(tx.returned_at) : <StatusBadge status="ISSUED" />}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={tx.issue_condition} />
                        <span className="text-gray-300">→</span>
                        {tx.return_condition ? <StatusBadge status={tx.return_condition} /> : <span className="text-gray-300 text-xs">pending</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!tx.returned_at && (
                        <Button variant="secondary" className="text-xs px-3 py-1.5" onClick={() => openReturnModal(tx)}>Return</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Issue Modal (staff) */}
      <Modal open={issueOpen} title="Issue Equipment" onClose={() => setIssueOpen(false)}>
        <ErrorBanner message={issueError} />
        {approvedBookings.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No approved bookings are waiting to be issued right now.</p>
        ) : (
          <form onSubmit={handleIssueSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Approved Booking</label>
              <select
                required value={issueForm.booking_id}
                onChange={(e) => setIssueForm({ ...issueForm, booking_id: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a booking...</option>
                {approvedBookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.equipment_name} — {b.user_name} ({new Date(b.start_time).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition at Issue</label>
              <select
                value={issueForm.issue_condition}
                onChange={(e) => setIssueForm({ ...issueForm, issue_condition: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CONDITIONS.filter((c) => c !== 'DAMAGED').map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setIssueOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={issueSaving}>{issueSaving ? 'Issuing...' : 'Issue Equipment'}</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Return Modal */}
      <Modal open={!!returnTarget} title={`Return ${returnTarget?.equipment_name || ''}`} onClose={() => setReturnTarget(null)}>
        <ErrorBanner message={returnError} />
        <form onSubmit={handleReturnSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition on Return</label>
            <select
              value={returnForm.return_condition}
              onChange={(e) => setReturnForm({ ...returnForm, return_condition: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {['DAMAGED', 'POOR'].includes(returnForm.return_condition) && (
              <p className="text-xs text-amber-600 mt-1.5">
                This will mark the equipment as DAMAGED and automatically open an issue record.
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea rows={2} value={returnForm.remarks}
              onChange={(e) => setReturnForm({ ...returnForm, remarks: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setReturnTarget(null)}>Cancel</Button>
            <Button type="submit" disabled={returnSaving}>{returnSaving ? 'Processing...' : 'Confirm Return'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Transactions;
