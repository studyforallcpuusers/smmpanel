import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, token, userName } = await req.json()

    // In a real implementation, you would use a service like SendGrid, Mailgun, or AWS SES
    // For now, we'll just log the verification email details
    console.log('Sending verification email:', {
      to: email,
      subject: 'Verify your email address',
      verificationUrl: `${Deno.env.get('SITE_URL')}/verify-email?token=${token}`,
      userName
    })

    // Simulate email sending
    const emailData = {
      to: email,
      subject: 'Verify your email address - SMM Panel',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Verify Your Email Address</h2>
          <p>Hello ${userName},</p>
          <p>Thank you for signing up for our SMM Panel. Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SITE_URL')}/verify-email?token=${token}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6B7280;">${Deno.env.get('SITE_URL')}/verify-email?token=${token}</p>
          <p>This verification link will expire in 24 hours.</p>
          <p>If you didn't create an account with us, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">
            Best regards,<br>
            The SMM Panel Team
          </p>
        </div>
      `
    }

    // Here you would integrate with your email service provider
    // For example, with SendGrid:
    /*
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: emailData.to }],
          subject: emailData.subject
        }],
        from: { email: 'noreply@yoursmmpanel.com', name: 'SMM Panel' },
        content: [{
          type: 'text/html',
          value: emailData.html
        }]
      })
    })
    */

    return new Response(
      JSON.stringify({ success: true, message: 'Verification email sent' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})