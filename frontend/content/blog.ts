export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  publishDate: string; // YYYY-MM-DD
  updatedDate: string; // YYYY-MM-DD
  readingTime: string;
  imageUrl: string;
  tableOfContents: { text: string; id: string }[];
  content: string; // Markdown formatted string
  relatedSlugs: string[];
}

export const blogPosts: Record<string, BlogPost> = {
  "understanding-nakshatras": {
    slug: "understanding-nakshatras",
    title: "Understanding Nakshatras: The Secret Behind Deep Vedic Astrology",
    description: "Discover the 27 stellar mansions of Vedic astrology and how Nakshatras reveal your deep karmic patterns.",
    category: "Vedic Wisdom",
    tags: ["Nakshatra", "Moon Sign", "Kundli", "Astrology Basics"],
    author: "Acharya Sharma",
    publishDate: "2026-07-10",
    updatedDate: "2026-07-11",
    readingTime: "5 min read",
    imageUrl: "/blog/nakshatras.jpg",
    tableOfContents: [
      { text: "What is a Nakshatra?", id: "what-is-a-nakshatra" },
      { text: "The 27 Lunar Mansions", id: "the-27-lunar-mansions" },
      { text: "Why Nakshatras Matter", id: "why-nakshatras-matter" },
      { text: "Practical Suggestions", id: "practical-suggestions" }
    ],
    content: `
Vedic Astrology (Jyotish) is often associated with the 12 familiar zodiac signs. However, the deepest, most accurate layer of Vedic chart analysis lies in the **Nakshatras**, or the 27 lunar mansions. 

While zodiac signs divide the ecliptic into 30-degree segments, Nakshatras divide it into 27 segments of 13 degrees and 20 minutes each, representing the Moon's path against the constellations.

---

### What is a Nakshatra?
The term **Nakshatra** translates literally to "stellar mansion" or "that which does not decay." In Vedic lore, the Moon visits one Nakshatra every day, staying with one of the 27 wives of Soma (the moon god). Each mansion has a unique ruling planet, symbol, deity, and primary motivation (Dharma, Artha, Kama, or Moksha).

---

### The 27 Lunar Mansions
The 27 Nakshatras are divided across the three signs of each element:
1. **Ashwini** (Ruled by Ketu) - Symbolizes swift beginnings and healing.
2. **Bharani** (Ruled by Venus) - Symbolizes womb, birth, and transformation.
3. **Krittika** (Ruled by Sun) - Symbolizes fire, purification, and cutting tools.
*(...and 24 other mansions ending in Revati)*

---

### Why Nakshatras Matter
Your **Janma Nakshatra** (the mansion where the Moon resided at your birth) determines:
- **Dasha Cycles**: The exact planetary timeline governing your life's ups and downs.
- **Mental Temperament (Guna)**: Your emotional patterns and subconscious responses.
- **Remedial Upayas**: Personalized mantras and rituals to balance planetary challenges.

---

### Practical Suggestions
If you wish to apply Nakshatra wisdom to your daily life:
- **Know Your Moon Nakshatra**: Check your birth chart (Kundli) to identify your Nakshatra.
- **Track Lunar Transits**: Note how your mood fluctuates as the Moon transits your birth Nakshatra.
- **Embrace Remedies**: Respect the ruling deity of your Nakshatra through mindfulness and service.
`,
    relatedSlugs: ["moon-signs-importance"]
  },
  "moon-signs-importance": {
    slug: "moon-signs-importance",
    title: "Why Your Moon Sign Matters More Than Your Sun Sign in Vedic Astrology",
    description: "Learn why Jyotish prioritizes the Moon Sign (Chandra Rashi) over the Sun Sign for emotional and mental guidance.",
    category: "Astrology Basics",
    tags: ["Moon Sign", "Sun Sign", "Chandra Rashi", "Basics"],
    author: "Acharya Sharma",
    publishDate: "2026-07-08",
    updatedDate: "2026-07-09",
    readingTime: "4 min read",
    imageUrl: "/blog/moon-sign.jpg",
    tableOfContents: [
      { text: "Sun vs. Moon Sign", id: "sun-vs-moon" },
      { text: "The Mind and Moon", id: "mind-and-moon" },
      { text: "Vedic Horoscopes", id: "vedic-horoscopes" }
    ],
    content: `
In Western astrology, the Sun Sign (the constellation the Sun was in when you were born) is the primary identifier. However, **Vedic Astrology (Jyotish) prioritizes the Moon Sign (Chandra Rashi)**.

---

### Sun vs. Moon Sign
While the Sun represents your soul's outer expression, career drive, and physical vitality, the Moon represents your mind, emotions, subconscious desires, and mental health. In Vedic culture, how you *perceive* your life (governed by the Moon) is considered more important than external circumstances.

---

### The Mind and Moon (Manas)
In Vedic terminology, the Moon is related to **Manas** (the emotional mind). Since our happiness, relationships, and decisions stem from our emotional state, analyzing Chandra Rashi reveals how you handle stress, display love, and navigate conflicts.

---

### Vedic Horoscopes
Vedic daily, monthly, and yearly horoscopes are calculated from your **Moon Sign** (rather than Sun Sign) because the Moon moves faster, reflecting the rapid changes in human emotional cycles and daily circumstances.
`,
    relatedSlugs: ["understanding-nakshatras"]
  }
};
