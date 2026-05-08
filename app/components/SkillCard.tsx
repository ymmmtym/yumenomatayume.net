import type { Skill } from '../data/skills'

type Props = {
  skill: Skill
}

export function SkillCard({ skill }: Props) {
  const clamped = Math.min(5, Math.max(0, skill.proficiency))
  const filled = '★'.repeat(clamped)
  const empty = '☆'.repeat(5 - clamped)

  return (
    <a
      href={skill.url}
      target="_blank"
      rel="noopener noreferrer"
      class="bg-white dark:bg-purple-900/20 rounded-lg p-4 shadow hover:shadow-lg hover:-translate-y-1 transition-all block"
    >
      <div class="text-3xl mb-2">{skill.emoji}</div>
      <div class="font-bold text-gray-900 dark:text-gray-100 mb-1">{skill.name}</div>
      <div class="text-sm text-yellow-500 dark:text-yellow-400" aria-label={`Proficiency: ${skill.proficiency} out of 5`}>{filled}{empty}</div>
    </a>
  )
}
