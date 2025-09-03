# 🔑 Environment Variables Setup

## Current Domain Configuration
För att använda den nuvarande Railway-domänen innan migration till functionalfoods.se

## ✅ Du har redan dessa (PERFEKT!)
```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secure-random-string"
MAILCHIMP_TRANSACTIONAL_API_KEY="md-..."
STRIPE_SECRET_KEY="sk_live_..."  # Kontrollera att det är LIVE key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."  # Kontrollera att det är LIVE key
STRIPE_WEBHOOK_SECRET="whsec_..."
OPENAI_API_KEY="sk-..."
MAILCHIMP_API_KEY="your-mailchimp-api-key"
MAILCHIMP_AUDIENCE_ID="your-audience-id"
MAILCHIMP_SERVER_PREFIX="us6"
UNSPLASH_ACCESS_KEY="your-unsplash-access-key"
UNSPLASH_SECRET_KEY="your-unsplash-secret-key"
NODE_ENV="production"
```

## ⚠️ LÄGG TILL DENNA (KRITISK!)
```bash
# Site URL - För emails och redirects
NEXT_PUBLIC_BASE_URL="https://ulrika-functional-foods-production.up.railway.app"
```

## 🔧 Valfria tillägg
```bash
# För automatisk blogg-generering (valfritt)
CRON_SECRET="generate-with-openssl-rand-hex-32"
```

## 📧 Email-systemet fungerar så här:

### 1. Orderbekräftelse med inloggningsuppgifter
**Skickas automatiskt när:** Ny kund köper kurs
**Innehåller:**
- Orderdetaljer och pris
- Automatiskt genererat lösenord
- Inloggningslänk till kursdashboard
- Instruktioner för att ändra lösenord

### 2. Recensionsförfrågan
**Skickas automatiskt:** 6 veckor efter köp (när kursen är slutförd)
**Innehåller:**
- Personligt meddelande från Ulrika
- Länk till recensionsformulär
- Information om varför recensioner är viktiga

## 🧪 Testa email-systemet

Kör detta script för att skicka testmails till ch.genberg@gmail.com:

```bash
node scripts/test-emails-demo.js
```

## 🚀 Efter migration till functionalfoods.se

När ni migrerar domänen, uppdatera bara:
```bash
NEXT_PUBLIC_BASE_URL="https://functionalfoods.se"
```

Alla andra variabler kan förbli samma.

## ✅ Stripe Webhook Setup

Konfigurera webhook i Stripe Dashboard:
- **URL:** `https://ulrika-functional-foods-production.up.railway.app/api/webhooks/payment`
- **Events:** `checkout.session.completed`, `payment_intent.succeeded`

Efter domänmigration:
- **URL:** `https://functionalfoods.se/api/webhooks/payment` 