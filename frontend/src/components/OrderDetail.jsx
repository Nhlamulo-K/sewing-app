import { useState } from "react";
import { updateOrder, deleteOrder } from "../services/api";

const STATUS_OPTIONS = [
    {value: 'new', label: 'New'},
    {value: 'progress', label: 'In progress'},
    {value: 'fitting', label: 'Fitting'},
    {value: 'done', label: 'Done'},
];

const STATUS_STYLES = {
  new: 'bg-blue-100 text-blue-700',
  progress: 'bg-amber-100 text-amber-700',
  fitting: 'bg-pink-100 text-pink-700',
  done: 'bg-green-100 text-green-700',
};

export default function OrderDetail({ order, onClose, onUpdate, onDelete }) {
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const balance = parseFloat(order.price) - parseFloat(order.deposit);
  const days = Math.ceil((new Date(order.deadline) - new Date()) / (1000 * 60 * 60 * 24));

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    setSaving(true);
    setError('');
    try {
      await updateOrder(order.id, {
        garment_type: order.garment_type,
        status: newStatus,
        deadline: order.deadline,
        price: order.price,
        deposit: order.deposit,
        fabric_notes: order.fabric_notes,
        notes: order.notes,
      });
      onUpdate();
    } catch (err) {
      setError('Failed to update status');
      setStatus(order.status);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete order for ${order.client_name}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteOrder(order.id);
      onDelete();
    } catch (err) {
      setError('Failed to delete order');
      setDeleting(false);
    }
  };

  const hasMeasurements = order.bust || order.waist || order.hips ||
    order.shoulder_width || order.length || order.sleeve_length;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-start justify-center pt-10 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto p-6 mx-4">

        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{order.client_name}</h2>
            <p className="text-sm text-gray-500 mt-1">📞 {order.client_phone || 'No phone'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-4">
          <span className="text-sm text-gray-500 font-medium">Status</span>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                disabled={saving}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  status === opt.value
                    ? STATUS_STYLES[opt.value]
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Order details</p>
        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
          {[
            { label: 'Garment', value: order.garment_type },
            {
              label: 'Deadline',
              value: new Date(order.deadline).toLocaleDateString('en-ZA', {
                day: 'numeric', month: 'long', year: 'numeric'
              }),
              extra: days < 0
                ? <span className="text-red-500 text-xs font-medium ml-2">Overdue by {Math.abs(days)} days</span>
                : days <= 7
                ? <span className="text-amber-500 text-xs font-medium ml-2">{days} days left</span>
                : null
            },
            { label: 'Quoted', value: `R${parseFloat(order.price).toLocaleString()}` },
            { label: 'Deposit paid', value: `R${parseFloat(order.deposit).toLocaleString()}`, color: 'text-green-600 font-medium' },
            {
              label: 'Balance due',
              value: `R${balance.toLocaleString()}`,
              color: balance > 0 ? 'text-amber-600 font-medium' : 'text-green-600 font-medium'
            },
          ].map(row => (
            <div key={row.label} className="flex justify-between text-sm">
              <span className="text-gray-500">{row.label}</span>
              <span className={row.color || 'text-gray-800'}>
                {row.value}
                {row.extra}
              </span>
            </div>
          ))}

          {order.fabric_notes && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Fabric</span>
              <span className="text-gray-800 text-right max-w-xs">{order.fabric_notes}</span>
            </div>
          )}

          {order.notes && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Notes</span>
              <span className="text-gray-800 text-right max-w-xs">{order.notes}</span>
            </div>
          )}
        </div>

        {hasMeasurements && (
          <>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Measurements</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { key: 'bust', label: 'Bust' },
                { key: 'waist', label: 'Waist' },
                { key: 'hips', label: 'Hips' },
                { key: 'shoulder_width', label: 'Shoulder' },
                { key: 'length', label: 'Length' },
                { key: 'sleeve_length', label: 'Sleeve' },
              ].filter(m => order[m.key]).map(m => (
                <div key={m.key} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">{m.label}</p>
                  <p className="font-semibold text-gray-800">{order[m.key]} cm</p>
                </div>
              ))}
            </div>
            </>
        )}
        <div className="flex gap-3 mt-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-2 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete order'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
        </div>
    </div>
  );
}