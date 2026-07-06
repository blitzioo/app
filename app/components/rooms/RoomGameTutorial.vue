<template>
  <UModal
    v-model:open="open"
    :ui="{
      overlay: 'bg-neutral-950/80 backdrop-blur-sm',
      content: 'w-[min(92vw,700px)] rounded-[32px] bg-neutral-900 ring-1 ring-white/10 shadow-2xl overflow-hidden'
    }"

  >
    <template #content>
      <div class="p-8">
        <h2 class="text-center text-lg font-bold text-primary-300">
          {{ t('room.explanations.title') }}
        </h2>

        <div class="mt-8">
          <Transition
            mode="out-in"
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div :key="currentStep">
              <img
                v-if="steps[currentStep]?.image"
                :src="steps[currentStep]?.image"
                :alt="steps[currentStep]?.title"
                class="h-72 w-full rounded-3xl object-contain"
              >

              <h3
                v-if="steps[currentStep]?.title"
                class="mt-6 text-center text-2xl font-extrabold text-white"
              >
                {{ steps[currentStep]?.title }}
              </h3>

              <p
                v-if="steps[currentStep]?.description"
                class="mx-auto mt-3 max-w-xl text-center text-neutral-300"
              >
                {{ steps[currentStep]?.description }}
              </p>
            </div>
          </Transition>
        </div>

        <div class="mt-8 flex justify-center gap-2">
          <div
            v-for="(_, index) in steps"
            :key="index"
            class="h-2 rounded-full transition-all duration-300"
            :class="
              index === currentStep
                ? 'w-8 bg-primary-500'
                : 'w-2 bg-neutral-600'
            "
          />
        </div>

        <div class="mt-8 flex justify-center gap-3">
          <UButton
            size="xl"
            class="rounded-2xl px-8 font-bold"
            @click="next"
          >
            {{ t('room.explanations.' + (isLastStep ? 'finishBtn' : 'nextBtn')) }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { GameEnum } from '~/types/games'
import gameRulesFile from "~/assets/data/game-rules.json";

interface TutorialStep {
  image?: string
  title?: string
  description?: string
}
const gameRules = gameRulesFile as Record<
  GameEnum,
  Array<TutorialStep>
>;

const {t} = useI18n()

const open = defineModel<boolean>('open', {
  required: true
})

const props = defineProps<{
  gameId: GameEnum;
}>()

const steps = computed<TutorialStep[]>(() => {
  const gameId = props.gameId;
  const rules = gameRules[gameId];
  if(!rules) return [];
  return rules.map(r => ({
    ...r,
    ...r.image && {image: `/images/games/tutorials/${gameId}/${r.image}`}
  }));
})

const emit = defineEmits<{
  finished: []
}>()

const currentStep = ref(0)

const isLastStep = computed(() => {
  return currentStep.value === steps.value.length - 1
})

const next = () => {
  if (!isLastStep.value) {
    currentStep.value++
    return
  }

  open.value = false
  currentStep.value = 0
  emit('finished')
}

const previous = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}
</script>