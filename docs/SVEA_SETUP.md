# Svea Checkout Integration Setup Guide

## Översikt

Detta dokument beskriver hur du konfigurerar Svea Checkout för Ulrika Functional Foods e-handel.

## Miljövariabler

Lägg till följande miljövariabler i din `.env` fil:

```bash
# Svea Test/Staging Credentials
SVEA_MERCHANT_ID=your_test_merchant_id
SVEA_SECRET_WORD=your_test_secret_word
SVEA_TEST_MODE=true

# Svea Production Credentials (när redo för produktion)
SVEA_PROD_MERCHANT_ID=your_production_merchant_id
SVEA_PROD_SECRET_WORD=your_production_secret_word

# Optional: Force webhook validation in development
SVEA_WEBHOOK_VALIDATION=false
```

## Viktiga URL:er att konfigurera i Svea Merchant Portal

När du konfigurerar din Svea-merchant måste följande URL:er vara korrekt inställda:

### Test/Staging
- **Checkout URI**: `https://your-test-domain.com/checkout`
- **Confirmation URI**: `https://your-test-domain.com/checkout/success/svea-v2?checkoutOrderId={checkout.order.id}&orderId={merchantData}`
- **Terms URI**: `https://your-test-domain.com/anvandarvillkor`
- **Push URI (Webhook)**: `https://your-test-domain.com/api/webhooks/svea-v2`

### Produktion
- **Checkout URI**: `https://ulrikafunctionalfoods.com/checkout`
- **Confirmation URI**: `https://ulrikafunctionalfoods.com/checkout/success/svea-v2?checkoutOrderId={checkout.order.id}&orderId={merchantData}`
- **Terms URI**: `https://ulrikafunctionalfoods.com/anvandarvillkor`
- **Push URI (Webhook)**: `https://ulrikafunctionalfoods.com/api/webhooks/svea-v2`

## API Endpoints

### Nya endpoints (v2)
- `POST /api/checkout/svea-v2` - Skapar en ny checkout-session
- `POST /api/webhooks/svea-v2` - Tar emot webhooks från Svea
- `POST /api/checkout/verify-svea-v2` - Verifierar betalningsstatus
- `/checkout/svea` - Checkout-sida med Svea iframe
- `/checkout/success/svea-v2` - Success-sida efter genomförd betalning

### Gamla endpoints (kommer tas bort)
- `/api/checkout/svea`
- `/api/webhooks/svea`
- `/api/checkout/verify-svea`

## Test-flöde

1. **Skapa testorder**:
   - Gå till `/checkout`
   - Lägg till produkter i varukorgen
   - Fyll i kunduppgifter
   - Klicka "Gå till betalning"

2. **Svea Checkout**:
   - Du kommer till `/checkout/svea` med Svea's iframe
   - Använd Sveas testkortuppgifter:
     - Kortnummer: `4111 1111 1111 1111`
     - Utgångsdatum: Valfritt framtida datum
     - CVV: `123`

3. **Efter betalning**:
   - Du omdirigeras till `/checkout/success/svea-v2`
   - Ordern verifieras och användarkonto skapas om nödvändigt
   - Kurser blir tillgängliga i dashboard

## Webhook-hantering

Svea skickar webhooks för olika orderhändelser:

- `Final` / `Confirmed` - Betalning genomförd
- `Cancelled` - Beställning avbruten
- `Expired` - Beställning har gått ut

Webhooks verifieras med SHA-512 signatur: `hash(body + secretWord)`

## Felsökning

### Vanliga problem

1. **"Betalningssystemet är inte konfigurerat"**
   - Kontrollera att `SVEA_MERCHANT_ID` och `SVEA_SECRET_WORD` är satta

2. **401 Unauthorized från Svea API**
   - Verifiera att credentials är korrekta
   - Kontrollera att du använder rätt miljö (test/prod)

3. **Webhook signature validation fails**
   - Säkerställ att `SVEA_SECRET_WORD` är exakt samma som i Svea Merchant Portal
   - I utveckling, sätt `SVEA_WEBHOOK_VALIDATION=false` för att hoppa över validering

4. **Order skapas men användare får ingen access**
   - Kontrollera att webhook-URL:en är korrekt i Svea Merchant Portal
   - Verifiera att webhooks kommer fram (kolla logs)

## Migrering från gamla systemet

1. Uppdatera alla länkar från `/api/checkout/svea` till `/api/checkout/svea-v2`
2. Uppdatera webhook-URL i Svea Merchant Portal
3. Testa hela flödet i staging innan produktion
4. När allt fungerar, ta bort gamla endpoints

## Support

För teknisk support med Svea-integrationen:
- Svea Support: support@svea.com
- Svea Utvecklardokumentation: https://developers.svea.com/
