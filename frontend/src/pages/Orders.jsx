import { useState, useEffect } from 'react';
import { getOrders } from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">All Orders</h2>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
        >
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="progress">In progress</option>
          <option value="fitting">Fitting</option>
          <option value="done">Done</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm">No orders found</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800">{order.client_name}</p>
                  <p className="text-sm text-gray-500 mt-1">{order.garment_type}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-800">R{parseFloat(order.price).toLocaleString()}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    order.status === 'new' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'progress' ? 'bg-amber-100 text-amber-700' :
                    order.status === 'fitting' ? 'bg-pink-100 text-pink-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {order.status === 'progress' ? 'In progress' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between mt-3 text-sm text-gray-400">
                <span>📞 {order.client_phone}</span>
                <span>Due: {new Date(order.deadline).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}