/**
 * POST /api/generate-pdf
 * Uses Browserless.io hosted Chrome — optimized for Vercel Hobby limits.
 */

// KORREKT KONFIGURATION FÖR HOBBY: Tillåter upp till 60 sekunder exekveringstid
export const maxDuration = 60;

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

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function POST(req: Request): Promise<Response> {
    const token = process.env.BROWSERLESS_TOKEN;
    if (!token) {
        return new Response('BROWSERLESS_TOKEN not configured', {
            status: 500, headers: corsHeaders
        });
    }

    let body: GeneratePDFRequest;
    try {
        body = await req.json();
    } catch {
        return new Response('Invalid JSON body', { status: 400, headers: corsHeaders });
    }

    const { pages, pageSize, marginTop, marginBottom, marginLeft, marginRight } = body;

    if (!pages?.length) {
        return new Response('No pages provided', { status: 400, headers: headers });
    }

    const html = buildHtml(pages, pageSize);

    try {
        const browserlessRes = await fetch(
            `https://production-sfo.browserless.io/pdf?token=${token}`,
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
                        // KORREKT PLACERING OCH VÄRDE: Säger till Browserless att rendera direkt när DOM är redo.
                        // Detta förhindrar att externa typsnitt/skript orsakar en 504-timeout.
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
            return new Response(`PDF generation failed: ${error}`, {
                status: 500, headers: corsHeaders
            });
        }

        const pdfBuffer = await browserlessRes.arrayBuffer();

        return new Response(pdfBuffer, {
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
            status: 500, headers: corsHeaders,
        });
    }
}

export async function OPTIONS(): Promise<Response> {
    return new Response(null, { status: 204, headers: corsHeaders });
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
    /* TYPSNITT: Inladdat via @import i CSS vilket fungerar betydligt mer stabilt i Browserless miljöer */
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400&display=swap');

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
