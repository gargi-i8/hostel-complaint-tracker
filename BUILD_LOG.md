# Build Log: Hostel Complaint Tracker

This build log documents the actual prompts, architectural decisions, setup changes, feature implementations, issues encountered, and resolutions throughout the project's development.

---

## 1. Project Overview & Must-Have Scope

The project objective defined in [PRODUCT_BRIEF.md](file:///Users/gargi/Documents/GitHub/hostel-complaint-tracker/PRODUCT_BRIEF.md) is a facility complaint tracker for hostel students and staff, strictly scoped to five Must-Have features:
1. **Feature 1:** Submit a complaint with location, issue type, and description.
2. **Feature 2:** Mark safety or security complaints as urgent.
3. **Feature 3:** Show a complaint reference number after submission.
4. **Feature 4:** Let the student track status, assigned owner, and expected time or next update (on-demand single lookup; no real-time listeners).
5. **Feature 5:** Let staff view the queue, assign an owner, and update status and expected time.

---

## 2. Architectural Decisions & Security Model

* **Frontend Architecture:** Static Web Application using plain HTML5, CSS3, and modern JavaScript (ES Modules). No build step, bundler, or package manager.
* **Backend Services:** Firebase Authentication and Cloud Firestore imported directly via Google's Browser CDN (`https://www.gstatic.com/firebasejs/13.3.0/...`).
* **Student Privacy & Capability-Key Access Model:**
  * Students do not create accounts or sign in.
  * Forms and database records do not collect student names, roll numbers, room resident identities, or contact details.
  * Each complaint ID is generated as a cryptographically random, 20-character Firestore Auto-ID. This ID serves as a private capability key.
  * Public listing of complaints is denied. Unauthenticated read access is strictly limited to single-document direct lookups by exact document ID (`allow get: if true;`, `allow list: if false;`).
  * A prominent privacy notice informs students that anyone with the reference key can view the location and description.
* **Staff Authorization Model:**
  * Staff authenticate with Firebase Authentication (Email/Password).
  * Authorization is verified against a whitelist collection in Firestore (`/staff/{uid}`).
  * Security rules enforce that only verified staff can list the complaints collection and update status, assigned owner, and expected time.

---

## 3. Timeline of Events, Issues, and Resolutions

### Phase 1: Planning and Initial Scaffolding Attempt
* **Prompt/Goal:** Read `PRODUCT_BRIEF.md`, draft an implementation plan, and scaffold the initial project shell.
* **Initial Plan:** Proposed a React + Vite setup.
* **What Broke (The Stalled `npm install`):**
  * When the initial Vite scaffold files (`package.json`, `vite.config.js`, `src/`) were created and `npm install` was run, the background install process (`task-34`) hung indefinitely with 0 bytes of log output.
  * **Cause:** The sandboxed execution environment isolates network access, blocking outbound package downloads from `registry.npmjs.org`.
* **Resolution:**
  * The background npm process was killed and cancelled.
  * Node.js package managers, React, and Vite were completely dropped.
  * The temporary Vite files (`package.json`, `vite.config.js`, `src/`) were deleted while preserving [PRODUCT_BRIEF.md](file:///Users/gargi/Documents/GitHub/hostel-complaint-tracker/PRODUCT_BRIEF.md) and `.git`.
  * The project pivoted to plain HTML, CSS, and vanilla JavaScript using Firebase modular scripts directly from Google's static CDN.

---

### Phase 2: Static Scaffold & Firebase CDN Configuration
* **What was built:**
  * [index.html](file:///Users/gargi/Documents/GitHub/hostel-complaint-tracker/index.html): Semantic layout with responsive meta tags, navigation tabs, and initial placeholder cards for the three screens.
  * [style.css](file:///Users/gargi/Documents/GitHub/hostel-complaint-tracker/style.css): Custom styles for navigation, responsive card containers, and notices.
  * [firebase-config.js](file:///Users/gargi/Documents/GitHub/hostel-complaint-tracker/firebase-config.js): Initialized with user-provided Firebase project credentials (`apiKey`, `authDomain`, `projectId`, etc.) and modular imports from `https://www.gstatic.com/firebasejs/13.3.0/` for `firebase-app.js`, `firebase-auth.js`, and `firebase-firestore.js`.
  * [app.js](file:///Users/gargi/Documents/GitHub/hostel-complaint-tracker/app.js): Tab navigation controller to switch between Report, Track, and Staff screens without reloads.
* **Local Serving:** Instructions provided to serve via Python's built-in HTTP server (`python3 -m http.server 8000`) to support browser ES module imports.
* **Browser Verification:** [student to fill in]

---

### Phase 3: Must-Have Features 1, 2 & 3 — Student Complaint Submission, Urgency & Reference Confirmation
* **What was built:**
  * Form in [index.html](file:///Users/gargi/Documents/GitHub/hostel-complaint-tracker/index.html) with:
    * `Location` (text input, 3–100 characters).
    * `Issue Type` dropdown (`Electrical`, `Plumbing`, `Furniture`, `Door/Lock`, `Mess`, `Wi-Fi`, `Other`).
    * `Description` (textarea, 5–1000 characters).
    * `Urgent` checkbox for safety and security hazards.
    * Privacy notice warning students not to submit personal data.
    * Confirmation card displaying the reference key (hidden until save succeeds).
  * Logic in [app.js](file:///Users/gargi/Documents/GitHub/hostel-complaint-tracker/app.js):
    * Generated a random 20-character auto-ID using `doc(collection(db, 'complaints'))`.
    * Saved record with strict initial schema: `location`, `issueType`, `description`, `isUrgent`, `status: "Submitted"`, `assignedOwner: ""`, `expectedTime: ""`, and `createdAt: serverTimestamp()`.
    * Revealed the reference key only after the `setDoc` promise resolved successfully.
* **Security & Production Rules:** Added error handling for `permission-denied` and documented the required create security rule with schema validation.
* **Browser Verification:** [student to fill in]

---

### Phase 4: Must-Have Feature 4 — Student Tracking Flow (On-Demand Lookup)
* **What was built:**
  * Tracking view in [index.html](file:///Users/gargi/Documents/GitHub/hostel-complaint-tracker/index.html) with reference key input and status display card.
  * Logic in [app.js](file:///Users/gargi/Documents/GitHub/hostel-complaint-tracker/app.js):
    * On-demand single-document read: `getDoc(doc(db, 'complaints', referenceKey))`. (Does not use real-time listeners or polling, keeping queries minimal).
    * Rendered: `status`, `assignedOwner` (or "Unassigned"), `expectedTime` (or "Pending review"), `location`, `issueType`, `isUrgent`, and `description`.
    * Handled empty inputs, non-existent documents (`!docSnapshot.exists()`), and permission errors.
* **Security Rules:** Documented `allow get: if true;` while keeping `allow list: if false;` to deny collection enumeration.
* **Browser Verification:** [student to fill in]

---

### Phase 5: Must-Have Feature 5 — Staff Portal & Queue Management
* **What was built:**
  * Staff portal section in [index.html](file:///Users/gargi/Documents/GitHub/hostel-complaint-tracker/index.html) with:
    * Staff sign-in view (email and password inputs).
    * Staff queue view with current user email display and sign-out button.
  * Logic in [app.js](file:///Users/gargi/Documents/GitHub/hostel-complaint-tracker/app.js):
    * Authentication handled via `signInWithEmailAndPassword`, `signOut`, and `onAuthStateChanged`.
    * Queue retrieved with `getDocs(collection(db, 'complaints'))`.
    * Urgent complaints visually highlighted with a red indicator and sorted to the top.
    * Complaint cards equipped with update forms allowing staff to edit only `assignedOwner`, `status` (`Submitted`, `Assigned`, `In Progress`, `Resolved`), and `expectedTime`, setting `updatedAt: serverTimestamp()`.
    * Error handling for invalid credentials, permission denial, and update errors.
* **Security Rules:** Documented the complete security ruleset including `isStaff()` checking the `/staff/{uid}` whitelist collection.
* **Browser Verification:** [student to fill in]

---

## 4. Current Verification Status

| Step / Feature | Implementation Status | Browser Verification Status |
| :--- | :--- | :--- |
| HTML/CSS/JS Scaffold & Local HTTP Server | Complete | [student to fill in] |
| Firebase CDN Configuration | Complete | [student to fill in] |
| Student Complaint Submission Form | Complete | [student to fill in] |
| Urgency Marking & Privacy Notice | Complete | [student to fill in] |
| Random Reference Generation & Post-save Display | Complete | [student to fill in] |
| Student Single-Document Tracking (On-demand) | Complete | [student to fill in] |
| Staff Authentication & Sign Out | Complete | [student to fill in] |
| Staff Queue & Urgent Prioritization | Complete | [student to fill in] |
| Staff Status, Owner & Time Updates | Complete | [student to fill in] |

*(Note: In accordance with project instructions, browser tests are marked as "[student to fill in]" until confirmed by the student in the browser.)*
