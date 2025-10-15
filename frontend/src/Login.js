import React from 'react';
import './Login.css';

function Login({ onLogin }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin) onLogin();
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <img src="/login-logo.png" alt="Login Logo" className="login-logo" />
        <h1 className="login-title">SUPERHEROES</h1>
        <div className="login-input-group">
          <span className="login-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-3-3.87"></path><path d="M4 21v-2a4 4 0 0 1 3-3.87"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </span>
          <input type="text" placeholder="Username" className="login-input" autoComplete="username" />
        </div>
        <div className="login-input-group">
          <span className="login-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-lock"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </span>
          <input type="password" placeholder="Password" className="login-input" autoComplete="current-password" />
        </div>
        <button type="submit" className="login-btn">LOG IN</button>
        <div className="login-forgot">Forgot password?</div>
      </form>
    </div>
  );
}

export default Login;
