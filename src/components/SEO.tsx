// src/components/SEO.tsx
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'product' | 'article';
}

export function SEO({
    title = 'Snacks Delight - Premium Dry Fruits & Gourmet Snacks',
    description = 'Single-origin almonds, cashews, pistachios, dates and gourmet trail mixes. Vacuum-fresh, ethically sourced, delivered with luxury.',
    image = '/og-image.jpg',
    url = 'https://snackdelight.com',
    type = 'website'
}: SEOProps) {
    const siteTitle = title.includes('Snacks Delight') ? title : `${title} | Snacks Delight`;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{siteTitle}</title>
            <meta name="title" content={siteTitle} />
            <meta name="description" content={description} />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={siteTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />

            {/* Canonical URL */}
            <link rel="canonical" href={url} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "name": "Snacks Delight",
                    "url": "https://snackdelight.com",
                    "logo": "https://snackdelight.com/logo.png",
                    "sameAs": [
                        "https://instagram.com/snackdelight",
                        "https://facebook.com/snackdelight",
                        "https://twitter.com/snackdelight"
                    ]
                })}
            </script>
        </Helmet>
    );
}