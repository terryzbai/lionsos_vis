import { useState, useEffect } from 'react';
import init, {greet} from "validator-wasm"

const SDFGenerator = ({ globalGraph, toGenerateSDF, setToGenerateSDF, setSDFText }) => {
  const [sdfGenWasm, setSdfGenWasm] = useState(null)
  const [instance, setInstance] = useState(null)
  const [dtb, setDtb] = useState(null)
  const [drivers, setDrivers] = useState(null)
  const [deviceClass, setDeviceClass] = useState(null)
  const [SDF, setSDF] = useState("")

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

  const getPDJson = (PDs) => {
    if (PDs == null) return []

    const pds = []
    PDs.map(PD => {
      const children = getPDJson(PD.children)
      const attrs = {
        ...PD.data.attrs,
        children: children,
        type: PD.data.type,
        maps: PD.data.mappings,
        irqs: PD.data.irqs
      }
      console.log(attrs)
      pds.push(attrs)
    })
    return pds
  }

  const getChannelJson = (edges) => {
    if (edges == null) return []

    const channels = []
    edges.map(edge => {
      const attrs = {
        pd1: edge.data.source_node?.data.attrs.name,
        pd2: edge.data.target_node?.data.attrs.name,
        pd1_end_id: parseInt(edge.data.source_end_id),
        pd2_end_id: parseInt(edge.data.target_end_id),
      }
      console.log(attrs)
      channels.push(attrs)
    })
    return channels
  }

  const sdf_generate = () => {
    const attrJson = {
      board: "qemu_arm_virt",
      dtb: Array.from(dtb),
      drivers: drivers,
      deviceClasses: deviceClass,
      mrs: [],
      pds: [],
      channels: []
    }

    const PDs = globalGraph?.getNodes().filter(node => node.data.type == "PD").filter(node => node.parent == null)
    const channels = globalGraph?.getEdges().filter(edge => edge.data.type == "channel")
    console.log(channels)
    
    attrJson.pds = getPDJson(PDs)
    attrJson.channels = getChannelJson(channels)
    console.log(attrJson)
    const inputString = JSON.stringify(attrJson)
    const inputBuffer = new TextEncoder().encode(inputString)
    
    const inputPtr = 0
    const resultPtr = inputPtr + inputBuffer.length
    const memory_init = new Uint8Array(instance.exports.memory.buffer)
    memory_init.set(inputBuffer, inputPtr)

    const ret_len = sdfGenWasm(inputPtr, inputBuffer.length, resultPtr)
    console.log(ret_len)
    
    const memory = new Uint8Array(instance.exports.memory.buffer)
    const resultString = new TextDecoder().decode(memory.subarray(resultPtr, resultPtr + ret_len))
    console.log("Result:\n", resultString)

    setSDFText(resultString)
    setToGenerateSDF(false)
  }

  const readDeviceConfig = async (config_paths, setStateFunc) => {
    const fetchFileContent = async (entry) => {
      const url = sDDFURL + entry.path
      try {
        const response = await fetch(sDDFURL + entry.path)
        if (response.ok) {
          return {class: entry.class, content: await response.text()};
        }
        return
      } catch (err) {
        console.log(err)
        return
      }
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

  const handleTest = () => {
    console.log(globalGraph.getCells())
  }

  const handleValidation = () => {
    init().then((_exports) => {
      alert(greet(SDF))
    });
  }
  
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
        setSdfGenWasm(() => result.instance.exports.jsonToXml)
      })
    })

    fetch('qemu_arm_virt.dtb').then(response =>
      response.arrayBuffer()
    ).then(bytes => {
      const typedArray = new Uint8Array(bytes)
      setDtb(typedArray)
      console.log("DTB has been loaded.")
    })

    readDeviceConfig(driver_paths, setDrivers)
    readDeviceConfig(device_class_paths, setDeviceClass)
  }, [])

  useEffect(() => {
    if (toGenerateSDF) {
      sdf_generate()
      setToGenerateSDF(false)
    }
  }, [toGenerateSDF])

  return (
    <>
    Hello
    <br />
    <button onClick={handleTest}>handle Test</button>

    <br />
    <br />
    <button onClick={handleValidation}>Validate</button>
    </>
  )
}

export default SDFGenerator;