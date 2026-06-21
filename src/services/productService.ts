// src/services/productService.ts
import { api } from './api';

export interface ProductFromDB {
    _id: string;
    name: string;
    slug: string;
    tagline: string;
    description: string;
    price: number;
    category: string;
    image: string;
    stock: number;
    rating: number;
    benefits: string[];
    isActive: boolean;
    createdAt: string;
}

class ProductService {
    private static instance: ProductService;
    private cache: Map<string, ProductFromDB[]> = new Map();

    static getInstance(): ProductService {
        if (!ProductService.instance) {
            ProductService.instance = new ProductService();
        }
        return ProductService.instance;
    }

    async getAllProducts(params?: {
        category?: string;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
    }): Promise<ProductFromDB[]> {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.append('category', params.category);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
        if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());

        const cacheKey = queryParams.toString() || 'all';

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        const products = await api.request(`/products?${queryParams.toString()}`);
        this.cache.set(cacheKey, products);
        return products;
    }

    async getProductBySlug(slug: string): Promise<ProductFromDB | null> {
        try {
            const product = await api.request(`/products/${slug}`);
            return product;
        } catch (error) {
            console.error('Product not found:', error);
            return null;
        }
    }

    async createProduct(productData: Partial<ProductFromDB>): Promise<ProductFromDB> {
        return api.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData),
        });
    }

    async updateProduct(id: string, productData: Partial<ProductFromDB>): Promise<ProductFromDB> {
        return api.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData),
        });
    }

    async deleteProduct(id: string): Promise<void> {
        await api.request(`/products/${id}`, { method: 'DELETE' });
        this.cache.clear(); // Clear cache after mutation
    }

    clearCache(): void {
        this.cache.clear();
    }
}

export const productService = ProductService.getInstance();