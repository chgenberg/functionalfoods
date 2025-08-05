'use client';

import { motion } from 'framer-motion';

// Week 6 uses simpler components that are defined inline in the main page
// This file exists for consistency with other weeks

export const CompletionMessage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <h2 className="text-3xl font-bold text-primary mb-4">
        Grattis till din prestation!
      </h2>
      <p className="text-gray-700">
        Du har nu slutfört Functional Basics kursen.
      </p>
    </motion.div>
  );
}; 