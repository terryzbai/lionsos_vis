import { SysMap, MemoryRegion } from "./element"

const insertIndents = (content : string) => {
  const ret =  "    " + content.split("\n").join("\n    ")
  return ret
}

const getMappingXML = (mappings : SysMap[]) => {
  // <map mr="gic_vcpu" vaddr="0x8010000" perms="rw" cached="false" />
  // console.log(mappings)
  const mapping_content = mappings.map((mapping) => {
    return `<map mr="${mapping.mr}" vaddr="${mapping.vaddr}" perms="${mapping.perms}" cached="${mapping.cached}" />`
  })
  return mapping_content.join("\n")
}

const getVMXML = (cell : any, cells : any) => {
  const node_attrs = cell.data.attrs
  let attrs = ''
  attrs += node_attrs ? ` name="${node_attrs.name}"` : ''
  attrs += node_attrs.priority ? ` priority="${node_attrs.priority}"` : ''
  attrs += node_attrs.budget ? ` budget="${node_attrs.budget}"` : ''

  const mappings = insertIndents(getMappingXML(cell.data.mappings))
  return `<virtual_machine${attrs}>\n${mappings}\n</virtual_machine>`
}

const getPDXML = (cell : any, cells : any) => {

  if (cell == null) return ''

  const node_attrs = cell.data.attrs
  let attrs = ''
  attrs += node_attrs ? ` name="${node_attrs.name}"` : ''
  attrs += node_attrs.priority ? ` priority="${node_attrs.priority}"` : ''
  attrs += node_attrs.budget ? ` budget="${node_attrs.budget}"` : ''

  const prog_img = `    <program_image path="${node_attrs.prog_img}" />`

  const pd_children = cell.children ? "\n" + cell.children.map(child_id => {
    const child_cell = cells.find(child => child.id === child_id)
    return insertIndents(getComponentXML(child_cell, cells))
  }).join("\n\n") : ""

  const mappings = cell.data.mappings.length ? "\n\n" + insertIndents(getMappingXML(cell.data.mappings)) : ""
  return `<protection_domain${attrs}>\n${prog_img}\n${pd_children}${mappings}\n</protection_domain>`
}

const getComponentXML = (cell : any, cells : any) => {

  switch (cell.data.type) {
    case "PD":
      return getPDXML(cell, cells)
    case "VM":
      return getVMXML(cell, cells)
  }
  
  return ""
}

const getChannelXML = (cell : any, cells : any) => {
  const cell_data = cell.data
  const node_a = cells.find(cell => cell.id === cell_data?.source_node)
  const node_b = cells.find(child => child.id === cell_data?.target_node)

  return `<channel>\n    <end pd="${node_a?.data.attrs.name}" id="${cell_data.source_end_id}" />\n    <end pd="${node_b?.data.attrs.name}" id="${cell_data.target_end_id}" />\n</channel>`
}

const getMRsXML = (MRs : MemoryRegion[]) => {
  const xml_array = MRs.map(MR => {
    return `<memory_region name="${MR.name}" size="${MR.size}" phys_addr="${MR.phys_addr}" />`
  })

  return xml_array.join('\n')
}

export const SDFContent = (cells : any, MRs : MemoryRegion[] ) => {

  if (cells == null) {
    return ''
  }

  const pds_content = cells.map(cell => {
    const cell_data = cell.data
    if (cell.shape === 'edge') {
      // console.log(`Channel:${cell_data?.source_node}-${cell.data?.source_end_id} <--> ${cell_data?.target_node}-${cell_data?.target_end_id}`)
      return insertIndents(getChannelXML(cell, cells))
    } else if (cell.parent == '' || cell.parent == null){
      return insertIndents(getComponentXML(cell, cells))
    }
  })

  const mrs_xml = insertIndents(getMRsXML(MRs))

  const content = '<?xml version="1.0" encoding="UTF-8"?>\n<system>\n' + mrs_xml + '\n\n' + pds_content.join('\n\n') + "\n</system>"
  return content
}