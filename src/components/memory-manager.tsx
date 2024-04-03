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
  startWidth : number
  indexOfMR : number | null
  rangeLimit : { min : number, max : number}
}

interface FreeMRStatus {
  phyAddr : number
  size : number
  visibility : "visible" | "hidden"
}

export default function MemoryManager() {
  const [ MRs, setMRs] = useState<Array<MemoryRegion>>([
    {name: 'test1', phyAddr: 0, size: 100, pageSize: 1},
    {name: 'test2', phyAddr: 200, size: 150, pageSize: 1}
  ])
  const [ freeMRStatus, setFreeMRStatus ] = useState<FreeMRStatus>({
    phyAddr: 0,
    size: 0,
    visibility: "hidden"
  })

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
    e.target.classList.add("selected-mr")
    console.log("set", i)
    dragStatus.indexOfMR = i
  }

  const removeSelection = () => {
    const mrs = Array.from(document.getElementsByClassName('selected-mr'))
    mrs.map((mr) => {
      mr.classList.remove('selected-mr')
    })
  }

  const getRangeLimit = (targetX : number) => {
    const range_limit = {
      min: 0,
      max: 99999
    }

    MRs.map(mr => {
      if (mr.phyAddr <= targetX && mr.phyAddr + mr.size >= targetX) return

      if (mr.phyAddr > targetX && mr.phyAddr + mr.size < range_limit.max) {
        range_limit.max = mr.phyAddr
      }
      if (mr.phyAddr < targetX && mr.phyAddr + mr.size > range_limit.min) {
        range_limit.min = mr.phyAddr + mr.size
      }
    })

    return range_limit
  }

  const displayAvailableMR = (e, index : number | null) => {
    if (index) return

    if (e.target.classList.contains("mem-bar")) {
      const rangeLimit = getRangeLimit(e.nativeEvent.offsetX)
      const phyAddr = Math.max(e.nativeEvent.offsetX - 40, rangeLimit.min)
      setFreeMRStatus({
        visibility: "visible",
        phyAddr: phyAddr,
        size: Math.min(rangeLimit.max - phyAddr, 100)
      })
    }
  }

  const hideAvailableMR = () => {
    setFreeMRStatus({
      phyAddr: 0,
      visibility: "hidden",
      size: 0
    })
  }
  
  const createMR = () => {
    setMRs([...MRs, {name: 'test3', phyAddr: freeMRStatus.phyAddr, size: freeMRStatus.size, pageSize: 1}])
    console.log("create MR", MRs)
    hideAvailableMR()
  }

  const startDrag = (e, i : number) => {
    const this_mr = e.target

    dragStatus.indexOfMR = i
    dragStatus.startX = e.clientX
    dragStatus.startLeft = MRs[i].phyAddr
    dragStatus.rangeLimit = getRangeLimit(MRs[i].phyAddr + 1)
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
      const newPhyAddr = Math.min(
        Math.max(e.clientX - dragStatus.startX + dragStatus.startLeft, dragStatus.rangeLimit.min),
        dragStatus.rangeLimit.max - currentMR.size
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
      const newPhyAddr = Math.min(
        Math.max(e.clientX - dragStatus.startX + dragStatus.startLeft, dragStatus.rangeLimit.min),
        currentMR.phyAddr + currentMR.size - currentMR.pageSize
      )
      const newSize = currentMR.phyAddr + currentMR.size - newPhyAddr
      setMRs(oldMRs => {
        const newMRs = oldMRs.map((MR, index) => {
          if (index === dragStatus.indexOfMR) {
            return {...MR, phyAddr: newPhyAddr, size: newSize}
          }
          return MR
        })
        return newMRs
      })
    } else if (dragStatus.op === "right") {
      const newSize = Math.min(
        Math.max(e.clientX - dragStatus.startX + dragStatus.startWidth, currentMR.pageSize),
        dragStatus.rangeLimit.max - currentMR.phyAddr
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

  useEffect(() => {
    document.addEventListener('mousedown', removeSelection)
  }, [])

  return (
    <div className='mem-bar' onMouseMove={(e) => displayAvailableMR(e, dragStatus.indexOfMR)} onMouseLeave={hideAvailableMR}>
      {MRs.map((MR, i) => {
        return (
        <div 
          className='allocated-mr'
          style={ {width: MR.size + 'px', left: MR.phyAddr} } 
          onMouseEnter={hideAvailableMR}
          onMouseDown={(e) => {e.stopPropagation();startDrag(e, i)}}
          onClick={(e) => {selectMR(e, i)}}
          key={i}
        ></div>)
      })}
      <div
        className='free-mr'
        style={ {width: freeMRStatus.size + 'px', left: freeMRStatus.phyAddr + 'px', visibility: freeMRStatus.visibility} }
        onDoubleClick={createMR}
      ></div>
    </div>
  )
}