import React, { useState } from 'react';
import { Tabs } from 'antd';
import MemoryEditor from './pages/memory-editor'
import TestPage from './pages/test-page'
import './App.css'
import { DiagramEditor } from './pages/diagram-editor'
import ArchConfigBar from './components/arch-config-bar'

const onChange = (key: any) => {
  console.log(key);
}
  
const App = () => {
  const [ board, setBoard ] = useState<string>('qemu_arm_virt')
  const [ dtb, setDtb ] = useState<Uint8Array>(null)

  return (
    <div className="App">
      <div className="top-bar">LionsOS system composer</div>
      <ArchConfigBar board={board} setBoard={setBoard} dtb={dtb} setDtb={setDtb}></ArchConfigBar>
      <div className='system-container'>
        <Tabs defaultActiveKey="1" items={[
          {
            key: '1',
            label: 'Design',
            children: <DiagramEditor board={board} dtb={dtb} />,
          },
          {
            key: '2',
            label: 'Schedule',
            children: <MemoryEditor />,
          },
          {
            key: '3',
            label: 'Device Tree',
            children: <TestPage />,
          },
        ]} onChange={onChange} />
      </div>
    </div>
  )
}
export default App;
