import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import kurakura from '../assets/kuralanding.png';

const RegisterGuru = () => {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confPassword, setConfPassword] = useState('');
  const [instansi, setInstansi] = useState('');
  const [msg, setMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/guru`, {
        nama,
        email,
        password,
        confPassword,
        instansi
      });
      navigate("/login-guru");
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
      paddingTop: '100px'
    }}>
      <div style={{
        display: 'flex',
        maxWidth: '1000px',
        width: '100%',
        padding: '40px',
        borderRadius: '10px',
        background: '#fff'
      }}>
        <div style={{ flex: 1, paddingRight: '50px', display: 'flex', alignItems: 'center' }}>
          <img src={kurakura} alt="Register Illustration" style={{ width: '80%' }} />
        </div>

        <div style={{ flex: 2 }}>
          <h2 style={{ color: '#198754', fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px' }}>DAFTAR GURU</h2>
          <form onSubmit={handleRegister}>
            {msg && <p style={{ color: 'red' }}>{msg}</p>}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Nama</label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama Lengkap"
                style={inputStyle}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                style={inputStyle}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Instansi</label>
              <input
                type="text"
                value={instansi}
                onChange={(e) => setInstansi(e.target.value)}
                placeholder="Nama Sekolah atau Instansi"
                style={inputStyle}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold' }}>Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kata Sandi"
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold' }}>Konfirmasi Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confPassword}
                    onChange={(e) => setConfPassword(e.target.value)}
                    placeholder="Ulangi Kata Sandi"
                    style={inputStyle}
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
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#198754',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px'
                }}
              >
                DAFTAR
              </button>
            </div>
            <p style={{ fontSize: '14px' }}>
              Sudah punya akun? <a href="/login" style={{ color: '#198754' }}>Masuk</a>
            </p>
            <p style={{ fontSize: '14px' }}>
              Daftar akun siswa? <a href="/register" style={{ color: '#198754' }}>Daftar</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#e9f0fe',
  border: '1px solid #ccc',
  borderRadius: '5px'
};

export default RegisterGuru;
