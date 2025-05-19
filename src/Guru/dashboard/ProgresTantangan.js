import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Table, Form, Row, Col, ProgressBar } from 'react-bootstrap';
import { BsGrid, BsPeople, BsBook, BsLightning, BsBarChart } from 'react-icons/bs';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const menuItems = [
  { name: 'Dashboard', icon: <BsGrid />, path: '/guru/dashboard' },
  { name: 'Data Siswa', icon: <BsPeople />, path: '/guru/datasiswa' },
  { name: 'Progres Belajar', icon: <BsBook />, path: '/guru/progres-belajar' },
  { name: 'Progres Tantangan', icon: <BsLightning />, path: '/guru/progres-tantangan' },
  { name: 'Data Nilai', icon: <BsBarChart />, path: '/guru/data-nilai' },
];

const ProgresTantangan = () => {
  const [activeMenu] = useState('Progres Belajar');
  const [dataSiswa, setDataSiswa] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tokenKelas, setTokenKelas] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const getUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/token-guru`);
      const decoded = jwtDecode(response.data.accessToken);
      const token = decoded.token;
      setTokenKelas(token);

      const siswaRes = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/users-by-token?token_kelas=${token}`);
      setDataSiswa(siswaRes.data);
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

  const filteredSiswa = dataSiswa.filter((siswa) =>
    siswa.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Main content */}
      <div style={{ marginLeft: '250px', padding: '30px', width: '100%', marginTop: 50 }}>
        <h2 className='mb-4'>{activeMenu}</h2>

        {/* Search Input */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Control
              type="text"
              placeholder="Cari berdasarkan nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
        </Row>

        {/* Table Siswa */}
        {/* Table Siswa */}
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>No</th>
              <th>NISN</th>
              <th>Nama</th>
              <th>Progres Tantangan</th>
            </tr>
          </thead>
          <tbody>
            {filteredSiswa.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">Data tidak ditemukan.</td>
              </tr>
            ) : (
              filteredSiswa.map((siswa, index) => {
                const totalHalaman = 12;
                const progres = Math.round((siswa.progres_tantangan / totalHalaman) * 100);

                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{siswa.nisn}</td>
                    <td>{siswa.nama}</td>
                    <td>
                    <ProgressBar
                      now={progres}
                      label={`${progres}%`}
                      variant={
                        progres < 50 ? 'danger' : progres < 80 ? 'warning' : 'success'
                      }
                    />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

        </Table>
      </div>

      {/* Sidebar styles */}
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

export default ProgresTantangan;
