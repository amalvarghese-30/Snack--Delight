import { useState, useEffect } from 'react';
import { Mail, Trash2 } from 'lucide-react';

interface Subscriber {
    _id: string;
    email: string;
    subscribedAt: string;
    isActive: boolean;
}

export function NewsletterList() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, active: 0 });

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/newsletter', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            setSubscribers(data);
            setStats({
                total: data.length,
                active: data.filter((s: Subscriber) => s.isActive).length,
            });
        } catch (error) {
            console.error('Failed to fetch subscribers:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportEmails = () => {
        const emails = subscribers.map(s => s.email).join('\n');
        const blob = new Blob([emails], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'newsletter-subscribers.csv';
        a.click();
        URL.revokeObjectURL(url);
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
                    <h1 className="font-display text-3xl text-gradient-gold">Newsletter</h1>
                    <p className="text-muted-foreground mt-1">
                        {stats.active} active subscribers · {stats.total} total
                    </p>
                </div>
                <button
                    onClick={exportEmails}
                    className="flex items-center gap-2 bg-gold text-primary-foreground px-4 py-2 rounded-full hover:scale-[1.02] transition"
                >
                    <Mail className="h-4 w-4" />
                    Export Emails
                </button>
            </div>

            <div className="glass-card rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-3 px-4">Email</th>
                                <th className="text-left py-3 px-4">Subscribed Date</th>
                                <th className="text-left py-3 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map((sub) => (
                                <tr key={sub._id} className="border-b border-border/50 hover:bg-secondary/20">
                                    <td className="py-3 px-4">{sub.email}</td>
                                    <td className="py-3 px-4 text-muted-foreground">
                                        {new Date(sub.subscribedAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${sub.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                            {sub.isActive ? 'Subscribed' : 'Unsubscribed'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}