/**
 * Mock Team Member data
 */

export const teamMembers = [
  {
    id: 'tech-001',
    name: 'Carlos Mendoza',
    role: 'Senior Network Architect',
    bu: 'BU-14',
    department: 'Infrastructure',
    avatarUrl: null,
    status: 'busy',
    availableHours: 4,
    totalHours: 40,
    skills: ['BGP/OSPF', 'Cisco Core', '5G Slicing'],
  },
  {
    id: 'tech-002',
    name: 'Elena Rivas',
    role: 'Cloud Solutions Engineer',
    bu: 'BU-08',
    department: 'Cloud Systems',
    avatarUrl: null,
    status: 'free',
    availableHours: 32,
    totalHours: 40,
    skills: ['AWS/Azure', 'Kubernetes', 'Terraform'],
  },
  {
    id: 'tech-003',
    name: 'Javier Portillo',
    role: 'Security Operations Lead',
    bu: 'BU-14',
    department: 'Infrastructure',
    avatarUrl: null,
    status: 'partial',
    availableHours: 18,
    totalHours: 40,
    skills: ['Firewalls', 'Zero Trust', 'SIEM'],
  },
  {
    id: 'tech-004',
    name: 'Mar\u00eda L\u00f3pez',
    role: 'DevOps Engineer',
    bu: 'BU-09',
    department: 'Cloud Systems',
    avatarUrl: null,
    status: 'partial',
    availableHours: 16,
    totalHours: 40,
    skills: ['Docker', 'CI/CD', 'Ansible'],
  },
  {
    id: 'tech-005',
    name: 'Roberto Garc\u00eda',
    role: 'RF Planning Specialist',
    bu: 'BU-01',
    department: 'Network',
    avatarUrl: null,
    status: 'busy',
    availableHours: 2,
    totalHours: 40,
    skills: ['RF Design', '5G NR', 'Nokia AirScale'],
  },
  {
    id: 'tech-006',
    name: 'Ana Torres',
    role: 'Database Administrator',
    bu: 'BU-14',
    department: 'Infrastructure',
    avatarUrl: null,
    status: 'free',
    availableHours: 28,
    totalHours: 40,
    skills: ['PostgreSQL', 'Redis', 'MongoDB'],
  },
];

export const vacancies = [
  {
    id: 'vac-001',
    title: 'L3 Network Support',
    bu: 'BU-14',
    priority: 'CR\u00cdTICA',
    skills: ['Nokia AirScale', 'RAN', 'Core 5G'],
  },
  {
    id: 'vac-002',
    title: 'Cloud Security Analyst',
    bu: 'BU-09',
    priority: 'ALTA',
    skills: ['AWS Security', 'IAM', 'CloudTrail'],
  },
  {
    id: 'vac-003',
    title: 'Automation Engineer',
    bu: 'BU-05',
    priority: 'NORMAL',
    skills: ['Python', 'Ansible', 'Terraform'],
  },
];

export const teamFilterOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'network', label: 'Network' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'security', label: 'Security' },
];
