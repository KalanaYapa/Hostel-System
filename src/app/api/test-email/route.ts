import { NextResponse } from "next/server";
import { Resend } from 'resend';

export async function GET() {
  try {
    const apiKey = process.env.EMAILAPI;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'EMAILAPI environment variable not set'
      }, { status: 500 });
    }

    const resend = new Resend(apiKey);

    console.log('Testing Resend with API key:', apiKey.substring(0, 10) + '...');

    const { data, error } = await resend.emails.send({
      from: 'Hostel Management System <noreply@spacesolutionsinternational.com>',
      to: ['spacesolutionsinternational@gmail.com'], // Your verified email
      subject: 'Test Email - Hostel Management System',
      html: '<p>This is a test email to verify Resend configuration.</p>',
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({
        success: false,
        error: error,
        apiKeyConfigured: true,
        apiKeyPrefix: apiKey.substring(0, 10)
      }, { status: 500 });
    }

    console.log('Email sent successfully:', data);
    return NextResponse.json({
      success: true,
      messageId: data?.id,
      message: 'Test email sent successfully to spacesolutionsinternational@gmail.com'
    });

  } catch (error) {
    console.error('Exception:', error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}
