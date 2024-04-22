import React, { useEffect, useState, useRef } from 'react'
import { Popover, Modal, Form, Input, InputNumber, Button } from 'antd'
import '../App.css'

interface DragStatus {
  op : null | "left" | "middle" | "right"
  startX : number
  startLeft : number
  startWidth : number
  indexOfMR : number | null
  rangeLimit : { min : number, max : number}
}

interface FreeMRStatus {
  phys_addr : number
  size : number
  visibility : "visible" | "hidden"
}

export default function MemoryManager({MRs, setMRs, getNodeData }) {
  const [ freeMRStatus, setFreeMRStatus ] = useState<FreeMRStatus>({
    phys_addr: 0,
    size: 0,
    visibility: "hidden"
  })
  const refMRContainer = React.createRef<HTMLDivElement>()
  const [ indexOfMR, setIndexOfMR ] = useState<number | null>(null)
  const [ form ] = Form.useForm(null)
  const [ editorOpen, _setEditorOpen ] = useState<boolean>(false)
  const [ widthOfMRBar, setWidthOfMRBar ] = useState<number>(0)
  const myStateRef = useRef(editorOpen)
  const maxPhyAddr = 4294967296
  const setEditorOpen = data => {
    myStateRef.current = data
    _setEditorOpen(data)
  }

  const dragStatus : DragStatus = {
    op: null,
    startX: 0,
    startLeft: 0,
    startWidth: 0,
    indexOfMR: null,
    rangeLimit: null
  }

  const selectMR = (e, i : number) => {
    removeSelection()
    dragStatus.indexOfMR = i
    setIndexOfMR(i)
  }

  const removeSelection = () => {
    if (myStateRef.current) return

    dragStatus.indexOfMR = null
    setIndexOfMR(null)
  }

  const getRangeLimit = (targetX : number) => {
    const range_limit = {
      min: 0,
      max: 99999
    }

    MRs.map(mr => {
      if (mr.phys_addr <= targetX && mr.phys_addr + mr.size >= targetX) return

      if (mr.phys_addr > targetX && mr.phys_addr + mr.size < range_limit.max) {
        range_limit.max = mr.phys_addr
      }
      if (mr.phys_addr < targetX && mr.phys_addr + mr.size > range_limit.min) {
        range_limit.min = mr.phys_addr + mr.size
      }
    })

    return range_limit
  }

  const displayAvailableMR = (e, index : number | null) => {
    if (index != null) return
    if (indexOfMR != null) return

    if (e.target.classList.contains("mem-bar")) {
      const rangeLimit = getRangeLimit(e.nativeEvent.offsetX)
      const phys_addr = Math.max(e.nativeEvent.offsetX - 40, rangeLimit.min)
      setFreeMRStatus({
        visibility: "visible",
        phys_addr: phys_addr,
        size: Math.min(rangeLimit.max - phys_addr, 100)
      })
    }
  }

  const hideAvailableMR = () => {
    setFreeMRStatus({
      phys_addr: 0,
      visibility: "hidden",
      size: 0
    })
  }
  
  const createMR = () => {
    setMRs([...MRs, {name: 'Untitled', phys_addr: freeMRStatus.phys_addr, size: freeMRStatus.size, page_size: 1, page_count: null, nodes: []}])
    console.log("create MR", MRs)
    hideAvailableMR()
  }

  const editMR = () => {
    console.log("edit MR", form.getFieldsValue())
    setMRs(oldMRs => {
      const newMRs = oldMRs.map((MR, index) => {
        if (index === indexOfMR) {
          return form.getFieldsValue()
        }
        return MR
      })
      return newMRs
    })
  }

  const startDrag = (e, i : number) => {
    if (i !== indexOfMR) return

    const this_mr = e.target

    dragStatus.indexOfMR = i
    dragStatus.startX = e.clientX
    dragStatus.startLeft = MRs[i].phys_addr
    dragStatus.rangeLimit = getRangeLimit(MRs[i].phys_addr + 1)
    dragStatus.startWidth = MRs[i].size

    const BORDER_SIZE = 5
    const relative_x = e.nativeEvent.offsetX

    if (relative_x > parseFloat(this_mr.style.width) - BORDER_SIZE) {
      dragStatus.op = "right"
      document.documentElement.style.cursor = 'ew-resize'
    } else if (relative_x < BORDER_SIZE) {
      dragStatus.op = "left"
      document.documentElement.style.cursor = 'ew-resize'
    } else {
      dragStatus.op = "middle"
      document.documentElement.style.cursor = 'grab'
    }

    document.addEventListener('mousemove', handleDrag)
    document.addEventListener('mouseup', endDrag, { once: true })
  }

  // Handle dragging
  const handleDrag = (e) => {
    const currentMR = MRs[dragStatus.indexOfMR]
    if (dragStatus.op === "middle") {
      const newphys_addr = Math.min(
        Math.max(e.clientX - dragStatus.startX + dragStatus.startLeft, dragStatus.rangeLimit.min),
        dragStatus.rangeLimit.max - currentMR.size
      )
      setMRs(oldMRs => {
        const newMRs = oldMRs.map((MR, index) => {
          if (index === dragStatus.indexOfMR) {
            return {...MR, phys_addr: newphys_addr}
          }
          return MR
        })
        return newMRs
      })
    } else if (dragStatus.op === "left") {
      const newphys_addr = Math.min(
        Math.max(e.clientX - dragStatus.startX + dragStatus.startLeft, dragStatus.rangeLimit.min),
        currentMR.phys_addr + currentMR.size - currentMR.page_size
      )
      const newSize = currentMR.phys_addr + currentMR.size - newphys_addr
      setMRs(oldMRs => {
        const newMRs = oldMRs.map((MR, index) => {
          if (index === dragStatus.indexOfMR) {
            return {...MR, phys_addr: newphys_addr, size: newSize}
          }
          return MR
        })
        return newMRs
      })
    } else if (dragStatus.op === "right") {
      const newSize = Math.min(
        Math.max(e.clientX - dragStatus.startX + dragStatus.startWidth, currentMR.page_size),
        dragStatus.rangeLimit.max - currentMR.phys_addr
      )
      setMRs(oldMRs => {
        const newMRs = oldMRs.map((MR, index) => {
          if (index === dragStatus.indexOfMR) {
            return {...MR, size: newSize}
          }
          return MR
        })
        return newMRs
      })
    }
  }

  // End dragging
  const endDrag = () => {
    dragStatus.op = null
    dragStatus.indexOfMR = null

    document.removeEventListener("mousemove", handleDrag, false)
    document.documentElement.style.cursor = 'auto'
  }

  const backgroundColor = (MR) => {
    if (MR.nodes?.length === 0) return ''
    if (MR.nodes?.length === 1) {
      return getNodeData(MR.nodes[0])?.color
    }
    return '#FFFFFF'
  }

  const popoverContent = (MR) => {
    return (
      <>
      Addr: {MR.phys_addr} - {MR.phys_addr + MR.size}
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

  const getMRClassNames = (num_mappings) => {
    if (num_mappings == null) return 'unallocated-mr'
    if (num_mappings === 1) return 'allocated-mr'
    if (num_mappings === 0) return 'unallocated-mr'
    if (num_mappings > 1) return 'shared-mr'
  }

  const deleteMR = () => {
    MRs.splice(indexOfMR, 1)
    setEditorOpen(false)
  }

  const getWidth = (paddr : number) => {
    // console.log(paddr, widthOfMRBar, 4096 / maxPhyAddr)
    return paddr
  }

  const resizeWindow = () => {
    setWidthOfMRBar(refMRContainer.current?.clientWidth)
  }

  useEffect(() => {
    document.addEventListener('mousedown', removeSelection)
    window.addEventListener('resize', resizeWindow)
    resizeWindow()
  }, [])
  
  useEffect(() => {
    form.setFieldsValue(MRs[indexOfMR])
  })

  return (
    <div className='mem-bar' onMouseMove={(e) => displayAvailableMR(e, dragStatus.indexOfMR)} onMouseLeave={hideAvailableMR} ref={refMRContainer}>
      {MRs.map((MR, i) => {
        return (
          <Popover placement="bottom" title={MR.name} content={popoverContent(MR)} key={i}>
            <div 
              className={getMRClassNames(MR.nodes?.length) + (i === indexOfMR ? ' selected-mr' : '')}
              style={ {width: getWidth(MR.size) + 'px', left: MR.phys_addr, backgroundColor: backgroundColor(MR) } } 
              onMouseEnter={hideAvailableMR}
              onMouseDown={(e) => {e.stopPropagation();startDrag(e, i)}}
              onClick={(e) => {selectMR(e, i)}}
              onDoubleClick={() => {setEditorOpen(true)}}
              key={i}
              >
              </div>
          </Popover>
        )
      })}
      <div
        className='free-mr'
        style={ {width: freeMRStatus.size + 'px', left: freeMRStatus.phys_addr + 'px', visibility: freeMRStatus.visibility} }
        onDoubleClick={createMR}
      >DblClick to new</div>
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
          onFinish={editMR}
          // onFinishFailed={onFinishFailed}
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
            <InputNumber min={1} max={256} />
          </Form.Item>
          <Form.Item
            label="phys_addr"
            name="phys_addr"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={256} />
          </Form.Item>
          <Form.Item
            label="page_size"
            name="page_size"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={256} />
          </Form.Item>
          <Form.Item
            label="page_count"
            name="page_count"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={256} />
          </Form.Item>
          <Button htmlType="button" type='primary' danger onClick={deleteMR}>
            Delete
          </Button>
        </Form>
      </Modal>
    </div>
  )
}