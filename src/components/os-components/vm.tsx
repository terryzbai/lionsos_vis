import {
  SystemComponentInit,
  SystemComponent,
  DataModel,
  EditableAttrs,
  common_attrs,
  common_ports
} from "./component-interface";
import { Group } from '../group'
import { Graph } from "@antv/x6";
import { randColor } from '../../utils/helper'

interface VMDataModel extends DataModel {
  type: 'VM',
  attrs: {
    name: string,
    id: number,
    priority: number,
    budget: number,
    period: number,
    pp: boolean,
  },
}

const vm_preview_attrs = {
  ...common_attrs,
  shape: 'rect',
  width: 60,
  height: 50,
  label: 'VM',
  data: {
    name: 'VM',
    cellType: 'group',
  },
  attrs: {
    text: {
      textAnchor: "middle",
    },
    body: {
      fill: '#ffd591',
      stroke: '#ffa940',
      strokeWidth: 1,
    },
  },
}

const group_attrs = {
  ...common_attrs,
  shape: 'rect',
  width: 120,
  height: 30,
  data: {},
  attrs: {
    label: {
      text: 'UntitledVM',
      fontSize: 14,
      fill: "#000000",
    },
    text: {
      textAnchor: "left",
      x: 0,
      y: 10,
    },
    body: {
      fill: '#ffd591',
      stroke: '#ffa940',
      strokeWidth: 1,
    },
  },
  ...common_ports
}

export const VMComponentInit: SystemComponentInit = {
  preview_attrs: vm_preview_attrs,
  createNode: (subsystem: Group | null) => {
    const group = new Group(group_attrs)

    const new_component = new VMComponent(group, subsystem)
    group.data = {
      component: new_component,
      parent: false,
    }

    return group
  }
}

export class VMComponent implements SystemComponent {
  component_json: any;
  graph: Graph;
  node: Group;

  data: VMDataModel = {
    node_id: '',
    type: 'VM',
    attrs: {
      name: 'UntitledVM',
      id: 0,
      priority: 0,
      budget: 0,
      period: 0,
      pp: false,
    },
    subsystem: null,
  };

  editable_attrs : Array<EditableAttrs> = [
    { name: 'name', type: 'string', required: true },
    { name: 'id', type: 'number', min: 0, max: 255, required: true },
    { name: 'priority', type: 'number', min: 0, max: 255, required: true },
    { name: 'budget', type: 'number', min: 0, max: 1000, required: false },
    { name: 'period', type: 'number', min: 0, max: 1000, required: false },
    { name: 'pp', type: 'boolean', required: true },
  ]

  constructor(node: Group, subsystem: Group | null) {
    this.node = node
    this.data.subsystem = subsystem
  }

  public getData = () => {
    return this.data
  }

  public getType = () => {
    return this.data.type
  }

  public getAttrValues = () => {
    return this.data.attrs
  }

  public renderChildrenNodes = (graph: Graph) => {}

  public renderUnchangableNodes = () => {
    return <></>
  }

  // Update style if attributes are modified, e.g. PD names
  // Render children nodes if exist
  public updateAttrs = (new_data : any) => {
    if (this.node) {
      this.data = {...this.data, attrs: new_data}
      this.node.setAttrs({ label: { text: new_data.name } })
    }
  }

  // Generate JSON for the component
  public getJson = () => {
    // const children = this.getJson(PD.children)
    const children = this.node.children?.map(child => {
      return child.data.component.getJson()
    })

    console.log(children)
    const json = {
      ...this.data.attrs,
      type: this.data.type,
      // maps: getMapJson(PD.data.mappings),
      // irqs: PD.data.irqs
    }
    return json
  }
}
