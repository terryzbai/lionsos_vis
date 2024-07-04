import { PDComponentInit } from "./os-components/pd"
import { VMComponentInit } from "./os-components/vm"
import { SerialComponentInit } from "./os-components/serial"

const group_registration = {
  'Basic': {
    'PD': PDComponentInit,
    'VM': VMComponentInit,
  },
  'Subsystem': {
    'serial': SerialComponentInit,
  }
}

const stencilRender = (graph, stencil) => {
  Object.entries(group_registration).map(group => {
    const [group_name, group_items] = group
    const node_list = Object.values(group_items).map(component_init => {
      const node = graph.createNode(component_init.preview_attrs)
      node.data.createNode = component_init.createNode
      return node
    })
    stencil.load(node_list, group_name)
  })
}

const stencil_group = Object.keys(group_registration).map(key => {
  return {name: key, title: key}
})

export { stencilRender, stencil_group }
