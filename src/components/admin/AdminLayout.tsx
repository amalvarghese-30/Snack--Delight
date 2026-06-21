import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, LogOut, Tag, Users, Mail, Settings, BarChart3, Star } from 'lucide-react';
import { useEffect } from 'react';

export function AdminLayout() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/admin/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/admin/login');
    };

    const navItems = [
        { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/admin/products', label: 'Products', icon: Package },
        { to: '/admin/categories', label: 'Categories', icon: Tag },
        { to: '/admin/testimonials', label: 'Testimonials', icon: Star },
        { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
        { to: '/admin/users', label: 'Users', icon: Users },
        { to: '/admin/newsletter', label: 'Newsletter', icon: Mail },
        { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        { to: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen">
            <aside className="w-64 glass-card m-4 rounded-2xl fixed h-[calc(100vh-2rem)] overflow-y-auto">
                <div className="p-6">
                    <h2 className="font-display text-xl text-gradient-gold">Admin Panel</h2>
                    <p className="text-xs text-muted-foreground mt-1">Manage your store</p>
                </div>
                <nav className="mt-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="flex items-center gap-3 px-6 py-3 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition"
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-6 py-3 text-muted-foreground hover:text-red-500 w-full transition mt-4"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </nav>
            </aside>

            <main className="flex-1 ml-72 p-8">
                <Outlet />
            </main>
        </div>
    );
}