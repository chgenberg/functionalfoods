'use client';

import { useT } from '@/app/lib/i18n/LanguageProvider';
import FaqAccordion from '@/app/components/FaqAccordion';

export default function QAPage() {
  const t = useT();

  return (
    <>
      <FaqAccordion
        variant="page"
        title={t('qa.title','Vanliga frågor & svar')}
        subtitle={t('qa.subtitle','Hitta snabbt svar på dina frågor om Functional Foods')}
        showSearch
      />

      {/* Contact Support */}
      <div className="max-w-4xl mx-auto px-4 pb-10">
        <div className="mt-4 bg-gray-50 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('qa.noAnswerTitle','Hittade du inte svaret?')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('qa.noAnswerSubtitle','Kontakta vår support så hjälper vi dig!')}
          </p>
          <a
            href="mailto:info@functionalfoods.se"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium"
          >
            {t('qa.contact','Kontakta oss')}
          </a>
        </div>
      </div>
    </>
  );
}


