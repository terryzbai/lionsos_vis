
const commonAttrs = {
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

const stencil_group = [
  {
    name: 'Basic',
    title: 'Basic',
  }, {
    name: 'Advanced',
    title: 'Advanced',
  }
]

const custom_nodes = {
  'Basic': [{
    ...commonAttrs,
    shape: 'rect',
    x: 40,
    y: 40,
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
  }, {
    ...commonAttrs,
    shape: 'rect',
    x: 100,
    y: 40,
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
  },
  ],
  'Advanced': [{
    ...commonAttrs,
    shape: 'rect',
    x: 40,
    y: 40,
    width: 80,
    height: 40,
    label: 'sDDF',
  }]
};

const custom_group = {
  'PD': {
    ...commonAttrs,
    shape: 'rect',
    width: 200,
    height: 120,
    data: {
      type: 'PD',
      color: '#FFFFFF',
      parent: true,
      attrs: {
        name: 'Untitled PD',
        priority: 0,
        budget: 0,
        period: 0,
        pp: 0,
        prog_img: 'default.elf',
      },
      mappings: [],
      irqs: [],
    },
    attrs: {
      label: {
        text: 'Untitled PD',
        fontSize: 18,
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
              r: 5,
            },
          },
        },
      },
    },
  },
  'VM': {
    ...commonAttrs,
    shape: 'rect',
    width: 120,
    height: 40,
    data: {
      type: 'VM',
      color: '#FFFFFF',
      parent: false,
      attrs: {
        name: 'Untitled VM',
        id: 0,
        priority: 0,
        budget: 0,
        period: 0,
        pp: 0,
      },
      mappings: [],
      irqs: [],
    },
    attrs: {
      label: {
        text: 'Untitled VM',
        fontSize: 12,
        fill: "#000000",
      },
      text: {
        textAnchor: "left",
        x: 0,
        y: 12,
      },
      body: {
        fill: '#ffd591',
        stroke: '#ffa940',
        strokeWidth: 1,
      },
    },
  },
}

export const init_node_data = {
  'PD': {
    name: 'Untitled PD',
    priority: 0,
    budget: 0,
    period: 0,
    pp: 0,
    prog_img: 'default.elf',
    mappings: [],
    pds: [],
    vms: [],
    parent: '',
  },
  'VM': {
    name: 'Untitled VM',
    priority: 0,
    budget: 0,
    period: 0,
    pp: 0,
    prog_img: 'default.elf',
    mappings: [],
    pds: [],
    vms: [],
    parent: '',
  },
}

export { stencil_group, custom_nodes, custom_group }