import React, { useState, useEffect } from 'react';

const TestPage = () => {
  const [tlFunction, setTlFunction] = useState(null)
  const [concatWithHelloWorld, setConcatWithHelloWorld] = useState(null)
  const [instance, setInstance] = useState(null)


  const test_json = {
    maps: " | Hello",
    pds: [
      { name: 'PD1', priority: 1 },
      { name: 'PD2', priority: 2 }
    ]
  }
  
  useEffect(() => {
    fetch('api.wasm').then(response =>
      response.arrayBuffer()
    ).then(bytes => {
      const typedArray = new Uint8Array(bytes)
      return WebAssembly.instantiate(typedArray, {
        env: {
          
        }
      }).then(result => {
        setInstance(result.instance)
        console.log(result.instance)
        setConcatWithHelloWorld(() => result.instance.exports.concatWithHelloWorld)
      })
    })
  }, []);

  const handleFunc = () => {
    if (instance) {
      // const inputString = "Input string"
      const inputString = JSON.stringify(test_json)
      const inputBuffer = new TextEncoder().encode(inputString)
      
      const inputPtr = 0
      const resultPtr = inputPtr + inputBuffer.length
      
      const memory = new Uint8Array(instance.exports.memory.buffer)
      memory.set(inputBuffer, inputPtr)
      
      const ret_len = concatWithHelloWorld(inputPtr, inputBuffer.length, resultPtr)
      console.log(ret_len)

      const resultString = new TextDecoder().decode(memory.subarray(resultPtr, resultPtr + ret_len))
      console.log("Concatenated String:", resultString)
    }
  }

  return (
    <>
    Hello
    <br />
    <button onClick={handleFunc}>click here</button>
    </>
  )
}

export default TestPage