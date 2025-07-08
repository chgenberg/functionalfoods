# Mailchimp Integration Setup

## Steg 1: Skapa ett Mailchimp-konto
Om du inte redan har ett, gå till [mailchimp.com](https://mailchimp.com) och skapa ett konto.

## Steg 2: Hämta dina API-uppgifter

### API-nyckel:
1. Logga in på Mailchimp
2. Gå till **Account** (klicka på din profil)
3. Välj **Extras** > **API keys**
4. Klicka på **Create A Key**
5. Kopiera din nya API-nyckel

### Audience ID (List ID):
1. Gå till **Audience** i huvudmenyn
2. Välj **All contacts**
3. Klicka på **Settings** > **Audience name and defaults**
4. Kopiera **Audience ID** (ser ut som: `a1b2c3d4e5`)

### Server Prefix:
Detta är delen efter bindestrecket i din API-nyckel.
- Om din API-nyckel är: `1234567890abcdef-us6`
- Då är ditt server prefix: `us6`

## Steg 3: Konfigurera miljövariabler

Skapa en fil som heter `.env.local` i projektets rot och lägg till:

```env
# Mailchimp Configuration
MAILCHIMP_API_KEY="din-api-nyckel-här"
MAILCHIMP_AUDIENCE_ID="ditt-audience-id-här"
MAILCHIMP_SERVER_PREFIX="ditt-server-prefix-här"
```

## Steg 4: Använd nyhetsbrevs-komponenten

Nu kan du använda `NewsletterSignup` komponenten var som helst på din sida:

```tsx
import NewsletterSignup from '@/app/components/NewsletterSignup';

// Standard version
<NewsletterSignup />

// Kompakt version (passar i sidebar/footer)
<NewsletterSignup variant="compact" />

// Hero version (stor och iögonfallande)
<NewsletterSignup 
  variant="hero"
  showName={true}
  title="Bli en del av vår community!"
  subtitle="Få exklusiva recept och hälsotips varje vecka"
/>
```

## Steg 5: Testa integrationen

1. Starta din utvecklingsserver: `npm run dev`
2. Gå till en sida där du lagt till komponenten
3. Försök prenumerera med en test-email
4. Kontrollera i Mailchimp att kontakten lagts till

## Mailchimp Automation Tips

### Välkomstmail:
1. Gå till **Automations** i Mailchimp
2. Skapa en **Welcome email** automation
3. Ställ in att den triggas när någon läggs till via API

### Taggar:
API:et lägger automatiskt till dessa taggar:
- `Website Signup`
- `Functional Foods`

Du kan använda dessa för att segmentera din lista.

### GDPR-compliance:
- Komponenten kräver att användaren accepterar integritetspolicyn
- Du kan aktivera double opt-in i Mailchimp för extra säkerhet

## Felsökning

### "Serverfel: Konfiguration saknas"
- Kontrollera att alla miljövariabler är korrekt ifyllda
- Starta om utvecklingsservern efter att du lagt till miljövariabler

### "Member Exists"
- Detta betyder att emailen redan finns i din lista
- API:et uppdaterar automatiskt befintliga kontakter

### API-fel
- Kontrollera att din API-nyckel är aktiv
- Verifiera att Audience ID är korrekt
- Se till att server prefix matchar din API-nyckel

## Säkerhet

- Håll **aldrig** din API-nyckel i klientkod
- Använd alltid server-side API routes
- Lägg till `.env.local` i `.gitignore` 