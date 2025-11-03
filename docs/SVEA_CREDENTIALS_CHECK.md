# Svea Credentials Verification Guide

## Kontrollera dina credentials

### 1. Verifiera att du har rätt nyckel

I Svea Payment Admin (https://paymentadmin.svea.com):
- Gå till **Integration > API Keys**
- Du ska se **TVÅ** olika "Secret Word":
  - **Secret Word (Stage/Test)** ← Använd denna för testmiljö
  - **Secret Word (Production)** ← Använd denna för produktion

### 2. Kopiera nyckeln korrekt

När du kopierar nyckeln från Svea Payment Admin:
- ✅ Kopiera hela nyckeln (brukar vara 80-90 tecken)
- ✅ Inga extra mellanslag i början eller slutet
- ✅ Inga radbrytningar
- ✅ Om nyckeln är på flera rader, kopiera allt och ta bort radbrytningar

### 3. Testa i Railway

I Railway Variables, sätt:
```
SVEA_MERCHANT_ID = 207552
SVEA_SECRET_WORD = [klistra in din STAGE/TEST nyckel här - ingen extra space]
SVEA_TEST_MODE = true
```

### 4. Vanliga problem

#### Problem: Extra mellanslag
- ❌ `SVEA_SECRET_WORD = " nyckel "` (med mellanslag)
- ✅ `SVEA_SECRET_WORD = "nyckel"` (utan mellanslag)

#### Problem: Radbrytningar
- ❌ Nyckeln har radbrytningar i mitten
- ✅ Ta bort alla radbrytningar, gör till en enda rad

#### Problem: Fel nyckel
- ❌ Använder produktions-nyckel med `SVEA_TEST_MODE=true`
- ✅ Använd test/stage-nyckel med `SVEA_TEST_MODE=true`

### 5. Kontakta Svea support

Om du har:
- ✅ Rätt Merchant ID (207552)
- ✅ Test-nyckel (inte prod)
- ✅ `SVEA_TEST_MODE=true`
- ✅ Inga extra spaces/line breaks
- ✅ Nyckeln är aktiverad i Svea Payment Admin

Men fortfarande får 401, kontakta Svea support:
- Email: support@svea.com
- Berätta att du får 401 även med test-nyckeln
- Ge dem Merchant ID: 207552
- Fråga om test-nyckeln är aktiverad

### 6. Alternativ: Verifiera nyckel manuellt

Om du vill testa nyckeln manuellt, kan du använda Postman eller curl:
```bash
# Test med curl (ersätt med dina värden)
curl -X POST https://checkoutapistage.svea.com/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Svea [base64(merchantId:sha512(requestBody + secret + timestamp))]" \
  -H "Timestamp: 2025-11-03 15:10" \
  -d '{"countryCode":"SE","currency":"SEK","locale":"sv-SE","merchantSettings":{"termsUri":"https://www.functionalfoods.se/anvandarvillkor","checkoutUri":"https://www.functionalfoods.se/checkout","confirmationUri":"https://www.functionalfoods.se/checkout/success/svea-v2","pushUri":"https://www.functionalfoods.se/api/webhooks/svea-v2"},"cart":{"items":[{"articleNumber":"TEST-001","name":"Test Product","quantity":1,"unitPrice":10000,"vatPercent":2500,"unit":"st"}]}}'
```

### 7. Debug-information

Efter att du har öppnat `/api/debug/svea-auth-test`, kontrollera:
- `secretWordLength`: Bör vara 80-90 tecken (82 är OK)
- `testMode`: Bör vara `true`
- `baseUrl`: Bör vara `checkoutapistage.svea.com`
- `secretWordFirst5`: Första 5 tecknen i nyckeln (för att verifiera att den är korrekt)
- `secretWordLast5`: Sista 5 tecknen i nyckeln (för att verifiera att den är korrekt)

Om dessa inte matchar vad du förväntar dig, kan nyckeln vara felaktig eller felaktigt kopierad.

