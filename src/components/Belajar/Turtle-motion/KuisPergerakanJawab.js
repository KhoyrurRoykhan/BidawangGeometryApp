import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FaArrowAltCircleRight } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const quizData = [
  {
    question: 'Apa perbedaan utama antara perintah left dan right?',
    options: [
      'left memutar bidawang ke arah kanan, sementara right memutar bidawang ke arah kiri.',
      'left memutar bidawang ke arah kiri, sementara right memutar bidawang ke arah kanan.',
      'left dan right hanya digunakan untuk mengubah warna turtle.',
      'Keduanya memindahkan turtle ke posisi (0, 0).'
    ],
    answer: 'left memutar bidawang ke arah kiri, sementara right memutar bidawang ke arah kanan.'
  },
  {
    question: 'Perintah apa yang digunakan untuk menggerakkan turtle ke depan sejauh 150 piksel?',
    options: [
      'backward 150',
      'forward 150',
      'left 150',
      'right 150'
    ],
    answer: 'forward 150'
  },
  {
    question: 'Jika turtle menghadap ke barat dan Anda menggunakan perintah backward 100, ke arah mana turtle akan bergerak?',
    options: [
      'Ke barat',
      'Ke timur',
      'Ke utara',
      'Ke selatan'
    ],
    answer: 'Ke timur'
  },
  {
    question: 'Jika posisi awal Bidawang adalah (0, 0), dan Anda menggunakan perintah setposition 50 100, di mana posisi akhir Bidawang?',
    options: [
      '(100, 50)',
      '(50, 0)',
      '(0, 100)',
      '(50, 100)'
    ],
    answer: '(50, 100)'
  },
  {
    question: 'Apa hasil dari perintah setx 200 jika posisi awal turtle adalah (100, 50)?',
    options: [
      'Posisi baru menjadi (200, 50).',
      'Posisi baru menjadi (100, 200).',
      'Posisi baru menjadi (200, 200).',
      'Posisi baru tetap (100, 50).'
    ],
    answer: 'Posisi baru menjadi (200, 50).'
  },
  {
    question: 'Jika Anda menggunakan perintah setheading 90, ke arah mana Bidawang akan menghadap?',
    options: [
      'Timur',
      'Barat',
      'Utara',
      'Selatan'
    ],
    answer: 'Utara'
  },
  {
    question: 'Apa fungsi dari perintah home?',
    options: [
      'Menghapus seluruh gambar yang telah dibuat.',
      'Mengembalikan Bidawang ke posisi awal (0, 0) dan mengatur arahnya ke timur.',
      'Utara',
      'Memindahkan Bidawang ke posisi y = 0.'
    ],
    answer: 'Mengembalikan Bidawang ke posisi awal (0, 0) dan mengatur arahnya ke timur.'
  },
  {
    question: 'Jika posisi awal Bidawang adalah (100, 100) dan arahnya ke barat, apa yang terjadi setelah menggunakan home?',
    options: [
      'Bidawang tetap di posisi (100, 100).',
      'Bidawang kembali ke posisi (0, 0) dengan arah tetap ke barat.',
      'Bidawang kembali ke posisi (0, 0) dan menghadap ke timur.',
      'Bidawang tetap di posisi (100, 100) tetapi menghadap ke timur.'
    ],
    answer: 'Bidawang kembali ke posisi (0, 0) dan menghadap ke timur.'
  },
  {
    question: 'Apa yang terjadi jika Anda menjalankan perintah circle -50?',
    options: [
      'Tidak ada lingkaran yang digambar.',
      'Lingkaran dengan jari-jari 50 akan digambar berlawanan dengan arah.',
      'Lingkaran dengan jari-jari 50 akan digambar dengan arah normal (berlawanan arah jarum jam).',
      'Lingkaran kecil akan digambar di posisi saat ini.'
    ],
    answer: 'Lingkaran dengan jari-jari 50 akan digambar berlawanan dengan arah.'
  },
  {
    question: 'Apa fungsi dari perintah dot?',
    options: [
      'Menggambar lingkaran penuh.',
      'Menggambar busur lingkaran.',
      'Menggambar titik di posisi saat ini.',
      'Menghapus titik pada kanvas.'
    ],
    answer: 'Menggambar titik di posisi saat ini.'
  }
];

  

