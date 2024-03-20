import React from 'react';
import { Tabs } from 'antd';
import DiagramEditor from './pages/diagram-editor';
import MemoryEditor from './pages/memory-editor';
import './App.css';
import ComponentDrawer from './components/component-drawer';

const onChange = (key: any) => {
  console.log(key);
}
  
export default class App extends React.Component<{}, { drawerOpen: boolean, data: any }> {
  constructor(props) {
    super(props);
    this.showDrawer = this.showDrawer.bind(this)
    this.closeDrawer = this.closeDrawer.bind(this)
    this.state = {
      drawerOpen: false,
      data: {
        name: '1',
        title: '2'
      }
    };
  }

  showDrawer(node_id) {
    console.log(node_id)
    this.setState({ drawerOpen: true })
  }

  closeDrawer() {
    this.setState({ drawerOpen: false })
  }

  render() {
    return (
      <div className="App">
        <div className="top-bar">LionsOS system composer</div>
        <div className='system-container'>
          <Tabs defaultActiveKey="1" items={[
            {
              key: '1',
              label: 'Design',
              children: <DiagramEditor openDrawer={this.showDrawer}/>,
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
        <ComponentDrawer closeDrawer={this.closeDrawer} drawerOpen={this.state.drawerOpen} data={this.state.data} />
      </div>
    )
  }
}