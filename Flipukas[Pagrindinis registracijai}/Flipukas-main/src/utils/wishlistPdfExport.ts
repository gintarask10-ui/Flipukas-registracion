import { jsPDF } from 'jspdf';
import { WishlistItem } from '../types/clothing';

/**
 * Exports the curated 3D wishlist collection into a downloadable PDF style summary document
 */
export async function exportWishlistToPdf(
  items: WishlistItem[],
  userName: string = 'Flipukas Kūrėjas'
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  // Header Background bar
  doc.setFillColor(18, 18, 20); // Dark luxury background
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Brand Accent Line
  doc.setFillColor(245, 158, 11); // Amber accent
  doc.rect(0, 41, pageWidth, 1.5, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('FLIPUKAS 3D ATELIER', margin, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(245, 158, 11);
  doc.text('INDIVIDUALIOS MADOS IR 3D SIUVINĖJIMO LABORATORIJA', margin, 22);

  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  const dateStr = new Date().toLocaleDateString('lt-LT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Kūrėjas: ${userName}  •  Data: ${dateStr}`, margin, 30);
  doc.text('Vilniaus Atelier  •  3D Modeliavimas & Lazerinis Kirpimas  •  flipukas.lt', margin, 35);

  y = 52;

  // Collection Overview Summary Box
  const totalValue = items.reduce((sum, it) => sum + (it.price || 0), 0);
  doc.setFillColor(248, 248, 250);
  doc.setDrawColor(220, 220, 225);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

  doc.setTextColor(30, 30, 35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('KURUOTOS 3D KOLEKCIJOS SUVESTINĖ', margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 100);
  doc.text(
    `Išsaugota modelių: ${items.length} vnt.   |   Bendra kolekcijos vertė: ${totalValue.toFixed(2)} €   |   Statusas: Paruošta gamybai`,
    margin + 6,
    y + 15
  );

  y += 30;

  if (items.length === 0) {
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(11);
    doc.text('Galerijoje nėra išsaugotų modelių.', margin, y);
    doc.save(`Flipukas-Wishlist-${new Date().toISOString().slice(0, 10)}.pdf`);
    return;
  }

  // Iterate over each Wishlist item
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const cardHeight = 44;

    // Check if we need a new page
    if (y + cardHeight > pageHeight - 22) {
      doc.addPage();
      // Draw top bar on continuation page
      doc.setFillColor(18, 18, 20);
      doc.rect(0, 0, pageWidth, 16, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('FLIPUKAS 3D ATELIER — KURUOTA WISHLIST KOLEKCIJA (TĘSINYS)', margin, 11);
      y = 26;
    }

    // Item Card Container
    doc.setFillColor(252, 252, 253);
    doc.setDrawColor(230, 230, 235);
    doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, 'FD');

    // Left Accent Strip with item color
    const primaryHex = item.customization?.primaryColor || '#18181b';
    const rgb = hexToRgb(primaryHex);
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.rect(margin, y, 4, cardHeight, 'F');

    // Optional snapshot image or color swatch
    const imgX = margin + 8;
    const imgY = y + 5;
    const imgSize = 34;

    let hasImage = false;
    if (item.snapshotUrl && item.snapshotUrl.startsWith('data:image/')) {
      try {
        doc.addImage(item.snapshotUrl, 'PNG', imgX, imgY, imgSize, imgSize);
        hasImage = true;
      } catch {
        hasImage = false;
      }
    }

    if (!hasImage) {
      // Draw custom stylish swatch box
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      doc.roundedRect(imgX, imgY, imgSize, imgSize, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('3D MODELIS', imgX + 5, imgY + 18);
    }

    // Item Details column
    const textX = imgX + imgSize + 6;
    doc.setTextColor(20, 20, 25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const itemTitle = `${index + 1}. ${item.title || item.product.name}`;
    doc.text(truncateText(itemTitle, 45), textX, y + 9);

    // Product & Size
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 90);
    doc.text(
      `Gaminys: ${item.product.name}   •   Dydis: ${item.customization?.size || 'M'}   •   Kategorija: ${item.product.categoryLt || 'Viršutiniai'}`,
      textX,
      y + 16
    );

    // Fabric specs
    const gsmVal = item.fabric?.gsm || 380;
    doc.text(
      `Audinys: ${item.fabric?.nameLt || 'Šukuotinė Medvilnė'} (${gsmVal} GSM)  •  ${item.fabric?.description || 'Aukščiausia kokybė'}`,
      textX,
      y + 22
    );

    // Colors & Embroidery Details
    const customTextVal = typeof item.customization?.customText === 'string' && item.customization.customText.trim()
      ? `Siuvinėjimas: „${item.customization.customText.trim()}“`
      : 'Siuvinėjimas: Nenumatytas';
    doc.text(
      `Spalva: ${item.customization?.primaryColor || '#18181b'}  •  ${customTextVal}`,
      textX,
      y + 28
    );

    // Price Pill / Tag on Right
    doc.setFillColor(245, 158, 11);
    doc.roundedRect(pageWidth - margin - 34, y + 8, 28, 9, 2, 2, 'F');
    doc.setTextColor(20, 20, 25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`${(item.price || 0).toFixed(2)} €`, pageWidth - margin - 28, y + 14);

    // Sub-label for item status
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 130);
    doc.text('Paruošta užsakymui', pageWidth - margin - 34, y + 23);

    y += cardHeight + 5;
  }

  // Final Atelier Note & Contact
  if (y + 25 < pageHeight - 15) {
    doc.setFillColor(240, 240, 245);
    doc.roundedRect(margin, y + 3, contentWidth, 18, 2, 2, 'F');
    doc.setTextColor(60, 60, 70);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(
      'Norėdami pasikonsultuoti su Flipukas dizaineriu ar stilistu dėl šios kolekcijos, pateikite šį dokumentą',
      margin + 6,
      y + 10
    );
    doc.text(
      'el. paštu atelier@flipukas.lt arba atvykite į Vilniaus studiją. Visi parametrai išsaugoti 3D sistemoje.',
      margin + 6,
      y + 15
    );
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(220, 220, 225);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 140);
    doc.text(
      '© Flipukas 3D Atelier • Vilnius, Lietuva • https://flipukas.lt',
      margin,
      pageHeight - 7
    );
    doc.text(`Puslapis ${p} iš ${totalPages}`, pageWidth - margin - 22, pageHeight - 7);
  }

  const safeDate = new Date().toISOString().slice(0, 10);
  doc.save(`Flipukas-Kolekcija-${safeDate}.pdf`);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c
      .split('')
      .map((char) => char + char)
      .join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return { r: 24, g: 24, b: 27 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + '...';
}
