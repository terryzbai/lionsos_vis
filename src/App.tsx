import React from 'react';
import { Tabs } from 'antd';
import MemoryEditor from './pages/memory-editor'
import TestPage from './pages/test-page'
import './App.css'
import { DiagramEditor } from './pages/diagram-editor'

const onChange = (key: any) => {
  console.log(key);
}
  
export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <div className="top-bar">LionsOS system composer</div>
        <div className='system-container'>
          <Tabs defaultActiveKey="1" items={[
            {
              key: '1',
              label: 'Design',
              children: <DiagramEditor />,
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
}