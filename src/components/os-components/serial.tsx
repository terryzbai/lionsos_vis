import { common_attrs, common_ports, addChannel } from "./common"
import { Group } from '../group'
import { newPDNode } from "./pd"
import { Graph } from "@antv/x6"
import { reassignEdgesForComponent } from '../../utils/helper'

const serial_system_editable_attrs = [
  { name: 'name', type: 'string', required: true },
  { name: 'data_region_size', type: 'number', required: true }
]

const updateSubsystem = (graph: Graph, serial_system : Group) => {
  const serial_driver = graph.getCellById(serial_system.data.driver)
  serial_driver.setAttrs({ label: { text: serial_driver.data.attrs.name } })

  const mux_tx = graph.getCellById(serial_system.data.mux_tx)
  mux_tx.setAttrs({ label: { text: mux_tx.data.attrs.name } })

  const mux_rx = graph.getCellById(serial_system.data.mux_rx)
  mux_rx.setAttrs({ label: { text: mux_rx.data.attrs.name } })

  reassignEdgesForComponent(graph)
}

const renderChildrenNodes = (graph : Graph, serial_system : Group) => {
  const {x, y} = serial_system.getPosition()

  // Add serial driver
  const serial_driver = newPDNode()
  serial_driver.position(x + 280, y + 100)
  serial_driver.data.attrs.name = 'serial_driver'
  serial_system.addChild(serial_driver)
  serial_system.data.driver = serial_driver.id
  
  // Add mux_tx PD
  const mux_tx = newPDNode()
  mux_tx.position(x + 40, y + 40)
  mux_tx.data.attrs.name = 'serial_mux_tx'
  serial_system.addChild(mux_tx)
  serial_system.data.mux_tx = mux_tx.id
  
  // Add mux_rx PD
  const mux_rx = newPDNode()
  mux_rx.position(x + 40, y + 180)
  mux_rx.data.attrs.name = 'serial_mux_tx'
  serial_system.addChild(mux_rx)
  serial_system.data.mux_rx = mux_rx.id

  addChannel(graph, serial_driver, mux_tx)
  addChannel(graph, serial_driver, mux_rx)

  updateSubsystem(graph, serial_system)
}

const group_attrs = {
  ...common_attrs,
  shape: 'rect',
  width: 500,
  height: 320,
  data: {
    type: 'Subsystem',
    renderChildrenNodes: renderChildrenNodes,
    attrs: {
      name: 'serial_system',
      data_region_size: 0x1000,
    },
    driver: '',
    mux_tx: '',
    mux_rx: '',
    editable_attrs: serial_system_editable_attrs
  },
  attrs: {
    label: {
      text: 'Serial System',
      fontSize: 16,
      fill: "#000000",
    },
    text: {
      textAnchor: "left",
      x: 0,
      y: 12,
    },
    body: {
      fill: '#efdbff',
      stroke: '#ffffff',
      strokeWidth: 1,
      rx: 6,
      ry: 6,
    },
  },
  ...common_ports
}

const newSerialGroup = () => {
  const group = new Group(group_attrs)

  return group
}

const serial_preview_attrs = {
  ...common_attrs,
  shape: 'rect',
  width: 80,
  height: 40,
  label: 'Serial',
  data: {
    name: 'Serial',
    cellType: 'group',
    newNode: newSerialGroup
  },
  attrs: {
    text: {
      textAnchor: "middle",
    },
    body: {
      fill: '#ffd591',
      stroke: '#ffa940',
      strokeWidth: 1,
    },
  },
}

export { serial_preview_attrs }