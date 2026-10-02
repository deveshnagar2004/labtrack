import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getIssues, reportIssue, updateIssueStatus } from '../services/issueService';
import { getEquipment } from '../services/equipmentService';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const emptyForm = { equipment_id: '', title: '', description: '', severity: 'MEDIUM' };

const Issues = () => {
  const { user } = useAuth();
  const isStaff = ['ADMIN', 'LAB_ASSISTANT'].includes(user?.role);

  const [issues, setIssues] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getIssues(statusFilter ? { status: statusFilter } : {});
      setIssues(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load issues.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openForm = async () => {
    setForm(emptyForm);
    setFormError('');
    setFormOpen(true);
    try {
      setEquipmentList(await getEquipment());
    } catch {
      setEquipmentList([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await reportIssue(form);
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to report issue.');
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (id, status) => {
    setActingId(id);
    try {
      await updateIssueStatus(id, status);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update issue.');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issues</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isStaff ? 'Track and resolve reported equipment problems.' : 'Issues you have reported.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            {['OPEN', 'IN_PROGRESS', 'RESOLVED'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button onClick={openForm}>+ Report Issue</Button>
        </div>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <LoadingSpinner label="Loading issues..." />
      ) : issues.length === 0 ? (
        <EmptyState title="No issues found" description="Report a problem with equipment to have it reviewed by staff." />
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div key={issue.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                    <StatusBadge status={issue.severity} />
                    <StatusBadge status={issue.status} />
                  </div>
                  <p className="text-sm text-gray-500">{issue.equipment_name}</p>
                  {issue.description && <p className="text-sm text-gray-600 mt-2">{issue.description}</p>}
                  <p className="text-xs text-gray-400 mt-2">
                    Reported by {issue.reported_by_name} on {new Date(issue.created_at).toLocaleDateString()}
                  </p>
                </div>
                {isStaff && issue.status !== 'RESOLVED' && (
                  <div className="flex gap-2 shrink-0">
                    {issue.status === 'OPEN' && (
                      <Button variant="secondary" className="text-xs px-3 py-1.5" disabled={actingId === issue.id}
                        onClick={() => changeStatus(issue.id, 'IN_PROGRESS')}>Start Progress</Button>
                    )}
                    <Button variant="success" className="text-xs px-3 py-1.5" disabled={actingId === issue.id}
                      onClick={() => changeStatus(issue.id, 'RESOLVED')}>Mark Resolved</Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={formOpen} title="Report an Equipment Issue" onClose={() => setFormOpen(false)}>
        <ErrorBanner message={formError} />
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
            <select required value={form.equipment_id} onChange={(e) => setForm({ ...form, equipment_id: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select equipment...</option>
              {equipmentList.map((eq) => <option key={eq.id} value={eq.id}>{eq.name} ({eq.serial_number})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Short summary of the problem"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what's wrong..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Submitting...' : 'Submit Report'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Issues;
