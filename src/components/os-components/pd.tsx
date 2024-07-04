import {
  SystemComponentInit,
  SystemComponent,
  DataModel,
  EditableAttrs,
  parseMapJson,
  common_attrs,
  common_ports,
} from "./component-interface";
import { Group } from '../group'
import { Graph } from "@antv/x6";
import { randColor } from '../../utils/helper'
import { SysMapItem } from '../mapping-table'
import { SysIrq } from '../irq-table'

interface PDDataModel extends DataModel {
  type: 'PD',
  color: string,
  attrs: {
    name: string,
    priority: number,
    budget: number,
    period: number,
    pp: boolean,
    prog_img: string,
  },
  mappings: SysMapItem[],
  irqs: SysIrq[],
}

export const pd_preview_attrs = {
  ...common_attrs,
  shape: 'rect',
  width: 80,
  height: 40,
  label: 'PD',
  data: {
    name: 'PD',
    cellType: 'group',
  },
  attrs: {
    body: {
    fill: '#efdbff',
    stroke: '#9254de',
    strokeWidth: 1,
    },
  },
}

const group_attrs = {
  ...common_attrs,
  shape: 'rect',
  width: 200,
  height: 120,
  data: {},
  attrs: {
    label: {
      text: 'UntitledPD',
      fontSize: 16,
      fill: "#000000",
    },
    text: {
      textAnchor: "left",
      x: 0,
      y: 12,
    },
    body: {
      fill: '#efdbff',
      stroke: '#9254de',
      strokeWidth: 1,
    },
  },
  ...common_ports
}

export const PDComponentInit: SystemComponentInit = {
  preview_attrs: pd_preview_attrs,
  createNode: (subsystem: string | null) => {
    const group = new Group(group_attrs)
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

    const new_component = new PDComponent(subsystem)
    group.data = {
      component: new_component,
      parent: true,
    }

    return group
  }
}

export class PDComponent implements SystemComponent {
  data: PDDataModel = {
    node_id: '',
    type: 'PD',
    color: '#FFFFFF',
    attrs: {
      name: 'UntitledPD',
      priority: 0,
      budget: 0,
      period: 0,
      pp: false,
      prog_img: 'default.elf',
    },
    mappings: [],
    irqs: [],
    subsystem: null,
  };

  editable_attrs: EditableAttrs[] = [
    { name: 'name', type: 'string', required: true },
    { name: 'priority', type: 'number', min: 0, max: 255, required: true },
    { name: 'budget', type: 'number', min: 0, max: 1000, required: false },
    { name: 'period', type: 'number', min: 0, max: 1000, required: false },
    { name: 'pp', type: 'boolean', required: true },
    { name: 'prog_img', type: 'string', required: true },
  ];

  constructor(subsystem: string | null) {
    this.data.color = randColor()
    this.data.subsystem = subsystem
  }

  public getData = () => {
    return this.data
  }

  public getType = () => {
    return this.data.type
  }

  public getMappings = () => {
    return this.data.mappings
  }

  public getAttrValues = () => {
    return this.data.attrs
  }

  public isPartOfSubsystem = () => {
    return this.data.subsystem != null
  }

  public renderChildrenNodes = (graph: Graph) => {}

  public renderUnchangableNodes = () => {
    return <div style={ {width: '50%', height: '10px', margin: '10px', backgroundColor: this.data.color}}></div>
  }

  // Update style if attributes are modified, e.g. PD names
  // Render children nodes if exist
  public updateData = (new_data : any) => {
    this.data = {...this.data, ...new_data}
    // TODO: update component labels in diagram-editor.tsx
    //   if (this.node) {
    //     this.node.setAttrs({ label: { text: this.data.attrs.name } })
    //   }
  }

  // Generate JSON for the component
  public getJson = (node?: Group) => {
    var children = []
    if (node) {
      children = node.children?.map(child => {
        return child.data.component.getJson()
      })
    }

    const mappings = parseMapJson(this.data.mappings)

    return {
      ...this.data.attrs,
      children: children ? children : [],
      type: this.data.type,
      maps: mappings,
      irqs: this.data.irqs,
    }
  }
}
