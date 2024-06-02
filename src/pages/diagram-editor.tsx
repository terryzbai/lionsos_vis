import React, { useEffect, useState } from 'react'
import { Modal } from 'antd'
import { Graph, Cell, Edge } from '@antv/x6'
import { ERLayout } from '@antv/layout'
import { Stencil } from '@antv/x6-plugin-stencil'
import { Snapline } from '@antv/x6-plugin-snapline'
import { Toolbar } from '@antv/x6-react-components'
import { Group } from '../components/group'
import NodeEditor from '../components/node-editor'
import { stencil_group, custom_nodes, custom_group } from '../components/nodes'
import MemoryManager from '../components/memory-manager'
import ChannelEditor from '../components/channel-editor'
import { SDFContent } from '../utils/translator'
import { MemoryRegion } from '../utils/element'
import { channelLabelConfig, getValidEndID, randColor, closestBorder } from '../utils/helper'
import '@antv/x6-react-components/es/menu/style/index.css'
import '@antv/x6-react-components/es/toolbar/style/index.css'
import '../App.css'
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  RedoOutlined,
  UndoOutlined,
  DeleteOutlined,
  FileImageOutlined,
  SaveOutlined,
  FolderOpenOutlined,
  EditOutlined,
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { readdirSync } from 'fs'

/*
TODO:
[ ] Set highest zIndex for the node being dragged
[ ] Update states for embedded/detached nodes 
*/

const Item = Toolbar.Item // eslint-disable-line
const ToolbarGroup = Toolbar.Group // eslint-disable-line

