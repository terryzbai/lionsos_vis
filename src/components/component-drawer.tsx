// import React, { useState } from 'react';
import { Drawer } from 'antd'
import { useState } from 'react'
import { InputNumber, Form, Input, Button } from 'antd'
import { useAppSelector, useAppDispatch } from '../app/hooks'
import { PDState, getPDList, closeNodeEditor, getNodeEditorStatus } from '../features/configSlice'
/*
TODO:
[ ] form layout and data bindings
[ ] update data to parent component
*/

export default function ComponentDrawer() {

  const [priority, setPriority] = useState<string | number | null>('1')

  const dispatch = useAppDispatch()
  const pd_data : PDState = useAppSelector(getPDList)[0]
  const nodeEditorVisible : boolean = useAppSelector(getNodeEditorStatus)

  const updateNode = (data) => {
    dispatch(closeNodeEditor())
    console.log(data)
  }

  return (
    <>
      <Drawer title={pd_data ? pd_data.name : "Basic Drawer"} onClose={() => dispatch(closeNodeEditor())} open={nodeEditorVisible}>
        <p>{pd_data?.name}</p>
        <Form
          name="basic"
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          layout="vertical"
          onFinish={updateNode}
          // onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
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
            <InputNumber min={1} max={256} value={priority} onChange={setPriority} />
          </Form.Item>
          <Form.Item
            label="Budget"
            name="budget"
            rules={[{ required: false }]}
          >
            <InputNumber min={1} max={256} value={priority} onChange={setPriority} />
          </Form.Item>
          <Form.Item
            label="Period"
            name="period"
            rules={[{ required: false }]}
          >
            <InputNumber min={1} max={256} value={priority} onChange={setPriority} />
          </Form.Item>
          <Form.Item
            label="pp"
            name="pp"
            rules={[{ required: false }]}
          >
            <InputNumber min={1} max={256} value={priority} onChange={setPriority} />
          </Form.Item>
          <Form.Item
            label="Program Image"
            name="progimg"
            rules={[{ required: false }]}
          >
            <Input />
          </Form.Item>
          <Button htmlType="submit" type="primary">
            Save
          </Button>
          <Button htmlType="button" style={{ margin: '0 8px' }}>
            Cancel
          </Button>
        </Form>
        <p>maps</p>
        <p>maps</p>
        <p>maps</p>
        <p>maps</p>
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