import React, { useState, useEffect } from 'react';

const TestPage = () => {
  const [tlFunction, setTlFunction] = useState(null)
  const [concatWithHelloWorld, setConcatWithHelloWorld] = useState(null)
  const [instance, setInstance] = useState(null)
  const [dtb, setDtb] = useState(null)
  
  useEffect(() => {
    fetch('gui_sdfgen.wasm').then(response =>
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
        setConcatWithHelloWorld(() => result.instance.exports.jsonToXml)
      })
    })
  }, []);

  const readDtb = () => {
    fetch('qemu_arm_virt.dtb').then(response =>
      response.arrayBuffer()
    ).then(bytes => {
      const typedArray = new Uint8Array(bytes)
      console.log(bytes)
      setDtb(typedArray)
    })
  }

  const handleFunc = () => {
    if (instance) {
      const blob_bytes = new TextDecoder("utf-8").decode(dtb)
      console.log(blob_bytes.length)

      const test_json = {
        board: "qemu_arm_virt",
        dtb: dtb,
        maps: " | Hello WASM",
        pds: [
          { name: 'PD1', priority: 1 },
          { name: 'PD2', priority: 2 }
        ]
      }
      // console.log(dtb)

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
      console.log("Result:\n", resultString)
    }
  }

  return (
    <>
    Hello
    <br />
    <button onClick={readDtb}>read dtb</button>
    <button onClick={handleFunc}>click here</button>
    </>
  )
}

export default TestPage