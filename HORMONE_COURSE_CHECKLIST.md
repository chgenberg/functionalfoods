# Hormonell Balans - Kurs Verifieringschecklista

## ✅ Struktur & Paths
- [x] Mapp: `/app/dashboard/courses/functional-hormone/` existerar
- [x] Alla sidor använder `courseType="hormone"`
- [x] Inga gamla `/dashboard/courses/hormone/` paths finns kvar
- [x] `CourseNavigation` pekar på rätt basePath

## ✅ API Endpoints
- [x] `/api/admin/seed/hormone/week1-6/recipes` finns
- [x] `/api/admin/seed/hormone/week1-6/meal-plan` finns
- [x] `/api/admin/seed/hormone/week1-6/shopping-list` finns
- [x] `/api/meal-plans?course=hormone&week=X` hanteras korrekt
- [x] `/api/admin/shopping-lists/hormone/X` finns
- [x] `/api/shopping-list/hormone/X` finns (fallback)

## 📝 Data - Veckovis Innehåll

### Vecka 1
- [ ] Meal plan: Seedad i DB
- [ ] Shopping list: 71 items i DB
- [ ] Recipes: 18 recept seedade

### Vecka 2  
- [ ] Meal plan: Seedad i DB
- [ ] Shopping list: 93 items i DB
- [ ] Recipes: 13 recept seedade

### Vecka 3
- [ ] Meal plan: Seedad i DB
- [ ] Shopping list: Items i DB
- [ ] Recipes: 11 recept seedade (inkl. falafel, curry, scampi, pizza, burger, fruktsallad)

### Vecka 4
- [ ] Meal plan: Seedad i DB
- [ ] Shopping list: Items i DB
- [ ] Recipes: Behöver uppdateras

### Vecka 5
- [ ] Meal plan: Seedad i DB
- [ ] Shopping list: Items i DB
- [ ] Recipes: Behöver uppdateras

### Vecka 6
- [ ] Meal plan: Seedad i DB
- [ ] Shopping list: Items i DB
- [ ] Recipes: Behöver uppdateras

## 🧪 Funktionell Testning (Efter Deploy)

### Navigation
- [ ] `/dashboard/courses/functional-hormone` → redirectar till oversikt
- [ ] Översikt-sidan visar 6 veckor
- [ ] Klick på vecka → går till rätt week page
- [ ] Week navigation fungerar

### Inköpslistor
- [ ] Vecka 1: Visar ~71 items från DB
- [ ] Vecka 2: Visar ~93 items från DB
- [ ] Vecka 3-6: Visar items från DB
- [ ] Items grupperade per kategori
- [ ] Checkbox-funktionalitet fungerar

### Kostscheman
- [ ] Vecka 1-6: Visar meal plan från DB
- [ ] Favorit-funktionalitet fungerar
- [ ] Print-funktionalitet fungerar
- [ ] Länk till inköpslista fungerar

### Recept
- [ ] Recept laddas från DB
- [ ] Ingredienser visas korrekt
- [ ] Instruktioner visas korrekt
- [ ] Bilder visas

## 🚀 Status

**Klart:**
- ✅ Vecka 1-2: Kompletta recept
- ✅ Vecka 3: Kompletta recept
- ✅ Inköpslistor: Vecka 1-6 seedade
- ✅ Meal plans: Vecka 1-6 seedade

**Återstår:**
- ⏳ Vecka 4-6: Recept behöver uppdateras med detaljerade instruktioner
- ⏳ Funktionell testning efter deploy

**Nästa steg:**
1. Vänta på deploy (~3-5 min)
2. Testa inköpslistor live
3. Fortsätt med vecka 4-6 recept

