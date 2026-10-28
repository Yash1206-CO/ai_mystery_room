# AI Mystery Room — Technical Specification Document (SPEC.md)

## 1. Project Overview & Problem Statement
### 1.1 Overview
**AI Mystery Room** is an interactive, AI-driven detective web application where players generate, investigate, and solve dynamically synthesized murder mysteries and whodunits powered by Google's Gemini API. Players interrogate suspects, inspect crime scene clues, request tactical hints, piece together timelines, and formally submit an accusation to reveal the culprit and claim their detective score.

### 1.2 Problem Statement
Traditional mystery and puzzle games are static: once played, the storyline and solution are known, eliminating replayability. Conversely, naive generative AI text games suffer from hallucination, plot holes, premature spoilers, or loose logical coherence. 
**AI Mystery Room** solves this by combining:
- Dynamic narrative generation with strict logical consistency constraints.
- Backend-enforced state isolation (the culprit, motive, and solution are strictly withheld from client-side state until a formal accusation is validated).
- Granular difficulty tiers that scale suspect counts, clues, and available hints.
- Deterministic scoring algorithms balancing deduction speed, clue exploration, and hint penalties.

---

## 2. Target Users & Expected User Experience
### 2.1 Target Users
- **Puzzle and Mystery Enthusiasts**: Gamers who enjoy classic mystery fiction (Agatha Christie, Sherlock Holmes, Knives Out) and want fresh, replayable deduction challenges.
- **Casual Gamers**: Players seeking a 5–15 minute interactive brain-teaser with immediate visual feedback.
- **Hackathon Evaluators & Educators**: Assessors evaluating robust generative AI architecture, prompt engineering, structured JSON outputs, and secure state management.

### 2.2 Expected User Experience
- **Immersion**: Dark, atmospheric, noir/sleuth UI styling built with Tailwind CSS, typography evocative of case files, and distinct cards for suspects and evidence.
- **Fair Play**: Every case is guaranteed to have exactly one logically sound culprit whose guilt is definitively substantiated by the generated clues. Red herrings exist but never contradict verified facts.
- **Anti-Cheat Integrity**: Clue discovery, hint unlocks, and accusations are strictly mediated through backend validation. Inspecting browser network logs or Redux/React state will never reveal the true culprit before accusation.

---

## 3. Technology Stack & Architecture
### 3.1 Architecture Overview
The application follows a decoupled client-server architecture with a persistent database layer and external AI integration:

```
[ React 18 + Vite + Tailwind CSS ] (Client on Vercel)
               |
          REST HTTPS
               v
[ Node.js + Express + Zod ] (Backend on Render / Railway)
        |                  |
   Mongoose               Gemini 1.5 Flash / 2.0 API
        v                  v
 [ MongoDB Atlas ]   [ Structured JSON Output ]
```

### 3.2 Technology Breakdown
- **Frontend**:
  - `React 18` with `Vite` for fast build tooling and HMR.
  - `Tailwind CSS` for responsive, noir-themed UI components.
  - `react-router-dom` (v6) for declarative client-side routing.
  - `axios` for centralized API communication with interceptors.
  - `lucide-react` for case-file and detective iconography.
- **Backend**:
  - `Node.js` (LTS) & `Express` for the RESTful API microservice.
  - `Mongoose` (v8) for MongoDB schema modeling, data integrity, and transactions.
  - `@google/genai` (official Google Gen AI SDK) communicating with Gemini models (e.g., `gemini-1.5-flash`).
  - `zod` for strict runtime schema validation of AI outputs and client requests.
  - `cors` and `dotenv` for cross-origin security and environment management.
- **Database**:
  - `MongoDB Atlas` (Cloud cluster) storing cases, progression states, clues, and scorecards.

---

## 4. User Flow & Game Loop
1. **Landing & Initialization**:
   - User navigates to Home (`/`), reviews game instructions, rules, and scoring rubric.
   - Clicks "Start New Investigation" to navigate to Case Creation (`/create`).
