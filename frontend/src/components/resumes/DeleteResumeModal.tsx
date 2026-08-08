import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '../common/Button'
import { Card } from '../common/Card'

interface DeleteResumeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  resumeTitle: string
  isDeleting?: boolean
}

export const DeleteResumeModal: React.FC<DeleteResumeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  resumeTitle,
  isDeleting = false
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="pointer-events-auto w-full max-w-md"
            >
              <Card className="p-6 border border-white/15 shadow-2xl relative overflow-hidden glass-card">
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col gap-4 text-center items-center mt-2">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-400 mb-2">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  
                  <h2 className="text-xl font-bold text-white">Delete Resume?</h2>
                  
                  <div className="text-sm text-gray-400 space-y-2">
                    <p>Are you sure you want to delete <span className="text-white font-semibold">"{resumeTitle}"</span>?</p>
                    <p className="text-red-400/80 font-medium">This action permanently deletes this resume and all associated versions.</p>
                  </div>
                  
                  <div className="flex w-full gap-3 mt-6">
                    <Button variant="outline" className="flex-1" onClick={onClose} disabled={isDeleting}>
                      Cancel
                    </Button>
                    <Button 
                      variant="primary" 
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600" 
                      onClick={onConfirm}
                      isLoading={isDeleting}
                    >
                      Delete Resume
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
