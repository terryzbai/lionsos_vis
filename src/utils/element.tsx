/* Ref: https://github.com/Ivan-Velickovic/microkit/blob/dev/tool/microkit/sysxml.py */

export interface MemoryRegion {
	name: string
	size: number
	phyAddr: number
	pageSize?: number
	pageCount: number
}

export interface ProtectionDomain {
	id_?: number
	name: string
	priority: number
	budget: number
	period: number
	cpu_affinity: number
	pp: boolean
	passive: boolean
	smc: boolean
	program_image: string
	virtual_machine?: string
}

export interface Channel {
	pd_a: string
	id_a: number
	pd_b: string
	id_b: number
}

export interface VirtualMachine {
	name: string
	id_: number
	cpu_affinity: number
	maps: []
	priority: number
	budget: number
	period: number
}

export interface SysMap {
	mr: string
	vaddr: number
	perms: string
	cached: boolean
}

export interface SysIrq {
	irq: number
	id_: number
	trigger: string
}

export interface SysSetVar {
	symbol: string
	region_paddr?: string
	vaddr?: number
}