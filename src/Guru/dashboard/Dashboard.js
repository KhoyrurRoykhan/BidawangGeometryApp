import React, { useState, useEffect } from 'react';
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Card, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import {
  BsGrid,
  BsPeople,
  BsBook,
  BsLightning,
  BsBarChart,
  BsPeopleFill,
  BsBookFill,
  BsLightningFill,
  BsBarChartFill,
  BsKeyFill
} from 'react-icons/bs';

const menuItems = [
  { name: 'Dashboard', icon: <BsGrid />, path: '/guru/dashboard' },
  { name: 'Data Siswa', icon: <BsPeople />, path: '/guru/datasiswa' },
  { name: 'Progres Belajar', icon: <BsBook />, path: '/guru/progres-belajar' },
  { name: 'Progres Tantangan', icon: <BsLightning />, path: '/guru/progres-tantangan' },
  { name: 'Data Nilai', icon: <BsBarChart />, path: '/guru/data-nilai' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [token, setTokenKelas] = useState("");
  const [jumlahSiswa, setJumlahSiswa] = useState(null);
  const [jumlahSelesaiBelajar, setJumlahSelesaiBelajar] = useState(null);
  const [jumlahSelesaiTantangan, setJumlahSelesaiTantangan] = useState(null);
  const [dataNilai, setDataNilai] = useState([]);
  const [kkm, setKkm] = useState({});
  const [editKkm, setEditKkm] = useState({});

  const [kkmUpdated, setKkmUpdated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true); // loader state


  useEffect(() => {
    const fetchData = async () => {
      try {
        const resToken = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/token-guru`);
        const decoded = jwtDecode(resToken.data.accessToken);
        const tokenKelas = decoded.token;
        setTokenKelas(tokenKelas);

        const total = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/count-users?token_kelas=${tokenKelas}`);
        const selesai = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/count-selesai-belajar?token_kelas=${tokenKelas}`);
        const tantangan = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/count-selesai-tantangan?token_kelas=${tokenKelas}`);
        const nilaiRes = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/nilai-by-token?token_kelas=${tokenKelas}`);
        console.log(nilaiRes);
        const kkmRes = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/kkm?token_kelas=${tokenKelas}`);

        setJumlahSiswa(total.data.count);
        setJumlahSelesaiBelajar(selesai.data.count);
        setJumlahSelesaiTantangan(tantangan.data.count);
        setDataNilai(nilaiRes.data);

        if (kkmRes.data && kkmRes.data.kkm) {
          setKkm(kkmRes.data.kkm);
          setEditKkm(kkmRes.data.kkm);
        }

        setLoading(false);
      } catch (error) {
        if (error.response) {
          navigate('/login-guru');
        }
      }
    };

    fetchData();
  }, []);

  const hitungRataRata = () => {
    let totalNilai = 0;
    let jumlahNilai = 0;
    const kolomNilai = ['kuis_1', 'kuis_2', 'kuis_3', 'kuis_4', 'kuis_5', 'evaluasi'];

    dataNilai.forEach((nilai) => {
      kolomNilai.forEach((key) => {
        const nilaiKuis = nilai[key];
        if (nilaiKuis !== null && nilaiKuis !== undefined) {
          totalNilai += nilaiKuis;
          jumlahNilai++;
        }
      });
    });

    if (jumlahNilai === 0) return 0;
    return (totalNilai / jumlahNilai).toFixed(2);
  };


  const handleUpdateKkm = async (e) => {
    e.preventDefault();
  
    try {
      const resToken = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/token-guru`);
      const accessToken = resToken.data.accessToken;
  
      await axios.put(
        `${process.env.REACT_APP_API_ENDPOINT}/api/guru/kkm`,
        { kkm: editKkm },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      setKkm(editKkm); // Update nilai KKM di state utama
      setKkmUpdated(true);
      setShowModal(false); // ✅ Pindahkan ini ke sini agar hanya tertutup kalau update sukses
      setTimeout(() => setKkmUpdated(false), 3000);
    } catch (err) {
      console.error("Gagal update KKM", err);
      if (err.response && err.response.status === 403) {
        alert("Token expired. Silakan login ulang.");
        navigate('/login-guru');
      }
    }
  };
  
  
  

  return (
    <div style={{ display: 'flex'}}>
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
      <div style={{ marginLeft: '250px', padding: '30px', width: '100%', backgroundColor:'white', minHeight:'100vh' }}>
        <h2 className='mb-3' style={{marginTop: 50}}>{activeMenu}</h2>

        {/* Token & KKM Card */}
        <Card className="mb-4 shadow-sm">
          <Card.Body style={{ padding: '25px 30px' }}>
            <div className="d-flex align-items-center mb-3">
              <BsKeyFill size={36} style={{ marginRight: '20px', color: '#0d6efd' }} />
              <div>
                <h5 style={{ fontWeight: 'bold' }}>Token untuk Siswa Masuk Kelas:</h5>
                <h3 style={{ letterSpacing: '4px', marginTop: '10px', color: '#0d6efd' }}>
                  {token ? token : <Spinner animation="border" size="sm" />}
                </h3>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Statistik Cards */}
        <Row>
          <Col md={3}>
            <Card bg="primary" text="white" className="mb-3 shadow-sm">
              <Card.Body style={{ padding: '30px' }}>
                <div className="d-flex align-items-center">
                  <BsPeopleFill size={34} style={{ marginRight: '15px' }} />
                  <div>
                    <Card.Title style={{ fontSize: '1.1rem' }}>Total Siswa</Card.Title>
                    <Card.Text style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                    {jumlahSiswa !== null && jumlahSiswa !== undefined
                      ? jumlahSiswa
                      : <Spinner animation="border" size="sm" />}
                    </Card.Text>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card bg="success" text="white" className="mb-3 shadow-sm">
              <Card.Body style={{ padding: '30px' }}>
                <div className="d-flex align-items-center">
                  <BsBookFill size={34} style={{ marginRight: '15px' }} />
                  <div>
                    <Card.Title style={{ fontSize: '1.1rem' }}>Selesai Belajar</Card.Title>
                    <Card.Text style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                      {jumlahSelesaiBelajar != null && jumlahSiswa != null ? (
                        `${jumlahSelesaiBelajar}/${jumlahSiswa}`
                      ) : (
                        <Spinner animation="border" size="sm" />
                      )}
                    </Card.Text>

                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card bg="warning" text="white" className="mb-3 shadow-sm">
              <Card.Body style={{ padding: '30px' }}>
                <div className="d-flex align-items-center">
                  <BsLightningFill size={34} style={{ marginRight: '15px' }} />
                  <div>
                    <Card.Title style={{ fontSize: '1.1rem' }}>Tantangan Selesai</Card.Title>
                    
                    <Card.Text style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                      {jumlahSelesaiTantangan != null && jumlahSiswa != null ? (
                        `${jumlahSelesaiTantangan}/${jumlahSiswa}`
                      ) : (
                        <Spinner animation="border" size="sm" />
                      )}
                    </Card.Text>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card bg="info" text="white" className="mb-3 shadow-sm">
              <Card.Body style={{ padding: '30px' }}>
                <div className="d-flex align-items-center">
                  <BsBarChartFill size={34} style={{ marginRight: '15px' }} />
                  <div>
                    <Card.Title style={{ fontSize: '1.1rem' }}>Nilai Rata-rata</Card.Title>
                    <Card.Text style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                    {dataNilai !== null && dataNilai !== undefined ? (
                        dataNilai.length > 0 ? (
                          hitungRataRata()
                        ) : (
                          0 // atau "-" jika tidak ingin menampilkan angka
                        )
                      ) : (
                        <Spinner animation="border" size="sm" />
                      )}

                    </Card.Text>

                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <div className="mt-4">
          
        {/* KKM Display and Edit Button */}
        <Card className="shadow-sm mt-4 mb-5">
        <Card.Body>
          <Form.Group>
            <Form.Label><strong>KKM</strong></Form.Label>
            <div className="row">
              {['kuis_1', 'kuis_2', 'kuis_3', 'kuis_4', 'kuis_5', 'evaluasi'].map((item) => (
                <div key={item} className="col-md-4 col-sm-6 mb-2 d-flex align-items-center">
                  <Form.Label className="me-2 mb-0" style={{ minWidth: '70px', fontSize: '0.9rem' }}>
                    {item.replace('_', ' ').toUpperCase()}
                  </Form.Label>
                  <Form.Control
                    type="number"
                    size="sm"
                    value={kkm[item] || ''}
                    readOnly
                    style={{
                      backgroundColor: '#e9ecef',
                      fontSize: '0.9rem',
                      flex: 1
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowModal(true)}
              >
                UBAH
              </Button>
            </div>
          </Form.Group>
        </Card.Body>
      </Card>

      </div>
      </div>

      {showModal && (
  <div className="modal show fade" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Perbarui Nilai KKM</h5>
          <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
        </div>
        <div className="modal-body">
        <Form onSubmit={handleUpdateKkm}>
            {['kuis_1', 'kuis_2', 'kuis_3', 'kuis_4', 'kuis_5', 'evaluasi'].map((item) => (
              <Form.Group key={item} className="mb-3">
                <Form.Label>{item.replace('_', ' ').toUpperCase()}</Form.Label>
                <Form.Control
                  type="number"
                  value={editKkm[item] || ''}
                  onChange={(e) =>
                    setEditKkm({ ...editKkm, [item]: parseInt(e.target.value) || 0 })
                  }
                  min={0}
                  max={100}
                  required
                />
              </Form.Group>
            ))}

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                Batal
              </Button>
              <Button variant="primary" type="submit">
                Simpan
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  </div>
)}



      

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

export default Dashboard;
