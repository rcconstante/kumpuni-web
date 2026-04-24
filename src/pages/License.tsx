import { useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';

export default function LicensePage() {
  useEffect(() => {
    document.title = 'License — Kumpuni';
    const setMeta = (name: string, content: string, prop = false) => {
      const attr = prop ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    setMeta('description', 'Kumpuni License — open-source acknowledgements and software license information.');
    setMeta('og:title', 'License — Kumpuni', true);
    setMeta('og:description', 'Open-source acknowledgements and software license information for Kumpuni.', true);
    setMeta('og:url', 'https://kumpuni.netlify.app/license', true);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', 'https://kumpuni.netlify.app/license');
    return () => {
      document.title = 'Kumpuni — DIY Home Maintenance Guide';
      if (canonical) canonical.setAttribute('href', 'https://kumpuni.netlify.app/');
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#1F2937]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Back */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-[#6DBE75] transition-colors mb-10"
        >
          <ChevronLeft size={16} />
          Back to Kumpuni
        </a>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <img src="/logo.png" alt="Kumpuni" className="w-10 h-10 rounded-xl" />
            <span className="text-xl font-bold">Kumpuni</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">License</h1>
          <p className="text-[#9CA3AF] text-sm">Effective: April 24, 2026 · Version 1.0.0</p>
        </div>

        <div className="h-px bg-[#E5E7EB] mb-12" />

        <div className="prose max-w-none space-y-10 text-[#6B7280] leading-relaxed">

          {/* App License */}
          <section>
            <h2 className="text-xl font-bold text-[#1F2937] mb-3">Kumpuni Application License</h2>
            <p>
              Copyright © 2026 Richmond C. Constante and Adlei Jed Tan. All rights reserved.
            </p>
            <p className="mt-3">
              Kumpuni (the "App") and all associated source code, assets, designs, and
              documentation are proprietary and confidential. The App is licensed — not sold — to
              you under the terms set out in the{' '}
              <a href="/terms" className="text-[#6DBE75] hover:underline">Terms of Service</a>.
            </p>
            <p className="mt-3">
              You may not copy, modify, merge, publish, distribute, sublicense, or sell copies of
              the App or its source code without prior written permission from the copyright holders.
            </p>
          </section>

          {/* MIT Open Source deps */}
          <section>
            <h2 className="text-xl font-bold text-[#1F2937] mb-3">Open-Source Acknowledgements</h2>
            <p>
              Kumpuni is built with the following open-source libraries. We are grateful to every
              contributor and maintainer listed below.
            </p>
          </section>

          {/* Framework */}
          <section>
            <h3 className="text-lg font-semibold text-[#374151] mb-2">Framework & Runtime</h3>
            <LicenseTable rows={[
              { name: 'React', version: '19.1.0', license: 'MIT', author: 'Meta Platforms, Inc.' },
              { name: 'React Native', version: '0.81.4', license: 'MIT', author: 'Meta Platforms, Inc.' },
              { name: 'Expo SDK', version: '54', license: 'MIT', author: 'Expo, Inc.' },
              { name: 'expo-router', version: '6.x', license: 'MIT', author: 'Expo, Inc.' },
              { name: 'TypeScript', version: '5.9', license: 'Apache 2.0', author: 'Microsoft Corporation' },
            ]} />
          </section>

          {/* Navigation */}
          <section>
            <h3 className="text-lg font-semibold text-[#374151] mb-2">Navigation</h3>
            <LicenseTable rows={[
              { name: 'React Navigation', version: '7.x', license: 'MIT', author: 'React Navigation contributors' },
              { name: 'react-native-screens', version: '4.x', license: 'MIT', author: 'Software Mansion' },
              { name: 'react-native-safe-area-context', version: '5.x', license: 'MIT', author: 'th3rdwave' },
            ]} />
          </section>

          {/* UI */}
          <section>
            <h3 className="text-lg font-semibold text-[#374151] mb-2">UI & Graphics</h3>
            <LicenseTable rows={[
              { name: 'lucide-react-native', version: '0.544', license: 'ISC', author: 'Lucide contributors' },
              { name: 'react-native-svg', version: '15.x', license: 'MIT', author: 'react-native-community' },
              { name: 'react-native-reanimated', version: '4.x', license: 'MIT', author: 'Software Mansion' },
              { name: 'react-native-gesture-handler', version: '2.x', license: 'MIT', author: 'Software Mansion' },
              { name: 'expo-linear-gradient', version: '15.x', license: 'MIT', author: 'Expo, Inc.' },
              { name: 'expo-blur', version: '15.x', license: 'MIT', author: 'Expo, Inc.' },
              { name: 'expo-symbols', version: '1.x', license: 'MIT', author: 'Expo, Inc.' },
            ]} />
          </section>

          {/* Device APIs */}
          <section>
            <h3 className="text-lg font-semibold text-[#374151] mb-2">Device APIs & Permissions</h3>
            <LicenseTable rows={[
              { name: 'expo-location', version: '55.x', license: 'MIT', author: 'Expo, Inc.' },
              { name: 'expo-image-picker', version: '55.x', license: 'MIT', author: 'Expo, Inc.' },
              { name: 'expo-haptics', version: '15.x', license: 'MIT', author: 'Expo, Inc.' },
              { name: 'expo-font', version: '14.x', license: 'MIT', author: 'Expo, Inc.' },
              { name: 'expo-splash-screen', version: '31.x', license: 'MIT', author: 'Expo, Inc.' },
              { name: 'expo-constants', version: '18.x', license: 'MIT', author: 'Expo, Inc.' },
              { name: 'expo-status-bar', version: '3.x', license: 'MIT', author: 'Expo, Inc.' },
              { name: 'expo-system-ui', version: '6.x', license: 'MIT', author: 'Expo, Inc.' },
              { name: 'expo-web-browser', version: '15.x', license: 'MIT', author: 'Expo, Inc.' },
            ]} />
          </section>

          {/* Backend & Storage */}
          <section>
            <h3 className="text-lg font-semibold text-[#374151] mb-2">Backend & Data</h3>
            <LicenseTable rows={[
              { name: '@supabase/supabase-js', version: '2.58', license: 'MIT', author: 'Supabase, Inc.' },
              { name: '@react-native-async-storage/async-storage', version: '2.2', license: 'MIT', author: 'React Native Community' },
              { name: 'react-native-url-polyfill', version: '2.x', license: 'MIT', author: 'Charly Poly' },
            ]} />
          </section>

          {/* Maps */}
          <section>
            <h3 className="text-lg font-semibold text-[#374151] mb-2">Maps</h3>
            <LicenseTable rows={[
              { name: 'react-native-webview', version: '13.x', license: 'MIT', author: 'React Native Community' },
              { name: 'Leaflet', version: '1.9', license: 'BSD 2-Clause', author: 'Volodymyr Agafonkin' },
              { name: 'OpenStreetMap tiles', version: '—', license: 'ODbL 1.0', author: 'OpenStreetMap contributors' },
            ]} />
          </section>

          {/* Web Admin */}
          <section>
            <h3 className="text-lg font-semibold text-[#374151] mb-2">Web Admin Panel</h3>
            <LicenseTable rows={[
              { name: 'Vite', version: '5.x', license: 'MIT', author: 'Evan You & Vite contributors' },
              { name: 'react-router-dom', version: '7.x', license: 'MIT', author: 'Remix Software, Inc.' },
              { name: 'Tailwind CSS', version: '3.x', license: 'MIT', author: 'Tailwind Labs, Inc.' },
              { name: 'lucide-react', version: '0.x', license: 'ISC', author: 'Lucide contributors' },
            ]} />
          </section>

          {/* Map data */}
          <section>
            <h2 className="text-xl font-bold text-[#1F2937] mb-3">Map Data Attribution</h2>
            <p>
              Map tiles are provided by{' '}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6DBE75] hover:underline"
              >
                OpenStreetMap contributors
              </a>{' '}
              under the{' '}
              <a
                href="https://opendatacommons.org/licenses/odbl/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6DBE75] hover:underline"
              >
                Open Database License (ODbL) 1.0
              </a>
              . © OpenStreetMap contributors.
            </p>
          </section>

          {/* AI */}
          <section>
            <h2 className="text-xl font-bold text-[#1F2937] mb-3">AI Assistant Disclaimer</h2>
            <p>
              The in-app AI assistant provides general home maintenance guidance. Responses are
              generated algorithmically and may not be accurate or complete. Kumpuni is not
              liable for any actions taken based on AI-generated content. Always consult a
              qualified professional for structural, electrical, gas, or other high-risk work.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-bold text-[#1F2937] mb-3">Contact</h2>
            <p>
              For licensing inquiries or open-source questions, contact us at{' '}
              <a
                href="mailto:r.cconstante.dev@gmail.com"
                className="text-[#6DBE75] hover:underline"
              >
                r.cconstante.dev@gmail.com
              </a>
              .
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-[#E5E7EB] flex flex-wrap gap-6 text-sm text-[#9CA3AF]">
          <a href="/terms" className="hover:text-[#6DBE75] transition-colors">Terms of Service</a>
          <a href="/privacy" className="hover:text-[#6DBE75] transition-colors">Privacy Policy</a>
          <a href="/license" className="text-[#6DBE75] font-medium">License</a>
          <span className="ml-auto">© 2026 Kumpuni</span>
        </div>
      </div>
    </div>
  );
}

function LicenseTable({ rows }: { rows: { name: string; version: string; license: string; author: string }[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <th className="text-left px-4 py-2.5 font-semibold text-[#374151]">Package</th>
            <th className="text-left px-4 py-2.5 font-semibold text-[#374151]">Version</th>
            <th className="text-left px-4 py-2.5 font-semibold text-[#374151]">License</th>
            <th className="text-left px-4 py-2.5 font-semibold text-[#374151]">Author</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.name} className={`border-b border-[#F3F4F6] ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
              <td className="px-4 py-2.5 font-mono text-[#1F2937] font-medium text-xs">{r.name}</td>
              <td className="px-4 py-2.5 text-[#9CA3AF] text-xs">{r.version}</td>
              <td className="px-4 py-2.5">
                <span className="bg-[#E8F5E9] text-[#2E7D32] text-xs font-semibold px-2 py-0.5 rounded-full">{r.license}</span>
              </td>
              <td className="px-4 py-2.5 text-[#6B7280] text-xs">{r.author}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
