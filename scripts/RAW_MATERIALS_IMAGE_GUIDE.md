# 🖼️ Guide: Hitta bilder för råvaror

Det här är en guide för att automatiskt hitta och ladda ner bilder för alla 132 råvaror i databasen.

## 🆓 Kostnadsfria API-alternativ

### 1. **Unsplash API** (Rekommenderat)
- **Helt gratis** för kommersiell användning
- **50 requests/timme** för demo-nycklar
- **5000 requests/timme** för produktionsnycklar
- Registrera på: https://unsplash.com/developers

### 2. **Pixabay API**
- **Gratis** för kommersiell användning  
- **5,000 requests/timme** gratis
- Registrera på: https://pixabay.com/api/docs/

### 3. **Pexels API**
- **Gratis** för kommersiell användning
- **200 requests/timme** gratis
- Registrera på: https://www.pexels.com/api/

## 🚀 Snabbstart

### Steg 1: Skaffa API-nycklar
```bash
# Unsplash (rekommenderat)
1. Gå till https://unsplash.com/developers
2. Skapa ett konto och en app
3. Kopiera din "Access Key"

# Pixabay (backup)
1. Gå till https://pixabay.com/api/docs/
2. Registrera dig och få din API-nyckel
```

### Steg 2: Konfigurera API-nycklar
```bash
# Sätt environment variables
export UNSPLASH_ACCESS_KEY="din_unsplash_nyckel_här"
export PIXABAY_API_KEY="din_pixabay_nyckel_här"
```

### Steg 3: Kör bildskriptet
```bash
# Hitta bilder för alla råvaror
node scripts/findRawMaterialImages.js

# Kontrollera resultatet
cat scripts/raw-material-images-results.json
```

## 📋 Vad scriptet gör

1. **Hämtar alla råvaror** från databasen (132 st)
2. **Översätter svenska namn** till engelska för bättre sökresultat
3. **Söker bilder** via Unsplash och Pixabay API:er
4. **Sparar resultat** i en JSON-fil för granskning
5. **Respekterar rate limits** automatiskt
6. **Hoppar över** råvaror som redan har bilder

## 🔍 Sökstrategi

Scriptet använder flera söktermer per råvara:
```javascript
// Exempel för "Gurkmeja"
[
  "turmeric food ingredient",
  "fresh turmeric", 
  "organic turmeric",
  "turmeric"
]
```

## 📊 Förväntade resultat

Med 132 råvaror och gratis API-gränser:
- **Unsplash**: ~90% träffar för livsmedel
- **Pixabay**: ~85% träffar för livsmedel
- **Total tid**: ~15-20 minuter
- **Bilder hittade**: ~120+ av 132

## 🎯 Alternativa metoder

### A. Batch-ladda från Wikimedia Commons
```bash
# Gratis, open source bilder
# Perfekt för botaniska råvaror
python scripts/wikimedia_images.py
```

### B. Manuell kuratoring 
```bash
# För specifika råvaror som behöver bättre bilder
# Använd Creative Commons sök: https://search.creativecommons.org/
```

### C. Food API:er
```bash
# Spoon API har livsmedelsbilder
# 150 gratis requests/dag
# https://spoonacular.com/food-api
```

## 🔧 Troubleshooting

### Problem: "API key invalid"
```bash
# Kontrollera att nyckeln är korrekt
echo $UNSPLASH_ACCESS_KEY
# Eller redigera scriptet direkt
```

### Problem: "Rate limit exceeded"  
```bash
# Vänta 1 timme eller använd backup API
# Scriptet pausar automatiskt varje 10:e request
```

### Problem: "No images found"
```bash
# Vissa svenska råvaror kanske behöver manuell översättning
# Lägg till i swedishToEnglish objektet i scriptet
```

## 📝 Nästa steg efter körning

1. **Granska resultaten**: `scripts/raw-material-images-results.json`
2. **Ladda ner bilder**: Kör download-scriptet
3. **Uppdatera databasen**: Sätt imageUrl för varje råvara
4. **Optimera bilder**: Komprimera för snabbare laddning

## 💡 Tips för bästa resultat

- **Kör på kvällstid** (mindre API-trafik)
- **Använd flera API:er** för backup
- **Kontrollera bildlicenser** (alla föreslagna är kommersiellt OK)
- **Spara original-URL:er** för attribution om behövs

## 🎨 Bildkvalitet

Scriptet prioriterar:
- **Landscape-orientering** (passar bättre i UI)
- **Minimum 640px bredd** för skärpa
- **Food category** när möjligt
- **Högst rankade** bilder först

Med den här guiden bör du kunna hitta bilder för 90%+ av dina råvaror inom 20 minuter! 🚀 