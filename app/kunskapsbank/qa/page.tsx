'use client';

import { useT } from '@/app/lib/i18n/LanguageProvider';
import FaqAccordion from '@/app/components/FaqAccordion';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';

export default function QAPage() {
  const t = useT();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffdf3' }}>
      <FaqAccordion
        variant="page"
        title={t('qa.title','Vanliga frågor & svar')}
        subtitle={t('qa.subtitle','Hitta snabbt svar på dina frågor om Functional Foods')}
        showSearch
      />

      {/* Contact Support */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="bg-gradient-to-br from-[#014421] to-[#016630] rounded-2xl p-8 md:p-10 text-center shadow-xl"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-xl mb-6">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl md:text-2xl font-semibold text-white mb-3">
            {t('qa.noAnswerTitle','Hittade du inte svaret?')}
          </h3>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            {t('qa.noAnswerSubtitle','Kontakta vår support så hjälper vi dig!')}
          </p>
          <a
            href="mailto:info@functionalfoods.se"
            className="inline-flex items-center gap-2 bg-white text-[#014421] px-8 py-4 rounded-xl hover:bg-[#93C560] hover:text-white transition-all duration-300 font-semibold shadow-lg hover:shadow-xl group"
          >
            {t('qa.contact','Kontakta oss')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}
