import React from 'react';

interface FooterProps {
  onOpenCookieSettings?: () => void;
  onOpenAIReview?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenCookieSettings, onOpenAIReview }) => {
  const handleCookieClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenCookieSettings) {
      onOpenCookieSettings();
    } else {
      window.dispatchEvent(new CustomEvent('open-cookie-settings'));
    }
  };

  return (
    <footer id="apie-mus" className="w-full border-t border-stone-800/80 bg-[#0a0a0e] py-16 text-stone-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          {/* Brand Vision */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-serif-luxury font-bold text-white tracking-tight">Flipukas</span>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d4af37] px-1.5 py-0.5 rounded border border-[#d4af37]/30 bg-[#d4af37]/10">
                Atelier
              </span>
            </div>
            <p className="mt-3 text-xs text-stone-300 leading-relaxed max-w-sm font-light">
              Aukštosios mados 3D laboratorija ir autorinis stilius. Keičiame požiūrį į internetinį apsipirkimą sujungdami mados namų meistrystę su parametriniu 3D atvaizdavimu ir mikroskopiniu pynimu.
            </p>
            <div className="mt-4 text-[11px] font-mono text-stone-500">
              Atelier Rezidencija: Švitrigailos g. 11, Vilnius, Lietuva
            </div>
          </div>

          {/* Links 1 */}
          <div className="md:col-span-2">
            <div className="font-serif-luxury text-sm font-bold text-white mb-3">Atelier Kolekcija</div>
            <ul className="space-y-2 text-stone-300">
              <li><a href="#kolekcija" className="hover:text-[#f5e6b8] transition-colors">Džemperiai</a></li>
              <li><a href="#kolekcija" className="hover:text-[#f5e6b8] transition-colors">Taktinės Striukės</a></li>
              <li><a href="#kolekcija" className="hover:text-[#f5e6b8] transition-colors">Bioniniai Kedai</a></li>
              <li><a href="#kolekcija" className="hover:text-[#f5e6b8] transition-colors">Paltai & Kargai</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="md:col-span-2">
            <div className="font-serif-luxury text-sm font-bold text-white mb-3">3D Laboratorija</div>
            <ul className="space-y-2 text-stone-300">
              <li><a href="#style-lab" className="hover:text-[#f5e6b8] transition-colors">Spalvų Paletė</a></li>
              <li><a href="#technologijos" className="hover:text-[#f5e6b8] transition-colors">2D Makro Pynimas</a></li>
              <li><a href="#style-lab" className="hover:text-[#f5e6b8] transition-colors">Sprogdinti Sluoksniai</a></li>
              <li><a href="#style-lab" className="hover:text-[#f5e6b8] transition-colors">Autorinė Monograma</a></li>
              {onOpenAIReview && (
                <li>
                  <button
                    onClick={onOpenAIReview}
                    className="text-[#d4af37] hover:underline cursor-pointer flex items-center gap-1 font-mono text-[11px]"
                  >
                    <span>🤖 AI Projekto Dosjė</span>
                    <span className="text-[9px] bg-[#d4af37]/20 px-1 py-0.2 rounded border border-[#d4af37]/40">MD</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Customer Care */}
          <div className="md:col-span-3">
            <div className="font-serif-luxury text-sm font-bold text-white mb-3">Atelier Standartai</div>
            <ul className="space-y-2 text-stone-300">
              <li>Nemokamas kurjerio pristatymas nuo 100 €</li>
              <li>30 dienų nemokamas grąžinimas</li>
              <li>2 metų gamybos kokybės garantija</li>
              <li>VIP Klientų aptarnavimas: atelier@flipukas.lt</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500 text-[11px] font-mono">
          <div>
            © {new Date().getFullYear()} Flipukas Atelier. Visos teisės saugomos.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-stone-300 transition-colors">Privatumo politika</a>
            <a href="#" className="hover:text-stone-300 transition-colors">Pirkimo taisyklės</a>
            <button
              type="button"
              onClick={handleCookieClick}
              className="hover:text-[#d4af37] transition-colors cursor-pointer"
            >
              Slapukų nustatymai
            </button>
            {onOpenAIReview && (
              <button
                type="button"
                onClick={onOpenAIReview}
                className="text-[#d4af37] hover:text-[#f5e6b8] transition-colors cursor-pointer font-mono flex items-center gap-1"
              >
                <span>🤖 AI Auditas</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
