import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // استخدام رابط الموقع الفعلي أو الافتراضي
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mangatk.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',      // منع أرشفة صفحة الإدارة الرئيسية
        '/admin/*',    // منع أرشفة أي صفحة فرعية داخل لوحة التحكم
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`, // إرشاد محركات البحث لمكان خريطة الموقع
  };
}
