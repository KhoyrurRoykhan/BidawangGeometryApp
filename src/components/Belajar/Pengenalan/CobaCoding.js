import React from 'react'
import { useState } from 'react'



const CobaCoding = () => {
    const [pythonCode, setPythonCode] = useState('')
    const [output, setOutput] = useState('');

  const outf = (text) => {
    setOutput((prev) => prev + text);
  };
  
  function builtinRead(x) {
    if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
    return window.Sk.builtinFiles["files"][x];
}
  return (
    <div>
      ppp
    </div>
  )
}

export default CobaCoding
