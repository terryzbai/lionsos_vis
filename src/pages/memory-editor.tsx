import React, { useContext, useEffect, useRef, useState } from 'react'
import { Typography, Checkbox, TableProps, Form, Select, InputNumber, Table, Button, Input } from 'antd'
import { SysMap } from '../utils/element'

interface MemoryRegion {
  name: string
  size: number
  phys_addr: number
  page_size?: number
  page_count?: number
  nodes: string[]
}

interface MemoryRegionItem extends MemoryRegion {
  key: string
  size_str: string
  phys_addr_str: string
}

type IsOptional<T, K extends keyof T> = {} extends Pick<T, K> ? true : false;

export const MemoryEditor = ({ MRs, setMRs }) => {
  const [form] = Form.useForm()
  const [editingKey, setEditingKey] = useState('')
  const [data, setData] = useState<MemoryRegionItem[]>(null)
  const isEditing = (record: MemoryRegionItem) => record.key === editingKey

  const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    required,
    record,
    index,
    children,
    ...restProps
  }) => {
    const perm_options = ['r', 'w', 'x']

    const page_size_options = [
      { label: "small", value: 0 },
      { label: "medium", value: 1 },
      { label: "large", value: 2 },
    ]

    const inputNodes = {
      'number': <InputNumber />,
      'select': <Select
        showSearch
        placeholder="Default page size"
        optionFilterProp="children"
        options={page_size_options} />,
      'boolean': <Checkbox />,
      'string': <Input />
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
                required: required,
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

  const edit = (record: Partial<MemoryRegionItem> & { key: React.Key }) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key)
  }

  const deleteMR = (key: React.Key) => {
    const newMRs = [...MRs]
    const index = data.findIndex((item) => key === item.key)
    newMRs.splice(index, 1)
    console.log(newMRs)
    setMRs(newMRs)
  };

  const cancel = () => {
    setEditingKey('')
  }

  const save = async (editing_key: React.Key) => {
    type Test = IsOptional<MemoryRegionItem, 'page_size'>
    try {
      const row = (await form.validateFields()) as MemoryRegionItem

      row.size = parseInt(row.size_str, 16)
      row.phys_addr = parseInt(row.phys_addr_str, 16)

      const { key, phys_addr_str, size_str, ...newMR } = row
      const newMRs = [...MRs]
      const index = data.findIndex((item) => editing_key === item.key)
      if (index > -1) {
        const item = MRs[index]
        newMRs.splice(index, 1, {
          ...item,
          ...newMR,
        })
        setMRs(newMRs)
        setEditingKey('')
      } else {
        newMRs.push(newMR)
        setEditingKey('')
      }

    } catch (errInfo) {
      console.log('Validate Failed:', errInfo)
    }
  }

  const handleAdd = () => {
    const newMR : MemoryRegion = {
      name: `default`,
      size: 0,
      phys_addr: 0,
      page_size: null,
      page_count: null,
      nodes: [],
    }
    setMRs([...MRs, newMR])
  }

  const columns = [
    {
      title: 'name *',
      dataIndex: 'name',
      width: '20%',
      editable: true,
      dataType: 'string',
      required: true,
    },
    {
      title: 'size *',
      dataIndex: 'size_str',
      width: '15%',
      editable: true,
      dataType: 'string',
      required: true,
    },
    {
      title: 'phys_addr *',
      dataIndex: 'phys_addr_str',
      width: '15%',
      editable: true,
      dataType: 'string',
      required: true,
    },
    {
      title: 'page_size',
      dataIndex: 'page_size',
      width: '10%',
      editable: true,
      dataType: 'select',
      required: false,
    },
    {
      title: 'page_count',
      dataIndex: 'page_count',
      width: '10%',
      editable: true,
      dataType: 'number',
      required: false,
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      render: (_: any, record: MemoryRegionItem) => {
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
          <Typography.Link disabled={editingKey !== ''} onClick={() => deleteMR(record.key)}>
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
      onCell: (record: MemoryRegionItem) => ({
        record,
        inputType: col.dataType,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        required: col.required,
      }),
    }
  })

  useEffect(() => {
    console.log("MRs", MRs)
    const newData : MemoryRegionItem[] = MRs.map(MR => {
      return {
        ...MR,
        key: MRs ? MRs.length.toString() : '0',
        phys_addr_str: '0x' + (MR.phys_addr).toString(16),
        size_str: '0x' + (MR.size).toString(16)
      }
    })
    setData(newData)
  }, [MRs])

  return (
    <div>
      <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
        New Memory Region
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