2. **Mystery Configuration & Generation**:
   - User inputs an optional custom premise (e.g., *"A Victorian gala poisoning"*, *"A high-tech Silicon Valley server room blackout murder"*) or clicks "Surprise Me" for an automated theme.
   - User selects Difficulty Tier: `Easy`, `Medium`, or `Hard`.
   - Frontend triggers `POST /api/cases`. Backend calls Gemini API with strict structured schema constraints, validates response with Zod, persists case to MongoDB, and returns sanitized case details.
3. **Investigation Room (`/case/:id`)**:
   - Displays Case File: Title, Backstory/Setting, Difficulty badge, and Case Stats (Clues Found, Hints Used, Potential Score).
   - **Suspects Dossier**: View suspects, alibis, relationships, and preliminary motives.
   - **Clue Discovery Board**: Uninspected clue locations/items. Clicking "Examine Clue" sends `POST /api/cases/:id/clues/:clueId/discover`, unlocking forensic evidence and adding +5 points per discovered clue.
   - **Tactical Hints Depot**: When stuck, user can request a hint (`POST /api/cases/:id/hints`). Max hints depend on difficulty. Each hint deducted carries a -10 point penalty.
4. **Accusation Room (`/case/:id/accuse`)**:
   - When confident, user enters the Accusation room.
   - Selects the prime suspect from the suspect list.
   - Provides optional deduction reasoning / motive explanation.
   - Submits formal accusation via `POST /api/cases/:id/accuse`.
5. **Verdict & Case Debrief (`/case/:id/result`)**:
   - Backend evaluates accusation against the hidden culprit, calculates the final score, and seals the case status as `closed`.
   - Results page displays:
     - Verdict Banner: **Case Solved! (Success)** or **Case Unsolved / Innocent Accused (Failure)**.
     - Final Detective Score (breakdown: Base Points + Clue Bonus - Hint Penalties; minimum 0).
     - Full Culprit Reveal: Identity, Real Motive, Weapon/Method, and Unveiled Solution narrative detailing how the clues interconnected.
   - Actions to "Start Another Mystery" or "Review Clue Board".

---

## 5. UI and Page Specifications

### 5.1 Route Hierarchy
- `/` — **Home Page**
- `/create` — **Create Mystery Page**
- `/case/:id` — **Investigation Room**
- `/case/:id/accuse` — **Accusation Page**
- `/case/:id/result` — **Results & Debrief Page**

### 5.2 Detailed Page Elements & Behaviors
#### Page 1: Home (`/`)
- **Header**: Case title, badge, thematic subtitle ("AI-Powered Noir Investigation System").
- **Hero Section**: Atmospheric intro banner, brief feature summary (Dynamic Gemini cases, forensic clue hunting, backend-validated scoring).
- **Rule Book Card**:
  - Breakdown of difficulty levels (Suspects, Clues, Hints).
  - Scoring Rubric: Base points (+100/150/200), Clue Discovery (+5 each), Hint Penalty (-10 each).
- **CTA**: Prominent "Launch Investigation" button routing to `/create`.

#### Page 2: Create Mystery (`/create`)
- **Form Controls**:
  - `Premise Input`: Textarea (max 300 chars) with placeholder *"e.g., A rainy midnight art gallery heist where the curator is found unconscious..."*. Includes a "Surprise Me / Random Premise" generator button.
  - `Difficulty Selector`: Interactive 3-card toggle (`Easy`, `Medium`, `Hard`) highlighting suspect/clue/hint quotas.
- **Interaction & State**:
  - Submit button: "Generate Case File".
  - Loading State: Fullscreen modal/spinner with animated detective status messages (*"Assembling crime scene photos..."*, *"Cross-referencing alibis..."*, *"Securing forensic evidence with Gemini..."*).
  - Error Handling: Inline error alert if API fails or rate-limits, with a "Retry Generation" action.

