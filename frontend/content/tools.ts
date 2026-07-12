export interface ToolData {
  slug: string;
  title: string;
  subtitle: string;
  introduction: string;
  explanation: string;
  howItWorks: string[];
  faqs: { question: string; answer: string }[];
  ctaText: string;
}

export const freeTools: Record<string, ToolData> = {
  "free-kundli": {
    slug: "free-kundli",
    title: "Free Kundli (Birth Chart)",
    subtitle: "Generate your personalized Vedic astrological birth chart.",
    introduction: "Your Kundli is a celestial snapshot of the heavens at the exact second you drew your first breath. It maps planetary configurations across the twelve houses of Vedic astrology.",
    explanation: "In Vedic astrology, the birth chart (Janma Kundli) outlines your cosmic DNA. By mapping the placements of the Sun, Moon, and nine primary planets (Grahas) across the zodiac signs, a Kundli reveals your personality, karmic lessons, strengths, and life timelines (Dashas).",
    howItWorks: [
      "Gather your exact birth coordinates: Name, Date, Time (accurate to the minute), and Place of Birth.",
      "Vedic calculations compute the Ascendant (Lagna) sign and planetary positions (sidereal system).",
      "The planetary placements are mapped across the 12 houses to outline your birth chart.",
      "Identify active Dasha timelines to determine favorable and challenging periods."
    ],
    faqs: [
      { question: "Why is birth time accuracy critical for Kundli calculation?", answer: "The ascendant sign shifts by approximately 1 degree every four minutes. An inaccurate birth time can change the ascendant and house placements entirely." },
      { question: "What is the difference between sidereal and tropical charts?", answer: "Sidereal astrology (Vedic) maps planets against actual astronomical constellations, accounting for the precession of the equinoxes. Tropical astrology (Western) aligns signs with seasons." }
    ],
    ctaText: "Generate your birth chart and discuss planetary configurations with the AI Astrologer."
  },
  "kundli-matching": {
    slug: "kundli-matching",
    title: "Kundli Matching (Horoscope Compatibility)",
    subtitle: "Verify relationship and marital compatibility using Vedic charts.",
    introduction: "Kundli Matching (Ashta Koota Milan) is the traditional Vedic method to evaluate marital compatibility, assessing emotional, spiritual, and physical harmony.",
    explanation: "This tool compares the moon configurations of both partners across 8 categories (Koottas) totaling 36 points (Gunas). A score above 18 Gunas suggests compatibility, while also checking for planetary blockages like Manglik Dosha.",
    howItWorks: [
      "Enter exact birth details for both partners.",
      "The engine calculates moon nakshatras and planetary alignments.",
      "The system computes the 36 Guna metrics (Ashta Koota).",
      "Audits compatibility results for Manglik Dosha and recommends constructive remedies (Upayas)."
    ],
    faqs: [
      { question: "Is a high Guna score a guarantee of a successful marriage?", answer: "No. Guna matching is only one component. The individual charts must also be analyzed for relationship longevity, mental temperament, and mutual respect." },
      { question: "What are the remedies if Manglik Dosha is detected?", answer: "Remedies focus on self-discipline, meditation, and charity to manage Mars' high energy constructively." }
    ],
    ctaText: "Check relationship alignments and request remedies from the AI Vedic Astrologer."
  },
  "career-guidance": {
    slug: "career-guidance",
    title: "Career & Vocation Guidance",
    subtitle: "Identify your vocational strengths and planetary wealth indicators.",
    introduction: "Vedic astrology examines the 10th house (Karma Bhava) and planetary rulers to determine your professional affinity and growth periods.",
    explanation: "Your professional life is guided by the sign and planets residing in or aspecting your 10th house, along with the Sun (soul purpose) and Mercury (intellect/commerce). Active Dasha cycles determine optimal career shifts or business ventures.",
    howItWorks: [
      "Input your birth parameters to determine the 10th house ruler.",
      "Assess Saturn's (Karma planet) placement and strength.",
      "Map current transits and Dasha cycles to find professional windows.",
      "Interpret results to select fields matching your cosmic profile."
    ],
    faqs: [
      { question: "Which house determines career in Vedic astrology?", answer: "The 10th house (Karma Bhava) is the primary house. The 2nd house (wealth) and 6th house (daily service) are also analyzed." },
      { question: "How does Saturn influence career success?", answer: "Saturn (Shani) represents work ethic and discipline. A strong Saturn brings success through perseverance and structural planning." }
    ],
    ctaText: "Ask our AI Astrologer detailed questions about career transits and business timelines."
  }
};
