// src/components/admin/TestimonialManager.tsx - FIXED VERSION
import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Star, X, CheckCircle, AlertCircle } from 'lucide-react';

interface Testimonial {
    _id: string;
    name: string;
    location: string;
    content: string;
    rating: number;
    image: string;
    order: number;
    isActive: boolean;
    createdAt: string;
}

export function TestimonialManager() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Testimonial | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        content: '',
        rating: 5,
        image: '',
        order: 0,
        isActive: true,
    });

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/testimonials/all', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            if (data.success) {
                setTestimonials(data.testimonials);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to load' });
            }
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            setMessage({ type: 'error', text: 'Failed to load testimonials' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('token');
            const url = editing
                ? `http://localhost:5000/api/testimonials/${editing._id}`
                : 'http://localhost:5000/api/testimonials';

            const response = await fetch(url, {
                method: editing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: editing ? 'Testimonial updated!' : 'Testimonial created!' });
                await fetchTestimonials();
                handleCloseForm();
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to save' });
            }
        } catch (error) {
            console.error('Submit error:', error);
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete testimonial from ${name}?`)) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/testimonials/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Testimonial deleted!' });
                await fetchTestimonials();
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to delete' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete' });
        }
    };

    const handleEdit = (testimonial: Testimonial) => {
        setEditing(testimonial);
        setFormData({
            name: testimonial.name,
            location: testimonial.location,
            content: testimonial.content,
            rating: testimonial.rating,
            image: testimonial.image || '',
            order: testimonial.order,
            isActive: testimonial.isActive,
        });
        setShowForm(true);
    };

    const handleAdd = () => {
        setEditing(null);
        setFormData({
            name: '',
            location: '',
            content: '',
            rating: 5,
            image: '',
            order: testimonials.length,
            isActive: true,
        });
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditing(null);
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/testimonials/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ isActive: !currentStatus }),
            });
            await fetchTestimonials();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="font-display text-3xl text-gradient-gold">Testimonials</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage customer reviews ({testimonials.filter(t => t.isActive).length} active / {testimonials.length} total)
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-gold text-primary-foreground px-4 py-2 rounded-full hover:scale-[1.02] transition"
                >
                    <Plus className="h-4 w-4" />
                    Add Testimonial
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className={`mb-4 rounded-lg p-3 flex items-center gap-2 ${message.type === 'success'
                    ? 'bg-green-500/10 border border-green-500 text-green-500'
                    : 'bg-red-500/10 border border-red-500 text-red-500'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {message.text}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="glass-card rounded-xl p-4">
                    <div className="text-2xl font-display text-gold">{testimonials.length}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                    <div className="text-2xl font-display text-green-500">
                        {testimonials.filter(t => t.isActive).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                    <div className="text-2xl font-display text-yellow-500">
                        {(testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length || 0).toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Rating</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                    <div className="text-2xl font-display text-blue-500">
                        {testimonials.filter(t => t.image).length}
                    </div>
                    <div className="text-sm text-muted-foreground">With Photos</div>
                </div>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((testimonial) => (
                    <div key={testimonial._id} className="glass-card rounded-xl p-6 hover:scale-[1.02] transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex gap-3">
                                {testimonial.image ? (
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                                        <span className="text-xl font-display text-gold">
                                            {testimonial.name.charAt(0)}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-display text-lg">{testimonial.name}</h3>
                                    <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleEdit(testimonial)}
                                    className="p-2 hover:text-gold transition"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(testimonial._id, testimonial.name)}
                                    className="p-2 hover:text-red-500 transition"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-0.5 text-gold mb-3">
                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-current" />
                            ))}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                            "{testimonial.content}"
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-border">
                            <span className={`text-xs px-2 py-1 rounded-full ${testimonial.isActive
                                ? 'bg-green-500/20 text-green-500'
                                : 'bg-red-500/20 text-red-500'
                                }`}>
                                {testimonial.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <button
                                onClick={() => toggleStatus(testimonial._id, testimonial.isActive)}
                                className="text-xs text-gold hover:underline"
                            >
                                {testimonial.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {testimonials.length === 0 && (
                <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">
                    <p className="text-lg mb-2">No testimonials yet</p>
                    <p className="text-sm">Click "Add Testimonial" to create your first customer review</p>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl glass-card p-6">
                        <button
                            onClick={handleCloseForm}
                            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h2 className="font-display text-2xl mb-6">
                            {editing ? 'Edit Testimonial' : 'Add New Testimonial'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-lg border border-border bg-transparent px-4 py-2"
                                    placeholder="Customer name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Location *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full rounded-lg border border-border bg-transparent px-4 py-2"
                                    placeholder="City, Country"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Review *</label>
                                <textarea
                                    rows={4}
                                    required
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full rounded-lg border border-border bg-transparent px-4 py-2"
                                    placeholder="What did they say?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating: star })}
                                            className="focus:outline-none"
                                        >
                                            <Star
                                                className={`h-8 w-8 ${star <= formData.rating ? 'fill-gold text-gold' : 'text-muted-foreground'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                                <input
                                    type="url"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    className="w-full rounded-lg border border-border bg-transparent px-4 py-2"
                                    placeholder="https://example.com/photo.jpg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Display Order</label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    className="w-full rounded-lg border border-border bg-transparent px-4 py-2"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="h-4 w-4"
                                />
                                <label className="text-sm">Active (show on website)</label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseForm}
                                    className="flex-1 rounded-full border border-border py-2 hover:bg-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 rounded-full bg-gold text-primary-foreground py-2 hover:scale-[1.02] transition disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}