# Testkonton för Ulrika Functional Foods

## Översikt
Här är de testkonton som skapats för att testa olika användarroller och behörighetsnivåer i systemet.

## Testkonton

### 1. 🆓 Gratis Användare
- **Email:** `gratis@test.se`
- **Lösenord:** `gratis123`
- **Tillgång:** 
  - Endast gratis recept
  - Inga kurser
  - Kan se premium-recept men inte komma åt dem
  - Kan registrera sig för kurser

### 2. 🌊 Functional Flow Användare
- **Email:** `flow@test.se`
- **Lösenord:** `flow123`
- **Tillgång:**
  - Functional Flow kurs (2995 kr)
  - Alla premium recept
  - Alla kursmaterial och videor
  - Certifikat vid slutförande

### 3. 📚 Functional Basics Användare
- **Email:** `basics@test.se`
- **Lösenord:** `basics123`
- **Tillgång:**
  - Functional Basics kurs (1495 kr)
  - Alla premium recept
  - Grundläggande kursmaterial
  - Certifikat vid slutförande

### 4. 👑 Admin
- **Email:** `admin@functionalfoods.se`
- **Lösenord:** `admin123`
- **Tillgång:**
  - Administratörsrättigheter
  - Tillgång till admin-panelen
  - Kan hantera användare, kurser och innehåll

## Så här testar du

### Logga in
1. Gå till [hemsidan](https://ulrika-functional-foods-production.up.railway.app/)
2. Klicka på profil-ikonen (överst till höger)
3. Använd något av testkontona ovan

### Testa olika behörighetsnivåer

#### Gratis användare (gratis@test.se)
- Gå till [Recept](https://ulrika-functional-foods-production.up.railway.app/kunskapsbank/recept)
- Du ser alla recept men premium-recept är låsta
- Klicka på ett premium-recept - du får meddelande om att köpa kurs

#### Flow användare (flow@test.se)
- Gå till [Recept](https://ulrika-functional-foods-production.up.railway.app/kunskapsbank/recept)
- Du kan klicka på alla recept, inklusive premium
- Gå till [Mina kurser](https://ulrika-functional-foods-production.up.railway.app/mina-kurser)
- Du ser Functional Flow kursen

#### Basics användare (basics@test.se)
- Samma som Flow men med Functional Basics kurs istället

#### Admin (admin@functionalfoods.se)
- Gå till [Admin](https://ulrika-functional-foods-production.up.railway.app/admin)
- Du har tillgång till alla admin-funktioner

## Kursinformation

### Functional Flow (2995 kr)
- Avancerad kurs i functional foods och optimal hälsa
- 6 veckor med videor och PDF-material
- Veckovisa live Q&A sessioner
- Certifikat vid slutförande
- Livstidsåtkomst

### Functional Basics (1495 kr)
- Grundkurs i functional foods för nybörjare
- 4 veckor med grundläggande material
- Månadsvis Q&A
- Certifikat vid slutförande

## Teknisk information

### Databas
- Testkontona skapas via `prisma/seed.js`
- Köp lagras i `Purchase` tabellen
- Kurser lagras i `CourseProduct` tabellen

### Behörighetskontroll
- Recept: Kontrolleras via `userAccess` i API:et
- Kurser: Kontrolleras via `Purchase` relationer
- Premium-innehåll: Kräver minst en köpt kurs

### Återskapa testkonton
Om du behöver återskapa testkontona:
```bash
npx prisma db seed
```

---

*Skapad: 2025-07-08*
*Uppdaterad: 2025-07-08* 