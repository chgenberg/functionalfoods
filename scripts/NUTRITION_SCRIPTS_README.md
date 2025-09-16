# Näringsberäkningsskript

Dessa skript beräknar näringsdata för recept genom att använda Livsmedelsverkets officiella API och sparar resultatet i databasen.

## Skript

### 1. `calculate-all-nutrition.js`
**Huvudskriptet** som beräknar näringsdata för alla recept som saknar denna information.

**Funktioner:**
- Hämtar alla publicerade recept utan näringsdata
- Använder Livsmedelsverkets API för svenska ingredienser
- Beräknar näringsvärden per portion och per 100g
- Sparar resultatet i databasens `nutrition` fält
- Inkluderar retry-logik och rate limiting

**Kör:**
```bash
node scripts/calculate-all-nutrition.js
```

### 2. `test-nutrition-single.js`
**Testskript** för att testa näringsberäkning på ett enda recept (Bananplättar med keso och hallon).

**Kör:**
```bash
node scripts/test-nutrition-single.js
```

## Näringsdata som beräknas

För varje recept beräknas följande näringsvärden:

### Per portion:
- **Energi** (kalorier)
- **Protein** (gram)
- **Fett** (gram) 
- **Kolhydrater** (gram)
- **Fiber** (gram)
- **Socker** (gram)
- **Salt** (gram)

### Per 100g:
Samma värden men normaliserade per 100g för jämförelse.

## Datastruktur

Näringsdata sparas i `Recipe.nutrition` fältet som JSON:

```json
{
  "perServing": {
    "energy": 245,
    "protein": 12.5,
    "fat": 8.2,
    "carbohydrates": 28.1,
    "fiber": 3.4,
    "sugar": 15.2,
    "salt": 0.8
  },
  "per100g": {
    "energy": 180,
    "protein": 9.2,
    "fat": 6.0,
    "carbohydrates": 20.6,
    "fiber": 2.5,
    "sugar": 11.1,
    "salt": 0.6
  }
}
```

## Ingrediens-mappning

Skriptet innehåller en omfattande mappning av svenska ingredienser till Livsmedelsverkets söktermer:

- **Rensning**: Tar bort mängder, enheter och parenteser
- **Enhet-konvertering**: Konverterar dl, msk, tsk, kg etc. till gram
- **Speciella mappningar**: Mappar vanliga ingredienser till korrekta söktermer

## Rate Limiting & Felhantering

- **Fördröjning**: 200ms mellan ingredienser, 1s mellan recept
- **Retry-logik**: 3 försök per ingrediens med exponential backoff
- **Felhantering**: Loggar fel men fortsätter med nästa recept

## Användning

1. **Testa först:**
   ```bash
   node scripts/test-nutrition-single.js
   ```

2. **Kör full batch:**
   ```bash
   node scripts/calculate-all-nutrition.js
   ```

3. **Övervaka progress:**
   Skriptet loggar detaljerad information om varje steg.

## Tips

- Kör skriptet under lågtrafik-timmar för att undvika API-begränsningar
- Kontrollera loggar för ingredienser som inte hittas
- Lägg till fler mappningar i `normalizeIngredientName()` vid behov
- Backup databasen innan du kör full batch

## Resultat på webbsidan

Efter att skriptet har körts kommer näringsdata att visas automatiskt på receptsidorna i avsnittet "Näringsvärden per portion". 