/**
 * Mock Dependency data
 */

export const dependencies = [
  {
    id: 'dep-001',
    title: 'Fiber Backhaul Expansion',
    taskId: 'FB-204',
    description: 'Scaling fiber network to support increased 5G throughput in metropolitan zones. Primary routing complete.',
    icon: 'fiber_manual_record',
    status: 'on-track',
    progress: 82,
    members: [
      { name: 'Carlos M.' },
      { name: 'Elena R.' },
      { name: 'Team 1' },
      { name: 'Team 2' },
      { name: 'Team 3' },
    ],
    dueDate: 'Oct 12, 2024',
  },
  {
    id: 'dep-002',
    title: 'Base Station Permitting',
    taskId: 'BP-981',
    description: 'Regulatory approval for new tower placements in Sector 7-G. Pending environmental audit.',
    icon: 'cell_tower',
    status: 'delayed',
    progress: 14,
    members: [
      { name: 'Ana T.' },
      { name: 'Legal' },
    ],
    dueDate: 'Sep 28, 2024',
  },
  {
    id: 'dep-003',
    title: 'MIMO Hardware Delivery',
    taskId: 'MH-112',
    description: 'Logistics for specialized Massive MIMO antenna arrays from regional distribution centers.',
    icon: 'memory',
    status: 'pending',
    progress: 45,
    members: [
      { name: 'Roberto G.' },
      { name: 'Javier P.' },
      { name: 'Team A' },
      { name: 'Team B' },
      { name: 'Team C' },
      { name: 'Team D' },
      { name: 'Team E' },
      { name: 'Team F' },
      { name: 'Team G' },
      { name: 'Team H' },
    ],
    dueDate: 'Nov 05, 2024',
  },
  {
    id: 'dep-004',
    title: 'Core Cloud Integration',
    taskId: 'CC-559',
    description: 'Cloud infrastructure setup for 5G core network functions. Multi-region deployment in progress.',
    icon: 'cloud_sync',
    status: 'on-track',
    progress: 67,
    members: [
      { name: 'Mar\u00eda L.' },
      { name: 'DevOps' },
      { name: 'Cloud Team' },
    ],
    dueDate: 'Dec 01, 2024',
  },
];

export const criticalPathItems = [
  {
    id: 'cp-001',
    title: 'Spectrum Licensing',
    status: 'delayed',
    impact: '14 days delay on Base Station Installation',
    owner: 'Legal / Regulatory',
  },
  {
    id: 'cp-002',
    title: 'Environmental Assessment',
    status: 'pending',
    impact: 'Blocking Base Station Permitting',
    owner: 'External Contractor',
  },
];

export const alertData = {
  title: 'CRITICAL DELAY DETECTED: Spectrum Licensing Phase',
  message: 'Primary path obstructed. Estimated impact: 14 days delay on Base Station Installation.',
  type: 'error',
  actionLabel: 'Resolve Now',
  actionId: 'spectrum-licensing',
};
