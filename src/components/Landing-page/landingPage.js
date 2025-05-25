import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Image, Card } from 'react-bootstrap';
import { FaBookReader, FaCode, FaGamepad, FaScrewdriver } from 'react-icons/fa';

import MenaraPandang from '../Landing-page/assets/menara-pandang.jpeg';
import JukungTeratai from '../Landing-page/assets/jukung-teratai.jpg';
import StikesSungai from '../Landing-page/assets/stikes-sungai.jpg';
import turtle from '../Landing-page/assets/sea-turtle.gif';
import kurakura from '../Landing-page/assets/kuralanding.png';
import BelajarTurtle from '../Landing-page/assets/belajar-turtlee.png';
import Tantangan from '../Landing-page/assets/tantangann.png';
import SusurSungai from '../Landing-page/assets/susur-sungaii.png';
import Tujuan from './assets/tujuan.webp';
import BidawangKoding from './assets/bidkode.png';
import './assets/landing-page.css';
import './assets/button3d.css';

const LandingPage = () => {
  const [name, setName] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <Container fluid style={{ padding: 0, fontFamily: 'Verdana, sans-serif' }}>
      {/* Hero Section */}
      <Container fluid style={{ background: 'linear-gradient(to right, #2DAA9E, #FBF8EF)', minHeight: '100vh' }}>
        <Row className="justify-content-center align-items-center flex-column-reverse flex-md-row" style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
          <Col xs={12} md={8} className="text-center text-md-start">
            <p style={{
              fontSize: isMobile ? '2rem' : '2.5rem',
              color: 'white',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Bidawang Geometry
            </p>
            <h3 style={{ fontSize: isMobile ? '1.5rem' : '2rem', color: 'white', marginBottom: '0.5rem' }}>
              Media Pembelajaran Interaktif
            </h3>
            <h3 style={{ fontSize: isMobile ? '1.5rem' : '2rem', color: 'white', marginBottom: '1rem' }}>
              Library Turtle
            </h3>
            <p style={{ fontSize: isMobile ? '1rem' : '1.1rem', color: 'white', marginBottom: '1.5rem' }}>
              Bidawang Geometry adalah perangkat gratis yang membantu siswa memahami lebih dalam konsep-konsep pemrograman library turtle (Pemrograman Logo).
              Dengan tutorial interaktif dan tantangan-tantangan yang menarik.
            </p>
            <a href="#Ayo-Eksplore" className="button-3d" style={{ fontSize: '18px' }}><b>Mulai Eksplore</b></a>
          </Col>
          <Col xs={10} md={4} className="mb-4 mb-md-0 d-flex justify-content-center">
          <img
              src={kurakura}
              alt="GeoGebra Image"
              style={{
                width: isMobile ? '60%' : '80%',
                maxHeight: isMobile ? '200px' : '450px',
                objectFit: 'contain',
                marginTop: isMobile ? '50px' : '0px'
              }}
            />
          </Col>
        </Row>
      </Container>

      {/* Eksplore Section */}
      <Container id='Ayo-Eksplore' fluid style={{ paddingTop: 100, paddingBottom: 100 }}>
        <h1 className="text-center mb-5" style={{ fontSize: '2rem' }}><b>Ayo Eksplore!</b></h1>
        <Row className="justify-content-center">
          <Col xs={12} sm={6} md={4} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body>
                <img src={BelajarTurtle} alt="Belajar Turtle" className="mb-3" style={{ width: '80px', height: 'auto' }} />
                <Card.Title><FaBookReader /> <b>Belajar Turtle</b></Card.Title>
                <Card.Text style={{ fontSize: '0.95rem' }}>
                  Pelajari dasar-dasar pemrograman Python Turtle melalui tutorial interaktif yang menyenangkan.
                </Card.Text>
                <a href="/belajar/pendahuluan" className="button-3d-eksplore">Mulai Belajar</a>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} md={4} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body>
                <img src={Tantangan} alt="Tantangan" className="mb-3" style={{ width: '80px', height: 'auto' }} />
                <Card.Title><FaGamepad /> <b>Tantangan</b></Card.Title>
                <Card.Text style={{ fontSize: '0.95rem' }}>
                  Uji kemampuanmu melalui tantangan seru yang mengasah logika dan kreativitas dalam pemrograman.
                </Card.Text>
                <a href="/challanges" className="button-3d-eksplore">Mulai Tantangan</a>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} md={4} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body>
                <img src={BidawangKoding} alt="Susur Sungai" className="mb-3" style={{ width: '80px', height: 'auto' }} />
                <Card.Title><FaCode /> <b>Text Editor</b></Card.Title>
                <Card.Text style={{ fontSize: '0.95rem' }}>
                Tulis dan jalankan kode Turtle di editor interaktif dan lihat langsung hasil visualnya.
                </Card.Text>
                <a href="/texteditor" className="button-3d-eksplore">Mulai Berkreasi</a>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default LandingPage;
