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
import peringatan from './assets/peringatan.gif';
import Swal from "sweetalert2";

// Challange
import swal from 'sweetalert'; // Import SweetAlert
import papuyu from './assets/papuyu-1.png';
import broccoli from './assets/kepiting.png';
import map from './assets/1-left-right-c.png';
import tilemap from './assets/1-left-right-tilemap.png';

import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../assets/tutor-copy.css";

const positions = [
    { left: '281px', top: '107px', angle: 30 },
    { left: '241px', top: '67px', angle: 60 },
    { left: '175px', top: '50px', angle: 90 },
    { left: '282px', top: '245px', angle: -30 },
    { left: '238px', top: '285px', angle: -60 },
    { left: '173px', top: '298px', angle: -90 }
  ];

const TantanganSatu = () => {
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
              <p>Tugas kamu adalah menebak arah kepiting dan mengarahkan Bidawang ke arah yang tepat menggunakan <b>satu perintah saja</b>, yaitu <b>left()</b> atau <b>right()</b>.</p>
              <p>Jika jawabanmu benar, kepiting akan <b>berpindah ke posisi lain</b>. Tantangan akan selesai setelah kamu berhasil menebak <b>semua arah kepiting</b> dengan benar.</p>
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
        setProgresTantangan(Number(progresTantangan));

        // Misal: hanya bisa akses jika progres_tantangan >= 3
        if (progresTantangan < 0) {
          navigate('/challanges'); // ganti ke halaman tantangan sebelumnya
        }

      } catch (error) {
        console.log(error);
        navigate('/login'); // fallback ke login
      }
    };

    checkAksesTantangan();
  }, [navigate]);
    
    

  // Challenge state
  const [pythonCodeChallanges, setPythonCodeChallanges] = useState('');
  const [output, setOutput] = useState('');
  const [usedIndexes, setUsedIndexes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(
    Math.floor(Math.random() * positions.length)
  );

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

  const initializeTurtle = () => {
    const imports = "from turtle import *\nshape('turtle')\nspeed(2)\n";
    const initialPosition = "penup()\nsetpos(0, 0)\ndown()\n"; // Set initial position
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

  const resetTurtlePosition = () => {
    const resetProg = "from turtle import *\npenup()\nhome()\nshape('turtle')\npendown()\n"; // Reset position to (0, 0)
    window.Sk.misceval.asyncToPromise(() => 
      window.Sk.importMainWithBody('<stdin>', false, resetProg, true)
    ).then(
      () => {},
      (err) => setOutput((prev) => prev + err.toString())
    );
  };

  const runitchallanges = () => {
    setOutput('');
    const imports = "from turtle import *\nshape('turtle')\nspeed(2)\n";
    const parsedCode = parseSimpleCommands(pythonCodeChallanges);
    const prog = imports + parsedCode;

    window.Sk.pre = "output4";
    window.Sk.configure({ output: outf, read: builtinRead });
    (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas-challanges';

    window.Sk.misceval.asyncToPromise(() => 
      window.Sk.importMainWithBody('<stdin>', false, prog, true)
    ).then(
      () => checkCodeChallanges(),
      (err) => setOutput((prev) => prev + err.toString())
    );
  };

  const checkCodeChallanges = () => {
    const validAngles = [0, 15, 30, 45, 60, 75, 90];
    const correctAngle = positions[currentIndex].angle;
  
    // Gunakan kode yang sudah diparse
    const parsedCode = parseSimpleCommands(pythonCodeChallanges);
  
    // Periksa apakah perintah sudah sesuai dengan arah yang benar
    let isCorrect = false;
  
    if (correctAngle === 0) {
      isCorrect = parsedCode.includes(`left(0)`) || parsedCode.includes(`right(0)`);
    } else if (correctAngle > 0) {
      isCorrect = parsedCode.includes(`left(${correctAngle})`);
    } else {
      isCorrect = parsedCode.includes(`right(${Math.abs(correctAngle)})`);
    }
  
    if (validAngles.includes(Math.abs(correctAngle)) && isCorrect) {
      swal("Benar!", "Cacing berpindah ke posisi lain.", "success").then(() => {
        resetTurtlePosition();
        moveBroccoli();
        setPythonCodeChallanges('');
      });
    } else {
      swal("Salah", "Coba lagi!", "error").then(() => {
        resetTurtlePosition();
        setPythonCodeChallanges('');
      });
    }
  };
  

  const moveBroccoli = async () => {
    let availableIndexes = positions.map((_, i) => i).filter(i => !usedIndexes.includes(i));
  
    if (availableIndexes.length === 0) {
      // Semua tantangan selesai
      swal("Tantangan Selesai!", "Kamu telah menyelesaikan semua posisi!", "success").then(async () => {
        try {
          if (progresTantangan === 0) {
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
      
        setUsedIndexes([]); // reset posisi
        const newIndexes = positions.map((_, i) => i);
        const nextIndex = newIndexes[Math.floor(Math.random() * newIndexes.length)];
        setCurrentIndex(nextIndex);
      });      
      return;
    }
  
    const nextIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
    setUsedIndexes([...usedIndexes, nextIndex]);
    setCurrentIndex(nextIndex);
  };

  useEffect(() => {
    initializeTurtle(); // Initialize turtle for challenges
  }, []);

  return (
    <Container fluid className="sidenavigasi mt-5">
        <Row>
        {/* Kolom Kiri - Prev */}
        <Col md={2} className="d-flex justify-content-center align-items-center">
        {/* <Button
            variant="light"
            onClick={() => navigate('/materi')}
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
        </Button> */}
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
              1. Mengubah Arah ke Kiri dan ke Kanan
            </h4>
            
                <p style={{ fontSize: "16px", marginBottom: "10px" }}>
                    Selesaikan tantangan dengan perintah <code>left()</code> dan <code>right()</code>. Klik petunjuk untuk bantuan.
                  </p>

                  <div className="d-flex gap-2 mb-2">
                    <Button variant="info" onClick={showHint} style={{ color: 'white', fontWeight: 'bold' }}>
                        Petunjuk
                    </Button>

                    <Button
                    variant="warning"
                    onClick={() => navigate('/belajar/turtlemotion/leftright')}
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
                        <Button variant="success" onClick={runitchallanges}>Run Code</Button>
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
                      }}
                    >
                      <div id="mycanvas-challanges" style={{ width: 400, height: 400, position: "relative" }}></div>
                      <img
                        src={broccoli}
                        alt="broccoli"
                        style={{
                          position: "absolute",
                          borderRadius: "10px",
                          left: positions[currentIndex].left,
                          top: positions[currentIndex].top,
                          zIndex: 100,
                          width: "50px",
                          height: "50px",
                          objectFit: "cover"
                        }}
                      />
                      <img
                        src={tilemap}
                        alt="Map"
                        style={{ position: "absolute", left: "0px", top: "0px", width: "400px", height: "400px" }}
                      />
                      <img
                        src={map}
                        alt="Map"
                        style={{ position: "absolute", left: "0px", top: "0px", width: "400px", height: "400px" }}
                      />
                    </div>
                  </div>
                </div>
        </Col>

        {/* Kolom Kanan - Next */}
        <Col md={2} className="d-flex justify-content-center align-items-center">
        <Button
            variant="light"
            onClick={() => navigate('/challanges/2')}
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

export default TantanganSatu