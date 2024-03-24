import React from 'react'
import { Graph } from '@antv/x6'
import { Snapline } from '@antv/x6-plugin-snapline'
import { Stencil } from '@antv/x6-plugin-stencil'
import { stencil_group, custom_nodes, custom_group } from '../components/nodes'
import { ContextMenuTool } from '../components/context-menu'
import { Group } from '../components/group'
import ComponentDrawer from '../components/component-drawer'
import { Menu, Toolbar } from '@antv/x6-react-components'
import '@antv/x6-react-components/es/menu/style/index.css'
import '@antv/x6-react-components/es/toolbar/style/index.css'
import '../App.css'
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  RedoOutlined,
  UndoOutlined,
  DeleteOutlined,
  // BoldOutlined,
  // ItalicOutlined,
  // StrikethroughOutlined,
  // UnderlineOutlined,
} from '@ant-design/icons'
import { useAppDispatch } from '../app/hooks'
import { addPD } from '../features/configSlice'

/*
TODO:
[x] Embedding by Drag and Drop: https://x6.antv.antgroup.com/en/examples/node/group/#embedding-by-dnd
[x] Delete Button: https://x6.antv.antgroup.com/en/examples/node/tool/#button-remove
[x] Auto Expand/Shrink the Parent Node: https://x6.antv.antgroup.com/en/examples/node/group/#expand-shrink
[x] Collapse/Expand the Parent Node: https://x6.antv.antgroup.com/en/examples/node/group/#collapsable
[x] Detaching node: https://x6.antv.antgroup.com/en/examples/edge/tool/#context-menu
[x] Ajusting arrowheads: https://x6.antv.antgroup.com/en/examples/edge/tool#arrowheads
[ ] Toolbar
[ ] Export configurations
[ ] zIndex issue
[ ] Updating edges: https://x6.antv.antgroup.com/tutorial/basic/events
*/

const Item = Toolbar.Item // eslint-disable-line
const ToolbarGroup = Toolbar.Group // eslint-disable-line

export default class DiagramEditor extends React.Component<{}, {drawerOpen: boolean, data: any }> {
  private container: HTMLDivElement
  private stencilContainer: HTMLDivElement
  private ctrlPressed: boolean

  constructor(props) {
    super(props);
    this.showDrawer = this.showDrawer.bind(this)
    this.closeDrawer = this.closeDrawer.bind(this)
    this.state = {
      drawerOpen: false,
      data: {
        name: '1',
        title: '2'
      }
    };
  }

  showDrawer(node_id) {
    console.log(node_id)
    this.setState({ data: {name: node_id }} )
    this.setState({ drawerOpen: true })
  }

  closeDrawer() {
    this.setState({ drawerOpen: false })
  }

  updateNode(data) {
    console.log(data)
  }

  addNode(node_id : string) {
    // useAppDispatch()(addPD(node_id))
    console.log("add node:", node_id)
  }

