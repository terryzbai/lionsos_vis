import { pd_preview_attrs } from "./os-components/pd"
import { vm_preview_attrs } from "./os-components/vm"
import { serial_preview_attrs } from "./os-components/serial"

const group_registration = {
  'Basic': {
    'PD': pd_preview_attrs,
    'VM': vm_preview_attrs,
  },
  'Subsystem': {
    'serial': serial_preview_attrs,
  }
}

const stencilRender = (graph, stencil) => {
  Object.entries(group_registration).map(group => {
    const [group_name, group_items] = group
    const node_list = Object.values(group_items).map(node_attrs => {
      return graph.createNode(node_attrs)
    })
    stencil.load(node_list, group_name)
  })
}

const stencil_group = Object.keys(group_registration).map(key => {
  return {name: key, title: key}
})

export { stencilRender, stencil_group }