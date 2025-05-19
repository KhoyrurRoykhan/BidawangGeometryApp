import React, { useState, useEffect, useRef } from 'react';
import { InputGroup, FloatingLabel } from 'react-bootstrap';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { Accordion, Container, Row, Col, Button, Form, Alert, Card, Image, AccordionItem, AccordionHeader, AccordionBody } from 'react-bootstrap';
import { BsArrowClockwise, BsCheckCircle } from 'react-icons/bs'; // Import ikon Bootstrap
import '../assets/tutor.css';
import '../asset_skulpt/SkulptTurtleRunner.css';
import forward100 from './assets/2turtle-forward.gif';
import backward100 from './assets/2turtle-backward.gif';
// import combinedForwardBackward from './assets/combinedForwardBackward.gif';

// Challange
import swal from 'sweetalert'; // Import SweetAlert
import Swal from "sweetalert2";
import papuyu from './assets/papuyu-1.png';
import broccoli from './assets/cacingtarget.png';
import ikan from './assets/ikan.png';
import sawi from './assets/sawi.png';
import map from './assets/1-position.png';
import grid from './assets/grid.png';

import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../assets/tutor-copy.css";

const TantanganTujuh = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState("");

    // hint
    const showHint = () => {
      swal({
        title: "Petunjuk Tantangan",
        content: {
          element: "div",
          attributes: {
            innerHTML: `
              <p>Bidawang saat ini berada di tengah layar (titik <b>(0, 0)</b>).</p>
              <p>Tugas kamu adalah <b>menebak posisi Objek A (Bayam)</b> dan <b>Objek B (Papuyu)</b>.</p>
              <p>Gerakkan Bidawang menuju masing-masing objek, lalu gunakan perintah <b>print(position())</b> untuk mengetahui titik koordinatnya.</p>
              <p>Gunakan kombinasi perintah <b>left()</b>, <b>right()</b>, dan <b>forward()</b> untuk berpindah dari satu titik ke titik lainnya.</p>
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
        if (progresTantangan < 6) {
          navigate('/challanges'); // ganti ke halaman tantangan sebelumnya
        }

      } catch (error) {
        console.log(error);
        navigate('/login'); // fallback ke login
      }
    };

    checkAksesTantangan();
  }, [navigate]); 
    
    
    

  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");

  const checkAnswer = async () => {
    const correctAnswersA = ["(-100.0, 100.0)", "(-100, 100)", "(-100,100)"];
    const correctAnswersB = ["(-150.0, -100.0)", "(-150, -100)", "(-150,-100)"];
  
    if (correctAnswersA.includes(inputA) && correctAnswersB.includes(inputB)) {
      await swal("Benar!", "Jawaban Anda benar.", "success");
  
      try {
        if (progresTantangan === 6) {
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
        console.error("Gagal update progres tantangan halaman 7:", error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal Update Progres Tantangan',
          text: 'Terjadi kesalahan saat memperbarui progres tantangan halaman ketujuh.',
          confirmButtonColor: '#d33'
        });
      }
  
    } else {
      swal("Salah!", "Jawaban Anda salah.", "error");
    }
  };

  const [currentStep, setCurrentStep] = useState(0); // Track the current step
  const pythonCodeRef = useRef('');

  const [pythonCodeChallanges, setPythonCodeChallanges] = useState(``);

  const [output, setOutput] = useState('');
  const [output1, setOutput1] = useState('');
  const [output2, setOutput2] = useState('');
  const [outputChallanges, setOutputChallanges] = useState('');


  const outfchallanges = (text) => {
    setOutputChallanges((prev) => prev + text);
  };

  const builtinReadChallanges = (x) => {
    if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles['files'][x] === undefined) {
      throw `File not found: '${x}'`;
    }
    return window.Sk.builtinFiles['files'][x];
  };

  const [isResetting, setIsResetting] = useState(false);

  const runitchallanges = (code, forceReset = false) => {
    setOutputChallanges('');
    if (forceReset) setIsResetting(true);
  
    const imports = "from turtle import *\nreset()\nshape('turtle')\nspeed(2)\n";
    const prog = forceReset ? imports : imports + (code || pythonCodeChallanges);
  
    window.Sk.pre = "outputChallanges";
    window.Sk.configure({ output: outfchallanges, read: builtinReadChallanges });
    (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas-challanges';
  
    window.Sk.misceval.asyncToPromise(() =>
      window.Sk.importMainWithBody('<stdin>', false, prog, true)
    ).then(
      () => {
        setHasRun(true);
  
        // ❌ Jangan validasi jika sedang reset
        if (!forceReset && !isResetting) {
          checkCodeChallanges();
        }
  
        // ✅ Matikan flag reset setelah jalan
        if (forceReset) setIsResetting(false);
      },
      (err) => {
        setOutputChallanges((prev) => prev + err.toString());
        if (forceReset) setIsResetting(false);
      }
    );
  };

  const [hasRun, setHasRun] = useState(false);

  const checkCodeChallanges = () => {
    if (!hasRun) return;
  
    const correctSteps = [
      { cmd: "left", val: 90 },
      { cmd: "forward", val: 100 },
      { cmd: "left", val: 90 },
      { cmd: "forward", val: 100 },
      { cmd: "print", val: "position()" },
      { cmd: "forward", val: 50 },
      { cmd: "left", val: 90 },
      { cmd: "forward", val: 200 },
      { cmd: "print", val: "position()" }
    ];
  
    // Bersihkan baris dan buang baris kosong
    const userLines = pythonCodeChallanges
      .trim()
      .split("\n")
      .map(line => line.trim())
      .filter(line => line !== ""); // ← ini yang penting
  
    const showStepError = (stepIndex, message) => {
      swal("Salah!", `Langkah ke-${stepIndex + 1}: ${message}`, "error").then(() => resetCodeChallanges());
    };
  
    const isMatchingCommand = (line, expected) => {
      const match = line.match(/(\w+)\s*\((\d+)\)/);
      if (!match) return { valid: false, message: "Format perintah tidak dikenali." };
  
      const [_, cmd, valStr] = match;
      const val = parseInt(valStr);
  
      const equivalent = {
        left: {
          90: { cmd: "right", val: 270 },
          180: { cmd: "right", val: 180 },
          270: { cmd: "right", val: 90 }
        },
        right: {
          90: { cmd: "left", val: 270 },
          180: { cmd: "left", val: 180 },
          270: { cmd: "left", val: 90 }
        }
      };
  
      const isExactMatch = cmd === expected.cmd && val === expected.val;
      const isEquivalentMatch =
        equivalent[expected.cmd]?.[expected.val]?.cmd === cmd &&
        equivalent[expected.cmd]?.[expected.val]?.val === val;
  
      if (!isExactMatch && !isEquivalentMatch) {
        return { valid: false, message: `Gunakan ${expected.cmd}(${expected.val}) atau ekuivalennya.` };
      }
  
      return { valid: true };
    };
  
    const isMatchingPrint = (line, expectedVal) => {
      if (!line.startsWith("print")) {
        return { valid: false, message: `Gunakan perintah print(${expectedVal}).` };
      }
  
      const inside = line.match(/print\s*\((.*)\)/);
      if (!inside || inside[1].replace(/\s+/g, '') !== expectedVal) {
        return { valid: false, message: `Isi print harus print(${expectedVal}).` };
      }
  
      return { valid: true };
    };
  
    for (let i = 0; i < userLines.length; i++) {
      const line = userLines[i];
      const expectedStep = correctSteps[i];
  
      if (!expectedStep) {
        return showStepError(i, "Langkah ini tidak diperlukan.");
      }
  
      const result = expectedStep.cmd === "print"
        ? isMatchingPrint(line, expectedStep.val)
        : isMatchingCommand(line, expectedStep);
  
      if (!result.valid) {
        return showStepError(i, result.message);
      }
    }
  
    // Jangan terlalu ketat, biarkan multi-step
    if (userLines.length === correctSteps.length) {
      swal("Benar!", "Seluruh langkah sudah benar!", "success");
    }
  };
  


  const handleRunClick = () => {
    runitchallanges();
  };

  const resetCodeChallanges = () => {
    setPythonCodeChallanges('');
    setOutput('');
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
            onClick={() => navigate('/challanges/6')}
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
              7. Mencari Tahu Koordinat Sayur dan Ikan
            </h4>
            
            <p>
              Selesaikan tantangan dibawah ini!
              Klik tombol petunjuk untuk menampilkan petujuk pengerjaan.
              </p>
              <div className="d-flex gap-2 mb-2">
                    <Button variant="info" onClick={showHint} style={{ color: 'white', fontWeight: 'bold' }}>
                        Petunjuk
                    </Button>

                    <Button
                    variant="warning"
                    onClick={() => navigate('/belajar/tellstate/position')}
                    style={{ color: 'white', fontWeight: 'bold' }}
                    >
                    Kembali ke Materi
                    </Button>

                </div>

                <div className="mb-2 mt-4 d-flex align-items-end flex-wrap gap-3">
                  <InputGroup style={{ maxWidth: 200 }}>
                    <InputGroup.Text><b>A</b></InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Masukkan nilai A"
                      value={inputA}
                      onChange={(e) => setInputA(e.target.value)}
                    />
                  </InputGroup>

                  <InputGroup style={{ maxWidth: 200 }}>
                    <InputGroup.Text><b>B</b></InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Masukkan nilai B"
                      value={inputB}
                      onChange={(e) => setInputB(e.target.value)}
                    />
                  </InputGroup>

                  <Button
                    variant="success"
                    style={{ fontWeight: 'bold', height: '38px' }}
                    onClick={checkAnswer}
                  >
                    Periksa Jawaban
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
                    height="250px"
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
                    <Button variant="success" onClick={() => { runitchallanges()}}>Run Code</Button>
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
                        alt="grid"
                        style={{
                          position: "absolute",
                          left: "0px",
                          top: "0px",
                          width: "400px", // Sesuaikan ukuran jika perlu
                          height: "400px",
                        }}
                    />
                    <img
                        src={sawi}
                        alt="Target Sawi"
                        style={{
                          position: "absolute",
                          left: "81px",
                          top: "79px",
                          width: "40px", // Sesuaikan ukuran jika perlu
                          height: "40px",
                        }}
                    />
                    <img
                        src={ikan}
                        alt="Target Ikan"
                        style={{
                          position: "absolute",
                          left: "32px",
                          top: "275px",
                          width: "40px", // Sesuaikan ukuran jika perlu
                          height: "40px",
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
            onClick={() => navigate('/challanges/8')}
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

export default TantanganTujuh
