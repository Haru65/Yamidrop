import { useNavigate } from 'react-router-dom'; // Add this at the top
import React, { useState } from 'react';
import './home.css';
import { toast } from 'react-toastify';


const Home = () => {
  const token = localStorage.getItem('token');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
    const navigate = useNavigate(); // Initialize the hook here
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const handleBrowse = (e) => {
    handleUpload(e.target.files);
  };

  const handleUpload = (files) => {
    
    const username = localStorage.getItem('username');
    const sshAddress = localStorage.getItem('sshAddress');
    
    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('username', username);
    formData.append('sshAddress', sshAddress);
    
    fetch('https://yamidrop.onrender.com/upload', {
      method: 'POST',
      headers: {
    'Authorization': `Bearer ${token}`, // <-- IMPORTANT
    // Don't manually set Content-Type for multipart/form-data
  },
      body: formData,
    }
    
    , {
      onUploadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percent);
      }
    }).then((res) => res.json())
    .then((data) => {
      if (data.success) {
        toast.success('✅ File uploaded successfully!');
      } else {
        toast.error('❌ Upload failed: ' + (data.message || 'Unknown error'));
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error('❌ Server error during upload');
    });
}   
  




  const handleDisconnect = async () => {
    const username = localStorage.getItem('username');
    const sshAddress = localStorage.getItem('sshAddress');

    try {
      await fetch('https://yamidrop.onrender.com/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, sshAddress }),
      });

      // Clear local storage AFTER the request
      localStorage.removeItem('username');
      localStorage.removeItem('sshAddress');

      // Redirect
      navigate('/');
    } catch (error) {
      console.error('Failed to disconnect:', error);
      toast.error('❌ Disconnect failed');
    }
  };

  return (
    <div className="home-container">
      <div className="header-bar">
        <div className="logo">
          <span role="img" aria-label="server">🖥️</span> SSH File Transfer
        </div>
        <div className="user-info">
          <span className="connected"> <span className="badge">Connected</span></span>
          <button className="disconnect" onClick={handleDisconnect}>
  Disconnect</button>
        </div>
      </div>

      <div
        className={`drop-zone ${dragActive ? 'active' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <div className="upload-icon">⬆️</div>
        <h3>Drag & drop files</h3>
        <p>or click to browse and select files</p>

        <label htmlFor="fileUpload" className="browse-button">Browse Files</label>
        <input
          type="file"
          id="fileUpload"
          hidden
          onChange={handleBrowse}
        />

        {uploadProgress > 0 && (
          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        <small>Supports all file types • No size limit</small>
      </div>
    </div>
  );
};

export default Home;
