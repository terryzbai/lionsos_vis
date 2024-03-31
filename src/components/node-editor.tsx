import { Drawer } from 'antd'
import { useEffect } from 'react'
import { InputNumber, Form, Input, Button } from 'antd'
import { closeNodeEditor } from '../features/configSlice'

export default function NodeEditor({ node_id, nodeEditorOpen, setNodeEditorOpen, getNodeData, updateNodeData }) {

  const node_data = getNodeData(node_id)
  const node_attrs = node_data?.attrs
  const [ form ] = Form.useForm(null)

  useEffect(() => {
    form.setFieldsValue(node_attrs)
  })

  return (
    <>
      <Drawer title={"Basic Drawer"} forceRender open={nodeEditorOpen} onClose={() => setNodeEditorOpen(false)}>
        <p>{node_id}</p>
        <Form
          name="basic"
          form={ form }
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={ node_attrs }
          layout="vertical"
          // onFinish={updateNodeData}
          // onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true }]}
            hidden={ node_attrs && !('name' in node_attrs) }
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="ID"
            name="id"
            hidden={ node_attrs && !('id' in node_attrs) }
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Priority"
            name="priority"
            hidden={ node_attrs && !('priority' in node_attrs) }
            rules={[{ required: false }]}
          >
            <InputNumber min={1} max={256} />
          </Form.Item>
          <Form.Item
            label="Budget"
            name="budget"
            hidden={ node_attrs && !('budget' in node_attrs) }
            rules={[{ required: false }]}
          >
            <InputNumber min={1} max={256} />
          </Form.Item>
          <Form.Item
            label="Period"
            name="period"
            hidden={ !(node_attrs?.period) }
            rules={[{ required: false }]}
          >
            <InputNumber min={1} max={256} />
          </Form.Item>
          <Form.Item
            label="pp"
            name="pp"
            hidden={ node_attrs && !('pp' in node_attrs) }
            rules={[{ required: false }]}
          >
            <InputNumber min={1} max={256} />
          </Form.Item>
          <Form.Item
            label="Program Image"
            name="prog_img"
            hidden={ node_attrs && !('prog_img' in node_attrs) }
            rules={[{ required: false }]}
          >
            <Input />
          </Form.Item>
          <Button htmlType="submit" type="primary">
            Save
          </Button>
          <Button htmlType="button" style={{ margin: '0 8px' }} onClick={() => setNodeEditorOpen(false)}>
            Cancel
          </Button>
        </Form>
      </Drawer>
    </>
  )
}

// export default ComponentDrawer