# 🚀 Production Checklist - Functional Foods

## ✅ **Klart för lansering**

### 📚 **Kursinnehåll**
- ✅ Functional Basics (6 veckor, 75+ recept)
- ✅ Functional Flow (6 veckor, 85+ recept)  
- ✅ Functional Energy (6 veckor, 85+ recept)
- ✅ Alla kostscheman från DOCX importerade
- ✅ Receptlänkar verifierade och fungerande
- ✅ Inköpslistor automatiskt genererade
- ✅ Premium/gratis recept korrekt kategoriserade

### 🎨 **Design & UX**
- ✅ Färgschema implementerat (#014421, #F3EFE3, #93C560, #FF7E70)
- ✅ Work Sans typsnitt globalt
- ✅ Lucide React ikoner genomgående
- ✅ Responsiv design för mobil/desktop
- ✅ Bildoptimering implementerad
- ✅ Ingrediens-länkar till råvaror

### 🛒 **E-handel**
- ✅ Stripe Checkout integrerad
- ✅ Varukorg-funktionalitet
- ✅ Order- och betalningshantering
- ✅ Webhook för betalningsbekräftelse
- ✅ Automatisk konto-skapande vid köp

## ⚠️ **Kräver konfiguration**

### 🔑 **Environment Variables (Railway)**
```bash
# Database
DATABASE_URL=postgresql://...

# Stripe (Production keys)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Mailchimp Transactional)
MAILCHIMP_TRANSACTIONAL_API_KEY=md-...

# Security
JWT_SECRET=your-secure-random-string
NEXTAUTH_SECRET=your-nextauth-secret

# AI Features (Optional)
OPENAI_API_KEY=sk-...

# Site URL
NEXT_PUBLIC_BASE_URL=https://functionalfoods.se
```

### 📧 **Email Setup (Kritiskt)**
1. **Skapa Mailchimp Transactional konto**
2. **Få API-nyckel** från Mailchimp dashboard
3. **Lägg till i Railway**: `MAILCHIMP_TRANSACTIONAL_API_KEY`
4. **Verifiera domän**: functionalfoods.se i Mailchimp
5. **Testa**: Kör `node scripts/test-review-system.js`

### 💳 **Stripe Production Setup**
1. **Aktivera Live Mode** i Stripe dashboard
2. **Få Live Keys** (sk_live_ och pk_live_)
3. **Konfigurera webhook**:
   - URL: `https://functionalfoods.se/api/webhooks/payment`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`
4. **Lägg till i Railway**: Live keys och webhook secret

### 🔐 **Security**
1. **Generera JWT_SECRET**: `openssl rand -hex 32`
2. **Generera NEXTAUTH_SECRET**: `openssl rand -hex 32`
3. **Lägg till i Railway**

## 🧪 **Testning före lansering**

### 💰 **Betalningsflow**
- [ ] Testa kortbetalning med Stripe test cards
- [ ] Verifiera orderbekräftelse-email
- [ ] Kontrollera konto-skapande för nya kunder
- [ ] Testa inloggningsuppgifter i email

### 📧 **Email-system**
- [ ] Testa orderbekräftelse med inloggningsuppgifter
- [ ] Testa recensionsbegäran-email (6 veckor senare)
- [ ] Verifiera email-länkar fungerar
- [ ] Kontrollera email-design i olika klienter

### 🎓 **Kursåtkomst**
- [ ] Köp alla tre kurser med testkonto
- [ ] Verifiera tillgång till alla kurssidor
- [ ] Testa kostscheman och receptlänkar
- [ ] Kontrollera inköpslistor
- [ ] Verifiera premium recept-åtkomst

### 📱 **Mobilanpassning**
- [ ] Testa alla sidor på mobil
- [ ] Verifiera touch-interaktioner
- [ ] Kontrollera bildladdning
- [ ] Testa checkout-flow på mobil

## 🚨 **Kritiska steg före lansering**

### 1. **Ta bort utvecklingsdata**
```bash
# Kör dessa skript för att rensa
node scripts/remove-test-accounts.js
node scripts/verify-production-data.js
```

### 2. **Säkerhetsgranskning**
- [ ] Alla API-endpoints har rätt autentisering
- [ ] Rate limiting aktiverat på känsliga endpoints
- [ ] CORS konfigurerat korrekt
- [ ] Ingen känslig data i logs

### 3. **Performance**
- [ ] Bildoptimering aktiverad
- [ ] Caching konfigurerat
- [ ] Database indexering verifierad
- [ ] Load testing genomfört

### 4. **Legal & Compliance**
- [ ] GDPR-compliance verifierad
- [ ] Cookie policy uppdaterad
- [ ] Användarvillkor granskade
- [ ] Integritetspolicy komplett

## 🎯 **Go-Live Checklista**

### Dag -1
- [ ] Backup av databas
- [ ] Verifiera alla environment variables
- [ ] Testa full checkout-flow
- [ ] Kontrollera email-leverans

### Go-Live Dag
- [ ] Deploy till production
- [ ] Verifiera healthchecks
- [ ] Testa första riktiga köp
- [ ] Övervaka logs för fel
- [ ] Bekräfta email-leverans

### Dag +1
- [ ] Granska alla transaktioner
- [ ] Kontrollera email-leverans rate
- [ ] Verifiera kundupplevelse
- [ ] Övervaka performance metrics

## 📞 **Support & Monitoring**

### 🔍 **Monitoring**
- Railway logs för server errors
- Stripe dashboard för betalningar
- Mailchimp för email-leverans
- Database queries via Prisma Studio

### 📧 **Kundtjänst**
- support@functionalfoods.se (konfigurerad)
- Admin-panel för orderhantering
- Recensionshantering via admin

## 🎉 **Lansering!**

När alla punkter är avklarade är ni redo att:
1. **Marknadsföra kurserna**
2. **Ta emot riktiga betalningar** 
3. **Leverera fantastisk kundupplevelse**
4. **Bygga er community**

**Lycka till med lanseringen! 🚀** 