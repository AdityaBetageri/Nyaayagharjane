import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#172B4D] text-white border-t-4 border-[#C62828] mt-auto">
      {/* Upper Footer */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-10 lg:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tight text-white font-serif leading-none">
                ನ್ಯಾಯಘರ್ಜನೆ
              </span>
            </div>
            <p className="text-sm font-medium text-[#FF8A80] mt-2">
              ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ
            </p>
            <p className="text-xs text-neutral-300 leading-relaxed">
              ಕರ್ನಾಟಕದ ಸಾರ್ವಜನಿಕರ ಹಿತದೃಷ್ಟಿಯಿಂದ ನಿಷ್ಪಕ್ಷಪಾತ, ಸತ್ಯನಿಷ್ಠ ಮತ್ತು ನೈತಿಕ ಪತ್ರಿಕೋದ್ಯಮಕ್ಕೆ ಸಮರ್ಪಿತವಾದ ಮಾಸಿಕ ಡಿಜಿಟಲ್ ಇ-ಪತ್ರಿಕೆ.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white border-b border-neutral-700 pb-2">
              ಮುಖ್ಯ ಕೊಂಡಿಗಳು
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-neutral-300">
              <li>
                <Link href="/" className="hover:text-[#FF8A80] transition-colors">
                  ಮುಖಪುಟ
                </Link>
              </li>
              <li>
                <Link href="/latest" className="hover:text-[#FF8A80] transition-colors">
                  ಇತ್ತೀಚಿನ ಪತ್ರಿಕೆ
                </Link>
              </li>
              <li>
                <Link href="/archives" className="hover:text-[#FF8A80] transition-colors">
                  ಹಿಂದಿನ ಸಂಚಿಕೆಗಳು (ಆರ್ಕೈವ್)
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#FF8A80] transition-colors">
                  ನಮ್ಮ ಬಗ್ಗೆ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#FF8A80] transition-colors">
                  ಸಂಪರ್ಕಿಸಿ
                </Link>
              </li>
              <li className="pt-2 border-t border-neutral-700/60">
                <Link href="/admin/login" className="text-neutral-400 hover:text-white transition-colors text-xs flex items-center gap-1">
                  <span>ನಿರ್ವಾಹಕರ ಪ್ರವೇಶ (Admin Login)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* E-Paper Features */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white border-b border-neutral-700 pb-2">
              ಡಿಜಿಟಲ್ ಇ-ಪತ್ರಿಕೆ ವೈಶಿಷ್ಟ್ಯಗಳು
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-300">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF8A80] shrink-0" />
                <span>ಉನ್ನತ ಗುಣಮಟ್ಟದ ಡಿಜಿಟಲ್ ಫ್ಲಿಪ್‌ಬುಕ್ ವಾಚಕ</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF8A80] shrink-0" />
                <span>ಉಚಿತ ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್ ಸೌಲಭ್ಯ</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF8A80] shrink-0" />
                <span>ವರ್ಷವಾರು ಸಂಪೂರ್ಣ ಸಂಚಿಕೆಗಳ ಸಂಗ್ರಹ</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF8A80] shrink-0" />
                <span>ಮೊಬೈಲ್ ಮತ್ತು ಕಂಪ್ಯೂಟರ್‌ಗೆ ಸುಲಭ ಹೊಂದಾಣಿಕೆ</span>
              </li>
            </ul>
          </div>

          {/* Contact & Editorial Desk (Explicitly Marked as Placeholders) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-700 pb-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                ಸಂಪಾದಕೀಯ ಕಚೇರಿ
              </h4>
              <span className="text-[10px] text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800">
                ಮಾದರಿ ವಿವರ
              </span>
            </div>
            <div className="space-y-2.5 text-xs text-neutral-300">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#FF8A80] shrink-0 mt-0.5" />
                <span>ನ್ಯಾಯಘರ್ಜನೆ ಭವನ, ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ - ೫೬೦೦೦೧ <span className="text-neutral-400">(ಮಾದರಿ ವಿಳಾಸ / Placeholder)</span></span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FF8A80] shrink-0" />
                <span>contact@nyaayagharjane.com <span className="text-neutral-400">(ಮಾದರಿ ಇಮೇಲ್)</span></span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FF8A80] shrink-0" />
                <span>+91 00000 00000 <span className="text-neutral-400">(ಮಾದರಿ ಸಂಖ್ಯೆ)</span></span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Footer */}
      <div className="border-t border-neutral-800 bg-[#0F1C33] text-neutral-400 text-xs py-4 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="w-full max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>
            © 2026 ನ್ಯಾಯಘರ್ಜನೆ. ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.
          </p>
          <p className="text-[11px] text-neutral-400">
            ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ — ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ
          </p>
        </div>
      </div>
    </footer>
  );
}
