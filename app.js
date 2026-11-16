// Main Application Script
import { db } from './firebase-config.js';
import { collection, doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
  // Navigation elements
  const navReport = document.getElementById('nav-report');
  const navTrack = document.getElementById('nav-track');
  const navStaff = document.getElementById('nav-staff');

  const screenReport = document.getElementById('screen-report');
  const screenTrack = document.getElementById('screen-track');
  const screenStaff = document.getElementById('screen-staff');

  const navButtons = [
    { button: navReport, screen: screenReport },
    { button: navTrack, screen: screenTrack },
    { button: navStaff, screen: screenStaff }
  ];

  function setActiveTab(selectedNav, selectedScreen) {
    navButtons.forEach(({ button, screen }) => {
      button.classList.toggle('active', button === selectedNav);
      screen.classList.toggle('active', screen === selectedScreen);
    });
  }

  navReport.addEventListener('click', () => setActiveTab(navReport, screenReport));
  navTrack.addEventListener('click', () => setActiveTab(navTrack, screenTrack));
  navStaff.addEventListener('click', () => setActiveTab(navStaff, screenStaff));

  // Complaint Submission Form elements
  const complaintForm = document.getElementById('complaint-form');
  const locationInput = document.getElementById('complaint-location');
  const issueTypeSelect = document.getElementById('complaint-issue-type');
  const descriptionTextarea = document.getElementById('complaint-description');
  const urgentCheckbox = document.getElementById('complaint-urgent');
  const submitBtn = document.getElementById('submit-btn');
  const errorNotice = document.getElementById('submission-error');
  const successCard = document.getElementById('submission-success');
  const referenceNumberDisplay = document.getElementById('reference-number');
  const submitAnotherBtn = document.getElementById('submit-another-btn');

  function showError(message) {
    errorNotice.textContent = message;
    errorNotice.style.display = 'block';
  }

  function clearError() {
    errorNotice.textContent = '';
    errorNotice.style.display = 'none';
  }

  // Allowed issue types matching the plan
  const ALLOWED_ISSUE_TYPES = [
    'Electrical', 'Plumbing', 'Furniture', 'Door/Lock', 'Mess', 'Wi-Fi', 'Other'
  ];

  complaintForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const location = locationInput.value.trim();
    const issueType = issueTypeSelect.value;
    const description = descriptionTextarea.value.trim();
    const isUrgent = Boolean(urgentCheckbox.checked);

    // Validation
    if (location.length < 3 || location.length > 100) {
      showError('Please provide a valid location between 3 and 100 characters.');
      return;
    }

    if (!ALLOWED_ISSUE_TYPES.includes(issueType)) {
      showError('Please select a valid issue type.');
      return;
    }

    if (description.length < 5 || description.length > 1000) {
      showError('Please provide a description between 5 and 1000 characters.');
      return;
    }

    // Prepare submission state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      // Generate a new Firestore document reference with a random 20-character auto-ID
      const complaintsCollection = collection(db, 'complaints');
      const newComplaintRef = doc(complaintsCollection);
      const randomComplaintId = newComplaintRef.id;

      // Save document to Firestore with exact expected fields
      await setDoc(newComplaintRef, {
        location: location,
        issueType: issueType,
        description: description,
        isUrgent: isUrgent,
        status: 'Submitted',
        assignedOwner: '',
        expectedTime: '',
        createdAt: serverTimestamp()
      });

      // Show reference number only after successful save
      referenceNumberDisplay.textContent = randomComplaintId;
      complaintForm.style.display = 'none';
      successCard.style.display = 'block';

      // Reset form fields
      complaintForm.reset();
    } catch (err) {
      console.error('Error submitting complaint:', err);

      if (err.code === 'permission-denied') {
        showError(
          'Submission failed (permission-denied): Firestore Production mode rules blocked saving. ' +
          'Please ensure the complaints create rule is published in your Firebase Console.'
        );
      } else {
        showError(`Submission failed: ${err.message || 'Please check your connection and try again.'}`);
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Complaint';
    }
  });

  // Handle "Submit Another Complaint" action
  submitAnotherBtn.addEventListener('click', () => {
    clearError();
    successCard.style.display = 'none';
    complaintForm.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Complaint';
  });
});
