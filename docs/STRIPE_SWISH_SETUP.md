# Swish via Stripe - Aktiveringsguide

## Översikt

Ja, du kan använda Swish via Stripe! Stripe har integrerat Swish som en betalningsmetod för svenska kunder. Detta gör det enkelt att erbjuda Swish-betalningar utan att behöva separata Swish-avtal eller teknisk integration.

## Fördelar med Swish via Stripe

- ✅ Ingen separat Swish-integration behövs
- ✅ Automatisk hantering av Swish-betalningar
- ✅ Stripe fungerar som "merchant of record"
- ✅ Swish visas automatiskt för svenska kunder i Stripe Checkout
- ✅ Samma checkout-flöde för alla betalningsmetoder

## Aktiveringssteg

### 1. Aktivera Swish i Stripe Dashboard

1. Logga in på ditt Stripe-konto: https://dashboard.stripe.com
2. Gå till **Settings** → **Payment methods**
3. Scrolla ner till **Swish** och klicka på **Activate**
4. Följ instruktionerna för att aktivera Swish för ditt konto

### 2. Konfigurera miljövariabel

Lägg till eller uppdatera miljövariabeln i din `.env.local` eller i Railway/Render:

```bash
ENABLE_SWISH=true
# eller
STRIPE_ENABLE_SWISH=true
```

### 3. Deployment

När du har aktiverat Swish i Stripe Dashboard och lagt till miljövariabeln:
- Pusha ändringarna till GitHub
- Vänta på deployment
- Testa ett köp med en svensk betalningsmetod

## Hur det fungerar

1. **Automatisk detektering**: Stripe detekterar automatiskt när en kund är från Sverige
2. **Valuta**: Swish visas endast när valutan är SEK (vilket redan är konfigurerat)
3. **UI**: Swish visas automatiskt i Stripe Checkout-sessionen för svenska kunder
4. **Betalning**: Kunden ser "Stripe Payments" som mottagare i Swish-appen, med ditt företagsnamn i meddelandefältet

## Kodändringar

Följande ändringar har gjorts:

### `app/api/checkout/route.ts`
- Stöd för Swish via miljövariabeln `ENABLE_SWISH` eller `STRIPE_ENABLE_SWISH`
- Swish läggs till i `payment_method_types` när aktiverat
- Felhantering om Swish inte är aktiverat i Stripe Dashboard

### `app/checkout/page.tsx`
- Uppdaterad beskrivning för att inkludera Swish som betalningsmetod
- Visar "Kort & Swish (Stripe)" som betalningsalternativ

## Testning

1. Aktivera Swish i Stripe Dashboard
2. Sätt miljövariabeln `ENABLE_SWISH=true`
3. Skapa en testcheckout med SEK som valuta
4. För svenska kunder kommer Swish att visas automatiskt som alternativ i Stripe Checkout

## Viktiga noteringar

- ⚠️ Stripe fungerar som "merchant of record" för Swish-betalningar
- 📱 "Stripe Payments" visas som mottagare i Swish-appen
- 💼 Ditt företagsnamn visas i meddelandefältet i Swish-appen
- 🏦 Kundens bankutdrag visar "Stripe Payments" som mottagare
- 💰 Valutan måste vara SEK för att Swish ska visas

## Dokumentation

- [Stripe Swish Documentation](https://docs.stripe.com/payments/swish)
- [Stripe Swish - Accept a Payment](https://docs.stripe.com/payments/swish/accept-a-payment)

## Support

Om du har problem med Swish-integrationen:
1. Kontrollera att Swish är aktiverat i Stripe Dashboard
2. Verifiera att miljövariabeln är satt korrekt
3. Kontrollera att valutan är SEK för alla produkter
4. Testa med en svensk IP-adress eller kund från Sverige

