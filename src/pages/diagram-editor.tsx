import React from 'react';
import { Graph } from '@antv/x6'
import { Snapline } from '@antv/x6-plugin-snapline'
import { Stencil } from '@antv/x6-plugin-stencil'
import { stencil_group, custom_nodes, custom_group } from '../components/nodes'
import { ContextMenuTool } from '../components/context-menu'
import { Group } from '../components/group'

/*
TODO:
[x] Embedding by Drag and Drop: https://x6.antv.antgroup.com/en/examples/node/group/#embedding-by-dnd
[x] Delete Button: https://x6.antv.antgroup.com/en/examples/node/tool/#button-remove
[x] Auto Expand/Shrink the Parent Node: https://x6.antv.antgroup.com/en/examples/node/group/#expand-shrink
[x] Collapse/Expand the Parent Node: https://x6.antv.antgroup.com/en/examples/node/group/#collapsable
[x] Detaching node: https://x6.antv.antgroup.com/en/examples/edge/tool/#context-menu
[x] Ajusting arrowheads: https://x6.antv.antgroup.com/en/examples/edge/tool#arrowheads
[ ] Export configurations
[ ] zIndex issue
[ ] Toobar: 
[ ] Updating edges: https://x6.antv.antgroup.com/tutorial/basic/events
*/

export default class DiagramEditor extends React.Component<{openDrawer : Function}> {
  private container: HTMLDivElement
  private stencilContainer: HTMLDivElement
  private ctrlPressed: boolean

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
      this.props.openDrawer(ev.node.id)
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

  render() {
    return (
      <div className="stencil-app">
        <div className="app-stencil" ref={this.refStencil} />
        <div className="app-content" ref={this.refContainer} />
      </div>
    )
  }
}