import React, { useEffect, useState, useRef } from 'react'
import { Popover, Modal, Form, Input, InputNumber, Button, Select } from 'antd'
import { getComponentByID } from '../utils/helper'
import '../App.css'

export interface MemoryRegion {
	name: string
	size: number
	phys_addr: number
	page_size?: number
	page_count?: number
	nodes: string[]
}

const { Option } = Select

interface DragStatus {
  op : null | "left" | "middle" | "right"
  startX : number
  startLeft : number
  startPhyAddr : number
  startWidth : number
  indexOfMR : number | null
  rangeLimit : { min : number, max : number}
}

interface FreeMRStatus {
  phys_addr : number
  size : number
  visibility : "visible" | "hidden"
}

const maxPhyAddr = 0xffffffff

export default function MemoryManager({MRs, setMRs, getNodeData, graph }) {
  const [ freeMRStatus, setFreeMRStatus ] = useState<FreeMRStatus>({
    phys_addr: 0,
    size: 0,
    visibility: "hidden"
  })
  const refMRContainer = React.createRef<HTMLDivElement>()
  const [ form ] = Form.useForm(null)
  const [ indexOfMR, setIndexOfMR ] = useState<number | null>(null)
  const [ editorOpen, setEditorOpen ] = useState<boolean>(false)
  const [ MRWithAttrs, setMRWithAttrs ] = useState<Array<MemoryRegion & {type: string, index: number}>>([])
  const [ MRWidth, setMRWidth ] = useState<number>(0)
  const [ physAddr, setPhysAddr ] = useState<string>('')
  const [ sizeUnit, setSizeUnit ] = useState('1')
  const sizeUnits = (
    <Select value={sizeUnit} onChange={setSizeUnit} style={{ width: 100 }}>
      <Option value="11073741824">GB</Option>
      <Option value="1048576">MB</Option>
      <Option value="1024">KB</Option>
      <Option value="1">Byte</Option>
    </Select>
  )

  const updateAttrValues = () => {
    if (MRs == null) return

    MRs.sort((a, b) => a.phys_addr - b.phys_addr);

    var index = 0
    var last_phys_addr = 0
    var tempMRWithAttrs = []
    var type = ''
    const free_mr = {
      name: '',
      size: 0,
      phys_addr: 0,
      nodes: [],
      type: 'free-mr',
      index: -1,
    }
    MRs.forEach(MR => {
      if (last_phys_addr != MR.phys_addr) {
        tempMRWithAttrs.push({...free_mr, phys_addr: last_phys_addr, size: MR.phys_addr - last_phys_addr})
      }
      if (MR.nodes.length === 1) type = 'allocated-mr'
      if (MR.nodes.length === 0) type = 'unallocated-mr'
      if (MR.nodes.length > 1) type = 'shared-mr'
      last_phys_addr = MR.phys_addr + MR.size
      tempMRWithAttrs.push({...MR, type: type, index: index})
      index += 1
    })
    if (maxPhyAddr != last_phys_addr) {
      tempMRWithAttrs.push({...free_mr, phys_addr: last_phys_addr, size: maxPhyAddr - last_phys_addr})
    }
    setMRWithAttrs(tempMRWithAttrs)
    const bar_width = refMRContainer.current?.clientWidth
    setMRWidth(bar_width / tempMRWithAttrs.length)
  }

  const popoverContent = (MR) => {
    return (
      <>
      Addr: {'0x' + MR.phys_addr.toString(16)} - {'0x' + (MR.phys_addr + MR.size).toString(16)}
      {MR.nodes?.map(node_id => {
        const node_data = getNodeData(node_id)
        return (
          <div key={node_id}>
            {node_data?.attrs.name}
          </div>
        )
      })}
      </>
    )
  }

  const selectMR = (MR) => {
    const i = MR.index
    if (i < 0) {
      setMRs([...MRs, {name: 'Untitled', phys_addr: MR.phys_addr, size: MR.size, page_size: MR.page_size, page_count: null, nodes: []}])
      const prev_mr = MRWithAttrs.find(item => item.phys_addr + item.size == MR.phys_addr)
      setIndexOfMR(prev_mr ? prev_mr.index + 1 : 0)
      console.log("set index to", prev_mr)
    } else {
      setIndexOfMR(i)
    }
    const display_value = '0x' + (MR.phys_addr).toString(16)
    setPhysAddr(display_value)
    updateAttrValues()

    setEditorOpen(true)
  }

  const editMR = () => {
    // TODO: fix invalid modification, e.g. overlapped with over MRs
    setMRs(oldMRs => {
      const newMRs = oldMRs.map((MR, index) => {
        if (index === indexOfMR) {
          const values = form.getFieldsValue()
          return {...MR, ...values, phys_addr: parseInt(physAddr, 16), size: values.size * parseInt(sizeUnit)}
        }
        return MR
      })
      return newMRs
    })
  }

  const getMRClassNames = (num_mappings) => {
    if (num_mappings == null) return 'unallocated-mr'
    if (num_mappings === 1) return 'allocated-mr'
    if (num_mappings === 0) return 'unallocated-mr'
    if (num_mappings > 1) return 'shared-mr'
  }

  const updatePhysAddr = (value) => {
    setPhysAddr(value)
  }

  useEffect(() => {
    form.setFieldsValue(MRs[indexOfMR])
    form.setFieldValue('size', MRs[indexOfMR]?.size / parseInt(sizeUnit))
  })

  useEffect(() => {
    updateAttrValues()
  }, [MRs])

  useEffect(() => {
    const size = MRs[indexOfMR]?.size
    if (size % (1 << 30) === 0) {
      setSizeUnit((1 << 30).toString())
    } else if (size % (1 << 20) === 0) {
      setSizeUnit((1 << 20).toString())
    } else if (size % (1 << 10) === 0) {
      setSizeUnit((1 << 10).toString())
    } else {
      setSizeUnit((1).toString())
    }
  }, [editorOpen])

  return (
    <div className='mem-bar' ref={refMRContainer}>
      {MRWithAttrs.map((MR, i) => {
        return (
          <Popover placement="bottom" title={MR.name} content={popoverContent(MR)} key={i}>
            <div
              className={'memory-region ' + MR.type}
              style={ {width: MRWidth + 'px', left: i * MRWidth + 'px' } }
              onDoubleClick={() => {selectMR(MR);}}
              key={i}
              >
            </div>
          </Popover>
        )
      })}
      <Modal
        title="Edit memory region"
        centered
        open={editorOpen}
        forceRender
        onOk={(e) => {e.stopPropagation();setEditorOpen(false);editMR()}}
        onCancel={(e) => {e.stopPropagation();setEditorOpen(false)}}
      >
        <Form
          name="mr-manager"
          form={ form }
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={ MRs[indexOfMR] }
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            label="name"
            name="name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="size"
            name="size"
            rules={[{ required: true }]}
          >
            <Input addonAfter={sizeUnits} />
          </Form.Item>
          <Form.Item
            label="phys_addr"
            rules={[{ required: true }]}
          >
            <Input onChange={e => {updatePhysAddr(e.target.value)}} value={physAddr}/>
          </Form.Item>
          <Form.Item
            label="page_size"
            name="page_size"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item
            label="page_count"
            name="page_count"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={256} />
          </Form.Item>
          <Button htmlType="button" type='primary' danger>
            Delete
          </Button>
        </Form>
      </Modal>
    </div>
  )
}
