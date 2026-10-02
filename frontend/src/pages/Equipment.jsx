import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getEquipment, createEquipment, updateEquipment, retireEquipment, getEquipmentQrImage
} from '../services/equipmentService';
import { getCategories } from '../services/categoryService';
import { getLabs } from '../services/labService';
import { requestBooking } from '../services/bookingService';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';

const CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'];
const STATUSES = ['AVAILABLE', 'BOOKED', 'ISSUED', 'MAINTENANCE', 'DAMAGED', 'LOST', 'RETIRED'];

const emptyForm = {
  name: '', category_id: '', lab_id: '', serial_number: '', manufacturer: '',
  model_number: '', purchase_date: '', purchase_cost: '', condition: 'GOOD', description: ''
};

const Equipment = () => {
  const { user } = useAuth();
  const isStaff = ['ADMIN', 'LAB_ASSISTANT'].includes(user?.role);
  const isAdmin = user?.role === 'ADMIN';

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const [filters, setFilters] = useState({ search: '', status: '', category_id: '', lab_id: '' });

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [bookingTarget, setBookingTarget] = useState(null);
  const [bookingForm, setBookingForm] = useState({ start_time: '', end_time: '', purpose: '' });
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [qrTarget, setQrTarget] = useState(null);
  const [qrImage, setQrImage] = useState('');
  const [qrLoading, setQrLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getEquipment(filters);
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load equipment.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.status, filters.category_id, filters.lab_id]);

  useEffect(() => {
    const timeout = setTimeout(load, 300); // debounce search
    return () => clearTimeout(timeout);
  }, [load]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    getLabs().then(setLabs).catch(() => {});
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setActionError('');
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name || '', category_id: item.category_id || '', lab_id: item.lab_id || '',
      serial_number: item.serial_number || '', manufacturer: item.manufacturer || '',
      model_number: item.model_number || '',
      purchase_date: item.purchase_date ? item.purchase_date.slice(0, 10) : '',
      purchase_cost: item.purchase_cost || '', condition: item.condition || 'GOOD',
      description: item.description || ''
    });
    setActionError('');
    setFormOpen(true);
  };

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setActionError('');
    try {
      if (editingId) {
        await updateEquipment(editingId, form);
      } else {
        await createEquipment(form);
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to save equipment.');
    } finally {
      setSaving(false);
    }
  };

  const handleRetire = async (item) => {
    if (!window.confirm(`Retire "${item.name}"? This cannot be booked or issued afterwards.`)) return;
    try {
      await retireEquipment(item.id);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to retire equipment.');
    }
  };

  const openBooking = (item) => {
    setBookingTarget(item);
    setBookingForm({ start_time: '', end_time: '', purpose: '' });
    setBookingError('');
    setBookingSuccess(false);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBooking(true);
    setBookingError('');
    try {
      await requestBooking({
        equipment_id: bookingTarget.id,
        start_time: bookingForm.start_time.replace('T', ' ') + ':00',
        end_time: bookingForm.end_time.replace('T', ' ') + ':00',
        purpose: bookingForm.purpose
      });
      setBookingSuccess(true);
      setTimeout(() => setBookingTarget(null), 1200);
    } catch (err) {
      setBookingError(err.response?.data?.error || 'Failed to request booking.');
    } finally {
      setBooking(false);
    }
  };

  const openQr = async (item) => {
    setQrTarget(item);
    setQrImage('');
    setQrLoading(true);
    try {
      const data = await getEquipmentQrImage(item.id);
      setQrImage(data.qr_image);
    } catch {
      setQrImage('');
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment</h1>
          <p className="text-sm text-gray-500 mt-1">Browse, search and manage laboratory equipment.</p>
        </div>
        {isAdmin && <Button onClick={openAddForm}>+ Add Equipment</Button>}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input
          placeholder="Search name, manufacturer, serial..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 sm:col-span-2"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filters.lab_id}
          onChange={(e) => setFilters({ ...filters, lab_id: e.target.value })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All labs</option>
          {labs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <LoadingSpinner label="Loading equipment..." />
      ) : items.length === 0 ? (
        <EmptyState title="No equipment found" description="Try adjusting your filters." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-900 leading-tight">{item.name}</h3>
                <StatusBadge status={item.status} />
              </div>
              <p className="text-xs text-gray-400 mb-3">{item.serial_number}</p>
              <dl className="text-sm text-gray-600 space-y-1 mb-4 flex-1">
                <div className="flex justify-between"><dt className="text-gray-400">Category</dt><dd>{item.category_name}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-400">Lab</dt><dd>{item.lab_name}</dd></div>
                {item.manufacturer && <div className="flex justify-between"><dt className="text-gray-400">Manufacturer</dt><dd>{item.manufacturer}</dd></div>}
                <div className="flex justify-between"><dt className="text-gray-400">Condition</dt><dd><StatusBadge status={item.condition} /></dd></div>
              </dl>

              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                {!isStaff && item.status === 'AVAILABLE' && (
                  <Button variant="primary" onClick={() => openBooking(item)} className="text-xs px-3 py-1.5">Book</Button>
                )}
                {isStaff && (
                  <Button variant="secondary" onClick={() => openEditForm(item)} className="text-xs px-3 py-1.5">Edit</Button>
                )}
                {isStaff && (
                  <Button variant="secondary" onClick={() => openQr(item)} className="text-xs px-3 py-1.5">QR</Button>
                )}
                {isAdmin && item.status !== 'RETIRED' && (
                  <Button variant="danger" onClick={() => handleRetire(item)} className="text-xs px-3 py-1.5">Retire</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Equipment Modal (staff) */}
      <Modal open={formOpen} title={editingId ? 'Edit Equipment' : 'Add Equipment'} onClose={() => setFormOpen(false)}>
        <ErrorBanner message={actionError} />
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input name="name" required value={form.name} onChange={handleFormChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category_id" required value={form.category_id} onChange={handleFormChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Laboratory</label>
              <select name="lab_id" required value={form.lab_id} onChange={handleFormChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select...</option>
                {labs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
              <input name="serial_number" required disabled={!!editingId} value={form.serial_number} onChange={handleFormChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select name="condition" value={form.condition} onChange={handleFormChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
              <input name="manufacturer" value={form.manufacturer} onChange={handleFormChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Number</label>
              <input name="model_number" value={form.model_number} onChange={handleFormChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
              <input type="date" name="purchase_date" value={form.purchase_date} onChange={handleFormChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Cost</label>
              <input type="number" step="0.01" name="purchase_cost" value={form.purchase_cost} onChange={handleFormChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" rows={2} value={form.description} onChange={handleFormChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Equipment'}</Button>
          </div>
        </form>
      </Modal>

      {/* Booking Modal (student) */}
      <Modal open={!!bookingTarget} title={`Book ${bookingTarget?.name || ''}`} onClose={() => setBookingTarget(null)}>
        <ErrorBanner message={bookingError} />
        {bookingSuccess ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Booking request sent! Check "Bookings" for status updates.
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                <input type="datetime-local" required value={bookingForm.start_time}
                  onChange={(e) => setBookingForm({ ...bookingForm, start_time: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                <input type="datetime-local" required value={bookingForm.end_time}
                  onChange={(e) => setBookingForm({ ...bookingForm, end_time: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
              <textarea rows={2} value={bookingForm.purpose}
                onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })}
                placeholder="e.g. Circuit design lab session"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setBookingTarget(null)}>Cancel</Button>
              <Button type="submit" disabled={booking}>{booking ? 'Requesting...' : 'Request Booking'}</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* QR Modal (staff) */}
      <Modal open={!!qrTarget} title={`QR Code — ${qrTarget?.name || ''}`} onClose={() => setQrTarget(null)} maxWidth="max-w-sm">
        <div className="flex flex-col items-center gap-3">
          {qrLoading ? (
            <LoadingSpinner label="Generating QR..." />
          ) : qrImage ? (
            <>
              <img src={qrImage} alt="Equipment QR code" className="w-56 h-56 rounded-lg border border-gray-200" />
              <p className="text-xs text-gray-400 text-center">Print and attach this to the physical equipment.</p>
            </>
          ) : (
            <p className="text-sm text-gray-500 py-8">This equipment has no QR code yet.</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Equipment;