export const DiagramEditor = () => {
  const refGraphContainer = React.createRef<HTMLDivElement>()
  const refStencilContainer = React.createRef<HTMLDivElement>()
  const [ globalGraph, setGlobalGraph ] = useState<Graph>(null)
  const [ ctrlPressed, setCtrlPressed ] = useState(false)
  const [ SDFEditorOpen, setSDFEditorOpen ] = useState(false)
  const [ nodeEditorOpen, setNodeEditorOpen ] = useState(false)
  const [ channelEditorOpen, setChannelEditorOpen ] = useState(false)
  const [ currentEdgeID, setCurrentEdgeID ] = useState('')
  const [ currentNodeID, setCurrentNodeID ] = useState('')
  const [ MRs, setMRs] = useState<Array<MemoryRegion>>([
    {name: 'uart', phys_addr: 0x9000000, size: 0x1000, page_size: 1, page_count: null, nodes: []},
    {name: 'shared_buffer', phys_addr: 0x9001000, size: 0x1000, page_size: 1, page_count: null, nodes: []},
    {name: 'guest_ram', phys_addr: 0x10000000, size: 0x200000, page_size: 1, page_count: null, nodes: []},
    {name: 'ethernet', phys_addr: 0xa003000, size: 0x1000, page_size: 1, page_count: null, nodes: []},
    {name: 'gic_vcpu', phys_addr: 0x8040000, size: 0x1000, page_size: 1, page_count: null, nodes: []}
  ])

  const graph_config = {
    background: {
      color: '#F2F7FA',
    },
    connecting: {
      allowEdge: true,
      allowBlank: true,
      allowPort: false,
      allowMulti: false,
      allowLoop: false,
      router: 'manhattan',
    },
    embedding: {
      enabled: true,
      findParent({ node }) {
        const bbox = node.getBBox()
        return this.getNodes().filter((node) => {
          const data = node.getData()
          if (data && data.parent) {
            const targetBBox = node.getBBox()
            return bbox.isIntersectWithRect(targetBBox)
          }
          return false
        })
      },
    },
    highlighting: {
      embedding: {
        name: 'stroke',
        args: {
          padding: -1,
          attrs: {
            stroke: '#73d13d',
          },
        },
      },
    },
  }

  const stencil_config = {
    title: 'Components',
    // target: graph,
    search(cell, keyword) {
      return cell.shape.indexOf(keyword) !== -1
    },
    placeholder: 'Search by component name',
    notFoundText: 'Not Found',
    collapsable: false,
    stencilGraphHeight: 0,
    groups: stencil_group,
    getDropNode(node) {
      const node_name = node.data?.name

      const group = new Group(custom_group[String(node_name)])
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
    },
  }

  const editSDF = () => {
    setSDFEditorOpen(true)

    console.log(globalGraph.toJSON())
  }

  const updateMappings = () => {
    const nodes = globalGraph.getNodes()
    const newMRs = MRs.map((MR) => {
      const new_mappings = nodes.map((node) => {
        const node_mappings = node.data.mappings.map(mapping => mapping.mr)
        if (node_mappings.includes(MR.name)) {
          return node.id
        }
        return ''
      }).filter(node_id => node_id !== '')

      return { ...MR, nodes: new_mappings }
    })
    setMRs(newMRs)
  }

  const getNodeData = (node_id : string) => {
    const node = globalGraph?.getNodes().find(node => node.id === node_id)
    return node?.data
  }

  const updateNodeData = (node_id : string, new_data : any) => {
    const node = globalGraph?.getNodes().find(node => node.id === node_id)

    if (node) {
      // Update data
      node.data = new_data
      // Update the label displayed on the corresponding node
      node.setAttrs({ label: { text: node.data.attrs.name } })
      // Update data and colour of memory regions
      updateMappings()
    } else {
      console.log("Invalid node_id")
    }
  }

  const getEdgeData = (edge_id : string) => {
    const edge = globalGraph?.getEdges().find(edge => edge.id === edge_id)
    return edge?.data
  }

  const updateEdgeData = (edge_id : string, new_data : any) => {
    const edge = globalGraph?.getEdges().find(edge => edge.id === edge_id)
    if (edge) {
      edge.data.source_end_id = new_data.source_end_id
      edge.data.target_end_id = new_data.target_end_id
      console.log(edge, new_data)
    } else {
      console.log("Invalid edge_id")
    }
  }

  const updateIRQPosition = (edge : Edge, direction : string, portPosition : { x: number, y: number }) => {
    const irq_len = 40
    if (direction === 'left') {
      edge.prop('target', { x: portPosition.x - irq_len, y: portPosition.y})
    } else if (direction === 'right') {
      edge.prop('target', { x: portPosition.x + irq_len, y: portPosition.y })
    } else if (direction === 'top') {
      edge.prop('target', { x: portPosition.x, y: portPosition.y - irq_len})
    } else if (direction === 'bottom') {
      edge.prop('target', { x: portPosition.x, y: portPosition.y + irq_len})
    }
  }

  const updateIRQsPosition = (node_id : string, graph : Graph) => {
    graph.getEdges().map(edge => {
      if (edge.data.type !== 'irq') return

      if (edge.getSourceNode()?.id === node_id) {
        const sourceNode = edge.getSourceNode()
        const edge_type = edge.data.type
        
        if (edge_type === 'irq') {
          const port = sourceNode.getPorts().find(port => port.id === sourceNode.id + edge.id)
          const portPosition = edge.getSourcePoint()
          updateIRQPosition(edge, port.group, portPosition)
        }
      } else if (edge.getTargetNode()?.id === node_id) {
        const sourceNode = edge.getTargetNode()
        const edge_type = edge.data.type
  
        if (edge_type === 'irq') {
          const port = sourceNode.getPorts().find(port => port.id === sourceNode.id + edge.id)
          const portPosition = edge.getTargetPoint()
          updateIRQPosition(edge, port.group, portPosition)
        }
      }

    })
  }

  const reassignEdgesForComponent = (graph : Graph) => {
    const edges = graph.getEdges()
    edges.map(edge => {
      const sourceNode = edge.getSourceNode()
      const targetNode = edge.getTargetNode()
      if (sourceNode) {
        const targetPoint = edge.getTargetPoint()
        const border = closestBorder(
          { x: sourceNode.position().x, y: sourceNode.position().y, width: sourceNode.size().width, height: sourceNode.size().height},
          { x: targetPoint.x, y: targetPoint.y }
        )
        const portId = edge.getSourcePortId()
        const source_port = sourceNode.id + edge.id
        if (portId === 'port_1' || portId === null) {
          // TODO: use a better id for port
          sourceNode.addPort({
            id: source_port,
            group: border,
          })
          edge.setSource({ cell: sourceNode, port: source_port })
        } else {
          sourceNode.portProp(source_port!, 'group', border)
        }
      }
      if (targetNode) {
        const sourcePoint = edge.getSourcePoint()
        const border = closestBorder(
          { x: targetNode.position().x, y: targetNode.position().y, width: targetNode.size().width, height: targetNode.size().height},
          { x: sourcePoint.x, y: sourcePoint.y }
        )
        const portId = edge.getTargetPortId()
        
        const target_port = targetNode.id + edge.id
        if (portId === 'port_1' || portId == null) {
          // TODO: use a better id for port
          targetNode.addPort({
            id: target_port,
            group: border,
          })
          edge.setTarget({ cell: targetNode, port: target_port })
        } else {
          targetNode.portProp(target_port!, 'group', border)
        }
      }
    })
  }

  const test_add_groups = () => {
    const cells: Cell[] = []
    const nodes = []
    const edges = []
    nodes.push({...custom_group['PD'], id: `11111`})
    nodes.push({...custom_group['PD'], id: `22222`})
    nodes.push({...custom_group['PD'], id: `33333`})
    nodes.push({...custom_group['PD'], id: `44444`})

    const ERLayoutInstance = new ERLayout({
      nodes,
      edges,
      nodeMinGap: 240
    })

    ERLayoutInstance.execute().then((res) => {
      console.log(nodes, edges)
      nodes.forEach((item) => {
        const new_group = new Group(item)
        new_group.addPort({
          id: 'port_1',
          group: 'bottom',
        })
  
        new_group.data.color = randColor()
        cells.push(new_group)
      })
      edges.forEach((item) => {
        cells.push(globalGraph.createEdge(item))
      })
      globalGraph.resetCells(cells)
      globalGraph.zoomToFit({ padding: 20, maxScale: 1 })

      console.log(globalGraph.toJSON())
    })
  }

  useEffect(() => {
    const graph = new Graph({
      ...graph_config,
      container: refGraphContainer.current,
    })
    setGlobalGraph(graph)
  
    graph.use(
      new Snapline({
        enabled: true,
        sharp: true,
      }),
    )

    const stencil = new Stencil({
      ...stencil_config,
      target: graph,
    })

    refStencilContainer.current.appendChild(stencil.container)

    // Render components on tool bar
    Object.keys(custom_nodes).forEach((group_name) => {
      const nodes = custom_nodes[group_name as keyof typeof custom_nodes].map((config) => {
        return graph.createNode(config)
      })
      
      // stencil.load()
      stencil.load(nodes, group_name)
    })

    graph.on('node:dblclick', (ev) => {
      setCurrentNodeID(ev.node.id)
      setNodeEditorOpen(true)
      // dispatch(openNodeEditor(ev.node.id))
    })

    graph.on('node:mouseenter', ({ node }) => {
      // node.setZIndex(999)
      node.addTools({
        name: 'button-remove',
        args: {
          x: '100%',
          y: 0,
          offset: { x: -10, y: 10 },
          onClick(t) {
            // source code of built-in button-remove
            var e=t.view, n=t.btn
            n.parent.remove()
            e.cell.remove({ui:!0, toolId:n.cid})
          }
        },
      })
    })
    
    graph.on('node:mouseleave', ({ node }) => {
      // node.setZIndex(1)
      node.removeTools()
    })

    graph.on('node:mousedown', ({ node }) => {
      node.data.originZIndex = node.getZIndex()
      // node.setZIndex(9999)
      node.toFront({ deep: true })
    })

    graph.on('node:mouseup', ({ node }) => {
      console.log(node)
      if (node.parent == null) {
        // node.setZIndex(node.data.originZIndex)
        node.toBack({ deep: true })
      } else {
        node.setZIndex(node.parent.getZIndex() + 1)
      }

      console.log(graph.getCells())
    })

    // setCtrlPressed(false)
    graph.on('node:embedding', ({ e }: { e }) => {
      setCtrlPressed(e.metaKey || e.ctrlKey)
    })
    
    graph.on('node:embedded', ({ node, currentParent }) => {
      setCtrlPressed(false)
      const parent_zIndex = currentParent.getZIndex()
      node.setZIndex(parent_zIndex + 1)
    })

    graph.on('node:change:size', ({ node, options }) => {
      if (options.skipParentHandler) {
        return
      }
    
      const children = node.getChildren()
      if (children && children.length) {
        node.prop('originSize', node.getSize())
      }

      updateIRQsPosition(node.id, graph)
    })

    graph.on('node:collapse', ({ node }: { node: Group }) => {
      node.toggleCollapse()
      const collapsed = node.isCollapsed()
      const collapse = (parent: Group) => {
        const cells = parent.getChildren()
        if (cells) {
          cells.forEach((cell) => {
            if (collapsed) {
              cell.hide()
            } else {
              cell.show()
            }
    
            if (cell instanceof Group) {
              if (!cell.isCollapsed()) {
                collapse(cell)
              }
            }
          })
        }
      }
    
      collapse(node)
    })

    const embedPadding = 40
    graph.on('node:change:position', ({ node, options }) => {
      reassignEdgesForComponent(graph)

      if (options.skipParentHandler || ctrlPressed) {
        return
      }
    
      const children = node.getChildren()
      if (children && children.length) {
        node.prop('originPosition', node.getPosition())
      }
    
      const parent : Group = node.getParent()
      if (parent && parent.isNode()) {
        let originSize = parent.prop('originSize')
        if (originSize == null) {
          originSize = parent.getSize()
          parent.prop('originSize', originSize)
        }
    
        let originPosition = parent.prop('originPosition')
        if (originPosition == null) {
          originPosition = parent.getPosition()
          parent.prop('originPosition', originPosition)
        }
    
        let x = originPosition.x
        let y = originPosition.y
        let cornerX = originPosition.x + originSize.width
        let cornerY = originPosition.y + originSize.height
        let hasChange = false
    
        const children = parent.getChildren()
        if (children) {
          children.forEach((child) => {
            const bbox = child.getBBox().inflate(embedPadding)
            const corner = bbox.getCorner()
    
            if (bbox.x < x) {
              x = bbox.x
              hasChange = true
            }
    
            if (bbox.y < y) {
              y = bbox.y
              hasChange = true
            }
    
            if (corner.x > cornerX) {
              cornerX = corner.x
              hasChange = true
            }
    
            if (corner.y > cornerY) {
              cornerY = corner.y
              hasChange = true
            }
          })
        }
    
        if (hasChange && parent.isCollapsed() == false) {
          parent.prop(
            {
              position: { x, y },
              size: { width: cornerX - x, height: cornerY - y },
            },
            { skipParentHandler: true },
          )
        }
      }
    })

    graph.on('edge:mouseenter', ({ edge }) => {
      edge.addTools([
        {
          name: 'source-arrowhead',
        },
        {
          name: 'target-arrowhead',
        },
      ])
      
      edge.setLabels(channelLabelConfig(edge.data?.source_end_id, edge.data?.target_end_id))
    })

    graph.on('edge:mouseleave', ({ edge }) => {
      edge.removeTools()
      edge.setLabels({})
    })

    graph.on('edge:mouseup', ({ edge }) => {
      const sourceNode = edge.getSourceNode()
      const targetNode = edge.getTargetNode()

      // TODO: replace all '1' with getFreeEndID()

      edge.attr('line/targetMarker', { tagName: 'circle', r: 2 })
      edge.attr('line/sourceMarker', { tagName: 'circle', r: 2 })
      if (sourceNode && targetNode) {
        edge.data = { 
          type: 'channel',
          source_node: sourceNode,
          source_end_id: '1',
          target_node: targetNode,
          target_end_id: '1',
        }
      } else if (!sourceNode && targetNode && edge.data?.source_node) {
        // Reset source
        edge.setSource(edge.data?.source_node)
        
        edge.data = { 
          type: 'channel',
          source_node: edge.data.source_node,
          source_end_id: edge.data.source_end_id,
          target_node: targetNode,
          target_end_id: '1',
        }
      } else if (sourceNode && !targetNode && edge.data?.target_node) {
        // Reset target
        edge.setTarget({ cell: edge.data?.target_node })

        edge.data = { 
          type: 'channel',
          source_node: sourceNode,
          source_end_id: '1',
          target_node: edge.data.target_node,
          target_end_id: edge.data.target_end_id,
        }
      } else {
        // remove edge
        graph.removeEdge(edge.id)
      }

      reassignEdgesForComponent(graph)
    })

    // graph.on('edge:changed', ({ edge }) => {
    //   const sourceNode = edge.getSourceNode()
    //   const targetNode = edge.getTargetNode()

    //   // Neither IRQ nor CC
    //   if (!sourceNode && !targetNode) {
    //     edge.attr('line/targetMarker', 'block')
    //     edge.attr('line/sourceMarker', 'block')

    //     edge.data = { 
    //       type: 'null',
    //       source_node: null,
    //       source_end_id: null,
    //       target_node: null,
    //       target_end_id: null,
    //     }
    //   } else if (sourceNode && targetNode) { // CC
    //     // edge.setSource(sourceNode)
    //     // edge.setTarget(targetNode)

    //     edge.attr('line/targetMarker', { tagName: 'circle', r: 2 })
    //     edge.attr('line/sourceMarker', { tagName: 'circle', r: 2 })
    //     const new_source_end_id = ((edge.data && edge.data.source_end_id !== 'int') ? edge.data?.source_end_id : getValidEndID(graph.getEdges(), sourceNode.id))
    //     const new_target_end_id = ((edge.data && edge.data.target_end_id !== 'int') ? edge.data?.target_end_id : getValidEndID(graph.getEdges(), targetNode.id))
    //     edge.data = { 
    //       type: 'channel',
    //       source_node: sourceNode ? sourceNode.id : null,
    //       source_end_id: new_source_end_id,
    //       target_node: targetNode ? targetNode.id : null,
    //       target_end_id: new_target_end_id,
    //     }
    //   } else { // IRQ
    //     if (sourceNode) {
    //       edge.attr('line/sourceMarker', 'async')
    //       edge.attr('line/targetMarker', { tagName: 'circle', r: 2 })
    //     }
    //     if (targetNode) {
    //       edge.attr('line/sourceMarker', { tagName: 'circle', r: 2 })
    //       edge.attr('line/targetMarker', 'async')
    //     }
    //     edge.data = {
    //       type: 'irq',
    //       source_node: sourceNode ? sourceNode.id : null,
    //       source_end_id: sourceNode ? '1' : 'int',
    //       target_node: targetNode ? targetNode.id : null,
    //       target_end_id: targetNode ? '1' : 'int',
    //     }
    //   }

    //   // reassignEdgesForComponent(graph)
    // })

    graph.on('edge:dblclick', ({ edge }) => {
      setCurrentEdgeID(edge.id)
      setChannelEditorOpen(true)
    })

  }, [])

  return (
    <div>
      <MemoryManager MRs={MRs} setMRs={setMRs} getNodeData={getNodeData} />
      <Toolbar className="toolbar" >
        <ToolbarGroup>
          <Item name="zoomIn" tooltip="Zoom In (Cmd +)" icon={<ZoomInOutlined />} />
          <Item name="zoomOut" tooltip="Zoom Out (Cmd -)" icon={<ZoomOutOutlined />} />
        </ToolbarGroup>
        <ToolbarGroup>
          <Item name="undo" tooltip="Undo (Cmd + Z)" icon={<UndoOutlined />} />
          <Item name="redo" tooltip="Redo (Cmd + Shift + Z)" icon={<RedoOutlined />} />
        </ToolbarGroup>
        <ToolbarGroup>
          <Item name="delete" icon={<DeleteOutlined />} disabled={true} tooltip="Delete (Delete)" />
        </ToolbarGroup>
        <ToolbarGroup>
          <Item name="previewDiagram" icon={<FileImageOutlined />} tooltip="Preview Diagram"></Item>
          <Item name="uploadeSDF" icon={<FolderOpenOutlined />} tooltip="Open Diagram"></Item>
          <Item name="downloadDiagram" icon={<SaveOutlined />} tooltip="Save Diagram"></Item>
        </ToolbarGroup>
        <ToolbarGroup>
          <Item name="editSDF" icon={<EditOutlined />} tooltip="Edit SDF" onClick={editSDF}></Item>
          <Item name="uploadeSDF" icon={<UploadOutlined />} tooltip="Upload SDF"></Item>
          <Item name="downloadSDF" icon={<DownloadOutlined />} tooltip="Download SDF"></Item>
        </ToolbarGroup>
      </Toolbar>
      <div className="stencil-app">
        <div className="app-stencil" ref={refStencilContainer} />
        <div className="app-content" ref={refGraphContainer}>
        </div>
      </div>
      <NodeEditor
        node_id={currentNodeID}
        nodeEditorOpen={nodeEditorOpen}
        setNodeEditorOpen={setNodeEditorOpen}
        getNodeData={getNodeData}
        updateNodeData={updateNodeData}
        MRs={MRs}
        />
      <ChannelEditor
        channelEditorOpen={channelEditorOpen}
        setChannelEditorOpen={setChannelEditorOpen}
        edge_id={currentEdgeID}
        getEdgeData={getEdgeData}
        updateEdgeData={updateEdgeData}
        getNodeData={getNodeData} />
      <Modal
        title="Modal 1000px width"
        centered
        open={SDFEditorOpen}
        onOk={() => setSDFEditorOpen(false)}
        onCancel={() => setSDFEditorOpen(false)}
        width={1000}
      >
        <textarea value={SDFContent(globalGraph?.toJSON().cells, MRs)} style={ {width: '100%', height: '500px'} }></textarea>
      </Modal>
    </div>
  )
}