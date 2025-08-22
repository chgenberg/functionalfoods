const fs = require('fs');
const path = require('path');

const scrapedContentDir = path.join(process.cwd(), 'public', 'scraped_content_basic');

// Text patterns to remove (footer, navigation, cookie notices, etc.)
const patternsToRemove = [
  // Navigation and header
  /^.*Prenumerera\s*$/gm,
  /^.*Logga in\s*$/gm,
  /^.*Hem\s*$/gm,
  /^.*Kursutbud\s*$/gm,
  /^.*Artiklar\s*$/gm,
  /^.*Recept\s*$/gm,
  /^.*Kontakt\s*$/gm,
  /^.*Om oss\s*$/gm,
  /^.*0\s*$/gm,
  
  // Footer content
  /Massor av matglädje - gratis!.*/s,
  /Skriv upp dig på vårt nyhetsbrev.*/s,
  /Jag har tagit del av informationen.*/s,
  /Villkor och cookies.*/s,
  /Följ oss på sociala medier.*/s,
  /Instagram functionalfoods\.se.*/s,
  /Tiktok functionalfoods\.se.*/s,
  /©2025 - ULRIKAS KICKSTART AB.*/s,
  /Vi använder cookies.*/s,
  /Acceptera.*/s,
  /Neka.*/s,
  /Inställningar.*/s,
  /Close GDPR Cookie Settings.*/s,
  /Privacy Overview.*/s,
  /Strictly Necessary Cookies.*/s,
  /This website uses cookies.*/s,
  /Cookie information is stored.*/s,
  /Strictly Necessary Cookie should be enabled.*/s,
  /Enable or Disable Cookies.*/s,
  /If you disable this cookie.*/s,
  /Acceptera alla.*/s,
  /Spara ändringar.*/s,
  
  // Newsletter signup
  /Prenumerera på mitt nyhetsbrev!.*/s,
  /Fyll i din e-mailadress.*/s,
  /Email Address.*/s,
  /GDPR acceptans.*/s,
  /newsletter.*/s,
  
  // Social media and contact
  /Kontakt\s*$/gm,
  /functionalfoods\.se\s*$/gm,
  
  // Cookie and GDPR text
  /Vi använder cookies för att du ska få så bra funktion.*/s,
  /Du kan alltid ändra dina inställningar.*/s,
  /Genom att acceptera godkänner du användning.*/s,
  
  // Duplicate titles
  /^Functional foods\s*$/gm,
  /^Frågor och svar\s*$/gm,
];

// Additional cleanup patterns
const additionalCleanup = [
  // Remove multiple consecutive newlines
  /\n{3,}/g,
  // Remove leading/trailing whitespace
  /^\s+|\s+$/g,
  // Remove empty lines at start
  /^\n+/,
  // Remove multiple spaces
  /  +/g,
];

function cleanContent(content) {
  let cleaned = content;
  
  // Remove all unwanted patterns
  patternsToRemove.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Apply additional cleanup
  additionalCleanup.forEach(pattern => {
    if (pattern.toString().includes('n{3,}')) {
      cleaned = cleaned.replace(pattern, '\n\n');
    } else if (pattern.toString().includes('  +')) {
      cleaned = cleaned.replace(pattern, ' ');
    } else {
      cleaned = cleaned.replace(pattern, '');
    }
  });
  
  // Split into lines and remove common footer/navigation lines
  const lines = cleaned.split('\n');
  const cleanedLines = lines.filter(line => {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) return false;
    
    // Skip navigation items
    if (['Hem', 'Kursutbud', 'Artiklar', 'Recept', 'Kontakt', 'Om oss', '0'].includes(trimmed)) {
      return false;
    }
    
    // Skip social media links
    if (trimmed.includes('functionalfoods.se') && trimmed.length < 30) {
      return false;
    }
    
    // Skip copyright and cookie text
    if (trimmed.includes('©2025') || 
        trimmed.includes('ULRIKAS KICKSTART') || 
        trimmed.includes('cookies') ||
        trimmed.includes('GDPR') ||
        trimmed.includes('Privacy') ||
        trimmed.includes('Acceptera') ||
        trimmed.includes('Spara ändringar')) {
      return false;
    }
    
    // Skip newsletter signup
    if (trimmed.includes('nyhetsbrev') || 
        trimmed.includes('Email Address') ||
        trimmed.includes('newsletter')) {
      return false;
    }
    
    return true;
  });
  
  return cleanedLines.join('\n').trim();
}

async function cleanAllScrapedContent() {
  try {
    const files = await fs.promises.readdir(scrapedContentDir);
    const txtFiles = files.filter(file => file.endsWith('.txt'));
    
    console.log(`🧹 Cleaning ${txtFiles.length} scraped content files...`);
    
    for (const file of txtFiles) {
      const filePath = path.join(scrapedContentDir, file);
      const content = await fs.promises.readFile(filePath, 'utf-8');
      
      // Split at the separator line and only clean the content part
      const parts = content.split('--------------------------------------------------------------------------------');
      if (parts.length > 1) {
        const header = parts[0] + '--------------------------------------------------------------------------------\n';
        const bodyContent = parts[1];
        const cleanedBody = cleanContent(bodyContent);
        
        const finalContent = header + cleanedBody;
        await fs.promises.writeFile(filePath, finalContent, 'utf-8');
        
        console.log(`✅ Cleaned: ${file}`);
      } else {
        console.log(`⚠️  No separator found in: ${file}`);
      }
    }
    
    console.log('🎉 All files cleaned successfully!');
    
  } catch (error) {
    console.error('❌ Error cleaning files:', error);
  }
}

// Run the cleanup
cleanAllScrapedContent(); 