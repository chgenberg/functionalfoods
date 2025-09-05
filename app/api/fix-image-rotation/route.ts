import { NextResponse } from 'next/server';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    console.log('🔄 Starting server-side image rotation fix...');

    const imageDirectories = [
      'public/Recept_complete2.0/images/_optimized',
      'public/Recept_complete/images/_optimized'
    ];

    let totalProcessed = 0;
    let totalFixed = 0;
    const results = [];

    for (const dir of imageDirectories) {
      const fullPath = path.join(process.cwd(), dir);
      
      if (!fs.existsSync(fullPath)) {
        results.push({ directory: dir, status: 'not_found' });
        continue;
      }

      const files = fs.readdirSync(fullPath);
      const webpFiles = files.filter(file => file.endsWith('.webp') && !file.includes('.backup'));
      
      let dirFixed = 0;
      
      for (const file of webpFiles.slice(0, 10)) { // Process only first 10 for testing
        const filePath = path.join(fullPath, file);
        totalProcessed++;
        
        try {
          const buffer = fs.readFileSync(filePath);
          const metadata = await sharp(buffer).metadata();
          
          // Check if rotation is needed
          let needsRotation = false;
          
          if (metadata.orientation && metadata.orientation !== 1) {
            needsRotation = true;
          } else if (metadata.width && metadata.height && metadata.width < metadata.height) {
            // Portrait images that might need rotation
            const aspectRatio = metadata.height / metadata.width;
            if (aspectRatio > 1.3) {
              needsRotation = true;
            }
          }
          
          if (needsRotation) {
            // Create backup if it doesn't exist
            const backupPath = filePath.replace('.webp', '.backup.webp');
            if (!fs.existsSync(backupPath)) {
              fs.copyFileSync(filePath, backupPath);
            }
            
            // Auto-rotate and save
            const rotatedBuffer = await sharp(buffer)
              .rotate() // Auto-rotate based on EXIF
              .webp({ quality: 85 })
              .toBuffer();
            
            fs.writeFileSync(filePath, rotatedBuffer);
            totalFixed++;
            dirFixed++;
          }
        } catch (error) {
          console.error(`Error processing ${file}:`, error);
        }
      }
      
      results.push({ 
        directory: dir, 
        status: 'processed', 
        files: webpFiles.length,
        fixed: dirFixed 
      });
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${totalProcessed} images, fixed ${totalFixed} rotations`,
      totalProcessed,
      totalFixed,
      results
    });

  } catch (error) {
    console.error('❌ Error fixing image rotations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fix image rotations', details: error },
      { status: 500 }
    );
  }
} 