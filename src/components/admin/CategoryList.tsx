// src/components/admin/CategoryList.tsx
import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, X, Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { api } from '@/services/api';

interface Category {
    _id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    order: number;
    isActive: boolean;
}

export function CategoryList() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [imageInputMode, setImageInputMode] = useState<'url' | 'file'>('url');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        image: '',
        order: 0,
        isActive: true,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await api.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a valid image file (JPEG, PNG, WEBP)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }

        setUploadingImage(true);
        setError('');

        try {
            const result = await api.uploadCategoryImage(file);
            setFormData(prev => ({ ...prev, image: result.imageUrl }));
        } catch (err: any) {
            setError(err.message || 'Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            if (editingCategory) {
                await api.updateCategory(editingCategory._id, formData);
            } else {
                await api.createCategory(formData);
            }
            await fetchCategories();
            handleCloseForm();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete category "${name}"?`)) {
            try {
                await api.deleteCategory(id);
                await fetchCategories();
            } catch (error) {
                console.error('Failed to delete category:', error);
                alert('Failed to delete category');
            }
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            image: category.image || '',
            order: category.order || 0,
            isActive: category.isActive,
        });
        setImageInputMode('url');
        setShowForm(true);
    };

    const handleAdd = () => {
        setEditingCategory(null);
        setFormData({
            name: '',
            slug: '',
            description: '',
            image: '',
            order: categories.length,
            isActive: true,
        });
        setImageInputMode('url');
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingCategory(null);
        setError('');
    };

    const handleNameChange = (name: string) => {
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        setFormData({ ...formData, name, slug });
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
                    <h1 className="font-display text-3xl text-gradient-gold">Categories</h1>
                    <p className="text-muted-foreground mt-1">Manage your product categories</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-gold text-primary-foreground px-4 py-2 rounded-full hover:scale-[1.02] transition"
                >
                    <Plus className="h-4 w-4" />
                    Add Category
                </button>
            </div>

            <div className="glass-card rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-3 px-4">Order</th>
                                <th className="text-left py-3 px-4">Image</th>
                                <th className="text-left py-3 px-4">Name</th>
                                <th className="text-left py-3 px-4">Slug</th>
                                <th className="text-left py-3 px-4">Status</th>
                                <th className="text-left py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category._id} className="border-b border-border/50 hover:bg-secondary/20">
                                    <td className="py-3 px-4">{category.order}</td>
                                    <td className="py-3 px-4">
                                        {category.image ? (
                                            <img src={category.image} alt={category.name} className="w-10 h-10 rounded object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-secondary/30 flex items-center justify-center">
                                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 font-medium">{category.name}</td>
                                    <td className="py-3 px-4 text-muted-foreground">{category.slug}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${category.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                            {category.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(category)} className="p-2 hover:text-gold transition">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(category._id, category.name)} className="p-2 hover:text-red-500 transition">
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

            {/* Category Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl glass-card p-6">
                        <button onClick={handleCloseForm} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
                            <X className="h-5 w-5" />
                        </button>

                        <h2 className="font-display text-2xl mb-6">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>

                        {error && (
                            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500 p-3 text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-transparent px-4 py-2"
                                    placeholder="e.g., Almonds"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full rounded-lg border border-border bg-transparent px-4 py-2"
                                    placeholder="auto-generated"
                                />
                                <p className="text-xs text-muted-foreground mt-1">URL-friendly name (auto-generated from name)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full rounded-lg border border-border bg-transparent px-4 py-2"
                                    placeholder="Category description"
                                />
                            </div>

                            {/* Image Input with Toggle */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Category Image</label>

                                <div className="flex gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setImageInputMode('url')}
                                        className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm transition ${imageInputMode === 'url'
                                            ? 'bg-gold text-primary-foreground'
                                            : 'border border-border hover:bg-secondary'
                                            }`}
                                    >
                                        <LinkIcon className="h-4 w-4" />
                                        URL Link
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setImageInputMode('file')}
                                        className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm transition ${imageInputMode === 'file'
                                            ? 'bg-gold text-primary-foreground'
                                            : 'border border-border hover:bg-secondary'
                                            }`}
                                    >
                                        <Upload className="h-4 w-4" />
                                        Upload File
                                    </button>
                                </div>

                                {imageInputMode === 'url' && (
                                    <input
                                        type="url"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        placeholder="https://example.com/category-image.jpg"
                                        className="w-full rounded-lg border border-border bg-transparent px-4 py-2"
                                    />
                                )}

                                {imageInputMode === 'file' && (
                                    <div className="space-y-3">
                                        <label className={`flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed transition cursor-pointer hover:border-gold ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <div className="flex flex-col items-center justify-center py-6">
                                                <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                                                <p className="text-sm text-muted-foreground">
                                                    {uploadingImage ? 'Uploading...' : 'Click to upload image'}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    JPEG, PNG, WEBP (Max 5MB)
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                                onChange={handleImageUpload}
                                                disabled={uploadingImage}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                )}

                                {formData.image && (
                                    <div className="mt-3">
                                        <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                                        <img
                                            src={formData.image}
                                            alt="Preview"
                                            className="h-20 w-20 rounded object-cover border border-border"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=No+Image';
                                            }}
                                        />
                                    </div>
                                )}
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
                                <label className="text-sm">Active (visible in shop)</label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={handleCloseForm} className="flex-1 rounded-full border border-border py-2 hover:bg-secondary">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting || uploadingImage} className="flex-1 rounded-full bg-gold text-primary-foreground py-2 hover:scale-[1.02] transition disabled:opacity-50">
                                    {submitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}