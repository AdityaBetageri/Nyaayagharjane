import { LayoutDashboard } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen p-8 bg-neutral-100">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neutral-200 rounded-lg text-neutral-800">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">ಆಡಳಿತ ಮಂಡಳಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್</h1>
            <p className="text-sm text-neutral-500">ಇ-ಪತ್ರಿಕೆ ಆವೃತ್ತಿಗಳ ನಿರ್ವಹಣೆ</p>
          </div>
        </div>
      </div>
    </main>
  );
}
