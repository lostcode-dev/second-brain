<script setup lang="ts">
import { DIFFICULTY_META, FREQUENCY_META, HABIT_TYPE_META } from '~/types/habits'
import type { SharedHabitCardData } from '~/types/habits'

export type ShareFormat = 'square'

const props = defineProps<{
  format?: ShareFormat
  userName?: string
  data: SharedHabitCardData
  date: string
}>()

const habit = computed(() => props.data.habit)

const difficultyLabel = computed(() =>
  DIFFICULTY_META[habit.value.difficulty as keyof typeof DIFFICULTY_META]?.label ?? habit.value.difficulty
)

const difficultyColor = computed(() => {
  const tone = DIFFICULTY_META[habit.value.difficulty as keyof typeof DIFFICULTY_META]?.color
  if (tone === 'success') return '#34d399'
  if (tone === 'warning') return '#f59e0b'
  return '#fb7185'
})

const frequencyLabel = computed(() =>
  FREQUENCY_META[habit.value.frequency as keyof typeof FREQUENCY_META]?.label ?? habit.value.frequency
)

const habitTypeLabel = computed(() =>
  HABIT_TYPE_META[habit.value.habitType as keyof typeof HABIT_TYPE_META]?.label ?? habit.value.habitType
)

const habitTypeAccent = computed(() => {
  const tone = HABIT_TYPE_META[habit.value.habitType as keyof typeof HABIT_TYPE_META]?.color
  return tone === 'error' ? '#fb7185' : '#2dd4bf'
})

const description = computed(() => {
  const raw = habit.value.description
    ?.replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!raw) {
    return 'Um passo pequeno, repetido com consistência, muda a direção dos próximos meses.'
  }

  if (raw.length <= 150) return raw
  return `${raw.slice(0, 147)}...`
})

const createdAtLabel = computed(() => {
  const date = new Date(habit.value.createdAt)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
})

const shareDateLabel = computed(() => {
  const date = new Date(`${props.date}T12:00:00`)
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
})

const completionTone = computed(() => {
  const rate = props.data.completionRate30d
  if (rate >= 80) return '#34d399'
  if (rate >= 50) return '#fbbf24'
  return '#fb7185'
})
</script>

