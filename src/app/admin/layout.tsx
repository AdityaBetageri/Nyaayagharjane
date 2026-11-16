import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export const metadata = {
  title: "ಆಡಳಿತ ಮಂಡಳಿ (Admin Panel) | ನ್ಯಾಯಘರ್ಜನೆ",
  description: "ನ್ಯಾಯಘರ್ಜನೆ ಇ-ಪತ್ರಿಕೆ ಆಡಳಿತ ವ್ಯವಸ್ಥೆ ಮತ್ತು ಪತ್ರಿಕಾ ನಿರ್ವಹಣೆ.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
