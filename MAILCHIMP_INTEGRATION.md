# Mailchimp E-commerce Integration Guide

Denna guide förklarar hur du konfigurerar Mailchimp E-commerce integration för att spåra konverteringar på hemsidan.

## Översikt

Mailchimp E-commerce integrationen spårar automatiskt alla köp och konverteringar som sker på hemsidan och skickar dessa till Mailchimp för analys och segmentering.

## Konfiguration

### 1. Skapa Mailchimp Store

Först behöver du skapa en E-commerce Store i Mailchimp:

1. Logga in på Mailchimp
2. Gå till **Audience** → **E-commerce** → **Stores**
3. Klicka på **Create Store**
4. Fyll i butiksnamn och URL (t.ex. "Functional Foods Store", "https://www.functionalfoods.se")
5. Notera **Store ID** som visas efter att butiken skapats

### 2. Hämta API-nycklar

1. Gå till **Account** → **Extras** → **API keys**
2. Skapa en ny API-nyckel om du inte redan har en
3. Notera **API Key** (formaterad som `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us1`)
4. Notera **Server Prefix** (den del som kommer efter strecket, t.ex. `us1`)

### 3. Konfigurera Environment Variables

Lägg till följande environment variables i din `.env` fil:

```env
# Mailchimp E-commerce Configuration
MAILCHIMP_API_KEY=your-api-key-here
MAILCHIMP_SERVER_PREFIX=us1
MAILCHIMP_STORE_ID=your-store-id-here
```

**Viktigt:** 
- `MAILCHIMP_API_KEY` är samma som du redan använder för audience-hantering
- `MAILCHIMP_SERVER_PREFIX` är samma som du redan använder (t.ex. `us1`, `us2`, etc.)
- `MAILCHIMP_STORE_ID` är det unika ID som Mailchimp tilldelar din store

### 4. Verifiera Konfiguration

Integrationen kommer automatiskt att börja spåra köp när alla environment variables är konfigurerade. Du kan verifiera att det fungerar genom att:

1. Göra ett testköp
2. Kontrollera Mailchimp dashboard → **Audience** → **E-commerce** → **Orders**
3. Köpet bör visas inom några sekunder

## Hur det fungerar

Integrationen spårar automatiskt köp från:

1. **Stripe-betalningar** - Via webhook `/api/webhooks/payment`
2. **Svea-betalningar** - Via webhook `/api/webhooks/svea-v2`
3. **Direkta köp** - Via `/api/purchases` endpoint

Varje köp spåras med:
- Order ID
- Kundinformation (email, namn)
- Produkter/kurser som köpts
- Totalt belopp
- Skatt, rabatt och frakt
- Orderdatum

## Funktioner

### Automatisk Kundskapning

Integrationen skapar automatiskt kunder i Mailchimp baserat på email-adresser. Om en kund redan finns uppdateras den istället.

### Purchase Tracking

Varje köp skickas till Mailchimp med fullständig information:
- Order ID
- Kundinformation
- Produktinformation
- Priser och kvantiteter
- Skatt och rabatter

### Felhantering

Om Mailchimp-tracking misslyckas påverkar det inte köpprocessen. Fel loggas i konsolen men köpet genomförs ändå.

## Mailchimp E-commerce Features

När integrationen är konfigurerad kan du använda Mailchimp's E-commerce features:

- **Purchase Segments** - Skapa segment baserat på köp-historik
- **Product Recommendations** - Rekommendera produkter baserat på tidigare köp
- **Abandoned Cart Emails** - (Kräver ytterligare implementation)
- **Revenue Tracking** - Se total försäljning och ROI
- **Customer Lifetime Value** - Analysera kundvärde över tid

## Ytterligare Resurser

- [Mailchimp E-commerce API Documentation](https://mailchimp.com/developer/marketing/api/e-commerce-stores/)
- [Mailchimp Integration Guide](https://mailchimp.com/help/about-integrations/)
- [E-commerce Features](https://mailchimp.com/features/e-commerce/)

## Support

Om du stöter på problem:

1. Kontrollera att alla environment variables är korrekt konfigurerade
2. Verifiera att Mailchimp Store ID är korrekt
3. Kontrollera server logs för felmeddelanden
4. Se till att Mailchimp API-nyckeln har rätt behörigheter

