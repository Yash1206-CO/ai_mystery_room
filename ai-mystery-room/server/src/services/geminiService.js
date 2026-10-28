const { GoogleGenAI } = require('@google/genai');
const { z } = require('zod');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MysterySchema = z.object({
  title: z.string(),
  story: z.object({
    victim: z.string(),
    crimeScene: z.string(),
    background: z.string(),
    timeOfIncident: z.string()
  }),
  suspects: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    bio: z.string(),
    alibi: z.string(),
    relationshipToVictim: z.string()
  })),
  clues: z.array(z.object({
    id: z.string(),
    title: z.string(),
    location: z.string(),
    description: z.string()
  })),
  hints: z.array(z.object({
    id: z.string(),
    text: z.string()
  })),
  solution: z.object({
    culpritSuspectId: z.string(),
    culpritName: z.string(),
    motive: z.string(),
    method: z.string(),
    fullExplanation: z.string()
  })
});

const DIFFICULTY_CONFIG = {
  Easy: { suspects: 3, clues: 5, hints: 2 },
  Medium: { suspects: 4, clues: 7, hints: 3 },
  Hard: { suspects: 5, clues: 9, hints: 3 }
};

// Procedural fallback mystery so your app is always playable even if Gemini billing is restricted
const FALLBACK_MYSTERIES = [
  {
    title: "The Midnight Gala Cyanide Vintage",
    story: {
      victim: "Lord Julian Sterling, wealthy philanthropist and host",
      crimeScene: "The Private Wine Cellar beneath Sterling Manor",
      background: "During the annual harvest banquet, Lord Sterling excused himself to retrieve an 1894 reserve vintage. Twenty minutes later, the cellar lights flickered and Sterling was discovered collapsed beside an uncorked bottle, smelling faintly of bitter almonds.",
      timeOfIncident: "11:42 PM"
    },
    suspects: [
      { id: "suspect-1", name: "Dr. Arthur Vance", role: "Personal Physician", bio: "Sterling's longtime doctor who recently lost heavily in private pharmaceutical stock investments.", alibi: "Claims he was in the conservatory smoking cigars with the ambassador.", relationshipToVictim: "Doctor & childhood acquaintance" },
      { id: "suspect-2", name: "Helena Sterling", role: "Estranged Heiress", bio: "Sterling's daughter, recently removed from the family trust fund following a heated public quarrel.", alibi: "Claims she was powdering her nose in the second-floor vanity.", relationshipToVictim: "Daughter" },
      { id: "suspect-3", name: "Marcus Thorne", role: "Sommelier & Head Butler", bio: "Curated Sterling's cellar for 15 years; recently discovered Sterling planned to sell the estate.", alibi: "Claims he was supervising the dinner service in the main dining hall.", relationshipToVictim: "Head Butler" },
      { id: "suspect-4", name: "Vivienne Laurent", role: "Art & Antique Dealer", bio: "Owed substantial debts to Sterling for forged Renaissance miniatures.", alibi: "Claims she was listening to the string quartet in the foyer.", relationshipToVictim: "Business Associate" },
      { id: "suspect-5", name: "Detective Inspector Charles Reed", role: "Private Security Consultant", bio: "Hired to protect the Sterling diamond collection on display tonight.", alibi: "Patrolling the perimeter terrace.", relationshipToVictim: "Hired Security" }
    ],
    clues: [
      { id: "clue-1", title: "Crystallized Cyanide Vial", location: "Cellar Drain Grate", description: "A discarded medical glass ampoule with traces of potassium cyanide, bearing a batch stamp from St. Jude's Hospital Dispensary." },
      { id: "clue-2", title: "Torn Silk Fabric", location: "Cellar Door Latch", description: "A dark navy silk fiber caught on the brass latch, matching the custom-tailored dinner jackets worn exclusively by the physician." },
      { id: "clue-3", title: "Uncorked 1894 Vintage", location: "Wine Tasting Table", description: "The cork was extracted cleanly using a specialized twin-prong vintage cork puller found in Dr. Vance's medical bag." },
      { id: "clue-4", title: "Overheard Heated Whisper", location: "Study Corridor", description: "A butler overheard a heated argument at 11:15 PM about prescription fraud and unpaid medical hush money." },
      { id: "clue-5", title: "Conservatory Cigar Log", location: "Conservatory Ash Stand", description: "The cigar Dr. Vance claimed to have smoked was cold and unlit, proving his alibi was fabricated." },
      { id: "clue-6", title: "Bank Overdraft Notice", location: "Library Desk", description: "A final foreclosure notice addressed to Dr. Arthur Vance demanding £50,000 by Monday." },
      { id: "clue-7", title: "Cellar Master Keycard", location: "Kitchen Key Hook", description: "The master keycard was logged as accessed by the doctor's guest biometric pass at 11:38 PM." },
      { id: "clue-8", title: "Fingerprints on Glass", location: "Cellar Wine Goblet", description: "Partial thumbprints on the poisoned glass goblet match Dr. Vance's right index and thumb." },
      { id: "clue-9", title: "Burned Letter Fragments", location: "Fireplace", description: "Fragments of a letter revealing Lord Sterling intended to report Dr. Vance to the General Medical Council." }
    ],
    hints: [
      { id: "hint-1", text: "Look closely at the medical glass vial found by the cellar drain—who among the guests has hospital dispensary access?" },
      { id: "hint-2", text: "Check the conservatory ash stand: does Dr. Vance's alibi hold up under forensic scrutiny?" },
      { id: "hint-3", text: "Dr. Vance was facing immediate financial ruin and blackmail exposure from Sterling." }
    ],
    solution: {
      culpritSuspectId: "suspect-1",
      culpritName: "Dr. Arthur Vance",
      motive: "Lord Sterling uncovered Vance's illegal prescription ring and threatened to revoke his medical license and demand immediate loan repayment.",
      method: "Injected potassium cyanide into the 1894 vintage bottle using a medical syringe before Sterling arrived to uncork it.",
      fullExplanation: "Dr. Arthur Vance fabricated his conservatory alibi with an unlit cigar. He used his hospital access to obtain the cyanide ampoule and unlocked the cellar using his guest access badge at 11:38 PM. The silk fiber on the cellar latch and the cork puller in his bag conclusively dismantle his defense."
    }
  }
];

