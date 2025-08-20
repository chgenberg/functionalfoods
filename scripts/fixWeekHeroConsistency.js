const fs = require('fs');
const path = require('path');

const courses = ['functional-basics', 'functional-flow'];

courses.forEach(course => {
  for (let week = 1; week <= 6; week++) {
    const filePath = path.join(__dirname, `../app/dashboard/courses/${course}/week/${week}/page.tsx`);
    
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Ensure Image import exists
      if (!content.includes("import Image from 'next/image'")) {
        content = content.replace(
          "import Link from 'next/link';",
          "import Link from 'next/link';\nimport Image from 'next/image';"
        );
      }
      
      // Replace any hero section with consistent structure
      const heroRegex = /<div className="relative h-\[\d+px\] md:h-\[\d+px\].*?<\/div>\s*(?:{\s*\/\*.*?\*\/\s*}\s*<div className="absolute bottom-0.*?<\/div>)?/s;
      
      const courseTitle = course.includes('flow') ? 'Functional Flow' : 'Functional Foods';
      
      const newHero = `<div className="relative h-[300px] md:h-[400px] bg-[#112A12] overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image 
            src="/Ulrika_portratt/udavidssondesktop.png" 
            alt="Ulrika Davidsson"
            fill
            className="object-cover opacity-40"
            priority
          />
        </div>
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Din ${courseTitle} Resa
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl"
          >
            {weekTitle}
          </motion.p>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => setShowVideoModal(true)}
            className="bg-[#014421] hover:bg-[#112A12] text-white px-8 py-4 rounded-full font-semibold flex items-center gap-3 transition-all shadow-lg"
          >
            <FiPlay className="w-5 h-5" />
            Se introduktionsvideo
          </motion.button>
        </div>

        {/* Help Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => setShowHelpGuide(true)}
          className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors z-10"
          title="Öppna hjälpguide"
        >
          <FiHelpCircle className="w-5 h-5 md:w-6 md:h-6" />
        </motion.button>
      </div>`;
      
      if (heroRegex.test(content)) {
        content = content.replace(heroRegex, newHero);
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed ${course} week ${week} hero section`);
      }
    }
  }
});

console.log('🎉 All week hero sections updated with consistent design!');
