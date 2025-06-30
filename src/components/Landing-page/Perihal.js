import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import PetaKonsep from './assets/peta-konsep.png';

import './assets/landing-page.css';
import './assets/button3d.css';

const Perihal = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    refreshToken();
  }, []);

  const refreshToken = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/token`);
      const decoded = jwtDecode(response.data.accessToken);
      setName(decoded.name);
    } catch (error) {
      console.log("not login");
    }
  };

  return (
    <div style={{ marginTop: '80px', padding: '20px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>Informasi</h2>

<div
        style={{
          marginTop: '40px',
          textAlign: 'center',
          border: '1px solid #ccc',
          borderRadius: '12px',
          padding: '20px',
          maxWidth: '70%',
          marginLeft: 'auto',
          marginRight: 'auto',
          color: '#444',
          lineHeight: '1.7'
        }}
      >
        <p>
          Media pembelajaran ini dibuat untuk memenuhi persyaratan dalam menyelesaikan studi di program Strata-1
          Pendidikan Komputer dengan judul:
        </p>
        <p style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
          "PENGEMBANGAN LINGKUNGAN PEMBELAJARAN INTERAKTIF BERBASIS WEB UNTUK PEMROGRAMAN TURTLE DENGAN MODEL TUTORIAL"
        </p>

        <p><strong>Pengembang:</strong> Khoyrur Roykhan</p>
        <p><strong>Dosen Pembimbing 1:</strong> Dr. Harja Santana Purba, M.Kom</p>
        <p><strong>Dosen Pembimbing 2:</strong> Rizky Pamuji, S.Kom., M.Kom</p>
        <p><strong>Program Studi:</strong> Pendidikan Komputer, FKIP ULM</p>
      </div>


      <h3 style={{ textAlign: 'center', marginBottom: '16px', marginTop:'20px' }}>Peta Konsep</h3>
      <p style={{ color: '#444', lineHeight: '1.6', textAlign: 'center', maxWidth: '700px', margin: '0 auto 20px' }}>
        Berikut merupakan peta konsep materi pembelajaran Turtle yang akan dipelajari.
      </p>

      <div
        style={{
          textAlign: 'center',
          border: '1px solid #ccc',
          padding: '20px',
          borderRadius: '12px',
          maxWidth: '70%',
          margin: '0 auto'
        }}
      >
        <img
          src={PetaKonsep}
          alt="Peta Konsep Pembelajaran Turtle"
          style={{
            maxWidth: '70%',
            height: 'auto',
            borderRadius: '12px',
            marginBottom: '20px'
          }}
        />

        <div style={{ textAlign: 'left', color: '#444', lineHeight: '1.7' }}>
          <h5>1. Pendahuluan</h5>
          <p>Mengenalkan canvas sebagai area kerja serta editor Turtle sebagai alat utama untuk menggambar dan menjalankan kode. Siswa diperkenalkan dengan antarmuka dasar aplikasi.</p>

          <h5>2. Pergerakan</h5>
          <p>Menjelaskan berbagai perintah untuk menggerakkan turtle di canvas, termasuk arah (<code>left</code> & <code>right</code>), maju dan mundur (<code>forward</code> & <code>backward</code>), serta mengatur posisi (<code>setposition</code>, <code>setx</code>, <code>sety</code>, <code>setheading</code>, <code>home</code>). Juga mencakup pembuatan bentuk sederhana seperti <code>circle</code> dan <code>dot</code>.</p>

          <h5>3. Mengetahui Status</h5>
          <p>Membahas cara mengecek posisi dan arah turtle saat ini menggunakan perintah <code>position</code>, <code>xcor</code>, <code>ycor</code>, <code>heading</code>, dan <code>distance</code>. Penting untuk memahami posisi relatif turtle di canvas.</p>

          <h5>4. Kontrol Pena dan Warna</h5>
          <p>Menjelaskan bagaimana mengatur pena saat menggambar, seperti menaikkan/menurunkan pena (<code>penup</code>, <code>pendown</code>), mengubah ketebalan (<code>pensize</code>), dan memeriksa status pena (<code>isdown</code>). Siswa juga belajar mengubah warna garis (<code>pencolor</code>) dan mengisi bentuk dengan warna menggunakan <code>fillcolor</code>, <code>begin_fill</code>, dan <code>end_fill</code>.</p>

          <h5>5. Kontrol Gambar Lanjutan</h5>
          <p>Memperkenalkan perintah lanjutan seperti <code>reset</code> dan <code>clear</code> untuk menghapus gambar, serta <code>write</code> untuk menambahkan teks di canvas. Penggunaan perulangan sederhana dengan <code>for</code> juga dikenalkan di bagian ini.</p>
        </div>
      </div>

      
    </div>
  );
};

export default Perihal;
