import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLabs, createLab, updateLab, deleteLab } from '../services/labService';
import { getUsers } from '../services/userService';
import Button from '../components/Button';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';

const emptyForm = { name: '', department: '', location: '', description: '', lab_assistant_id: '' };

const Labs = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [labs, setLabs] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      setLabs(await getLabs());
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load laboratories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = async () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setFormOpen(true);
    if (isAdmin) {
      try { setAssistants(await getUsers({ role: 'LAB_ASSISTANT' })); } catch { setAssistants([]); }
    }
  };

  const openEdit = async (lab) => {
    setEditingId(lab.id);
    setForm({
      name: lab.name, department: lab.department || '', location: lab.location || '',
      description: lab.description || '', lab_assistant_id: lab.lab_assistant_id || ''
    });
    setFormError('');
    setFormOpen(true);
    if (isAdmin) {
      try { setAssistants(await getUsers({ role: 'LAB_ASSISTANT' })); } catch { setAssistants([]); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = { ...form, lab_assistant_id: form.lab_assistant_id || null };
      if (editingId) await updateLab(editingId, payload);
      else await createLab(payload);
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save laboratory.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lab) => {
    if (!window.confirm(`Delete "${lab.name}"?`)) return;
    try {
      await deleteLab(lab.id);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete laboratory.');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laboratories</h1>
          <p className="text-sm text-gray-500 mt-1">Departments, locations, and assigned lab assistants.</p>
        </div>
        {isAdmin && <Button onClick={openAdd}>+ Add Laboratory</Button>}
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <LoadingSpinner label="Loading laboratories..." />
      ) : labs.length === 0 ? (
        <EmptyState title="No laboratories yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {labs.map((lab) => (
            <div key={lab.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900">{lab.name}</h3>
              <p className="text-sm text-gray-500">{lab.department}</p>
              {lab.location && <p className="text-sm text-gray-400 mt-1">{lab.location}</p>}
              <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
                <span className="text-gray-400">Assistant: </span>
                <span className="text-gray-700">{lab.assistant_name || 'Unassigned'}</span>
              </div>
              {isAdmin && (
                <div className="flex gap-2 mt-4">
                  <Button variant="secondary" className="text-xs px-3 py-1.5" onClick={() => openEdit(lab)}>Edit</Button>
                  <Button variant="danger" className="text-xs px-3 py-1.5" onClick={() => handleDelete(lab)}>Delete</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={formOpen} title={editingId ? 'Edit Laboratory' : 'Add Laboratory'} onClose={() => setFormOpen(false)}>
        <ErrorBanner message={formError} />
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lab Assistant</label>
            <select value={form.lab_assistant_id} onChange={(e) => setForm({ ...form, lab_assistant_id: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Unassigned</option>
              {assistants.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.email})</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Don't see anyone? Promote a user to Lab Assistant from the Users page first.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Laboratory'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Labs;
