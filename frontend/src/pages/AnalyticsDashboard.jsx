import { useEffect, useState } from 'react';
import {
  getDashboardSummary,
  getEquipmentUtilization,
  getMaintenanceStats,
  getBookingStats
} from '../services/analyticsService';

const AnalyticsDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [equipmentUtilization, setEquipmentUtilization] = useState([]);
  const [maintenance, setMaintenance] = useState(null);
  const [bookingStats, setBookingStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError('');

        const [
          summaryResponse,
          utilizationResponse,
          maintenanceResponse,
          bookingResponse
        ] = await Promise.all([
          getDashboardSummary(),
          getEquipmentUtilization(),
          getMaintenanceStats(),
          getBookingStats()
        ]);

        setSummary(summaryResponse.data);
        setEquipmentUtilization(utilizationResponse.data);
        setMaintenance(maintenanceResponse.data);
        setBookingStats(bookingResponse.data);
      } catch (err) {
        console.error('Analytics loading error:', err);

        setError(
          err.response?.data?.error ||
          'Failed to load analytics data.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">
          Loading analytics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Analytics Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Overview of LabTrack equipment, bookings, users, issues and maintenance.
        </p>
      </div>

      {/* Equipment Summary */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          Equipment
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Total Equipment
            </p>
            <p className="mt-2 text-2xl font-bold">
              {summary?.equipment?.total_equipment ?? 0}
            </p>
          </div>

          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Available
            </p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {summary?.equipment?.available ?? 0}
            </p>
          </div>

          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Issued
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {summary?.equipment?.issued ?? 0}
            </p>
          </div>

          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Maintenance
            </p>
            <p className="mt-2 text-2xl font-bold text-orange-600">
              {summary?.equipment?.under_maintenance ?? 0}
            </p>
          </div>

        </div>
      </section>

      {/* Booking Summary */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          Bookings
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Total Bookings
            </p>
            <p className="mt-2 text-2xl font-bold">
              {summary?.bookings?.total_bookings ?? 0}
            </p>
          </div>

          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Pending
            </p>
            <p className="mt-2 text-2xl font-bold text-yellow-600">
              {summary?.bookings?.pending ?? 0}
            </p>
          </div>

          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Approved
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {summary?.bookings?.approved ?? 0}
            </p>
          </div>

          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Completed
            </p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {summary?.bookings?.completed ?? 0}
            </p>
          </div>

        </div>
      </section>

      {/* Users and Issues */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          Users & Issues
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Total Users
            </p>
            <p className="mt-2 text-2xl font-bold">
              {summary?.users?.total_users ?? 0}
            </p>
          </div>

          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Students
            </p>
            <p className="mt-2 text-2xl font-bold">
              {summary?.users?.students ?? 0}
            </p>
          </div>

          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Total Issues
            </p>
            <p className="mt-2 text-2xl font-bold">
              {summary?.issues?.total_issues ?? 0}
            </p>
          </div>

          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Open Issues
            </p>
            <p className="mt-2 text-2xl font-bold text-red-600">
              {summary?.issues?.open_issues ?? 0}
            </p>
          </div>

        </div>
      </section>

      {/* Maintenance */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          Maintenance
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">

          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Maintenance Records
            </p>
            <p className="mt-2 text-2xl font-bold">
              {maintenance?.summary?.total_records ?? 0}
            </p>
          </div>

          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Completed
            </p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {maintenance?.summary?.completed ?? 0}
            </p>
          </div>

          <div className="rounded-lg bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Total Cost
            </p>
            <p className="mt-2 text-2xl font-bold">
              ₹{maintenance?.summary?.total_cost_spent ?? 0}
            </p>
          </div>

        </div>
      </section>

      {/* Equipment Utilization */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          Equipment Utilization
        </h2>

        <div className="overflow-x-auto rounded-lg bg-white shadow">

          <table className="min-w-full text-sm">

            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  Equipment
                </th>

                <th className="px-4 py-3 text-left">
                  Serial Number
                </th>

                <th className="px-4 py-3 text-left">
                  Times Issued
                </th>

                <th className="px-4 py-3 text-left">
                  Hours Used
                </th>
              </tr>
            </thead>

            <tbody>

              {equipmentUtilization.map((equipment) => (
                <tr
                  key={equipment.id}
                  className="border-b last:border-b-0"
                >
                  <td className="px-4 py-3 font-medium">
                    {equipment.name}
                  </td>

                  <td className="px-4 py-3">
                    {equipment.serial_number}
                  </td>

                  <td className="px-4 py-3">
                    {equipment.times_issued}
                  </td>

                  <td className="px-4 py-3">
                    {equipment.total_hours_used}
                  </td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>
      </section>

      {/* Upcoming Maintenance */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          Upcoming Maintenance
        </h2>

        <div className="rounded-lg bg-white shadow">

          {maintenance?.upcoming_due?.length === 0 ? (

            <p className="p-5 text-sm text-gray-500">
              No upcoming maintenance.
            </p>

          ) : (

            <div className="divide-y">

              {maintenance?.upcoming_due?.map((item) => (

                <div
                  key={item.id}
                  className="flex items-center justify-between p-5"
                >

                  <div>
                    <p className="font-medium text-gray-900">
                      {item.equipment_name}
                    </p>

                    <p className="text-sm text-gray-500">
                      Maintenance record #{item.id}
                    </p>
                  </div>

                  <p className="text-sm font-medium">
                    {new Date(item.next_due_date).toLocaleDateString()}
                  </p>

                </div>

              ))}

            </div>

          )}

        </div>
      </section>

      {/* Booking Status */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          Booking Status
        </h2>

        <div className="rounded-lg bg-white p-5 shadow">

          {bookingStats?.by_status?.map((item) => (

            <div
              key={item.status}
              className="flex items-center justify-between border-b py-3 last:border-b-0"
            >

              <span className="font-medium">
                {item.status}
              </span>

              <span className="font-bold">
                {item.count}
              </span>

            </div>

          ))}

        </div>
      </section>

    </div>
  );
};

export default AnalyticsDashboard;