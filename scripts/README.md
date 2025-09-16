# Emoji Replacement Scripts

This directory contains scripts for replacing emojis with Lucide React icons throughout the website.

## Scripts

### `replace-emojis-v2.js` (Recommended)

The improved emoji replacement script that carefully replaces emojis with Lucide React icons while avoiding syntax errors.

**Features:**
- Replaces 44+ common emojis with appropriate Lucide icons
- Safely handles different contexts (JSX spans, object properties, strings)
- Automatically adds/updates Lucide React imports
- Avoids breaking string literals and object properties
- Provides detailed logging of changes

**Usage:**
```bash
node scripts/replace-emojis-v2.js
```

**What it replaces:**
- 🌱 → `<Sprout className="w-5 h-5 inline" />`
- 💪 → `<Zap className="w-5 h-5 inline" />`
- 🎯 → `<Target className="w-5 h-5 inline" />`
- 🥗 → `<Salad className="w-5 h-5 inline" />`
- 💡 → `<Lightbulb className="w-5 h-5 inline" />`
- 🏆 → `<Trophy className="w-5 h-5 inline" />`
- And many more...

### `replace-emojis.js` (Legacy)

The original emoji replacement script. Use `replace-emojis-v2.js` instead as it's more robust.

## Icon Mapping

The scripts map emojis to semantically appropriate Lucide React icons:

| Category | Emojis → Icons |
|----------|----------------|
| **Health & Wellness** | 🌱→Sprout, 💪→Zap, 🧬→Microscope, 🎯→Target, ⚡→Zap, 🌟→Star |
| **Food & Nutrition** | 🥗→Salad, 🍎→Apple, 🐟→Fish, 🥚→Egg, 🥛→Milk, 🥜→Nut |
| **Success & Achievement** | 🏆→Trophy, 🎉→PartyPopper |
| **Technology & Tools** | 💡→Lightbulb, 💳→CreditCard, 🛡️→Shield |
| **Elements** | 💧→Droplets, 🌊→Waves, 🔥→Flame |

## Safe Replacement Contexts

The script only replaces emojis in safe contexts:

1. **JSX span elements**: `<span className="dashboard-emoji">🌟</span>`
2. **Text size spans**: `<span className="text-2xl">🌟</span>`
3. **Standalone emojis in JSX** (not inside strings)
4. **Simple span elements**: `<span className="mr-2">💡</span>`

## What's NOT replaced

To avoid syntax errors, the script leaves emojis unchanged in:
- String literals in object properties (`title: "🎯 My Goal"`)
- Object property values (`icon: "🌟"`)
- Complex string contexts

These may need manual replacement depending on the specific use case.

## Dependencies

- `glob` - for finding files to process
- `lucide-react` - the icon library (should already be installed)

## Running the Script

1. Make sure you're in the project root directory
2. Run: `node scripts/replace-emojis-v2.js`
3. The script will process all `.tsx` and `.jsx` files in the `app/` directory
4. Check the output for a summary of changes made

## After Running

1. Test your application: `npm run build` and `npm run dev`
2. Review the changes in git: `git diff`
3. Manually adjust any icon sizes or styles as needed
4. Some emojis in strings may need manual replacement

## Example Output

```
🚀 Starting careful emoji replacement process...

✅ Updated: app/components/Header.tsx
✅ Updated: app/dashboard/courses/page.tsx
✅ Updated: app/mina-kurser/page.tsx

📊 Summary:
   Files processed: 242
   Files modified: 51
   Emoji mappings available: 44

🎉 Emoji replacement completed successfully!
``` 