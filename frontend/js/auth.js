// frontend/js/auth.js
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const globalStatus = document.getElementById('global-status');

  // Handle Login submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (globalStatus) globalStatus.textContent = '';

      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      try {
        const data = await window.apiService.login(email, password);
        console.log('Login successful data response:', data);
        
        if (data && data.token) {
          localStorage.setItem('token', data.token);
          alert('Login Successful!');
        } else {
          alert('Logged in successfully (No token returned).');
        }
      } catch (err) {
        if (globalStatus) globalStatus.textContent = `Login Error: ${err.message}`;
      }
    });
  }

  // Handle Register submission
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (globalStatus) globalStatus.textContent = '';

      const username = document.getElementById('register-username').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;

      try {
        const data = await window.apiService.register(username, email, password);
        console.log('Registration successful data response:', data);
        alert('Registration Successful! You can now log in.');
      } catch (err) {
        if (globalStatus) globalStatus.textContent = `Registration Error: ${err.message}`;
      }
    });
  }
});
