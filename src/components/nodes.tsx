
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
			parent: true,
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
	}],
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
			parent: true,
		},
		attrs: {
			label: {
				text: 'PD',
				fontSize: 18,
				fill: "#000000",
			},
			text: {
				textAnchor: "middle",
				x: 10,
				y: 12,
			},
			body: {
				fill: '#efdbff',
				stroke: '#9254de',
				strokeWidth: 1,
			},
		},
	},
	'VM': {
		...commonAttrs,
		shape: 'rect',
		width: 80,
		height: 60,
		label: 'VM',
		attrs: {
			label: {
				text: 'VM',
				fontSize: 18,
				fill: "#000000",
			},
			text: {
				textAnchor: "middle",
				x: 10,
				y: 12,
			},
			body: {
				fill: '#ffd591',
				stroke: '#ffa940',
				strokeWidth: 1,
			},
		},
	}
}

export { stencil_group, custom_nodes, custom_group }