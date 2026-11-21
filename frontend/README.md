# Roomie — Flatmate Finder Frontend

A frontend designed to match the **roomie.** visual design and seamlessly integrate with the Spring Boot backend API.

## Features

1. **Pixel-Perfect Hero & Landing Page (Matching Reference Design)**:
   - **Header**: `roomie.` brand identity with terracotta heart emblem, navigation links (`Find a flatmate`, `How it works`), live API connectivity badge, and `Join roomie →` pill CTA.
   - **Hero Section**:
     - Pill badge: `✨ Make room for your next chapter`
     - Typography: *"Your next place starts with **your people.***"*
     - Search pill: Location pin + *"Which city feels like home?"* + *"Find my people →"*
     - Visuals: Dual arched portrait frames with floating pill badge (*"🔴 Your kind of people are here"*) and *"Room for real life"* feature card.
   - **How It Works**: 3-step guide detailing the lifestyle quiz, ID verification, and roommate agreements.
   - **Explore Flatmates**: Filterable flatmate cards with match scores, routine badges (early riser, night owl, diet, cleanliness), and instant connection actions.

2. **Full Authentication Integration**:
   - **Sign Up**: Registers user via `POST /api/auth/register` (email, password).
   - **OTP Verification**: Verifies email via `POST /api/auth/verify-otp` with resend capability (`POST /api/auth/resend-otp`).
   - **Log In**: Authenticates via `POST /api/auth/login` and securely saves JWT in `localStorage`.
   - **Offline / Demo Mode**: Built-in fallback so the UI can be tested end-to-end even before the local database or SMTP email service is started.

3. **User Home Page (Dashboard)**:
   - **Recommended Matches**: Interactive lifestyle compatibility matches with city and budget filtering.
   - **My Habits & Budget**: Full preference editor matching backend entities (sleep schedule, cleanliness scale, diet, work mode, monthly budget).
   - **Chats & Connections**: Real-time simulated direct messaging with prospective housemates.
   - **Roommate Agreement Pact**: Downloadable housemate agreement with fair utility splitting, quiet hours, and chore rules.

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173`.
All requests to `/api/*` are automatically proxied to the Spring Boot backend at `http://localhost:8080`.
