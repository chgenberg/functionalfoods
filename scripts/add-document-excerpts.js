const fs = require('fs');
const path = require('path');

// Function to create excerpt from content
function createExcerpt(content, maxLength = 150) {
  // Remove HTML tags
  const textOnly = content.replace(/<[^>]*>/g, '');
  
  // Remove extra whitespace
  const cleaned = textOnly.replace(/\s+/g, ' ').trim();
  
  // Create excerpt
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  
  // Find the last complete word within maxLength
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

function addExcerpts() {
  const jsonFiles = [
    path.join(process.cwd(), 'public/data/knowledge-documents-flow.json'),
    path.join(process.cwd(), 'public/data/knowledge-documents-basic.json')
  ];

  jsonFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return;
    }

    // Backup original file
    const backupPath = filePath + '.bak-excerpt';
    fs.copyFileSync(filePath, backupPath);
    console.log(`✅ Backed up ${filePath}`);

    // Read and parse JSON
    const documents = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Update each document
    let updatedCount = 0;
    documents.forEach(doc => {
      if (!doc.excerpt && doc.content) {
        doc.excerpt = createExcerpt(doc.content);
        updatedCount++;
        console.log(`  📝 Added excerpt for: ${doc.title}`);
      }
    });

    // Save updated JSON
    fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));
    console.log(`✅ Updated ${updatedCount} documents in ${path.basename(filePath)}\n`);
  });

  console.log('✅ All excerpts have been added!');
}

// Run the update
addExcerpts(); 