export function openPrintableInvoice(invoice: any) {
  const customer = invoice?.customer || {};
  const sale = invoice?.sale || {};
  const items = sale.items || [];
  const total = Number(invoice?.total ?? sale.total ?? 0);
  const paid = Number(invoice?.paidAmount ?? sale.paidAmount ?? 0);
  const due = Math.max(total - paid, 0);

  const rows = items.map((item: any) => {
    const qty = Number(item.quantity || 0);
    const price = Number(item.price || 0);
    const subtotal = Number(item.subtotal ?? qty * price);
    return `
      <tr>
        <td>${item.product?.name || 'Produit'}</td>
        <td>${qty}</td>
        <td>${price.toFixed(2)} DT</td>
        <td>${subtotal.toFixed(2)} DT</td>
      </tr>
    `;
  }).join('');

  const html = `
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>Facture ${invoice?.reference || '—'}</title>
        <style>
          body {
            font-family: Arial, sans-serif; margin: 24px; color: #1f2937;
            background: #fff;
          }
          .invoice {
            max-width: 800px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 32px;
            border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.04);
          }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
          .brand { font-size: 28px; font-weight: 700; color: #f97316; letter-spacing: 1px; }
          .meta { text-align: right; font-size: 12px; color: #6b7280; }
          .section { margin-top: 18px; }
          .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border-bottom: 1px solid #e5e7eb; padding: 12px 8px; text-align: left; font-size: 13px; }
          th { background: #fff7ed; color: #7c2d12; font-weight: 700; }
          .totals { width: 280px; margin-left: auto; margin-top: 20px; }
          .totals-row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #f3f4f6; }
          .totals-row.total { font-size: 20px; font-weight: 700; color: #111827; }
          .footer { margin-top: 24px; font-size: 12px; color: #6b7280; }
          @media print {
            body { margin: 0; }
            .invoice { box-shadow: none; border: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <div>
              <div class="brand">AMIN</div>
              <div class="label">Dépôt d'épices</div>
            </div>
            <div class="meta">
              <div><strong>Facture :</strong> ${invoice?.reference || '—'}</div>
              <div><strong>Date :</strong> ${new Date(invoice?.date || Date.now()).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>

          <div class="section">
            <div class="label">Client</div>
            <div style="margin-top:8px; font-size:14px;">
              <strong>${customer?.name || 'Client anonyme'}</strong><br />
              ${customer?.email || ''}<br />
              ${customer?.phone || ''}
            </div>
          </div>

          <div class="section">
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Qté</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${rows || '<tr><td colspan="4">Aucun article</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="totals">
            <div class="totals-row"><span>Sous-total</span><span>${Number(invoice?.subtotal ?? sale.subtotal ?? 0).toFixed(2)} DT</span></div>
            <div class="totals-row"><span>TVA</span><span>${Number(invoice?.tax ?? sale.tax ?? 0).toFixed(2)} DT</span></div>
            <div class="totals-row"><span>Montant payé</span><span>${Number(paid).toFixed(2)} DT</span></div>
            <div class="totals-row"><span>Reste</span><span>${Number(due).toFixed(2)} DT</span></div>
            <div class="totals-row total"><span>Total</span><span>${Number(total).toFixed(2)} DT</span></div>
          </div>

          <div class="footer">
            Merci pour votre confiance. <br />
            Société AMIN - gestion de dépôt d'épices
          </div>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=900,height=1100');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 500);
}
