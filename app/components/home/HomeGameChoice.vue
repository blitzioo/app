<template>
  <UDrawer
    v-model:open="isCreateDrawerOpen"
    :handle="false"
    :ui="{
      overlay: 'bg-neutral-950/70',
      content: 'bg-transparent ring-0'
    }"
  >
    <UButton
      type="button"
      block
      size="xl"
      color="primary"
      icon="i-lucide-plus"
      :loading="loadingGames"
      :disabled="isBusy"
      class="h-14 rounded-2xl text-neutral-300 font-black text-white shadow-lg shadow-primary-950/30 transition"
    >
      {{ t('home.createBtn') }}
    </UButton>

    <template #content>
      <div
        class="w-full rounded-t-[36px] border-t border-white/10 bg-neutral-950 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl"
      >
        <div class="flex items-center gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            class="h-11 w-11 rounded-full text-neutral-300 hover:bg-white/10 hover:text-white"
            @click="isCreateDrawerOpen = false"
          />

          <h2 class="text-3xl font-black text-white">
            {{ t('home.chooseGameTitle') }}
          </h2>
        </div>

        <div class="mt-7 grid gap-4">
          <template v-if="loadingGames">
            <div
              v-for="i in 3"
              :key="i"
              class="flex w-full items-center gap-4 rounded-[28px] border border-white/10 bg-neutral-800/90 p-4"
            >
              <USkeleton class="h-20 w-20 rounded-[24px]" />

              <div class="flex-1 space-y-3">
                <USkeleton class="h-6 w-40" />
                <USkeleton class="h-4 w-full" />
                <USkeleton class="h-4 w-3/4" />
              </div>
            </div>
          </template>

          <button
            v-for="game in games"
            v-else
            :key="game.id"
            type="button"
            class="group flex w-full items-center gap-4 rounded-[28px] border border-white/10 bg-neutral-800/90 p-4 text-left shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-primary-400/50 hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isBusy || loadingGameId === game.id"
            :class="loadingGameId === game.id ? 'pointer-events-none opacity-60' : ''"
            @click="onGameClick(game)"
          >
            <div
              class="grid h-20 w-20 shrink-0 place-items-center rounded-[24px] border border-white/10 transition"
              :style="{
                backgroundColor: game.backgroundColor
              }"
            >
              <UIcon
                :name="game.icon"
                class="h-11 w-11 transition group-hover:scale-110"
                :style="{
                  color: game.color
                }"
              />
            </div>

            <div class="min-w-0 flex-1">
              <h3 class="truncate text-xl font-black text-white">
                {{ game.title }}
              </h3>

              <p class="mt-1 line-clamp-2 text-sm font-medium leading-relaxed text-neutral-300">
                {{ game.description }}
              </p>
            </div>

            <UIcon
              v-if="loadingGameId === game.id"
              name="i-lucide-loader-circle"
              class="h-6 w-6 animate-spin text-primary-300"
            />
          </button>
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<script lang="ts" setup>
import type { Game } from '~/types/games'
import { GameEnum } from '~/types/games'
import { ref, toRefs, watch } from 'vue'
import { useRooms } from '~/composables/useRooms'
import { useGames } from '~/composables/useGames'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { createRoom } = useRooms()
const { games, getGames } = useGames()

const router = useRouter()
const { t } = useI18n()
const toast = useToast()

const props = defineProps<{
  isBusy: boolean
}>()

const { isBusy } = toRefs(props)

const emit = defineEmits<{
  onGameId: [gameId: GameEnum | null]
}>()

const loadingGames = ref(false)
const loadingGameId = ref<GameEnum | null>(null)

const isCreateDrawerOpen = ref(false)

const loadGames = async () => {
  if (games.value.length > 0 || loadingGames.value) {
    return
  }

  try {
    loadingGames.value = true
    await getGames()
  } catch (error) {
    toast.add({
      title: 'Impossible de charger les jeux',
      description: error instanceof Error
        ? error.message
        : 'Réessaie dans quelques secondes.',
      icon: 'i-lucide-triangle-alert',
      color: 'error'
    })
  } finally {
    loadingGames.value = false
  }
}

watch(isCreateDrawerOpen, (open) => {
  if (open) {
    loadGames()
  }
})

const onGameClick = (game: Game) => {
  if (isBusy.value || loadingGameId.value) {
    return
  }

  createGameRoom(game.id as GameEnum)
}

const createGameRoom = async (gameId: GameEnum) => {
  try {
    loadingGameId.value = gameId
    emit('onGameId', gameId)

    const room = await createRoom(gameId)

    isCreateDrawerOpen.value = false

    await router.push(`/rooms/${room.code}`)
  } catch (error) {
    toast.add({
      title: t('home.errors.roomCreate.common'),
      description: error instanceof Error
        ? error.message
        : 'Réessaie dans quelques secondes.',
      icon: 'i-lucide-triangle-alert',
      color: 'error'
    })
  } finally {
    loadingGameId.value = null
    emit('onGameId', null)
  }
}
</script>