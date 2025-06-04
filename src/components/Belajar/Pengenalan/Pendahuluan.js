import React, { useEffect, useState } from 'react'; 
import '../assets/tutor.css'; 
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import contohhasil from './assets/contoh-hasil.png';
import { Accordion, Container, Row, Col, Button, Form, Alert, Card, Image, AccordionItem, AccordionHeader, AccordionBody } from 'react-bootstrap';
import ProgressBar from 'react-bootstrap/ProgressBar';
import canvas from './assets/koordinat-kartesius.jpg';
import lingkungankerja from './assets/lingkungan-kerja.jpg';
import { BsArrowClockwise, BsCheckCircle } from 'react-icons/bs'; // Import ikon Bootstrap
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import "../assets/tutor-copy.css";
import { FaBars } from "react-icons/fa";
import { closeBrackets } from '@codemirror/autocomplete';



import option1a from './assets/1A.png';
import option1b from './assets/1B.png';
import option1c from './assets/1C.png';
import option1d from './assets/1D.png';

import option2a from './assets/2A.png';
import option2b from './assets/2B.png';
import option2c from './assets/2C.png';
import option2d from './assets/2D.png';

import soal3prog from './assets/turtle-forward.gif';

const correctCommands = {
  '1a': 'forward(100)',
  '1b': 'right(90)',
  '1c': 'forward(100)',
  '1d': 'left(45)',
  '1e': 'forward(50)'
};

const Pendahuluan = () => {
  //token
  const [activeButton, setActiveButton] = useState("intro-1");
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const navigate = useNavigate();

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
  const [progresBelajar, setProgresBelajar] = useState(0);

  const totalSteps = 27;
  const progressPercentage = Math.min((progresBelajar / totalSteps) * 100, 100);

  
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
        navigate('/login'); // atau ke halaman login siswa
      }
    };

    checkAkses();
  }, [navigate]);

  const handleNavigate = (path, syarat = true) => {
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
  


  //accordion task

  const runAndCheck = () => {
    if (!pythonCode.trim()) return;
  
    const newCommand = pythonCode.trim();
    const newHistory = [...commandHistory, newCommand];
  
    setCommandHistory(newHistory);
    setPythonCode('');
    runit(newCommand);
    checkCode(newHistory); // gunakan history yang sudah termasuk perintah baru
  };
  

  
  const [completedSteps, setCompletedSteps] = useState([]);
  const [activeKey, setActiveKey] = useState('1a');

  const checkCode = (customCommands = null) => {
    const allCommands = customCommands ? [...customCommands] : [...commandHistory];
    if (pythonCode.trim() && !customCommands) {
      allCommands.push(pythonCode.trim());
    }
  
    const parsed = parseSimpleCommands(allCommands.join('\n'));
    const lines = parsed.split('\n').map(line => line.trim());
  
    let newCompletedSteps = [];
    let keys = Object.keys(correctCommands);
  
    for (let i = 0; i < keys.length; i++) {
      const expectedParsed = parseSimpleCommands(correctCommands[keys[i]]).trim();
      if (lines[i] === expectedParsed) {
        newCompletedSteps.push(keys[i]);
      } else {
        break;
      }
    }
  
    setCompletedSteps(newCompletedSteps);
  
    if (newCompletedSteps.length < keys.length) {
      setActiveKey(keys[newCompletedSteps.length]);
    } else {
      setActiveKey(null);
      setTimeout(() => {
        Swal.fire({
          icon: 'success',
          title: 'Selamat!',
          text: 'Anda telah menyelesaikan seluruh aktivitas ini!',
        });
      }, 1000); // delay 2000 ms = 2 detik
    }
  };
  

  
  

  //Kuis
  // Kuis
const [selectedAnswer, setSelectedAnswer] = useState('');
const [selectedAnswer2, setSelectedAnswer2] = useState('');
const [selectedAnswer3, setSelectedAnswer3] = useState('');
const [feedback, setFeedback] = useState({ question1: '', question2: '', question3: '' });
const [currentQuestion, setCurrentQuestion] = useState(1);

const handleAnswerChange = (questionId, answer) => {
  if (questionId === "question1") {
    setSelectedAnswer(answer);
  } else if (questionId === "question2") {
    setSelectedAnswer2(answer);
  } 
};

const handleSubmit = async () => {
  if (currentQuestion === 1) {
    const isCorrect1 = selectedAnswer === 'option1a';
    setFeedback((prev) => ({ ...prev, question1: isCorrect1 ? 'Benar! Gambar tersebut menunjukkan Bidawang di posisi (0, 0), yaitu di tengah canvas.' : 'Salah! Posisi (0, 0) berada di tengah canvas. Coba perhatikan gambar yang menunjukkan Bidawang tepat di tengah.' }));

  } else if (currentQuestion === 2) {
    const isCorrect2 = selectedAnswer2 === 'option2b';
    setFeedback((prev) => ({ ...prev, question2: isCorrect2 ? 'Benar! Tombol tersebut digunakan untuk menghapus semua gambar dan mengembalikan Bidawang ke posisi awal.' : 'Salah!' }));

    if (isCorrect2) {
      try {
        if (Number(progresBelajar) === 0) {
          await axios.put(
            `${process.env.REACT_APP_API_ENDPOINT}/api/user/progres-belajar`,
            { progres_belajar: Number(progresBelajar) + 1 },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setProgresBelajar((prev) => Number(prev) + 1);
          Swal.fire({
            icon: 'success',
            title: 'Semua Jawaban Benar!',
            text: 'Materi selanjutnya sudah terbuka 😊',
            confirmButtonColor: '#198754',
          });
        } else {
          Swal.fire({
            icon: 'info',
            title: 'Sudah Diselesaikan',
            text: 'Kamu sudah menyelesaikan materi ini sebelumnya.',
            confirmButtonColor: '#198754',
          });
        }
      } catch (error) {
        console.error("Gagal update progres:", error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal Update Progres',
          text: 'Terjadi kesalahan saat memperbarui progres kamu.',
          confirmButtonColor: '#d33',
        });
      }
    }
  }
};

  
  
  
  


  const [pythonCode, setPythonCode] = useState(``);
  const [pythonCode2, setPythonCode2] = useState(`

for i in range(100):
  speed(1)
  forward(150)
  left(90)    
  forward(150)
  left(90)
  forward(150)
  left(90)    
  forward(150)
  left(90)
  
  clear()

  forward(150)
  left(120)
  forward(150)
  left(120)
  forward(150)
  left(120)
  
  clear()
  
  circle(100)
  
  clear()
  
  speed(2)
  for i in range(9):
    for _ in range(4):  
        forward(100)  
        right(90)  
    right(40)
  
  clear()

  speed(2)
  for i in range(9):
    for _ in range(3):  
        forward(100)  
        right(120)  
    right(40)
  
  clear()

  speed(2)
  for i in range(9):
    circle(50)  
    right(40)
  
  clear()
`);

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

const [commandHistory, setCommandHistory] = useState([]);

const handleKeyDown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();

    // Ambil kode dari pythonCode tanpa newline
    const cleaned = pythonCode.replace(/\s*\n\s*/g, '').trim();

    // Optional: pastikan buka-tutup kurung seimbang
    const openParens = (cleaned.match(/\(/g) || []).length;
    const closeParens = (cleaned.match(/\)/g) || []).length;

    if (cleaned && openParens === closeParens) {
      setPythonCode('');
      runit(cleaned);
      const updatedHistory = [...commandHistory, cleaned];
      setCommandHistory(updatedHistory);
      checkCode(updatedHistory);
    }
  }
};

