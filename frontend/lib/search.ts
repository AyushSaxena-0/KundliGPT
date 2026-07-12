import { blogPosts } from "../content/blog";
import { zodiacSigns } from "../content/zodiacs";
import { freeTools } from "../content/tools";

export interface SearchResult {
  title: string;
  description: string;
  url: string;
  type: "blog" | "zodiac" | "tool" | "faq" | "report";
  score: number;
}

const staticFaqs = [
  { question: "What is Vedic Astrology (Jyotish)?", answer: "Vedic Astrology is an ancient Indian sidereal system mapping planetary alignments based on actual constellations.", url: "/faq#what-is-vedic" },
  { question: "Why is accurate birth time critical?", answer: "An accurate birth time determines the correct ascendant sign and house placements, which shift rapidly.", url: "/faq#birth-time" },
  { question: "How does the AI Vedic Astrologer work?", answer: "It connects Vedic prompt systems with Google Gemini LLMs to formulate practical, interpretative astrology readings.", url: "/faq#how-it-works" },
  { question: "Are predictions guaranteed?", answer: "No. Astrology details potentials and planetary winds. Karma (present action) and free will shape your future.", url: "/faq#predictions" }
];

// List of Nakshatras for Nakshatra matching placeholder in search
const nakshatras = [
  { name: "Ashwini", ruler: "Ketu", type: "Light", description: "The star of transport and healing, ruled by the Ashwini Kumaras." },
  { name: "Bharani", ruler: "Venus", type: "Fierce", description: "The star of restraint and struggle, symbol of birth, death, and transformation." },
  { name: "Krittika", ruler: "Sun", type: "Mixed", description: "The star of fire and purification, represented by the razor's edge." },
  { name: "Rohini", ruler: "Moon", type: "Stable", description: "The star of ascent, beauty, creation, and growth." }
];

/**
 * Fuzzy score calculator checking token substring matches.
 * Returns a score between 0 and 100.
 */
function getMatchScore(text: string, query: string): number {
  const cleanText = text.toLowerCase();
  const cleanQuery = query.trim().toLowerCase();
  
  if (!cleanQuery) return 0;
  if (cleanText.includes(cleanQuery)) return 100;
  
  const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 1);
  if (queryWords.length === 0) return 0;
  
  let matchCount = 0;
  queryWords.forEach(word => {
    if (cleanText.includes(word)) {
      matchCount += 1;
    }
  });
  
  return Math.round((matchCount / queryWords.length) * 80);
}

/**
 * Global site-wide fuzzy search matching Blog, Zodiacs, Tools, Nakshatras, and FAQs.
 */
export function searchSite(query: string): SearchResult[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const results: SearchResult[] = [];

  // 1. Search Blog Posts
  Object.values(blogPosts).forEach((post) => {
    const textToSearch = `${post.title} ${post.description} ${post.content} ${post.tags.join(" ")}`;
    const score = getMatchScore(textToSearch, cleanQuery);
    if (score > 0) {
      results.push({
        title: post.title,
        description: post.description,
        url: `/blog/${post.slug}`,
        type: "blog",
        score
      });
    }
  });

  // 2. Search Zodiac Signs
  Object.values(zodiacSigns).forEach((zod) => {
    const textToSearch = `${zod.name} ${zod.sanskritName} ${zod.overview} ${zod.personality}`;
    const score = getMatchScore(textToSearch, cleanQuery);
    if (score > 0) {
      results.push({
        title: `${zod.name} (${zod.sanskritName}) - Zodiac Profile`,
        description: zod.overview,
        url: `/zodiac/${zod.slug}`,
        type: "zodiac",
        score
      });
    }
  });

  // 3. Search Free Tools
  Object.values(freeTools).forEach((tool) => {
    const textToSearch = `${tool.title} ${tool.subtitle} ${tool.explanation}`;
    const score = getMatchScore(textToSearch, cleanQuery);
    if (score > 0) {
      results.push({
        title: tool.title,
        description: tool.subtitle,
        url: `/tools/${tool.slug}`,
        type: "tool",
        score
      });
    }
  });

  // 4. Search FAQs
  staticFaqs.forEach((faq) => {
    const textToSearch = `${faq.question} ${faq.answer}`;
    const score = getMatchScore(textToSearch, cleanQuery);
    if (score > 0) {
      results.push({
        title: faq.question,
        description: faq.answer,
        url: faq.url,
        type: "faq",
        score
      });
    }
  });

  // 5. Search Nakshatras
  nakshatras.forEach((nak) => {
    const textToSearch = `${nak.name} ${nak.ruler} ${nak.type} ${nak.description}`;
    const score = getMatchScore(textToSearch, cleanQuery);
    if (score > 0) {
      results.push({
        title: `${nak.name} Nakshatra Profile`,
        description: `${nak.description} Ruled by ${nak.ruler} (${nak.type} Nakshatra).`,
        url: `/tools/nakshatras?name=${nak.name.toLowerCase()}`,
        type: "report",
        score
      });
    }
  });

  // Sort by match score descending
  return results.sort((a, b) => b.score - a.score).slice(0, 10);
}

export default searchSite;
