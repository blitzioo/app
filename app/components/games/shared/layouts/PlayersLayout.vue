<template>
  <PlayersBottomBarLayout
    v-if="variant === 'bottom-bar'"
    :players="players"
    :current-player-idx="currentPlayerIdx"
    :disconnected-player-ids="disconnectedPlayerIds"
  />

  <PlayersTableLayout
    v-else-if="variant === 'table'"
    :players="players"
    :current-player-idx="currentPlayerIdx"
    :disconnected-player-ids="disconnectedPlayerIds"
  />
</template>

<script setup lang="ts">
import type { GameSessionPlayer } from '~/types/games'
import PlayersTableLayout from './PlayersTableLayout.vue'
import PlayersBottomBarLayout from './PlayersBottomBarLayout.vue'

type PlayersLayoutVariant =
  | 'table'
  | 'bottom-bar'

withDefaults(defineProps<{
  variant?: PlayersLayoutVariant
  players: GameSessionPlayer[]
  currentPlayerIdx: number
  disconnectedPlayerIds?: string[]
}>(), {
  variant: 'table',
  disconnectedPlayerIds: () => []
})
</script>