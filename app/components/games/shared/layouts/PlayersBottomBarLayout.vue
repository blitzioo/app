<template>
  <div class="players-bottom-bar-layout">
    <div class="players-bottom-bar-card">
      <button
        v-if="players.length > 3"
        type="button"
        class="hud-arrow hud-arrow-left"
      >
        <UIcon name="i-solar-alt-arrow-left-bold" />
      </button>

      <div
        v-for="seat in seats"
        :key="`${seat.position}-${seat.player?.id}`"
        class="hud-seat"
        :class="[
          `seat-${seat.position}`,
          {
            active: seat.playerIdx === currentPlayerIdx,
            self: seat.position === 'center',
            disconnected: seat.isDisconnected
          }
        ]"
      >
        <div class="avatar-wrapper">
          <UAvatar
            :alt="seat.player?.username"
            :size="seat.position === 'center' ? '3xl' : '2xl'"
          />

          <div
            v-if="seat.playerIdx === currentPlayerIdx"
            class="active-ring"
          />

          <div
            v-if="seat.isDisconnected"
            class="disconnected-badge"
          >
            <UIcon name="i-lucide-wifi-off" />
          </div>
        </div>

        <div class="player-name">
          {{ seat.player?.username }}
        </div>
      </div>

      <div
        v-if="isMyTurn"
        class="turn-badge"
      >
        À TON TOUR
      </div>

      <button
        v-if="players.length > 3"
        type="button"
        class="hud-arrow hud-arrow-right"
      >
        <UIcon name="i-solar-alt-arrow-right-bold" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/core/useAuth'
import type { GameSessionPlayer } from '~/types/games'

type HudSeatPosition = 'left' | 'center' | 'right'

const props = withDefaults(defineProps<{
  players: GameSessionPlayer[]
  currentPlayerIdx: number
  disconnectedPlayerIds?: string[]
}>(), {
  disconnectedPlayerIds: () => []
})

const {
  username: selfUsername,
  id: selfPlayerId
} = useAuth()

const disconnectedPlayerIdsSet = computed(() => {
  return new Set(props.disconnectedPlayerIds)
})

const selfIdx = computed(() => {
  if (!props.players.length) return -1

  if (selfPlayerId.value) {
    const idx = props.players.findIndex(player => player.id === selfPlayerId.value)
    if (idx !== -1) return idx
  }

  if (selfUsername.value) {
    const idx = props.players.findIndex(player => player.username === selfUsername.value)
    if (idx !== -1) return idx
  }

  return 0
})

const orderedPlayers = computed(() => {
  const players = props.players.map((player, playerIdx) => ({
    player,
    playerIdx,
    isDisconnected: disconnectedPlayerIdsSet.value.has(player.id)
  }))

  if (selfIdx.value === -1) return []

  return [
    ...players.slice(selfIdx.value),
    ...players.slice(0, selfIdx.value)
  ]
})

const visiblePlayers = computed(() => {
  const players = orderedPlayers.value

  if (players.length <= 1) return players

  if (players.length === 2) {
    return [players[0], players[1]]
  }

  return [
    players[players.length - 1],
    players[0],
    players[1]
  ]
})

const getPosition = (index: number, count: number): HudSeatPosition => {
  if (count === 1) return 'center'

  if (count === 2) {
    return index === 0 ? 'center' : 'right'
  }

  if (index === 0) return 'left'
  if (index === 1) return 'center'
  return 'right'
}

const seats = computed(() => {
  const players = visiblePlayers.value.slice(0, 3)

  return players.map((entry, index) => ({
    ...entry,
    position: getPosition(index, players.length)
  }))
})

const isMyTurn = computed(() => {
  const currentPlayer = props.players[props.currentPlayerIdx]
  if (!currentPlayer) return false

  return currentPlayer.id === selfPlayerId.value
})
</script>

