// frontend/js/auth.js
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const errorDisplay = document.getElementById('error-message'); // Make sure you have this in HTML

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorDisplay) errorDisplay.textContent = '';

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const data = await window.apiService.login(email, password);
        console.log('Login successful:', data);
        
        // Token save karein aur dashboard par redirect karein
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard.html'; 
      } catch (err) {
        if (errorDisplay) errorDisplay.textContent = err.message;
      }
    });
  }
});
