import { Graph, Cell, Edge } from '@antv/x6'
import { Group } from '../components/group'
import { XMLParser } from 'fast-xml-parser'
import { MemoryRegion, SysMap, SysIrq } from './element'
import { PDComponentInit } from '../components/os-components/pd'
import { VMComponentInit } from '../components/os-components/vm'

const layoutInfo = (nodes) => {
  const min_x_gap = 400
  const min_y_gap = 200
  const grid = []

  const row = Math.ceil(Math.sqrt(nodes.length))
  for (let i = 1; i <= row; i++) {
    for (let j = 1; j <= row; j++) {
      grid.push({x: i * min_x_gap, y: j * min_y_gap})
    }
  }
  return grid
}

export const loadDiagramFromXml = (graph: Graph, xml: string, updateMappings: any) => {
  const parser = new XMLParser({ignoreAttributes: false, attributeNamePrefix : ""})
  const system_description = parser.parse(xml).system
  console.log(system_description)

  const pds = system_description.protection_domain?.map(pd => {
    // TODO: extend to a data type, PDDataModel in `pd.tsx` or ProtectionDomain in `element.tsx`
    const new_pd_attrs = {
      name: pd.name,
      priority: parseInt(pd.priority),
      budget: pd.budget ? parseInt(pd.budget) : 0,
      period: pd.period ? parseInt(pd.period) : 0,
      pp: (pd.pp && pd.pp == "true") ? true : false,
      prog_img: pd.program_image.path
    }

    // parse mappings
    if (pd.map == null) {
      pd.map = []
    }
    if (Array.isArray(pd.map) == false) {
      pd.map = [pd.map]
    }
    const mappings = pd.map?.map(mapping => {
      const newMapping: SysMap = {
        mr: mapping.mr,
        vaddr: parseInt(mapping.vaddr.replace("_", ""), 16),
        setvar_vaddr: mapping.setvar_vaddr,
        perms: mapping.perms,
        cached: (mapping.cached && mapping.cached == "true") ? true : false,
      }
      return newMapping
    })

    // parse irqs
    if (pd.irq == null) {
      pd.irq = []
    }
    if (Array.isArray(pd.irq) == false) {
      pd.irq = [pd.irq]
    }
    const irqs = pd.irq?.map(irq => {
      const newIrq: SysIrq = {
        irq: irq.irq,
        id_: parseInt(irq.id),
        trigger: irq.trigger
      }
      return newIrq
    })

    return {
      attrs: new_pd_attrs,
      mappings: mappings,
      irqs: irqs,
    }
  })

  const grid = layoutInfo(pds)
  const nodes = pds.map((pd, index) => {
    const new_node = PDComponentInit.createNode(null)
    new_node.position(grid[index].x, grid[index].y)

    graph.addNode(new_node)

    new_node.data.component.updateData(graph, pd)
    return new_node
  })

  const edges = system_description.channel?.map(channel => {
    const source = nodes.find(node => node.data.component.getAttrValues().name == channel.end[0].pd)
    const source_end_id = parseInt(channel.end[0].id)
    const target = nodes.find(node => node.data.component.getAttrValues().name == channel.end[1].pd)
    const target_end_id = parseInt(channel.end[1].id)
    const edge = graph.addEdge({
      source,
      target,
      router: {
        name: 'manhattan'
      }
    })
    edge.attr('line/targetMarker', { tagName: 'circle', r: 2 })
    edge.attr('line/sourceMarker', { tagName: 'circle', r: 2 })
    edge.data = {
      type: 'channel',
      source_node: source,
      source_end_id: source_end_id,
      target_node: target,
      target_end_id: target_end_id,
    }
    return edge
  })

  // Load MRs
  const MRs = system_description.memory_region?.map(mr => {
    const newMR: MemoryRegion = {
      name: mr.name,
      size: parseInt(mr.size.replace("_", ""), 16),
      phys_addr: mr.phys_addr ? parseInt(mr.phys_addr.replace("_", ""), 16) : null,
      page_size: mr.page_size ? parseInt(mr.page_size.replace("_", ""), 16) : null,
      nodes: []
    }
    return newMR
  })
  updateMappings(MRs)
}
