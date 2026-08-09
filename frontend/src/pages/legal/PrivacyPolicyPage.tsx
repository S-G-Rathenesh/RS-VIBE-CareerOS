import React, { useEffect } from 'react'

export const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | RS Vibe Career'
  }, [])

  return (
    <div className="flex flex-col max-w-4xl mx-auto py-12 gap-8 text-white">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl sm:text-5xl font-black gradient-text">Privacy Policy</h1>
        <p className="text-gray-400 text-sm">Last Updated: August 2026</p>
      </div>

      <div className="flex flex-col gap-8 text-gray-300 leading-relaxed font-sans">
        
        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-white">1. Information We Collect</h2>
          <p>
            When you use RS Vibe CareerOS, we collect information that you voluntarily provide to us. This includes your account information (such as your name, email address, and authentication data via Google or email/password) and the portfolio information/content you choose to upload (such as your resume details, job history, skills, and projects).
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-white">2. How We Use Your Information</h2>
          <p>
            We use your information solely to provide, maintain, and improve the RS Vibe CareerOS platform. Your account information is used for authentication and account management. Your portfolio information is used to generate your public portfolio and resume PDFs. We do not sell your personal data to third parties.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-white">3. Public Portfolio Information</h2>
          <p>
            If you choose to publish your portfolio, the information you include in it will be accessible to the public on the internet. This may include your name, professional history, contact links, and other details you decide to showcase. You can unpublish or delete your portfolio at any time from your dashboard.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-white">4. Data Storage and Security</h2>
          <p>
            Your data is stored securely using industry-standard database providers (MongoDB Atlas) and cloud platforms. We employ appropriate security measures to protect your information against unauthorized access, alteration, disclosure, or destruction. Media files you upload are securely stored via Cloudinary.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-white">5. Third-Party Services</h2>
          <p>
            We use a limited number of trusted third-party services to operate the platform:
          </p>
          <ul className="list-disc list-inside flex flex-col gap-1 ml-2">
            <li><strong>Google</strong>: For secure OAuth authentication.</li>
            <li><strong>Cloudinary</strong>: For hosting and optimizing media assets (profile pictures, project images).</li>
            <li><strong>Groq</strong>: To power our AI-assisted content generation features. Your prompts and relevant profile data are temporarily processed to generate responses.</li>
            <li><strong>Resend</strong>: For transactional emails such as account verification and password resets.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-white">6. Cookies and Local Storage</h2>
          <p>
            We use local storage and essential cookies to maintain your authenticated session, remember your UI preferences, and ensure the basic functionality of the application. We do not use intrusive tracking cookies for third-party advertising.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-white">7. Your Rights and Data Deletion</h2>
          <p>
            You have the right to access, update, or delete your personal information at any time. You can edit your portfolio data directly from your dashboard. If you wish to permanently delete your account and all associated data, you can do so in your account settings or by contacting us directly.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-white">8. Children's Privacy</h2>
          <p>
            Our service is intended for professionals and individuals seeking employment. We do not knowingly collect personal information from children under the age of 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-white">9. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-white">10. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
          </p>
          <a href="mailto:ratheneshsg@gmail.com" className="text-primary-400 hover:text-primary-300 transition-colors w-fit">
            ratheneshsg@gmail.com
          </a>
        </section>

      </div>
    </div>
  )
}
