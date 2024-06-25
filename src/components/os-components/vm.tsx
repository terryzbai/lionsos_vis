import { common_attrs, common_ports } from "./common"
import { Group } from '../group'
import { randColor } from '../../utils/helper'

const vm_editable_attrs = [
  { name: 'name', type: 'string', required: true },
  { name: 'id', type: 'number', min: 0, max: 255, required: true },
  { name: 'priority', type: 'number', min: 0, max: 255, required: true },
  { name: 'budget', type: 'number', min: 0, max: 1000, required: false },
  { name: 'period', type: 'number', min: 0, max: 1000, required: false },
  { name: 'pp', type: 'boolean', required: true },
  { name: 'prog_img', type: 'string', required: true },
]

const group_attrs = {
    ...common_attrs,
    shape: 'rect',
    width: 120,
    height: 40,
    data: {
      type: 'VM',
      color: '#FFFFFF',
      parent: false,
      attrs: {
        name: 'UntitledVM',
        id: 0,
        priority: 0,
        budget: 0,
        period: 0,
        pp: 0,
      },
      subsystem: null,
      editable_attrs: vm_editable_attrs,
      mappings: [],
      irqs: [],
    },
    attrs: {
      label: {
        text: 'UntitledVM',
        fontSize: 12,
        fill: "#000000",
      },
      text: {
        textAnchor: "left",
        x: 0,
        y: 12,
      },
      body: {
        fill: '#ffd591',
        stroke: '#ffa940',
        strokeWidth: 1,
      },
    },
    ...common_ports
}

const newVMNode = () => {
  const group = new Group(group_attrs)

  group.data.color = randColor()
  return group
}

const vm_preview_attrs = {
  ...common_attrs,
  shape: 'rect',
  width: 60,
  height: 50,
  label: 'VM',
  data: {
    name: 'VM',
    cellType: 'group',
    newNode: newVMNode
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

export { vm_preview_attrs, vm_editable_attrs }