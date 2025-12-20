// Edge Function Supabase pour envoyer un email de signalement via SMTP Infomaniak

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

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
    const smtpHost = Deno.env.get('SMTP_HOST') || 'mail.infomaniak.com'
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587')
    const smtpUser = Deno.env.get('SMTP_USER')
    const smtpPassword = Deno.env.get('SMTP_PASSWORD')
    const smtpFromEmail = Deno.env.get('SMTP_FROM_EMAIL') || smtpUser

    // Vérifier que les secrets sont configurés
    const missingSecrets = []
    if (!smtpUser) missingSecrets.push('SMTP_USER')
    if (!smtpPassword) missingSecrets.push('SMTP_PASSWORD')

    if (missingSecrets.length > 0) {
      const errorMessage = `SMTP credentials are not configured. Missing secrets: ${missingSecrets.join(', ')}. Please configure them in Supabase Dashboard > Settings > Edge Functions > Secrets.`
      console.error(errorMessage)
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          missingSecrets: missingSecrets,
          hint: 'Configure secrets in Supabase Dashboard > Settings > Edge Functions > Secrets'
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
    let emailBody = `Madame, Monsieur,

Je me permets de vous transmettre un signalement automatique généré via l'application Commune Plus, qui facilite la communication entre les habitants et la mairie.

Nom : ${signalementData.lastName} ${signalementData.firstName}
Commune : ${signalementData.commune}
Description du signalement : ${signalementData.description}`

    // Ajouter l'URL de la photo si disponible
    if (signalementData.photoUrl) {
      emailBody += `\n\nPhoto du signalement : ${signalementData.photoUrl}`
    }

    emailBody += `\n\nJe vous remercie pour votre attention et votre suivi.

Cordialement,
${signalementData.lastName} ${signalementData.firstName}

Envoyé via Commune Plus — L'application qui simplifie la communication entre habitants et mairie.`

    // Configurer le client SMTP
    // Le port 465 utilise SSL direct (plus fiable avec Deno)
    // Le port 587 utilise STARTTLS (peut causer des problèmes avec InvalidContentType)
    // Si possible, utilisez le port 465 pour éviter les problèmes TLS
    
    // Forcer l'utilisation du port 465 si disponible, sinon utiliser le port configuré
    const effectivePort = smtpPort === 465 ? 465 : (smtpPort === 587 ? 587 : smtpPort)
    
    const connectionConfig = {
      hostname: smtpHost,
      port: effectivePort,
      auth: {
        username: smtpUser,
        password: smtpPassword,
      },
      tls: true, // TLS activé pour les deux ports
    }

    console.log(`Connecting to SMTP server ${smtpHost}:${effectivePort} with TLS`)

    const client = new SMTPClient({
      connection: connectionConfig,
    })

    // Préparer l'adresse d'expéditeur
    // Utiliser l'email SMTP configuré comme expéditeur principal
    // L'email sera envoyé "au nom de" l'utilisateur via le nom d'affichage
    const fromEmail = smtpFromEmail
    
    // Préparer les options d'envoi
    const sendOptions = {
      from: `${signalementData.lastName} ${signalementData.firstName} <${fromEmail}>`,
      to: signalementData.mairieEmail,
      subject: emailSubject,
      content: emailBody,
    }

    // Ajouter Reply-To avec l'email de l'utilisateur si disponible
    // Cela permet à la mairie de répondre directement à l'utilisateur
    if (signalementData.email && signalementData.email.includes('@')) {
      sendOptions.replyTo = `${signalementData.lastName} ${signalementData.firstName} <${signalementData.email}>`
    }

    // L'URL de la photo Cloudinary est déjà incluse dans le corps de l'email (emailBody)
    // Pas de pièce jointe : l'URL est directement cliquable et accessible

    // Envoyer l'email
    await client.send(sendOptions)

    // Fermer la connexion SMTP
    await client.close()

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

