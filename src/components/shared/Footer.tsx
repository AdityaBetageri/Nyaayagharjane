"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
import { getLocalSiteSettings, fetchSiteSettings, SiteContactSettings, DEFAULT_SITE_SETTINGS } from "@/lib/siteSettings";

export default function Footer() {
  const [settings, setSettings] = useState<SiteContactSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    setSettings(getLocalSiteSettings());
    fetchSiteSettings().then((res) => {
      if (res) setSettings(res);
    });

    const handleUpdate = () => {
      setSettings(getLocalSiteSettings());
    };

    window.addEventListener("site_settings_updated", handleUpdate);
    return () => window.removeEventListener("site_settings_updated", handleUpdate);
  }, []);
  return (
    <footer className="w-full bg-[#172B4D] text-white border-t-4 border-[#C62828] mt-auto">
      {/* Upper Footer */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-10 lg:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="ನ್ಯಾಯ ಘರ್ಜನೆ ಲೋಗೋ"
                width={968}
                height={968}
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-lg drop-shadow-sm"
              />
              <Image
                src="/nyaayagharjane-title.png"
                alt="ನ್ಯಾಯ ಘರ್ಜನೆ"
                width={918}
                height={198}
                className="h-7 sm:h-8 w-auto object-contain brightness-110"
              />
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
                <Link href="/read" className="hover:text-[#FF8A80] transition-colors font-medium">
                  ಪತ್ರಿಕೆ ಓದಿ
                </Link>
              </li>
              <li>
                <Link href="/latest" className="hover:text-[#FF8A80] transition-colors">
                  ಇತ್ತೀಚಿನ ಪತ್ರಿಕೆ
                </Link>
              </li>
              <li>
                <Link href="/archives" className="hover:text-[#FF8A80] transition-colors">
                  ಹಿಂದಿನ ಸಂಚಿಕೆಗಳು
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

          {/* Contact & Editorial Desk */}
          <div className="space-y-4">
            <div className="border-b border-neutral-700 pb-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                ಸಂಪಾದಕೀಯ ಕಚೇರಿ
              </h4>
            </div>
            <div className="space-y-2.5 text-xs text-neutral-300">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#FF8A80] shrink-0 mt-0.5" />
                <span>{settings.officeAddress}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FF8A80] shrink-0" />
                <span>{settings.contactEmail}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FF8A80] shrink-0" />
                <span>{settings.contactPhone}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Footer */}
      <div className="border-t border-neutral-800 bg-[#0F1C33] text-neutral-400 text-xs py-4 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="w-full max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>
            © 2026 Nyaayagharjane. All rights reserved.
          </p>
          <p className="text-[11px] text-neutral-400">
            Voice of Truth • Roar of Justice — Kannada Monthly E-Newspaper
          </p>
        </div>
      </div>
    </footer>
  );
}
