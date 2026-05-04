import { useState, useEffect } from "react";
import { createClient, createOrder, getClients } from "../services/api";

const GARMENT_TYPES = [
    'Matric dance dress',
    'Wedding dress',
    'Bridesmaid dress',
    'Formal dress',
    'Traditional outfit',
    'School uniform',
    'Vests',
    'Other',
];

const defaultForm = {
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    garmentType: '',
    deadline: '',
    price: '',
    deposit: '',
    fabricNotes: '',
    notes: '',
};

const defaultMeasurements = {
    bust: '',
    waist: '',
    hips: '',
    shoulder_width: '',
    length: '',
    sleeve_length: '',
};

export default function NewOrderForm({onClose, onSuccess}) {
    const [form, setForm] = useState(defaultForm);
  const [measurements, setMeasurements] = useState(defaultMeasurements);
  const [existingClients, setExistingClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isNewClient, setIsNewClient] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getClients().then(setExistingClients).catch(console.error);
  }, []);

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMeasurementChange = (e) => {
    setMeasurements(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError('');

    if (isNewClient && !form.clientName.trim()) {
      return setError('Client name is required');
    }
    if (!isNewClient && !selectedClientId) {
      return setError('Please select a client');
    }
    if (!form.garmentType) return setError('Please select a garment type');
    if (!form.deadline) return setError('Please set a deadline');
    
    setLoading(true);
    try {
      let clientId = selectedClientId;
      if (isNewClient) {
        const newClient = await createClient({
          name: form.clientName.trim(),
          phone: form.clientPhone.trim(),
          email: form.clientEmail.trim(),
        });
        clientId = newClient.id;
      }

      const filledMeasurements = Object.fromEntries(
        Object.entries(measurements).filter(([_, v]) => v !== '')
      );

      await createOrder({
        client_id: clientId,
        garment_type: form.garmentType,
        deadline: form.deadline,
        price: parseFloat(form.price) || 0,
        deposit: parseFloat(form.deposit) || 0,
        fabric_notes: form.fabricNotes,
        notes: form.notes,
        measurements: Object.keys(filledMeasurements).length > 0
          ? filledMeasurements
          : null,
      });

      onSuccess();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center pt-10 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto p-6 mx-4">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">New Order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Client</p>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setIsNewClient(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
              isNewClient
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            New client
          </button>
          <button
            onClick={() => setIsNewClient(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
              !isNewClient
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Existing client
          </button>
        </div>

        {isNewClient ? (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Full name *</label>
              <input
                name="clientName"
                value={form.clientName}
                onChange={handleFormChange}
                placeholder="e.g. Thandi Mokoena"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
                <label className="text-xs text-gray-500 mb-1 block">Phone</label>
              <input
                name="clientPhone"
                value={form.clientPhone}
                onChange={handleFormChange}
                placeholder="072 xxx xxxx"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email</label>
              <input
                name="clientEmail"
                value={form.clientEmail}
                onChange={handleFormChange}
                placeholder="optional"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-1 block">Select client *</label>
            <select
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">Choose a client...</option>
              {existingClients.map(c => (
                <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
              ))}
            </select>
          </div>
        )}

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 mt-2">Order details</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Garment type *</label>
            <select
              name="garmentType"
              value={form.garmentType}
              onChange={handleFormChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">Select type...</option>
              {GARMENT_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Deadline *</label>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleFormChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Quoted price (R)</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleFormChange}
              placeholder="e.g. 2500"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Deposit paid (R)</label>
            <input
              type="number"
              name="deposit"
              value={form.deposit}
              onChange={handleFormChange}
              placeholder="e.g. 1000"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Fabric / colour notes</label>
            <textarea
              name="fabricNotes"
              value={form.fabricNotes}
              onChange={handleFormChange}
              placeholder="e.g. Red chiffon, client bringing own lace..."
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
        </div>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Measurements (cm)</p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { name: 'bust', label: 'Bust' },
            { name: 'waist', label: 'Waist' },
            { name: 'hips', label: 'Hips' },
            { name: 'shoulder_width', label: 'Shoulder' },
            { name: 'length', label: 'Length' },
            { name: 'sleeve_length', label: 'Sleeve' },
          ].map(m => (
            <div key={m.name}>
                <label className="text-xs text-gray-500 mb-1 block">{m.label}</label>
              <input
                type="number"
                name={m.name}
                value={measurements[m.name]}
                onChange={handleMeasurementChange}
                placeholder="cm"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          ))}
        </div>

        <div className="mb-6">
          <label className="text-xs text-gray-500 mb-1 block">Additional notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleFormChange}
            placeholder="e.g. Fitting booked 5 June, client wants pockets..."
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save order'}
          </button>
        </div>

      </div>
    </div>
  );
}