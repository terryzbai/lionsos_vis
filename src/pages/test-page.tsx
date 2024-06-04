import React, { useState, useEffect } from 'react';

const TestPage = () => {
  const [tlFunction, setTlFunction] = useState(null)
  const [concatWithHelloWorld, setConcatWithHelloWorld] = useState(null)
  const [instance, setInstance] = useState(null)
  const [dtb, setDtb] = useState(null)
  const [drivers, setDrivers] = useState(null)
  const [deviceClass, setDeviceClass] = useState(null)

  const sDDFURL = `https://raw.githubusercontent.com/au-ts/sddf/862feed2485d5a6f5f31f80664dd6ad5374b757c/`
  const driver_paths = [
    {class: "network", path: "drivers/network/imx/config.json"},
    {class: "network", path: "drivers/network/meson/config.json"},
    {class: "network", path: "drivers/network/virtio/config.json"},
    {class: "serial", path: "drivers/serial/meson/config.json"},
    {class: "serial", path: "drivers/serial/imx/config.json"},
    {class: "serial", path: "drivers/serial/arm/config.json"},
  ]

  const device_class_paths = [
    {class: "network", path: "network/config.json"},
    {class: "network", path: "serial/config.json"},
  ]
  
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
        setConcatWithHelloWorld(() => result.instance.exports.jsonToXml)
      })
    })

    readDeviceConfig(driver_paths, setDrivers)
    readDeviceConfig(device_class_paths, setDeviceClass)
  }, []);

  const readDtb = () => {
    fetch('qemu_arm_virt.dtb').then(response =>
      response.arrayBuffer()
    ).then(bytes => {
      const typedArray = new Uint8Array(bytes)
      setDtb(typedArray)
    })

    console.log(drivers)
  }

  const readDeviceConfig = async (config_paths, setStateFunc) => {
    // const fileURLs = config_paths.map(item => sDDFURL + item.path)
    const fetchFileContent = async (entry) => {
      const response = await fetch(sDDFURL + entry.path);
      if (!response.ok) {
        return
      }
      return {class: entry.class, content: await response.text()};
    };

    const fetchAllFiles = async () => {
      try {
        const contents = await Promise.all(config_paths.map(fetchFileContent));
        setStateFunc(contents.filter(entry => entry != null))
      } catch (err) {
        console.log(err.message)
      }
    }

    fetchAllFiles()
  }

  const handleFunc = () => {
    if (instance) {
      const blob_bytes = new TextDecoder("utf-8").decode(dtb)
      console.log(blob_bytes.length)

      const test_json = {
        board: "qemu_arm_virt",
        dtb: Array.from(dtb),
        drivers: drivers,
        deviceClasses: deviceClass,
        maps: " | Hello WASM",
        pds: [
          { name: 'PD1', priority: 1 },
          { name: 'PD2', priority: 2 }
        ]
      }
      console.log(test_json)

      // const inputString = "Input string"
      const inputString = JSON.stringify(test_json)
      const inputBuffer = new TextEncoder().encode(inputString)
      
      const inputPtr = 0
      const resultPtr = inputPtr + inputBuffer.length
      
      instance.exports.memory.grow(1000)
      const memory_init = new Uint8Array(instance.exports.memory.buffer)

      console.log("u8arr length: " + memory_init.length)
      memory_init.set(inputBuffer, inputPtr)

      const ret_len = concatWithHelloWorld(inputPtr, inputBuffer.length, resultPtr)
      console.log(ret_len)
      
      const memory = new Uint8Array(instance.exports.memory.buffer)
      console.log("u8arr length: " + memory.length)

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