<template>
  <div class="share-card">
    <div class="share-card__pattern" />
    <div class="share-card__glow share-card__glow--top" />
    <div class="share-card__glow share-card__glow--bottom" />

    <div class="share-card__content">
      <header class="share-card__header">
        <div>
          <p class="share-card__eyebrow">Second Brain Presents</p>
          <p class="share-card__date">{{ shareDateLabel }}</p>
        </div>
        <div class="share-card__user-block">
          <span class="share-card__user-label">Hábito em destaque</span>
          <strong class="share-card__user-name">{{ userName || 'Meu ciclo atual' }}</strong>
        </div>
      </header>

      <section class="share-card__hero">
        <div class="share-card__hero-copy">
          <p class="share-card__hero-label">Spotify Wrapped de hábitos</p>
          <h1 class="share-card__habit-name">{{ habit.name }}</h1>
          <p class="share-card__description">{{ description }}</p>
        </div>

        <div class="share-card__meter">
          <div class="share-card__meter-ring">
            <span class="share-card__meter-value" :style="{ color: completionTone }">{{ data.completionRate30d }}%</span>
          </div>
          <span class="share-card__meter-label">consistência 30d</span>
        </div>
      </section>

      <section class="share-card__metrics">
        <div class="share-card__metric">
          <span class="share-card__metric-kicker">Streak</span>
          <strong class="share-card__metric-value">{{ habit.streakCurrent }} dias</strong>
          <span class="share-card__metric-caption">sequência atual</span>
        </div>
        <div class="share-card__metric">
          <span class="share-card__metric-kicker">Últimos 7 dias</span>
          <strong class="share-card__metric-value">{{ data.completionRate7d }}%</strong>
          <span class="share-card__metric-caption">ritmo recente</span>
        </div>
        <div class="share-card__metric">
          <span class="share-card__metric-kicker">Check-ins 30d</span>
          <strong class="share-card__metric-value">{{ data.totalCompletions30d }}</strong>
          <span class="share-card__metric-caption">marcas concluídas</span>
        </div>
      </section>

      <section class="share-card__tags">
        <span class="share-card__tag">{{ frequencyLabel }}</span>
        <span class="share-card__tag" :style="{ borderColor: difficultyColor, color: difficultyColor }">{{ difficultyLabel }}</span>
        <span class="share-card__tag" :style="{ borderColor: habitTypeAccent, color: habitTypeAccent }">{{ habitTypeLabel }}</span>
        <span v-if="habit.identityName" class="share-card__tag">{{ habit.identityName }}</span>
        <span v-if="habit.scheduledTime" class="share-card__tag">{{ habit.scheduledTime }}</span>
      </section>

      <footer class="share-card__footer">
        <div class="share-card__footer-line">
          <span class="share-card__footer-copy">Começou em {{ createdAtLabel || 'um novo ciclo' }}</span>
          <span class="share-card__footer-copy">Sistemas &gt; motivação</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.share-card {
  position: relative;
  width: 1080px;
  height: 1080px;
  overflow: hidden;
  color: #f8fafc;
  background:
    radial-gradient(circle at top left, #2dd4bf 0%, rgba(45, 212, 191, 0) 28%),
    radial-gradient(circle at bottom right, #7c3aed 0%, rgba(124, 58, 237, 0) 32%),
    linear-gradient(140deg, #07111f 0%, #0b1d34 45%, #140b2f 100%);
  font-family: 'Space Grotesk', 'Inter', 'Segoe UI', sans-serif;
}

.share-card__pattern {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
    radial-gradient(circle at center, rgba(255, 255, 255, 0.12) 0, rgba(255, 255, 255, 0) 56%);
  background-size: 48px 48px, 48px 48px, 100% 100%;
  background-position: center;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.15));
  opacity: 0.35;
}

.share-card__glow {
  position: absolute;
  width: 520px;
  height: 520px;
  border-radius: 999px;
  filter: blur(90px);
  opacity: 0.45;
}

.share-card__glow--top {
  top: -140px;
  right: -80px;
  background: rgba(45, 212, 191, 0.35);
}

.share-card__glow--bottom {
  bottom: -160px;
  left: -80px;
  background: rgba(168, 85, 247, 0.35);
}

.share-card__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 62px;
  box-sizing: border-box;
}

.share-card__header,
.share-card__footer-line {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.share-card__eyebrow,
.share-card__user-label,
.share-card__hero-label,
.share-card__metric-kicker,
.share-card__footer-copy,
.share-card__date {
  margin: 0;
  font-size: 18px;
  line-height: 1.2;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.68);
}

.share-card__user-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.share-card__user-name {
  font-size: 28px;
  line-height: 1;
  letter-spacing: -0.04em;
}

.share-card__hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 270px;
  gap: 36px;
  align-items: end;
  margin-top: 52px;
}

.share-card__habit-name {
  margin: 10px 0 18px;
  font-size: 92px;
  line-height: 0.93;
  letter-spacing: -0.07em;
  max-width: 6.5ch;
}

.share-card__description {
  margin: 0;
  max-width: 620px;
  font-size: 31px;
  line-height: 1.25;
  color: rgba(241, 245, 249, 0.86);
}

.share-card__meter {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.share-card__meter-ring {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 236px;
  height: 236px;
  border-radius: 999px;
  border: 18px solid rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 0 0 14px rgba(13, 23, 38, 0.75);
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0));
}

.share-card__meter-value {
  font-size: 66px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.06em;
}

.share-card__meter-label {
  font-size: 19px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(226, 232, 240, 0.7);
}

.share-card__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 54px;
}

.share-card__metric {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 30px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
  backdrop-filter: blur(8px);
}

.share-card__metric-value {
  font-size: 52px;
  line-height: 0.95;
  letter-spacing: -0.05em;
}

.share-card__metric-caption {
  font-size: 22px;
  color: rgba(226, 232, 240, 0.85);
}

.share-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 28px;
}

.share-card__tag {
  display: inline-flex;
  align-items: center;
  min-height: 56px;
  padding: 0 22px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(9, 18, 32, 0.48);
  font-size: 25px;
  letter-spacing: -0.02em;
}

.share-card__footer {
  margin-top: auto;
  padding-top: 28px;
}
</style>
