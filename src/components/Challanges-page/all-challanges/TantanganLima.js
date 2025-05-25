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

// Challange
import swal from 'sweetalert'; // Import SweetAlert
import Swal from "sweetalert2";
import papuyu from './assets/papuyu-1.png';
import broccoli from './assets/kepiting.png';
import grid from './assets/3-setposition-b.png';
import map from './assets/5-setheading-tilemap.png';

import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../assets/tutor-copy.css";



const TantanganLima = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState("");

    //hh
    const showHint = () => {
      swal({
        title: "Petunjuk Tantangan",
        content: {
          element: "div",
          attributes: {
            innerHTML: `
              <p>Bidawang saat ini berada di tengah layar (titik <b>(0, 0)</b>), sedangkan kepiting berada di suatu arah tertentu.</p>
              <p>Tugas kamu adalah <b>mengubah arah Bidawang</b> agar menghadap ke arah kepiting menggunakan perintah <b>setheading()</b>.</p>
              <p>Jika arah yang kamu masukkan benar, kepiting akan <b>berpindah tempat</b>. Tantangan akan selesai setelah kamu berhasil <b>menebak semua arah kepiting</b> dengan benar.</p>
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
        if (progresTantangan < 4) {
          navigate('/challanges'); // ganti ke halaman tantangan sebelumnya
        }

      } catch (error) {
        console.log(error);
        navigate('/login'); // fallback ke login
      }
    };

    checkAksesTantangan();
  }, [navigate]); 
    

  const [pythonCodeChallanges, setPythonCodeChallanges] = useState('');
  const [output, setOutput] = useState('');
  const [step, setStep] = useState(0);
  const [hasRun, setHasRun] = useState(false);
  const [processingAlert, setProcessingAlert] = useState(false);

  const headingAnswers = [0, 90, 180, 270];
  const broccoliPositions = [
    { left: '345px', top: '175px' }, // setheading(0)
    { left: '175px', top: '5px' },   // setheading(90)
    { left: '5px', top: '175px' },   // setheading(180)
    { left: '175px', top: '345px' }, // setheading(270)
  ];

  const outf = (text) => {
    setOutput((prev) => prev + text);
  };

  const builtinRead = (x) => {
    if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles['files'][x] === undefined) {
      throw `File not found: '${x}'`;
    }
    return window.Sk.builtinFiles['files'][x];
  };

  const parseSimpleCommands = (code) => {
    const lines = code.split('\n');
    const parsedLines = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();
        const leadingSpaces = line.match(/^\s*/)?.[0] || '';

        if (trimmed === '' || trimmed.startsWith('#')) {
            parsedLines.push(line);
            i++;
            continue;
        }

        const forMatch = trimmed.match(/^for\s+(\d+)$/);
        if (forMatch) {
            const loopCount = parseInt(forMatch[1]);
            parsedLines.push(`${leadingSpaces}for i in range(${loopCount}):`);
            i++;

            while (i < lines.length) {
                const nextLine = lines[i];
                const nextTrimmed = nextLine.trim();
                const nextIndent = nextLine.match(/^\s*/)?.[0].length || 0;

                if (nextTrimmed === '' || nextTrimmed.startsWith('#')) {
                    parsedLines.push(nextLine);
                    i++;
                    continue;
                }

                if (nextIndent <= leadingSpaces.length) break;

                const parts = nextTrimmed.split(/\s+/);
                const cmd = parts[0];
                const args = parts.slice(1);
                const isAllArgsNumeric = args.every(arg => !isNaN(parseFloat(arg)));
                const isStringArg = args.length === 1 && /^["'].*["']$/.test(args[0]);

                if (nextTrimmed.includes('(') && nextTrimmed.includes(')')) {
                    parsedLines.push(nextLine);
                } else if ((isAllArgsNumeric && args.length > 0) || isStringArg) {
                    parsedLines.push(`${nextLine.match(/^\s*/)?.[0] || ''}${cmd}(${args.join(', ')})`);
                } else {
                    parsedLines.push(nextLine);
                }
                i++;
            }
            continue;
        }

        const parts = trimmed.split(/\s+/);
        const cmd = parts[0];
        const args = parts.slice(1);
        const noArgCommands = ['clear', 'home', 'reset', 'penup', 'pendown', 'showturtle', 'hideturtle','begin_fill','end_fill'];
        const isAllArgsNumeric = args.every(arg => !isNaN(parseFloat(arg)));
        const isStringArg = args.length === 1 && /^["'].*["']$/.test(args[0]);

        // Konversi print distance, position, xcor, ycor, heading, isdown
        if (cmd === 'print' && args.length >= 1) {
            const arg = args[0];

            if (arg === 'position') {
                parsedLines.push(`${leadingSpaces}print(position())`);
                i++;
                continue;
            } else if (arg === 'xcor') {
                parsedLines.push(`${leadingSpaces}print(xcor())`);
                i++;
                continue;
            } else if (arg === 'ycor') {
                parsedLines.push(`${leadingSpaces}print(ycor())`);
                i++;
                continue;
            } else if (arg === 'heading') {
                parsedLines.push(`${leadingSpaces}print(heading())`);
                i++;
                continue;
            } else if (arg === 'isdown') {
                parsedLines.push(`${leadingSpaces}print(isdown())`);
                i++;
                continue;
            } else if (arg === 'distance') {
                if (args.length === 3 && !isNaN(args[1]) && !isNaN(args[2])) {
                    parsedLines.push(`${leadingSpaces}print(distance(${args[1]}, ${args[2]}))`);
                    i++;
                    continue;
                }
            }
        }

        if (trimmed.includes('(') && trimmed.includes(')')) {
            parsedLines.push(line);
        } else if (noArgCommands.includes(cmd) && args.length === 0) {
            parsedLines.push(`${leadingSpaces}${cmd}()`);
        } else if ((isAllArgsNumeric && args.length > 0) || isStringArg) {
            parsedLines.push(`${leadingSpaces}${cmd}(${args.join(', ')})`);
        } else {
            parsedLines.push(line);
        }

        i++;
    }

    return parsedLines.join('\n');
};

  const runitchallanges = (code, forceReset = false) => {
    if (processingAlert) return;
    setOutput('');
    const imports = "from turtle import *\nreset()\nshape('turtle')\nspeed(2)\n";
    const parsedCode = parseSimpleCommands(pythonCodeChallanges);
    const prog = forceReset ? imports : imports + parsedCode;


    window.Sk.pre = "output4";
    window.Sk.configure({ output: outf, read: builtinRead });
    (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas-challanges';

    window.Sk.misceval.asyncToPromise(() => 
      window.Sk.importMainWithBody('<stdin>', false, prog, true)
    ).then(
      () => {
        setHasRun(true);
        if (!forceReset) checkCodeChallanges();
      },
      (err) => setOutput((prev) => prev + err.toString())
    );
  };

  const checkCodeChallanges = async () => {
    if (!hasRun || processingAlert) return;

    const parsedUserCode = parseSimpleCommands(pythonCodeChallanges)
      .replace(/\s/g, '')
      .replace(/setheading/gi, 'setheading');

    const expectedAngle = headingAnswers[step];

    const isCorrect = parsedUserCode.includes(`setheading(${expectedAngle})`);


    setProcessingAlert(true);
    if (isCorrect) {
      await swal("Jawaban Benar!", "Kamu berhasil! Kepiting akan berpindah posisi", "success").then(() => {
        if (step < headingAnswers.length - 1) {
          setStep((prev) => prev + 1);
        } else {  
          swal("Tantangan Selesai!", "Kamu berhasil menebak semua arah posisi kepiting dengan setheading!", "success").then(async () => {
            try {
              if (progresTantangan === 4) {
                // Update progres tantangan jika sudah menyelesaikan halaman ke-5
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
              console.error("Gagal update progres tantangan halaman 5:", error);
              Swal.fire({
                icon: 'error',
                title: 'Gagal Update Progres Tantangan',
                text: 'Terjadi kesalahan saat memperbarui progres tantangan halaman kelima.',
                confirmButtonColor: '#d33'
              });
            }
          });
        }
        resetCodeChallanges();
      });
    } else if (parsedUserCode !== '') {
      await swal("Jawaban Salah", "Gunakan setheading() untuk mengatur arahnya.", "error").then(() => {
        resetCodeChallanges();
      });
    }
    setProcessingAlert(false);
  };


  const resetCodeChallanges = () => {
    setPythonCodeChallanges('');
    setOutput('');
    setHasRun(false);
    setTimeout(() => runitchallanges('', true), 100);
  };


  useEffect(() => {
    runitchallanges(); // Jalankan kode saat halaman dimuat
  }, []);
  return (
    <Container fluid className="sidenavigasi mt-5" style={{backgroundColor:'white'}}>
        <Row>
        {/* Kolom Kiri - Prev */}
        <Col md={2} className="d-flex justify-content-center align-items-center">
        <Button
            variant="light"
            onClick={() => navigate('/challanges/4')}
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
              5. Menebak Arah Kepiting Dengan Spesifik
            </h4>
            
            <p>Selesaikan tantangan dengan mengarahkan bidawang ke arah cacing menggunakan <code>setheading()</code>.</p>
            <div className="d-flex gap-2 mb-2">
                    <Button variant="info" onClick={showHint} style={{ color: 'white', fontWeight: 'bold' }}>
                        Petunjuk
                    </Button>

                    <Button
                    variant="warning"
                    onClick={() => navigate('/belajar/turtlemotion/setheading')}
                    style={{ color: 'white', fontWeight: 'bold' }}
                    >
                    Kembali ke Materi
                    </Button>

                </div>

              <div className="skulpt-container" style={{ border: "3px solid #ccc", borderRadius: "10px", padding: "15px", backgroundColor: "#f9f9f9" }}>
                <div className="editor-section">
                  <CodeMirror
                    value={pythonCodeChallanges}
                    placeholder={'// Ketikan kode disini!'}
                    height="290px"
                    theme="light"
                    extensions={[python()]}
                    onChange={(value) => setPythonCodeChallanges(value)}
                    style={{ border: "2px solid #2DAA9E", borderRadius: "8px", padding: "5px" }}
                  />
                  <div style={{ marginTop: '5px', marginBottom: '5px', display: 'flex', gap: '10px' }}>
                    <Button variant="success" onClick={() => runitchallanges()}>Run Code</Button>
                    <Button variant="secondary" onClick={resetCodeChallanges}><BsArrowClockwise/> Reset</Button>
                  </div>
                  <pre className="output" style={{ height: "60px", border: "2px solid #ccc", borderRadius: "5px", padding: "5px", backgroundColor: "#fff" }}>{output}</pre>
                </div>
                <div className="canvas-section" style={{ position: "relative", width: "400px", height: "405px", borderRadius: "10px", border: "3px solid #2DAA9E" }}>
                  <div id="mycanvas-challanges" style={{ width: 400, height: 400, position: "relative" }}></div>
                  <img src={map} alt="Map" style={{ position: "absolute", left: "0px", top: "0px", width: "400px", height: "400px" }} />
                  <img src={grid} alt="Grid" style={{ position: "absolute", left: "0px", top: "0px", width: "400px", height: "400px" }} />
                  <img src={broccoli} alt="Target Broccoli" style={{ position: "absolute", ...broccoliPositions[step], width: "50px", height: "50px" }} />
                </div>
              </div>
            </div>
        </Col>

        {/* Kolom Kanan - Next */}
        <Col md={2} className="d-flex justify-content-center align-items-center">
        <Button
            variant="light"
            onClick={() => navigate('/challanges/6')}
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

export default TantanganLima
