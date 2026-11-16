// Main Application Script
// Handles placeholder screen navigation without Firebase reads, writes, or sign-in yet

document.addEventListener('DOMContentLoaded', () => {
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
});
