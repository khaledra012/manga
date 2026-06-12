'use client';

import { useEffect } from 'react';
import { getOrCreateSessionId, getChapterById } from '@/lib/api';

interface ChapterViewTrackerProps {
  chapterId: string;
}

/**
 * مكون غير مرئي — يُرسل طلب مشاهدة الفصل مرة واحدة فقط لكل جلسة
 * يعمل على جانب العميل فقط حتى يستطيع قراءة localStorage
 */
export default function ChapterViewTracker({ chapterId }: ChapterViewTrackerProps) {
  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    // إرسال الـ session_id مع الطلب — الباك اند سيحدد هل يعد المشاهدة أم لا
    getChapterById(chapterId, sessionId).catch(() => {
      // تجاهل الأخطاء هنا — الصفحة محملة بالفعل من الـ Server Component
    });
  }, [chapterId]);

  // لا يعرض أي شيء
  return null;
}
