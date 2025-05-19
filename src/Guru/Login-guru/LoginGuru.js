import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import kurakura from '../assets/kuralanding.png'; // gunakan ilustrasi yang sama

const LoginGuru = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // set awal
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const AuthGuru = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/api/login-guru`, {
        email,
        password
      });
      navigate("/guru/dashboard");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg);
      }
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#ffffff',
      padding: '20px'
    }}>
      <div style={{
        display: 'flex',
        maxWidth: '1000px',
        width: '100%',
        padding: '20px',
        borderRadius: '10px',
        background: '#fff',
        flexDirection: isMobile ? 'column' : 'row'
      }}>

        {/* Gambar */}
        {!isMobile && (
          <div style={{
            flex: 1,
            paddingRight: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img src={kurakura} alt="Login Illustration" style={{ width: '80%' }} />
          </div>
        )}

        {/* Form Login Guru */}
        <div style={{ flex: 2 }}>
          <h2 style={{ color: '#198754', fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px' }}>MASUK GURU</h2>
          <form onSubmit={AuthGuru}>
            {msg && <p style={{ color: 'red' }}>{msg}</p>}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan Email"
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#e9f0fe',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
                required
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
                  required
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
              <a href="/forgot-password-guru" style={{ color: '#198754', textDecoration: 'none' }}>Lupa kata sandi?</a>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button type="submit" style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#198754',
                color: '#fff',
                border: 'none',
                borderRadius: '5px'
              }}>
                MASUK GURU
              </button>
            </div>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>
              Belum punya akun guru? <a href="/register-guru" style={{ color: '#198754' }}>Daftar</a>
            </p>
            <p style={{ fontSize: '14px' }}>
              Kembali ke halaman <a href="/login" style={{ color: '#198754' }}>Login Siswa</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginGuru;
