# Stripe Setup Guide för Ulrika Functional Foods

## ✅ Status
- **API-nycklar**: Konfigurerade och fungerar ✅
- **Test mode**: Fungerar perfekt ✅
- **Checkout integration**: Klar ✅
- **Webhook**: Behöver konfigureras ⚠️

## 🔑 Miljövariabler

### Lokalt (.env.local)
```
STRIPE_SECRET_KEY=sk_test_your_test_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Production (.env på Railway)
```
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret_here
```

### Railway (Production)
Lägg till samma nycklar i Railway-miljön under Settings → Variables

## 🧪 Test Cards

### Lyckade betalningar
- **Visa**: `4242 4242 4242 4242`
- **Svensk kort**: `4000 0075 2000 0008`
- **CVC**: Valfri 3 siffror
- **Datum**: Valfritt framtida datum

### Avvisade kort
- **Generell avvisning**: `4000 0000 0000 0002`
- **Otillräckliga medel**: `4000 0000 0000 9995`

### 3D Secure
- **Kräver autentisering**: `4000 0000 0000 3220`

## 🔄 Checkout Flow

1. **Användaren** lägger till produkter i varukorgen
2. **Checkout-sidan** visar ordersammanställning
3. **Användaren väljer Stripe** som betalningsmetod
4. **API skapar PaymentIntent** via `/api/orders/create-payment`
5. **Redirect till Stripe** på `/checkout/stripe?client_secret=xxx`
6. **Användaren fyller i kortuppgifter**
7. **Stripe processar betalningen**
8. **Vid framgång** → redirect till `/checkout/success`
9. **Webhook bekräftar** betalningen i bakgrunden

## 🎯 Webhook Setup

### 1. Skapa webhook i Stripe Dashboard
1. Gå till [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Klicka på "Add endpoint"
3. Endpoint URL: 
   - **Lokalt**: Använd [ngrok](https://ngrok.com/) eller [localtunnel](https://localtunnel.github.io/www/)
   - **Production**: `https://din-domän.com/api/webhooks/payment`
4. Välj events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`

### 2. Kopiera Signing Secret
Efter att du skapat webhook:
1. Klicka på webhook
2. Under "Signing secret" klicka "Reveal"
3. Kopiera värdet (börjar med `whsec_`)
4. Lägg till i `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_ditt-värde-här
   ```

## 📦 API Endpoints

### Create Payment
```
POST /api/orders/create-payment
{
  "items": [{
    "id": "course-id",
    "name": "Course Name",
    "price": 299,
    "quantity": 1,
    "type": "course"
  }],
  "paymentMethod": "stripe",
  "customerEmail": "customer@example.com"
}
```

### Webhook Handler
```
POST /api/webhooks/payment
Headers: {
  "stripe-signature": "t=xxx,v1=xxx"
}
```

## 🚀 Go Live Checklist

### Före lansering:
- [ ] Testa alla betalningsflöden i test mode
- [ ] Verifiera att webhooks fungerar
- [ ] Kontrollera att success/error-sidor fungerar
- [ ] Testa med olika testkort
- [ ] Verifiera e-postbekräftelser

### Vid lansering:
- [ ] Byt till live API-nycklar i Railway
- [ ] Uppdatera webhook URL till production
- [ ] Aktivera Stripe Radar för bedrägerisskydd
- [ ] Konfigurera e-postmallar i Stripe

### Efter lansering:
- [ ] Gör en riktig testbetalning (och refundera)
- [ ] Kontrollera att webhook fungerar i production
- [ ] Övervaka första betalningarna noga

## 🛠️ Felsökning

### "Invalid API Key"
- Kontrollera att du använder rätt nycklar (test vs live)
- Verifiera att nycklarna är korrekt kopierade

### "No such payment_intent"
- Kontrollera att client_secret är korrekt
- Verifiera att du är i rätt mode (test/live)

### Webhook misslyckas
- Kontrollera signing secret
- Verifiera att endpoint URL är korrekt
- Kolla webhook logs i Stripe Dashboard

## 📞 Support

### Stripe Support
- Dashboard: https://dashboard.stripe.com/support
- Docs: https://stripe.com/docs
- Status: https://status.stripe.com/

### Teknisk implementation
- API Referens: https://stripe.com/docs/api
- Testing: https://stripe.com/docs/testing
- Webhooks: https://stripe.com/docs/webhooks

## 🔐 Säkerhet

**VIKTIGT**: Hårdkoda ALDRIG API-nycklar i koden! Använd alltid miljövariabler:

```javascript
// ✅ Rätt sätt
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ❌ Fel sätt
const stripe = new Stripe('sk_live_xxxxx');
``` 