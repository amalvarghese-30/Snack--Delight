// server/config/email.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async (to, subject, html, text) => {
    try {
        const info = await transporter.sendMail({
            from: `"Snacks Delight" <${process.env.SMTP_FROM || 'noreply@snackdelight.com'}>`,
            to,
            subject,
            html,
            text,
        });
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Email error:', error);
        throw error;
    }
};

// Order confirmation email
export const sendOrderConfirmation = async (order, user) => {
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 8px;">${item.name}</td>
            <td style="padding: 8px;">x${item.quantity}</td>
            <td style="padding: 8px;">$${item.price}</td>
        </tr>
    `).join('');

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #D4AF37;">Order Confirmed! 🎉</h1>
            <p>Thank you for your order, ${user.name}!</p>
            
            <h2>Order #${order._id.toString().slice(-8)}</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="text-align: left; padding: 8px;">Product</th>
                        <th style="text-align: left; padding: 8px;">Quantity</th>
                        <th style="text-align: left; padding: 8px;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="padding: 8px;"><strong>Total</strong></td>
                        <td style="padding: 8px;"><strong>$${order.totalAmount}</strong></td>
                    </tr>
                </tfoot>
            </table>
            
            <h3>Shipping Address:</h3>
            <p>
                ${order.shippingAddress.street}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                ${order.shippingAddress.country}
            </p>
            
            <p>We'll notify you when your order ships!</p>
            
            <a href="${process.env.FRONTEND_URL}/orders/${order._id}" 
               style="background: #D4AF37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 30px; display: inline-block; margin-top: 20px;">
                View Order
            </a>
        </div>
    `;

    return sendEmail(user.email, `Order Confirmed #${order._id.toString().slice(-8)}`, html);
};

// Contact form email
export const sendContactNotification = async (contact) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${contact.name}</p>
            <p><strong>Email:</strong> ${contact.email}</p>
            <p><strong>Subject:</strong> ${contact.subject}</p>
            <p><strong>Message:</strong></p>
            <p>${contact.message}</p>
        </div>
    `;

    return sendEmail(process.env.ADMIN_EMAIL, `Contact: ${contact.subject}`, html);
};