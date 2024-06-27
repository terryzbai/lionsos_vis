import { common_attrs, common_ports } from "./common"
import { Group } from '../group'
import { randColor } from '../../utils/helper'
import { EditableAttrs } from "./common"

const pd_editable_attrs : Array<EditableAttrs> = [
  { name: 'name', type: 'string', required: true },
  { name: 'priority', type: 'number', min: 0, max: 255, required: true },
  { name: 'budget', type: 'number', min: 0, max: 1000, required: false },
  { name: 'period', type: 'number', min: 0, max: 1000, required: false },
  { name: 'pp', type: 'boolean', required: true },
  { name: 'prog_img', type: 'string', required: true },
]

const group_attrs = {
  ...common_attrs,
  shape: 'rect',
  width: 200,
  height: 120,
  data: {
    type: 'PD',
    color: '#FFFFFF',
    parent: true,
    attrs: {
      name: 'UntitledPD',
      priority: 0,
      budget: 0,
      period: 0,
      pp: 0,
      prog_img: 'default.elf',
    },
    subsystem: null,
    editable_attrs: pd_editable_attrs,
    mappings: [],
    irqs: [],
  },
  attrs: {
    label: {
      text: 'UntitledPD',
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
      stroke: '#9254de',
      strokeWidth: 1,
    },
  },
  ...common_ports
}

const newPDNode = () => {
  const group = new Group(group_attrs)
  group.addPort({
    id: 'port_1',
    group: 'bottom',
    attrs: {
      circle: {
        magnet: true,
        stroke: '#8f8f8f',
        r: 5,
      },
    },
  })

  group.data.color = randColor()
  return group
}

const pd_preview_attrs = {
  ...common_attrs,
  shape: 'rect',
  width: 80,
  height: 40,
  label: 'PD',
  data: {
    name: 'PD',
    cellType: 'group',
    newNode: newPDNode
  },
  attrs: {
    body: {
    fill: '#efdbff',
    stroke: '#9254de',
    strokeWidth: 1,
    },
  },
}

export { newPDNode, pd_preview_attrs } 