#### Page 3: Investigation Room (`/case/:id`)
- **Top Navigation Bar**: Case ID tracker, Back to Home (with confirmation dialog), Real-time Score Simulator badge.
- **Case Summary Header**: Title, setting, date/time of incident, incident summary text.
- **Tabbed / Dual-Panel Layout**:
  - **Panel A: Suspect Dossiers**: Cards showing suspect Name, Occupation, Bio, Stated Alibi, and Relationship to Victim.
  - **Panel B: Crime Scene & Evidence Locker**:
    - List of Clues. Undiscovered clues display redacted title, location tag, and an "Examine / Uncover" button.
    - Discovered clues expand into full forensic descriptions, relevance notes, and timestamp of discovery.
  - **Panel C: Detective Notebook / Hints Section**:
    - Displays hint counter (e.g., `Hints Remaining: 1 of 3`).
    - "Call Forensics / Request Tactical Hint" button (disabled if quota exhausted).
    - Accordion list of unlocked hints with penalty notice (-10 pts).
- **Sticky Footer Action Bar**:
  - Current status: `X of Y clues examined`.
  - Prominent "Proceed to Accusation" button routing to `/case/:id/accuse`.

#### Page 4: Accusation Room (`/case/:id/accuse`)
- **Warning Banner**: *"Submitting an accusation will permanently close this case file and reveal the truth. Choose carefully."*
- **Suspect Selection Grid**: Radio card selection showing each suspect with mugshot avatar, name, and role.
- **Detective Notes Textbox**: Optional textarea for player to record their deduction logic before submission.
- **Submission Controls**:
  - "Confirm Accusation" button.
  - "Return to Evidence Board" link.
  - Submission triggers `POST /api/cases/:id/accuse`, redirects to `/case/:id/result`.

#### Page 5: Results & Debrief (`/case/:id/result`)
- **Verdict Splash**:
  - Correct: Green neon accent, badge *"Case Solved — Master Detective"*.
  - Incorrect: Crimson neon accent, badge *"Cold Case — The Culprit Escaped"*.
- **Score Breakdown Card**:
  - Base Score: `+100` / `+150` / `+200` (or `0` if wrong).
  - Clue Discovery Bonus: `+{discoveredCount * 5}`.
  - Hint Penalty: `-{hintsUsed * 10}`.
  - Total Verified Score: `Math.max(0, Total)`.
- **The Solution Revealed**:
  - The True Culprit (Name, Bio).
  - Real Motive & Weapon/Method.
  - Full Narrative Solution: Chronological walkthrough of how the crime occurred and which clues definitively exposed the culprit.
- **Action Buttons**:
  - "Solve Another Mystery" -> `/create`.
  - "Review Final Case Dossier" -> Toggles view of all unlocked evidence.

---

## 6. Backend and Database Design

### 6.1 Database Schema (Mongoose Model: `Case`)

```javascript
const mongoose = require('mongoose');

const ClueSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  isDiscovered: { type: Boolean, default: false },
  discoveredAt: { type: Date, default: null }
});

const SuspectSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  bio: { type: String, required: true },
  alibi: { type: String, required: true },
  relationshipToVictim: { type: String, required: true }
});

const HintSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  isUnlocked: { type: Boolean, default: false },
  unlockedAt: { type: Date, default: null }
});

const CaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  premise: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'], 
    required: true 
  },
  story: {
    victim: { type: String, required: true },
    crimeScene: { type: String, required: true },
    background: { type: String, required: true },
    timeOfIncident: { type: String, required: true }
  },
  suspects: [SuspectSchema],
  clues: [ClueSchema],
  hints: [HintSchema],
  
  // SECURITY REQUIREMENT:
  // These fields are strictly hidden from normal client GET queries
  solution: {
    culpritSuspectId: { type: String, required: true, select: false },
    culpritName: { type: String, required: true, select: false },
    motive: { type: String, required: true, select: false },
    method: { type: String, required: true, select: false },
    fullExplanation: { type: String, required: true, select: false }
  },
  
  // Game progression tracking
  status: { 
    type: String, 
    enum: ['active', 'solved', 'unsolved'], 
    default: 'active' 
  },
  accusation: {
    accusedSuspectId: { type: String, default: null },
    notes: { type: String, default: null },
    isCorrect: { type: Boolean, default: null },
    accusedAt: { type: Date, default: null }
  },
  score: {
    basePoints: { type: Number, default: 0 },
    clueBonus: { type: Number, default: 0 },
    hintPenalty: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Case', CaseSchema);
```