function generateDynamicFallback(premise, difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.Easy;
  const base = FALLBACK_MYSTERIES[0];

  return {
    title: premise ? `The Mystery of: ${premise.slice(0, 40)}` : base.title,
    story: {
      ...base.story,
      background: premise ? `${premise}. ${base.story.background}` : base.story.background
    },
    suspects: base.suspects.slice(0, config.suspects),
    clues: base.clues.slice(0, config.clues),
    hints: base.hints.slice(0, config.hints),
    solution: base.solution
  };
}

async function generateMystery(premise, difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.Easy;
  
  const systemInstruction = `You are an elite detective mystery author and logic game designer.
Generate an airtight, logically consistent whodunit mystery case based on the requested premise and quotas.

STRICT CONSTRAINTS:
1. Suspects count: EXACTLY ${config.suspects}. Give each suspect an 'id' formatted like 'suspect-1', 'suspect-2', etc.
2. Clues count: EXACTLY ${config.clues}. Give each clue an 'id' formatted like 'clue-1', 'clue-2', etc.
3. Hints count: EXACTLY ${config.hints}. Give each hint an 'id' formatted like 'hint-1', 'hint-2', etc.
4. Exactly ONE suspect must be the true culprit. Their ID and name must match 'solution.culpritSuspectId' and 'solution.culpritName'.
5. The clues must collectively and decisively implicate ONLY the culprit, disproving their alibi or establishing physical/digital evidence.
6. The innocent suspects must be exonerated when clues are analyzed properly.
7. Return strictly valid JSON conforming to the requested schema. Do not wrap in markdown quotes if possible or return raw JSON.`;

  const prompt = `Premise: "${premise || 'An unsolved murder during an exclusive midnight gala'}".
Difficulty Level: ${difficulty}.
Ensure the difficulty reflects the subtlety of the clues and complexity of alibis.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json'
      }
    });

    const rawText = response.text;
    const parsedJson = JSON.parse(rawText);
    const validatedData = MysterySchema.parse(parsedJson);

    return validatedData;
  } catch (error) {
    console.warn('Gemini API call failed or billing restricted. Falling back to dynamic procedural mystery generator:', error.message);
    return generateDynamicFallback(premise, difficulty);
  }
}

module.exports = {
  generateMystery,
  DIFFICULTY_CONFIG
};