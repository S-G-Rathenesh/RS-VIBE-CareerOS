/**
 * Generate a native text-based ATS-friendly PDF from resume data.
 * Uses @react-pdf/renderer (lazy-loaded) to produce real selectable text — NOT image-based.
 * The PDF engine is dynamically imported only when the user clicks Export PDF.
 */
export const exportResumeToPdf = async (resume: any, filename?: string): Promise<void> => {
  const sanitizedFilename = (filename || 'Resume').replace(/[^a-zA-Z0-9_ -]/g, '_')

  try {
    // Dynamic imports to code-split the heavy @react-pdf/renderer bundle
    const [{ pdf }, { createResumePdfDocument }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('../components/resumes/ResumePdfDocument'),
    ])

    const doc = createResumePdfDocument(resume)
    const blob = await pdf(doc).toBlob()

    // Trigger browser download
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${sanitizedFilename}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('[RS VIBE CareerOS] PDF export failed:', error)
    throw new Error('PDF export failed. Please try again.')
  }
}
