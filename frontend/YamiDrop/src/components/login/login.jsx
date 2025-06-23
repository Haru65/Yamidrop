import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [pemFile, setPemFile] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    sshAddress: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (name === 'username' || name === 'sshAddress') {
      if (updated.username && updated.sshAddress) {
        checkKeyExistence(updated.username, updated.sshAddress);
      }
    }
  };

  const checkKeyExistence = async (username, sshAddress) => {
    try {
      const res = await fetch('https://yamidrop.onrender.com/check-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, sshAddress }),
      });

      const data = await res.json();
      setShowPassword(!(data.success && data.keyExists));
    } catch (err) {
      console.error('Key check failed:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append('username', formData.username);
    payload.append('sshAddress', formData.sshAddress);
    if (formData.password) payload.append('password', formData.password);
    if (pemFile) payload.append('pemKey', pemFile);

    try {
      const res = await fetch('https://yamidrop.onrender.com/connect', {
        method: 'POST',
        body: payload,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', formData.username);
        localStorage.setItem('sshAddress', formData.sshAddress);

        console.log('🔁 Response from /connect:', data);
        setTimeout(() => navigate('/home'), 100);
      } else {
        alert(data.message || 'SSH connection failed');
      }
    } catch (err) {
      console.error('Connection error:', err);
      alert('Failed to connect to server');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="icon">&#128187;</div>
        <h2>SSH File Transfer</h2>
        <p>Connect to your SSH server to start transferring files</p>

        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            name="username"
            placeholder="e.g., ubuntu"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <label>SSH Address</label>
          <input
            type="text"
            name="sshAddress"
            placeholder="e.g., ec2-XX-XX-XX-XX.compute.amazonaws.com"
            value={formData.sshAddress}
            onChange={handleChange}
            required
          />

          {showPassword && (
            <>
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
              />
            </>
          )}

          <label>PEM File (optional for EC2 login)</label>
          <input
            type="file"
            accept=".pem"
            onChange={(e) => setPemFile(e.target.files[0])}
          />

          <button type="submit" className="connect-btn">
            Connect to Server
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
