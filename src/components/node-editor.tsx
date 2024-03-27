// import React, { useState } from 'react';
import { Drawer } from 'antd'
import { useEffect } from 'react'
import { InputNumber, Form, Input, Button } from 'antd'
import { useAppSelector, useAppDispatch } from '../app/hooks'
import { PDState, updateNode, getCurrentPD, closeNodeEditor, getNodeEditorStatus } from '../features/configSlice'
/*
TODO:
[ ] form layout and data bindings
[ ] update data to parent component
*/

export default function NodeEditor() {

  // const [ priority, setPriority ] = useState<number | string>('111')

  const dispatch = useAppDispatch()
  const pd_data : PDState = useAppSelector(getCurrentPD)
  const [ form ] = Form.useForm<PDState>(null)
  const nodeEditorVisible : boolean = useAppSelector(getNodeEditorStatus)

  const saveNodeInfo = (data : PDState) => {
    dispatch(closeNodeEditor())
    dispatch(updateNode(data))
  }

  useEffect(() => {
    form.setFieldsValue(pd_data)
  })

  return (
    <>
      <Drawer title={pd_data ? pd_data.name : "Basic Drawer"} forceRender onClose={() => dispatch(closeNodeEditor())} open={nodeEditorVisible}>
        <Form
          name="basic"
          form={ form }
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={ pd_data }
          layout="vertical"
          onFinish={saveNodeInfo}
          // onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="id"
            name="id"
            hidden={true}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Priority"
            name="priority"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <InputNumber min={1} max={256} />
          </Form.Item>
          <Form.Item
            label="Budget"
            name="budget"
            rules={[{ required: false }]}
          >
            <InputNumber min={1} max={256} />
          </Form.Item>
          <Form.Item
            label="Period"
            name="period"
            rules={[{ required: false }]}
          >
            <InputNumber min={1} max={256} />
          </Form.Item>
          <Form.Item
            label="pp"
            name="pp"
            rules={[{ required: false }]}
          >
            <InputNumber min={1} max={256} />
          </Form.Item>
          <Form.Item
            label="Program Image"
            name="prog_img"
            rules={[{ required: false }]}
          >
            <Input />
          </Form.Item>
          <Button htmlType="submit" type="primary">
            Save
          </Button>
          <Button htmlType="button" style={{ margin: '0 8px' }} onClick={() => dispatch(closeNodeEditor())}>
            Cancel
          </Button>
        </Form>
        <p>maps</p>
        <p>maps</p>
        <p>maps</p>
        <p>maps</p>
        <p>maps</p>
        <p>maps</p>
      </Drawer>
    </>
  )
}

// export default ComponentDrawer