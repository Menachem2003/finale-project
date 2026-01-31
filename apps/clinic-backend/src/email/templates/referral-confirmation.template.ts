export function getReferralConfirmationTemplate(
  customerName: string,
  referralReason: string,
): { subject: string; html: string; text: string } {
  const subject = 'הפנייה שלך התקבלה - מרפאת שיניים';

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #2563eb; margin: 0; font-size: 24px;">מרפאת שיניים</h1>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 15px;">שלום ${customerName},</h2>
      
      <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
        הפנייה שלך התקבלה בהצלחה ונשמרה במערכת שלנו.
      </p>
      
      <div style="background-color: #f8fafc; border-right: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #475569; font-size: 14px;">
          <strong style="color: #1e293b;">נושא הפנייה:</strong> ${referralReason}
        </p>
      </div>
      
      <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
        נציג המרפאה יחזור אליך בהקדם האפשרי.
      </p>
      
      <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-top: 30px;">
        תודה על פנייתך,<br>
        <strong style="color: #1e293b;">צוות מרפאת שיניים</strong>
      </p>
    </div>
    
    <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; text-align: center;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        זהו אימייל אוטומטי, אנא אל תשיב עליו.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
שלום ${customerName},

הפנייה שלך התקבלה בהצלחה ונשמרה במערכת שלנו.

נושא הפנייה: ${referralReason}

נציג המרפאה יחזור אליך בהקדם האפשרי.

תודה על פנייתך,
צוות מרפאת שיניים
  `.trim();

  return { subject, html, text };
}
