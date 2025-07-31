# Mailchimp Transactional (Mandrill) Setup

## Översikt
Detta projekt använder Mailchimp Transactional (tidigare Mandrill) för att skicka transaktionella emails som:
- Orderbekräftelser
- Välkomstmeddelanden
- Lösenordsåterställning

## Steg 1: Skapa ett Mailchimp Transactional-konto

1. Gå till [Mailchimp Transactional](https://mailchimp.com/developer/transactional/)
2. Logga in med ditt Mailchimp-konto eller skapa ett nytt
3. Aktivera Transactional Email (kan kräva betalning)

## Steg 2: Få din API-nyckel

1. I Mailchimp Transactional dashboard, gå till **Settings** → **API Keys**
2. Klicka på **New API Key**
3. Ge nyckeln ett namn (t.ex. "Functional Foods Production")
4. Kopiera API-nyckeln

## Steg 3: Konfigurera miljövariabler

Lägg till följande i din `.env`-fil:

```bash
# Mailchimp Transactional
MAILCHIMP_TRANSACTIONAL_API_KEY="din-api-nyckel-här"
```

## Steg 4: Verifiera domän (Rekommenderat)

För bättre leveransbarhet:

1. Gå till **Settings** → **Domains**
2. Klicka **Add Domain**
3. Ange `functionalfoods.se`
4. Följ instruktionerna för att lägga till DNS-poster:
   - SPF-post
   - DKIM-post
   - Tracking-post (valfritt)

## Steg 5: Konfigurera avsändaradresser

1. Gå till **Settings** → **Sending Domains**
2. Lägg till `info@functionalfoods.se` som verifierad avsändare

## Email-typer som skickas

### 1. Orderbekräftelse
- **Trigger:** När en beställning genomförs
- **Innehåll:** Orderdetaljer, kursinformation, inloggningsuppgifter (vid ny användare)
- **Tags:** `order-confirmation`, `transactional`

### 2. Välkomstmail
- **Trigger:** När användare får tillgång till ny kurs
- **Innehåll:** Kursinformation, kom-igång-guide
- **Tags:** `welcome-email`, `course-access`

### 3. Lösenordsåterställning
- **Trigger:** När användare begär lösenordsåterställning
- **Innehåll:** Återställningslänk (giltig i 1 timme)
- **Tags:** `password-reset`, `transactional`

## Testning

För att testa email-funktionaliteten lokalt:

1. Använd Mailchimp Transactionals testläge
2. Eller sätt upp en test API-nyckel
3. Kontrollera loggarna i Mailchimp dashboard

## Övervakning

1. Gå till **Reports** i Mailchimp Transactional
2. Övervaka:
   - Leveransfrekvens
   - Öppningsfrekvens
   - Klickfrekvens
   - Bounces och klagomål

## Bästa praxis

1. **Använd mallar:** Överväg att flytta HTML-mallar till Mailchimp för enklare uppdateringar
2. **Hantera bounces:** Implementera webhook för att hantera bounces automatiskt
3. **Rate limiting:** Mailchimp har gränser - planera för bulk-utskick
4. **Backup:** Ha en backup email-tjänst (t.ex. SendGrid) för redundans

## Felsökning

### Email kommer inte fram
1. Kontrollera spam-mappen
2. Verifiera att domänen är korrekt konfigurerad
3. Kontrollera API-loggarna i Mailchimp

### API-fel
1. Verifiera att API-nyckeln är korrekt
2. Kontrollera att kontot har krediter/betalning
3. Se felmeddelanden i console.log

## Support

- [Mailchimp Transactional Docs](https://mailchimp.com/developer/transactional/docs/)
- [API Reference](https://mailchimp.com/developer/transactional/api/)
- Support: transactional-support@mailchimp.com 