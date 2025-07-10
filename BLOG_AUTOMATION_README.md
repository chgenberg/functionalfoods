# Automatisk Blogginlägg-Generator

Detta system kan automatiskt generera och publicera blogginlägg om functional foods med hjälp av OpenAI.

## Funktioner

- **Automatisk generering**: Använder OpenAI GPT-4 för att skapa ~1000 ord långa blogginlägg
- **50+ ämnen**: Förkonfigurerade ämnen inom functional foods
- **SEO-optimerad**: Automatisk slug-generering och meta-beskrivningar
- **Duplikatskydd**: Kontrollerar att samma ämne inte publiceras flera gånger
- **Schemaläggning**: Kan köras automatiskt under dagtid
- **Manuell kontroll**: Admin-gränssnitt för att generera inlägg manuellt

## Konfiguration

### 1. Miljövariabler

Lägg till följande i din `.env.local` fil:

```env
# OpenAI API-nyckel för innehållsgenerering
OPENAI_API_KEY=din_openai_api_nyckel

# Säkerhetsnyckel för cron-jobs
CRON_SECRET=din_säkra_slumpmässiga_sträng

# Din webbplats URL
NEXTAUTH_URL=https://din-webbplats.com
```

### 2. OpenAI API-nyckel

1. Gå till [OpenAI Platform](https://platform.openai.com/)
2. Skapa ett konto och gå till API Keys
3. Generera en ny API-nyckel
4. Lägg till den i din `.env.local` fil

### 3. Cron-säkerhet

Generera en säker slumpmässig sträng för `CRON_SECRET`:

```bash
# Exempel på hur man genererar en säker nyckel
openssl rand -hex 32
```

## Användning

### Manuell generering

1. Gå till Admin → Blogg → AI Generator
2. Klicka på "Generera Blogginlägg Nu"
3. Systemet väljer ett slumpmässigt ämne och genererar innehåll

### Automatisk schemaläggning

#### Med Vercel Cron Jobs

Lägg till i din `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/auto-blog",
      "schedule": "0 */2 8-18 * * *"
    }
  ]
}
```

Detta kör jobbet var 2:a timme mellan 08:00-18:00.

#### Med extern cron-service

Konfigurera en cron-service (som cron-job.org eller EasyCron) att anropa:

```
GET https://din-webbplats.com/api/cron/auto-blog
Header: Authorization: Bearer DIN_CRON_SECRET
```

**Rekommenderad schema**: Varje timme under dagtid (08:00-18:00)

## API-endpoints

### `/api/generate-blog-post`

Genererar och publicerar ett blogginlägg.

**Metod**: POST  
**Headers**: `Authorization: Bearer CRON_SECRET`

**Svar**:
```json
{
  "success": true,
  "message": "Blogginlägg skapat och publicerat",
  "post": {
    "id": "post-id",
    "title": "Artikeltitel",
    "slug": "artikel-slug",
    "publishedAt": "2024-01-01T12:00:00Z"
  }
}
```

### `/api/cron/auto-blog`

Cron-endpoint med inbyggd logik för timing och slumpmässig körning.

**Metod**: GET (automatisk) eller POST (manuell)  
**Headers**: `Authorization: Bearer CRON_SECRET`

**Funktioner**:
- Kontrollerar att det är dagtid (08:00-18:00 svensk tid)
- 30% chans att köra (för att undvika för många inlägg)
- Anropar generate-blog-post vid framgång

## Ämnen

Systemet har 50+ förkonfigurerade ämnen inom functional foods, inklusive:

- Vad menas egentligen med "functional foods"?
- Probiotika vs. prebiotika: skillnader och synergieffekter
- Omega-3 från alger: hållbart alternativ till fiskolja
- Adaptogener 101 – ashwagandha, reishi & stress
- Betaglukaner i havre: därför sänker de kolesterol
- Och många fler...

## Säkerhet

- Alla API-anrop kräver giltig `Authorization` header
- Duplikatskydd förhindrar samma ämne från att publiceras flera gånger
- Innehåll genereras med professionell prompt för att säkerställa kvalitet
- Automatisk slug-generering hanterar svenska tecken korrekt

## Felsökning

### Vanliga problem

1. **"Unauthorized" fel**: Kontrollera att `CRON_SECRET` är korrekt konfigurerad
2. **OpenAI API fel**: Kontrollera att `OPENAI_API_KEY` är giltig och har kredit
3. **Ingen admin-användare**: Se till att det finns en användare med `role: 'admin'` i databasen
4. **Dubletter**: Systemet kontrollerar slug-dubletter automatiskt

### Loggar

Kontrollera serverloggar för detaljerad felsökningsinformation:

```bash
# För development
npm run dev

# För production
vercel logs
```

## Anpassning

### Lägg till nya ämnen

Redigera `blogTopics`-arrayen i `/api/generate-blog-post/route.ts`:

```typescript
const blogTopics = [
  'Ditt nya ämne här',
  // ... befintliga ämnen
];
```

### Ändra AI-prompt

Modifiera system-meddelandet i OpenAI-anropet för att anpassa tonläge och stil:

```typescript
{
  role: "system",
  content: `Din anpassade prompt här...`
}
```

### Justera timing

Ändra tidsintervallet i `/api/cron/auto-blog/route.ts`:

```typescript
// Ändra från 8-18 till dina önskade timmar
if (hour < 8 || hour > 18) {
  // ...
}
```

## Support

För teknisk support, kontakta utvecklingsteamet eller skapa ett issue i projektets repository. 