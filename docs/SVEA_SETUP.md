# Svea Checkout Integration Guide

## Vad du behöver göra

### 1. Sätt upp Environment Variables i Railway

Du behöver konfigurera **3 environment variables** i Railway:

#### För TESTMILJÖ (development/staging):
```env
SVEA_MERCHANT_ID=din_merchant_id_här
SVEA_SECRET_WORD=din_stage_secret_nyckel_här
SVEA_TEST_MODE=true
```

#### För PRODUKTIONSMILJÖ:
```env
SVEA_MERCHANT_ID=din_merchant_id_här          # SAMMA som test
SVEA_SECRET_WORD=din_prod_secret_nyckel_här   # ANNAN än test
SVEA_TEST_MODE=false                          # eller låt vara osatt
```

### 2. Vad betyder varje variabel?

- **`SVEA_MERCHANT_ID`**: Din merchant ID från Svea (samma för både test och produktion)
- **`SVEA_SECRET_WORD`**: Din secret API-nyckel från Svea
  - **Test**: Använd stage-nyckeln (för `checkoutapistage.svea.com`)
  - **Produktion**: Använd prod-nyckeln (för `checkoutapi.svea.com`)
- **`SVEA_TEST_MODE`**: 
  - `true` = Använder testmiljö (`checkoutapistage.svea.com`)
  - `false` eller osatt = Använder produktion (`checkoutapi.svea.com`)

### 3. Var hittar du dina credentials?

1. Logga in på **Svea Payment Admin**: https://paymentadmin.svea.com
2. Gå till **Integration > API Keys**
3. Du kommer se:
   - **Merchant ID**: En siffra (samma för test och produktion)
   - **Secret Word (Stage/Test)**: En lång sträng för testmiljö
   - **Secret Word (Production)**: En annan lång sträng för produktion

### 4. Så här konfigurerar du i Railway

#### Steg-för-steg:

1. **Logga in på Railway** och öppna ditt projekt
2. Gå till **Variables** (i vänstermenyn)
3. Lägg till variablerna en i taget:

   **För TESTMILJÖ:**
   ```
   Name: SVEA_MERCHANT_ID
   Value: [din merchant ID]
   
   Name: SVEA_SECRET_WORD
   Value: [din STAGE secret nyckel]
   
   Name: SVEA_TEST_MODE
   Value: true
   ```

   **För PRODUKTION:**
   ```
   Name: SVEA_MERCHANT_ID
   Value: [din merchant ID]
   
   Name: SVEA_SECRET_WORD
   Value: [din PRODUCTION secret nyckel]
   
   Name: SVEA_TEST_MODE
   Value: false
   ```

4. **Deploya om** efter att du lagt till variablerna (Railway gör detta automatiskt när du ändrar variables)

### 5. Verifiera att det fungerar

Efter att du har konfigurerat variablerna och deployat:

1. **Besök**: `https://din-domain.se/api/debug/svea-config`
2. Du bör se:
   ```json
   {
     "configured": true,
     "environment": {
       "SVEA_MERCHANT_ID": "SET (X chars)",
       "SVEA_SECRET_WORD": "SET (X chars)",
       "SVEA_TEST_MODE": "true" eller "false"
     },
     "baseUrl": "https://checkoutapistage.svea.com" eller "https://checkoutapi.svea.com"
   }
   ```

### 6. Brandvägg/IP-whitelisting

**Du behöver INTE göra något** med IP-whitelisting. Svea kräver ingen särskild IP-whitelistning.

**Men**: Om din brandvägg (eller Railway) blockerar utgående HTTPS-trafik, måste du säkerställa att:
- Utgående HTTPS-trafik till `checkoutapistage.svea.com` och `checkoutapi.svea.com` är tillåten
- Om din brandvägg kräver IP-intervall, tillåt dessa:
  - `193.13.207.0/24`
  - `193.105.138.0/24`

(Detta är normalt inte ett problem på Railway, men kan vara relevant om du kör på egen infrastruktur)

## Sammanfattning

**Vad du behöver göra:**
1. ✅ Hämta dina credentials från Svea Payment Admin
2. ✅ Lägg till `SVEA_MERCHANT_ID`, `SVEA_SECRET_WORD` och `SVEA_TEST_MODE` i Railway
3. ✅ Använd **stage-nyckel** när `SVEA_TEST_MODE=true`
4. ✅ Använd **prod-nyckel** när `SVEA_TEST_MODE=false`
5. ✅ Verifiera att det fungerar via `/api/debug/svea-config`

**Vad du INTE behöver göra:**
- ❌ Konfigurera IP-whitelisting (behövs inte)
- ❌ Konfigurera något i Sveas adminpanel för API-åtkomst (hanteras automatiskt)

## Test Cards (när SVEA_TEST_MODE=true)

| Resultat | Korttyp    | Kortnummer           | CVV  | Utgångsdatum |
|----------|------------|----------------------|------|--------------|
| Godkänd  | Visa       | 4916-4232-3977-8102 | Valfritt | Valfritt framtida |
| Godkänd  | Mastercard | 5392-1273-3201-0533 | Valfritt | Valfritt framtida |

## API Endpoints

### Skapa checkout
- **Endpoint:** `POST /api/checkout/svea-v2`
- **Request:**
```json
{
  "items": [
    {
      "id": "functional-basics",
      "name": "Functional Basics",
      "price": 499,
      "quantity": 1,
      "type": "course"
    }
  ],
  "customer": {
    "email": "customer@example.com",
    "name": "John Doe"
  },
  "couponCode": "OPTIONAL"
}
```

### Webhook
Svea kommer POST:a till: `https://din-domain.se/api/webhooks/svea-v2`

## Artikelnummer

Mappade till Sveas system:

| Kurs                    | Artikelnummer |
|-------------------------|---------------|
| Functional Basics       | 21122        |
| Functional Flow         | 21127        |
| Functional Energy       | 21128        |

## Troubleshooting

### "Missing Svea credentials"
- Kontrollera att alla tre variabler är satta i Railway
- Verifiera att du har deployat efter att ha lagt till variablerna
- Kontrollera `/api/debug/svea-config` för detaljerad status

### "Svea API Error (401)"
- Kontrollera att du använder rätt secret nyckel för rätt miljö
- Verifiera att `SVEA_TEST_MODE` matchar vilken nyckel du använder
- Stage nyckel = `SVEA_TEST_MODE=true`
- Prod nyckel = `SVEA_TEST_MODE=false`

### "Invalid response from Svea"
- Kontrollera att dina callback URLs är korrekta
- Verifiera att domänen är registrerad hos Svea support
