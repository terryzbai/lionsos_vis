import { useEffect } from 'react'
import { Modal, Form, InputNumber, Input } from 'antd'

export default function ChannelEditor({ channelEditorOpen, setChannelEditorOpen, edge_id, getEdgeData, updateEdgeData, getNodeData }) {
  const [ form ] = Form.useForm(null)
  const data = getEdgeData(edge_id)

  const saveEdge = () => {
    updateEdgeData(edge_id, form.getFieldsValue())
    setChannelEditorOpen(false)
  }

  useEffect(() => {
    form.setFieldsValue(data)
  })

  return (
    <Modal
      title="Edit memory region"
      centered
      open={channelEditorOpen}
      forceRender
      onOk={saveEdge}
      onCancel={(e) => {e.stopPropagation();setChannelEditorOpen(false)}}
    >
      <Form
        name="channel-editor"
        form={ form }
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={ data }
        layout="vertical"
        onFinish={saveEdge}
        // onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label=""
          name="source_node"
          rules={[{ required: true }]}
          hidden={true}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={getNodeData(data?.source_node)?.attrs.name + "-end_id"}
          name="source_end_id"
          rules={[{ required: true }]}
        >
          <InputNumber min={1} max={256} />
        </Form.Item>
        <Form.Item
          label=""
          name="target_node"
          rules={[{ required: true }]}
          hidden={true}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={getNodeData(data?.target_node)?.attrs.name + "-end_id"}
          name="target_end_id"
          rules={[{ required: true }]}
        >
          <InputNumber min={1} max={256} />
        </Form.Item>
      </Form>
    </Modal>
  )
}