import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [cnfpassword, setCnfPassword] = useState('');
  const [error, setError] = useState('');
// Handling a new Sign up
  const handleSubmit = async (e) => {
    e.preventDefault();
    if(password!==cnfpassword){
      alert("Passwords dont match.")
      return;
    }

    const userData = { username, password };

    try {
      const res = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (res.ok) {
        alert('User created successfully');
        navigate('/login');
      } else {
        setError(data.error || 'User Creation Failed');
        alert("User Creation Failed");
      }
    } catch (err) {
      setError('Something went wrong');
      alert('Something went wrong');
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex p-0">
      <div className="col-md-7 d-none d-md-block image-side shadow-lg" />
      <div className="col-md-5 d-flex align-items-center justify-content-center bg-white p-5 shadow-lg">

        
        <div className="w-100 shadow-lg p-3 mb-5 rounded" style={{ maxWidth: '500px' }}>
          <h2 className="text-center mb-4">Personal Manager</h2>
          <h4 className="text-center mb-4 text-muted">SignUp</h4>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
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
                className={`form-control ${password && cnfpassword && password === cnfpassword ? 'border-success' : ''}`}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="cnfpassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                className={`form-control ${password && cnfpassword && password === cnfpassword ? 'border-success' : ''}`}
                id="confirmpassword"
                value={cnfpassword}
                onChange={(e) => setCnfPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">Login</button>
          </form>

          <p className="text-center mt-3">
            Have an account? <a href="/login">Sign Up</a>
          </p>
        </div>
        </div>
      
    </div>
  );
};

export default LoginPage;
