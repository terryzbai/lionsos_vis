import React, { useState, useEffect } from 'react';

const TestPage = () => {
  const [addFunction, setAddFunction] = useState(null)
  
  useEffect(() => {
    fetch('api.wasm').then(response =>
      response.arrayBuffer()
    ).then(bytes => {
      const typedArray = new Uint8Array(bytes)
      return WebAssembly.instantiate(typedArray, {
        env: {
          print: (result) => { 
            console.log(`The result is ${result}`);
          }
        }
      }).then(result => {
        setAddFunction(() => result.instance.exports.add)
      })
    })
  }, []);

  const handleAdd = () => {
    if (addFunction) {
      alert(`Result of 5 + 3 = ${addFunction(5, 3)}`);
    }
  }

  return (
    <>
    Hello
    <br />
    <button onClick={handleAdd}>click here</button>
    </>
  )
}

export default TestPage