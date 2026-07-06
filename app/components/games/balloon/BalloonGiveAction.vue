<template>
  <Transition name="give-overlay">
    <div
      v-if="visible && result"
      class="give-overlay"
    >
      <div class="give-card">
        <div class="give-icon">
          <UIcon name="i-pepicons-pop-next-track" />
        </div>

        <div class="give-content">
          <div class="give-top">
            <span class="player-name">{{ result.username }}</span>
          </div>

          <div class="give-text">
            passe son tour et prend
            <strong>
              {{ result.penalty }} pénalité{{ result.penalty > 1 ? 's' : '' }}
            </strong>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { BalloonGiveEvent } from '~/types/games/balloon'

const props = defineProps<{
  result: BalloonGiveEvent | null
}>()

const visible = ref(false)

let timeout: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.result,
  (val) => {
    if (!val) return

    if (timeout) clearTimeout(timeout)

    visible.value = false

    requestAnimationFrame(() => {
      visible.value = true
    })

    timeout = setTimeout(() => {
      visible.value = false
    }, 2200)
  }
)
</script>

<style scoped>
.give-overlay {
  position: fixed;
  left: 50%;
  bottom: 7.5rem;
  z-index: 80;
  width: min(calc(100vw - 2rem), 390px);
  transform: translateX(-50%);
  pointer-events: none;
}

.give-card {
  position: relative;
  overflow: hidden;
  min-height: 82px;
  border-radius: 26px;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.95rem 1rem;
  background: #2563eb;
  color: white;
  box-shadow:
    inset 0 -4px 0 rgba(30, 64, 175, 0.5),
    0 18px 34px rgba(37, 99, 235, 0.28);
}

.give-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 25%, rgba(255, 255, 255, 0.24), transparent 28%),
    linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.16), transparent);
  transform: translateX(-100%);
  animation: shine 900ms ease-out 180ms forwards;
}

.give-icon {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  width: 48px;
  height: 48px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.18);
  animation: icon-pop 420ms cubic-bezier(0.16, 1, 0.3, 1);
}

.give-icon :deep(svg) {
  width: 31px;
  height: 31px;
}

.give-content {
  position: relative;
  z-index: 1;
  min-width: 0;
  flex: 1;
}

.give-top {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.player-name {
  max-width: 180px;
  overflow: hidden;
  font-size: 1.12rem;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.penalty-pill {
  flex: 0 0 auto;
  border-radius: 999px;
  padding: 0.18rem 0.55rem;
  background: #f97316;
  font-size: 0.78rem;
  font-weight: 900;
  box-shadow: inset 0 -2px 0 rgba(194, 65, 12, 0.45);
}

.give-text {
  margin-top: 0.2rem;
  font-size: 0.82rem;
  font-weight: 600;
  opacity: 0.92;
}

.give-text strong {
  font-weight: 900;
}

.give-arrow {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  animation: arrow-slide 700ms ease-in-out infinite;
}

.give-arrow :deep(svg) {
  width: 28px;
  height: 28px;
}

.give-overlay-enter-active {
  transition: all 280ms cubic-bezier(0.16, 1, 0.3, 1);
}

.give-overlay-leave-active {
  transition: all 220ms ease;
}

.give-overlay-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(22px) scale(0.92);
}

.give-overlay-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(14px) scale(0.96);
}

@keyframes icon-pop {
  0% {
    transform: scale(0.5) rotate(-12deg);
  }

  65% {
    transform: scale(1.12) rotate(5deg);
  }

  100% {
    transform: scale(1) rotate(0);
  }
}

@keyframes arrow-slide {
  0%, 100% {
    transform: translateX(0);
    opacity: 0.65;
  }

  50% {
    transform: translateX(7px);
    opacity: 1;
  }
}

@keyframes shine {
  100% {
    transform: translateX(100%);
  }
}
</style>