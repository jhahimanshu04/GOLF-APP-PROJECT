import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useCharityStore from '../context/charityStore';

const categories = ['health', 'education', 'environment', 'community', 'sports', 'other'];

const AdminCharitiesPage = () => {
  const { charities, isLoading, adminFetchAll, adminCreate, adminUpdate, adminDelete, adminAddEvent } = useCharityStore();
  const [showForm, setShowForm] = useState(false);
  const [editingCharity, setEditingCharity] = useState(null);
  const [showEventForm, setShowEventForm] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', shortDescription: '', website: '', category: 'other', tags: '', isFeatured: false });
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', location: '' });

  useEffect(() => { adminFetchAll(); }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', shortDescription: '', website: '', category: 'other', tags: '', isFeatured: false });
    setEditingCharity(null);
    setShowForm(false);
  };

  const handleEdit = (charity) => {
    setForm({
      name: charity.name,
      description: charity.description,
      shortDescription: charity.shortDescription || '',
      website: charity.website || '',
      category: charity.category,
      tags: charity.tags?.join(', ') || '',
      isFeatured: charity.isFeatured,
    });
    setEditingCharity(charity);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.description) {
      toast.error('Name and description are required.');
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    const result = editingCharity
      ? await adminUpdate(editingCharity._id, fd)
      : await adminCreate(fd);

    if (result.success) {
      toast.success(editingCharity ? 'Charity updated!' : 'Charity created!');
      resetForm();
    } else {
      toast.error(result.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Deactivate "${name}"? Users who selected this charity will be unassigned.`)) return;
    const result = await adminDelete(id);
    result.success ? toast.success('Charity deactivated.') : toast.error(result.message);
  };

  const handleAddEvent = async (charityId) => {
    if (!eventForm.title || !eventForm.date) {
      toast.error('Title and date are required.');
      return;
    }
    const fd = new FormData();
    Object.entries(eventForm).forEach(([k, v]) => fd.append(k, v));
    const result = await adminAddEvent(charityId, fd);
    if (result.success) {
      toast.success('Event added!');
      setShowEventForm(null);
      setEventForm({ title: '', description: '', date: '', location: '' });
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Charity Management</h1>
          <p className="text-primary-400 text-sm mt-1">{charities.filter(c => c.isActive).length} active charities</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-gold-500 text-primary-900 font-bold rounded-xl text-sm hover:bg-gold-400"
        >
          + Add Charity
        </button>
      </div>

      {/* Create / Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-primary-800 border border-primary-600 rounded-2xl p-6 mb-6"
          >
            <h3 className="text-white font-bold mb-4">{editingCharity ? 'Edit Charity' : 'Add New Charity'}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { key: 'name', label: 'Charity Name *', type: 'text' },
                { key: 'website', label: 'Website URL', type: 'text' },
                { key: 'shortDescription', label: 'Short Description (max 200 chars)', type: 'text' },
                { key: 'tags', label: 'Tags (comma-separated)', type: 'text' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="text-primary-300 text-xs font-medium block mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full bg-primary-700 border border-primary-600 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400"
                  />
                </div>
              ))}
              <div>
                <label className="text-primary-300 text-xs font-medium block mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-primary-700 border border-primary-600 text-white rounded-xl px-3 py-2 text-sm"
                >
                  {categories.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3 pt-5">
                <input
                  type="checkbox"
                  id="featured"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="accent-gold-500 w-4 h-4"
                />
                <label htmlFor="featured" className="text-primary-300 text-sm">Feature on homepage</label>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-primary-300 text-xs font-medium block mb-1">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full bg-primary-700 border border-primary-600 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400 resize-none"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSubmit} disabled={isLoading} className="flex-1 py-2.5 bg-gold-500 text-primary-900 font-bold rounded-xl text-sm">
                {isLoading ? 'Saving...' : editingCharity ? 'Update Charity' : 'Create Charity'}
              </button>
              <button onClick={resetForm} className="flex-1 py-2.5 bg-primary-700 text-white rounded-xl text-sm">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charities list */}
      <div className="space-y-4">
        {charities.map((charity, i) => (
          <motion.div
            key={charity._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`bg-primary-800/60 border rounded-2xl p-5 ${
              charity.isActive ? 'border-primary-700' : 'border-red-500/20 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {charity.logo && (
                  <img src={charity.logo} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-bold truncate">{charity.name}</h3>
                    {charity.isFeatured && <span className="text-xs bg-gold-500/20 text-gold-400 border border-gold-500/30 px-2 py-0.5 rounded-full">Featured</span>}
                    {!charity.isActive && <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">Inactive</span>}
                  </div>
                  <p className="text-primary-500 text-xs mt-0.5 capitalize">{charity.category} · {charity.subscriberCount} supporters</p>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button onClick={() => setShowEventForm(showEventForm === charity._id ? null : charity._id)} className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs rounded-lg hover:bg-blue-500/30">
                  + Event
                </button>
                <button onClick={() => handleEdit(charity)} className="px-3 py-1.5 bg-primary-700 text-primary-300 text-xs rounded-lg hover:bg-primary-600 hover:text-white">
                  Edit
                </button>
                {charity.isActive && (
                  <button onClick={() => handleDelete(charity._id, charity.name)} className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs rounded-lg hover:bg-red-500/30">
                    Deactivate
                  </button>
                )}
              </div>
            </div>

            {/* Events */}
            {charity.events?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-primary-700">
                <p className="text-primary-500 text-xs font-medium mb-2">Upcoming Events</p>
                <div className="flex flex-wrap gap-2">
                  {charity.events.slice(0, 3).map((ev) => (
                    <span key={ev._id} className="text-xs bg-primary-700/50 text-primary-300 px-2 py-1 rounded-lg">
                      {ev.title} · {new Date(ev.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add event form */}
            <AnimatePresence>
              {showEventForm === charity._id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-primary-700">
                    <p className="text-white text-sm font-medium mb-3">Add Event</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { key: 'title', label: 'Event Title *', type: 'text' },
                        { key: 'date', label: 'Date *', type: 'date' },
                        { key: 'location', label: 'Location', type: 'text' },
                        { key: 'description', label: 'Description', type: 'text' },
                      ].map(({ key, label, type }) => (
                        <div key={key}>
                          <label className="text-primary-400 text-xs mb-1 block">{label}</label>
                          <input
                            type={type}
                            value={eventForm[key]}
                            onChange={(e) => setEventForm({ ...eventForm, [key]: e.target.value })}
                            className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleAddEvent(charity._id)} className="flex-1 py-2 bg-gold-500 text-primary-900 font-bold rounded-lg text-sm">Add Event</button>
                      <button onClick={() => setShowEventForm(null)} className="flex-1 py-2 bg-primary-700 text-white rounded-lg text-sm">Cancel</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminCharitiesPage;
