import { useState, useEffect } from 'react';
import { getOrders } from '../services/api';

export default function Dashboard({ onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const active = orders.filter(o => o.status !== 'done');
  const dueThisWeek = orders.filter(o => {
    const days = Math.ceil((new Date(o.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return o.status !== 'done' && days <= 7;
  });
  const totalQuoted = orders.reduce((sum, o) => sum + parseFloat(o.price || 0), 0);
  const totalDeposits = orders.reduce((sum, o) => sum + parseFloat(o.deposit || 0), 0);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active orders', value: active.length, color: 'text-gray-800' },
          { label: 'Due this week', value: dueThisWeek.length, color: dueThisWeek.length ? 'text-amber-600' : 'text-gray-800' },
          { label: 'Total quoted', value: `R${totalQuoted.toLocaleString()}`, color: 'text-gray-800' },
          { label: 'Deposits received', value: `R${totalDeposits.toLocaleString()}`, color: 'text-green-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Upcoming deadlines */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-800">Upcoming deadlines</h3>
        <button
          onClick={() => onNavigate('orders')}
          className="text-sm text-indigo-600 hover:underline"
        >
          View all
        </button>
      </div>

      {active.length === 0 ? (
        <p className="text-gray-400 text-sm">No active orders</p>
      ) : (
        <div className="space-y-3">
          {active
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
            .slice(0, 5)
            .map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }) {
  const days = Math.ceil((new Date(order.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const urgency = days <= 3 ? 'border-l-red-500' : days <= 10 ? 'border-l-amber-400' : 'border-l-green-400';

  return (
    <div className={`bg-white rounded-xl border border-gray-200 border-l-4 ${urgency} p-4 flex justify-between items-center`}>
      <div>
        <p className="font-medium text-gray-800">{order.client_name}</p>
        <p className="text-sm text-gray-500">{order.garment_type}</p>
      </div>
      <div className="text-right">
        <p className="font-medium text-gray-800">R{parseFloat(order.price).toLocaleString()}</p>
        <p className={`text-sm ${days <= 3 ? 'text-red-500 font-medium' : days <= 10 ? 'text-amber-500' : 'text-gray-400'}`}>
          {days < 0 ? `Overdue by ${Math.abs(days)} days` : days === 0 ? 'Due today!' : `${days} days left`}
        </p>
      </div>
    </div>
  );
}