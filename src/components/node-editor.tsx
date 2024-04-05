import { Drawer, Tabs } from 'antd'
import { useEffect, useState } from 'react'
import { InputNumber, Form, Input, Button } from 'antd'
import MappingEditor from './mapping-table'
import AttrsForm from './attrs-form'

export default function NodeEditor({ node_id, nodeEditorOpen, setNodeEditorOpen, getNodeData, updateNodeData }) {
  const [ width, setWidth ] = useState(350)

  const onchange = (key : any) => {
    console.log(key)
    switch (key) {
      case '1': 
        setWidth(350)
        break
      case '2':
        setWidth(600)
        break
      case '3':
        setWidth(500)
        break
    }
  }

  return (
    <>
      <Drawer title={"Basic Drawer"} forceRender open={nodeEditorOpen} onClose={() => setNodeEditorOpen(false)} width={width}>
        <Tabs defaultActiveKey="1" items={[
          {
            key: '1',
            label: 'Attrs',
            children: <AttrsForm node_id={node_id} setNodeEditorOpen={setNodeEditorOpen} getNodeData={getNodeData} updateNodeData={updateNodeData} />,
          },
          {
            key: '2',
            label: 'Mappings',
            children: <MappingEditor />,
          },
          {
            key: '3',
            label: 'IRQs',
            children: 'Irq Table',
          },
        ]} onChange={onchange}/>
        
      </Drawer>
    </>
  )
}