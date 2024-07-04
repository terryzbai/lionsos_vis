import { Select, Space } from 'antd';
import { useEffect } from 'react';

const ArchConfigBar = ({ board, setBoard, dtb, setDtb }) => {
  const switchBoard = (value: string) => {
    setBoard(value)
  };

  const board_list = [
    { value: 'qemu_arm_virt', label: 'qemu_arm_virt' },
    { value: 'odroid4', label: 'odroid4' },
  ]

  useEffect(() => {
    fetch('qemu_arm_virt.dtb').then(response =>
      response.arrayBuffer()
    ).then(bytes => {
      const typedArray = new Uint8Array(bytes)
      setDtb(typedArray)
      // TODO: verify if a valid dtb is loaded
      console.log(board + "'s DTB has been loaded.")
    })
  }, [board])

  return (
    <div className="arch-config-bar">
      <Space wrap>
        Board:
        <Select
          defaultValue={board}
          style={{ width: 200 }}
          onChange={switchBoard}
          options={board_list}
        />

      </Space>
    </div>
  )
}

export default ArchConfigBar;
