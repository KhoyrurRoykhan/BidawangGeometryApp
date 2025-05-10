import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { Accordion, Container, Row, Col, Button, Form, Alert, Card, Image, AccordionItem, AccordionHeader, AccordionBody } from 'react-bootstrap';
import { BsArrowClockwise, BsCheckCircle } from 'react-icons/bs'; // Import ikon Bootstrap
import '../assets/tutor.css';
import '../asset_skulpt/SkulptTurtleRunner.css';
import forward100 from './assets/2turtle-forward.gif';
import backward100 from './assets/2turtle-backward.gif';
// import combinedForwardBackward from './assets/combinedForwardBackward.gif';
import peringatan from './assets/peringatan.gif';
// Challange
import swal from 'sweetalert'; // Import SweetAlert
import Swal from "sweetalert2";
import papuyu from './assets/papuyu-1.png';
import broccoli from './assets/cacingtarget.png';
import map from './assets/2-forward-backward-b.png';
import tilemap from './assets/2-forward-backward-tilemap.png';

import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../assets/tutor-copy.css";


const TantanganDua = () => {
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
              <p>Tugas kamu adalah menggerakkan Bidawang menuju ujung sungai tanpa menabrak dinding sungai.</p>
              <p>Gunakan perintah <b>forward()</b> untuk maju, dan kombinasikan dengan <b>left()</b> atau <b>right()</b> untuk berbelok mengikuti alur sungai.</p>
              <p>Untuk membantumu mengetahui panjang sungai dan sudut belokan yang tepat, perhatikan <i>garis bantu</i> yang ada pada canvas.</p>
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
        const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/token`);
        setToken(response.data.accessToken);
        const decoded = jwtDecode(response.data.accessToken);

        const progres = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/user/progres-tantangan`, {
          headers: {
            Authorization: `Bearer ${response.data.accessToken}`
          }
        });

        const progresTantangan = progres.data.progres_tantangan;
        console.log(progresTantangan);
        setProgresTantangan(progresTantangan);

        // Misal: hanya bisa akses jika progres_tantangan >= 3
        if (progresTantangan < 1) {
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
  const [currentStep, setCurrentStep] = useState(0); // Track the current step
  const [output, setOutput] = useState('');

  const outf = (text) => {
    setOutput((prev) => prev + text);
  };

  const builtinRead = (x) => {
    if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles['files'][x] === undefined) {
      throw `File not found: '${x}'`;
    }
    return window.Sk.builtinFiles['files'][x];
  };

  const runitchallanges = (code = '', forceReset = false) => {
    setOutput('');
    const imports = "from turtle import *\nreset()\nshape('turtle')\nspeed(0)\npenup()\nsetposition(-100,-100)\npendown()\nspeed(2)\n";
    const prog = forceReset ? imports : imports + code;
  
    window.Sk.pre = "output4";
    window.Sk.configure({ output: outf, read: builtinRead });
    (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas-challanges';
  
    window.Sk.misceval.asyncToPromise(() =>
      window.Sk.importMainWithBody('<stdin>', false, prog, true)
    ).then(
      () => {
        if (!forceReset && code.trim().length > 0) {
          setHasRun(true);
          checkCodeChallanges(code); // Panggil dengan kode aktual
        }
      },
      (err) => setOutput((prev) => prev + err.toString())
    );
  };

  const [hasRun, setHasRun] = useState(false);

  const validCode = ["forward(200)", "left(90)", "forward(200)", "left(90)", "forward(200)"];

const checkCodeChallanges = (userCode) => {
  const trimmedCode = userCode.trim();
  if (!trimmedCode) return;

  const userCodeLines = trimmedCode
    .split("\n")
    .map(line => line.trim())
    .filter(line => line !== ""); // <--- Skip baris kosong

  const linesToCheck = userCodeLines.slice(currentStep);

  const forwardRegex = /^forward\((\d+)\)$/;
  const leftRegex = /^left\((\d+)\)$/;

  let step = currentStep;

  for (let i = 0; i < linesToCheck.length; i++) {
    const currentLine = linesToCheck[i];

    if (step >= validCode.length) break;

    // STEP 0, 2, 4 → forward(200)
    if ([0, 2, 4].includes(step)) {
      const match = currentLine.match(forwardRegex);
      if (match) {
        const value = parseInt(match[1]);
        if (value < 200) {
          return swal("Salah", "Pergerakan bidawang kurang jauh", "error").then(() => {
            initializeTurtle();
            setCurrentStep(0);
            setPythonCodeChallanges('');
            setHasRun(false);
          });
        } else if (value > 200) {
          return swal("Salah", "Bidawang keluar jalur", "error").then(() => {
            initializeTurtle();
            setCurrentStep(0);
            setPythonCodeChallanges('');
            setHasRun(false);
          });
        }
      } else {
        return swal("Salah", "Perintah yang anda masukkan salah", "error").then(() => {
          initializeTurtle();
          setCurrentStep(0);
          setPythonCodeChallanges('');
          setHasRun(false);
        });
      }
    }

    // STEP 1, 3 → left(90)
    else if ([1, 3].includes(step)) {
      const match = currentLine.match(leftRegex);
      if (match) {
        const value = parseInt(match[1]);
        if (value < 90) {
          return swal("Salah", "Sudut kurang besar", "error").then(() => {
            initializeTurtle();
            setCurrentStep(0);
            setPythonCodeChallanges('');
            setHasRun(false);
          });
        } else if (value > 90) {
          return swal("Salah", "Sudut terlalu besar", "error").then(() => {
            initializeTurtle();
            setCurrentStep(0);
            setPythonCodeChallanges('');
            setHasRun(false);
          });
        }
      } else {
        return swal("Salah", "Perintah yang anda masukkan salah", "error").then(() => {
          initializeTurtle();
          setCurrentStep(0);
          setPythonCodeChallanges('');
          setHasRun(false);
        });
      }
    }

    step++;
  }

  setCurrentStep(step);
  console.log("Step setelah cek:", step);

  if (step >= validCode.length) {
    swal("Benar!", "Kamu berhasil menyelesaikan tantangan!", "success").then(async () => {
      try {
        if (progresTantangan === 1) {
          await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/user/progres-tantangan`, {
            progres_tantangan: progresTantangan + 1
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setProgresTantangan(prev => prev + 1);
        }
      } catch (error) {
        console.error("Gagal update progres tantangan halaman 2:", error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal Update Progres Tantangan',
          text: 'Terjadi kesalahan saat memperbarui progres tantangan halaman kedua.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
};


  const initializeTurtle = () => {
    const imports = "from turtle import *\nshape('turtle')\n";
    const initialPosition = "reset()\nspeed(0)\npenup()\nsetpos(-100, -100)\npendown()\nspeed(2)\n"; // Set initial position
    const prog = imports + initialPosition;

    window.Sk.pre = "output";
    window.Sk.configure({ output: outf, read: builtinRead });
    (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas-challanges';

    window.Sk.misceval.asyncToPromise(() => 
      window.Sk.importMainWithBody('<stdin>', false, prog, true)
    ).then(
      () => {},
      (err) => setOutput((prev) => prev + err.toString())
    );
  };



const resetCodeChallanges = () => {
  setPythonCodeChallanges('');
  setCurrentStep(0);
  setOutput('');
  setHasRun(false); // <- Penting agar tidak menjalankan evaluasi otomatis
  runitchallanges('', true);
};


  useEffect(() => {
    runitchallanges(); // Jalankan kode saat halaman dimuat
  }, []);

  return (
    <Container fluid className="sidenavigasi mt-5">
        <Row>
        {/* Kolom Kiri - Prev */}
        <Col md={2} className="d-flex justify-content-center align-items-center">
        <Button
            variant="light"
            onClick={() => navigate('/challanges/1')}
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
              2. Bergerak dan Berbelok
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
                    onClick={() => navigate('/belajar/turtlemotion/forwardbackward')}
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
                    <div style={{ marginTop: '5px', display: 'flex', gap: '10px' }}>
                    <Button variant="success" onClick={() => runitchallanges(pythonCodeChallanges)}>Run Code</Button>
                      <Button variant="secondary" onClick={resetCodeChallanges}>
                        <BsArrowClockwise /> Reset
                      </Button>
                      </div>
                    <pre className="output"style={{
                        height: "60px",
                        marginTop: '5px',
                        border: "2px solid #ccc",
                        borderRadius: "5px",
                        padding: "5px",
                        backgroundColor: "#fff",
                      }}>
                      {output}
                    </pre>
                  </div>
                  <div className="canvas-section" 
                  style={{
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
                    {/* Conditional rendering of warning images based on currentStep */}
                    {currentStep === 1 && (
                      <img
                        src={peringatan}
                        alt="warning"
                        style={{
                          position: "absolute",
                          left: "330px",
                          top: "280px",
                          width: "40px",
                          height: "40px",
                          zIndex: 10,
                        }}
                      />
                    )}
                    {currentStep === 3 && (
                      <img
                        src={peringatan}
                        alt="warning"
                        style={{
                          position: "absolute",
                          left: "280px",
                          top: "35px",
                          width: "40px",
                          height: "40px",
                          zIndex: 10,
                        }}
                      />
                    )}
                    

                    <img
                      src={tilemap}
                      alt="Map"
                      style={{
                        position: "absolute",
                        left: "0px",
                        top: "0px",
                        width: "400px",
                        height: "400px",
                      }}
                      />
                      <img
                      src={map}
                      alt="Map"
                      style={{
                        position: "absolute",
                        left: "0px",
                        top: "0px",
                        width: "400px",
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
            onClick={() => navigate('/challanges/3')}
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

export default TantanganDua
