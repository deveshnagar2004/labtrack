import { useCallback, useEffect, useState } from 'react';
import { getMaintenanceRecords, startMaintenance, finishMaintenance } from '../services/maintenanceService';
import { getEquipment } from '../services/equipmentService';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';

const emptyStartForm = { equipment_id: '', technician_name: '', maintenance_type: '', description: '', cost: '' };

const Maintenance = () => {
  const [records, setRecords] = useState([]);
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [startOpen, setStartOpen] = useState(false);
  const [startForm, setStartForm] = useState(emptyStartForm);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');

  const [finishTarget, setFinishTarget] = useState(null);
  const [finishForm, setFinishForm] = useState({ completion_date: '', next_due_date: '', cost: '' });
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setRecords(await getMaintenanceRecords());
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load maintenance records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openStart = async () => {
    setStartForm(emptyStartForm);
    setStartError('');
    setStartOpen(true);
    try {
      const all = await getEquipment();
      setAvailableEquipment(all.filter((e) => !['ISSUED', 'MAINTENANCE', 'RETIRED'].includes(e.status)));
    } catch {
      setAvailableEquipment([]);
    }
  };

  const handleStart = async (e) => {
    e.preventDefault();
    setStarting(true);
    setStartError('');
    try {
      await startMaintenance(startForm);
      setStartOpen(false);
      load();
    } catch (err) {
      setStartError(err.response?.data?.error || 'Failed to start maintenance.');
    } finally {
      setStarting(false);
    }
  };

  const openFinish = (record) => {
    setFinishTarget(record);
    setFinishForm({ completion_date: new Date().toISOString().slice(0, 10), next_due_date: '', cost: record.cost || '' });
    setFinishError('');
  };

  const handleFinish = async (e) => {
    e.preventDefault();
    setFinishing(true);
    setFinishError('');
    try {
      await finishMaintenance(finishTarget.id, finishForm);
      setFinishTarget(null);
      load();
    } catch (err) {
      setFinishError(err.response?.data?.error || 'Failed to complete maintenance.');
    } finally {
      setFinishing(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
          <p className="text-sm text-gray-500 mt-1">Track repair jobs and schedule future maintenance.</p>
        </div>
        <Button onClick={openStart}>+ Start Maintenance</Button>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <LoadingSpinner label="Loading maintenance records..." />
      ) : records.length === 0 ? (
        <EmptyState title="No maintenance records" description="Start a maintenance job when equipment needs repair." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Equipment</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Technician</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Started</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Next Due</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Cost</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{r.equipment_name}</p>
                      <p className="text-xs text-gray-400">{r.serial_number}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.maintenance_type || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.technician_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.start_date ? new Date(r.start_date).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.next_due_date ? new Date(r.next_due_date).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.cost ? `₹${r.cost}` : '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-right">
                      {r.status !== 'COMPLETED' && (
                        <Button variant="success" className="text-xs px-3 py-1.5" onClick={() => openFinish(r)}>Complete</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={startOpen} title="Start Maintenance" onClose={() => setStartOpen(false)}>
        <ErrorBanner message={startError} />
        <form onSubmit={handleStart} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
            <select required value={startForm.equipment_id} onChange={(e) => setStartForm({ ...startForm, equipment_id: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select equipment...</option>
              {availableEquipment.map((eq) => <option key={eq.id} value={eq.id}>{eq.name} ({eq.serial_number})</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">Only equipment that is not currently issued or already in maintenance is shown.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
              <input value={startForm.technician_name} onChange={(e) => setStartForm({ ...startForm, technician_name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <input value={startForm.maintenance_type} onChange={(e) => setStartForm({ ...startForm, maintenance_type: e.target.value })}
                placeholder="e.g. Repair, Calibration"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
            <input type="number" step="0.01" value={startForm.cost} onChange={(e) => setStartForm({ ...startForm, cost: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={2} value={startForm.description} onChange={(e) => setStartForm({ ...startForm, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setStartOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={starting}>{starting ? 'Starting...' : 'Start Maintenance'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!finishTarget} title={`Complete Maintenance — ${finishTarget?.equipment_name || ''}`} onClose={() => setFinishTarget(null)}>
        <ErrorBanner message={finishError} />
        <form onSubmit={handleFinish} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date</label>
            <input type="date" value={finishForm.completion_date} onChange={(e) => setFinishForm({ ...finishForm, completion_date: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next Maintenance Due <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="date" value={finishForm.next_due_date} onChange={(e) => setFinishForm({ ...finishForm, next_due_date: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Final Cost</label>
            <input type="number" step="0.01" value={finishForm.cost} onChange={(e) => setFinishForm({ ...finishForm, cost: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setFinishTarget(null)}>Cancel</Button>
            <Button type="submit" disabled={finishing}>{finishing ? 'Completing...' : 'Mark Completed'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Maintenance;
