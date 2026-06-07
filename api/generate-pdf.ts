import type { VercelRequest, VercelResponse } from '@vercel/node';

// KORREKT KONFIGURATION FÖR TRADITIONELLA API-RUTTER PÅ HOBBY
export const config = {
    maxDuration: 60 // Ger funktionen maximala 60 sekunder på gratisplanen
};

interface PageData {
    headerHtml: string;
    contentHtml: string;
}

interface GeneratePDFRequest {
    pages: PageData[];
    pageSize: 'A4' | 'Letter';
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
}

// EXPORT DEFAULT: Detta är vad din miljö kräver (löser WARN-meddelandet)
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Hantera CORS-headers manuellt för Node.js-miljön
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Hantera preflight OPTIONS-anrop direkt
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    // Se till att det är ett POST-anrop
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const token = process.env.BROWSERLESS_TOKEN;
    if (!token) {
        return res.status(500).send('BROWSERLESS_TOKEN not configured');
    }

    const { pages, pageSize, marginTop, marginBottom, marginLeft, marginRight } = req.body as GeneratePDFRequest;

    if (!pages?.length) {
        return res.status(400).send('No pages provided');
    }

    const html = buildHtml(pages, pageSize);

    try {
        // DETTA ÄR FIXAT: Rätt API-rutt samt korrekt JavaScript-syntax för token-variabeln!
        const browserlessRes = await fetch(
            `https://browserless.io{token}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                },
                body: JSON.stringify({
                    html,
                    options: {
                        format: pageSize,
                        printBackground: true,
                        // Säger till Browserless att rendera direkt när DOM är redo (snabbast)
                        waitUntil: 'domcontentloaded',
                        margin: {
                            top:    `${marginTop}mm`,
                            bottom: `${marginBottom}mm`,
                            left:   `${marginLeft}mm`,
                            right:  `${marginRight}mm`,
                        },
                    },
                }),
            }
        );

        if (!browserlessRes.ok) {
            const error = await browserlessRes.text();
            console.error('Browserless error:', error);
            return res.status(500).send(`PDF generation failed: ${error}`);
        }

        const pdfBuffer = await browserlessRes.arrayBuffer();

        // Skicka tillbaka filen på rätt sätt via Node.js-responsen
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');

        return res.status(200).send(Buffer.from(pdfBuffer));

    } catch (err) {
        console.error('PDF generation error:', err);
        return res.status(500).send(`PDF generation failed: ${String(err)}`);
    }
}

function buildHtml(pages: PageData[], pageSize: 'A4' | 'Letter'): string {
    const pagesHtml = pages
        .map(page => `
      <div class="pdf-page">
        ${page.headerHtml}
        ${page.contentHtml}
      </div>`)
        .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    /* DETTA ÄR FIXAT: Återställde hela sökvägen till Google Fonts */
    @import url('https://googleapis.com');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      line-height: 1.5;
      background: white;
      color: #111827;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .pdf-page { page-break-after: always; background: white; }
    .pdf-page:last-child { page-break-after: auto; }
    [data-header-badge],
    .engine-page-break-line,
    .engine-header-copy { display: none !important; }
    @page { size: ${pageSize}; }
  </style>
</head>
<body>${pagesHtml}</body>
</html>`;
}
