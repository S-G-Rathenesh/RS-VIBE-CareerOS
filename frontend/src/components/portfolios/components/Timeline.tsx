import React from 'react'
import { motion } from 'framer-motion'

interface TimelineItem {
  id: string
  title: string
  subtitle: string
  date: string
  description: string
}

export const Timeline: React.FC<{ items: TimelineItem[] }> = ({ items }) => {
  return (
    <div className="relative border-l border-white/20 ml-3 md:ml-6 space-y-8">
      {items.map((item, index) => (
        <motion.div 
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="relative pl-6 md:pl-8"
        >
          <div className="absolute w-3 h-3 bg-primary-500 rounded-full -left-[6.5px] top-1.5 shadow-[0_0_10px_rgba(var(--primary-500),0.5)]" />
          <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-1">
            <h4 className="text-lg font-bold text-white">{item.title}</h4>
            <span className="text-sm font-semibold text-primary-400">{item.date}</span>
          </div>
          <h5 className="text-md font-medium text-gray-300 mb-2">{item.subtitle}</h5>
          <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{item.description}</p>
        </motion.div>
      ))}
    </div>
  )
}
