document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.sidebar a');
  const sections = document.querySelectorAll('.main-content .section');

  function showSection(id) {
    sections.forEach(sec => sec.classList.remove('active'));
    links.forEach(link => link.classList.remove('active'));

    const targetSection = document.getElementById(id);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    const activeLink = document.querySelector(`.sidebar a[href="#${id}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Handle clicks
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.getAttribute('href').substring(1);
      history.pushState(null, null, `#${id}`);
      showSection(id);
    });
  });

  // Handle initial load based on hash
  const initialHash = window.location.hash.substring(1) || 'intro';
  showSection(initialHash);

  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.substring(1) || 'intro';
    showSection(hash);
  });
});
