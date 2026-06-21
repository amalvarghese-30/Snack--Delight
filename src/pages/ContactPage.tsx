import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useReveal } from "@/hooks/use-reveal";
import { useState } from 'react';
import { api } from '@/services/api';  // Add this import

export default function ContactPage() {
    useReveal();

    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [contactStatus, setContactStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
    const [sending, setSending] = useState(false);

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setContactStatus({ type: null, message: '' });

        try {
            // Use the API service instead of direct fetch
            const response = await api.submitContact(contactForm);
            setContactStatus({ type: 'success', message: response.message });
            setContactForm({ name: '', email: '', subject: '', message: '' });
        } catch (error: any) {
            setContactStatus({ type: 'error', message: error.message || 'Failed to send message. Please try again.' });
        } finally {
            setSending(false);
            setTimeout(() => setContactStatus({ type: null, message: '' }), 5000);
        }
    };

    return (
        <>
            <Navbar />
            <main className="px-6 pt-36 pb-24">
                <div className="mx-auto max-w-7xl">
                    <div className="reveal mx-auto max-w-3xl text-center">
                        <div className="mb-4 text-xs uppercase tracking-[0.4em] text-gold">Get in touch</div>
                        <h1 className="font-display text-6xl md:text-7xl leading-[1] text-balance">
                            We'd love to <span className="italic text-gradient-gold">hear from you.</span>
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground">
                            Questions, gifting, wholesale or press — our team replies within a day.
                        </p>
                    </div>

                    <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
                        <div className="reveal space-y-5">
                            {[
                                { Icon: Mail, t: "Email", v: "hello@snackdelight.com" },
                                { Icon: Phone, t: "Phone", v: "+1 (415) 555 0118" },
                                { Icon: MapPin, t: "Studio", v: "224 Mission St, San Francisco" },
                            ].map((c) => (
                                <div key={c.t} className="flex items-start gap-4 rounded-3xl glass-card p-6">
                                    <div className="grid h-12 w-12 place-items-center rounded-2xl border border-gold/30 text-gold">
                                        <c.Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.28em] text-gold">{c.t}</div>
                                        <div className="mt-1 text-lg">{c.v}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form
                            onSubmit={handleContactSubmit}
                            className="reveal space-y-5 rounded-[2rem] glass-card p-8 md:p-10"
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field
                                    label="Name"
                                    placeholder="Your name"
                                    value={contactForm.name}
                                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                />
                                <Field
                                    label="Email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={contactForm.email}
                                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                />
                            </div>
                            <Field
                                label="Subject"
                                placeholder="How can we help?"
                                value={contactForm.subject}
                                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                            />
                            <div>
                                <label className="mb-2 block text-[11px] uppercase tracking-[0.28em] text-gold">
                                    Message
                                </label>
                                <textarea
                                    rows={5}
                                    required
                                    value={contactForm.message}
                                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                    className="w-full resize-none rounded-2xl border border-border bg-transparent p-4 text-sm outline-none focus:border-gold"
                                    placeholder="Tell us a little more…"
                                />
                            </div>

                            {contactStatus.type && (
                                <p className={`text-center text-sm ${contactStatus.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                    {contactStatus.message}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={sending}
                                className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-medium uppercase tracking-[0.22em] text-primary-foreground transition hover:scale-[1.02] disabled:opacity-50"
                            >
                                {sending ? 'Sending...' : 'Send Message'}
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

function Field({
    label,
    type = "text",
    placeholder,
    value,
    onChange
}: {
    label: string;
    type?: string;
    placeholder: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.28em] text-gold">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required
                className="w-full rounded-full border border-border bg-transparent px-5 py-3 text-sm outline-none focus:border-gold"
            />
        </div>
    );
}