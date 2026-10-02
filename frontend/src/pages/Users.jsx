import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers, updateUser, deactivateUser } from '../services/userService';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';

const ROLES = ['STUDENT', 'LAB_ASSISTANT', 'ADMIN'];

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      setUsers(await getUsers(roleFilter ? { role: roleFilter } : {}));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [roleFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeRole = async (u, role) => {
    setActingId(u.id);
    try {
      await updateUser(u.id, { role, is_active: u.is_active });
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user.');
    } finally {
      setActingId(null);
    }
  };

  const toggleActive = async (u) => {
    setActingId(u.id);
    try {
      if (u.is_active) {
        if (!window.confirm(`Deactivate ${u.name}? They will no longer be able to log in.`)) { setActingId(null); return; }
        await deactivateUser(u.id);
      } else {
        await updateUser(u.id, { role: u.role, is_active: true });
      }
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user.');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Promote a student to Lab Assistant, or deactivate an account.
          </p>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <LoadingSpinner label="Loading users..." />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {u.name} {u.id === currentUser.id && <span className="text-xs text-gray-400">(you)</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={u.id === currentUser.id || actingId === u.id}
                        onChange={(e) => changeRole(u, e.target.value)}
                        className="rounded-lg border border-gray-300 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.is_active ? 'AVAILABLE' : 'RETIRED'} />
                      <span className="ml-1.5 text-xs text-gray-400">{u.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.id !== currentUser.id && (
                        <Button
                          variant={u.is_active ? 'danger' : 'success'}
                          className="text-xs px-3 py-1.5"
                          disabled={actingId === u.id}
                          onClick={() => toggleActive(u)}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
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

export default Users;
