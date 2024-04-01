
const insertIndents = (content : string) => {

  const ret =  "    " + content.split("\n").join("\n    ")
  return ret
}

const getVMXML = (cell : any, cells : any) => {
  const node_attrs = cell.data.attrs
  let attrs = ''
  attrs += node_attrs ? ` name="${node_attrs.name}"` : ''
  attrs += node_attrs.priority ? ` priority="${node_attrs.priority}"` : ''
  attrs += node_attrs.budget ? ` budget="${node_attrs.budget}"` : ''

  const mappings = "    /* mappings */"
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

  const mappings = "    /* mappings */"
  return `<protection_domain${attrs}>\n${prog_img}\n${pd_children}\n${mappings}\n</protection_domain>`
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

export const SDFContent = (cells : any ) => {
  console.log("SDFContent", cells, typeof cells)

  if (cells == null) {
    return ''
  }

  const pds_content = cells.map(cell => {
    const cell_data = cell.data
    if (cell.shape === 'edge') {
      console.log(`Channel:${cell_data?.source_node}-${cell.data?.source_end_id} <--> ${cell_data?.target_node}-${cell_data?.target_end_id}`)
    } else if (cell.parent == '' || cell.parent == null){
      const content = getPDXML(cell, cells)
      return insertIndents(content)
    }
  })

  const content = '<?xml version="1.0" encoding="UTF-8"?>\n<system>\n' + pds_content.join('\n') + "\n</system>"
  return content
}