import React, { useContext, useEffect, useRef, useState } from 'react'
import { Typography, Checkbox, TableProps, Form, Select, InputNumber, Table, Button, Input } from 'antd'

export interface SysIrq {
	irq: number
	id_: number
	trigger: "edge" | "level"
}

interface SysIrqItem extends SysIrq {
    key: string
    irq_label: string
}

export default function IrqTable() {
  const [ form ] = Form.useForm()
  const [ devices, setDevices ] = useState([])
  const [ data, setData ] = useState([])
  const [ editingKey, setEditingKey ] = useState('')
  const isEditing = (record: SysIrqItem) => record.key === editingKey

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
    const trigger_options = ['edge', 'level']
    const trigger_option_items = trigger_options.map(trigger => {
      return {value: trigger, label: trigger}
    })
    const irq_options = ['serial-32']
    const irq_option_items = irq_options.map(option => {
      const irq = option.split('-')
      return {value: irq[1], label: option}
    })

    const filterOption = (input: string, option?: { label: string; value: string }) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())

    const inputNodes = {
      'irq': <Select
              showSearch
        placeholder="Select a person"
        optionFilterProp="children"
        filterOption={filterOption}
        options={irq_option_items} />,
      'id': <InputNumber />,
      'trigger': <Select
        showSearch
        placeholder="Select a person"
        optionFilterProp="children"
        filterOption={filterOption}
        options={trigger_option_items} />,
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

  const columns = [
    {
      title: 'irq_label',
      dataIndex: 'irq_label',
      width: '40%',
      editable: true,
      dataType: 'irq',
    },
    {
      title: 'id',
      dataIndex: 'id_',
      width: '20%',
      editable: true,
      dataType: 'id',
    },
    {
      title: 'trigger',
      dataIndex: 'trigger',
      width: '15%',
      editable: true,
      dataType: 'trigger',
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      render: (_: any, record: SysIrqItem) => {
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
          <span>
          <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)} style={{ marginRight: 8 }}>
            Edit
          </Typography.Link>
          <Typography.Link disabled={editingKey !== ''} onClick={() => deleteIrq(record.key)}>
            Delete
          </Typography.Link>
          </span>
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
      onCell: (record: SysIrqItem) => ({
        record,
        inputType: col.dataType,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    }
  })

  const edit = (record: Partial<SysIrqItem> & { key: React.Key }) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key)
  }

  const cancel = () => {
    setEditingKey('')
  }

  const syncNodeData = () => {}

  const handleAdd = () => {
    const newData: SysIrqItem = {
      key: data ? data.length.toString() : '0',
      irq: 1,
      id_: 1,
      trigger: 'level',
      irq_label: 'serial-32'
    }

    setData([...data, newData])
    // TODO: update irqs for component
    syncNodeData()
  }

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as SysIrqItem

      const newData = [...data]
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

      // syncNodeData()
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo)
    }
  }

  const deleteIrq = (key: React.Key) => {
    const newData = data.filter((item) => item.key !== key)
    setData(newData)
    syncNodeData()
  };

  useEffect(() => {
    // TODO: fetch available devides and irq numbers
  })

  return (
    <div>
      <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
        Add an IRQ
      </Button>
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
    </div>
  )
}
