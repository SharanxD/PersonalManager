import React, { useState } from 'react';
import '../styles/LoginPage.css';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
 const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Login Handling Function
  const handleLogin = async (e) => {
    e.preventDefault();
    const userData = { username, password };

    try {
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (res.ok) {
        console.log('Login successful');
        localStorage.setItem("jwttoken",data.token);
        localStorage.setItem("username",username);        //Setting up the JWT for the user session.
        localStorage.setItem("isAuthenticated", "true");
        navigate('/home');
      } else {
        setError(data.error || 'Login failed');
        alert("Login Failed.");
      }
    } catch (err) {
      setError('Something went wrong');
      alert("Wrong.");
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex p-0">
      <div className="col-md-7 d-none d-md-block image-side shadow-lg" />
      <div className="col-md-5 d-flex align-items-center justify-content-center bg-white p-5 shadow-lg">

        
        <div className="w-100 shadow-lg p-3 mb-5 rounded" style={{ maxWidth: '500px' }}>
          <h2 className="text-center mb-4">Personal Manager</h2>
          <h4 className="text-center mb-4 text-muted">Login</h4>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">Login</button>
          </form>

          <p className="text-center mt-3">
            Don’t have an account? <a href="/signup">Sign up</a>
          </p>
        </div>
        </div>
      
    </div>
  );
};

export default LoginPage;
