import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardSummary } from '../services/analyticsService';
import { getMyBookings } from '../services/bookingService';
import { getTransactions } from '../services/transactionService';
import { getIssues } from '../services/issueService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';

const StatCard = ({ title, value, accent = 'text-gray-900', description }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
    <p className="text-sm font-medium text-gray-500">{title}</p>
    <p className={`mt-3 text-3xl font-bold ${accent}`}>{value}</p>
    {description && <p className="mt-2 text-sm text-gray-400">{description}</p>}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isStaff = ['ADMIN', 'LAB_ASSISTANT'].includes(user?.role);

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');

        if (isStaff) {
          const summary = await getDashboardSummary();
          setCards([
            { title: 'Total Equipment', value: summary.equipment.total_equipment, description: 'Registered equipment' },
            { title: 'Available', value: summary.equipment.available, accent: 'text-emerald-600', description: 'Ready to use' },
            { title: 'Issued', value: summary.equipment.issued, accent: 'text-blue-600', description: 'Currently with users' },
            { title: 'Under Maintenance', value: summary.equipment.under_maintenance, accent: 'text-amber-600', description: 'Being repaired' },
            { title: 'Pending Bookings', value: summary.bookings.pending, accent: 'text-amber-600', description: 'Awaiting approval' },
            { title: 'Open Issues', value: summary.issues.open_issues, accent: 'text-red-600', description: 'Need attention' },
          ]);
        } else {
          const [bookings, transactions, issues] = await Promise.all([
            getMyBookings(),
            getTransactions({ active: 'true' }),
            getIssues(),
          ]);
          setCards([
            {
              title: 'Active Bookings', accent: 'text-blue-600',
              value: bookings.filter((b) => ['PENDING', 'APPROVED'].includes(b.status)).length,
              description: 'Pending or approved'
            },
            { title: 'Currently Issued', value: transactions.length, accent: 'text-emerald-600', description: 'Equipment in your hands' },
            {
              title: 'Issues Reported', accent: 'text-red-600',
              value: issues.filter((i) => i.status !== 'RESOLVED').length,
              description: 'Awaiting resolution'
            },
            { title: 'Total Bookings Made', value: bookings.length, description: 'All-time history' },
          ]);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isStaff]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="mt-2 text-gray-500 text-sm">
          {isStaff ? "Here's what's happening across the labs today." : "Here's a snapshot of your lab activity."}
        </p>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <LoadingSpinner label="Loading dashboard..." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.map((card) => <StatCard key={card.title} {...card} />)}
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Quick Actions</h2>
              <p className="text-sm text-gray-400 mb-4">Jump straight to a common task.</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => navigate('/equipment')} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                  Browse Equipment
                </button>
                <button onClick={() => navigate('/bookings')} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  {isStaff ? 'Review Bookings' : 'My Bookings'}
                </button>
                {!isStaff && (
                  <button onClick={() => navigate('/issues')} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                    Report an Issue
                  </button>
                )}
                {isStaff && (
                  <button onClick={() => navigate('/transactions')} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                    Issue / Return
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Scan Equipment</h2>
              <p className="text-sm text-gray-400 mb-4">
                Use your camera to scan a QR code and jump straight to that item's details.
              </p>
              <button onClick={() => navigate('/qr-scanner')} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800">
                Open Scanner
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
