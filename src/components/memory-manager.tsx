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
  const [ editorOpen, _setEditorOpen ] = useState<boolean>(false)
  const [ MRWithAttrs, setMRWithAttrs ] = useState<Array<MemoryRegion & {type: string, index: number}>>([])
  const [ MRWidth, setMRWidth ] = useState<number>(0)

  const [ sizeUnit, setSizeUnit ] = useState('1')
  const sizeUnits = (
    <Select value={sizeUnit} onChange={setSizeUnit}>
      <Option value="11073741824">GB</Option>
      <Option value="1048576">MB</Option>
      <Option value="1024">KB</Option>
      <Option value="1">Byte</Option>
    </Select>
  )

  const updateAttrValues = () => {
    if (MRs == null) return

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
    console.log(bar_width / tempMRWithAttrs.length)
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

  const selectMR = (e, i : number) => {
    // removeSelection()
    // dragStatus.indexOfMR = i
    // setIndexOfMR(i)
  }

  const createMR = () => {
    setMRs([...MRs, {name: 'Untitled', phys_addr: freeMRStatus.phys_addr, size: freeMRStatus.size, page_size: 1, page_count: null, nodes: []}])
    console.log("create MR", MRs)
    // hideAvailableMR()
  }

  const getMRClassNames = (num_mappings) => {
    if (num_mappings == null) return 'unallocated-mr'
    if (num_mappings === 1) return 'allocated-mr'
    if (num_mappings === 0) return 'unallocated-mr'
    if (num_mappings > 1) return 'shared-mr'
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
              onClick={(e) => {selectMR(e, i)}}
              onDoubleClick={() => {_setEditorOpen(true)}}
              key={i}
              >
            </div>
          </Popover>
        )
      })}
    </div>
  )
}
