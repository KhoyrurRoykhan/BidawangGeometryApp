import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import kurakura from '../Landing-page/assets/kuralanding.png';

const Login = () => {
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const Auth = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/login`, {
        email: nim,
        password: password
      });
      navigate("/");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg);
      }
    }
  };

  const resetForm = () => {
    setNim('');
    setPassword('');
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#ffffff'
    }}>
      <div style={{
        display: 'flex',
        maxWidth: '1000px',
        width: '100%',
        padding: '40px',
        borderRadius: '10px',
        background: '#fff'
      }}>
        
        {/* Gambar */}
        <div style={{ flex: 1, paddingRight: '40px', display: 'flex', alignItems: 'center' }}>
          <img src={kurakura} alt="Login Illustration" style={{ width: '80%' }} />
        </div>

        {/* Form Login */}
        <div style={{ flex: 2 }}>
          <h2 style={{ color: '#198754', fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px' }}>MASUK</h2>
          <form onSubmit={Auth}>
            {msg && <p style={{ color: 'red' }}>{msg}</p>}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Email</label>
              <input
                type="text"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                placeholder="Masukkan Email"
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#e9f0fe',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontWeight: 'bold' }}>Kata Sandi</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kata Sandi"
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#e9f0fe',
                    border: '1px solid #ccc',
                    borderRadius: '5px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#198754'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: '20px', textAlign: 'right' }}>
              <a href="/forgot-password" style={{ color: '#198754', textDecoration: 'none' }}>Lupa kata sandi?</a>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#198754', color: '#fff', border: 'none', borderRadius: '5px' }}>MASUK</button>
            </div>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>
              Belum punya akun? <a href="/register" style={{ color: '#198754' }}>Daftar</a>
            </p>
            <p style={{ fontSize: '14px' }}>
              Masuk sebagai guru? <a href="/login-guru" style={{ color: '#198754'}}>Klik disini!</a>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
