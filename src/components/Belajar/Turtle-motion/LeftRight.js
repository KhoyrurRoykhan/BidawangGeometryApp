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
import { FaBars } from "react-icons/fa";
import { closeBrackets } from '@codemirror/autocomplete';



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

const correctCommands = {
  '1a': 'left(90)',
  '1b': 'right(180)'
};

const positions = [
  { left: '294px', top: '174px', angle: 0 },
  { left: '281px', top: '107px', angle: 30 },
  { left: '241px', top: '67px', angle: 60 },
  { left: '175px', top: '50px', angle: 90 },
  { left: '282px', top: '245px', angle: -30 },
  { left: '238px', top: '285px', angle: -60 },
  { left: '173px', top: '298px', angle: -90 }
];

const LeftRight = () => {
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
  const [progresBelajar, setProgresBelajar] = useState(2);
  const [progresTantangan, setProgresTantangan] = useState(0);
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
        navigate('/login'); // atau ke halaman login siswa
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
  
  useEffect(() => {
    const fetchProgresTantangan = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/user/progres-tantangan`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProgresTantangan(Number(response.data.progres_tantangan));

      } catch (error) {
        console.error("Gagal mengambil progres tantangan:", error);
      }
    };
  
    if (token) {
      fetchProgresTantangan();
    }
  }, [token]);
  


  // hint challanges
  const showHint = () => {
    swal({
      title: "Petunjuk Tantangan",
      content: {
        element: "div",
        attributes: {
          innerHTML: `
            <p>Tugas kamu adalah menebak arah kepiting dan mengarahkan Bidawang ke arah yang tepat menggunakan <b>satu perintah saja</b>, yaitu <b>left</b> atau <b>right</b>.</p>
            <p>Jika jawabanmu benar, kepiting akan <b>berpindah ke posisi lain</b>. Tantangan akan selesai setelah kamu berhasil menebak <b>semua arah kepiting</b> dengan benar.</p>
          `
        }
      },
      icon: "info"
    });
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
  

  const [selectedAnswer, setSelectedAnswer] = useState('');
const [selectedAnswer2, setSelectedAnswer2] = useState('');
const [feedback, setFeedback] = useState({ question1: '', question2: '' });
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
    const isCorrect1 = selectedAnswer === 'C';
    setFeedback((prev) => ({ ...prev, question1: isCorrect1
      ? 'Benar! Perintah `left 90`, `left 180`, dan `right 90` akan mengubah arah Bidawang dari kanan ke kiri.'
      : 'Salah! Perhatikan bagaimana arah Bidawang berubah setelah setiap perintah rotasi dijalankan. Arah akhir ditentukan oleh total rotasi dari arah awal.',
  }));

  } else if (currentQuestion === 2) {
    const isCorrect2 = selectedAnswer2 === 'C';
    setFeedback((prev) => ({ ...prev, question2: isCorrect2
      ? 'Benar! Setengah putaran ke kanan berarti sudut rotasi yang digunakan adalah 180°.'
      : 'Salah! Pahami kembali hubungan antara sudut rotasi dan besar putaran.',
  }));

    if (isCorrect2) {
      try {
        if (Number(progresBelajar) === 2) {
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

  

  //contoh
  const [pythonCode, setPythonCode] = useState(``);
  const [pythonCode2, setPythonCode2] = useState(`

for i in range(1000):
  speed(1)
  left 120
  speed(0)
  time.sleep(3)  
  reset()

`);

  const [pythonCode3, setPythonCode3] = useState(`

for i in range(100):
  speed(1)
  right(90)
  speed(0)
  time.sleep(3)  
  reset()

`);

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
          const isMixedNumericStringArgs =
            args.length === 2 &&
            !isNaN(parseFloat(args[0])) &&
            /^["'].*["']$/.test(args[1]);
  
          if (nextTrimmed.includes('(') && nextTrimmed.includes(')')) {
            parsedLines.push(nextLine);
          } else if ((isAllArgsNumeric && args.length > 0) || isStringArg || isMixedNumericStringArgs) {
            parsedLines.push(`${nextLine.match(/^\s*/)?.[0] || ''}${cmd}(${args.join(',')})`);
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
      const noArgCommands = ['clear', 'home', 'reset', 'penup', 'pendown', 'showturtle', 'hideturtle', 'begin_fill', 'end_fill'];
      const isAllArgsNumeric = args.every(arg => !isNaN(parseFloat(arg)));
      const isStringArg = args.length === 1 && /^["'].*["']$/.test(args[0]);
      const isMixedNumericStringArgs =
        args.length === 2 &&
        !isNaN(parseFloat(args[0])) &&
        /^["'].*["']$/.test(args[1]);
  
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
            parsedLines.push(`${leadingSpaces}print(distance(${args[1]},${args[2]}))`);
            i++;
            continue;
          }
        }
      }
  
      if (trimmed.includes('(') && trimmed.includes(')')) {
        parsedLines.push(line);
      } else if (noArgCommands.includes(cmd) && args.length === 0) {
        parsedLines.push(`${leadingSpaces}${cmd}()`);
      } else if ((isAllArgsNumeric && args.length > 0) || isStringArg || isMixedNumericStringArgs) {
        parsedLines.push(`${leadingSpaces}${cmd}(${args.join(',')})`);
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
  const parsedCode = parseSimpleCommands(code || pythonCode2);
  const imports = "import time\nfrom turtle import *\nreset()\nshape('turtle')\n";
  const prog = forceReset ? imports : imports + parsedCode;

  window.Sk.pre = "output2";
  window.Sk.configure({ output: outf, read: builtinRead });
  (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas-contoh1';

  window.Sk.misceval.asyncToPromise(() =>
    window.Sk.importMainWithBody('<stdin>', false, prog, true)
  ).then(
    () => console.log('success'),
    (err) => setOutput((prev) => prev + err.toString())
  );
};


const runit3 = (code, forceReset = false) => {
  setOutput('');
  const parsedCode = parseSimpleCommands(code || pythonCode3);
  const imports = "import time\nfrom turtle import *\nreset()\nshape('turtle')\n";
  const prog = forceReset ? imports : imports + parsedCode;

  window.Sk.pre = "output3";
  window.Sk.configure({ output: outf, read: builtinRead });
  (window.Sk.TurtleGraphics || (window.Sk.TurtleGraphics = {})).target = 'mycanvas-contoh2';

  window.Sk.misceval.asyncToPromise(() =>
    window.Sk.importMainWithBody('<stdin>', false, prog, true)
  ).then(
    () => console.log('success'),
    (err) => setOutput((prev) => prev + err.toString())
  );
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
  
    // menggunakan kode yang sudah diparse
    const parsedCode = parseSimpleCommands(pythonCodeChallanges);
  
    // memeriksa apakah perintah sudah sesuai dengan arah yang benar
    let isCorrect = false;
  
    if (correctAngle === 0) {
      isCorrect = parsedCode.includes(`left(0)`) || parsedCode.includes(`right(0)`);
    } else if (correctAngle > 0) {
      isCorrect = parsedCode.includes(`left(${correctAngle})`);
    } else {
      isCorrect = parsedCode.includes(`right(${Math.abs(correctAngle)})`);
    }
  
    if (validAngles.includes(Math.abs(correctAngle)) && isCorrect) {
      swal("Benar!", "Kepiting berpindah ke posisi lain.", "success").then(() => {
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
  
  

  const resetCode = () => {
    setPythonCode('');
    setOutput('');
    runit('', true);
};

const resetCodeChallanges = () => {
  setPythonCodeChallanges('');
  setOutput('');
  runitchallanges('', true);
};

  

  useEffect(() => {
    runit(); // Jalankan kode saat halaman dimuat
    runit2(); // Jalankan kode saat halaman dimuat
    runit3(); // Jalankan kode saat halaman dimuat
    initializeTurtle(); // Initialize turtle for challenges
  }, []);

  // Tentukan accordion aktif berdasarkan URL
  const activeAccordionKey = location.pathname.includes("/belajar/turtlemotion") || location.pathname.includes("/belajar/turtlemotion/leftright")
    ? "1"
    : "0";

  // Class untuk tombol aktif
  const getButtonClass = (path) =>
    location.pathname === path ? "btn text-start mb-2 btn-success" : "btn text-start mb-2 btn-outline-success";

    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => {
      setCollapsed(!collapsed);
    };

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768); // Atur sesuai breakpoint yang diinginkan
      };

      handleResize(); // inisialisasi
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

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
          width: collapsed ? "50px" : "250px",
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
        <div className="p-1">
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
                  style={{ pointerEvents: progresBelajar < 1 ? "auto" : "auto", opacity: progresBelajar < 2 ? 0.5 : 1 }}
                >
                  <span>Left & Right</span>
                  {progresBelajar < 2 && <span className="ms-2">🔒</span>}
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

          <div
            style={{
              paddingLeft: isMobile ? 5 : 50,
              paddingRight: isMobile ? 5 : 50,
              paddingBottom: 50,
            }}
          >

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
              Left & Right
            </h2>

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
                Memahami cara mengendalikan arah rotasi Bidawang menggunakan left dan right.
              </li>
            </ol>


            <hr />

            <p>
              Perintah left dan right digunakan untuk memutar arah gerakan Bidawang berdasarkan sudut derajat yang diberikan, tanpa harus memindahkan posisinya. Ini berguna untuk mengatur arah Bidawang sebelum melanjutkan dengan perintah lainnya seperti bergerak.
            </p><br />
            
            <h5 style={{color: 'black'}}>1. left</h5>
            <p>Memutar arah Bidawang berlawanan arah jarum jam (kiri) sebesar derajat yang ditentukan.</p>
            <p>Contoh:</p>
            <Row className="align-items-center">
              <Col md={6}>
                <CodeMirror
                  value={`left 120 `}
                  height="400px"
                  theme="light"
                  extensions={[python()]}
                  editable={false}
                  options={{ readOnly: 'nocursor' }}
                />
              </Col>
              <Col md={6} className="text-center">
                <div className="canvas-section" 
                style={{
                  flex: isMobile ? 'none' : '0 0 400px',
                  width: '100%',
                  maxWidth: '400px',
                  maxHeight: 400,
                  alignSelf: isMobile ? 'center' : 'flex-start',
                  overflowX: isMobile ? 'auto' : 'visible',}}>
                  <div style={{textAlign:'center', width: '100%'}} id="mycanvas-contoh1"></div>
                </div>
              </Col>
            </Row>
            <br></br>
            <p><b>Hasil:</b> Bidawang yang awalnya menghadap ke kanan layar, akan berputar 120 derajat ke kiri.</p>

            <br/>

            <h5 style={{color: 'black'}}>2. right</h5>
            <p>Memutar arah Bidawang searah jarum jam (kanan) sebesar derajat yang ditentukan.</p>
            <p>Contoh:</p>
            <Row className="align-items-center">
              <Col md={6}>
                <CodeMirror
                  value={`right 90`}
                  height="400px"
                  theme="light"
                  extensions={[python()]}
                  editable={false}
                  options={{ readOnly: 'nocursor' }}
                />
              </Col>
              <Col md={6} className="text-center">
                <div className="canvas-section" 
                style={{
                  flex: isMobile ? 'none' : '0 0 400px',
                  width: '100%',
                  maxWidth: '400px',
                  maxHeight: 400,
                  alignSelf: isMobile ? 'center' : 'flex-start',
                  overflowX: isMobile ? 'auto' : 'visible',}}>
                  <div style={{textAlign:'center', width: '100%'}} id="mycanvas-contoh2"></div>
                </div>
              </Col>
            </Row>

            <br></br>
            
            <p><b>Hasil:</b> Bidawang yang awalnya menghadap ke kanan layar, akan berputar 90 derajat ke kanan.</p>
            
            <br/>
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
                color: 'black',
                fontSize: '22px',
                fontWeight: 'bold',
                borderLeft: '5px solid #198754',
                paddingLeft: '10px',
                marginBottom: '15px',
              }}
            >
              Latihan menggunakan left dan right 🐢 
            </h4>
            <p style={{ color: '#444', lineHeight: '1.6' }}>
              Untuk lebih mudah memahami cara kerja perintah <code>left</code> dan <code>right</code>, ikuti instruksi di bawah ini.
            </p>
            <ul style={{ color: '#444', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li>Tuliskan kode pada text editor sesuai instruksi di bawah ini.</li>
              <li>Klik <b>Run Code</b> atau tekan <b>Enter</b> untuk menjalankan perintah.</li>
              <li>Jika perintah yang dijalankan salah, klik <b>Undo</b> terlebih dahulu sebelum mencoba lagi.</li>
            </ul>

            <Row>
                {/* Kolom untuk Accordion */}
                <Col xs={12} md={3} style={{ fontSize: '15px', marginBottom: isMobile ? '20px' : '0' }}>
                  <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key)}>
                  {[
                    { step: '1a', title: 'Berputar ke kiri', code: 'left 90', description: 'Buat bidawang berputar 90 derajat ke kiri dengan perintah dibawah ini.' },
                    { step: '1b', title: 'Berputar ke kanan', code: 'right 180', description: 'Kemudian lanjutkan dengan perintah dibawah ini untuk memutar bidawang ke kanan sebesar 180 derajat.' }
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

                {/* Kolom untuk Editor dan Canvas */}
                <Col xs={12} md={9}>
                  <div className="skulpt-container" 
                    style={{ border: '2px solid #ccc',
                    borderRadius: '8px',
                    padding: '15px',
                    display: 'flex',
                    flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                    gap: '20px',
                    flexWrap: 'wrap',
                    width: '100%',
                    boxSizing: 'border-box', }}>
                    {/* Editor Section */}
              <div
                className="editor-section"
                style={{
                  flex: 1,
                  minWidth: 0,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ width: '100%', maxWidth: '100%' }}>
                  <CodeMirror
                    value={pythonCode}
                    placeholder={'//Ketikan kode disini!'}
                    height="150px"
                    theme="light"
                    extensions={[closeBrackets({ brackets: '' })]}
                    onChange={(value) => setPythonCode(value)}
                    onKeyDown={handleKeyDown}
                    style={{ width: '100%' }}
                  />
                </div>
                <div
                  style={{
                    marginTop: '5px',
                    marginBottom: '5px',
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap',
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
                    marginTop: '10px',
                  }}
                >
                  <b>History Commands:</b>
                  <br />
                  {commandHistory.map((cmd, idx) => `> ${cmd}\n`)}
                </pre>
                <pre className="output" style={{ height: 60, overflow: 'auto' }}>
                  {output}
                </pre>
              </div>

              {/* Canvas Section */}
              <div
                className="canvas-section"
                style={{
                  flex: isMobile ? 'none' : '0 0 400px',
                  width: '100%',
                  maxWidth: '400px',
                  maxHeight: 400,
                  alignSelf: isMobile ? 'center' : 'flex-start',
                  overflowX: isMobile ? 'auto' : 'visible',
                }}
              >
                <div id="mycanvas" style={{ width: '100%' }}></div>
              </div>
            </div>
                </Col>
              </Row>
            </div>
            
            <br />
            <hr />
            
            {/* Kesimpulan */}
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
                color: 'black',
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
              Perintah `left` dan `right` memungkinkan pengaturan arah gerakan bidawang dengan rotasi ke kiri atau ke kanan berdasarkan derajat yang ditentukan. Perintah ini sangat berguna untuk kontrol arah sebelum melakukan perintah lain dalam pembuatan gambar atau pola.
            </p>
            </div>
            
            <br />

            <hr />
            <Accordion className="mb-4" style={{ outline: "3px solid #198754", borderRadius: "10px" }}>
            {/* Tantangan Accordion */}
            <Accordion.Item eventKey="1">
            
                <Accordion.Header><h4 style={{ fontWeight: "bold", color: 'black' }}>Tantangan</h4></Accordion.Header>
                <Accordion.Body>
                  <p style={{ fontSize: "16px", marginBottom: "10px" }}>
                    Selesaikan tantangan dengan perintah <code>left</code> dan <code>right</code>. Klik petunjuk untuk bantuan.
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
                        height="290px"
                        theme="light"
                        extensions={[python()]}
                        onChange={(value) => setPythonCodeChallanges(value)}
                        style={{
                          border: "2px solid #198754",
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
                        border: "3px solid #198754",
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
                </Accordion.Body>
              </Accordion.Item>
          </Accordion>


            {/* kuis */}
            <Accordion className="mb-4" style={{ outline: "3px solid #198754", borderRadius: "10px" }}>
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <h4 style={{ fontWeight: "bold", color:'black' }}>Pertanyaan</h4>
            </Accordion.Header>
            <Accordion.Body>
            <Form>
  {/* SOAL 1 */}
  {currentQuestion === 1 && (
    <Form.Group controlId="question1">
      <Form.Label className="p-3 mb-3" style={{ backgroundColor: "#f8f9fa", fontSize: "18px", borderRadius: "5px", width: '100%' }}>
        <b>Soal 1 dari 2:</b>
        <p>Perhatikan kode perintah dibawah ini:</p>
        <pre><code>{`left 90
left 180
right 90`}</code></pre>
        <p>Jika Bidawang awalnya menghadap ke kanan, arah bidawang setelah kode perintah dijalankan adalah ...</p>
      </Form.Label>

      {[
        { key: 'A', label: 'Kanan' },
        { key: 'B', label: 'Atas' },
        { key: 'C', label: 'Kiri' },
        { key: 'D', label: 'Bawah' },
      ].map(({ key, label }) => (
        <Button
          key={key}
          variant={selectedAnswer === key ? "success" : "outline-success"}
          onClick={() => handleAnswerChange("question1", key)}
          className="w-100 mb-2 text-start"
          style={{
            fontSize: "16px",
            backgroundColor: selectedAnswer === key ? "#2DAA9E" : "",
            borderColor: "#2DAA9E"
          }}
        >
          {key}. {label}
        </Button>
      ))}

      {feedback.question1 && (
        <Alert variant={feedback.question1 === 'Benar! Perintah `left 90`, `left 180`, dan `right 90` akan mengubah arah Bidawang dari kanan ke kiri.' ? "success" : "danger"} className="mt-3">
          {feedback.question1}
        </Alert>
      )}
    </Form.Group>
  )}

  {/* SOAL 2 */}
  {currentQuestion === 2 && (
    <Form.Group controlId="question2">
      <Form.Label className="p-3 mb-3" style={{ backgroundColor: "#f8f9fa", fontSize: "18px", borderRadius: "5px", width: '100%' }}>
        <b>Soal 2 dari 2:</b>
        <p>Seorang siswa ingin memutar arah Bidawang ke kanan sebanyak setengah putaran. Sudut yang perlu digunakan adalah ...</p>
      </Form.Label>

      {[
        { key: 'A', label: '90°' },
        { key: 'B', label: '120°' },
        { key: 'C', label: '180°' },
        { key: 'D', label: '360°' },
      ].map(({ key, label }) => (
        <Button
          key={key}
          variant={selectedAnswer2 === key ? "success" : "outline-success"}
          onClick={() => handleAnswerChange("question2", key)}
          className="w-100 mb-2 text-start"
          style={{
            fontSize: "16px",
            backgroundColor: selectedAnswer2 === key ? "#2DAA9E" : "",
            borderColor: "#2DAA9E"
          }}
        >
          {key}. {label}
        </Button>
      ))}

      {feedback.question2 && (
        <Alert variant={feedback.question2 === 'Benar! Setengah putaran ke kanan berarti sudut rotasi yang digunakan adalah 180°.' ? "success" : "danger"} className="mt-3">
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
        (currentQuestion === 1 && feedback.question1 !== 'Benar! Perintah `left 90`, `left 180`, dan `right 90` akan mengubah arah Bidawang dari kanan ke kiri.') ||
        (currentQuestion === 2 && feedback.question2 !== "Benar()")
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
}

export default LeftRight;
