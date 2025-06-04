import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import './assets/tutor.css';
import './asset_skulpt/SkulptTurtleRunner.css';
import { Button, Modal, Form } from 'react-bootstrap';
import { BsArrowClockwise, BsPlayFill, BsFolder2Open, BsDownload, BsSave2 } from 'react-icons/bs';
import './assets/button3d.css';

const TextEditorPage = () => {
  const [pythonCode, setPythonCode] = useState('');
  const [output, setOutput] = useState('');
  const [filename, setFilename] = useState('my_code');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const runit = (code, forceReset = false) => {
    setOutput('');
    const imports = "from turtle import *\nreset()\nshape('turtle')\nspeed(2)\n";
    const parsedCode = parseSimpleCommands(pythonCode);
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

  const resetCode = () => {
    setPythonCode('');
    setOutput('');
    runit('', true);
  };

  useEffect(() => {
    runit('', true);
  }, []);

  const handleOpenFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPythonCode(e.target.result);
      setFilename(file.name.replace('.py', ''));
    };
    reader.readAsText(file);
  };

  const handleSaveFile = () => {
    const blob = new Blob([pythonCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeFilename = filename.trim() !== '' ? filename.trim() : 'my_code';
    const finalFilename = safeFilename.endsWith('.py') ? safeFilename : `${safeFilename}.py`;
    link.download = finalFilename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className='px-3' style={{ paddingTop: '80px', paddingBottom: '20px', position: 'relative', zIndex: 1, maxWidth: '100%', overflowX: 'hidden', backgroundColor:'white', height:'100vh' }}>
      <div
        className="skulpt-container"
        style={{
          border: "2px solid #ccc",
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '20px',
          padding: '20px',
          alignItems: 'stretch',
          maxWidth: '100%',
          overflowX: 'hidden',
        }}
      >
        {/* Editor */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <CodeMirror
            placeholder={'# Tuliskan kode anda disini!'}
            value={pythonCode}
            height="400px"
            theme="dark"
            extensions={[python()]}
            onChange={(value) => setPythonCode(value)}
            style={{ border: '1px solid #ccc', width: '100%' }}
          />

          <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a onClick={() => runit()} className='button-3d-run'>
              <BsPlayFill /> Jalankan
            </a>
            <a onClick={resetCode} className='button-3d-reset'>
              <BsArrowClockwise /> Reset
            </a>
            <a className='button-3d-open' onClick={() => fileInputRef.current.click()}>
              <BsFolder2Open /> Buka File
            </a>
            <input
              ref={fileInputRef}
              type="file"
              accept=".py"
              style={{ display: 'none' }}
              onChange={handleOpenFile}
            />
            <a className='button-3d-open' onClick={() => setShowSaveModal(true)}>
              <BsSave2 /> Simpan File
            </a>
          </div>

          <pre className="output mt-3" style={{ height: 60, overflow: 'auto' }}>{output}</pre>
        </div>

        {/* Canvas */}
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

      {/* Modal Simpan File */}
      <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Simpan File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nama File</Form.Label>
            <Form.Control
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Masukkan nama file"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <a onClick={() => setShowSaveModal(false)} className='button-3d-grey'>
            Batal
          </a>
          <a onClick={() => {
            handleSaveFile();
            setShowSaveModal(false);
          }} className='button-3d-open'>
            <BsDownload /> Simpan
          </a>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TextEditorPage;
