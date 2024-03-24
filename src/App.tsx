import React from 'react';
import { Tabs } from 'antd';
import DiagramEditor from './pages/diagram-editor';
import MemoryEditor from './pages/memory-editor';
import './App.css';
import { TestEditor } from './pages/test-editor';

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
              children: <TestEditor />,
            },
            {
              key: '2',
              label: 'Schedule',
              children: <MemoryEditor />,
            },
            {
              key: '3',
              label: 'Device Tree',
              children: 'Content of Tab Pane 3',
            },
          ]} onChange={onChange} />
        </div>
      </div>
    )
  }
}