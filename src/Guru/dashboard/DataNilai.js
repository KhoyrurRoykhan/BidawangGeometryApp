import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from "axios";
import { Table, Button, Form, Row, Col } from 'react-bootstrap';
import {
  BsGrid, BsPeople, BsBook, BsLightning, BsBarChart, BsPencilSquare, BsTrash, BsX, BsSave
} from 'react-icons/bs';
import Swal from 'sweetalert2';

const menuItems = [
  { name: 'Dashboard', icon: <BsGrid />, path: '/guru/dashboard' },
  { name: 'Data Siswa', icon: <BsPeople />, path: '/guru/datasiswa' },
  { name: 'Progres Belajar', icon: <BsBook />, path: '/guru/progres-belajar' },
  { name: 'Progres Tantangan', icon: <BsLightning />, path: '/guru/progres-tantangan' },
  { name: 'Data Nilai', icon: <BsBarChart />, path: '/guru/data-nilai' },
];

const DataNilai = () => {
  const [activeMenu] = useState('Data Siswa');
  const location = useLocation();
  const navigate = useNavigate();
  const [dataSiswa, setDataSiswa] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [token, setTokenKelas] = useState("");
  const [dataNilai, setDataNilai] = useState([]);


  const filteredSiswa = dataSiswa.filter((siswa) =>
    siswa.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/token-guru`);
      const decoded = jwtDecode(response.data.accessToken);
      const tokenKelas = decoded.token;
      setTokenKelas(tokenKelas);
  
      const siswaRes = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/users-by-token?token_kelas=${tokenKelas}`);
      setDataSiswa(siswaRes.data);
  
      const nilaiRes = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/nilai-by-token?token_kelas=${tokenKelas}`);
      setDataNilai(nilaiRes.data);
      console.log(nilaiRes);

    } catch (error) {
      console.log(error);
      if (error.response) {
        navigate('/login-guru');
      }
    }
  };
  

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <div
        style={{
          width: '250px',
          height: '100vh',
          backgroundColor: '#212529',
          color: 'white',
          padding: '20px',
          position: 'fixed',
          left: 0,
          top: 0,
          transition: 'all 0.3s',
        }}
      >
        <h5 className="mb-4 text-center" style={{ color: 'white', fontSize: '1.3rem', fontWeight: 'bold', marginTop: 65 }}>
          DAFTAR MENU
        </h5>
        <div className="sidebar-menu">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <span style={{ marginRight: '10px' }}>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '250px', padding: '30px', width: '100%', marginTop: 50 }}>
        <h2 className="mb-4">Data Nilai</h2>

        {/* Keterangan & Dropdown */}
        <Row className="mb-3 align-items-center">
        {/* <Col md={6} className="d-flex align-items-center">
            <strong style={{ marginRight: '10px', whiteSpace: 'nowrap' }}>
            Pilih kuis yang ingin dilihat:
            </strong>
            <Form.Select
            value={selectedKuis}
            onChange={(e) => setSelectedKuis(Number(e.target.value))}
            style={{ width: '200px' }}
            >
            {[...Array(7)].map((_, index) => (
                <option key={index} value={index}>
                Kuis {index + 1}
                </option>
            ))}
            </Form.Select>
        </Col> */}
        <Col md={6}>
            <Form.Control
            type="text"
            placeholder="Cari berdasarkan nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
        </Col>
        </Row>


        {/* Table Nilai */}
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>No</th>
              <th>NISN</th>
              <th>Nama</th>
              <th>Kuis 1</th>
              <th>Kuis 2</th>
              <th>Kuis 3</th>
              <th>Kuis 4</th>
              <th>Kuis 5</th>
              <th>Evaluasi</th>
            </tr>
          </thead>
          <tbody>
            {filteredSiswa.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">Data tidak ditemukan.</td>
              </tr>
            ) : (
              filteredSiswa.map((siswa, index) => {
                const nilaiSiswa = dataNilai.find((nilai_siswa) => nilai_siswa.user.id === siswa.id) || {};
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{siswa.nisn}</td>
                    <td>{siswa.nama}</td>
                    <td className='text-center'>{nilaiSiswa.kuis_1 ?? '-'}</td>
                    <td className='text-center'>{nilaiSiswa.kuis_2 ?? '-'}</td>
                    <td className='text-center'>{nilaiSiswa.kuis_3 ?? '-'}</td>
                    <td className='text-center'>{nilaiSiswa.kuis_4 ?? '-'}</td>
                    <td className='text-center'>{nilaiSiswa.kuis_5 ?? '-'}</td>
                    <td className='text-center'>{nilaiSiswa.evaluasi ?? '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>

      {/* Sidebar Styles */}
      <style>{`
        .sidebar-menu {
          display: flex;
          flex-direction: column;
        }
        .sidebar-item {
          padding: 12px 15px;
          margin-bottom: 8px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          font-size: 16px;
          transition: background-color 0.2s ease;
        }
        .sidebar-item:hover {
          background-color: #343a40;
        }
        .sidebar-item.active {
          background-color: #0d6efd;
        }
      `}</style>
    </div>
  );
};

export default DataNilai;