const KuisPergerakanJawab = () => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [hovered, setHovered] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  const hasFinishedRef = useRef(false);
  const answersRef = useRef({});
  const timerRef = useRef(null);

  const [progresBelajar, setProgresBelajar] = useState(27); 
  const [token, setToken] = useState("");

  const navigate = useNavigate();
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    Swal.fire({
      title: 'Selamat mengerjakan!',
      text: 'Kerjakan kuis dengan teliti dan semangat 💪',
      icon: 'info',
      confirmButtonText: 'Mulai',
      confirmButtonColor: '#3085d6'
    });
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(timerRef.current);
          if (isDataLoaded) {
            handleFinish();
          } else {
            // ⏳ Tunggu sampai data siap, lalu panggil handleFinish
            const interval = setInterval(() => {
              if (isDataLoaded) {
                clearInterval(interval);
                handleFinish();
              }
            }, 500);
          }
          return 0;
        }
        return next;
      });
    }, 1000);
  
    return () => clearInterval(timerRef.current);
  }, [isDataLoaded]);
  

  

useEffect(() => {
  const getTokenAndProgres = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/token`);
      setToken(response.data.accessToken);

      const progres = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/user/progres-belajar`, {
        headers: {
          Authorization: `Bearer ${response.data.accessToken}`
        }
      });

      setProgresBelajar(progres.data.progres_belajar);
      setIsDataLoaded(true); // ✅ Set data siap
    } catch (error) {
      console.error("Gagal mengambil token/progres:", error);
      navigate("/login");
    }
  };

  getTokenAndProgres();
}, []);


  const handleOptionClick = (index) => {
    if (!showResult) {
      const updatedAnswers = { ...answers, [current]: index };
      setAnswers(updatedAnswers);
      answersRef.current = updatedAnswers;
    }
  };

  const [kkm, setKkm] = useState(80); // default sementara

  useEffect(() => {
    const fetchKKM = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/kkm/kuis`, {
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

  const handleFinish = async () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    clearInterval(timerRef.current);

    let sc = 0;
    const wrong = [];

    quizData.forEach((q, idx) => {
      const selected = answersRef.current[idx];
      const selectedOption = q.options[selected];
      if (selectedOption === q.answer) {
        sc += 1;
      } else {
        wrong.push(idx);
      }
    });

    setScore(sc);
    setWrongAnswers(wrong);
    setShowResult(true);

    const nilaiAkhir = (sc / quizData.length) * 100;

// ✅ Update progres jika memenuhi syarat
if (nilaiAkhir >= kkm && progresBelajar === 10) {
  try {
    // 1. Update progres belajar
    await axios.put(
      `${process.env.REACT_APP_API_ENDPOINT}/user/progres-belajar`,
      { progres_belajar: progresBelajar + 1 },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    setProgresBelajar(prev => prev + 1);

    // 2. Update nilai kuis_1
    await axios.put(
      `${process.env.REACT_APP_API_ENDPOINT}/nilai/kuis-2`,
      { nilai: Math.round(nilaiAkhir) }, // Jika kamu ingin integer
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    Swal.fire({
      icon: 'success',
      title: 'Selesai!',
      html: `
        <p>Nilaimu: <strong>${nilaiAkhir}</strong></p>
        <p>Materi selanjutnya sudah terbuka 🎉</p>
        <p>Pilih "Tutup" jika ingin memeriksa kembali jawabanmu.</p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Lanjutkan',
      cancelButtonText: 'Tutup'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/belajar/tellstate/position');
      }
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

} else if (nilaiAkhir >= kkm && progresBelajar > 10) {
  // ⚠️ Sudah pernah menjawab kuis ini sebelumnya
  Swal.fire({
    icon: 'info',
    title: 'Sudah Pernah Menyelesaikan Kuis Ini',
    html: `
      <p>Nilaimu: <strong>${nilaiAkhir}</strong></p>
      <p>Kamu sudah menyelesaikan kuis ini sebelumnya.</p>
      <p>Tidak ada perubahan pada progres belajar kamu.</p>
    `,
    confirmButtonText: 'Mengerti'
  });

} else {
  // ❌ Nilai belum memenuhi
  Swal.fire({
    title: 'Nilai Belum Memenuhi 😕',
    icon: 'warning',
    html: `
      <p>Nilaimu: <strong>${nilaiAkhir}</strong></p>
      <p>Sayangnya kamu belum memenuhi syarat nilai minimal ${kkm}.</p>
      <p><strong>Silakan baca ulang materi sebelumnya</strong> lalu coba kerjakan ulang kuis ini ya 💪</p>
    `,
    confirmButtonText: 'Mengerti'
  }).then(() => {
    navigate('/belajar/turtlemotion/leftright');
  });
}}


  const isAnswered = (index) => answers.hasOwnProperty(index);
  const isWrong = (index) => wrongAnswers.includes(index);

  return (
    <Container fluid className="p-4" style={{ height: '100vh', fontFamily: 'Verdana, sans-serif' }}>
      <Row className="h-100">
        <Col xs={12} md={4} lg={3} className="mb-4">
          <Card className="w-100">
            <Card.Body className="d-flex flex-column w-100">
              <Card.Title style={{ fontSize: '16px', textAlign: 'left' }}>
                Soal kategori:<br />
                <span className="text-success">Pergerakan Turtle</span>
              </Card.Title>

              <div
                className="mt-3"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
                  gap: '8px',
                  width: '100%',
                }}
              >
                {quizData.map((_, i) => (
                  <Button
                    key={i}
                    variant={
                      current === i
                        ? 'secondary'
                        : isWrong(i)
                        ? 'danger'
                        : isAnswered(i)
                          ? 'success'
                          : 'outline-secondary'
                    }
                    onClick={() => setCurrent(i)}
                    style={{
                      width: '100%',
                      height: '50px',
                      padding: 0,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              <div
                className="mt-3 w-100"
                style={{
                  fontSize: '14px',
                  textAlign: 'center',
                  border: '1px solid #ccc',
                  padding: '8px',
                  borderRadius: '4px',
                }}
              >
                {timeRemaining > 0 ? `${timeRemaining} detik tersisa` : 'Waktu habis'}
              </div>

              {showResult && (
                <div className="mt-2 text-center fw-bold text-primary">
                  Nilai: {score} / {quizData.length}
                </div>
              )}

              {!showResult && (
                <Button className="mt-3" variant="danger" onClick={handleFinish}>
                  Selesai
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={8} lg={9} className="d-flex flex-column">
          <Card className="h-100" style={{ paddingLeft: '50px', paddingRight: '50px', paddingBottom: '30px' }}>
            <Card.Body className="d-flex flex-column justify-content-between">
              <div>
                <Card.Title as="h4" className="mb-4">
                  <div
                    className="p-3 mb-3"
                    style={{
                      display: "block",
                      backgroundColor: "#d1e7dd",
                      fontSize: "18px",
                      borderRadius: "5px",
                      color: "#0f5132"
                    }}
                  >
                    {quizData[current].question}
                  </div>
                </Card.Title>

                <div className="d-flex flex-column gap-2">
                  {quizData[current].options.map((option, i) => {
                    const isSelected = answers[current] === i;
                    const isCorrectAnswer = option === quizData[current].answer;

                    let backgroundColor = '';
                    let textColor = '#198754';

                    if (showResult) {
                      if (isCorrectAnswer) {
                        backgroundColor = '#198754';
                        textColor = '#fff';
                      } else if (isSelected) {
                        backgroundColor = '#dc3545';
                        textColor = '#fff';
                      }
                    } else {
                      backgroundColor = isSelected || hovered === i ? '#198754' : '';
                      textColor = isSelected || hovered === i ? '#fff' : '#198754';
                    }

                    return (
                      <Button
                        key={i}
                        variant="outline-success"
                        onClick={() => handleOptionClick(i)}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                        className="w-100 p-2 text-start"
                        style={{
                          fontSize: "16px",
                          backgroundColor,
                          borderColor: "#198754",
                          color: textColor
                        }}
                      >
                        {option}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <Button
                  variant="primary"
                  onClick={() => setCurrent((prev) => Math.min(prev + 1, quizData.length - 1))}
                >
                  Selanjutnya <FaArrowAltCircleRight />
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default KuisPergerakanJawab
