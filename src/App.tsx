import React, { useState, useEffect } from 'react';
import { Select, Space, Tabs } from 'antd';
import { MemoryEditor } from './pages/memory-editor'
import DeviceTreeViewer from './pages/device-tree-viewer'
import './App.css'
import { DiagramEditor } from './pages/diagram-editor'
import { MemoryRegion } from './pages/memory-editor'

const onChange = (key: any) => {}
  
const App = () => {
  const [ deviceTreeJson, setDeviceTreeJson ] = useState(null)
  const [ getDeviceTree, setGetDeviceTree ] = useState(null)
  const [ wasmInstance, setWasmInstance ] = useState(null)
  const [ board, setBoard ] = useState<string>('qemu_arm_virt')
  const [ dtb, setDtb ] = useState<Uint8Array>(null)
  const [ MRs, setMRs] = useState<Array<MemoryRegion>>([])

  const board_list = [
    { value: 'qemu_arm_virt', label: 'qemu_arm_virt' },
  ]

  const switchBoard = (value: string) => {
    setBoard(value)
  };

  const readDeviceTree = () => {
    if (wasmInstance == null) {
      console.log('no wasm')
      return
    }

    const attrJson = {
      dtb: Array.from(dtb),
    }
    console.log(attrJson)
    const inputString = JSON.stringify(attrJson)
    const inputBuffer = new TextEncoder().encode(inputString)

    const inputPtr = 0
    const resultPtr = inputPtr + inputBuffer.length
    const memory_init = new Uint8Array(wasmInstance.exports.memory.buffer)
    memory_init.set(inputBuffer, inputPtr)

    const ret_len = wasmInstance.exports.getDeviceTree(inputPtr, inputBuffer.length, resultPtr)
    console.log(ret_len)

    const memory = new Uint8Array(wasmInstance.exports.memory.buffer)
    const resultString = new TextDecoder().decode(memory.subarray(resultPtr, resultPtr + ret_len))
    console.log("Result:\n", resultString)

    setDeviceTreeJson(JSON.parse(resultString))
  }

  const readDtb = () => {
    fetch(board + '.dtb').then(response =>
      response.arrayBuffer()
    ).then(bytes => {
      const typedArray = new Uint8Array(bytes)
      setDtb(typedArray)
      // TODO: verify if a valid dtb is loaded
      console.log('load Dtb')
    })
  }

  useEffect(() => {
    readDeviceTree()
  }, [dtb, wasmInstance])

  useEffect(() => {
    readDtb()
  }, [board])

  useEffect(() => {
    fetch('gui_sdfgen.wasm').then(response =>
      response.arrayBuffer()
    ).then(bytes => {
      const typedArray = new Uint8Array(bytes)
      return WebAssembly.instantiate(typedArray, {}).then(result => {
        setWasmInstance(result.instance)
      })
    })
    console.log('load wasm')
    readDtb()

  }, []);

  return (
    <div className="App">
      <div className="top-bar">LionsOS system composer</div>
      <div className="arch-config-bar">
        <Space wrap>
          Board:
          <Select
            defaultValue={board}
            style={{ width: 200 }}
            onChange={switchBoard}
            options={board_list}
          />

        </Space>
      </div>
      <div className='system-container'>
        <Tabs defaultActiveKey="1" items={[
          {
            key: '1',
            label: 'Design',
            children: <DiagramEditor board={board} dtb={dtb} MRs={MRs} setMRs={setMRs}/>,
          },
          {
            key: '2',
            label: 'Memory Regions',
            children: <MemoryEditor MRs={MRs} setMRs={setMRs} />,
          },
          {
            key: '3',
            label: 'Device Tree',
            children: <DeviceTreeViewer deviceTreeJson={deviceTreeJson} />,
          },
        ]} onChange={onChange} />
      </div>
    </div>
  )
}
export default App;