// Fungsi Undo: hapus perintah terakhir dari history
const undoLastCommand = () => {
  if (commandHistory.length === 0) return;

  const newHistory = commandHistory.slice(0, -1);
  setCommandHistory(newHistory);
  checkCode(newHistory);

  // Jalankan ulang kode sesuai history terbaru (atau reset canvas jika kosong)
  if (newHistory.length > 0) {
    runit(newHistory.join('\n'), true); // true = reset canvas sebelum jalankan ulang
  } else {
    runit('', true); // kosong = reset canvas
  }
};


const runit = (code, forceReset = false) => {
  setOutput('');

  const parsedNewCode = parseSimpleCommands(code || pythonCode);
  const parsedHistory = commandHistory.map(cmd => parseSimpleCommands(cmd)).join('\n');

  const imports = "from turtle import *\nshape('turtle')\n";
  let prog = "";

  if (forceReset) {
    // Reset posisi & canvas
    prog = imports + "reset()\nspeed(1)\n" + parsedNewCode;
  } else {
    // Jalankan history dengan speed 0 (tanpa animasi), lalu kode baru dengan speed 1
    prog = imports +
           "reset()\nspeed(0)\n" + parsedHistory +
           "\nspeed(1)\n" + parsedNewCode;
  }

  window.Sk.pre = "output";
  window.Sk.configure({ output: outf, read: builtinRead });
  (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas';

  window.Sk.misceval.asyncToPromise(() =>
    window.Sk.importMainWithBody('<stdin>', false, prog, true)
  ).then(
    () => console.log('success'),
    (err) => setOutput((prev) => prev + err.toString())
  );
};



const runit2 = (code, forceReset = false) => {
  setOutput('');
  const parsedCode = parseSimpleCommands(code || pythonCode2); // Gunakan kode dari argumen atau state
  const imports = "from turtle import *\nreset()\nshape('turtle')\n";
  const prog = forceReset ? imports : imports + parsedCode;

  window.Sk.pre = "output2";
  window.Sk.configure({ output: outf, read: builtinRead });
  (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas-contoh';

  window.Sk.misceval.asyncToPromise(() =>
    window.Sk.importMainWithBody('<stdin>', false, prog, true)
  ).then(
    () => console.log('success'),
    (err) => setOutput((prev) => prev + err.toString())
  );
};



  const resetCode = () => {
    setPythonCode('');
    setOutput('');
    runit('', true);
};


  useEffect(() => {
    runit(); // Jalankan kode saat halaman dimuat
    runit2(); // Jalankan kode saat halaman dimuat
  }, []);

  //sidebar

  const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => {
      setCollapsed(!collapsed);
    };
  


  return (
    <div className="pt-3" style={{ fontFamily: 'Verdana, sans-serif',
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
          

        <Accordion defaultActiveKey="0" className='p-2'>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Pengenalan</Accordion.Header>
              <Accordion.Body>
                <div className="d-flex flex-column">
                  <button
                    className="btn text-start mb-2 btn-success"
                    onClick={() => navigate("/belajar/pendahuluan")}
                  >
                    Pengenalan
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/pendahuluan/kuis", progresBelajar >= 1)}
                    style={{ pointerEvents: progresBelajar < 1 ? "auto" : "auto", opacity: progresBelajar < 1 ? 0.5 : 1 }}
                  >
                    📋 Kuis: Pengenalan
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
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/turtlemotion/leftright", progresBelajar >= 2)}
                    style={{ pointerEvents: progresBelajar < 2 ? "auto" : "auto", opacity: progresBelajar < 2 ? 0.5 : 1 }}
                  >
                    Left & Right
                    {progresBelajar < 2 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/turtlemotion/forwardbackward", progresBelajar >= 3)}
                    style={{ pointerEvents: progresBelajar < 3 ? "auto" : "auto", opacity: progresBelajar < 3 ? 0.5 : 1 }}
                    
                  >
                    Forward & Backward
                    {progresBelajar < 3 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/turtlemotion/setposition", progresBelajar >= 4)}
                    style={{ pointerEvents: progresBelajar < 4 ? "auto" : "auto", opacity: progresBelajar < 4 ? 0.5 : 1 }}
                  >
                    Set Position
                    {progresBelajar < 4 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/turtlemotion/setxy", progresBelajar >= 5)}
                    style={{ pointerEvents: progresBelajar < 5 ? "auto" : "auto", opacity: progresBelajar < 5 ? 0.5 : 1 }}
                  >
                    Setx & sety
                    {progresBelajar < 5 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/turtlemotion/setheading", progresBelajar >= 6)}
                    style={{ pointerEvents: progresBelajar < 6 ? "auto" : "auto", opacity: progresBelajar < 6 ? 0.5 : 1 }}
                  >
                    Setheading
                    {progresBelajar < 6 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/turtlemotion/home", progresBelajar >= 7)}
                    style={{ pointerEvents: progresBelajar < 7 ? "auto" : "auto", opacity: progresBelajar < 7 ? 0.5 : 1 }}
                  >
                    Home
                    {progresBelajar < 7 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/turtlemotion/circle", progresBelajar >= 8)}
                    style={{ pointerEvents: progresBelajar < 8 ? "auto" : "auto", opacity: progresBelajar < 8 ? 0.5 : 1 }}
                  >
                    Circle
                    {progresBelajar < 8 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/turtlemotion/dot", progresBelajar >= 9)}
                    style={{ pointerEvents: progresBelajar < 9 ? "auto" : "auto", opacity: progresBelajar < 9 ? 0.5 : 1 }}
                  >
                    Dot
                    {progresBelajar < 9 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/turtlemotion/rangkuman", progresBelajar >= 9)}
                    style={{ pointerEvents: progresBelajar < 9 ? "auto" : "auto", opacity: progresBelajar < 9 ? 0.5 : 1 }}
                  >
                    Rangkuman
                    {progresBelajar < 10 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/turtlemotion/kuis", progresBelajar >= 10)}
                    style={{ pointerEvents: progresBelajar < 10 ? "auto" : "auto", opacity: progresBelajar < 10 ? 0.5 : 1 }}
                  >
                    📋 Kuis: Pergerakan
                    {progresBelajar < 10 && <span className="ms-2">🔒</span>}
                  </button>
                  

                </div>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
              <Accordion.Header>Tell State</Accordion.Header>
              <Accordion.Body>
                <div className="d-flex flex-column">
                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/tellstate/position", progresBelajar >= 11)}
                    style={{ pointerEvents: progresBelajar < 11 ? "auto" : "auto", opacity: progresBelajar < 11 ? 0.5 : 1 }}
                  >
                    Position
                    {progresBelajar < 11 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/tellstate/xcorycor", progresBelajar >= 12)}
                    style={{ pointerEvents: progresBelajar < 12 ? "auto" : "auto", opacity: progresBelajar < 12 ? 0.5 : 1 }}
                  >
                    Xcor & Ycor
                    {progresBelajar < 12 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/tellstate/heading", progresBelajar >= 13)}
                    style={{ pointerEvents: progresBelajar < 13 ? "auto" : "auto", opacity: progresBelajar < 13 ? 0.5 : 1 }}
                  >
                    Heading
                    {progresBelajar < 13 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/tellstate/distance", progresBelajar >= 14)}
                    style={{ pointerEvents: progresBelajar < 14 ? "auto" : "auto", opacity: progresBelajar < 14 ? 0.5 : 1 }}
                  >
                    Distance
                    {progresBelajar < 14 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/tellstate/rangkuman", progresBelajar >= 15)}
                    style={{ pointerEvents: progresBelajar < 15 ? "auto" : "auto", opacity: progresBelajar < 15 ? 0.5 : 1 }}
                  >
                    Rangkuman
                    {progresBelajar < 15 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/tellstate/kuis", progresBelajar >= 15)}
                    style={{ pointerEvents: progresBelajar < 1 ? "auto" : "auto", opacity: progresBelajar < 15 ? 0.5 : 1 }}
                  >
                    📋 Kuis: Mengetahui Status
                    {progresBelajar < 15 && <span className="ms-2">🔒</span>}
                  </button>
                </div>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="3">
              <Accordion.Header>Pen & Color Control</Accordion.Header>
              <Accordion.Body>
                <div className="d-flex flex-column">
                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/pencontrol/penuppendown", progresBelajar >= 16)}
                    style={{ pointerEvents: progresBelajar < 16 ? "auto" : "auto", opacity: progresBelajar < 16 ? 0.5 : 1 }}
                  >
                    Pendown & Penup
                    {progresBelajar < 16 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/pencontrol/pensize", progresBelajar >= 17)}
                    style={{ pointerEvents: progresBelajar < 17 ? "auto" : "auto", opacity: progresBelajar < 17 ? 0.5 : 1 }}
                  >
                    Pensize
                    {progresBelajar < 17 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/pencontrol/isdown", progresBelajar >= 18)}
                    style={{ pointerEvents: progresBelajar < 18 ? "auto" : "auto", opacity: progresBelajar < 18 ? 0.5 : 1 }}
                  >
                    Isdown
                    {progresBelajar < 18 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/colorcontrol/pencolor", progresBelajar >= 19)}
                    style={{ pointerEvents: progresBelajar < 19 ? "auto" : "auto", opacity: progresBelajar < 19 ? 0.5 : 1 }}
                  >
                    Pencolor
                    {progresBelajar < 19 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/colorcontrol/fillcolor", progresBelajar >= 20)}
                    style={{ pointerEvents: progresBelajar < 20 ? "auto" : "auto", opacity: progresBelajar < 20 ? 0.5 : 1 }}
                  >
                    Pengisian Warna (Fillcolor, Begin_fill, dan End_fill)
                    {progresBelajar < 20 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/pencolorcontrol/rangkuman", progresBelajar >= 21)}
                    style={{ pointerEvents: progresBelajar < 21 ? "auto" : "auto", opacity: progresBelajar < 21 ? 0.5 : 1 }}
                  >
                    Rangkuman
                    {progresBelajar < 21 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/pencolorcontrol/kuis", progresBelajar >= 21)}
                    style={{ pointerEvents: progresBelajar < 21 ? "auto" : "auto", opacity: progresBelajar < 21 ? 0.5 : 1 }}
                  >
                    📋 Kuis: Kontrol Pena dan Warna
                    {progresBelajar < 21 && <span className="ms-2">🔒</span>}
                  </button>
                </div>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="4">
              <Accordion.Header>More Drawing Control</Accordion.Header>
              <Accordion.Body>
                <div className="d-flex flex-column">
                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/moredrawingcontrol/reset", progresBelajar >= 22)}
                    style={{ pointerEvents: progresBelajar < 22 ? "auto" : "auto", opacity: progresBelajar < 22 ? 0.5 : 1 }}
                  >
                    Reset
                    {progresBelajar < 22 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/moredrawingcontrol/clear", progresBelajar >= 23)}
                    style={{ pointerEvents: progresBelajar < 23 ? "auto" : "auto", opacity: progresBelajar < 23 ? 0.5 : 1 }}
                  >
                    Clear
                    {progresBelajar < 23 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/moredrawingcontrol/write", progresBelajar >= 24)}
                    style={{ pointerEvents: progresBelajar < 24 ? "auto" : "auto", opacity: progresBelajar < 24 ? 0.5 : 1 }}
                  >
                    Write
                    {progresBelajar < 24 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/perulangan/forloop", progresBelajar >= 25)}
                    style={{ pointerEvents: progresBelajar < 25 ? "auto" : "auto", opacity: progresBelajar < 25 ? 0.5 : 1 }}
                  >
                    For Loops
                    {progresBelajar < 25 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/moredrawingcontrol/rangkuman", progresBelajar >= 26)}
                    style={{ pointerEvents: progresBelajar < 26 ? "auto" : "auto", opacity: progresBelajar < 26 ? 0.5 : 1 }}
                  >
                    Rangkuman
                    {progresBelajar < 26 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/moredrawingcontrol/kuis", progresBelajar >= 26)}
                    style={{ pointerEvents: progresBelajar < 26 ? "auto" : "auto", opacity: progresBelajar < 26 ? 0.5 : 1 }}
                  >
                    📋 Kuis: Kontrol Gambar Lanjutan
                    {progresBelajar < 26 && <span className="ms-2">🔒</span>}
                  </button>
                  
                </div>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="5">
              <Accordion.Header>Evaluasi</Accordion.Header>
              <Accordion.Body>
                <div className="d-flex flex-column">
                  <button
                    className="btn text-start mb-2 btn-outline-success d-flex justify-content-between align-items-center"
                    onClick={() => handleNavigate("/belajar/evaluasi", progresBelajar >= 27)}
                    style={{ pointerEvents: progresBelajar < 27 ? "auto" : "auto", opacity: progresBelajar < 27 ? 0.5 : 1 }}
                  >
                    Evaluasi
                    {progresBelajar < 27 && <span className="ms-2">🔒</span>}
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
            <h1
              style={{
                textAlign: 'center',
                backgroundColor: '#198754',
                color: 'white',
                padding: '10px 20px',
                // borderRadius: '10px',
                // boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                fontWeight: 'bold',
                fontSize: '28px',
                letterSpacing: '1px',
                borderLeft: '10px solid orange' // Border kiri dengan warna oranye
              }}
            >
              Pengenalan
            </h1>

            <hr></hr>
            <br></br>

            <h4
              style={{
                color: 'black',
                fontSize: '22px',
                fontWeight: 'bold',
                borderLeft: '5px solid #198754',
                paddingLeft: '10px',
                marginBottom: '10px',
              }}
            >
              Tujuan Pembelajaran
            </h4>
            <ol
              style={{
                backgroundColor: '#F9F9F9',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                listStylePosition: 'inside',
              }}
            >
              <li style={{ marginBottom: '8px' }}>
                Memahami konsep canvas sebagai ruang pergerakan Bidawang.
              </li>
              <li>
                Mengenali tampilan lingkungan kerja untuk menggerakan Bidawang.
              </li>
            </ol>


            <hr></hr>

            {/* Video Section */}
            <div
              style={{
                textAlign: 'center',
                marginTop: '20px',
                padding: '20px',
                backgroundColor: '#F9F9F9',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                maxWidth: '1080px',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
            >
              <h5
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: 'black',
                  marginBottom: '15px',
                }}
              >
                Perhatikan Video Ilustrasi di bawah ini:
              </h5>
              <iframe
                width="100%"
                height="500"
                // src="https://www.youtube.com/embed/iefPvNd_diM?si=_Ou4N5Xe9TA-cezk"
                src="https://drive.google.com/file/d/1Mg1EjePyRlk7wKbm_Bobg11vWc5Te9_R/preview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{
                  borderRadius: '10px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                }}
              ></iframe>
            </div>


            <hr></hr>

            <p>Canvas adalah area tempat Bidawang bergerak menggambar pola geometri secara interaktif. Bidawang tersebut dapat dikontrol untuk bergerak maju (forward), mundur (backward), berbelok ke kiri (left), berbelok ke kanan (right), dan melakukan berbagai aksi lainnya menggunakan perintah-perintah tertentu. Untuk pembelajaran ini, canvas diatur dengan ukuran 400x400 piksel. Berikut adalah contoh gambaran canvas dan contoh Bidwang bergerak dalam canvas:</p>
            
            <div>
              <Row>
                {/* Kolom kiri: Canvas dan gambar */}
                <Col md={6} xs={12}>
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '500px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {/* Gambar canvas sebagai latar */}
                    <Image
                      src={canvas}
                      alt="Canvas"
                      width="470px"
                      height="470px"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1,
                        opacity: 0.4,
                      }}
                    />

                    {/* Canvas untuk Turtle */}
                    <div
                      id="mycanvas-contoh"
                      style={{
                        width: '400px',
                        height: '400px',
                        position: 'relative',
                        zIndex: 2,
                        marginTop: 10,
                      }}
                    ></div>
                  </div>

                  <p style={{ textAlign: 'center', marginTop: 10 }}>
                    (Bidawang bergerak di atas gambar canvas)
                  </p>
                </Col>

                {/* Kolom kanan: Penjelasan */}
                <Col md={6} xs={12}>
                  <div style={{ padding: '10px', marginTop:30 }}>
                    <h5
                      style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        marginBottom: '8px',
                      }}
                    >
                      🔎 Penjelasan:
                    </h5>
                    <ul>
                      <li>Titik awal posisi Bidawang adalah (0, 0), yang berada di tengah canvas.</li>
                      <li>Batas pergerakan ke atas (sumbu Y positif) adalah 200, yang merupakan batas atas canvas.</li>
                      <li>Batas pergerakan ke bawah (sumbu Y negatif) adalah -200, yang merupakan batas bawah canvas.</li>
                      <li>Batas pergerakan ke kanan (sumbu X positif) adalah 200.</li>
                      <li>Batas pergerakan ke kiri (sumbu X negatif) adalah -200.</li>
                    </ul>
                  </div>
                </Col>
              </Row>
            </div>


            {/* <br></br> */}
            <hr></hr>
            <br></br>

            {/* Tampilan Lingkungan Kerja */}
            <div
              style={{
                margin: 'auto',
              }}
            >
              <h4
                style={{
                  color: 'black',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  borderLeft: '5px solid #198754',
                  paddingLeft: '10px',
                  marginBottom: '10px',
                }}
              >
                🖥️ Tampilan Lingkungan Kerja
              </h4>
              <p style={{ fontSize: '16px', color: '#444', lineHeight: '1.6' }}>
                Untuk mempermudah mengontrol <b>Bidawang</b>, tersedia lingkungan kerja yang terdiri dari beberapa komponen seperti gambar di bawah ini:
              </p>

              {/* Gambar Lingkungan Kerja */}
              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <Image
                  src={lingkungankerja}
                  alt="Tampilan Lingkungan Kerja"
                  width="75%"
                  style={{
                    borderRadius: '10px',
                    // boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </div>

              {/* Penjelasan */}
              <h5
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: 'black',
                  marginBottom: '8px',
                }}
              >
                🔎 Penjelasan:
              </h5>
              <ul
                style={{
                  // backgroundColor: '#fff',
                  padding: '15px',
                  // borderRadius: '8px',
                  // boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  // listStyleType: 'none',
                  lineHeight: '1.6',
                }}
              >
                {[
                  { label: '(A) Text Editor', desc: 'Area tempat pengguna mengetik perintah kode untuk menggerakkan Bidawang.' },
                  { label: '(B) Canvas', desc: 'Area tampilan di mana pergerakan Bidawang divisualisasikan. Semua perintah yang dijalankan akan langsung terlihat pada canvas.' },
                  { label: '(C) Bidawang', desc: 'Objek yang digerakkan menggunakan perintah kode.' },
                  { label: '(D) Tombol "Run Code"', desc: 'Digunakan untuk menjalankan kode yang telah ditulis di text editor. Setelah ditekan, Bidawang akan menjalankan perintah dan menggambar sesuai instruksi.' },
                  { label: '(E) Tombol "Reset"', desc: 'Menghapus kode serta hasil gambar di canvas dan mengembalikan Bidawang ke posisi awal.' },
                  { label: '(F) Tombol "Buka File"', desc: 'Digunakan untuk membuka dan memuat file kode dari perangkat pengguna ke dalam text editor.' },
                  { label: '(G) Tombol "Simpan File"', desc: 'Digunakan untuk menyimpan kode yang telah ditulis di text editor ke dalam file di perangkat pengguna.' },
                  { label: '(H) Output Log', desc: 'Digunakan untuk menampilkan output dari program yang dijalankan atau pesan error.' },
                ].map((item, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>
                    <b style={{ color: 'black' }}>{item.label}</b>: {item.desc}
                  </li>
                ))}
              </ul>
            </div>
            
            

            {/* Contoh Menggerakkan Bidawang dalam Canvas */}
            {/* <div
              style={{
                backgroundColor: '#F9F9F9',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                // maxWidth: '1000px',
                margin: 'auto',
              }}
            >
              <h4
                style={{
                  // color: '#198754',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  borderLeft: '5px solid #198754',
                  paddingLeft: '10px',
                  marginBottom: '15px',
                }}
              >
                🐢 Aktivitas 1: Menggerakkan Bidawang di Dalam Canvas
              </h4>
              <p style={{ color: '#444', lineHeight: '1.6' }}>
                Kita bisa menggerakkan <b>Bidawang</b> dengan berbagai perintah. Berikut adalah contoh perintah dasar untuk membuat
                Bidawang dapat bergerak dan berputar. Agar lebih mudah untuk memahaminya, coba ikuti instruksi di bawah ini dengan
                mengetikkan perintah tersebut, lalu tekan tombol <b>"Run Code"</b> untuk melihat pergerakan Bidawang. Lakukan
                secara bertahap:
              </p>

              <Row>
                
                <Col xs={3} style={{ fontSize: '15px' }}>
                  <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key)}>
                  {[
                    { step: '1a', title: 'Maju', code: 'forward 100', description: 'Gerakkan Bidawang maju sejauh 100 langkah.' },
                    { step: '1b', title: 'Berbelok ke kanan', code: 'right 90', description: 'Putar Bidawang ke kanan sebesar 90 derajat.' },
                    { step: '1c', title: 'Maju', code: 'forward 100', description: 'Gerakkan Bidawang maju sejauh 100 langkah.' },
                    { step: '1d', title: 'Berbelok ke kiri', code: 'left 45', description: 'Putar Bidawang ke kiri sebesar 45 derajat.' },
                    { step: '1e', title: 'Maju', code: 'forward 50 ', description: 'Gerakkan Bidawang maju sejauh 50 langkah.' },
                  ].map((step, index) => {
                    const isDisabled = index > 0 && !completedSteps.includes(`1${String.fromCharCode(96 + index)}`); // contoh: 1b, 1c
                    const isActive = activeKey === step.step;

                    return (
                      <AccordionItem
                        eventKey={step.step}
                        key={index}
                        style={{ opacity: isDisabled ? 0.5 : 1, pointerEvents: isDisabled ? 'none' : 'auto' }}
                      >
                        <AccordionHeader>
                          <b>{step.title}</b>
                          {completedSteps.includes(step.step) && (
                            <BsCheckCircle style={{ color: 'green', marginLeft: 10 }} />
                          )}
                        </AccordionHeader>
                        <AccordionBody>
                          <p>{step.description}</p>
                          <pre style={{ userSelect: 'none', pointerEvents: 'none' }}>
                            <code draggable={false}>{step.code}</code>
                          </pre>

                        </AccordionBody>
                      </AccordionItem>
                    );
                  })}

                  </Accordion>
                </Col>

                
                <Col xs={9}>
                  <div className="skulpt-container" style={{ border: '2px solid #ccc', borderRadius: '8px', padding: '15px' }}>
                    <div className="editor-section">
                      <CodeMirror
                        value={pythonCode}
                        placeholder={'//Ketikan kode disini!'}
                        height="150px"
                        theme="light"
                        extensions={[
                          // python(),
                          closeBrackets({ brackets: '' }) // <-- ini matikan auto-close kurung
                        ]}
                        onChange={(value) => setPythonCode(value)}
                        onKeyDown={handleKeyDown}
                      />
                      <div
                        style={{
                          marginTop: '5px',
                          marginBottom: '5px',
                          display: 'flex',
                          gap: '10px',
                          // justifyContent: 'center',
                        }}
                      >
                        <Button
                          variant="success"
                          disabled={!pythonCode.trim()}
                          onClick={runAndCheck}
                        >
                          Run Code
                        </Button>

                        <Button
                          variant="warning"
                          disabled={commandHistory.length === 0}
                          onClick={undoLastCommand}
                        >
                          Undo
                        </Button>




                        <Button variant="secondary" onClick={resetCode}>
                          <BsArrowClockwise /> Reset
                        </Button>

                        
                      </div>
                      <pre
                        style={{
                          height: '150px',
                          overflowY: 'auto',
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          padding: '10px',
                          fontFamily: 'monospace',
                          fontSize: '14px',
                          marginTop: '10px'
                        }}
                      > <b>History Commands:</b><br/>
                        {commandHistory.map((cmd, idx) => `> ${cmd}\n`)}
                      </pre>

                      <pre className="output" style={{ height: 60, width: 330, overflow: 'auto' }}>{output}</pre>
                    </div>
                    <div className="canvas-section">
                      <div id="mycanvas"></div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div> */}


            
            <br/>
              <hr/> 

              <Accordion className="mb-4" style={{ outline: "3px solid #198754", borderRadius: "10px" }}>
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          <h4 style={{ color: "#198754", fontWeight: "bold" }}>Pertanyaan</h4>
        </Accordion.Header>
        <Accordion.Body>
        <Form>
        {/* SOAL 1 */}
        {currentQuestion === 1 && (
          <Form.Group controlId="question1">
            <Form.Label className="p-3 mb-3" style={{ backgroundColor: "#f8f9fa", fontSize: "18px", borderRadius: "5px", width: '100%' }}>
              <strong style={{ color: 'black' }}>Soal 1 dari 2:</strong>
              <p>Jika posisi Bidawang berada di titik <b>(0, 0)</b> pada canvas, bagaimana gambar posisi Bidawang pada canvas?</p>
            </Form.Label>

            <Row>
              {[
                { key: 'option1a', img: option1a },
                { key: 'option1b', img: option1b },
                { key: 'option1c', img: option1c },
                { key: 'option1d', img: option1d },
              ].map(({ key, img }) => (
                <Col xs={6} md={3} key={key} className="mb-3 text-center">
                  <Image
                    src={img}
                    alt={key}
                    onClick={() => handleAnswerChange("question1", key)}
                    thumbnail
                    style={{
                      cursor: "pointer",
                      border: selectedAnswer === key ? "4px solid #198754" : "2px solid #ccc",
                      borderRadius: "10px",
                    }}
                  />
                </Col>
              ))}
            </Row>

            {feedback.question1 && (
              <Alert variant={feedback.question1 === "Benar! Gambar tersebut menunjukkan Bidawang di posisi (0, 0), yaitu di tengah canvas." ? "success" : "danger"} className="mt-3">
                {feedback.question1}
              </Alert>
            )}
          </Form.Group>
        )}

        {/* SOAL 2 */}
        {currentQuestion === 2 && (
          <Form.Group controlId="question2">
            <Form.Label className="p-3 mb-3" style={{ backgroundColor: "#f8f9fa", fontSize: "18px", borderRadius: "5px", width: '100%' }}>
              <strong style={{ color: 'black' }}>Soal 2 dari 2:</strong>
              <p>Tombol mana yang digunakan untuk menghapus kode serta hasil gambar di canvas dan mengembalikan Bidawang ke posisi awal?</p>
            </Form.Label>

            <Row>
              {[
                { key: 'option2a', img: option2a },
                { key: 'option2b', img: option2b },
                { key: 'option2c', img: option2c },
                { key: 'option2d', img: option2d },
              ].map(({ key, img }) => (
                <Col xs={6} md={3} key={key} className="mb-3 text-center">
                  <Image
                    src={img}
                    alt={key}
                    onClick={() => handleAnswerChange("question2", key)}
                    thumbnail
                    style={{
                      cursor: "pointer",
                      border: selectedAnswer2 === key ? "4px solid #198754" : "2px solid #ccc",
                      borderRadius: "10px",
                    }}
                  />
                </Col>
              ))}
            </Row>

            {feedback.question2 && (
              <Alert variant={feedback.question2 === "Benar! Tombol tersebut digunakan untuk menghapus semua gambar dan mengembalikan Bidawang ke posisi awal." ? "success" : "danger"} className="mt-3">
                {feedback.question2}
              </Alert>
            )}
          </Form.Group>
        )}

        {/* TOMBOL NAVIGASI */}
        <div className="text-center mt-4 d-flex justify-content-between">
          <Button
            variant="secondary"
            onClick={() => setCurrentQuestion((prev) => Math.max(1, prev - 1))}
            disabled={currentQuestion === 1}
          >
            Sebelumnya
          </Button>

          <Button
            variant="primary"
            onClick={handleSubmit}
          >
            Periksa Jawaban
          </Button>

          <Button
            variant="secondary"
            onClick={() => setCurrentQuestion((prev) => Math.min(2, prev + 1))}
            disabled={
              (currentQuestion === 1 && feedback.question1 !== "Benar! Gambar tersebut menunjukkan Bidawang di posisi (0, 0), yaitu di tengah canvas.") ||
              (currentQuestion === 2)
            }
          >
            Selanjutnya
          </Button>
        </div>
      </Form>


        </Accordion.Body>
      </Accordion.Item>
    </Accordion>


     
          </div>
        </div>
        

    </div>
    
  );
};

export default Pendahuluan;
