<template>
  <div v-if="publicData" class="layout">
    <div
      v-if="currentRound"
      class="round-card"
    >
      <div class="round-title">
        TOUR <span>{{ currentRound }}</span>
      </div>
    </div>

    <div class="center">
      <BalloonPressure
        :size="170"
        :pressure="publicData.pressure"
        color="#0f62c7"
        :exploded="publicData.exploded"
      />

      <div v-if="isMyTurn" class="player-actions">
        <button
          type="button"
          class="game-action game-action-pump"
          @click="pump"
        >
          <UIcon
            name="i-solar-arrow-up-bold"
            class="action-icon"
          />

          <span class="action-content">
            <span class="action-title">Gonfler</span>
            <span class="action-description">+ de pression</span>
          </span>
        </button>

        <button
          type="button"
          class="game-action game-action-pass"
          @click="pass"
        >
          <UIcon
            name="i-pepicons-pop-next-track"
            class="action-icon"
          />

          <span class="action-content">
            <span class="action-title">Passer</span>
            <span class="action-description">au joueur suivant</span>
          </span>
        </button>
      </div>
    </div>

    <GameResultModal
      v-model:open="explosionOpen"
      title="Le ballon a explosé !"
      :description="`${publicData.explosion?.username} prend ${publicData?.explosion?.penalty ?? -1} pénalités.`"
      :player-name="publicData.explosion?.username"
      @home="goHome"
    />

    <BalloonGiveAction
      v-model:open="giveOpen"
      :result="publicData.give ?? null"
    />

    <PlayersLayout
      variant="bottom-bar"
      :players="publicData.players ?? []"
      :disconnectedPlayerIds="props.disconnectedPlayerIds"
      :current-player-idx="publicData.currentPlayerIdx ?? 0"
    />
  </div>
</template>

<script lang="ts" setup>
import type { GamePropsData } from '../../../types/games.js'
import BalloonPressure from './BalloonPressure.vue'

import type {
  BalloonAction,
  BalloonPrivateData,
  BalloonPublicData
} from '~/types/games/balloon.js'

import { useAuth } from '~/composables/core/useAuth.js'

import BalloonGiveAction from './BalloonGiveAction.vue'
import PlayersLayout from '../shared/layouts/PlayersLayout.vue'
import GameResultModal from '../shared/GameResultModal.vue'

const props = defineProps<GamePropsData<
  BalloonPrivateData,
  BalloonPublicData
>>()

const router = useRouter()
const { sendAction } = useGameSocket<BalloonAction>()
const { id } = useAuth()

const publicData = ref<BalloonPublicData | null>(null)
const privateData = ref<BalloonPrivateData | null>(null)

const explosionOpen = ref(false)
const giveOpen = ref(false)

const pump = () => sendAction('pump')
const pass = () => sendAction('pass')

const goHome = async () => {
  explosionOpen.value = false
  await router.push('/')
}

watch(() => props.publicData, async (data) => {
  if (!data) return

  publicData.value = data

  if (data.explosion) {
    requestAnimationFrame(() => {
      explosionOpen.value = true
    })
  }

  if (data.give) {
    requestAnimationFrame(() => {
      giveOpen.value = true
    })
  }
}, { immediate: true })

watch(() => props.privateData, (data) => {
  if (!data) return
  privateData.value = data
}, { immediate: true })

const currentPlayer = computed(() => {
  if (!publicData.value) return null
  return publicData.value.players[publicData.value.currentPlayerIdx] ?? null
})

const isMyTurn = computed(() =>
  currentPlayer.value?.id === id.value
)

const currentRound = computed(() => {
  const round = publicData.value?.tour

  if (typeof round !== 'number') return null
  if (!Number.isFinite(round)) return null
  if (round < 1) return null

  return round
})
</script>

<style scoped>
.layout {
  height: 90vh;
  width: 100%;
  position: relative;
}

.round-card {
  position: absolute;
  top: 7rem;
  left: 50%;
  z-index: 10;
  min-width: 190px;
  transform: translateX(-50%);
  border-radius: 24px;
  padding: 0.85rem 1.1rem 0.95rem;
  background: var(--color-neutral-900);
}

.round-title {
  text-align: center;
  font-size: 1rem;
  font-weight: 900;
  color: white;
  letter-spacing: 0.02em;
}

.round-title span {
  color: var(--color-primary-300);
}

.center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(100%, 520px);
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.player-actions {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
  padding: 0 1rem;
}

.game-action {
  height: 86px;
  border: 0;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  color: white;
  cursor: pointer;
  user-select: none;
  outline: none;
  transform: translateY(0);
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    filter 160ms ease;
}

.game-action:active {
  transform: translateY(2px) scale(0.98);
}

.game-action:hover {
  filter: brightness(1.05);
}

.game-action-pump {
  background: var(--color-primary-600);
}

.game-action-pass {
  background: white;
  color: var(--color-primary-700);
}

.game-action-pass .action-icon {
  color: var(--color-primary-600);
}

.game-action-pass .action-description {
  color: var(--color-neutral-600);
  opacity: 1;
}

.game-action-pass:hover {
  filter: none;
  background: var(--color-primary-50);
}

.action-icon {
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  color: white;
}

.action-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.05;
}

.action-title {
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.action-description {
  margin-top: 0.3rem;
  font-size: 0.9rem;
  font-weight: 600;
  opacity: 0.9;
}

.penalty-card {
  margin-top: 1rem;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.9rem 1rem;
  background: var(--color-error-500);
  color: white;
  font-size: 1.25rem;
  font-weight: 900;
}

.penalty-card :deep(svg) {
  width: 1.55rem;
  height: 1.55rem;
}

@media (max-width: 420px) {
  .round-card {
    top: 0.75rem;
    min-width: 165px;
    border-radius: 21px;
    padding: 0.75rem 0.9rem 0.85rem;
  }

  .round-title {
    font-size: 0.9rem;
  }

  .center {
    top: 53%;
  }

  .player-actions {
    gap: 0.7rem;
    padding: 0 0.75rem;
  }

  .game-action {
    height: 78px;
    border-radius: 21px;
    gap: 0.65rem;
  }

  .action-icon {
    width: 36px;
    height: 36px;
  }

  .action-title {
    font-size: 1.15rem;
  }

  .action-description {
    font-size: 0.78rem;
  }
}
</style>