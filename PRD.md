# AralKada — Product Requirements Document (PRD)

> **Version:** 1.0  
> **Date:** March 31, 2026  
> **Platform:** Web (Next.js)  
> **Status:** Active Development

---

## 1. Product Overview

**AralKada** (from Filipino *"aral"* = learn + *"kada"* = every/everyone) is an AI-powered, all-in-one academic companion built for Filipino senior high school and incoming college students. It consolidates entrance-exam preparation, AI-driven study tools, Philippine dialect learning, scholarship discovery, college application tracking, and commute planning into a single progressive web application.

---

## 2. Problem Statement

Filipino students preparing for college face fragmented resources: exam reviewers are scattered across social media and Xerox copies, scholarship information is buried in government websites, dialect preservation has few digital tools, and there is no unified platform connecting academic preparation with logistics like commuting to campus. AralKada addresses this by merging these needs into one cohesive, AI-enhanced learning environment.

---

## 3. Target Users

| Persona | Description |
|---|---|
| **Senior High Students** | Grade 11–12 students preparing for college entrance tests (UPCAT, USTET, ACET, etc.) |
| **Incoming College Freshmen** | Students who need scholarship info, application tracking, and campus logistics |
| **Regional / Provincial Students** | Learners outside Metro Manila who benefit from dialect tools and commute guidance |

---

## 4. Core Modules & Features

### 4.1 Study Buddy (AI Study Guide Generator)

AI-powered study material generation from uploaded documents or free-text prompts.

| Metric | Value |
|---|---|
| AI Model | Groq — Llama 3.3 70B Versatile |
| Max input text processed | 12,000 characters per request |
| Max AI output tokens | 8,000 tokens per generation |
| Generated quiz questions | 10 per study guide |
| Generated flashcards | ≥10 per study guide |
| Outline sections | 4–6 per guide, each with ≥3 lesson cards |
| Learning style modes | 3 (Visual, Auditory, Reading/Writing) |
| Supported upload formats | PDF, PPT, PPTX |
| AI chat temperature | 0.3 (study guide) / 0.3 (chat) |

**Key capabilities:**
- Topic-based or document-based study guide generation
- "Teacher Mode" with learning-style-specific pedagogy (Mind Mapping, Podcast Scripts, Cornell Notes)
- Auto-generated Mermaid.js diagrams for Visual learners (with built-in sanitizer for AI-generated syntax errors)
- Interactive quiz with hint, explanation, and 4 unique choices per question
- "Explain Like I'm 5" cards per sub-topic
- AI chat companion ("Cardo") that answers questions grounded in uploaded document context

### 4.2 Mock Exam Engine

Timed, multiple-choice exam simulator using real past entrance exam questions.

| Metric | Value |
|---|---|
| Total exam entries in registry | 26 |
| Exam families covered | 5 (USTET, UPCAT, ACET, PUPCET, DCAT) |
| Exams with status `ready` | 6 |
| Exams with status `coming-soon` | 20 |
| Processed exam JSON data files | 7 |
| Questions per exam | 30–100 (varies by subject) |
| Duration per exam | 15–120 minutes (varies by subject) |
| AI hint generation | Yes (Groq, max 30 words) |
| AI similar-question generation | Yes (Groq, JSON structured output) |
| AI route max duration | 60 seconds |

**Exam families & subjects:**

| Family | Subjects Available |
|---|---|
| USTET | Mathematics, English, Science, Mental Ability (2014–2015) |
| UPCAT | Language, Science, Mathematics, Reading, General Information |
| ACET | English, Math, Reading, Verbal, Vocabulary, Abstract, Logical, Numerical (2014–2015) |
| PUPCET | Full Reviewer |
| DCAT | Aptitude, Math, Reading, English, Science (2014) |

### 4.3 Dialect Learning Module

Duolingo-style Philippine dialect learning with AI-generated lessons and quizzes.

| Metric | Value |
|---|---|
| Fixed curriculum units | 6 |
| Lesson topic pool | 25 unique topics |
| AI model | Groq — Llama 3.3 70B Versatile |
| Generation temperature | 1.0 (high variety for language lessons) |
| Curriculum translation temp | 0.3 |
| Output format | Structured JSON (phrase, translation, hint, explanation, valid translations, 3 wrong options) |

