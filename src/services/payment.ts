declare global {
    interface Window {
        Razorpay: any;
    }
}

export interface PaymentOptions {
    amount: number;
    orderId: string;
    name: string;
    email: string;
    phone?: string;
}

export const initializeRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export const processPayment = async (options: PaymentOptions) => {
    const res = await initializeRazorpay();
    if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        return false;
    }

    return new Promise((resolve) => {
        const razorpayOptions = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: options.amount * 100,
            currency: 'INR',
            name: 'Snacks Delight',
            description: `Order #${options.orderId}`,
            image: '/logo.png',
            order_id: options.orderId,
            handler: (response: any) => {
                resolve(response);
            },
            prefill: {
                name: options.name,
                email: options.email,
                contact: options.phone || '',
            },
            theme: {
                color: '#D4AF37',
            },
        };

        const razorpay = new window.Razorpay(razorpayOptions);
        razorpay.open();
    });
};