import { useEffect, useState, useCallback } from 'react'
import '../App.css'

export default function MemoryManager() {
  const [ MRs, setMRs] = useState<Array<string>>(['1', '2'])
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);

  const startDrag = useCallback((e) => {
    setIsDragging(true);
    setStartX(e.clientX - translateX);
  }, [translateX])

  // End dragging
  const endDrag = useCallback(() => {
      setIsDragging(false)
    }, []);

  // Handle dragging
  const handleDrag = useCallback((e) => {
    if (isDragging) {
      setTranslateX(e.clientX - startX)
    }
  }, [isDragging, startX])


  return (
    <div className='mem-bar'>
      <div 
      className='mem-region'
      style={ {width: '100px', left: translateX} } 
      onMouseDown={startDrag}
      onMouseMove={handleDrag}
      onMouseUp={endDrag}
      ></div>
      {MRs.map((MR) => {
          return <p key={MR}>{MR}</p>
      })}
    </div>
  )
}