import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { Accordion, Container, Row, Col, Button, Form, Alert, Card, Image, AccordionItem, AccordionHeader, AccordionBody } from 'react-bootstrap';
import '../assets/tutor.css';
import '../asset_skulpt/SkulptTurtleRunner.css';
import { BsArrowClockwise, BsCheckCircle } from 'react-icons/bs'; // Import ikon Bootstrap
import left120 from './assets/1left120.gif';
import right90 from './assets/1right90.gif';
import gabunganleftright from './assets/1gabunganleftright.gif';

// Challange
import swal from 'sweetalert'; // Import SweetAlert
import papuyu from './assets/papuyu-1.png';
import map from './assets/1-fill.png';
import grid from './assets/grid.png';

import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../assets/tutor-copy.css";
import Swal from "sweetalert2";

const TantanganSebelas = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState("");

    // hint challanges
    const showHint = () => {
      swal({
        title: "Petunjuk Tantangan",
        content: {
          element: "div",
          attributes: {
            innerHTML: `
              <p>Gambar beberapa bidang geometri sesuai dengan titik awal dan perintah yang sudah ditentukan.</p>
    
              <p><b>Perhatikan petunjuk berikut:</b></p>
              <ul>
                <li><b>Gambar 1:</b> Titik awal di <b>(-150, 50)</b>. Gunakan <b>forward()</b> dan <b>left() / right()</b> untuk menggambar. Warnai dengan warna <span style="color: green;"><b>green</b></span>.</li>
                <li><b>Gambar 2:</b> Titik awal di <b>(50, 50)</b>. Gunakan <b>setposition()</b> untuk menggambar. Warnai dengan warna <span style="color: red;"><b>red</b></span>.</li>
                <li><b>Gambar 3:</b> Titik awal di <b>(-50, -100)</b>. Gunakan <b>setposition()</b> untuk menggambar. Warnai dengan warna <span style="color: gold;"><b>yellow</b></span>.</li>
                <li><b>Gambar 4:</b> Titik awal di <b>(50, -100)</b>. Gunakan <b>circle()</b> untuk menggambar. Warnai dengan warna <span style="color: blue;"><b>blue</b></span>.</li>
              </ul>
    
              <p>Saat berpindah dari satu gambar ke gambar berikutnya, <b>jangan meninggalkan jejak</b>.</p>
            `
          }
        },
        icon: "info"
      });
    };

    const [progresTantangan, setProgresTantangan] = useState(0);

  useEffect(() => {
    const checkAksesTantangan = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/token`);
        setToken(response.data.accessToken);
        const decoded = jwtDecode(response.data.accessToken);

        const progres = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/user/progres-tantangan`, {
          headers: {
            Authorization: `Bearer ${response.data.accessToken}`
          }
        });

        const progresTantangan = progres.data.progres_tantangan;
        console.log(progresTantangan);
        setProgresTantangan(progresTantangan);

        // Misal: hanya bisa akses jika progres_tantangan >= 3
        if (progresTantangan < 10) {
          navigate('/challanges'); // ganti ke halaman tantangan sebelumnya
        }

      } catch (error) {
        console.log(error);
        navigate('/login'); // fallback ke login
      }
    };

    checkAksesTantangan();
  }, [navigate]); 
    

  const [pythonCodeChallanges, setPythonCodeChallanges] = useState(``);
  const [outputChallanges, setOutputChallanges] = useState('');

  const [output, setOutput] = useState('');

  const outfchallanges = (text) => {
    setOutputChallanges((prev) => prev + text);
  };

  const builtinReadChallanges = (x) => {
    if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles['files'][x] === undefined) {
      throw `File not found: '${x}'`;
    }
    return window.Sk.builtinFiles['files'][x];
  };

  const runitchallanges = (code, forceReset = false, skipValidation = false) => {
    setOutputChallanges('');
    const imports = "from turtle import *\nreset()\nshape('turtle')\nspeed(0)\npenup()\nsetposition(-150,0)\npendown()\nspeed(1)\n";
    const prog = forceReset ? imports : imports + pythonCodeChallanges;
  
    window.Sk.pre = "outputChallanges";
    window.Sk.configure({ output: outfchallanges, read: builtinReadChallanges });
    (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas-challanges';
  
    window.Sk.misceval.asyncToPromise(() =>
      window.Sk.importMainWithBody('<stdin>', false, prog, true)
    ).then(
      () => {
        console.log('success');
        setHasRun(true);
        if (!skipValidation) {
          checkCodeChallanges(); // validasi hanya jika skipValidation === false
        }
      },
      (err) => setOutputChallanges((prev) => prev + err.toString())
    );
  };

  const [hasRun, setHasRun] = useState(false);

  const alertShownRef = useRef(false); // Tambahkan ini di bagian atas komponen

  const checkCodeChallanges = () => {
    if (!pythonCodeChallanges.trim()) return;
  
    const validCodeSteps = [
      "penup()",
      "setposition(-150,50)",
      "pendown()",
    
      "fillcolor(\"green\")",
      "begin_fill()",
      "forward(100)",
      "left(90)",
      "forward(100)",
      "left(90)",
      "forward(100)",
      "left(90)",
      "forward(100)",
      "end_fill()",
    
      "penup()",
      "setposition(50,50)",
      "pendown()",
    
      "fillcolor(\"red\")",
      "begin_fill()",
      "setposition(150,50)",
      "setposition(100,150)",
      "setposition(50,50)",
      "end_fill()",
    
      "penup()",
      "setposition(-50,-100)",
      "pendown()",
    
      "fillcolor(\"yellow\")",
      "begin_fill()",
      "setposition(-100,-150)",
      "setposition(-150,-100)",
      "setposition(-100,-50)",
      "setposition(-50,-100)",
      "end_fill()",
    
      "penup()",
      "setposition(50,-100)",
      "pendown()",
    
      "fillcolor(\"blue\")",
      "begin_fill()",
      "circle(50)",
      "end_fill()"
    ];
    
  
    const normalizeLine = (line) => {
      return line
        .replace(/\s+/g, '')            // hapus semua spasi/tab
        .replace(/,\s*/g, ',');         // pastikan koma tidak diikuti spasi
    };
  
    const userCodeLines = pythonCodeChallanges
      .split("\n")
      .map(line => line.trim())
      .filter(line => line !== "")      // hilangkan baris kosong
      .map(normalizeLine);
  
    for (let i = 0; i < userCodeLines.length; i++) {
      if (normalizeLine(validCodeSteps[i]) !== userCodeLines[i]) {
        if (!alertShownRef.current) {
          alertShownRef.current = true;
          swal("Ups, ada yang salah!", `Langkah ke-${i + 1} salah.`, "error")
            .then(() => {
              runitchallanges('', true, true); // skip validasi
              alertShownRef.current = false;
            });
        }
        setHasRun(false);
        return;
      }
    }
  
    if (userCodeLines.length === validCodeSteps.length) {
      if (!alertShownRef.current) {
        alertShownRef.current = true;
        swal("Mantap!", "Semua langkah benar, kamu berhasil!", "success")
          .then(async () => {
            alertShownRef.current = false;
    
            try {
              if (progresTantangan === 10) {
                await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/api/user/progres-tantangan`, {
                  progres_tantangan: progresTantangan + 1
                }, {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                });
                setProgresTantangan(prev => prev + 1);
              }
            } catch (error) {
              console.error("Gagal update progres tantangan:", error);
              Swal.fire({
                icon: 'error',
                title: 'Gagal Update Progres Tantangan',
                text: 'Terjadi kesalahan saat memperbarui progres tantangan kamu.',
                confirmButtonColor: '#d33'
              });
            }
          });
      }
      setHasRun(false);
    } 
  };

const resetCodeChallanges = () => {
  setPythonCodeChallanges('');
  setOutput('');
  runitchallanges('', true, true);
};


  useEffect(() => {
  setHasRun(false);
  runitchallanges('', true, true); // skip validasi di load awal
  }, []);

  return (
    <Container fluid className="sidenavigasi mt-5">
        <Row>
        {/* Kolom Kiri - Prev */}
        <Col md={2} className="d-flex justify-content-center align-items-center">
        <Button
            variant="light"
            onClick={() => navigate('/challanges/10')}
            style={{
            background: 'linear-gradient(to right, #6c757d, #495057)',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            padding: '10px 20px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            fontWeight: 'bold'
            }}
        >
            ◀️ Prev
        </Button>
        </Col>

        {/* Kolom Tengah - Konten Tantangan */}
        <Col md={8}>
            <div style={{marginTop:"20px"}}>
        
            <h4
              style={{
                color: '#2DAA9E',
                fontSize: '26px',
                fontWeight: 'bold',
                borderLeft: '5px solid #2DAA9E',
                paddingLeft: '10px',
                marginBottom: '15px',
              }}
            >
              11. Mewarnai Bentuk Geometri
            </h4>
            
            <p style={{ fontSize: "16px", marginBottom: "10px" }}>
            Selesaikan tantangan dibawah ini!
            Klik tombol petunjuk untuk menampilkan petujuk pengerjaan.
            </p>
            <div className="d-flex gap-2 mb-2">
                    <Button variant="info" onClick={showHint} style={{ color: 'white', fontWeight: 'bold' }}>
                        Petunjuk
                    </Button>

                    <Button
                    variant="warning"
                    onClick={() => navigate('/belajar/colorcontrol/fillcolor')}
                    style={{ color: 'white', fontWeight: 'bold' }}
                    >
                    Kembali ke Materi
                    </Button>

                </div>

            <div className="skulpt-container" style={{
                  border: "3px solid #ccc",
                  borderRadius: "10px",
                  padding: "15px",
                  // display: "flex",
                  // flexWrap: "wrap",
                  gap: "20px",
                  justifyContent: "center",
                  backgroundColor: "#f9f9f9",
                }}>
              <div className="editor-section">
                <CodeMirror
                  value={pythonCodeChallanges}
                  placeholder={'//Ketikan kode disini!'}
                  height="290px"
                  theme="light"
                  extensions={[python()]}
                  onChange={(value) => setPythonCodeChallanges(value)}
                  style={{
                    border: "2px solid #2DAA9E",
                    borderRadius: "8px",
                    padding: "5px",
                  }}
                />
                <div style={{ marginTop: '5px', marginBottom: '5px', display: 'flex', gap: '10px' }}>
                  <Button variant="success" onClick={() => { runitchallanges(); }}>Run Code</Button>
                  <Button variant="secondary" onClick={resetCodeChallanges}>
                    <BsArrowClockwise /> Reset
                  </Button>
                  </div>
                <pre id='outputChallanges' className="output"style={{
                    height: "60px",
                    marginTop: '5px',
                    border: "2px solid #ccc",
                    borderRadius: "5px",
                    padding: "5px",
                    backgroundColor: "#fff",
                  }}>{outputChallanges}</pre>
              </div>
              <div className="canvas-section" style={{
                position: "relative",
                width: "400px",
                height: "405px",
                borderRadius: "10px",
                border: "3px solid #2DAA9E",
                // overflow: "hidden"
              }}>
                <div id="mycanvas-challanges" style={{ 
                  width: 400, 
                  height: 400, 
                  position: "relative", 
                }}></div>
                {/* <img
                      src={broccoli}
                      alt="Target Broccoli"
                      style={{
                        position: "absolute",
                        left: "275px",
                        top: "75px",
                        width: "50px", // Sesuaikan ukuran jika perlu
                        height: "50px",
                      }}
                  /> */}
                  <img
                      src={map}
                      alt="Map"
                      style={{
                        position: "absolute",
                        left: "0px",
                        top: "0px",
                        width: "400px", // Sesuaikan ukuran jika perlu
                        height: "400px",
                      }}
                  />
                  <img
                      src={grid}
                      alt="Map"
                      style={{
                        position: "absolute",
                        left: "0px",
                        top: "0px",
                        width: "400px", // Sesuaikan ukuran jika perlu
                        height: "400px",
                      }}
                  />
              </div>
            </div>
            </div>
        </Col>

        {/* Kolom Kanan - Next */}
        <Col md={2} className="d-flex justify-content-center align-items-center">
        <Button
            variant="light"
            onClick={() => navigate('/challanges/12')}
            style={{
            background: 'linear-gradient(to right, #17a2b8, #138496)',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            padding: '10px 20px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            fontWeight: 'bold',
            
            }}
        >
            Next ▶️
        </Button>
        </Col>
      </Row>
        
    </Container>
  )
}

export default TantanganSebelas
