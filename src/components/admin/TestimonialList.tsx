// src/components/admin/TestimonialList.tsx
import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Star, X } from 'lucide-react';
import { api } from '@/services/api';

interface Testimonial {
    _id: string;
    name: string;
    location: string;
    content: string;
    rating: number;
    isActive: boolean;
    order: number;
}

export function TestimonialList() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Testimonial | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        content: '',
        rating: 5,
        order: 0,
        isActive: true,
    });

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const data = await api.getTestimonials();
            setTestimonials(data.testimonials || data);
        } catch (error) {
            console.error('Failed to fetch testimonials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.updateTestimonial(editing._id, formData);
            } else {
                await api.createTestimonial(formData);
            }
            await fetchTestimonials();
            setShowForm(false);
            setEditing(null);
            setFormData({ name: '', location: '', content: '', rating: 5, order: 0, isActive: true });
        } catch (error) {
            console.error('Failed to save testimonial:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this testimonial?')) {
            try {
                await api.deleteTestimonial(id);
                await fetchTestimonials();
            } catch (error) {
                console.error('Failed to delete:', error);
            }
        }
    };

    const handleEdit = (t: Testimonial) => {
        setEditing(t);
        setFormData({
            name: t.name,
            location: t.location,
            content: t.content,
            rating: t.rating,
            order: t.order,
            isActive: t.isActive,
        });
        setShowForm(true);
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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="font-display text-3xl text-gradient-gold">Testimonials</h1>
                    <p className="text-muted-foreground mt-1">Manage customer reviews</p>
                </div>
                <button
                    onClick={() => {
                        setEditing(null);
                        setFormData({ name: '', location: '', content: '', rating: 5, order: 0, isActive: true });
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 bg-gold text-primary-foreground px-4 py-2 rounded-full hover:scale-[1.02] transition"
                >
                    <Plus className="h-4 w-4" />
                    Add Testimonial
                </button>
            </div>

            <div className="glass-card rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-3 px-4">Customer</th>
                                <th className="text-left py-3 px-4">Review</th>
                                <th className="text-left py-3 px-4">Rating</th>
                                <th className="text-left py-3 px-4">Status</th>
                                <th className="text-left py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testimonials.map((t) => (
                                <tr key={t._id} className="border-b border-border/50 hover:bg-secondary/20">
                                    <td className="py-3 px-4">
                                        <div>
                                            <div className="font-medium">{t.name}</div>
                                            <div className="text-xs text-muted-foreground">{t.location}</div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 max-w-xs">
                                        <p className="text-sm line-clamp-2">{t.content}</p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-0.5 text-gold">
                                            {Array.from({ length: t.rating }).map((_, i) => (
                                                <Star key={i} className="h-4 w-4 fill-current" />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${t.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                            {t.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(t)} className="p-2 hover:text-gold transition">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(t._id)} className="p-2 hover:text-red-500 transition">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl glass-card p-6">
                        <button onClick={() => setShowForm(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
                            <X className="h-5 w-5" />
                        </button>
                        <h2 className="font-display text-2xl mb-6">{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-lg border border-border bg-transparent px-4 py-2"
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
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                                    className="w-full rounded-lg border border-border bg-transparent px-4 py-2"
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
                                <label className="text-sm">Active</label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-full border border-border py-2 hover:bg-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 rounded-full bg-gold text-primary-foreground py-2 hover:scale-[1.02] transition">
                                    {editing ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}