<style scoped>
.players-bottom-bar-layout {
  position: fixed;
  left: 50%;
  bottom: 2rem;
  z-index: 20;
  width: min(calc(100vw - 2rem), 640px);
  transform: translateX(-50%);
  pointer-events: none;
}

.players-bottom-bar-card {
  position: relative;
  height: 142px;
}

.hud-seat {
  position: absolute;
  top: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.42rem;
  transform: translateY(-50%);
  transition:
    opacity 180ms ease,
    filter 180ms ease,
    transform 180ms ease;
}

.seat-left {
  left: 18%;
}

.seat-center {
  left: 50%;
  transform: translate(-50%, -50%);
}

.seat-right {
  right: 18%;
}

.avatar-wrapper {
  position: relative;
  display: grid;
  place-items: center;
}

.active-ring {
  position: absolute;
  inset: -0.35rem;
  border: 4px solid var(--color-primary-400);
  border-radius: 999px;
  animation: active-pulse 1.8s ease-in-out infinite;
}

.hud-seat:not(.active) {
  opacity: 0.52;
  filter: saturate(0.75);
}

.hud-seat.self:not(.active) {
  opacity: 0.72;
}

.hud-seat.disconnected {
  opacity: 0.38;
  filter: grayscale(0.9);
}

.disconnected-badge {
  position: absolute;
  right: -0.35rem;
  bottom: -0.35rem;
  width: 1.45rem;
  height: 1.45rem;
  border: 2px solid var(--color-primary-950);
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: var(--color-warning-500);
  color: white;
}

.disconnected-badge :deep(svg) {
  width: 0.85rem;
  height: 0.85rem;
}

.player-name {
  max-width: 9rem;
  overflow: hidden;
  border-radius: 999px;
  padding: 0.2rem 0.65rem;
  background: rgba(7, 26, 54, 0.72);
  color: var(--color-neutral-50);
  font-size: 1rem;
  font-weight: 900;
  line-height: 1.1;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-shadow: inset 0 0 0 1px rgba(209, 233, 255, 0.08);
}

.seat-left .player-name,
.seat-right .player-name {
  color: var(--color-neutral-200);
  font-size: 0.82rem;
}

.turn-badge {
  position: absolute;
  left: 50%;
  top: -1.05rem;
  transform: translateX(-50%);
  border-radius: 999px;
  padding: 0.35rem 1rem;
  background: var(--color-primary-400);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.04em;
}

.hud-arrow {
  position: absolute;
  top: 50%;
  z-index: 5;
  border: 0;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  transform: translateY(-50%);
  background: rgba(209, 233, 255, 0.08);
  color: var(--color-primary-100);
  pointer-events: auto;
  transition:
    background 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.hud-arrow:hover {
  background: var(--color-primary-600);
  color: white;
}

.hud-arrow:active {
  transform: translateY(-50%) scale(0.94);
}

.hud-arrow :deep(svg) {
  width: 1.8rem;
  height: 1.8rem;
}

.hud-arrow-left {
  left: 1rem;
}

.hud-arrow-right {
  right: 1rem;
}

@keyframes active-pulse {
  0%, 100% {
    opacity: 0.85;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.06);
  }
}

@media (max-width: 420px) {
  .players-bottom-bar-layout {
    bottom: 1.4rem;
    width: min(calc(100vw - 1rem), 390px);
  }

  .players-bottom-bar-card {
    height: 128px;
    border-radius: 28px;
  }

  .seat-left {
    left: 15%;
  }

  .seat-right {
    right: 15%;
  }

  .player-name {
    max-width: 7.6rem;
    font-size: 0.9rem;
  }

  .seat-left .player-name,
  .seat-right .player-name {
    max-width: 5rem;
    font-size: 0.72rem;
  }

  .turn-badge {
    top: -0.95rem;
    font-size: 0.7rem;
    padding: 0.3rem 0.85rem;
  }

  .hud-arrow-left {
    left: 0.4rem;
  }

  .hud-arrow-right {
    right: 0.4rem;
  }
}
</style>