  componentDidMount() {
    const graph = new Graph({
      container: this.container,
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
            const data = node.getData<any>()
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
    })
    
    graph.use(
      new Snapline({
        enabled: true,
        sharp: true,
      }),
    )

    graph.centerContent()

    console.log(graph.model)

    const that = this
    const stencil = new Stencil({
      title: 'Components',
      target: graph,
      search(cell, keyword) {
        return cell.shape.indexOf(keyword) !== -1
      },
      placeholder: 'Search by component name',
      notFoundText: 'Not Found',
      collapsable: false,
      stencilGraphHeight: 0,
      groups: stencil_group,
      getDropNode(node) {
        const node_name = node.getAttrs().text.text

        const group = new Group(custom_group[String(node_name)])
				group.addPort({
					id: 'port_1',
          group: 'bottom',
				})

        // useAppDispatch()(addPD('name'))
        that.addNode("fdsafdsafdaf")
        return group
      },
    })

    this.stencilContainer.appendChild(stencil.container)

    // Render components on tool bar
    Object.keys(custom_nodes).forEach((group_name) => {
      const nodes = custom_nodes[group_name as keyof typeof custom_nodes].map((config) => {
        return graph.createNode(config)
      })
      
      // stencil.load()
      stencil.load(nodes, group_name)
    })

    graph.on('node:dblclick', (ev) => {
      this.showDrawer(ev.node.id)
    })

    graph.on('node:mouseenter', ({ node }) => {
      node.addTools({
        name: 'button-remove',
        args: {
          x: '100%',
          y: 0,
          offset: { x: -10, y: 10 },
        },
      })
    })
    
    graph.on('node:mouseleave', ({ node }) => {
      node.removeTools()
    })

    this.ctrlPressed = false
    graph.on('node:embedding', ({ e }: { e }) => {
      this.ctrlPressed = e.metaKey || e.ctrlKey
    })
    
    graph.on('node:embedded', () => {
      this.ctrlPressed = false
    })

    graph.on('node:change:size', ({ node, options }) => {
      if (options.skipParentHandler) {
        return
      }
    
      const children = node.getChildren()
      if (children && children.length) {
        node.prop('originSize', node.getSize())
      }
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

    graph.on('edge:mouseenter', ({ cell }) => {
      cell.addTools([
        {
          name: 'source-arrowhead',
        },
        {
          name: 'target-arrowhead',
        },
      ])
    })

    graph.on('edge:mouseleave', ({ cell }) => {
      cell.removeTools()
    })
    
    const embedPadding = 40
    graph.on('node:change:position', ({ node, options }) => {
      if (options.skipParentHandler || this.ctrlPressed) {
        return
      }
    
      const children = node.getChildren()
      if (children && children.length) {
        node.prop('originPosition', node.getPosition())
      }
    
      const parent = node.getParent()
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
    
        if (hasChange) {
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

    graph.on('edge:connected', ({ isNew, edge }) => {
      if (isNew) {
        const sourceNode = edge.getSourceNode()
        edge.setSource(sourceNode)
        edge.setAttrs({
          absoluteLabel: {
            text: '150',
            atConnectionLength: 20,
          },
        })
        console.log(edge)
        // edge.setLabels([
        //   {
        //     markup: [
        //       {
        //         tagName: 'rect',
        //         selector: 'labelBody',
        //       },
        //       {
        //         tagName: 'text',
        //         selector: 'labelText',
        //       },
        //     ],
        //     attrs: {
        //       labelText: {
        //         text: 'Label 1',
        //         fill: '#ffa940',
        //         textAnchor: 'middle',
        //         textVerticalAnchor: 'middle',
        //       },
        //       labelBody: {
        //         ref: 'labelText',
        //         refX: -8,
        //         refY: -5,
        //         refWidth: '100%',
        //         refHeight: '100%',
        //         refWidth2: 16,
        //         refHeight2: 10,
        //         stroke: '#ffa940',
        //         fill: '#fff',
        //         strokeWidth: 2,
        //         rx: 5,
        //         ry: 5,
        //       },
        //     },
        //     position: {
        //       distance: 0.3,
        //       args: {
        //         keepGradient: true,
        //         ensureLegibility: true,
        //       },
        //     },
        //   },
        // ])
      }
    })

    ContextMenuTool.config({
      tagName: 'div',
      isSVGElement: false,
    })
    Graph.registerEdgeTool('contextmenu', ContextMenuTool, true)
    Graph.registerNodeTool('contextmenu', ContextMenuTool, true)

  }

  refContainer = (container: HTMLDivElement) => {
    this.container = container
  }

  refStencil = (container: HTMLDivElement) => {
    this.stencilContainer = container
  }

  onClick = (name: string) => {
    console.log(`${name} clicked`, 10)
  }

  render() {
    return (
      <div>
        <Toolbar className="toolbar" onClick={this.onClick} >
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
          {/* <ToolbarGroup>
            <Item name="bold" icon={<BoldOutlined />} active={true} tooltip="Bold (Cmd + B)" />
            <Item name="italic" icon={<ItalicOutlined />} tooltip="Italic (Cmd + I)" />
            <Item name="strikethrough" icon={<StrikethroughOutlined />} tooltip="Strikethrough (Cmd + Shift + x)" />
            <Item name="underline" icon={<UnderlineOutlined />} tooltip="Underline (Cmd + U)" />
          </ToolbarGroup> */}
        </Toolbar>
        <div className="stencil-app">
          <div className="app-stencil" ref={this.refStencil} />
          <div className="app-content" ref={this.refContainer}>
          </div>
        </div>
        <ComponentDrawer closeDrawer={this.closeDrawer} drawerOpen={this.state.drawerOpen} updateNode={this.updateNode} data={this.state.data} />
      </div>
    )
  }
}
