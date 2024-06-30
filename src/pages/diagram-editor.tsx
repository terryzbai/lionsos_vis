import React, { useEffect, useState } from 'react'
import { Modal } from 'antd'
import { Graph, Cell, Edge } from '@antv/x6'
import { ERLayout } from '@antv/layout'
import { Stencil } from '@antv/x6-plugin-stencil'
import { Snapline } from '@antv/x6-plugin-snapline'
import { Toolbar } from '@antv/x6-react-components'
import { Group } from '../components/group'
import NodeEditor from '../components/node-editor'
import { stencilRender, stencil_group } from '../components/nodes'
import MemoryManager from '../components/memory-manager'
import ChannelEditor from '../components/channel-editor'
import TemplateList from '../components/template-list'
import { MemoryRegion } from '../utils/element'
import { channelLabelConfig, getValidEndID, randColor, closestBorder, reassignEdgesForComponent } from '../utils/helper'
import SDFGenerator from '../components/sdf-generator'
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
import { SystemComponent } from '../components/os-components/component-interface'

const Item = Toolbar.Item // eslint-disable-line
const ToolbarGroup = Toolbar.Group // eslint-disable-line

export const DiagramEditor = () => {
  const refGraphContainer = React.createRef<HTMLDivElement>()
  const refStencilContainer = React.createRef<HTMLDivElement>()
  const refTextarea = React.useRef<HTMLTextAreaElement>()
  const [ globalGraph, setGlobalGraph ] = useState<Graph>(null)
  const [ SDFEditorOpen, setSDFEditorOpen ] = useState(false)
  const [ templateListOpen, setTemplateListOpen ] = useState(false)
  const [ nodeEditorOpen, setNodeEditorOpen ] = useState(false)
  const [ channelEditorOpen, setChannelEditorOpen ] = useState(false)
  const [ currentEdgeID, setCurrentEdgeID ] = useState('')
  const [ currentNodeID, setCurrentNodeID ] = useState('')
  const [ currentNode, setCurrentNode ] = useState<SystemComponent>(null)
  const [ toGenerateSDF, setToGenerateSDF ] = useState<boolean>(false)
  const [ SDFText, setSDFText ] = useState('')
  const [ MRs, setMRs] = useState<Array<MemoryRegion>>([
    {name: 'uart', phys_addr: 0x9000000, size: 0x1000, page_size: 1, page_count: null, nodes: []},
    {name: 'shared_buffer', phys_addr: 0x9001000, size: 0x1000, page_size: 1, page_count: null, nodes: []},
    {name: 'guest_ram', phys_addr: 0x10000000, size: 0x200000, page_size: 1, page_count: null, nodes: []},
    {name: 'ethernet', phys_addr: 0xa003000, size: 0x1000, page_size: 1, page_count: null, nodes: []},
    {name: 'gic_vcpu', phys_addr: 0x8040000, size: 0x1000, page_size: 1, page_count: null, nodes: []}
  ])

  var ctrlPressed = false

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
    search(cell, keyword) {
      return cell.shape.indexOf(keyword) !== -1
    },
    placeholder: 'Search by component name',
    notFoundText: 'Not Found',
    collapsable: false,
    stencilGraphHeight: 0,
    groups: stencil_group,
    getDropNode(node) {
      return node.data?.createNode()
    },
  }

  const openSDFEditor = () => {
    setSDFEditorOpen(true)
    setToGenerateSDF(true)
  }

  const openTemplateList = () => {
    const PDs = globalGraph.getCells().filter(cell => cell.data.type === 'PD')
    const PDNodes = PDs?.map(PD => {return {"name": PD.data.attrs.name, "node_id": PD.id}})
    setTemplateListOpen(true)
  }

  const updateMappings = () => {
    const nodes = globalGraph.getNodes()
    const newMRs = MRs.map((MR) => {
      const new_mappings = nodes.map((node) => {
        const component = node.data.component
        const node_mappings = component?.getMappings().map(mapping => mapping.mr)
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
    if (node?.data.subsystem) {
      const subsystem = globalGraph?.getNodes().find(node => node.id === node.data.subsystem)
      return subsystem?.data
    }
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

    stencilRender(graph, stencil)

    graph.on('node:dblclick', ({ node, e }) => {
      setCurrentNode(node.data.component)
      setCurrentNodeID(node.id)
      setNodeEditorOpen(true)
      e.stopPropagation()
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

    graph.on('node:mouseenter', ({ node }) => {
      node.toFront({ deep: true })
    })

    graph.on('node:mouseleave', ({ node }) => {
      if (node.parent == null) {
        node.toBack({ deep: true })
      } else {
        node.parent.toBack({ deep: true })
      }
    })

    graph.on('node:embedding', ({ e }: { e }) => {
      ctrlPressed = e.metaKey || e.ctrlKey
    })
    
    graph.on('node:embedded', ({ node, currentParent }) => {
      ctrlPressed = false
      currentParent.toBack({ deep: true })
      var topParent : Cell = currentParent
      while (topParent.parent) {
        topParent = topParent.parent
      }
      topParent.toBack({ deep: true })
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

    graph.on('node:added', ({ node }) => {
      node.data.component.renderChildrenNodes(graph)
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

    graph.on('edge:dblclick', ({ edge }) => {
      setCurrentEdgeID(edge.id)
      setChannelEditorOpen(true)
    })

  }, [])

  return (
    <div>
      <MemoryManager MRs={MRs} setMRs={setMRs} getNodeData={getNodeData} graph={globalGraph} />
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
          <Item name="editSDF" icon={<EditOutlined />} tooltip="Edit SDF" onClick={openSDFEditor}></Item>
          <Item name="uploadeSDF" icon={<UploadOutlined />} tooltip="Upload SDF"></Item>
          <Item name="downloadTemplates" icon={<DownloadOutlined />} tooltip="Download Templates" onClick={openTemplateList}></Item>
        </ToolbarGroup>
      </Toolbar>
      <div className="stencil-app">
        <div className="app-stencil" ref={refStencilContainer} />
        <div className="app-content" ref={refGraphContainer} />
      </div>
      <NodeEditor
        node_id={currentNodeID}
        nodeEditorOpen={nodeEditorOpen}
        setNodeEditorOpen={setNodeEditorOpen}
        getNodeData={getNodeData}
        updateNodeData={updateNodeData}
        component={currentNode}
        MRs={MRs}
        updateMappings={updateMappings}
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
        forceRender
        open={SDFEditorOpen}
        onOk={() => setSDFEditorOpen(false)}
        onCancel={() => setSDFEditorOpen(false)}
        width={1000}
      >
        <textarea
          ref={refTextarea}
          value={SDFText}
          onChange={() => console.log('111')}
          style={ {width: '100%', height: '500px'} }>
        </textarea>
      </Modal>
      <TemplateList templateListOpen={templateListOpen} setTemplateListOpen={setTemplateListOpen} graph={globalGraph}></TemplateList>
      <SDFGenerator globalGraph={globalGraph} toGenerateSDF={toGenerateSDF} setToGenerateSDF={setToGenerateSDF} setSDFText={setSDFText} MRs={MRs} />
    </div>
  )
}
