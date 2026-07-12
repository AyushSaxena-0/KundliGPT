import React from "react";
import Footer from "../../components/layout/Footer";

export default function PrivacyPage() {
  return (
    <div className="flex-1 flex flex-col bg-background select-none">
      <main className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-mutedText text-sm sm:text-md leading-relaxed font-sans">
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white mb-6">Privacy Policy</h1>
        <p className="text-xs text-mutedText mb-8">Last updated: July 11, 2026</p>

        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-bold font-display text-accent mb-2">1. Data Storage & Local Storage</h2>
            <p>
              Your privacy is our core value. All birth chart details (Name, Gender, Date of Birth, Time, Place of Birth) and conversation history transcripts are **stored locally** inside your web browser using HTML5 Local Storage. We do not own, operate, or maintain database servers to log your personal details or conversation histories.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold font-display text-accent mb-2">2. Processing via AI Services</h2>
            <p>
              To generate astrological advice, your birth parameters and current message context are securely transmitted over SSL/TLS to the Google Gemini API. Google processes this information in accordance with their developer API agreements. We do not use your inputs to train public foundational AI models.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold font-display text-accent mb-2">3. Feedback Submission</h2>
            <p>
              If you choose to submit a rating or comment via the feedback tool, this text and score are saved in an anonymized log file to help evaluate model performance. We do not attach emails, account profiles, or personal IDs to feedback records.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold font-display text-accent mb-2">4. Third-Party Links</h2>
            <p>
              Our application may contain links to external sites (such as GitHub). We do not control or assume responsibility for the privacy practices of external web assets.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold font-display text-accent mb-2">5. Updates to this Policy</h2>
            <p>
              We may revise this privacy statement occasionally. Continued usage of the application implies acceptance of the updated privacy clauses.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
