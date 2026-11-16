# Hostel Complaint Tracker — Product Brief

## MVP scope
My MVP lets hostel students report and track facility complaints so they can see that a complaint was received, who is handling it, and its latest status or expected repair time. It will not include chat, payments, bookings, or automatic escalation.

## User journey
1. A student notices a hostel facility problem.
2. They open Report an issue.
3. They enter the location, issue type, and description.
4. They mark it urgent if it concerns safety or security.
5. They submit and receive a complaint number.
6. They check the complaint's status, owner, and expected repair time or next update.
7. Staff update the complaint; the student sees the change.

## Must-have features and interview evidence
- Submit a complaint with its location, issue type, and description. Students described specific problems and locations, and one requested a digital complaint record with room and problem details.
- Urgent marking for safety or security issues. Students described a burning smell near a geyser switchboard and a door lock that would not secure.
- Confirmation with a complaint number. Students said they had no number or written confirmation to refer to.
- Student tracking showing status, owner, and expected time. Across interviews, students described unclear responsibility, delays, and no reliable repair update.
- Staff queue to assign an owner and update status and expected time. This is the staff-side function needed to provide the ownership and updates students asked for.

## Wireframe
Use the Hostel Complaint Tracker Figma prototype as the screen reference:
https://www.figma.com/make/Ku57vIg1m93TmPJIki23w5/Hostel-Complaint-Tracker?fullscreen=1&t=30KhHusjHTEKsRG0-1&code-node-id=0-6

## Tech choice
Responsive web app with Firebase Firestore for saved complaint records shared between student and staff views.