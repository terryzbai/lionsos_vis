import React from 'react';
import { Graph } from '@antv/x6'
import { Snapline } from '@antv/x6-plugin-snapline'
import { Stencil } from '@antv/x6-plugin-stencil'
import { stencil_group, custom_nodes } from '../components/nodes'
import { ContextMenuTool } from '../components/context-menu'

/*
TODO:
[x] Embedding by Drag and Drop: https://x6.antv.antgroup.com/en/examples/node/group/#embedding-by-dnd
[x] Delete Button: https://x6.antv.antgroup.com/en/examples/node/tool/#button-remove
[ ] Collapse/Expand the Parent Node: https://x6.antv.antgroup.com/en/examples/node/group/#collapsable
[ ] Detaching node: https://x6.antv.antgroup.com/en/examples/edge/tool/#context-menu
[ ] Auto Expand/Shrink the Parent Node: https://x6.antv.antgroup.com/en/examples/node/group/#expand-shrink
[ ] Ajusting arrowheads: https://x6.antv.antgroup.com/en/examples/edge/tool#arrowheads
[ ] Updating edges: https://x6.antv.antgroup.com/tutorial/basic/events
*/

export default class DiagramEditor extends React.Component<{openDrawer : Function}> {
  private container: HTMLDivElement
  private stencilContainer: HTMLDivElement

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
        const { width, height } = node.size()
				node.addPort({
					id: 'port_1',
          group: 'bottom',
				})

        return node.clone().size(width * 2, height * 2)
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