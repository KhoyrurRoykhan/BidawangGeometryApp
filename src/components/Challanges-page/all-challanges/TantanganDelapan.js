import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { InputGroup, FloatingLabel } from 'react-bootstrap';
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
import broccoli from './assets/cacingtarget.png';
import udang from './assets/udang.png';
import map from './assets/2-xcor-ycor.png';
import grid from './assets/grid.png';
import Swal from "sweetalert2";


import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../assets/tutor-copy.css";


const TantanganDelapan = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState("");

    const [inputA, setInputA] = useState("");
    const [inputB, setInputB] = useState("");

    // hint
    const showHint = () => {
      swal({
        title: "Petunjuk Tantangan",
        content: {
          element: "div",
          attributes: {
            innerHTML: `
              <p>Bidawang saat ini berada di tengah layar (titik <b>(0, 0)</b>).</p>
              <p>Tugas kamu adalah <b>menebak posisi X dan Y</b> Udang.</p>
              <p>Gerakkan Bidawang menuju posisi objek, lalu gunakan perintah <b>print(xcor())</b> dan <b>print(ycor())</b> untuk mengetahui titik koordinatnya.</p>
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
        if (progresTantangan < 7) {
          navigate('/challanges'); // ganti ke halaman tantangan sebelumnya
        }

      } catch (error) {
        console.log(error);
        navigate('/login'); // fallback ke login
      }
    };

    checkAksesTantangan();
  }, [navigate]); 
  
  const checkAnswer = async () => {
    const correctAnswersA = ["-100.0", "-100", "-100 "];
    const correctAnswersB = ["100.0", "100", "100 "];
  
    if (correctAnswersA.includes(inputA) && correctAnswersB.includes(inputB)) {
      await swal("Benar!", "Jawaban Anda benar.", "success");
  
      try {
        if (progresTantangan === 7) {
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
        console.error("Gagal update progres tantangan halaman 8:", error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal Update Progres Tantangan',
          text: 'Terjadi kesalahan saat memperbarui progres tantangan halaman kedelapan.',
          confirmButtonColor: '#d33'
        });
      }
  
    } else {
      swal("Salah!", "Jawaban Anda salah.", "error");
    }
  };

      const [pythonCode, setPythonCode] = useState(``);
    const [pythonCode1, setPythonCode1] = useState(`
for i in range(100):
    speed(1)
    # Memindahkan bidawang ke posisi lain
    left(45)
    forward(150)
    speed(0)
    home()
    reset()

`);
  
  
    const [pythonCodeChallanges, setPythonCodeChallanges] = useState(``);
  
    const [output, setOutput] = useState('');
    const [output1, setOutput1] = useState('');
    const [outputChallanges, setOutputChallanges] = useState('');
  
    const outf = (text) => {
      setOutput((prev) => prev + text);
    };
  
    const outf1 = (text) => {
      setOutput1((prev) => prev + text);
    };
  
    const outfchallanges = (text) => {
      setOutputChallanges((prev) => prev + text);
    };
  
    const builtinRead = (x) => {
      if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles['files'][x] === undefined) {
        throw `File not found: '${x}'`;
      }
      return window.Sk.builtinFiles['files'][x];
    };
  
    const builtinRead1 = (x) => {
      if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles['files'][x] === undefined) {
        throw `File not found: '${x}'`;
      }
      return window.Sk.builtinFiles['files'][x];
    };
  
    const builtinReadChallanges = (x) => {
      if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles['files'][x] === undefined) {
        throw `File not found: '${x}'`;
      }
      return window.Sk.builtinFiles['files'][x];
    };

    const runitchallanges = (code, forceReset = false, skipValidation = false) => {
        setOutputChallanges('');
        const imports = "from turtle import *\nreset()\nshape('turtle')\nspeed(2)\n";
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
            if (!skipValidation) checkCodeChallanges(); // 👈 Hanya validasi kalau tidak sedang reset
          },
          (err) => setOutputChallanges((prev) => prev + err.toString())
        );
      };
    
      const [hasRun, setHasRun] = useState(false);
    
      const checkCodeChallanges = () => {
        if (!hasRun) return;
      
        const expectedSteps = [
          { cmd: "left", val: 180 },
          { cmd: "forward", val: 100 },
          { cmd: "left", val: 90 },
          { cmd: "forward", val: 100 },
          { cmd: "left", val: 90 },
          { cmd: "forward", val: 200 },
          { cmd: "left", val: 90 },
          { cmd: "forward", val: 200 },
          { cmd: "left", val: 90 },
          { cmd: "forward", val: 200 },
          { cmd: "print", val: "xcor()" },
          { cmd: "print", val: "ycor()" }
        ];
      
        const showError = (index, message) => {
          swal("Salah!", `Langkah ke-${index + 1}: ${message}`, "error").then(() => {
            setHasRun(false);
            resetCodeChallanges();
          });
        };
      
        const lines = pythonCodeChallanges
          .trim()
          .split("\n")
          .map(line => line.trim())
          .filter(line => line !== ""); // buang baris kosong
      
        const stepsToCheck = Math.min(lines.length, expectedSteps.length);
      
        for (let i = 0; i < stepsToCheck; i++) {
          const step = expectedSteps[i];
          const line = lines[i];
      
          if (!line) return showError(i, "Perintah tidak ditemukan.");
      
          if (step.cmd === "print") {
            if (!line.startsWith("print(")) {
              return showError(i, `Anda harus menggunakan print(${step.val}) pada tahap ini.`);
            }
            const match = line.match(/print\s*\((.*)\)/);
            if (!match || match[1].replace(/\s+/g, "") !== step.val) {
              return showError(i, `Isi print harus print(${step.val}).`);
            }
          } else {
            const match = line.match(/(\w+)\s*\((\d+)\)/);
            if (!match) return showError(i, "Format perintah tidak dikenali.");
      
            const [, cmd, valStr] = match;
            const val = parseInt(valStr);
      
            if (step.cmd === "left") {
              const isLeftCorrect = cmd === "left" && val === step.val;
              const isRightEquivalent = cmd === "right" && val === (360 - step.val);
      
              if (!isLeftCorrect && !isRightEquivalent) {
                return showError(i, `Gunakan left(${step.val}) atau right(${360 - step.val}).`);
              }
            } else {
              if (cmd !== step.cmd) {
                return showError(i, `Anda harus menggunakan perintah ${step.cmd}(${step.val}) pada tahap ini.`);
              }
      
              if (val < step.val) {
                return showError(i, `Nilai ${cmd} kurang dari yang seharusnya (${step.val}).`);
              }
      
              if (val > step.val) {
                return showError(i, `Nilai ${cmd} berlebihan dari yang seharusnya (${step.val}).`);
              }
            }
          }
        }
      
        if (lines.length === expectedSteps.length) {
          swal("Benar!", "Seluruh langkah sudah benar!", "success");
        }
      };
      
    
    
    
    const resetCodeChallanges = () => {
      setHasRun(false);
      setPythonCodeChallanges('');
      setOutput('');
      runitchallanges('', true, true);
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
            onClick={() => navigate('/challanges/7')}
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
              8. Mencari Tahu Koordinat X dan Y Udang
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
                    onClick={() => navigate('/belajar/tellstate/xcorycor')}
                    style={{ color: 'white', fontWeight: 'bold' }}
                    >
                    Kembali ke Materi
                    </Button>

                </div>

                <div className="mb-2 mt-4 d-flex align-items-end flex-wrap gap-3">
                  <InputGroup style={{ maxWidth: 200 }}>
                    <InputGroup.Text><b>X</b></InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Masukkan nilai A"
                      value={inputA}
                      onChange={(e) => setInputA(e.target.value)}
                    />
                  </InputGroup>

                  <InputGroup style={{ maxWidth: 200 }}>
                    <InputGroup.Text><b>Y</b></InputGroup.Text>
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
                      <Button variant="success" onClick={() => { runitchallanges();}}>Run Code</Button>
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
                          src={udang}
                          alt="Target Broccoli"
                          style={{
                            position: "absolute",
                            left: "75px",
                            top: "75px",
                            width: "50px", // Sesuaikan ukuran jika perlu
                            height: "50px",
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
            onClick={() => navigate('/challanges/9')}
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

export default TantanganDelapan
