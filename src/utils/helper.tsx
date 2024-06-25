import { Graph } from "@antv/x6"

export const getValidEndID = (edges : Array<any>, node_id : string) => {
    return 1
}

export const channelLabelConfig = (source_end_id : string, target_end_id : string) => {
  return [
    {
      markup: [
        {
          tagName: 'rect',
          selector: 'labelBody',
        },
        {
          tagName: 'text',
          selector: 'labelText',
        },
      ],
      attrs: {
        labelText: {
          text: source_end_id,
          fill: '#ffa940',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
        },
        labelBody: {
          ref: 'labelText',
          refX: -8,
          refY: -5,
          refWidth: '100%',
          refHeight: '100%',
          refWidth2: 16,
          refHeight2: 10,
          stroke: '#ffa940',
          fill: '#fff',
          strokeWidth: 2,
          rx: 5,
          ry: 5,
        },
      },
      position: {
        distance: 20,
        args: {
          keepGradient: true,
          ensureLegibility: true,
        },
      },
    }, {
      markup: [
        {
          tagName: 'rect',
          selector: 'labelBody',
        },
        {
          tagName: 'text',
          selector: 'labelText',
        },
      ],
      attrs: {
        labelText: {
          text: target_end_id,
          fill: '#ffa940',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
        },
        labelBody: {
          ref: 'labelText',
          refX: -8,
          refY: -5,
          refWidth: '100%',
          refHeight: '100%',
          refWidth2: 16,
          refHeight2: 10,
          stroke: '#ffa940',
          fill: '#fff',
          strokeWidth: 2,
          rx: 5,
          ry: 5,
        },
      },
      position: {
        distance: -20,
        args: {
          keepGradient: true,
          ensureLegibility: true,
        },
      },
    },
  ]
}

export const randColor = () => {
  const color = "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase()
  return color
}

export const closestBorder = (box : {x : number, y : number, width: number, height: number }, point : { x: number, y: number }) => {
  // box is an object with x, y, width, and height properties
  // point is an object with x and y properties
  const boxLeft = box.x
  const boxRight = box.x + box.width
  const boxTop = box.y
  const boxBottom = box.y + box.height

  // Calculate distances to each side
  const distanceToLeft = Math.abs(point.x - boxLeft)
  const distanceToRight = Math.abs(point.x - boxRight)
  const distanceToTop = Math.abs(point.y - boxTop)
  const distanceToBottom = Math.abs(point.y - boxBottom)

  if (Math.abs(distanceToLeft - distanceToRight) != box.width) {
    return (distanceToTop < distanceToBottom) ? 'top' : 'bottom'
  }
  if (Math.abs(distanceToTop - distanceToBottom) != box.width) {
    return (distanceToLeft < distanceToRight) ? 'left' : 'right'
  }
  
  // Determine the minimum distance
  const minHorizontalDistance = Math.min(distanceToLeft, distanceToRight)
  const minVerticalDistance = Math.min(distanceToTop, distanceToBottom)

  // Find the closest border
  if (minHorizontalDistance < minVerticalDistance) {
    return (distanceToLeft < distanceToRight) ? 'left' : 'right'
  } else {
    return (distanceToTop < distanceToBottom) ? 'top' : 'bottom'
  }
}


export const reassignEdgesForComponent = (graph : Graph) => {
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
      if (portId === 'port_1' || portId == null) {
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
