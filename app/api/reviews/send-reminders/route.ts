import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/app/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, courseId } = body as { email: string; name: string; courseId: string };
    const courseName = courseId === 'functional-flow' ? 'Functional Flow' : 'Functional Basics';
    const reviewLink = `https://ulrika-functional-foods-production.up.railway.app/review?courseId=${encodeURIComponent(courseId)}`;
    const html = `
      <div style="font-family:Arial, sans-serif; color:#1a4324;">
        <h2>Hur upplevde du ${courseName}?</h2>
        <p>Vi uppskattar om du vill svara på några frågor. Det tar 2–3 minuter.</p>
        <p><a href="${reviewLink}" style="display:inline-block;background:#1a4324;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;">Lämna omdöme</a></p>
      </div>`;
    const ok = await (emailService as any).sendEmail({ to: email, toName: name, subject: `Hur var ${courseName}?`, html, tags: ['review-reminder'] });
    return NextResponse.json({ ok });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 });
  }
} 