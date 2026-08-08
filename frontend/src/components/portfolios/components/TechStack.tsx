import React from 'react'
import { motion } from 'framer-motion'

export const TechStack: React.FC<{ skills: string[] }> = ({ skills }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {skills.map((skill, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
          className="px-4 py-2 bg-surface-50 border border-white/10 rounded-xl text-sm font-semibold text-gray-300 shadow-sm hover:shadow-glow-primary hover:border-primary-500/50 hover:text-white transition-all cursor-default"
        >
          {skill}
        </motion.div>
      ))}
    </div>
  )
}
