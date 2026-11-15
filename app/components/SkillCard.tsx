import type { Skill } from '../data/skills'

interface SkillCardProps {
  skill: Skill
}

export function SkillCard({ skill }: SkillCardProps) {
  const clamped = Math.min(5, Math.max(0, skill.proficiency))
  const filled = '★\uFE0E'.repeat(clamped)
  const empty = '☆\uFE0E'.repeat(5 - clamped)

  return (
    <a
      href={skill.url}
      target="_blank"
      rel="noopener noreferrer"
      class="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/60 dark:hover:border-brand-500/50"
    >
      <div class="mb-2 text-3xl">{skill.emoji}</div>
      <div class="mb-1 font-bold text-gray-900 dark:text-gray-100">{skill.name}</div>
      <div role="img" class="text-sm" aria-label={`Proficiency: ${clamped} out of 5`}>
        <span class="text-amber-400">{filled}</span>
        <span class="text-gray-300 dark:text-gray-600">{empty}</span>
      </div>
    </a>
  )
}
