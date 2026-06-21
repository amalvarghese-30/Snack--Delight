import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';

export function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const user = await api.login(email, password);
            console.log('Login response:', user); // Debug log

            if (user.role === 'admin') {
                // Make sure token is saved
                if (user.token) {
                    localStorage.setItem('token', user.token);
                }
                // Navigate to dashboard
                navigate('/admin/dashboard', { replace: true });
            } else {
                setError('You do not have admin access');
                api.clearToken();
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-luxe px-6">
            <div className="max-w-md w-full glass-card rounded-2xl p-8">
                <div className="text-center mb-8">
                    <h1 className="font-display text-3xl text-gradient-gold">Admin Login</h1>
                    <p className="text-muted-foreground mt-2">Sign in to manage your store</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-border bg-transparent px-4 py-3 focus:outline-none focus:border-gold"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-border bg-transparent px-4 py-3 focus:outline-none focus:border-gold"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">{error}</div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gold text-primary-foreground py-3 rounded-full font-medium hover:scale-[1.02] transition disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}