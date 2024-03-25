import React, { useEffect, useState } from 'react'
import { Graph } from '@antv/x6'
import { Stencil } from '@antv/x6-plugin-stencil'
import { Snapline } from '@antv/x6-plugin-snapline'
import { Group } from '../components/group'
import { Toolbar } from '@antv/x6-react-components'
import NodeEditor from '../components/node-editor'
import { stencil_group, custom_nodes, custom_group } from '../components/nodes'
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
import { useAppSelector, useAppDispatch } from '../app/hooks'
import { addPD, getPDList, openNodeEditor } from '../features/configSlice'

const Item = Toolbar.Item // eslint-disable-line
const ToolbarGroup = Toolbar.Group // eslint-disable-line

export const TestEditor = () => {
  const refGraphContainer = React.createRef<HTMLDivElement>()
  const refStencilContainer = React.createRef<HTMLDivElement>()
	const [ ctrlPressed, setCtrlPressed ] = useState(false)

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
			const node_name = node.getAttrs().text.text

			const group = new Group(custom_group[String(node_name)])
			group.addPort({
				id: 'port_1',
				group: 'bottom',
			})

			addNode(group.id)
			return group
		},
	}

	const pds = useAppSelector(state => state.config.pds)
	const dispatch = useAppDispatch()
	const addNode = (node_id) => {
		dispatch(addPD(node_id))
		console.log(pds)
	}

  useEffect(() => {
		console.log(111111)
    const graph = new Graph({
			...graph_config,
			container: refGraphContainer.current,
		})
  
    graph.use(
      new Snapline({
        enabled: true,
        sharp: true,
      }),
    )
    graph.centerContent()

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
			dispatch(openNodeEditor(ev.node.id))
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

		// setCtrlPressed(false)
    graph.on('node:embedding', ({ e }: { e }) => {
			setCtrlPressed(e.metaKey || e.ctrlKey)
			// setCtrlPressed(true)
			// console.log(ctrlPressed, e.metaKey || e.ctrlKey)
    })
    
    graph.on('node:embedded', () => {
			setCtrlPressed(false)
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
			console.log(options)

      if (options.skipParentHandler || ctrlPressed) {
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

  }, [])


  return (
    <div>
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
        {/* <ToolbarGroup>
          <Item name="bold" icon={<BoldOutlined />} active={true} tooltip="Bold (Cmd + B)" />
          <Item name="italic" icon={<ItalicOutlined />} tooltip="Italic (Cmd + I)" />
          <Item name="strikethrough" icon={<StrikethroughOutlined />} tooltip="Strikethrough (Cmd + Shift + x)" />
          <Item name="underline" icon={<UnderlineOutlined />} tooltip="Underline (Cmd + U)" />
        </ToolbarGroup> */}
      </Toolbar>
      <div className="stencil-app">
        <div className="app-stencil" ref={refStencilContainer} />
        <div className="app-content" ref={refGraphContainer}>
        </div>
      </div>
      <NodeEditor />
			<div>{pds.length}</div>
			{pds.map(function (x, i) {
				return <div key={i}>{x.id} & <span>{x.name}</span></div>;
			})}
			<div>{ctrlPressed ? "B": "a"}</div>
    </div>
  )
}