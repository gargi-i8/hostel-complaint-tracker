// Main Application Script
import { db } from './firebase-config.js';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js';

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

  // ==========================================
  // Feature 1: Submit Complaint Flow
  // ==========================================
  const complaintForm = document.getElementById('complaint-form');
  const locationInput = document.getElementById('complaint-location');
  const issueTypeSelect = document.getElementById('complaint-issue-type');
  const descriptionTextarea = document.getElementById('complaint-description');
  const urgentCheckbox = document.getElementById('complaint-urgent');
  const submitBtn = document.getElementById('submit-btn');
  const submitErrorNotice = document.getElementById('submission-error');
  const successCard = document.getElementById('submission-success');
  const referenceNumberDisplay = document.getElementById('reference-number');
  const submitAnotherBtn = document.getElementById('submit-another-btn');

  function showSubmitError(message) {
    submitErrorNotice.textContent = message;
    submitErrorNotice.style.display = 'block';
  }

  function clearSubmitError() {
    submitErrorNotice.textContent = '';
    submitErrorNotice.style.display = 'none';
  }

  const ALLOWED_ISSUE_TYPES = [
    'Electrical', 'Plumbing', 'Furniture', 'Door/Lock', 'Mess', 'Wi-Fi', 'Other'
  ];

  complaintForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearSubmitError();

    const location = locationInput.value.trim();
    const issueType = issueTypeSelect.value;
    const description = descriptionTextarea.value.trim();
    const isUrgent = Boolean(urgentCheckbox.checked);

    if (location.length < 3 || location.length > 100) {
      showSubmitError('Please provide a valid location between 3 and 100 characters.');
      return;
    }

    if (!ALLOWED_ISSUE_TYPES.includes(issueType)) {
      showSubmitError('Please select a valid issue type.');
      return;
    }

    if (description.length < 5 || description.length > 1000) {
      showSubmitError('Please provide a description between 5 and 1000 characters.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      const complaintsCollection = collection(db, 'complaints');
      const newComplaintRef = doc(complaintsCollection);
      const randomComplaintId = newComplaintRef.id;

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

      referenceNumberDisplay.textContent = randomComplaintId;
      complaintForm.style.display = 'none';
      successCard.style.display = 'block';
      complaintForm.reset();
    } catch (err) {
      console.error('Error submitting complaint:', err);

      if (err.code === 'permission-denied') {
        showSubmitError(
          'Submission failed (permission-denied): Firestore Production mode rules blocked saving. ' +
          'Please ensure the complaints create rule is published in your Firebase Console.'
        );
      } else {
        showSubmitError(`Submission failed: ${err.message || 'Please check your connection and try again.'}`);
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Complaint';
    }
  });

  submitAnotherBtn.addEventListener('click', () => {
    clearSubmitError();
    successCard.style.display = 'none';
    complaintForm.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Complaint';
  });

  // ==========================================
  // Feature 2: Track Complaint Flow
  // ==========================================
  const trackForm = document.getElementById('track-form');
  const trackReferenceInput = document.getElementById('track-reference');
  const trackBtn = document.getElementById('track-btn');
  const trackError = document.getElementById('track-error');
  const trackResult = document.getElementById('track-result');

  const resultId = document.getElementById('result-id');
  const resultStatus = document.getElementById('result-status');
  const resultStatusText = document.getElementById('result-status-text');
  const resultOwner = document.getElementById('result-owner');
  const resultExpected = document.getElementById('result-expected');
  const resultLocation = document.getElementById('result-location');
  const resultCategory = document.getElementById('result-category');
  const resultUrgency = document.getElementById('result-urgency');
  const resultDescription = document.getElementById('result-description');

  function showTrackError(message) {
    trackError.textContent = message;
    trackError.style.display = 'block';
    trackResult.style.display = 'none';
  }

  function clearTrackError() {
    trackError.textContent = '';
    trackError.style.display = 'none';
  }

  trackForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearTrackError();
    trackResult.style.display = 'none';

    const referenceKey = trackReferenceInput.value.trim();

    if (!referenceKey) {
      showTrackError('Please enter a complaint reference key.');
      return;
    }

    trackBtn.disabled = true;
    trackBtn.textContent = 'Checking...';

    try {
      // Direct single-document read using the exact reference key
      const complaintDocRef = doc(db, 'complaints', referenceKey);
      const docSnapshot = await getDoc(complaintDocRef);

      if (!docSnapshot.exists()) {
        showTrackError(`No complaint found with reference "${referenceKey}". Please check the key and try again.`);
        return;
      }

      const data = docSnapshot.data();

      // Render retrieved data
      resultId.textContent = docSnapshot.id;
      const statusValue = data.status || 'Submitted';
      resultStatus.textContent = statusValue;
      resultStatusText.textContent = statusValue;

      resultOwner.textContent = data.assignedOwner && data.assignedOwner.trim() 
        ? data.assignedOwner 
        : 'Unassigned';

      resultExpected.textContent = data.expectedTime && data.expectedTime.trim() 
        ? data.expectedTime 
        : 'Pending review';

      resultLocation.textContent = data.location || '—';
      resultCategory.textContent = data.issueType || '—';
      resultUrgency.textContent = data.isUrgent 
        ? 'Urgent (Safety or Security issue)' 
        : 'Normal';

      resultDescription.textContent = data.description || '—';

      trackResult.style.display = 'block';
    } catch (err) {
      console.error('Error retrieving complaint:', err);

      if (err.code === 'permission-denied') {
        showTrackError(
          'Tracking failed (permission-denied): Firestore Production mode rules blocked retrieving this document. ' +
          'Please ensure the single-document "get" rule is published in your Firebase Console.'
        );
      } else {
        showTrackError(`Unable to retrieve complaint: ${err.message || 'Please check your connection and try again.'}`);
      }
    } finally {
      trackBtn.disabled = false;
      trackBtn.textContent = 'Check Status';
    }
  });
});
