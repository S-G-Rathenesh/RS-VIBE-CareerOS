import React, { useEffect } from 'react'

export const TermsOfServicePage: React.FC = () => {
  useEffect(() => {
    document.title = 'Terms of Service | RS Vibe Career'
  }, [])

  return (
    <div className="flex flex-col max-w-4xl mx-auto py-12 gap-8 text-white">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl sm:text-5xl font-black gradient-text">Terms of Service</h1>
        <p className="text-gray-400 text-sm">Last Updated: August 2026</p>
      </div>

      <div className="flex flex-col gap-8 text-gray-300 leading-relaxed font-sans">
        
        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using RS Vibe CareerOS ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-white">2. Description of the Service</h2>
          <p>
            RS Vibe CareerOS provides an AI-powered resume and portfolio building platform. The Service allows users to create, host, and share professional portfolios, track job applications, and generate optimized resumes.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-white">3. User Accounts</h2>
          <p>
            To use certain features of the Service, you must register for an account. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-white">4. Portfolio and Public Content</h2>
          <p>
            You retain all your ownership rights in the content you upload and create (your "Content"). By publishing a public portfolio, you grant us the right to display, host, and serve your Content to visitors on the internet. You are solely responsible for the accuracy and legality of the Content you choose to publish.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-white">5. Prohibited Activities</h2>
          <p>
            You agree not to engage in any of the following prohibited activities:
          </p>
          <ul className="list-disc list-inside flex flex-col gap-1 ml-2">
            <li>Using the Service for any illegal purpose or in violation of any local, state, national, or international law.</li>
            <li>Uploading content that infringes upon the intellectual property rights or privacy rights of others.</li>
            <li>Attempting to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers running the Service.</li>
            <li>Uploading malicious code, viruses, or deploying automated systems ("bots") to excessively scrape or spam the Service.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-white">6. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of RS Vibe CareerOS and its licensors. The Service is protected by copyright, trademark, and other laws.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-white">7. Third-Party Services</h2>
          <p>
            Our Service integrates with third-party services (such as Google for authentication and Groq for AI generation). Your use of these third-party services is governed by their respective Terms of Service and Privacy Policies. We are not responsible for the content or practices of any third-party websites or services.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-white">8. Service Availability</h2>
          <p>
            We strive to ensure maximum uptime, but we do not guarantee that the Service will be uninterrupted, secure, or available at any particular time or location. We reserve the right to modify, suspend, or discontinue the Service at any time without notice.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-white">9. Account Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms of Service. Upon termination, your right to use the Service will immediately cease.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-white">10. Disclaimer and Limitation of Liability</h2>
          <p>
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. In no event shall RS Vibe CareerOS, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-white">11. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-white">12. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <a href="mailto:ratheneshsg@gmail.com" className="text-primary-400 hover:text-primary-300 transition-colors w-fit">
            ratheneshsg@gmail.com
          </a>
        </section>

      </div>
    </div>
  )
}
