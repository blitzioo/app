<template>
  <UModal
    v-model:open="openModel"
    :dismissible="dismissible"
    :ui="modalUi"
  >
    <template #content>
      <div class="game-result-modal">

        <h2 class="result-title">
          {{ title }}
        </h2>

        <p
          v-if="description"
          class="result-description"
        >
          {{ description }}
        </p>

        <div
          v-if="playerName || $slots.card"
          class="result-card"
        >
          <slot name="card">
            <p
              v-if="playerLabel"
              class="result-label"
            >
              {{ playerLabel }}
            </p>

            <div
              v-if="playerName"
              class="result-player"
            >
              <UAvatar
                :alt="playerName"
                :size="avatarSize"
              />

              <p class="result-player-name">
                {{ playerName }}
              </p>
            </div>
          </slot>
        </div>

        <slot />

        <UButton
          block
          size="xl"
          color="primary"
          icon="i-lucide-home"
          class="home-button"
          @click="goHome"
        >
          Retour à l'accueil
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  title: string
  description: string
  playerLabel?: string
  playerName?: string
  avatarSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  dismissible?: boolean
}>(), {
  playerLabel: 'Perdant',
  playerName: '',
  avatarSize: 'lg',
  dismissible: false
})

const router = useRouter();
const emit = defineEmits<{
  'update:open': [value: boolean]
  home: []
}>()

const openModel = computed({
  get: () => props.open,
  set: value => emit('update:open', value)
})

const modalUi = {
  overlay: 'bg-neutral-950/75 backdrop-blur-sm',
  content: 'w-[min(92vw,420px)] overflow-hidden rounded-[32px] bg-neutral-900 ring-1 ring-white/10 shadow-2xl'
}

const goHome = async () => {
  await router.push('/')
}

</script>

<style scoped>
.game-result-modal {
  padding: 1.5rem;
  text-align: center;
}

.result-title {
  margin-top: 0.25rem;
  font-size: 1.85rem;
  font-weight: 900;
  line-height: 1.05;
  color: var(--color-neutral-50);
}

.result-description {
  margin: 0.6rem auto 0;
  max-width: 18rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-neutral-300);
}

.result-card {
  margin-top: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  padding: 1rem;
  background: rgba(7, 24, 36, 0.55);
}

.result-label {
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-neutral-500);
}

.result-player {
  margin-top: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.result-player-name {
  max-width: 12rem;
  overflow: hidden;
  color: var(--color-neutral-50);
  font-size: 1.1rem;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-button {
  margin-top: 1.25rem;
  height: 3.25rem;
  border-radius: 1rem;
  font-weight: 900;
}
</style>