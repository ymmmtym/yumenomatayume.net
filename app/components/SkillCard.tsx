import type { Skill } from '../data/skills'

type Props = {
  skill: Skill
}

export function SkillCard({ skill }: Props) {
  const filled = '★'.repeat(skill.proficiency)
  const empty = '☆'.repeat(5 - skill.proficiency)

  return (
    <a
      href={skill.url}
      target="_blank"
      rel="noopener noreferrer"
      class="bg-white dark:bg-purple-900/20 rounded-lg p-4 shadow hover:shadow-lg hover:-translate-y-1 transition-all block"
    >
      <div class="text-3xl mb-2">{skill.emoji}</div>
      <div class="font-bold text-gray-900 dark:text-gray-100 mb-1">{skill.name}</div>
      <div class="text-sm text-yellow-500 dark:text-yellow-400">{filled}{empty}</div>
    </a>
  )
}