**Curriculum units:**
1. Greetings & Introductions
2. Daily Routine
3. Food & Ordering
4. Navigation & Travel
5. Family & People
6. Emotions & Socializing

**Lesson topics include:** ordering street food, asking for discounts, describing weather, counting fruits, asking directions, expressing feelings, discussing farm animals, identifying body parts, transportation (jeepneys), emergency words, and more.

### 4.4 College Application Hub

University browser, school finder, and application tracker with calendar dashboard.

| Metric | Value |
|---|---|
| Universities in database | 25 |
| University types | 3 (State, Private, LUC) |
| Data fields per university | 13 (name, location, type, exam info, deadlines, requirements, scholarships, specializations, etc.) |
| Calendar event categories | 4 (Application, Deadline, Exam, Result) |
| School Finder | OpenStreetMap / Leaflet-based location picker with AI matching |

**Universities include:** UP System, Ateneo de Manila, DLSU, UST, FEU, Mapúa, PUP, MSU-IIT, Bicol U, Adamson, AdDU, SLU Baguio, USC Cebu, Xavier, Silliman, CPU, LSPU, BulSU, CvSU, BatStateU, PNU, TUP, UE, NU, San Beda.

### 4.5 Scholarship Feed

Curated and AI-augmented Philippine scholarship directory.

| Metric | Value |
|---|---|
| Static scholarships in database | 11 |
| Scholarship tiers | 4 (Government, Corporate, Private, NGO) |
| Assessment types | 5 (Exam, Interview, Grade Evaluation, Exam & Interview, Grades & Interview) |
| AI-generated scholarships per query | 9 (degree-specific, via Groq) |
| AI model temperature | 0.4 |

**Static scholarships include:** DOST-SEI Merit, DOST RA 7687, SM Foundation, Aboitiz College, Security Bank, CHED CSP, OWWA EDSP, Megaworld Foundation, GSIS Educational Subsidy, Petron Tulong Alalay, Manila City Government.

### 4.6 Smart Note-Taking (Tala)

GoodNotes-inspired note-taking workspace with multiple editor types.

| Metric | Value |
|---|---|
| Editor types | 4 (Document/Rich Text, PDF Annotator, Whiteboard, Notebook) |
| Note formatting modes | 3 (Cornell Notes, Outline, Flashcard) |
| AI note formatter model | Groq — Llama 3.3 70B Versatile |
| AI max tokens for notes | 2,048 |
| Rich text editor | TipTap with 12 extensions |
| Canvas/Whiteboard | Fabric.js |

**TipTap extensions:** StarterKit, CharacterCount, Color, Image, Link, Placeholder, Table, TableCell, TableHeader, TableRow, TextAlign, Underline.

### 4.7 Commuter Guide

AI-generated public transit routing with safety optimization.

| Metric | Value |
|---|---|
| AI model | Groq — Llama 3.3 70B Versatile |
| Optimization modes | 2 (Cheapest, Safety) |
| Transport modes | 8 (Walk, Jeepney, Bus, LRT, MRT, UV Express, Tricycle, Ferry) |
| Map integration | Leaflet + OpenStreetMap |
| AI temperature | 0.2 (factual routing) |

### 4.8 Learning Style Assessment

Questionnaire-based learning style identifier integrated with Study Buddy.

| Metric | Value |
|---|---|
| Learning styles supported | 4 (Visual, Auditory, Reading/Writing, Kinesthetic) |
| Integration | Tailors AI Chat and Teacher Mode content |

---

## 5. Technical Architecture

### 5.1 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.1 (App Router) |
| Runtime | React 19.2.4 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| AI Provider | Groq Cloud API |
| AI Model | Llama 3.3 70B Versatile (all endpoints) |
| Maps | Leaflet 1.9.4 + React-Leaflet 5.0.0 |
| Rich Text | TipTap 3.20.5 (12 extensions) |
| Canvas | Fabric.js 6.9.1 |
| Animation | Framer Motion 12.38.0 |
| Diagrams | Mermaid 11.13.0 |
| PDF Parsing | pdf2json 4.0.2 |
| Office Parsing | officeparser 6.0.7 |
| PDF Export | jsPDF 4.2.1 |
| Markdown | react-markdown 10.1.0 |
| Icons | lucide-react 0.475.0 |
| UI Primitives | Radix UI (react-slot) |
| Progress Bar | @tanem/react-nprogress 6.0.3 |

