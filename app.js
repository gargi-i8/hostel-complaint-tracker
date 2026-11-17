// Main Application Script
import { auth, db } from './firebase-config.js';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
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
      const complaintDocRef = doc(db, 'complaints', referenceKey);
      const docSnapshot = await getDoc(complaintDocRef);

      if (!docSnapshot.exists()) {
        showTrackError(`No complaint found with reference "${referenceKey}". Please check the key and try again.`);
        return;
      }

      const data = docSnapshot.data();

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

  // ==========================================
  // Feature 3: Staff Portal Flow
  // ==========================================
  const staffLoginView = document.getElementById('staff-login-view');
  const staffLoginForm = document.getElementById('staff-login-form');
  const staffEmailInput = document.getElementById('staff-email');
  const staffPasswordInput = document.getElementById('staff-password');
  const staffLoginBtn = document.getElementById('staff-login-btn');
  const staffLoginError = document.getElementById('staff-login-error');

  const staffDashboardView = document.getElementById('staff-dashboard-view');
  const staffUserEmail = document.getElementById('staff-user-email');
  const staffLogoutBtn = document.getElementById('staff-logout-btn');
  const staffQueueLoading = document.getElementById('staff-queue-loading');
  const staffQueueEmpty = document.getElementById('staff-queue-empty');
  const staffQueueError = document.getElementById('staff-queue-error');
  const staffQueueNotice = document.getElementById('staff-queue-notice');
  const staffQueueList = document.getElementById('staff-queue-list');

  const VALID_STATUSES = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];

  function showStaffLoginError(message) {
    staffLoginError.textContent = message;
    staffLoginError.style.display = 'block';
  }

  function clearStaffLoginError() {
    staffLoginError.textContent = '';
    staffLoginError.style.display = 'none';
  }

  function showStaffQueueError(message) {
    staffQueueError.textContent = message;
    staffQueueError.style.display = 'block';
  }

  function clearStaffQueueError() {
    staffQueueError.textContent = '';
    staffQueueError.style.display = 'none';
  }

  function showStaffQueueNotice(message) {
    if (staffQueueNotice) {
      staffQueueNotice.textContent = message;
      staffQueueNotice.style.display = 'block';
      setTimeout(() => {
        if (staffQueueNotice) staffQueueNotice.style.display = 'none';
      }, 4000);
    }
  }

  // Handle Staff Sign In
  staffLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearStaffLoginError();

    const email = staffEmailInput.value.trim();
    const password = staffPasswordInput.value;

    if (!email || !password) {
      showStaffLoginError('Please enter both email and password.');
      return;
    }

    staffLoginBtn.disabled = true;
    staffLoginBtn.textContent = 'Signing In...';

    try {
      await signInWithEmailAndPassword(auth, email, password);
      staffLoginForm.reset();
    } catch (err) {
      console.error('Staff sign-in error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        showStaffLoginError('Invalid staff email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        showStaffLoginError('Too many failed sign-in attempts. Please try again later.');
      } else {
        showStaffLoginError(`Sign-in failed: ${err.message || 'Please check your credentials and try again.'}`);
      }
    } finally {
      staffLoginBtn.disabled = false;
      staffLoginBtn.textContent = 'Sign In';
    }
  });

  // Handle Staff Sign Out
  staffLogoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  });

  // Fetch and Render Staff Complaint Queue
  async function loadStaffQueue() {
    clearStaffQueueError();
    if (staffQueueNotice) staffQueueNotice.style.display = 'none';
    staffQueueLoading.style.display = 'block';
    staffQueueEmpty.style.display = 'none';
    staffQueueList.innerHTML = '';

    try {
      const complaintsCol = collection(db, 'complaints');
      const snapshot = await getDocs(complaintsCol);

      if (snapshot.empty) {
        staffQueueEmpty.style.display = 'block';
        return;
      }

      const complaints = [];
      snapshot.forEach((docSnap) => {
        complaints.push({ id: docSnap.id, ...docSnap.data() });
      });

      complaints.sort((a, b) => {
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;

        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      complaints.forEach((item) => {
        const itemCard = createQueueItemElement(item);
        staffQueueList.appendChild(itemCard);
      });
    } catch (err) {
      console.error('Error loading staff queue:', err);
      if (err.code === 'permission-denied') {
        showStaffQueueError(
          'Access Denied (permission-denied): You do not have permission to view the complaint queue. ' +
          'Ensure your Firebase user UID is listed in the /staff collection and Firestore rules allow staff listing.'
        );
      } else {
        showStaffQueueError(`Failed to load queue: ${err.message || 'Please check your connection and try again.'}`);
      }
    } finally {
      staffQueueLoading.style.display = 'none';
    }
  }

  // Create DOM Element for a Complaint Item in the Staff Queue
  function createQueueItemElement(complaint) {
    const card = document.createElement('div');
    card.className = `queue-item ${complaint.isUrgent ? 'urgent' : ''}`;
    card.id = `queue-item-${complaint.id}`;

    const currentOwner = complaint.assignedOwner || '';
    const currentStatus = complaint.status || 'Submitted';
    const currentExpected = complaint.expectedTime || '';

    card.innerHTML = `
      <div class="queue-item-header">
        <span class="queue-ref">Reference: <strong>${escapeHtml(complaint.id)}</strong></span>
        <div class="queue-header-actions">
          ${complaint.isUrgent ? '<span class="urgent-badge">Urgent Safety/Security</span>' : ''}
          <button 
            type="button" 
            class="delete-btn" 
            id="delete-btn-${complaint.id}" 
            aria-label="Delete complaint" 
            title="Delete complaint"
          >
            <svg class="trash-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            <span>Delete complaint</span>
          </button>
        </div>
      </div>

      <div class="queue-meta">
        <strong>Location:</strong> ${escapeHtml(complaint.location || '—')} &bull; 
        <strong>Category:</strong> ${escapeHtml(complaint.issueType || '—')}
      </div>

      <div class="queue-desc">${escapeHtml(complaint.description || '—')}</div>

      <form class="queue-update-form" id="update-form-${complaint.id}">
        <div class="queue-field">
          <label for="owner-${complaint.id}">Assigned Owner</label>
          <input 
            type="text" 
            id="owner-${complaint.id}" 
            name="assignedOwner" 
            placeholder="Staff / Technician Name"
            maxlength="100"
            value="${escapeHtml(currentOwner)}"
          >
        </div>

        <div class="queue-field">
          <label for="status-${complaint.id}">Status</label>
          <select id="status-${complaint.id}" name="status">
            ${VALID_STATUSES.map(s => `
              <option value="${s}" ${s === currentStatus ? 'selected' : ''}>${s}</option>
            `).join('')}
          </select>
        </div>

        <div class="queue-field full-width">
          <label for="expected-${complaint.id}">Expected Time / Next Update</label>
          <input 
            type="text" 
            id="expected-${complaint.id}" 
            name="expectedTime" 
            placeholder="e.g., Today by 5 PM, or parts ordered"
            maxlength="100"
            value="${escapeHtml(currentExpected)}"
          >
        </div>

        <div class="queue-field full-width">
          <button type="submit" class="update-btn" id="update-btn-${complaint.id}">Save Changes</button>
          <div class="update-feedback" id="feedback-${complaint.id}" style="display: none;"></div>
        </div>
      </form>
    `;

    // Attach event handler for updating this complaint
    const form = card.querySelector(`#update-form-${complaint.id}`);
    const ownerInput = card.querySelector(`#owner-${complaint.id}`);
    const statusSelect = card.querySelector(`#status-${complaint.id}`);
    const expectedInput = card.querySelector(`#expected-${complaint.id}`);
    const updateBtn = card.querySelector(`#update-btn-${complaint.id}`);
    const feedback = card.querySelector(`#feedback-${complaint.id}`);
    const deleteBtn = card.querySelector(`#delete-btn-${complaint.id}`);

    // Update Handler
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      feedback.style.display = 'none';
      feedback.className = 'update-feedback';

      const newOwner = ownerInput.value.trim();
      const newStatus = statusSelect.value;
      const newExpected = expectedInput.value.trim();

      if (!VALID_STATUSES.includes(newStatus)) {
        feedback.textContent = 'Please select a valid status.';
        feedback.className = 'update-feedback error';
        feedback.style.display = 'block';
        return;
      }

      updateBtn.disabled = true;
      updateBtn.textContent = 'Saving...';

      try {
        const complaintDocRef = doc(db, 'complaints', complaint.id);
        await updateDoc(complaintDocRef, {
          assignedOwner: newOwner,
          status: newStatus,
          expectedTime: newExpected,
          updatedAt: serverTimestamp()
        });

        feedback.textContent = 'Updated successfully.';
        feedback.className = 'update-feedback success';
        feedback.style.display = 'block';

        setTimeout(() => {
          if (feedback) feedback.style.display = 'none';
        }, 3000);
      } catch (err) {
        console.error('Error updating complaint:', err);
        feedback.className = 'update-feedback error';
        feedback.style.display = 'block';

        if (err.code === 'permission-denied') {
          feedback.textContent = 'Update failed (permission-denied): You do not have permission to update this record.';
        } else {
          feedback.textContent = `Update failed: ${err.message || 'Please try again.'}`;
        }
      } finally {
        updateBtn.disabled = false;
        updateBtn.textContent = 'Save Changes';
      }
    });

    // Delete Handler (Staff Only, with confirmation)
    deleteBtn.addEventListener('click', async () => {
      const confirmed = window.confirm(
        `Are you sure you want to delete this complaint (${complaint.id})? This action cannot be undone.`
      );
      if (!confirmed) return;

      deleteBtn.disabled = true;
      const btnSpan = deleteBtn.querySelector('span');
      if (btnSpan) btnSpan.textContent = 'Deleting...';
      clearStaffQueueError();

      try {
        const complaintDocRef = doc(db, 'complaints', complaint.id);
        await deleteDoc(complaintDocRef);

        // Remove card from visible queue
        card.remove();

        // Check if queue is now empty
        const remainingItems = staffQueueList.querySelectorAll('.queue-item');
        if (remainingItems.length === 0) {
          staffQueueEmpty.style.display = 'block';
        }

        showStaffQueueNotice(`Complaint ${complaint.id} was successfully deleted.`);
      } catch (err) {
        console.error('Error deleting complaint:', err);
        deleteBtn.disabled = false;
        if (btnSpan) btnSpan.textContent = 'Delete complaint';

        if (err.code === 'permission-denied') {
          showStaffQueueError(
            `Delete failed (permission-denied): Firestore security rules currently deny deleting complaint ${complaint.id}.`
          );
        } else {
          showStaffQueueError(`Failed to delete complaint: ${err.message || 'Please try again.'}`);
        }
      }
    });

    return card;
  }

  // Utility to prevent XSS in rendered complaint content
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Auth state listener: Toggle between Staff Login and Dashboard
  onAuthStateChanged(auth, (user) => {
    if (user) {
      staffLoginView.style.display = 'none';
      staffDashboardView.style.display = 'block';
      staffUserEmail.textContent = user.email || user.uid;
      loadStaffQueue();
    } else {
      staffLoginView.style.display = 'block';
      staffDashboardView.style.display = 'none';
      staffUserEmail.textContent = '';
      staffQueueList.innerHTML = '';
      clearStaffLoginError();
      clearStaffQueueError();
    }
  });
});
