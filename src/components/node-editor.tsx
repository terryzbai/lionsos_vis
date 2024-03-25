// import React, { useState } from 'react';
import { Drawer } from 'antd'
import { useState } from 'react'
import { InputNumber, Form, Input, Button } from 'antd'
import { useAppSelector, useAppDispatch } from '../app/hooks'
import { PDState, updateNode, getCurrentPD, closeNodeEditor, getNodeEditorStatus } from '../features/configSlice'
/*
TODO:
[ ] form layout and data bindings
[ ] update data to parent component
*/

export default function NodeEditor() {

  const [priority, setPriority] = useState<string | number | null>('1')

  const dispatch = useAppDispatch()
  const pd_data : PDState = useAppSelector(getCurrentPD)
  const nodeEditorVisible : boolean = useAppSelector(getNodeEditorStatus)

  const saveNodeINfo = (data : PDState) => {
    dispatch(closeNodeEditor())
    console.log(data)
    dispatch(updateNode(data))
  }

  return (
    <>
      <Drawer title={pd_data ? pd_data.name : "Basic Drawer"} onClose={() => dispatch(closeNodeEditor())} open={nodeEditorVisible}>
        <Form
          name="basic"
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          // initialValues={{ remember: true }}
          layout="vertical"
          onFinish={saveNodeINfo}
          // onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="id"
            name="id"
            hidden={true}
            initialValue={ pd_data?.id }
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true }]}
            initialValue={ pd_data?.name }
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Priority"
            name="priority"
            rules={[{ required: true, message: 'Please input your username!' }]}
            initialValue={ pd_data?.priority }
          >
            <InputNumber min={1} max={256} value={priority} onChange={setPriority} />
          </Form.Item>
          <Form.Item
            label="Budget"
            name="budget"
            rules={[{ required: false }]}
            initialValue={ pd_data?.budget }
          >
            <InputNumber min={1} max={256} value={priority} onChange={setPriority} />
          </Form.Item>
          <Form.Item
            label="Period"
            name="period"
            rules={[{ required: false }]}
            initialValue={ pd_data?.period }
          >
            <InputNumber min={1} max={256} value={priority} onChange={setPriority} />
          </Form.Item>
          <Form.Item
            label="pp"
            name="pp"
            rules={[{ required: false }]}
            initialValue={ pd_data?.pp }
          >
            <InputNumber min={1} max={256} value={priority} onChange={setPriority} />
          </Form.Item>
          <Form.Item
            label="Program Image"
            name="progimg"
            rules={[{ required: false }]}
            initialValue={ pd_data?.prog_img }
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
        <p>maps</p>
        <p>maps</p>
        <p>maps</p>
        <p>maps</p>

      </Drawer>
    </>
  )
}

// export default ComponentDrawer