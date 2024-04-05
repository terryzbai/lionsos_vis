import React, { useContext, useEffect, useRef, useState } from 'react'
import type { GetRef } from 'antd'
import { Typography, Checkbox, TableProps, Form, Input, InputNumber, Table, Radio } from 'antd'
import { SysMap } from '../utils/element'

const originData: SysMap[] = []
for (let i = 0; i < 10; i++) {
  originData.push({
    key: i.toString(),
    mr: `Edward ${i}`,
    vaddr: 32,
    perms: `rw`,
    cached: true,
    setvar_vaddr: `var0`
  })
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean
  dataIndex: string
  title: any
  inputType: 'number' | 'text' | 'boolean'
  record: SysMap
  index: number
  children: React.ReactNode
}

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const perm_options = ['r', 'w', 'x']

  const inputNodes = {
    'number': <InputNumber />,
    'string': <Input />,
    'boolean': <Checkbox />,
    'multichoice': <Checkbox.Group options={perm_options}/>
  }
  const inputNode = inputNodes[inputType]

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
          valuePropName={inputType === 'boolean' ? 'checked' : 'value'}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  )
}

export default function MappingTable() {
  const [form] = Form.useForm()
  const [data, setData] = useState(originData)
  const [editingKey, setEditingKey] = useState('')

  const isEditing = (record: SysMap) => record.key === editingKey

  const edit = (record: Partial<SysMap> & { key: React.Key }) => {
    form.setFieldsValue({ name: '', age: '', address: '', ...record });
    setEditingKey(record.key)
  }

  const cancel = () => {
    setEditingKey('')
  }

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as SysMap

      const newData = [...data]
      console.log(newData)
      const index = newData.findIndex((item) => key === item.key)
      if (index > -1) {
        const item = newData[index]
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setData(newData)
        setEditingKey('')
      } else {
        newData.push(row)
        setData(newData)
        setEditingKey('')
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo)
    }
  }

  const columns = [
    {
      title: 'mr',
      dataIndex: 'mr',
      width: '25%',
      editable: true,
      dataType: 'string',
    },
    {
      title: 'perms',
      dataIndex: 'perms',
      width: '15%',
      editable: true,
      dataType: 'multichoice',
    },
    {
      title: 'vaddr',
      dataIndex: 'vaddr',
      width: '10%',
      editable: true,
      dataType: 'number',
    },
    {
      title: 'setvar_vaddr',
      dataIndex: 'setvar_vaddr',
      width: '20%',
      editable: true,
      dataType: 'string',
    },
    {
      title: 'cached',
      dataIndex: 'cached',
      width: '5%',
      editable: true,
      dataType: 'boolean',
      render: (_: any, record: SysMap) => {
        return <Checkbox defaultChecked={record.cached} disabled={true} />
      }
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      render: (_: any, record: SysMap) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link onClick={() => save(record.key)} style={{ marginRight: 8 }}>
              Save
            </Typography.Link>
            <Typography.Link onClick={cancel}>
              Cancel
            </Typography.Link>
          </span>
        ) : (
          <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
            Edit
          </Typography.Link>
        )
      },
    },
  ]

  const mergedColumns: TableProps['columns'] = columns.map((col) => {
    if (!col.editable) {
      return col
    }
    return {
      ...col,
      onCell: (record: SysMap) => ({
        record,
        inputType: col.dataType,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    }
  })

  return (
    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={data}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={{
          onChange: cancel,
        }}
      />
    </Form>
  )
}
