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
import { PDComponentInit } from "./pd"

interface SerialDataModel extends DataModel {
  type: 'sddf_subsystem',
  attrs: {
    class: string,
    client1: string,
    client2: string,
    device_node: string,
    driver_name: string,
    serial_mux_tx: string,
    serial_mux_rx: string,
    data_region_size: number,
  },
}

const serial_preview_attrs = {
  ...common_attrs,
  shape: 'rect',
  width: 80,
  height: 40,
  label: 'Serial',
  data: {
    name: 'Serial',
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
  width: 500,
  height: 320,
  data: {},
  attrs: {
    label: {
      text: 'Serial System',
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
      stroke: '#ffffff',
      strokeWidth: 1,
      rx: 6,
      ry: 6,
    },
  },
  ...common_ports
}

export const SerialComponentInit: SystemComponentInit = {
  preview_attrs: serial_preview_attrs,
  createNode: () => {
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

    const new_component = new SerialComponent(group)
    group.data = {
      component: new_component,
      parent: true,
    }

    return group
  }
}

export class SerialComponent implements SystemComponent {
  component_json: any;
  graph: Graph;
  node: Group;
  children: {
    driver: Group | null,
    mux_tx: Group | null,
    mux_rx: Group | null,
  } = {
    driver: null,
    mux_tx: null,
    mux_rx: null,
  }

  data: SerialDataModel = {
    node_id: '',
    type: 'sddf_subsystem',
    attrs: {
      class: 'serial',
      client1: '',
      client2: '',
      device_node: '',
      driver_name: 'serial_driver',
      serial_mux_tx: 'serial_mux_tx',
      serial_mux_rx: 'serial_mux_rx',
      data_region_size: 0x1000,
    },
    subsystem: null,
  };

  editable_attrs: EditableAttrs[] = [
    { name: 'driver_name', type: 'string', required: true },
    { name: 'driver_node', type: 'string', required: true },
    { name: 'serial_mux_tx', type: 'string', required: true },
    { name: 'serial_mux_rx', type: 'string', required: true },
    { name: 'data_region_size', type: 'number', required: true }
  ];

  constructor(node: Group) {
    this.node = node
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

  private syncChildrenData = () => {
    const driver_component = this.children.driver.data.component
    driver_component.updateAttrs({...driver_component.getAttrValues(), name: this.data.attrs.driver_name})
    //serial_driver.data.subsystem = serial_system

    const mux_tx_component = this.children.mux_tx.data.component
    mux_tx_component.updateAttrs({...mux_tx_component.getAttrValues(), name: this.data.attrs.serial_mux_tx})
    //mux_tx.data.subsystem = serial_system

    const mux_rx_component = this.children.mux_rx.data.component
    mux_rx_component.updateAttrs({...mux_rx_component.getAttrValues(), name: this.data.attrs.serial_mux_rx})
    //mux_rx.data.subsystem = serial_system
  }

  public renderChildrenNodes = (graph: Graph) => {
    const serial_system = this.node
    const {x, y} = serial_system.getPosition()

    // Add serial driver
    const serial_driver = PDComponentInit.createNode(serial_system)
    serial_driver.position(x + 280, y + 100)
    serial_system.addChild(serial_driver)
    this.children.driver = serial_driver

    // Add mux_tx PD
    const mux_tx = PDComponentInit.createNode(serial_system)
    mux_tx.position(x + 40, y + 40)
    serial_system.addChild(mux_tx)
    serial_system.data.mux_tx = mux_tx.id
    this.children.mux_tx = mux_tx

    // Add mux_rx PD
    const mux_rx = PDComponentInit.createNode(serial_system)
    mux_rx.position(x + 40, y + 180)
    serial_system.addChild(mux_rx)
    serial_system.data.mux_rx = mux_rx.id
    this.children.mux_rx = mux_rx

    this.syncChildrenData()
  }

  public renderUnchangableNodes = () => {
    return <></>
  }

  // Update style if attributes are modified, e.g. PD names
  // Render children nodes if exist
  public updateAttrs = (new_data : any) => {
    if (this.node) {
      this.data = {...this.data, attrs: new_data}
      // this.node.setAttrs({ label: { text: new_data.name } })
      this.syncChildrenData()
    }
  }

  // Generate JSON for the component
  public getJson = () => {
    return this.data.attrs
  }
}
