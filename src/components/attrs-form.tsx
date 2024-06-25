import { useEffect } from 'react'
import { InputNumber, Form, Input, Button, Checkbox } from 'antd'

const getFormItem = (attr) => {
  const inputType = attr?.type
  const attrName = attr?.name

  const inputNodes = {
    'number': <InputNumber min={attr?.min} max={attr?.max} />,
    'boolean': <Checkbox />,
    'string': <Input />
  }
  const inputNode = inputNodes[inputType]

  return (
    <Form.Item
      label={attrName}
      name={attrName}
      rules={[{ required: attr?.required }]}
      valuePropName={inputType === 'boolean' ? 'checked' : 'value'}
      key={attrName}
    >
      {inputNode}
    </Form.Item>
  )
}

export default function AttrsForm({ node_id, setNodeEditorOpen, getNodeData, updateNodeData }) {
  const node_data = getNodeData(node_id)
  const node_attrs = node_data?.attrs
  const [ form ] = Form.useForm(null)

  const saveNodeData = (data : any) => {
    let new_data = {...node_attrs}

    Object.keys(new_data).forEach(key => {
      new_data[key] = data[key]
    })

    updateNodeData(node_id, {
      attrs: new_data
    })

    setNodeEditorOpen(false)
  }

  useEffect(() => {
    form.setFieldsValue(node_attrs)
  })

  return (
    <>
      <div style={ {width: '50%', height: '10px', margin: '10px', backgroundColor: node_data?.color}}></div>  
      <Form
        name="basic"
        form={ form }
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={ node_attrs }
        layout="vertical"
        onFinish={saveNodeData}
        // onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        {node_data?.editable_attrs.map(attr => {
          return getFormItem(attr)
        })}
        {/* <Form.Item
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
          valuePropName="checked"
          hidden={ node_attrs && !('pp' in node_attrs) }
          rules={[{ required: false }]}
        >
          <Checkbox />
        </Form.Item>
        <Form.Item
          label="Program Image"
          name="prog_img"
          hidden={ node_attrs && !('prog_img' in node_attrs) }
          rules={[{ required: false }]}
        >
          <Input />
        </Form.Item> */}
        <Button htmlType="submit" type="primary">
          Save
        </Button>
        <Button htmlType="button" style={{ margin: '0 8px' }} onClick={() => setNodeEditorOpen(false)}>
          Cancel
        </Button>
      </Form>
    </>
  )
}