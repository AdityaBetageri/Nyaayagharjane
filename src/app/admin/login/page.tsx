import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-neutral-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm border border-neutral-200 text-center space-y-4">
        <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-700">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">ನಿರ್ವಾಹಕರ ಲಾಗಿನ್</h1>
        <p className="text-sm text-neutral-500">
          ನ್ಯಾಯಘರ್ಜನೆ ಆಡಳಿತ ವಿಭಾಗ (ಹಂತ 1 - ರಚನೆ ಸಿದ್ಧವಾಗಿದೆ)
        </p>
      </div>
    </main>
  );
}