### 6.2 Security Design & Anti-Spoiler Enforcement
- The `solution` subdocument utilizes Mongoose's `{ select: false }` configuration for `culpritSuspectId`, `culpritName`, `motive`, `method`, and `fullExplanation`.
- Regular queries (`GET /api/cases/:id`) omit `solution` entirely.
- Clue descriptions for undiscovered clues are redacted or withheld on the client payload until explicitly unlocked through `POST /api/cases/:id/clues/:clueId/discover`.
- The secret solution is ONLY selected via `.select('+solution')` within `POST /api/cases/:id/accuse` and `GET /api/cases/:id/result` after the case status transitions to `solved` or `unsolved`.

---

## 7. REST API Endpoints Specification

### 7.1 POST `/api/cases`
- **Description**: Generate and persist a brand-new AI mystery case.
- **Request Body**:
  ```json
  {
    "premise": "A rare emerald is stolen during a blackout at the Grand Hotel",
    "difficulty": "Easy" // "Easy" | "Medium" | "Hard"
  }
  ```
- **Validation**:
  - `difficulty`: Required, enum `["Easy", "Medium", "Hard"]`.
  - `premise`: String, max 300 characters (optional, fallback generated if empty).
- **Backend Action**:
  - Queries Gemini API using structured JSON schema.
  - Validates Gemini JSON with Zod.
  - Saves to MongoDB.
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "caseId": "6720e8b84e4f...",
    "data": {
      "_id": "6720e8b84e4f...",
      "title": "The Grand Hotel Emerald Disappearance",
      "difficulty": "Easy",
      "story": { ... },
      "suspects": [ ... ],
      "clues": [
        { "id": "clue-1", "title": "Shattered Display Glass", "location": "Exhibition Hall", "isDiscovered": false }
      ],
      "hintsAvailable": 2,
      "hintsUsed": 0,
      "status": "active"
    }
  }
  ```

### 7.2 GET `/api/cases/:id`
- **Description**: Retrieve active case details without spoiling the culprit or undiscovered clue details.
- **Response (200 OK)**:
  Returns sanitized case object. Undiscovered clues omit `description`. `solution` is excluded.

### 7.3 POST `/api/cases/:id/clues/:clueId/discover`
- **Description**: Mark a clue as investigated and reveal its forensic description.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "clue": {
      "id": "clue-1",
      "title": "Shattered Display Glass",
      "location": "Exhibition Hall",
      "description": "Glass fragments fell outward, indicating the case was opened from the inside rather than broken from the outside.",
      "isDiscovered": true,
      "discoveredAt": "2026-10-28T12:00:00Z"
    },
    "cluesDiscovered": 1,
    "currentClueBonus": 5
  }
  ```

### 7.4 POST `/api/cases/:id/hints`
- **Description**: Unlock the next available hint in sequence.
- **Validation**: Rejects with `400 Bad Request` if all hints for the current difficulty tier have already been unlocked.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "hint": {
      "id": "hint-1",
      "text": "Notice who had access to the master keycard during the blackout.",
      "isUnlocked": true
    },
    "hintsRemaining": 1,
    "penaltyApplied": 10
  }
  ```

### 7.5 POST `/api/cases/:id/accuse`
- **Description**: Submit the player's final accusation.
- **Request Body**:
  ```json
  {
    "accusedSuspectId": "suspect-2",
    "notes": "She had glass dust on her gloves and the security logs show her keycard."
  }
  ```
- **Backend Action**:
  - Pulls case including `+solution`.
  - Compares `accusedSuspectId` with `solution.culpritSuspectId`.
  - Calculates final score according to scoring rules.
  - Updates status to `solved` or `unsolved`.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "isCorrect": true,
    "verdict": "Case Solved!",
    "score": {
      "basePoints": 100,
      "clueBonus": 25,
      "hintPenalty": 10,
      "totalScore": 115
    },
    "solution": {
      "culpritSuspectId": "suspect-2",
      "culpritName": "Elena Vance",
      "motive": "Facing bankruptcy due to luxury art debts.",
      "method": "Used emergency override during blackout.",
      "fullExplanation": "Elena had access to the override key..."
    }
  }
  ```

