# roomie. frontend rules

## Scope
- UI and UX work only. Never change backend behaviour or invent endpoints.
- Inspect the repo first. Follow the framework, styling approach, API client and
  folder structure already in use. Do not add new frameworks or heavy libraries.
- Before editing, write a short plan listing the files you will touch.
- If these rules conflict with the code, trust the code and tell me.

## Honesty rules (never break)
- Only auth, profile, preferences and listings APIs exist. Anything else (matches, chat,
  habits and budget, roommate pact, contacting an owner, saved listings) must be
  hidden or shown as a clearly disabled "Coming soon". It must never look functional.
- No hard-coded sample data, fake counts or fake badges in real code paths.
- The "Verified" badge means email ownership only. Label it "Email verified".
- Never show raw enum values (ANY, PRIVATE_ROOM, SEMI_FURNISHED, and so on).
  Always map them to friendly labels.
- Never show or request another user's email.

## API facts
- Listing search: GET /api/listings with city, locality, minRent, maxRent, roomType,
  furnishing, genderAllowed, availableBy, page, size (max 50), sort
  (newest | rent | available), direction. Response: content, page, size,
  totalElements, totalPages.
- Listing create: multipart/form-data, part "listing" (JSON) plus optional "photos".
  Max 10 photos, JPEG/PNG/WebP, 5 MB each.
- Profile: 404 on GET /api/profile/me means no profile yet, so show the profile form.
- Errors: 401 means log in again. Login 403 means the email is not verified.
  429 means too many attempts.
- Limits: title 120, description 2000, bio 1000, age 18-100, rent 1 to 1,000,000.
- Preferences: GET /api/preferences/me (404 means not set yet, so show the empty form)
  and PUT /api/preferences/me (creates or updates; the same body is returned).
  Fields: lookingFor (NEED_ROOM | HAVE_ROOM), sleepSchedule (EARLY_BIRD | NORMAL | NIGHT_OWL),
  cleanliness 1-5, noiseLevel 1-5, diet (VEG | EGG | NON_VEG | NO_PREFERENCE),
  smoking and drinking (YES | NO | OCCASIONAL), guests (NEVER | SOMETIMES | OFTEN),
  workMode (WFH | OFFICE | HYBRID), budgetMin and budgetMax (0 to 1,000,000 INR per month,
  max not below min), genderPreference (ANY | SAME_GENDER | MALE | FEMALE, defaults to ANY),
  moveInDate (optional, not in the past), dealBreakers (list, max 8, only these names:
  sleepSchedule, cleanliness, noiseLevel, diet, smoking, drinking, guests, workMode).
  A 400 on save returns a message in the response; show it to the user.

## Formatting
- Money: Intl en-IN, for example ₹1,50,000. Dates: "1 Dec 2026".
- Correct pluralisation ("1 spot open", "2 spots open").

## Quality bar (check before finishing)
- Loading, empty and error states exist for every data screen.
- Works at 390px, 768px and 1440px. Tap targets at least 44px.
- Keyboard accessible, visible focus, WCAG AA contrast, labels on inputs.
- Images lazy-loaded, with a placeholder when there is no photo.

## When done
- Summarise what changed, anything blocked by a missing backend feature, and any
  mismatch between the UI and these API facts.