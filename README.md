
# 🍃 Footsteps to Freedom

**Footsteps to Freedom** is a world-class, trauma-informed AI recovery companion designed specifically for the UK context. It serves as a compassionate sanctuary for individuals navigating the path of addiction recovery, blending evidence-based psychological frameworks with cutting-edge AI technology.

## 🌟 Core Philosophy
Unlike standard health apps, Footsteps uses a **Phase-based journey** rather than a rigid weekly schedule. This respects the non-linear nature of healing and allows "travellers" on the path to move at their own pace through five distinct stages:
1. **Foundations:** Bio-Psycho-Social Grounding.
2. **Coping Tools:** Emotional Regulation Mastery (DBT).
3. **Growth:** Identity & Interpersonal Success.
4. **Meaning & Actualisation:** Purpose & Connection.
5. **Maintenance:** Lifestyle Balance & Mentorship.

## 🛠️ Therapeutic Framework
- **CBT (Cognitive Behavioural Therapy):** Pattern recognition through ABCDE Thought Records and Functional Chain Analysis.
- **DBT (Dialectical Behaviour Therapy):** Distress tolerance via the TIPP, ACCEPTS, and IMPROVE frameworks, now with a dedicated **DBT Skills Hub**.
- **ACT (Acceptance & Commitment Therapy):** Values-based living and identity shift tools.
- **MI (Motivational Interviewing):** Ambivalence resolution using Cost-Benefit Analysis and SMART Goal setting.

## ✨ Key Features
- **AI Footpath Guide:** A compassionate conversational companion powered by Gemini 3 Pro, capable of text and real-time voice support.
- **Video Sanctuary:** Immersive, AI-generated visual environments for grounding and meditation using Gemini Veo.
- **True-Self Beacon:** Phase-specific daily affirmations that help shift self-perception from "struggle" to "strength."
- **Coping Bandage:** Instant access to regulation tools (Grounding, Paced Breathing, STOP skill) during high-urge moments.
- **Science Hub:** Deep-dives into neurobiology to reduce shame through clinical understanding.
- **UK Safety First:** Native integration with UK emergency services (999, 111, Samaritans).

## 🚀 Tech Stack
- **Frontend:** React 19, Tailwind CSS
- **State Management:** Zustand (with persistent local storage)
- **AI Integration:** `@google/genai` (Gemini 3 Pro & 2.5 Flash)
- **Visuals:** Recharts for emotional trajectory tracking
- **PWA:** Offline-first service worker and PWA manifest for mobile installation.

## ⚙️ Setup
1. **Environment Variables:**
   - Ensure a valid `API_KEY` is available in your environment.
   - For Video Sanctuary features, users must select their own API key from a paid GCP project via the built-in AI Studio dialog.
2. **Local Development:**
   ```bash
   npm install
   npm start
   ```

## 🛡️ Privacy & Security
Footsteps to Freedom implements a **Sanctuary Gate** (secure login) and stores all recovery data locally in the traveller's browser using persistent storage. No sensitive journal entries or mood logs are transmitted to external servers except as anonymised prompts for the Gemini API.

---

*“Recovery is a journey of 1,000 small, brave choices. Every footprint matters.”*
