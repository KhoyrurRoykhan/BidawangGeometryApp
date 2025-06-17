import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { Accordion, Container, Row, Col, Button, Form, Alert, Card, Image, AccordionItem, AccordionHeader, AccordionBody } from 'react-bootstrap';
import '../assets/tutor.css';
import '../asset_skulpt/SkulptTurtleRunner.css';
import { BsArrowClockwise, BsCheckCircle } from 'react-icons/bs'; // Import ikon Bootstrap
import Swal from "sweetalert2";
import { FaBars } from "react-icons/fa";


import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../assets/tutor-copy.css";

const KuisPengenalan = () => {
  const [activeButton, setActiveButton] = useState("intro-1");
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [riwayatNilai, setRiwayatNilai] = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(true);

  
  useEffect(() => {
    refreshToken();
  }, []);

  const refreshToken = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/token`);
      setToken(response.data.accessToken);
      const decoded = jwtDecode(response.data.accessToken);
      setExpire(decoded.exp);
    } catch (error) {
      if (error.response) {
        navigate("/login");
      }
    }
  };

  //kunci halaman
  const [progresBelajar, setProgresBelajar] = useState(1);
  const [loadingProgres, setLoadingProgres] = useState(true);
  
  useEffect(() => {
    const checkAkses = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/token`);
        const decoded = jwtDecode(response.data.accessToken);

        const progres = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/user/progres-belajar`, {
          headers: {
            Authorization: `Bearer ${response.data.accessToken}`
          }
        });

        const progresBelajar = progres.data.progres_belajar;
        console.log(progresBelajar)
        setProgresBelajar(progres.data.progres_belajar);

        // Cek apakah progres cukup untuk akses halaman ini
        if (progresBelajar < 1) {
          // Redirect ke halaman materi sebelumnya
          navigate('/belajar/pendahuluan');
        }

      } catch (error) {
        console.log(error);
        navigate('/login');
      } finally {
        setLoadingProgres(false); // ⬅️ ini penting
      }
    };

    checkAkses();
  }, [navigate]);

  const handleNavigate = (path, syarat) => {
    if (syarat) {
      navigate(path);
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Oops!',
        text: 'Selesaikan materi sebelumnya terlebih dahulu ya 😊',
        confirmButtonColor: '#3085d6',
      });
    }
  };

  const [kkm, setKkm] = useState({ kuis_1: 70 }); // default fallback 70

  useEffect(() => {
    const fetchKKM = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/kkm/kuis`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setKkm(res.data.kkm);
      } catch (err) {
        console.error("Gagal mengambil KKM:", err);
      }
    };
  
    if (token) fetchKKM();
  }, [token]);
  
  

  useEffect(() => {
    const fetchRiwayatNilai = async () => {
      setLoadingRiwayat(true); // ⏳ mulai loading
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/nilai/by-user`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        setRiwayatNilai(res.data);
      } catch (error) {
        console.error("Gagal mengambil riwayat nilai:", error);
      } finally {
        setLoadingRiwayat(false); // ✅ selesai loading
      }
    };
  
    if (token) fetchRiwayatNilai();
  }, [token]);
  
  

  // Tentukan accordion aktif berdasarkan URL
  const activeAccordionKey = location.pathname.includes("/belajar/pendahuluan") || location.pathname.includes("/belajar/turtlemotion/kuis")
    ? "0"
    : "0";

  // Class untuk tombol aktif
  const getButtonClass = (path) =>
    location.pathname === path ? "btn text-start mb-2 btn-success" : "btn text-start mb-2 btn-outline-success";

    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => {
      setCollapsed(!collapsed);
    };

  return (
    <div className="pt-3 " style={{ fontFamily: 'Verdana, sans-serif',
      display: "flex",
      height: "100vh",
      flexDirection: "row",
      overflow: "hidden", // agar tidak scroll di container utama
      position: "fixed",
      width:'100%'
    }}>
      
      <div className='mt-5'
        style={{
          width: collapsed ? "60px" : "250px",
          transition: "width 0.3s",
          backgroundColor: "#f0f0f0",
          // height: "100vh",
          position: "sticky", // atau fixed jika mau benar-benar di luar alur scroll
          top: 0,
          zIndex: 10,
          flexShrink: 0, // penting agar tidak ikut menyusut
          overflow: 'auto',
          paddingBottom:80
        }}
      >
        <div className="p-2">
          <Button variant="light" onClick={toggleSidebar}>
            <FaBars />
          </Button>
        </div>

        {!collapsed && (
            <Accordion defaultActiveKey={activeAccordionKey} className='p-2'>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Pengenalan</Accordion.Header>
              <Accordion.Body>
                <div className="d-flex flex-column">
                  <button
                    className={getButtonClass("/belajar/pendahuluan")}
                    onClick={() => navigate("/belajar/pendahuluan")}
                  >
                    Pengenalan
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/pendahuluan/kuis")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/pendahuluan/kuis", progresBelajar >= 1)}
                    style={{ pointerEvents: progresBelajar < 1 ? "auto" : "auto", opacity: progresBelajar < 1 ? 0.5 : 1 }}
                  >
                    <span>📋 Kuis: Pengenalan</span>
                    {progresBelajar < 1 && <span className="ms-2">🔒</span>}
                  </button>
                </div>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
              <Accordion.Header>Turtle Motion</Accordion.Header>
              <Accordion.Body>
                <div className="d-flex flex-column">
                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/leftright")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/leftright", progresBelajar >= 2)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 2 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    <span>Left & Right</span>
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 2 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/forwardbackward")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/forwardbackward", progresBelajar >= 3)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 3 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Forward & Backward
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 3 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/setposition")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/setposition", progresBelajar >= 4)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 4 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Set Position
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 4 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/setxy")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/setxy", progresBelajar >= 5)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 5 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Setx & sety
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 5 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/setheading")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/setheading", progresBelajar >= 6)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 6 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Setheading
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 6 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/home")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/home", progresBelajar >= 7)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 7 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Home
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 7 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/circle")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/circle", progresBelajar >= 8)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 8 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Circle
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 8 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/dot")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/dot", progresBelajar >= 9)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 9 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Dot
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 9 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/turtlemotion/rangkuman", progresBelajar >= 9)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 10 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Rangkuman
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 10 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/kuis")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/kuis", progresBelajar >= 10)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 10 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    📋 Kuis: Pergerakan
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 10 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                </div>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
              <Accordion.Header>Tell State</Accordion.Header>
              <Accordion.Body>
                <div className="d-flex flex-column">
                  <button
                    className={`${getButtonClass("/belajar/tellstate/position")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/tellstate/position", progresBelajar >= 11)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 11 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Position
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 11 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/tellstate/xcorycor")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/tellstate/xcorycor", progresBelajar >= 12)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 12 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Xcor & Ycor
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 12 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/tellstate/heading")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/tellstate/heading", progresBelajar >= 13)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 13 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Heading
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 13 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/tellstate/distance")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/tellstate/distance", progresBelajar >= 14)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 14 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Distance
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 14 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/tellstate/rangkuman", progresBelajar >= 15)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 15 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Rangkuman
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 15 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/tellstate/kuis")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/tellstate/kuis", progresBelajar >= 15)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 15 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    📋 Kuis: Mengetahui Status
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 15 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>
                </div>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="3">
              <Accordion.Header>Pen & Color Control</Accordion.Header>
              <Accordion.Body>
                <div className="d-flex flex-column">
                  <button
                    className={`${getButtonClass("/belajar/pencontrol/penuppendown")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/pencontrol/penuppendown", progresBelajar >= 16)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 16 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Pendown & Penup
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 16 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/pencontrol/pensize")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/pencontrol/pensize", progresBelajar >= 17)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 17 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Pensize
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 17 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/pencontrol/isdown")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/pencontrol/isdown", progresBelajar >= 18)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 18 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Isdown
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 18 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/colorcontrol/pencolor")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/colorcontrol/pencolor", progresBelajar >= 19)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 19 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Pencolor
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 19 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/colorcontrol/fillcolor")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/colorcontrol/fillcolor", progresBelajar >= 20)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 20 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Pengisian Warna (Fillcolor, Begin_fill, dan End_fill)
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 20 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/pencolorcontrol/rangkuman", progresBelajar >= 21)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 21 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Rangkuman
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 21 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/pencolorcontrol/kuis")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/pencolorcontrol/kuis", progresBelajar >= 21)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 21 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    📋 Kuis: Kontrol Pena dan Warna
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 21 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>
                </div>
              </Accordion.Body>
            </Accordion.Item>

           
            <Accordion.Item eventKey="4">
              <Accordion.Header>More Drawing Control</Accordion.Header>
              <Accordion.Body>
                <div className="d-flex flex-column">
                  <button
                    className={`${getButtonClass("/belajar/moredrawingcontrol/reset")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/moredrawingcontrol/reset", progresBelajar >= 22)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 22 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Reset
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 22 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/moredrawingcontrol/clear")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/moredrawingcontrol/clear", progresBelajar >= 23)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 23 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Clear
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 23 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/moredrawingcontrol/write")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/moredrawingcontrol/write", progresBelajar >= 24)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 24 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Write
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 24 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/perulangan/forloop")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/perulangan/forloop", progresBelajar >= 25)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 25 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    For Loops
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 25 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/moredrawingcontrol/rangkuman", progresBelajar >= 26)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 26 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Rangkuman
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 26 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/moredrawingcontrol/kuis")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/moredrawingcontrol/kuis", progresBelajar >= 26)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 26 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    📋 Kuis: Kontrol Gambar Lanjutan
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 26 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>
                </div>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="5">
              <Accordion.Header>Evaluasi</Accordion.Header>
              <Accordion.Body>
                <div className="d-flex flex-column">
                  <button
                    className={`${getButtonClass("/belajar/evaluasi")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/evaluasi", progresBelajar >= 27)}
                    disabled={loadingProgres}
                    style={{
                      opacity: progresBelajar < 27 ? 0.5 : 1,
                      pointerEvents: loadingProgres ? 'none' : 'auto'
                    }}
                  >
                    Evaluasi
                    {loadingProgres ? (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    ) : progresBelajar < 27 ? (
                      <span className="ms-2">🔒</span>
                    ) : null}
                  </button>                  
                </div>
              </Accordion.Body>
            </Accordion.Item>

          </Accordion>
        )}

        </div>

        
        <div className='p-4 mt-5 content' style={{
              flexGrow: 1,
              overflowY: "auto",
              // height: "100vh",
              backgroundColor: "#fff",

            }}>
          <div style={{paddingLeft:50, paddingRight:50, paddingBottom:50}}>
            <h2 style={{color:'black'}}>Aturan</h2>
            <p>
              Kuis ini bertujuan untuk menguji pemahaman Anda tentang materi <b>Pengenalan Turtle</b>.
            </p>
            <p>
              Terdapat 10 pertanyaan yang harus Anda selesaikan dalam kuis ini. Beberapa ketentuan penting yang perlu diperhatikan:
            </p>
            <ul>
              <li>Nilai kelulusan minimum: {kkm.kuis_1}</li>
              <li>Durasi pengerjaan: 15 menit</li>
            </ul>
            <p>
              Jika Anda belum mencapai nilai kelulusan, Anda harus mengulangi kuis!
            </p>

            <p>Selamat Mengerjakan!</p>
            {/* Button Start - Aligned to Right */}
            <div style={{ marginTop: 20, textAlign: 'right' }}>
            <button
              onClick={() => navigate('/belajar/pendahuluan/kuis1')}
              style={{
                backgroundColor: '#2d3748',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '5px',
                border: 'none'
              }}
            >
              Mulai
            </button>
          </div>


          <div style={{ marginTop: 50 }}>
          <h4 style={{ color: 'black' }}>Riwayat</h4>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: 10, textAlign: 'center', color: 'black' }}>Nilai Kuis Pengenalan</th>
                <th style={{ padding: 10, textAlign: 'center', color: 'black' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingRiwayat ? (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center', padding: 20 }}>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : riwayatNilai.length > 0 ? (
                riwayatNilai.map((item, index) => {
                  const nilai = item.kuis_1 ?? 0;
                  const kkmValue = kkm?.kuis_1 ?? 70; // fallback default
                  const isLulus = nilai >= kkmValue;

                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: 10, textAlign: 'center' }}>{nilai}%</td>
                      <td style={{ padding: 10, textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 8px',
                          backgroundColor: isLulus ? '#d1fae5' : '#fee2e2',
                          color: isLulus ? '#065f46' : '#991b1b',
                          border: `1px solid ${isLulus ? '#34d399' : '#f87171'}`,
                          borderRadius: 5,
                          fontSize: '12px'
                        }}>
                          {isLulus ? 'Lulus' : 'Tidak Lulus'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center', padding: 20 }}>
                    Belum ada riwayat nilai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>





            </div>
          </div>
        
      
    </div>
  )
}

export default KuisPengenalan