### 7.6 GET `/api/cases/:id/result`
- **Description**: Retrieve post-game debrief. Accessible only when case status is `solved` or `unsolved`.
- **Response (200 OK)**: Full case history, player accusation, score, and revealed solution.

---

## 8. AI Behavior, Prompt Design & Scoring Rules

### 8.1 Gemini Prompt Engineering & Quota Specification
The application enforces strict content quotas based on difficulty:

| Difficulty | Suspects | Clues | Max Hints | Base Correct Points |
| :--- | :---: | :---: | :---: | :---: |
| **Easy** | 3 | 5 | 2 | 100 |
| **Medium** | 4 | 7 | 3 | 150 |
| **Hard** | 5 | 9 | 3 | 200 |

### 8.2 Strict System Prompt & Logic Constraints
```text
You are a master mystery writer and forensic game designer.
Generate a complete, logically airtight murder or heist mystery based on the user's premise.

CRITICAL LOGICAL RULES:
1. Exactly ONE suspect must be the true culprit.
2. The clues must collectively provide conclusive forensic or circumstantial evidence pointing uniquely to the culprit.
3. Every innocent suspect must have an alibi or verifiable evidence that exonerates them upon thorough deduction.
4. Red herrings are permitted but must not create logical contradictions.
5. Hints must provide progressive deductive direction without explicitly naming the culprit.
6. Return output strictly in the requested JSON structure adhering to the specified schema.
```

### 8.3 Zod Validation Schema for Gemini Output
```typescript
import { z } from 'zod';

export const MysteryGenerationSchema = z.object({
  title: z.string().min(5),
  story: z.object({
    victim: z.string().min(3),
    crimeScene: z.string().min(5),
    background: z.string().min(20),
    timeOfIncident: z.string().min(3)
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
```

### 8.4 Scoring Formula
$$	ext{Total Score} = \max\Big(0,\; 	ext{Base Points} + (5 	imes N_{	ext{clues discovered}}) - (10 	imes N_{	ext{hints unlocked}})\Big)$$
Where:
- $	ext{Base Points} = 100$ (Easy), $150$ (Medium), or $200$ (Hard) if the accusation is correct.
- If the accusation is incorrect, $	ext{Base Points} = 0$.
- Clue Bonus: $+5$ for each unique clue discovered before submitting accusation.
- Hint Penalty: $-10$ for each hint requested and unlocked.
- Floor: Score never drops below $0$.

---

## 9. Error Handling & Edge Cases
1. **AI Output Hallucination / Schema Mismatch**:
   - The backend validates Gemini's output using Zod.
   - If parsing fails, the backend retries generation once with temperature 0.2 before returning a clean `502 Bad Gateway` error to the client.
2. **Duplicate Discovery / Hint Exploits**:
   - Backend prevents re-discovering the same clue or double-deducting hint scores using idempotent state flags (`isDiscovered`, `isUnlocked`).
3. **Premature Solution Leakage**:
   - The culprit ID and solution narrative are never sent in `GET /api/cases/:id` responses.
4. **Network Drop During Game**:
   - All discovery states and unlocked hints are saved immediately to MongoDB, allowing players to refresh the page without losing progress.

---

## 10. Acceptance Criteria Checklist
- [x] Users can generate mysteries across all three difficulty levels (`Easy`, `Medium`, `Hard`).
- [x] Exactly 3 suspects/5 clues/2 hints generated for Easy, 4/7/3 for Medium, and 5/9/3 for Hard.
- [x] Clues can be examined individually and reward +5 points.
- [x] Hints can be requested sequentially up to the tier limit and penalize -10 points.
- [x] Culprit identity, motive, and solution are completely hidden until accusation submission.
- [x] Accusation verifies accuracy and calculates final score with a 0-point minimum floor.
- [x] Results screen displays victory/defeat status, score breakdown, and full solution walkthrough.
- [x] App operates cleanly across local development and production deployment (Vercel + MongoDB Atlas + Render/Railway).