### 5.2 Codebase Metrics

| Metric | Value |
|---|---|
| Total source files | 63 |
| Total lines of code (incl. JSON/CSS) | ~28,341 |
| App route pages | 13 (incl. dynamic routes) |
| API route handlers | 9 |
| Reusable components | 20+ |
| Context providers | 1 (StudyContext) |
| Data/script utilities | 4 (batch-parse, parse-exam, test-groq, parse-all-exams) |
| npm dependencies | 34 |
| npm devDependencies | 7 |

### 5.3 API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/chat` | POST | AI study chat (context-grounded) |
| `/api/generate` | POST | Study guide generation (quiz, flashcards, diagrams) |
| `/api/upload` | POST | File parsing (PDF, PPT, PPTX) |
| `/api/notes` | POST | AI note formatting (Cornell, Outline, Flashcard) |
| `/api/mock-exam/ai` | POST | Hint & similar question generation |
| `/api/exam/[id]` | GET/POST | Fetch processed exam data by ID |
| `/api/dialect/curriculum` | POST | Dialect curriculum unit translation |
| `/api/dialect/lesson` | POST | Dialect lesson/quiz generation |
| `/api/scholarships` | POST | AI scholarship search by degree |
| `/api/commute` | POST | AI commute route generation |

### 5.4 App Routes

| Route | Description |
|---|---|
| `/` | Landing / Home page |
| `/onboarding` | User onboarding flow |
| `/study-buddy` | AI Study Guide + Chat |
| `/mock-exam` | Exam selection grid |
| `/mock-exam/[id]` | Timed exam session |
| `/dialect` | Dialect selection |
| `/dialect/[slug]` | Dialect lesson unit view |
| `/learning-styles` | Learning style assessment |
| `/college` | College application hub |
| `/tala` | Notes workspace dashboard |
| `/tala/document/[id]` | Rich text document editor |
| `/tala/pdf/[id]` | PDF annotator |
| `/tala/notebook/[id]` | Notebook editor |
| `/tala/whiteboard/[id]` | Canvas whiteboard |

---

## 6. Data Assets

| Asset | Count | Details |
|---|---|---|
| Exam registry entries | 26 | Across 5 exam families, 2014–2015 |
| Processed exam JSONs | 7 | Ready for mock exam engine |
| University profiles | 25 | With full admission data |
| Static scholarships | 11 | Government, Corporate, Private |
| Dialect lesson topics | 25 | Practical Filipino scenarios |
| Dialect curriculum units | 6 | Structured learning path |

---

## 7. AI Integration Summary

All AI features are powered by a single provider and model:

| Parameter | Value |
|---|---|
| Provider | Groq Cloud |
| Model | `llama-3.3-70b-versatile` |
| SDK | `groq-sdk` 1.1.2 (some routes use direct `fetch`) |
| Response format | `json_object` (structured) for most endpoints |
| Temperature range | 0.2 (commute) – 1.0 (dialect lessons) |

**AI-powered features count:** 7 distinct AI capabilities across 8 API routes.

---

## 8. Non-Functional Requirements

| Requirement | Implementation |
|---|---|
| Client-side storage | `localStorage` for notes, preferences, bookmarks |
| Authentication | None (client-side only, no user accounts) |
| Deployment target | Vercel (Node.js runtime) |
| File upload | FormData-based, server-side parsing with Node.js runtime |
| Responsiveness | Mobile-first design with Tailwind CSS |
| Animations | Framer Motion page transitions and micro-interactions |

---

## 9. Roadmap / Coming Soon

Based on exam registry `coming-soon` status:
- **20 additional exam modules** across USTET, UPCAT, ACET, PUPCET, and DCAT families
- Additional dialect support (beyond current dynamic dialect selection)
- Potential user authentication and progress persistence

---

*This PRD is auto-generated from the AralKada codebase. All metrics are derived directly from source code analysis — no estimated or fabricated numbers.*
