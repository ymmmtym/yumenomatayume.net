export interface Skill {
  name: string
  emoji: string
  url: string
  proficiency: number
}

export const skills: Skill[] = [
  { name: 'Ansible', emoji: '🔧', url: 'https://www.ansible.com/', proficiency: 3 },
  { name: 'Linux', emoji: '🐧', url: 'https://www.linux.org/', proficiency: 4 },
  { name: 'Terraform', emoji: '🏗️', url: 'https://www.terraform.io/', proficiency: 4 },
  { name: 'Kubernetes', emoji: '☸️', url: 'https://kubernetes.io/', proficiency: 3 },
  { name: 'AWS', emoji: '☁️', url: 'https://aws.amazon.com/', proficiency: 5 },
  { name: 'GCP', emoji: '🌐', url: 'https://cloud.google.com/', proficiency: 3 },
]
