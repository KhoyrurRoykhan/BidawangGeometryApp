import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import kurakura from '../Landing-page/assets/kuralanding.png';

const Register = () => {
  const [nama, setNama] = useState('');
  const [nisn, setNisn] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confPassword, setConfPassword] = useState('');
  const [tokenKelas, setTokenKelas] = useState('');
  const [msg, setMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/api/users`, {
        nama,
        nisn,
        email,
        password,
        confPassword,
        token_kelas: tokenKelas
      });
      navigate("/login");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.msg) {
        setMsg(error.response.data.msg);
      } else {
        setMsg("Registrasi gagal. Email atau NISN sudah terdaftar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#ffffff',
      padding: '40px 20px'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        maxWidth: '1000px',
        width: '100%',
        padding: '40px',
        borderRadius: '10px',
        background: '#fff'
      }}>

        {!isMobile && (
          <div style={{ flex: 1, paddingRight: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={kurakura} alt="Register Illustration" style={{ width: '80%' }} />
          </div>
        )}

        <div style={{ flex: 2 }}>
          <h2 style={{ color: '#198754', fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px' }}>DAFTAR</h2>
          <form onSubmit={handleRegister}>
            {msg && (
              <div style={{
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                border: '1px solid #f87171',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '20px'
              }}>
                {msg}
              </div>
            )}

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
              <label style={{ fontWeight: 'bold' }}>NISN</label>
              <input
                type="text"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                placeholder="Nomor Induk Siswa Nasional"
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
              <label style={{ fontWeight: 'bold' }}>Token Kelas</label>
              <input
                type="text"
                value={tokenKelas}
                onChange={(e) => setTokenKelas(e.target.value)}
                placeholder="Masukkan token kelas"
                style={inputStyle}
              />
            </div>

            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '20px',
              marginBottom: '20px'
            }}>
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
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#198754',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  height: '50px',
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  </>
                ) : (
                  'DAFTAR'
                )}
              </button>
            </div>

            <p style={{ fontSize: '14px' }}>
              Sudah punya akun? <a href="/login" style={{ color: '#198754' }}>Masuk</a>
            </p>
            <p style={{ fontSize: '14px' }}>
              Daftar akun guru? <a href="/register-guru" style={{ color: '#198754' }}>Daftar</a>
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

export default Register;