import { Drawer, Tabs } from 'antd'
import { useEffect } from 'react'
import { InputNumber, Form, Input, Button } from 'antd'
import MappingEditor from './mapping-table'
import AttrsForm from './attrs-form'

export default function NodeEditor({ node_id, nodeEditorOpen, setNodeEditorOpen, getNodeData, updateNodeData }) {

  // const node_data = getNodeData(node_id)
  // const node_attrs = node_data?.attrs
  // const [ form ] = Form.useForm(null)

  // const saveNodeData = (data : any) => {
  //   let new_data = {...node_attrs}

  //   Object.keys(new_data).forEach(key => {
  //     new_data[key] = data[key]
  //   })

  //   updateNodeData(node_id, {
  //     attrs: new_data,
  //     mappings: ['test1', 'test2'],
  //     irqs: ['test5'],
  //   })

  //   setNodeEditorOpen(false)
  // }

  // useEffect(() => {
  //   form.setFieldsValue(node_attrs)
  // })

  return (
    <>
      <Drawer title={"Basic Drawer"} forceRender open={nodeEditorOpen} onClose={() => setNodeEditorOpen(false)}>
        <Tabs defaultActiveKey="1" items={[
          {
            key: '1',
            label: 'AttrsForm',
            children: <AttrsForm node_id={node_id} setNodeEditorOpen={setNodeEditorOpen} getNodeData={getNodeData} updateNodeData={updateNodeData} />,
          },
          {
            key: '2',
            label: 'MappingTable',
            children: 'Mapping Table',
          },
          {
            key: '3',
            label: 'IrqTable',
            children: 'Irq Table',
          },
        ]} />
        
      </Drawer>
    </>
  )
}