import React, { useEffect } from 'react';
import { Product, FabricMaterial, CustomizationState } from '../../types/clothing';

interface SEOHeadProps {
  product: Product;
  fabric?: FabricMaterial;
  customization?: CustomizationState;
}

/**
 * Injects dynamic document title, meta descriptions, OpenGraph tags,
 * Twitter cards, canonical link, and Schema.org JSON-LD structured data
 * into the document head based on the currently selected product.
 * Fully compliant with applet-seo guidelines.
 */
export const SEOHead: React.FC<SEOHeadProps> = ({
  product,
  fabric,
  customization,
}) => {
  useEffect(() => {
    // 1. Dynamic Branded Page Title (30-60 chars)
    const pageTitle = `${product.name} – 3D Pritaikymas ir Pirkti | Flipukas`;
    document.title = pageTitle;

    // 2. Compelling Meta Description (120-160 chars)
    const fabricName = fabric?.nameLt || 'aukščiausios kokybės';
    const colorNote = customization?.primaryColor ? ` (${customization.primaryColor})` : '';
    const metaDesc = `Personalizuok ${product.name}${colorNote} 3D laboratorijoje. Pasirink ${fabricName} audinį, spalvas ir užsisakyk su nemokamu pristatymu.`;

    const updateOrCreateMeta = (attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta Description
    updateOrCreateMeta('name', 'description', metaDesc);

    // OpenGraph Tags
    const canonicalUrl = window.location.origin + window.location.pathname;
    updateOrCreateMeta('property', 'og:title', pageTitle);
    updateOrCreateMeta('property', 'og:description', metaDesc);
    updateOrCreateMeta('property', 'og:type', 'product');
    updateOrCreateMeta('property', 'og:url', canonicalUrl);
    updateOrCreateMeta('property', 'og:site_name', 'Flipukas');
    if (product.image) {
      updateOrCreateMeta('property', 'og:image', product.image);
    }

    // Twitter Card Tags
    updateOrCreateMeta('name', 'twitter:card', 'summary_large_image');
    updateOrCreateMeta('name', 'twitter:title', pageTitle);
    updateOrCreateMeta('name', 'twitter:description', metaDesc);
    if (product.image) {
      updateOrCreateMeta('name', 'twitter:image', product.image);
    }

    // Canonical Link Tag
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 3. Schema.org Product Structured Data (JSON-LD)
    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description || metaDesc,
      image: product.image ? [product.image] : [],
      sku: product.slug || product.id,
      brand: {
        '@type': 'Brand',
        name: 'Flipukas',
      },
      category: product.categoryLt || 'Streetwear Drabužiai',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EUR',
        price: product.basePrice,
        priceValidUntil: '2028-12-31',
        itemCondition: 'https://schema.org/NewCondition',
        availability: 'https://schema.org/InStock',
        url: canonicalUrl,
        seller: {
          '@type': 'Organization',
          name: 'Flipukas',
        },
      },
    };

    const schemaId = 'schema-product-jsonld';
    let scriptEl = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = schemaId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(schemaData, null, 2);

    return () => {
      // Cleanup schema script on unmount if needed
    };
  }, [product, fabric, customization]);

  return null;
};
