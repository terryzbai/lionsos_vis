import React, { useState, useEffect } from 'react';

const TestPage = () => {
  const [tlFunction, setTlFunction] = useState(null)
  const [concatWithHelloWorld, setConcatWithHelloWorld] = useState(null)
  const [instance, setInstance] = useState(null)


  const test_json = {
    maps: " | Hello WASM",
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
          print: (result) => { console.log(`The result is ${result}`); }
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
      console.log(inputString)
      
      const inputPtr = 0
      const resultPtr = inputPtr + inputBuffer.length
      
      const memory_init = new Uint8Array(instance.exports.memory.buffer)
      console.log("u8arr length: " + memory_init.length);
      memory_init.set(inputBuffer, inputPtr)

      const ret_len = concatWithHelloWorld(inputPtr, inputBuffer.length, resultPtr)
      console.log(ret_len)
      
      const memory = new Uint8Array(instance.exports.memory.buffer)
      console.log("u8arr length: " + memory.length);

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