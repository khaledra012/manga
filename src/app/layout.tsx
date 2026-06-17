import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MANGATAK — اقرأ المانجا مجاناً",
    template: "%s | MANGATAK",
  },
  description: "موقع MANGATAK لقراءة المانجا والمانهوا والمانهوا الصيني مجاناً بجودة عالية",
  keywords: ["مانجا", "مانهوا", "قراءة مانجا", "manga", "manhwa", "manhua", "mangatak"],
  openGraph: {
    type: "website",
    locale: "ar_EG",
    siteName: "MANGATAK",
  },
  verification: {
  google: "QGrIkK3aQQBZiPuNNE7blPPwFxgtMNuItLD7Qm34W9Y", 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script src="https://quge5.com/88/tag.min.js" data-zone="250913" async data-cfasync="false"></script>
      </head>
      <body>
        <div id="app-wrapper">
          {children}
        </div>
      </body>
    </html>
  );
}
