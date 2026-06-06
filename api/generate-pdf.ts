/**
 * POST /api/generate-pdf
 *
 * Receives page-by-page HTML from the client (already split by the
 * pagination engine), renders it in headless Chromium, and returns
 * a real PDF where the browser preview and output are identical.
 *
 * npm install puppeteer-core @sparticuz/chromium
 */

import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Give Chromium enough time to start and render fonts
export const config = { maxDuration: 60 };

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

export default async function handler(req: Request): Promise<Response> {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    let body: GeneratePDFRequest;
    try {
        body = await req.json();
    } catch {
        return new Response('Invalid JSON body', { status: 400 });
    }

    const { pages, pageSize, marginTop, marginBottom, marginLeft, marginRight } = body;

    if (!pages?.length) {
        return new Response('No pages provided', { status: 400 });
    }

    const html = buildHtml(pages, pageSize);

    let browser;
    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });

        const page = await browser.newPage();

        // Wait for network idle so Google Fonts load correctly
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdf = await page.pdf({
            format: pageSize === 'Letter' ? 'Letter' : 'A4',
            printBackground: true,
            margin: {
                top:    `${marginTop}mm`,
                bottom: `${marginBottom}mm`,
                left:   `${marginLeft}mm`,
                right:  `${marginRight}mm`,
            },
        });

        return new Response(pdf, {
            status: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="invoice.pdf"',
            },
        });

    } catch (err) {
        console.error('PDF generation error:', err);
        return new Response(`PDF generation failed: ${String(err)}`, {
            status: 500,
            headers: corsHeaders,
        });
    } finally {
        if (browser) await browser.close();
    }
}

function buildHtml(pages: PageData[], pageSize: 'A4' | 'Letter'): string {
    const pagesHtml = pages
        .map(
            (page) => `
      <div class="pdf-page">
        ${page.headerHtml}
        ${page.contentHtml}
      </div>`
        )
        .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400&display=swap" rel="stylesheet">
  <style>
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

    /* Each page is a block — Puppeteer breaks between them */
    .pdf-page {
      page-break-after: always;
      background: white;
    }
    .pdf-page:last-child {
      page-break-after: auto;
    }

    /* Hide the annotation badges — they're for the preview only */
    [data-header-badge],
    .engine-page-break-line,
    .engine-header-copy {
      display: none !important;
    }

    /* Preserve inline styles from LivePreviewDoc */
    [data-repeat-header="true"] {
      outline: none !important;
    }

    [data-keep-together="true"] {
      outline: none !important;
      position: relative;
    }

    /* Remove the amber keep-together badge in PDF */
    [data-keep-together="true"] > div[style*="position: absolute"] {
      display: none !important;
    }

    @page {
      size: ${pageSize};
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;
}