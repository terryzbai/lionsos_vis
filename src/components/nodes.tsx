// import { Graph } from '@antv/x6';

const commonAttrs = {
  body: {
    fill: '#fff',
    stroke: '#8f8f8f',
    strokeWidth: 1,
  },
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
	// tools: [
  //   {
  //     name: 'contextmenu',
  //     args: [
	// 			{
	// 				key: 'copy',
	// 				label: '复制',
	// 			},
	// 			{
	// 				key: 'paste',
	// 				label: '粘贴',
	// 			},
	// 			{
	// 				key: 'delete',
	// 				label: '删除',
	// 				type: 'danger',
	// 			},
	// 		],
  //   },
  // ],
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
		name: 'pd',
    shape: 'rect',
    x: 40,
    y: 40,
    width: 80,
    height: 40,
    label: 'PD',
		data: {
			parent: true,
		},
    ...commonAttrs,
  }, {
		name: 'vm',
		shape: 'rect',
		x: 100,
		y: 40,
		width: 30,
		height: 20,
		label: 'VM',
		...commonAttrs
	}],
	'Advanced': [{
		name: 'sDDF',
		shape: 'rect',
		x: 40,
		y: 40,
		width: 80,
		height: 40,
		label: 'sDDF',
		...commonAttrs,
	}]
};

export { stencil_group, custom_nodes }