// Edge Function Supabase pour envoyer un email de signalement via Resend

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Récupérer les variables d'environnement (secrets Supabase)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const resendFromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@commune-plus.fr'

    // Vérifier que les secrets sont configurés
    if (!resendApiKey) {
      const errorMessage = 'RESEND_API_KEY is not configured. Please configure it in Supabase Dashboard > Settings > Edge Functions > Secrets.'
      console.error(errorMessage)
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          missingSecrets: ['RESEND_API_KEY'],
          hint: 'Configure RESEND_API_KEY in Supabase Dashboard > Settings > Edge Functions > Secrets'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parser les données de la requête
    const signalementData = await req.json()

    // Valider les données requises
    if (!signalementData.firstName || !signalementData.lastName || !signalementData.commune || !signalementData.description || !signalementData.mairieEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Construire le contenu de l'email
    const emailSubject = 'Signalement automatique via Commune Plus'
    
    // Version texte de l'email
    let emailText = `Madame, Monsieur,

Je me permets de vous transmettre un signalement automatique généré via l'application Commune Plus, qui facilite la communication entre les habitants et la mairie.

Nom : ${signalementData.lastName} ${signalementData.firstName}
Commune : ${signalementData.commune}
Description du signalement : ${signalementData.description}`

    // Ajouter l'URL de la photo si disponible
    if (signalementData.photoUrl) {
      emailText += `\n\nPhoto du signalement : ${signalementData.photoUrl}`
    }

    emailText += `\n\nJe vous remercie pour votre attention et votre suivi.

Cordialement,
${signalementData.lastName} ${signalementData.firstName}

Envoyé via Commune Plus — L'application qui simplifie la communication entre habitants et mairie.`

    // Version HTML de l'email
    let emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Signalement automatique</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="color: #10b981; margin-top: 0;">Signalement automatique via Commune Plus</h1>
    <p>Madame, Monsieur,</p>
    <p>Je me permets de vous transmettre un signalement automatique généré via l'application Commune Plus, qui facilite la communication entre les habitants et la mairie.</p>
  </div>

  <div style="background-color: #ffffff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #374151; margin-top: 0; border-bottom: 2px solid #10b981; padding-bottom: 10px;">Détails du signalement</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; font-weight: bold; width: 40%;">Nom :</td>
        <td style="padding: 8px 0;">${signalementData.lastName} ${signalementData.firstName}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Commune :</td>
        <td style="padding: 8px 0;">${signalementData.commune}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Description :</td>
        <td style="padding: 8px 0;">${signalementData.description}</td>
      </tr>
      ${signalementData.photoUrl ? `
      <tr>
        <td style="padding: 8px 0; font-weight: bold;">Photo :</td>
        <td style="padding: 8px 0;"><a href="${signalementData.photoUrl}" style="color: #10b981; text-decoration: none;">Voir la photo</a></td>
      </tr>
      ` : ''}
    </table>
  </div>

  <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p>Cordialement,<br>${signalementData.lastName} ${signalementData.firstName}</p>
    <p>Envoyé via Commune Plus — L'application qui simplifie la communication entre habitants et mairie.</p>
  </div>
</body>
</html>
    `.trim()

    // Préparer les options d'envoi Resend
    const resendPayload: any = {
      from: `${signalementData.lastName} ${signalementData.firstName} <${resendFromEmail}>`,
      to: [signalementData.mairieEmail],
      subject: emailSubject,
      html: emailHtml,
      text: emailText
    }

    // Ajouter Reply-To avec l'email de l'utilisateur si disponible
    // Cela permet à la mairie de répondre directement à l'utilisateur
    if (signalementData.email && signalementData.email.includes('@')) {
      resendPayload.reply_to = signalementData.email
    }

    // Envoyer l'email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resendPayload)
    })

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json().catch(() => ({}))
      throw new Error(`Resend API error: ${resendResponse.status} ${resendResponse.statusText} - ${JSON.stringify(errorData)}`)
    }

    const resendData = await resendResponse.json()
    console.log('Email sent successfully via Resend:', resendData.id)

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send email' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

