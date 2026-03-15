// Cookie banner
(function() {
  var consent = localStorage.getItem('cookie-consent');
  if (!consent) {
    document.addEventListener('DOMContentLoaded', function() {
      var banner = document.getElementById('cookie-banner');
      if (banner) banner.style.display = 'flex';
    });
  }
})();

function acceptCookies() {
  localStorage.setItem('cookie-consent', 'accepted');
  var b = document.getElementById('cookie-banner');
  if (b) b.style.display = 'none';
}

function declineCookies() {
  localStorage.setItem('cookie-consent', 'declined');
  var b = document.getElementById('cookie-banner');
  if (b) b.style.display = 'none';
}
