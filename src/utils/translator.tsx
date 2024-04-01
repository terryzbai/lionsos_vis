
export const SDFContent = (cells : any) => {
  console.log("SDFContent", cells, typeof cells)

  if (cells == null) {
    return ''
  }

  const pds_content = cells.map(cell => {
    console.log(cell.parent)
    const cell_data = cell.data
    if (cell.shape === 'edge') {
      console.log(`Channel:${cell_data?.source_node}-${cell.data?.source_end_id} <--> ${cell_data?.target_node}-${cell_data?.target_end_id}`)
    } else if (cell.parent == '' || cell.parent == null){
      console.log("Valid NODE")

      const node_attrs = cell_data.attrs
      let attrs = ''
      attrs += node_attrs ? ` name="${node_attrs.name}"` : ''
      attrs += node_attrs.priority ? ` priority="${node_attrs.priority}"` : ''
      attrs += node_attrs.budget ? ` budget="${node_attrs.budget}"` : ''
      return `\t<protection_domain${attrs}>\n\t</protection_domain>`
    }
  })

  const content = '<?xml version="1.0" encoding="UTF-8"?>\n<system>\n' + pds_content.join('\n') + "\n</system>"
  return content
}