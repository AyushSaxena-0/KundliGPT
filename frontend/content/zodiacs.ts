export interface ZodiacData {
  slug: string;
  name: string;
  element: string;
  ruler: string;
  sanskritName: string;
  overview: string;
  personality: string;
  strengths: string[];
  challenges: string[];
  relationships: string;
  career: string;
  education: string;
  health: string;
  faqs: { question: string; answer: string }[];
}

export const zodiacSigns: Record<string, ZodiacData> = {
  aries: {
    slug: "aries",
    name: "Aries",
    element: "Fire",
    ruler: "Mars (Mangal)",
    sanskritName: "Mesha",
    overview: "Aries (Mesha) is the first sign of the zodiac, representing new beginnings, vital energy, and pioneering initiatives.",
    personality: "Aries individuals are natural leaders. Driven by Mars, they possess immense courage, willpower, and enthusiasm. They approach life with a direct, action-oriented mindset, preferring to construct their own paths rather than follow established routes.",
    strengths: ["Courageous", "Determined", "Honest", "Confident", "Optimistic", "Passionate"],
    challenges: ["Impulsive", "Impatient", "Aggressive", "Quick-tempered", "Moody"],
    relationships: "In relationships, Aries partners are passionate, direct, and incredibly loyal. They require independence but offer warm affection and protectiveness. They align well with Leo, Sagittarius, and Libra.",
    career: "Aries thrives in dynamic, competitive settings. They excel as managers, entrepreneurs, military personnel, and rescue services, where quick decisions and pioneering initiatives are valued.",
    education: "Aries students excel when challenged. They perform well in competitive exams and sports, preferring applied studies and leadership roles in group projects.",
    health: "Aries rules the head and face. They are prone to headaches, high blood pressure, and minor physical burns or cuts. Regular cardiovascular activity and stress management are vital. *Disclaimer: Consult a medical practitioner for health diagnoses.*",
    faqs: [
      { question: "What is Aries' lucky day in Vedic astrology?", answer: "Tuesday (ruled by Mars) is considered highly auspicious for Aries (Mesha) individuals." },
      { question: "Which gemstone is recommended for Aries?", answer: "Red Coral (Moonga) is traditionally recommended to strengthen Mars' energy, subject to chart validation." }
    ]
  },
  taurus: {
    slug: "taurus",
    name: "Taurus",
    element: "Earth",
    ruler: "Venus (Shukra)",
    sanskritName: "Vrishabha",
    overview: "Taurus (Vrishabha) is the second sign of the zodiac, representing stability, material wealth, aesthetic tastes, and determination.",
    personality: "Taurus individuals are grounded, pragmatic, and artistic. Governed by Venus, they appreciate beauty, sensory comforts, and financial security. They are highly reliable, patient, and possess a calm temperament but can be exceptionally stubborn.",
    strengths: ["Reliable", "Patient", "Practical", "Devoted", "Responsible", "Stable"],
    challenges: ["Stubborn", "Possessive", "Uncompromising", "Lazy if unmotivated"],
    relationships: "Taurus values commitment and stability in partnerships. They are romantic, sensuous, and express affection through physical presence and practical gifts. They align well with Virgo, Capricorn, and Scorpio.",
    career: "Taurus excels in finance, luxury goods, arts, agriculture, and real estate, where methodical execution and long-term asset-building are rewarded.",
    education: "Taurus students are methodical and slow-paced learners who retain knowledge deeply. They excel in arts, management, and financial studies.",
    health: "Taurus rules the throat, neck, and thyroid. Prone to throat infections and thyroid issues. Proper diet and active lifestyles are important to manage weight. *Disclaimer: Consult a medical practitioner for health diagnoses.*",
    faqs: [
      { question: "What is Taurus' lucky color?", answer: "White, cream, and soft shades of pink or blue are considered auspicious, ruled by Venus." },
      { question: "Which planet governs Taurus?", answer: "Venus (Shukra), representing beauty, luxury, love, and fine arts." }
    ]
  },
  gemini: {
    slug: "gemini",
    name: "Gemini",
    element: "Air",
    ruler: "Mercury (Budha)",
    sanskritName: "Mithuna",
    overview: "Gemini (Mithuna) is the third sign of the zodiac, representing duality, communication, versatility, and intellectual curiosity.",
    personality: "Gemini individuals are highly intellectual, expressive, and sociable. Governed by Mercury, they love learning new concepts, exchanging ideas, and multitasking. They possess quick wit and excellent verbal skills but can be indecisive and anxious.",
    strengths: ["Gentle", "Affectionate", "Curious", "Adaptable", "Fast learner", "Communicative"],
    challenges: ["Nervous", "Inconsistent", "Indecisive", "Superficial"],
    relationships: "Geminis seek intellectual connection first. They need mentally stimulating conversations, variety, and mutual freedom. They align well with Libra, Aquarius, and Sagittarius.",
    career: "Gemini excels in journalism, public relations, writing, marketing, software development, and teaching, where communication and mental flexibility are essential.",
    education: "Gemini students are multi-disciplinary learners. They absorb information quickly and excel in languages, computer science, and journalism.",
    health: "Gemini rules the nervous system, arms, lungs, and shoulders. Prone to anxiety, insomnia, respiratory issues, and nervous fatigue. Meditation and breathing exercises are useful. *Disclaimer: Consult a medical practitioner for health diagnoses.*",
    faqs: [
      { question: "What is Gemini's auspicious day?", answer: "Wednesday (ruled by Mercury) is the luckiest day for Gemini (Mithuna) individuals." },
      { question: "How does Mercury influence Gemini?", answer: "Mercury (Budha) enhances cognitive quickness, analytical skills, and verbal wit." }
    ]
  }
};
