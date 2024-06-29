import { Graph } from '@antv/x6'
import { Group } from '../group';

// Json format for passing configurations to WASM
export interface SystemComponentJsonFormat {}

// Data model of this component
export interface DataModel {
  node_id : string;
  attrs: object;
  subsystem: Group | null;
}

export interface EditableAttrs {
    name: string,
    type: 'string' | 'number' | 'boolean' | 'options',
    required: boolean,
    options?: Array<string>,
    min?: number,
    max?: number,
}

export const common_attrs = {
  ports: {
    groups: {
      bottom: {
        position: 'bottom',
        attrs: {
          circle: {
            magnet: true,
            stroke: '#8f8f8f',
            r: 5,
          },
        },
      },
    },
  },
}

export const common_ports = {
  ports: {
    groups: {
      top: {
        position: 'top',
        attrs: {
          circle: {
            magnet: true,
            stroke: '#8f8f8f',
            r: 0,
          },
        },
      },
      left: {
        position: 'left',
        attrs: {
          circle: {
            magnet: true,
            stroke: '#8f8f8f',
            r: 0,
          },
        },
      },
      right: {
        position: 'right',
        attrs: {
          circle: {
            magnet: true,
            stroke: '#8f8f8f',
            r: 0,
          },
        },
      },
      bottom: {
        position: 'bottom',
        attrs: {
          circle: {
            magnet: true,
            stroke: '#8f8f8f',
            r: 0,
          },
        },
      },
    },
  }
}

export interface SystemComponentInit {
  preview_attrs: object,
  createNode: (subsystem: Group | null) => Group
}

export interface SystemComponent {
  component_json : any;
  data : DataModel;    
  graph : Graph;
  // Editable attributes, will be shown in Attributes Form
  editable_attrs : Array<EditableAttrs>;

  renderChildrenNodes: (graph: Graph) => void
  renderUnchangableNodes: () => JSX.Element

  getType: () => string
  getData: () => DataModel

  getAttrValues: () => object
  
  // Update style if attributes are modified, e.g. PD names
  // Render children nodes if exist
  updateAttrs: (new_data : any) => void

  // Generate JSON for the component
  getJson: () => object
}

