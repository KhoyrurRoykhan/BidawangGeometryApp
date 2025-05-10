import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import Carousel from 'react-bootstrap/Carousel';
import { Container, Row, Col, Button, Image, Card, CardGroup } from 'react-bootstrap';
import MenaraPandang from '../Landing-page/assets/menara-pandang.jpeg';
import JukungTeratai from '../Landing-page/assets/jukung-teratai.jpg';
import StikesSungai from '../Landing-page/assets/stikes-sungai.jpg';
import turtle from '../Landing-page/assets/sea-turtle.gif';
import kurakura from '../Landing-page/assets/kuralanding.png';
import BelajarTurtle from '../Landing-page/assets/belajar-turtlee.png';
import Tantangan from '../Landing-page/assets/tantangann.png';
import SusurSungai from '../Landing-page/assets/susur-sungaii.png';
import { FaBook, FaBookDead, FaBookMedical, FaBookOpen, FaBookReader, FaGamepad, FaScrewdriver, FaTrophy, FaWater } from 'react-icons/fa';
import './assets/landing-page.css';
import './assets/button3d.css';
import KategoriGrid from './KategoriGrid';
import Tujuan from './assets/tujuan.webp';

const LandingPage = () => {
  const [name, setName] = useState('');
  const [token, setToken] = useState('');
  const [expire, setExpire] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    refreshToken();
  }, []);

  const refreshToken = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/token`);
      setToken(response.data.accessToken);
      const decoded = jwtDecode(response.data.accessToken);
      setName(decoded.name);
      setExpire(decoded.exp);
    } catch (error) {
      if (error.response) {
        console.log("not login")
      }
    }
  };

  return (
    <Container fluid style={{ padding: '0px', fontFamily: 'Verdana, sans-serif' }}>
      <Container fluid style={{ marginTop: 0, background: 'linear-gradient(to right, #2DAA9E, #FBF8EF)', minHeight: '100vh'}}>
      <Row className="justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Col md="8"  style={{padding:"200px"}}>
          <p className="text-center mb-4" style={{ fontSize: '3.3rem', color: 'white' }}><b>Bidawang Geometry</b></p>
          <h3 className="text-center mb-2 text-white">Media Pembelajaran Interaktif</h3>
          <h3 className="text-center mb-4 text-white">Library Turtle</h3>
          <p className="text-center mb-4 text-white">
            Bidawang Geometry adalah perangkat gratis yang membantu siswa memahami lebih dalam konsep-konsep pemrograman library turtle (Pemrograman Logo). 
            Dengan tutorial interaktif dan tantangan-tantangan yang menarik.
          </p>
          <div className="text-center">
            {/* <Button href="#Ayo-Eksplore" variant="success" size="lg">Mulai Eksplore</Button> */}
            <a href="#Ayo-Eksplore" class="button-3d" style={{fontSize: '18px'}}><b>Mulai Eksplore</b></a>
          </div>
        </Col>
        <Col md="4">
          <Image src={kurakura} alt="GeoGebra Image" width="100%" height="100%" />
        </Col>
      </Row>
    </Container>

    <Container id='Ayo-Eksplore' fluid style={{ marginTop: 0, paddingTop: 100, paddingBottom: 100 }}>
      <h1  className="text-center mb-5"><b>Ayo Eksplore!</b></h1>
      <Row className="justify-content-center">
        <Col md={3} className="mb-4">
          <Card>
            <Card.Body className="text-center">
              <img
                src={BelajarTurtle}
                alt="Belajar Turtle"
                className="mb-3"
                style={{ width: '120px' }}
              />
              <Card.Title><FaBookReader /> <b>Belajar Turtle</b></Card.Title>
              <Card.Text>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla accumsan elit nec est bibendum semper. Pellentesque eleifend aliquet tincidunt. Ut tincidunt et sem vitae porttitor.
              </Card.Text>
              {/* <Button variant="primary" href="/belajarturtle">Explore all</Button> */}
              <a href="/belajar/pendahuluan" class="button-3d-eksplore">Mulai Belajar</a>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-4">
          <Card>
            <Card.Body className="text-center">
              <img
                src={Tantangan}
                alt="Tantangan"
                className="mb-3"
                style={{ width: '120px' }}
              />
              <Card.Title><FaGamepad /> <b>Tantangan</b></Card.Title>
              <Card.Text>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla accumsan elit nec est bibendum semper. Pellentesque eleifend aliquet tincidunt. Ut tincidunt et sem vitae porttitor.
              </Card.Text>
              {/* <Button variant="primary" href="/challanges">Explore all</Button> */}
              <a href="/challanges" class="button-3d-eksplore">Mulai Tantangan</a>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-4">
          <Card>
            <Card.Body className="text-center">
              <img
                src={SusurSungai}
                alt="Susur Sungai"
                className="mb-3"
                style={{ width: '120px' }}
              />
              <Card.Title><FaScrewdriver /> <b>Susur Sungai</b></Card.Title>
              <Card.Text>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla accumsan elit nec est bibendum semper. Pellentesque eleifend aliquet tincidunt. Ut tincidunt et sem vitae porttitor.
              </Card.Text>
              {/* <Button variant="primary" href="/susursungai">Explore all</Button> */}
              <a href="/susursungai" class="button-3d-eksplore">Mulai Berkreasi</a>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>

    </Container>
  );
};

export default LandingPage;