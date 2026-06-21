// src/components/admin/ProductList.tsx
import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { productService, ProductFromDB } from '@/services/productService';
import { ProductForm } from './ProductForm';
import { getImageUrl } from '@/lib/utils';

export function ProductList() {
    const [products, setProducts] = useState<ProductFromDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductFromDB | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await productService.getAllProducts();
            const productsData = (data as any).products || data;
            setProducts(productsData);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await productService.deleteProduct(id);
                fetchProducts();
            } catch (error) {
                console.error('Failed to delete product:', error);
                alert('Failed to delete product');
            }
        }
    };

    const handleEdit = (product: ProductFromDB) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingProduct(null);
    };

    const handleFormSuccess = () => {
        fetchProducts();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="font-display text-3xl text-gradient-gold">Products</h1>
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 bg-gold text-primary-foreground px-4 py-2 rounded-full hover:scale-[1.02] transition"
                    >
                        <Plus className="h-4 w-4" />
                        Add Product
                    </button>
                </div>
                <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">
                    <p className="text-lg mb-2">No products found</p>
                    <p className="text-sm">Click "Add Product" to create your first product</p>
                </div>
                {showForm && (
                    <ProductForm
                        product={editingProduct || undefined}
                        onClose={handleFormClose}
                        onSuccess={handleFormSuccess}
                    />
                )}
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-display text-3xl text-gradient-gold">Products</h1>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-gold text-primary-foreground px-4 py-2 rounded-full hover:scale-[1.02] transition"
                >
                    <Plus className="h-4 w-4" />
                    Add Product
                </button>
            </div>

            <div className="glass-card rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-3 px-4">Product</th>
                                <th className="text-left py-3 px-4">Category</th>
                                <th className="text-left py-3 px-4">Price</th>
                                <th className="text-left py-3 px-4">Stock</th>
                                <th className="text-left py-3 px-4">Status</th>
                                <th className="text-left py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id} className="border-b border-border/50 hover:bg-secondary/20">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            {product.image && (
                                                <img src={getImageUrl(product.image)} alt={product.name} className="w-10 h-10 rounded object-cover" />
                                            )}
                                            <span>{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">{product.category}</td>
                                    <td className="py-3 px-4">${product.price}</td>
                                    <td className="py-3 px-4">{product.stock}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${product.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                            {product.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(product)} className="p-2 hover:text-gold transition">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(product._id, product.name)} className="p-2 hover:text-red-500 transition">
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

            {showForm && (
                <ProductForm
                    product={editingProduct || undefined}
                    onClose={handleFormClose}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
}