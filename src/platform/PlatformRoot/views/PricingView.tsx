import React from 'react';

// ─── Replace these placeholders before going live ────────────────────────────
const STRIPE_PRO_LINK  = 'https://buy.stripe.com/https://buy.stripe.com/4gM5kDgwo1vu3Wh4BzaMU00';
const GITHUB_FREE_LINK = 'https://github.com/YOUR_REPO';
const ENTERPRISE_EMAIL = 'mailto:YOUR_EMAIL?subject=PaginateJS%20Enterprise';

export const PricingView: React.FC = () => {
  return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="font-syne text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            Simple, honest pricing
          </h1>
          <p className="font-dmsans text-sm text-gray-400 max-w-md mx-auto">
            Free for personal projects. $19/month when you ship it to real users.
          </p>
        </div>

        {/* Plans */}
        <div className="grid gap-6 md:grid-cols-3 pt-4 max-w-4xl mx-auto">

          {/* Free */}
          <div className="rounded-xl border border-gray-900 bg-gray-900/10 p-5 flex flex-col justify-between space-y-5">
            <div className="space-y-1.5">
              <h3 className="font-syne text-base font-bold text-white">Free</h3>
              <p className="text-[11px] font-dmsans text-gray-400">
                Personal projects, side projects, open-source. No payment needed.
              </p>
              <div className="pt-1 font-syne">
                <span className="text-2xl font-extrabold text-white">$0</span>
                <span className="text-[10px] font-dmmono text-gray-500"> / forever</span>
              </div>
            </div>
            <ul className="space-y-2.5 font-dmsans text-xs text-gray-400 border-t border-gray-900 pt-3 flex-1">
              <li className="flex items-start gap-2">
                <span className="text-gray-600 mt-0.5">✓</span>
                Full pagination engine — repeat headers, keep-together blocks
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-600 mt-0.5">✓</span>
                A4 and Letter page sizes
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-600 mt-0.5">✓</span>
                Non-commercial use only
              </li>
            </ul>
            <a
                href={GITHUB_FREE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-bold font-dmsans text-gray-300 transition-colors text-center block"
            >
              View on GitHub
            </a>
          </div>

          {/* Pro */}
          <div className="rounded-xl border border-purple-500/20 bg-purple-950/10 p-5 flex flex-col justify-between space-y-5 relative">
          <span className="absolute -top-2 right-4 bg-purple-600 text-white text-[8px] font-dmmono uppercase px-2 py-0.5 rounded-full font-bold">
            Most popular
          </span>
            <div className="space-y-1.5">
              <h3 className="font-syne text-base font-bold text-white">Pro</h3>
              <p className="text-[11px] font-dmsans text-purple-300">
                For developers shipping invoices, reports, or documents to real users.
              </p>
              <div className="pt-1 font-syne">
                <span className="text-2xl font-extrabold text-white">$19</span>
                <span className="text-[10px] font-dmmono text-purple-400"> / month</span>
              </div>
            </div>
            <ul className="space-y-2.5 font-dmsans text-xs text-purple-300 border-t border-purple-900/40 pt-3 flex-1">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">✓</span>
                Everything in Free
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">✓</span>
                Commercial use — ship to paying customers
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">✓</span>
                Email support — I'll help you integrate it
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">✓</span>
                Early access to PDF export when it ships
              </li>
            </ul>
            <a
                href={STRIPE_PRO_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold font-dmsans text-white shadow-md transition-colors text-center block"
            >
              Get Pro — $19/month
            </a>
          </div>

          {/* Enterprise */}
          <div className="rounded-xl border border-gray-900 bg-gray-900/10 p-5 flex flex-col justify-between space-y-5">
            <div className="space-y-1.5">
              <h3 className="font-syne text-base font-bold text-white">Enterprise</h3>
              <p className="text-[11px] font-dmsans text-gray-400">
                Building a platform that generates documents at scale?
              </p>
              <div className="pt-1 font-syne">
                <span className="text-base font-extrabold text-gray-300">Let's talk</span>
              </div>
            </div>
            <ul className="space-y-2.5 font-dmsans text-xs text-gray-400 border-t border-gray-900 pt-3 flex-1">
              <li className="flex items-start gap-2">
                <span className="text-gray-600 mt-0.5">✓</span>
                Everything in Pro
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-600 mt-0.5">✓</span>
                Dedicated integration support
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-600 mt-0.5">✓</span>
                Custom page formats and margin presets
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-600 mt-0.5">✓</span>
                Volume licensing agreement
              </li>
            </ul>
            <a
                href={ENTERPRISE_EMAIL}
                className="w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-bold font-dmsans text-gray-300 transition-colors text-center block"
            >
              Get in touch
            </a>
          </div>

        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto pt-10 border-t border-gray-900 space-y-4">
          <h4 className="font-syne text-sm font-bold text-white text-center tracking-wider uppercase mb-4">
            Common questions
          </h4>
          {[
            {
              q: 'Does this generate the PDF itself?',
              a: "Not yet. Right now it calculates exactly where page breaks should land and shows you a live preview. PDF export is in development — Pro subscribers get early access when it ships."
            },
            {
              q: "What counts as commercial use?",
              a: "If your app charges users money and uses PaginateJS to generate documents for those users, that's commercial use. Personal projects, portfolios, and open-source tools are free."
            },
            {
              q: 'Does it work with any framework?',
              a: 'Yes. It works on any rendered HTML — React, Vue, Svelte, Bubble, plain JavaScript. If it runs in a browser DOM, the engine can measure it.'
            },
            {
              q: 'What if my page breaks look wrong?',
              a: 'The most common cause is CSS margins between elements. The engine measures element heights but not gaps between them. Use padding inside elements instead of margin between them.'
            },
          ].map(({ q, a }) => (
              <div key={q} className="p-4 rounded-lg bg-gray-900/20 border border-gray-900 space-y-1.5">
                <h5 className="font-syne font-bold text-gray-200 text-xs">{q}</h5>
                <p className="text-xs text-gray-400 leading-relaxed font-dmsans">{a}</p>
              </div>
          ))}
        </div>

      </div>
  );
};