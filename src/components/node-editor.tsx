import { Drawer, Tabs } from 'antd'
import { useState } from 'react'
import MappingTable from './mapping-table'
import IrqTable from './irq-table'
import { AttrsForm } from './attrs-form'

export default function NodeEditor({ node_id, nodeEditorOpen, setNodeEditorOpen, MRs, component, updateMappings }) {
  const [ width, setWidth ] = useState(350)
  // const data = getNodeData(node_id)
  const data = component?.getData()

  const onchange = (key : any) => {
    switch (key) {
      case '1': 
        setWidth(350)
        break
      case '2':
        setWidth(800)
        break
      case '3':
        setWidth(600)
        break
    }
  }

  return (
    <>
      <Drawer title={data ? data.type + '-' + data.attrs.name : 'Node Editor'} forceRender open={nodeEditorOpen} onClose={() => setNodeEditorOpen(false)} width={width}>
        <Tabs defaultActiveKey="1" items={[
          {
            key: '1',
            label: 'Attrs',
            children: <AttrsForm setNodeEditorOpen={setNodeEditorOpen} component={component} />,
          },
          {
            key: '2',
            label: 'Mappings',
            children: <MappingTable MRs={MRs} component={component} updateMappings={updateMappings} />,
          },
          {
            key: '3',
            label: 'IRQs',
            children: <IrqTable component={component}></IrqTable>,
          },
        ]} onChange={onchange}/>
        
      </Drawer>
    </>
  )
}
