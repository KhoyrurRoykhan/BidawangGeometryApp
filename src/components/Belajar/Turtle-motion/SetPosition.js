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
import { FaBars } from "react-icons/fa";

// Challange
import swal from 'sweetalert'; // Import SweetAlert
import papuyu from './assets/papuyu-1.png';
import broccoli from './assets/cacingtarget.png';
import targetA from './assets/cacing-target-1.png';
import targetB from './assets/cacing-target-2.png';
import targetC from './assets/cacing-target-3.png';
import targetD from './assets/cacing-target-4.png';
import map from './assets/3-setposition-b.png';
import tilemap from './assets/3-setposition-tilemap.png';
import maptitik from './assets/3-setposition-a-titik.png';

import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../assets/tutor-copy.css";
import Swal from "sweetalert2";

const correctCommands = {
  '1a': 'setposition(100,100)',
  '1b': 'setposition(0,100)'
};

const SetPosition = () => {
  //token
  const [activeButton, setActiveButton] = useState("intro-1");
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

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
  const [progresBelajar, setProgresBelajar] = useState(27);
  const [progresTantangan, setProgresTantangan] = useState(0);
  
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

  useEffect(() => {
    const fetchProgresTantangan = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/user/progres-tantangan`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProgresTantangan(response.data.progres_tantangan);
      } catch (error) {
        console.error("Gagal mengambil progres tantangan:", error);
      }
    };
  
    if (token) {
      fetchProgresTantangan();
    }
  }, [token]);

  // Tentukan accordion aktif berdasarkan URL
  const activeAccordionKey = location.pathname.includes("/belajar/turtlemotion") || location.pathname.includes("/belajar/turtlemotion/setposition")
    ? "1"
    : "0";

  // Class untuk tombol aktif
  const getButtonClass = (path) =>
    location.pathname === path ? "btn text-start mb-2 btn-success" : "btn text-start mb-2 btn-outline-success";

  // hint
  const showHint = () => {
    swal({
      title: "Petunjuk Tantangan",
      content: {
        element: "div",
        attributes: {
          innerHTML: `
            <p>Bidawang saat ini berada di tengah layar (titik <b>(0, 0)</b>).</p>
            <p>Tugas kamu adalah memindahkan Bidawang ke titik-titik yang sudah <b>ditandai</b> di sepanjang sungai pada canvas.</p>
            <p>Pindahkan Bidawang secara <b>berurutan</b> mengikuti alur sungai dengan menggunakan perintah <b>setposition</b> untuk setiap titik.</p>
          `
        }
      },
      icon: "info"
    });
  };
  
  //accordion task
  const [completedSteps, setCompletedSteps] = useState([]);
  const [activeKey, setActiveKey] = useState('1a');

  const normalizeLine = (line) => {
    return line
      .toLowerCase()               // bikin semua huruf kecil biar gak sensi kapital
      .replace(/['"]/g, '"')       // samain semua kutip jadi "
      .replace(/\s+/g, ' ')        // spasi berlebih jadi satu spasi
      .replace(/\s*\(\s*/g, '(')   // hapus spasi sekitar kurung buka
      .replace(/\s*\)\s*/g, ')')   // hapus spasi sekitar kurung tutup
      .replace(/\s*,\s*/g, ',')    // hapus spasi sekitar koma
      .replace(/\s*:\s*/g, ':')    // hapus spasi sekitar titik dua
      .trim();
  };
  
  const checkCode = () => {
    const parsedCode = parseSimpleCommands(pythonCode); // 🔧 Gunakan hasil parser
    const cleanedCode = parsedCode
      .split('\n')
      .map(line => normalizeLine(line))
      .filter(line => line.length > 0);
  
    let newCompletedSteps = [];
  
    for (const key of Object.keys(correctCommands)) {
      const expected = correctCommands[key]
        .split('\n')
        .map(line => normalizeLine(line));
  
      const codeSlice = cleanedCode.slice(0, expected.length);
  
      const isMatch = expected.every((expectedLine, idx) => {
        const userLine = codeSlice[idx] || '';
        return userLine.includes(expectedLine);
      });
  
      if (isMatch) {
        newCompletedSteps.push(key);
        cleanedCode.splice(0, expected.length);
      } else {
        break;
      }
    }
  
    setCompletedSteps(newCompletedSteps);
  
    if (newCompletedSteps.length < Object.keys(correctCommands).length) {
      setActiveKey(Object.keys(correctCommands)[newCompletedSteps.length]);
    } else {
      setActiveKey(null);
      Swal.fire({
        icon: 'success',
        title: 'Selamat!',
        text: 'Anda telah menyelesaikan seluruh aktivitas ini!',
      });
    }
  };

  //kuis
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [feedback, setFeedback] = useState({});

  const correctAnswers = {
    question1: "Memindahkan bidawang ke koordinat tertentu dalam ruang gambar.",
    question2: "(50, 100)"
  };

  const handleAnswerChange = (question, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [question]: answer
    }));
  };

  const handleSubmit = async () => {
    const newFeedback = {};
    let allCorrect = true;
  
    // Cek semua jawaban
    for (const [question, correctAnswer] of Object.entries(correctAnswers)) {
      const selected = selectedAnswers[question];
      const isCorrect = selected === correctAnswer;
  
      newFeedback[question] = isCorrect ? 'Benar!' : 'Salah!';
      if (!isCorrect) allCorrect = false;
    }
  
    setFeedback(newFeedback);
  
    // Jika semua benar dan progres saat ini adalah 4
    if (allCorrect && progresBelajar === 4) {
      try {
        await axios.put(
          `${process.env.REACT_APP_API_ENDPOINT}/api/user/progres-belajar`,
          { progres_belajar: progresBelajar + 1 },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setProgresBelajar(prev => prev + 1);
        Swal.fire({
          icon: 'success',
          title: 'Jawaban Benar!',
          text: 'Materi selanjutnya sudah terbuka 😊',
          confirmButtonColor: '#198754'
        });
      } catch (error) {
        console.error("Gagal update progres:", error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal Update Progres',
          text: 'Terjadi kesalahan saat memperbarui progres kamu.',
          confirmButtonColor: '#d33'
        });
      }
    } else if (allCorrect) {
      Swal.fire({
        icon: 'info',
        title: 'Sudah Diselesaikan',
        text: 'Kamu sudah menyelesaikan materi ini sebelumnya.',
        confirmButtonColor: '#198754'
      });
    }
  };


  const [pythonCode, setPythonCode] = useState(``);
  const [pythonCode1, setPythonCode1] = useState(`

for i in range(100):
  speed(1)
  setposition(100,100)
  speed(0)
  home()
  reset()

`);

  const [pythonCodeChallanges, setPythonCodeChallanges] = useState(``);
  const [currentStep, setCurrentStep] = useState(0); // Track the current step
  const [output, setOutput] = useState('');
  const pythonCodeRef = useRef('');


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

  const runit = (code, forceReset = false) => {
    setOutput('');
    const parsedCode = parseSimpleCommands(code || pythonCode); // Gunakan kode hasil parse
    const imports = "from turtle import *\nreset()\nshape('turtle')\nspeed(1)\n";
    const prog = forceReset ? imports : imports + parsedCode;

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

  const runit1 = (code, forceReset = false) => {
    setOutput('');
    const parsedCode = parseSimpleCommands(code || pythonCode1); // Gunakan kode hasil parse
    const imports = "from turtle import *\nreset()\nshape('turtle')\n";
    const prog = forceReset ? imports : imports + parsedCode;
  
    window.Sk.pre = "output1";
    window.Sk.configure({ output: outf, read: builtinRead });
    (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas-contoh1';
  
    window.Sk.misceval.asyncToPromise(() => 
        window.Sk.importMainWithBody('<stdin>', false, prog, true)
    ).then(
        () => console.log('success'),
        (err) => setOutput((prev) => prev + err.toString())
    );
  };


  const runitchallanges = (code, forceReset = false, skipCheck = false) => {
    setOutput('');
    const imports = "from turtle import *\nreset()\nshape('turtle')\nspeed(0)\npenup()\nsetposition(-100,-100)\nspeed(2)\npendown()\n";
  
    const parsedCode = parseSimpleCommands(code || pythonCodeChallanges);
    const prog = forceReset ? imports : imports + parsedCode;
  
    window.Sk.pre = "output4";
    window.Sk.configure({ output: outf, read: builtinRead });
    (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas-challanges';
  
    window.Sk.misceval.asyncToPromise(() =>
      window.Sk.importMainWithBody('<stdin>', false, prog, true)
    ).then(
      () => {
        console.log('success');
        if (!skipCheck) {
          checkCodeChallanges(parsedCode); // Kirim parsedCode ke fungsi validasi
        }
      },
      (err) => setOutput((prev) => prev + err.toString())
    );
  };
  

  const [hasRun, setHasRun] = useState(false);

  const checkCodeChallanges = (parsedCode) => {
    const validCode = [
      "setposition(100,-100)",
      "setposition(100,0)",
      "setposition(0,100)",
      "setposition(-100,0)",
      "setposition(-100,-100)",
    ];
  
    const userCodeLines = parsedCode
      .trim()
      .split("\n")
      .map(line => line.trim())
      .filter(line => line !== "");
  
    for (let i = 0; i < userCodeLines.length; i++) {
      const line = userCodeLines[i].replace(/\s+/g, ''); // Hapus semua spasi
      const valid = validCode[i].replace(/\s+/g, '');     // Hapus semua spasi juga
  
      if (!line.startsWith("setposition")) {
        return swal("Salah", "Anda harus menggunakan setposition", "error").then(() => {
          pythonCodeRef.current = '';
          resetCodeChallanges();
        });
      }
  
      if (line !== valid) {
        return swal("Salah", "Posisi x y yang anda masukan tidak tepat", "error").then(() => {
          pythonCodeRef.current = '';
          resetCodeChallanges();
        });
      }
    }
  
    if (userCodeLines.length === validCode.length) {
      swal("Benar!", "Kamu berhasil menyelesaikan tantangan!", "success").then(async () => {
        try {
          if (progresTantangan === 2) {
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
          console.error("Gagal update progres tantangan halaman 3:", error);
          Swal.fire({
            icon: 'error',
            title: 'Gagal Update Progres Tantangan',
            text: 'Terjadi kesalahan saat memperbarui progres tantangan halaman ketiga.',
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


  const resetCode = () => {
    setPythonCode('');
    setOutput('');
    runit('', true);
};

const resetCodeChallanges = () => {
  setPythonCodeChallanges('');
  pythonCodeRef.current = '';
  setCurrentStep(0);
  setOutput('');
  setHasRun(false);
  runitchallanges('', true, true); // <- kirim skipCheck = true
};


  useEffect(() => {
    runit();
    runit1(); // Jalankan kode saat halaman dimuat
    initializeTurtle(); // Jalankan kode saat halaman dimuat
  }, []);

  const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => {
      setCollapsed(!collapsed);
    };

  return (
    <div className="pt-3 mt-5" style={{ fontFamily: 'Verdana, sans-serif',
      display: "flex",
      height: "100vh",
      flexDirection: "row",
      overflow: "hidden", // agar tidak scroll di container utama
      position: "fixed",
      width:'100%'
    }}>
      
      <div
        style={{
          width: collapsed ? "60px" : "250px",
          transition: "width 0.3s",
          backgroundColor: "#f0f0f0",
          height: "100vh",
          position: "sticky", // atau fixed jika mau benar-benar di luar alur scroll
          top: 0,
          zIndex: 10,
          flexShrink: 0, // penting agar tidak ikut menyusut
          overflow: 'auto',
          paddingBottom:60
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
                    style={{ pointerEvents: progresBelajar < 2 ? "auto" : "auto", opacity: progresBelajar < 2 ? 0.5 : 1 }}
                  >
                    <span>Left & Right</span>
                    {progresBelajar < 2 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/forwardbackward")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/forwardbackward", progresBelajar >= 3)}
                    style={{ pointerEvents: progresBelajar < 3 ? "auto" : "auto", opacity: progresBelajar < 3 ? 0.5 : 1 }}
                  >
                    Forward & Backward
                    {progresBelajar < 3 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/setposition")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/setposition", progresBelajar >= 4)}
                    style={{ pointerEvents: progresBelajar < 4 ? "auto" : "auto", opacity: progresBelajar < 4 ? 0.5 : 1 }}
                  >
                    Set Position
                    {progresBelajar < 4 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/setxy")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/setxy", progresBelajar >= 5)}
                    style={{ pointerEvents: progresBelajar < 5 ? "auto" : "auto", opacity: progresBelajar < 5 ? 0.5 : 1 }}
                  >
                    Setx & sety
                    {progresBelajar < 5 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/setheading")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/setheading", progresBelajar >= 6)}
                    style={{ pointerEvents: progresBelajar < 6 ? "auto" : "auto", opacity: progresBelajar < 6 ? 0.5 : 1 }}
                  >
                    Setheading
                    {progresBelajar < 6 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/home")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/home", progresBelajar >= 7)}
                    style={{ pointerEvents: progresBelajar < 7 ? "auto" : "auto", opacity: progresBelajar < 7 ? 0.5 : 1 }}
                  >
                    Home
                    {progresBelajar < 7 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/circle")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/circle", progresBelajar >= 8)}
                    style={{ pointerEvents: progresBelajar < 8 ? "auto" : "auto", opacity: progresBelajar < 8 ? 0.5 : 1 }}
                  >
                    Circle
                    {progresBelajar < 8 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/dot")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/turtlemotion/dot", progresBelajar >= 9)}
                    style={{ pointerEvents: progresBelajar < 9 ? "auto" : "auto", opacity: progresBelajar < 9 ? 0.5 : 1 }}
                  >
                    Dot
                    {progresBelajar < 9 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/turtlemotion/kuis")} d-flex justify-content-between align-items-center w-100`}
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
                    className={`${getButtonClass("/belajar/tellstate/position")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/tellstate/position", progresBelajar >= 11)}
                    style={{ pointerEvents: progresBelajar < 11 ? "auto" : "auto", opacity: progresBelajar < 11 ? 0.5 : 1 }}
                  >
                    Position
                    {progresBelajar < 11 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/tellstate/xcorycor")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/tellstate/xcorycor", progresBelajar >= 12)}
                    style={{ pointerEvents: progresBelajar < 12 ? "auto" : "auto", opacity: progresBelajar < 12 ? 0.5 : 1 }}
                  >
                    Xcor & Ycor
                    {progresBelajar < 12 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/tellstate/heading")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/tellstate/heading", progresBelajar >= 13)}
                    style={{ pointerEvents: progresBelajar < 13 ? "auto" : "auto", opacity: progresBelajar < 13 ? 0.5 : 1 }}
                  >
                    Heading
                    {progresBelajar < 13 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/tellstate/distance")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/tellstate/distance", progresBelajar >= 14)}
                    style={{ pointerEvents: progresBelajar < 14 ? "auto" : "auto", opacity: progresBelajar < 14 ? 0.5 : 1 }}
                  >
                    Distance
                    {progresBelajar < 14 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/tellstate/kuis")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/tellstate/kuis", progresBelajar >= 15)}
                    style={{ pointerEvents: progresBelajar < 15 ? "auto" : "auto", opacity: progresBelajar < 15 ? 0.5 : 1 }}
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
                    className={`${getButtonClass("/belajar/pencontrol/penuppendown")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/pencontrol/penuppendown", progresBelajar >= 16)}
                    style={{ pointerEvents: progresBelajar < 16 ? "auto" : "auto", opacity: progresBelajar < 16 ? 0.5 : 1 }}
                  >
                    Pendown & Penup
                    {progresBelajar < 16 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/pencontrol/pensize")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/pencontrol/pensize", progresBelajar >= 17)}
                    style={{ pointerEvents: progresBelajar < 17 ? "auto" : "auto", opacity: progresBelajar < 17 ? 0.5 : 1 }}
                  >
                    Pensize
                    {progresBelajar < 17 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/pencontrol/isdown")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/pencontrol/isdown", progresBelajar >= 18)}
                    style={{ pointerEvents: progresBelajar < 18 ? "auto" : "auto", opacity: progresBelajar < 18 ? 0.5 : 1 }}
                  >
                    Isdown
                    {progresBelajar < 18 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/colorcontrol/pencolor")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/colorcontrol/pencolor", progresBelajar >= 19)}
                    style={{ pointerEvents: progresBelajar < 19 ? "auto" : "auto", opacity: progresBelajar < 19 ? 0.5 : 1 }}
                  >
                    Pencolor
                    {progresBelajar < 19 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/colorcontrol/fillcolor")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/colorcontrol/fillcolor", progresBelajar >= 20)}
                    style={{ pointerEvents: progresBelajar < 20 ? "auto" : "auto", opacity: progresBelajar < 20 ? 0.5 : 1 }}
                  >
                    Pengisian Warna (Fillcolor, Begin_fill, dan End_fill)
                    {progresBelajar < 20 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/pencolorcontrol/kuis")} d-flex justify-content-between align-items-center w-100`}
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
                    className={`${getButtonClass("/belajar/moredrawingcontrol/reset")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/moredrawingcontrol/reset", progresBelajar >= 22)}
                    style={{ pointerEvents: progresBelajar < 22 ? "auto" : "auto", opacity: progresBelajar < 22 ? 0.5 : 1 }}
                  >
                    Reset
                    {progresBelajar < 22 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/moredrawingcontrol/clear")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/moredrawingcontrol/clear", progresBelajar >= 23)}
                    style={{ pointerEvents: progresBelajar < 23 ? "auto" : "auto", opacity: progresBelajar < 23 ? 0.5 : 1 }}
                  >
                    Clear
                    {progresBelajar < 23 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/moredrawingcontrol/write")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/moredrawingcontrol/write", progresBelajar >= 24)}
                    style={{ pointerEvents: progresBelajar < 24 ? "auto" : "auto", opacity: progresBelajar < 24 ? 0.5 : 1 }}
                  >
                    Write
                    {progresBelajar < 24 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/perulangan/forloop")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/perulangan/forloop", progresBelajar >= 25)}
                    style={{ pointerEvents: progresBelajar < 25 ? "auto" : "auto", opacity: progresBelajar < 25 ? 0.5 : 1 }}
                  >
                    For Loops
                    {progresBelajar < 25 && <span className="ms-2">🔒</span>}
                  </button>

                  <button
                    className={`${getButtonClass("/belajar/moredrawingcontrol/kuis")} d-flex justify-content-between align-items-center w-100`}
                    onClick={() => handleNavigate("/belajar/moredrawingcontrol/kuis", progresBelajar >= 26)}
                    style={{ pointerEvents: progresBelajar < 26 ? "auto" : "auto", opacity: progresBelajar < 26 ? 0.5 : 1 }}
                  >
                    📋 Kuis: Kontrol Pena dan Warna
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
                    className={`${getButtonClass("/belajar/evaluasi")} d-flex justify-content-between align-items-center w-100`}
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

        
        <div className='p-4 content' style={{
              flexGrow: 1,
              overflowY: "auto",
              height: "100vh"

            }}>
          <div style={{paddingLeft:50, paddingRight:50, paddingBottom:50}}>
            <h2 
            style={{
              textAlign: 'center',
              backgroundColor: '#198754',
              color: 'white',
              padding: '10px 20px',
              // borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              fontWeight: 'bold',
              fontSize: '24px',
              letterSpacing: '1px',
              borderLeft: '10px solid orange' // Border kiri dengan warna oranye
            }}
            >
              Setposition
            </h2>
            <hr></hr>
            <br/>

            <h4
              style={{
                // color: '#2DAA9E',
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
                Memahami cara mengatur posisi Bidawang secara langsung menggunakan `setposition`.
              </li>
            </ol>

            <hr/>

            <p>
            Perintah `setposition` (bisa juga disingkat `setpos`) digunakan untuk memindahkan Bidawang ke titik tertentu dalam ruang canvas, berdasarkan koordinat yang ditentukan. Saat perintah ini digunakan, Bidawang akan menggambar jalur dari posisi sebelumnya ke posisi baru.
            </p>

            <h5>Contoh:</h5>
            <p>Memindahkan Bidawang ke koordinat <code>(<i>x</i> = 100, <i>y</i> = 100)</code> dalam ruang canvas.</p>
            <Row className="align-items-center">
              <Col md={6}>
                <CodeMirror
                  value={`# Pindahkan Bidawang ke koordinat (100, 100)
setposition 100 100`}
                  height="400px"
                  theme="light"
                  extensions={[python()]}
                  editable={false}
                  options={{ readOnly: 'nocursor' }}
                />
              </Col>
              <Col md={6} className="text-center">
                <div className="canvas-section" style={{width:400,height:400,  textAlign:'center'}}>
                  <div style={{textAlign:'center'}} id="mycanvas-contoh1"></div>
                </div>
              </Col>
            </Row>
            <br></br>
            <p><b>Hasil:</b> Bidawang akan bergerak ke posisi x=100 dan y=100.</p>
            
            <br></br>
            <hr />
            
            <div
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
                Latihan Menggunakan setposition 🐢
              </h4>
              <p>
              Untuk lebih mudah memahami cara kerja perintah <code>setposition</code>, ikuti instruksi dibawah ini
              </p>
              <Row>
                <Col xs={3} style={{ fontSize: 15 }}>
                  <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key)}>
                    <AccordionItem eventKey="1a">
                      <AccordionHeader>
                        <b>1. Berpindah posisi</b>
                        {completedSteps.includes('1a') && <BsCheckCircle style={{ color: 'green', marginLeft: 10 }} />}
                      </AccordionHeader>
                      <AccordionBody>
                        <p>Ubah posisi bidawang yang berada di titik awal menjadi ke titik (100,100) dengan perintah dibawah ini: </p>
                        <pre><code>setposition 100 100</code></pre>
                      </AccordionBody>
                    </AccordionItem>
                    <AccordionItem eventKey="1b">
                      <AccordionHeader>
                        <b>2. Berpindah posisi</b>
                        {completedSteps.includes('1b') && <BsCheckCircle style={{ color: 'green', marginLeft: 10 }} />}
                      </AccordionHeader>
                      <AccordionBody>
                        <p>Lanjutkan pada baris baru untuk mengubah posisi bidawang lagi ke titik (0,100) dengan perintah dibawah ini: </p>
                        <pre><code>setposition 0 100</code></pre>
                      </AccordionBody>
                    </AccordionItem>
                  </Accordion>
                </Col>



                <Col xs={9}>
                <div className="skulpt-container" style={{border: "2px solid #ccc"}}>
                <div className="editor-section">
                  {/* <h5>Python Turtle Code Editor</h5> */}
                  <CodeMirror
                    value={pythonCode}
                    placeholder={'//Ketikan kode disini!'}
                    height="290px"
                    theme="light"
                    extensions={[python()]}
                    onChange={(value) => setPythonCode(value)}
                  />
                  <div style={{ marginTop: '5px', marginBottom: '5px', display: 'flex', gap: '10px' }}>
                    <Button variant="success" onClick={() => { runit(); checkCode(); }}>Run Code</Button>
                    <Button variant="secondary" onClick={resetCode}>
                      <BsArrowClockwise /> Reset
                    </Button>
                    </div>
                  <pre className="output" style={{height:60}}>{output}</pre>
                </div>
                <div className="canvas-section" style={{width: 400, height: 400}}>
                  <div  style={{width: 400, height: 400}} id="mycanvas"></div>
                </div>
              </div>
                </Col>
              </Row>
            </div>
                  
            <br></br>
            <hr/>

            <div
              style={{
                backgroundColor: '#F9F9F9',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                // maxWidth: '1000px',
                margin: 'auto',
                borderLeft: '5px solid #198754',
                borderRight: '5px solid #198754',
              }}
            >
              <h4
                style={{
                  // color: '#2DAA9E',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  // borderLeft: '5px solid #2DAA9E',
                  // paddingLeft: '10px',
                  marginBottom: '15px',
                  textAlign: 'center',
                }}
              >
                Kesimpulan
              </h4>

              <p>
              Perintah `setposition` atau `setpos` digunakan untuk memindahkan Bidawang ke koordinat tertentu dalam ruang canvas. Perintah ini sangat berguna untuk mengatur posisi awal Bidawang atau membuat jalur menggambar yang kompleks dengan mengombinasikan pergerakan dan kontrol pena.
              </p>
            </div>
            
            <br/>
            <hr></hr>
            <Accordion className="mb-4" style={{ outline: "3px solid #198754", borderRadius: "10px" }}>
            {/* Tantangan Accordion */}
            <Accordion.Item eventKey="1">
            <Accordion.Header><h4 style={{ fontWeight: "bold" }}>Tantangan</h4></Accordion.Header>
              <Accordion.Body>
                <p style={{ fontSize: "16px", marginBottom: "10px" }}>
                Selesaikan tantangan dibawah ini!
                Klik tombol petunjuk untuk menampilkan petujuk pengerjaan.
                </p>
                <Button className='mb-2' variant="info" onClick={showHint} style={{ color: 'white', fontWeight: 'bold' }}>
                        Petunjuk
                    </Button>

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
                      onChange={(value) => {
                        setPythonCodeChallanges(value);
                        pythonCodeRef.current = value;
                      }}                  
                      style={{
                        border: "2px solid #198754",
                        borderRadius: "8px",
                        padding: "5px",
                      }}
                    />
                    <div style={{ marginTop: '5px', marginBottom: '5px', display: 'flex', gap: '10px' }}>
                      <Button variant="success" onClick={() => { runitchallanges() }}>Run Code</Button>
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
                    border: "3px solid #198754",
                    // overflow: "hidden"
                  }}>
                    <div id="mycanvas-challanges" style={{ 
                      width: 400, 
                      height: 400, 
                      position: "relative", 
                    }}></div>
                    
                      <img
                          src={tilemap}
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
                          src={maptitik}
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
                  </div>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

            <Accordion className="mb-4" style={{ outline: "3px solid #198754", borderRadius: "10px" }}>
            {/* Kuis Accordion */}
            <Accordion.Item eventKey="0">
            <Accordion.Header>
                <h4 style={{ fontWeight: "bold" }}>Pertanyaan</h4>
              </Accordion.Header>
              <Accordion.Body>
                <Form>
                  <Form.Group controlId="question1">
                    <Form.Label
                    className="p-3 mb-3"
                    style={{
                      display: "block",
                      backgroundColor: "#f8f9fa",
                      // borderLeft: "5px solid #2DAA9E",
                      // borderRight: "5px solid #2DAA9E",
                      fontSize: "18px",
                      // fontWeight: "bold",
                      borderRadius: "5px"
                    }}>
                      1. Apa fungsi utama dari perintah setposition(x, y)?
                    </Form.Label>
                    <div className="row d-flex">
                    {[
                      "Mengatur warna garis.",
                      "Memutar turtle ke arah tertentu.",
                      "Memindahkan bidawang ke koordinat tertentu dalam ruang gambar.",
                      "Mengubah ukuran turtle."
                    ].map((answer) => (
                      <div key={answer} className="mb-2 ">
                        <Button
                          variant={selectedAnswers.question1 === answer ? "success" : "outline-success"}
                          onClick={() => handleAnswerChange("question1", answer)}
                          className="w-100 p-2 flex-grow-1"
                          style={{
                            fontSize: "16px",
                            // fontWeight: "bold",
                            backgroundColor: selectedAnswers.question1 === answer ? "#2DAA9E" : "",
                            borderColor: "#2DAA9E",
                            // minHeight: "60px" // Menjaga tinggi tetap konsisten
                            textAlign: 'left'
                          }}
                        >
                          {answer}
                        </Button>
                      </div>
                    ))}
                  </div>
            
                  </Form.Group>
                  {feedback.question1 && (
                    <Alert variant={feedback.question1 === "Benar!" ? "success" : "danger"} className="mt-3">
                      {feedback.question1}
                    </Alert>
                  )}

                  <Form.Group controlId="question2">
                    <Form.Label
                    className="p-3 mb-3"
                    style={{
                      display: "block",
                      backgroundColor: "#f8f9fa",
                      // borderLeft: "5px solid #2DAA9E",
                      // borderRight: "5px solid #2DAA9E",
                      fontSize: "18px",
                      // fontWeight: "bold",
                      borderRadius: "5px"
                    }}>
                      2. Jika posisi awal Bidawang adalah (0, 0), dan Anda menggunakan perintah setposition(50, 100), di mana posisi akhir Bidawang?
                    </Form.Label>
                    <div className="row d-flex">
                      {["(100, 50)", 
                      "(50, 0)", 
                      "(0, 100)", 
                      "(50, 100)"].map(
                        (answer) => (
                          <div key={answer} className="mb-2">
                            <Button
                              variant={selectedAnswers.question2 === answer ? "success" : "outline-success"}
                              onClick={() => handleAnswerChange("question2", answer)}
                              className="w-100 p-2 flex-grow-1"
                              style={{
                                fontSize: "16px",
                                // fontWeight: "bold",
                                backgroundColor: selectedAnswers.question2 === answer ? "#2DAA9E" : "",
                                borderColor: "#2DAA9E",
                                // minHeight: "60px"
                                textAlign: 'left'
                              }}
                            >
                              {answer}
                            </Button>
                          </div>
                        )
                      )}
                    </div>

                  </Form.Group>
                  {feedback.question2 && (
                    <Alert variant={feedback.question2 === "Benar!" ? "success" : "danger"} className="mt-3">
                      {feedback.question2}
                    </Alert>
                  )}

                <div className="text-center">
                  <Button variant="primary" onClick={handleSubmit} className="mt-3 p-2" style={{ fontSize: "18px" }}>
                    Periksa Jawaban
                  </Button>
                </div>
                </Form>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          </div>
        </div>
      
    

    </div>
    
  )
}

export default SetPosition
