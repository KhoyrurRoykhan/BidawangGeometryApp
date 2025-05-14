import React, { useState } from "react";
import { Accordion, Card, Button } from "react-bootstrap";
import { FaBars } from "react-icons/fa";

const AccordionSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("pengenalan-turtle");

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const renderContent = () => {
    switch (activeItem) {
      case "pengenalan-turtle":
        return (
          <>
            <h2>Pengenalan Turtle</h2>
            <p>
              Turtle adalah pustaka Python untuk menggambar menggunakan perintah seperti <code>forward()</code> dan <code>left()</code>. Turtle adalah pustaka Python untuk menggambar menggunakan perintah seperti <code>forward()</code> dan <code>left()</code>. Turtle adalah pustaka Python untuk menggambar menggunakan perintah seperti <code>forward()</code> dan <code>left()</code>.
            </p>
          </>
        );
      case "manfaat-turtle":
        return (
          <>
            <h2>Manfaat Turtle</h2>
            <p>Turtle membantu pelajar memahami logika pemrograman secara visual.</p>
          </>
        );
      default:
        return (
          <>
            <h2>Selamat Datang</h2>
            <p>Gunakan sidebar untuk navigasi materi pembelajaran.</p>
          </>
        );
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: collapsed ? "60px" : "250px", transition: "width 0.3s", backgroundColor: "#f0f0f0" }}>
        <div className="p-2">
          <Button variant="light" onClick={toggleSidebar}>
            <FaBars />
          </Button>
        </div>
        {!collapsed && (
          <Accordion defaultActiveKey="0" className="p-2">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Pengenalan</Accordion.Header>
              <Accordion.Body>
                <div onClick={() => setActiveItem("pengenalan-turtle")} style={{ cursor: "pointer" }}>
                  Pengenalan Turtle
                </div>
                <div onClick={() => setActiveItem("manfaat-turtle")} style={{ cursor: "pointer" }}>
                  Manfaat Turtle
                </div>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
              <Accordion.Header>Pergerakan</Accordion.Header>
              <Accordion.Body>
                <div>Forward & Backward</div>
                <div>Left & Right</div>
                <div>Set Position</div>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
              <Accordion.Header>Kontrol Pena</Accordion.Header>
              <Accordion.Body>
                <div>Pen Up & Down</div>
                <div>Warna Pena</div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        )}
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "20px" }}>
      <h2>Pengenalan Turtle</h2>
            <p>
              Turtle adalah pustaka Python untuk menggambar menggunakan perintah seperti <code>forward()</code> dan <code>left()</code>. Turtle adalah pustaka Python untuk menggambar menggunakan perintah seperti <code>forward()</code> dan <code>left()</code>. Turtle adalah pustaka Python untuk menggambar menggunakan perintah seperti <code>forward()</code> dan <code>left()</code>.
            </p>
      </main>
    </div>
  );
};

export default AccordionSidebar;
