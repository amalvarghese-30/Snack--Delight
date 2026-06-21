// src/components/admin/ProductForm.tsx
import { useState, useEffect } from 'react';
import { X, Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { productService } from '@/services/productService';
import { api } from '@/services/api';
import { getImageUrl } from '@/lib/utils';

interface ProductFormProps {
    product?: any;
    onClose: () => void;
    onSuccess: () => void;
}

export function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState('');
    const [imageInputMode, setImageInputMode] = useState<'url' | 'file'>('url');
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        tagline: '',
        description: '',
        price: '',
        category: '',
        image: '',
        stock: '',
        benefits: [] as string[],
        isActive: true,
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                slug: product.slug || '',
                tagline: product.tagline || '',
                description: product.description || '',
                price: product.price?.toString() || '',
                category: product.category || '',
                image: product.image || '',
                stock: product.stock?.toString() || '',
                benefits: product.benefits || [],
                isActive: product.isActive !== false,
            });
        }
    }, [product]);

    // Auto-generate slug when name changes
    const handleNameChange = (name: string) => {
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        setFormData(prev => ({ ...prev, name, slug }));
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
            const result = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, image: result.imageUrl }));
        } catch (err: any) {
            setError(err.message || 'Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate required fields
            if (!formData.name.trim()) {
                throw new Error('Product name is required');
            }
            if (!formData.price || parseFloat(formData.price) <= 0) {
                throw new Error('Valid price is required');
            }
            if (!formData.category) {
                throw new Error('Category is required');
            }
            if (!formData.description || formData.description.length < 20) {
                throw new Error('Description must be at least 20 characters');
            }

            // Prepare data matching server validation
            const submitData = {
                name: formData.name.trim(),
                slug: formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                tagline: formData.tagline.trim() || '',
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                category: formData.category,
                image: formData.image.trim() || 'https://images.pexels.com/photos/57042/almonds-nuts-almond-close-up-57042.jpeg?w=400',
                stock: parseInt(formData.stock) || 100,
                benefits: formData.benefits.filter(b => b.trim() !== ''),
                isActive: formData.isActive,
            };

            console.log('Submitting product:', submitData);

            if (product) {
                await productService.updateProduct(product._id, submitData);
            } else {
                await productService.createProduct(submitData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Submission error:', err);
            setError(err.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    const addBenefit = () => {
        setFormData(prev => ({ ...prev, benefits: [...prev.benefits, ''] }));
    };

    const updateBenefit = (index: number, value: string) => {
        const newBenefits = [...formData.benefits];
        newBenefits[index] = value;
        setFormData(prev => ({ ...prev, benefits: newBenefits }));
    };

    const removeBenefit = (index: number) => {
        setFormData(prev => ({ ...prev, benefits: prev.benefits.filter((_, i) => i !== index) }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl glass-card p-6">
                <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
                    <X className="h-5 w-5" />
                </button>

                <h2 className="font-display text-2xl mb-6">{product ? 'Edit Product' : 'Add Product'}</h2>

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
                            placeholder="e.g., Premium California Almonds"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Slug (URL)</label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                            className="w-full rounded-lg border border-border bg-transparent px-4 py-2"
                            placeholder="auto-generated-from-name"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            URL-friendly name. Leave empty to auto-generate from product name.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Tagline</label>
                        <input
                            type="text"
                            value={formData.tagline}
                            onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                            className="w-full rounded-lg border border-border bg-transparent px-4 py-2"
                            placeholder="e.g., Buttery, slow-roasted, single-origin"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description * (min 20 characters)</label>
                        <textarea
                            rows={4}
                            required
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full rounded-lg border border-border bg-transparent px-4 py-2"
                            placeholder="Detailed description of the product..."
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {formData.description.length}/20+ characters
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Price * (USD)</label>
                            <input
                                type="number"
                                required
                                min="0.01"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                className="w-full rounded-lg border border-border bg-transparent px-4 py-2"
                                placeholder="24.99"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Stock *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="1"
                                value={formData.stock}
                                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                                className="w-full rounded-lg border border-border bg-transparent px-4 py-2"
                                placeholder="100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Category *</label>
                        <select
                            required
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full rounded-lg border border-border bg-transparent px-4 py-2"
                        >
                            <option value="">Select category</option>
                            <option value="Almonds">Almonds</option>
                            <option value="Cashews">Cashews</option>
                            <option value="Pistachios">Pistachios</option>
                            <option value="Dates">Dates</option>
                            <option value="Trail Mixes">Trail Mixes</option>
                            <option value="Healthy Snacks">Healthy Snacks</option>
                        </select>
                    </div>

                    {/* Image Input */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Product Image</label>

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
                                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                                placeholder="https://example.com/image.jpg"
                                className="w-full rounded-lg border border-border bg-transparent px-4 py-2"
                            />
                        )}

                        {imageInputMode === 'file' && (
                            <div className="space-y-3">
                                <label className={`flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed transition cursor-pointer hover:border-gold ${uploadingImage ? 'opacity-50 pointer-events-none' : ''
                                    }`}>
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
                                    src={getImageUrl(formData.image)}
                                    alt="Preview"
                                    className="h-24 w-24 rounded object-cover border border-border"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Invalid+URL';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Benefits */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Benefits</label>
                        {formData.benefits.map((benefit, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={benefit}
                                    onChange={(e) => updateBenefit(index, e.target.value)}
                                    className="flex-1 rounded-lg border border-border bg-transparent px-4 py-2"
                                    placeholder="e.g., Rich in Vitamin E"
                                />
                                <button type="button" onClick={() => removeBenefit(index)} className="text-red-500 hover:text-red-400">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addBenefit} className="text-sm text-gold hover:text-gold/80">
                            + Add Benefit
                        </button>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="h-4 w-4"
                        />
                        <label className="text-sm">Active (visible in shop)</label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 rounded-full border border-border py-2 hover:bg-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading || uploadingImage} className="flex-1 rounded-full bg-gold text-primary-foreground py-2 hover:scale-[1.02] transition disabled:opacity-50">
                            {loading ? 'Saving...' : product ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}