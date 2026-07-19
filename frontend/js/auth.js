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
        if (globalStatus) {
          globalStatus.style.color = 'red';
          globalStatus.textContent = `Login Error: ${err.message}`;
        }
      }
    });
  }

  // Handle Register submission - Keys are fixed here to match Flask Backend requirements
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (globalStatus) globalStatus.textContent = '';

      // Inputs se values correct format me fetch ho rahi hain
      const usernameVal = document.getElementById('register-username').value;
      const emailVal = document.getElementById('register-email').value;
      const passwordVal = document.getElementById('register-password').value;

      try {
        // window.apiService ko values call targets standard variables ke mutabik assign hongi
        const data = await window.apiService.register(usernameVal, emailVal, passwordVal);
        console.log('Registration successful data response:', data);
        
        if (globalStatus) {
          globalStatus.style.color = 'green';
          globalStatus.textContent = 'Registration Successful! You can now log in.';
        }
        alert('Registration Successful! You can now log in.');
        registerForm.reset(); // Form fields clear karne ke liye
      } catch (err) {
        if (globalStatus) {
          globalStatus.style.color = 'red';
          globalStatus.textContent = `Registration Error: ${err.message}`;
        }
      }
    });
  }
});
