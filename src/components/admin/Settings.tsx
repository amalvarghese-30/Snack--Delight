import { useState } from 'react';
import { Save, Globe, DollarSign, Truck, Shield } from 'lucide-react';

export function Settings() {
    const [settings, setSettings] = useState({
        siteName: 'Snacks Delight',
        siteEmail: 'hello@snackdelight.com',
        currency: 'USD',
        shippingCost: 0,
        freeShippingThreshold: 50,
        taxRate: 0,
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        // Save settings to backend (you'll need to create this endpoint)
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Settings saved successfully!');
        setSaving(false);
    };

    return (
        <div>
            <h1 className="font-display text-3xl text-gradient-gold mb-6">Settings</h1>

            <div className="space-y-6">
                {/* General Settings */}
                <div className="glass-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Globe className="h-5 w-5 text-gold" />
                        <h2 className="font-display text-xl">General Settings</h2>
                    </div>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Site Name</label>
                            <input
                                type="text"
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                className="w-full max-w-md rounded-lg border border-border bg-transparent px-4 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Site Email</label>
                            <input
                                type="email"
                                value={settings.siteEmail}
                                onChange={(e) => setSettings({ ...settings, siteEmail: e.target.value })}
                                className="w-full max-w-md rounded-lg border border-border bg-transparent px-4 py-2"
                            />
                        </div>
                    </div>
                </div>

                {/* Shipping Settings */}
                <div className="glass-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Truck className="h-5 w-5 text-gold" />
                        <h2 className="font-display text-xl">Shipping Settings</h2>
                    </div>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Shipping Cost ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={settings.shippingCost}
                                onChange={(e) => setSettings({ ...settings, shippingCost: parseFloat(e.target.value) })}
                                className="w-full max-w-md rounded-lg border border-border bg-transparent px-4 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Free Shipping Threshold ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={settings.freeShippingThreshold}
                                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) })}
                                className="w-full max-w-md rounded-lg border border-border bg-transparent px-4 py-2"
                            />
                        </div>
                    </div>
                </div>

                {/* Tax Settings */}
                <div className="glass-card rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <DollarSign className="h-5 w-5 text-gold" />
                        <h2 className="font-display text-xl">Tax Settings</h2>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={settings.taxRate}
                            onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                            className="w-full max-w-md rounded-lg border border-border bg-transparent px-4 py-2"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-gold text-primary-foreground px-6 py-3 rounded-full hover:scale-[1.02] transition disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}