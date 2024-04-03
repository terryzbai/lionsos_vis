import { useEffect, useState, useCallback } from 'react'
import '../App.css'

interface MemoryRegion {
  name : string
  phyAddr : number
  size: number
  pageSize: number
}

interface DragStatus {
  op : null | "left" | "middle" | "right"
  startX : number
  startLeft : number
  indexOfMR : number | null
  rangeLimit : { min : number, max : number}
}

export default function MemoryManager() {
  const [ MRs, setMRs] = useState<Array<MemoryRegion>>([
    {name: 'test1', phyAddr: 0, size: 100, pageSize: 1},
    {name: 'test2', phyAddr: 200, size: 150, pageSize: 1}
  ])
  // const [isDragging, setIsDragging] = useState(false)
  // const [startX, setStartX] = useState(0)
  // const [startLeft, setStartLeft] = useState(0)
  // const [translateX, setTranslateX] = useState(0)
  // const [ MR, setMR ] = useState<MemoryRegion>({name: 'test1', phyAddr: 0, size: 100, pageSize: 1})
  // const [ currentMRIndex, setCurrentMRIndex ] = useState<number | null>(null)
  // const [ op, setOP ] = useState<"null" | "left" | "middle" | "right">("null")

  // let op : null | "left" | "middle" | "right" = null
  // let currentMRIndex : number | null = null

  const dragStatus : DragStatus = {
    op: null,
    startX: 0,
    startLeft: 0,
    indexOfMR: null,
    rangeLimit: null
  }

  const selectMR = (e) => {
    removeSelection()
    e.target.classList.add("selected-mr")
  }

  const removeSelection = () => {
    const mrs = Array.from(document.getElementsByClassName('selected-mr'))
    mrs.map((mr) => {
      mr.classList.remove('selected-mr')
    })
  }

  const getRangeLimit = (indexOfMR : number) => {
    const range_limit = {
      min: 0,
      max: 99999
    }
    const targetMR = MRs[indexOfMR]

    MRs.map((mr, index) => {
      if (index === indexOfMR) return 

      if (mr.phyAddr > targetMR.phyAddr && mr.phyAddr + mr.size < range_limit.max) {
        range_limit.max = mr.phyAddr
      }
      if (mr.phyAddr < targetMR.phyAddr && mr.phyAddr + mr.size > range_limit.min) {
        range_limit.min = mr.phyAddr + mr.size
      }
    })

    return range_limit
  }

  const startDrag = (e, i : number) => {
    const this_mr = e.target

    dragStatus.indexOfMR = i
    dragStatus.startX = e.clientX
    dragStatus.startLeft = MRs[i].phyAddr
    dragStatus.rangeLimit = getRangeLimit(i)

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
    console.log("Handle drag", dragStatus.op)
    if (dragStatus.op === "middle") {
      const diff = e.clientX - dragStatus.startX
      const newPhyAddr = Math.min(
        Math.max(e.clientX - dragStatus.startX + dragStatus.startLeft, dragStatus.rangeLimit.min),
        dragStatus.rangeLimit.max - MRs[dragStatus.indexOfMR].size
      )
      setMRs(oldMRs => {
        const newMRs = oldMRs.map((MR, index) => {
          if (index === dragStatus.indexOfMR) {
            return {...MR, phyAddr: newPhyAddr}
          }
          return MR
        })
        return newMRs
      })
    } else if (dragStatus.op === "left") {
      console.log('left drag')
    } else if (dragStatus.op === "right") {
      console.log('right drag')
    }
  }

  // End dragging
  const endDrag = () => {
    dragStatus.op = null
    dragStatus.indexOfMR = null

    document.removeEventListener("mousemove", handleDrag, false)
    document.documentElement.style.cursor = 'auto'
  }

  useEffect(() => {
    document.addEventListener('mousedown', removeSelection)
  }, [])

  return (
    <div className='mem-bar'>
      {MRs.map((MR, i) => {
          return <div 
          className='mem-region'
          style={ {width: MR.size + 'px', left: MR.phyAddr} } 
          onMouseDown={(e) => {e.stopPropagation();startDrag(e, i)}}
          onClick={selectMR}
          key={i}
          ></div>
      })}
    </div>
  )
}