import React, { useState } from 'react';
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
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/users`, {
        nama,
        nisn,
        email,
        password,
        confPassword,
        token_kelas: tokenKelas
      });
      navigate("/login");
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
        
        {/* Gambar */}
        <div style={{ flex: 1, paddingRight: '50px', display: 'flex', alignItems: 'center' }}>
          <img src={kurakura} alt="Register Illustration" style={{ width: '80%' }} />
        </div>

        {/* Form Register */}
        <div style={{ flex: 2 }}>
          <h2 style={{ color: '#198754', fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px' }}>DAFTAR</h2>
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

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                {/* Password */}
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

                {/* Konfirmasi Password */}
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
