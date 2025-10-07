import * as XLSX from 'xlsx';
import * as path from 'path';

async function previewFile() {
  console.log('\n📄 PREVIEW CUSTOMER FILE\n');
  console.log('='.repeat(60));

  const filePath = path.join(process.cwd(), 'public', 'final_customers_2025.xlsx');
  
  console.log(`\n📂 Reading: ${filePath}\n`);
  
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log(`✅ Found ${data.length} rows\n`);
  console.log(`📋 Sheet name: "${sheetName}"\n`);
  
  // Show first row to see column names
  if (data.length > 0) {
    console.log('📊 Columns found:');
    const firstRow = data[0] as any;
    Object.keys(firstRow).forEach(key => {
      console.log(`   - ${key}: ${typeof firstRow[key]} (example: "${firstRow[key]}")`);
    });
    
    console.log('\n\n📋 First 5 rows:\n');
    data.slice(0, 5).forEach((row: any, i) => {
      console.log(`Row ${i + 1}:`);
      console.log(JSON.stringify(row, null, 2));
      console.log('');
    });
  }

  console.log('='.repeat(60));
  console.log('\n💡 Next step: Run import-customers-2025.ts to import these customers\n');
}

previewFile().catch(console.error);
