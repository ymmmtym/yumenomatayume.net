import type { Skill } from '../data/skills'

interface SkillCardProps {
  skill: Skill
}

export function SkillCard({ skill }: SkillCardProps) {
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
      <div role="img" class="text-sm" aria-label={`Proficiency: ${clamped} out of 5`}>
        <span class="text-yellow-500 dark:text-yellow-400">{filled}</span>
        <span class="text-gray-300 dark:text-gray-600">{empty}</span>
      </div>
    </a>
  )
}
