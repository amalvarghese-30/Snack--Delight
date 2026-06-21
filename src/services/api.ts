const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    createdAt?: string;
    token?: string;
}

export interface Order {
    _id: string;
    items: any[];
    totalAmount: number;
    orderStatus: string;
    createdAt: string;
}

export interface Product {
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
    reviews: any[];
    benefits: string[];
    isActive: boolean;
    createdAt: string;
}

export interface PaginatedResponse<T> {
    products: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

class ApiService {
    private token: string | null = null;

    setToken(token: string) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    getToken(): string | null {
        if (!this.token) {
            this.token = localStorage.getItem('token');
        }
        return this.token;
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    async request(endpoint: string, options: RequestInit = {}) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            this.clearToken();
            if (typeof window !== 'undefined') {
                window.location.href = '/admin/login';
            }
        }

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        return data;
    }

    // Auth
    async register(name: string, email: string, password: string): Promise<User> {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
        this.setToken(data.token);
        return data;
    }

    async login(email: string, password: string): Promise<User> {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        this.setToken(data.token);
        return data;
    }

    async getMe(): Promise<User> {
        return this.request('/auth/me');
    }

    // Products
    async getAllProducts(params?: {
        category?: string;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
        page?: number;
        limit?: number;
        sort?: string;
    }): Promise<Product[]> {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.append('category', params.category);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
        if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.sort) queryParams.append('sort', params.sort);

        const queryString = queryParams.toString();
        const response = await this.request(`/products${queryString ? `?${queryString}` : ''}`);

        // Handle both paginated response and direct array
        if (response.products && Array.isArray(response.products)) {
            return response.products;
        }
        return response;
    }

    // Get products with pagination metadata
    async getProductsWithPagination(params?: {
        category?: string;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
        page?: number;
        limit?: number;
        sort?: string;
    }): Promise<PaginatedResponse<Product>> {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.append('category', params.category);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
        if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.sort) queryParams.append('sort', params.sort);

        const queryString = queryParams.toString();
        return this.request(`/products${queryString ? `?${queryString}` : ''}`);
    }

    async getProductBySlug(slug: string): Promise<Product> {
        return this.request(`/products/${slug}`);
    }

    async createProduct(productData: Partial<Product>): Promise<Product> {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData),
        });
    }

    async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
        return this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData),
        });
    }

    async deleteProduct(id: string): Promise<void> {
        return this.request(`/products/${id}`, { method: 'DELETE' });
    }

    // Image Upload
    async uploadImage(file: File): Promise<{ imageUrl: string }> {
        const token = this.getToken();
        const formData = new FormData();
        formData.append('image', file);

        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/products/upload-image`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Upload failed');
        }

        return response.json();
    }

    // Orders
    async createOrder(orderData: any): Promise<Order> {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    }

    async getMyOrders(): Promise<Order[]> {
        return this.request('/orders/my-orders');
    }

    async getOrder(id: string): Promise<Order> {
        return this.request(`/orders/${id}`);
    }

    // Newsletter
    async subscribeToNewsletter(email: string): Promise<{ message: string }> {
        return this.request('/newsletter/subscribe', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    // Contact
    async submitContact(data: { name: string; email: string; subject: string; message: string }): Promise<{ message: string }> {
        return this.request('/contact/submit', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Admin endpoints
    async getAllOrders(): Promise<Order[]> {
        return this.request('/orders');
    }

    async updateOrderStatus(orderId: string, status: string): Promise<Order> {
        return this.request(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }

    async getAllUsers(): Promise<User[]> {
        return this.request('/auth/users');
    }

    async getNewsletterSubscribers(): Promise<any[]> {
        return this.request('/newsletter');
    }
}

export const api = new ApiService();