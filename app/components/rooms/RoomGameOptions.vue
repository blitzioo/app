<template>
  <div class="mt-6 text-left">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-sm font-black uppercase tracking-wider text-neutral-400">
        Options de la partie
      </h2>
    </div>

    <UCard
      :ui="{
        root: 'overflow-hidden rounded-[26px] border border-white/10 bg-neutral-900/80 shadow-lg shadow-black/20 ring-0',
        body: 'p-0'
      }"
    >
      <div
        v-for="(option, index) in options"
        :key="option.id"
        class="flex items-center justify-between gap-4 p-4"
        :class="index !== 0 ? 'border-t border-white/10' : ''"
      >
        <div class="min-w-0 flex-1">
          <h3 class="text-base font-black leading-tight text-white">
            {{ option.label }}
          </h3>

          <p
            v-if="option.description"
            class="mt-1 line-clamp-2 text-sm font-semibold leading-relaxed text-neutral-400"
          >
            {{ option.description }}
          </p>

          <p
            v-if="option.type === 'number' && getNumberHint(getNumberOption(option))"
            class="mt-1.5 text-xs font-black text-neutral-500"
          >
            {{ getNumberHint(getNumberOption(option)) }}
          </p>
        </div>

        <UInputNumber
          v-if="option.type === 'number'"
          :model-value="getNumberValue(option.id)"
          :min="getNumberOption(option).min"
          :max="getNumberOption(option).max"
          :step="getNumberOption(option).step ?? 1"
          size="xl"
          color="primary"
          variant="outline"
          :ui="{
            root: 'w-36 shrink-0',
            base: 'h-14 rounded-2xl bg-neutral-950/70 text-center text-3xl font-black tabular-nums text-neutral-50 ring-white/10 focus:ring-primary-300 placeholder:text-neutral-500',
            increment: 'text-neutral-50 hover:text-primary-300',
            decrement: 'text-neutral-50 hover:text-primary-300'
          }"
          @update:model-value="value => updateNumber(getNumberOption(option), value)"
        />

        <USwitch
          v-else-if="option.type === 'boolean'"
          :model-value="values[option.id] as boolean"
          color="primary"
          size="xl"
          @update:model-value="value => values[option.id] = value"
        />

        <UInput
          v-else-if="option.type === 'text'"
          :model-value="values[option.id] as string | undefined"
          size="xl"
          color="primary"
          variant="subtle"
          :placeholder="option.placeholder"
          :maxlength="option.maxLength"
          :ui="{
            root: 'w-40 shrink-0',
            base: 'h-14 rounded-2xl bg-neutral-950/70 px-4 text-center font-bold text-white ring-white/10 placeholder:text-neutral-500 focus:ring-primary-300'
          }"
          @update:model-value="value => values[option.id] = value"
        />

        <USelect
          v-else-if="option.type === 'select'"
          :model-value="values[option.id] as string | undefined"
          size="xl"
          color="primary"
          variant="subtle"
          :items="option.values"
          value-key="value"
          label-key="label"
          :ui="{
            base: 'h-14 w-40 rounded-2xl bg-neutral-950/70 px-4 font-bold text-white ring-white/10 focus:ring-primary-300',
            trailingIcon: 'text-primary-300'
          }"
          @update:model-value="value => values[option.id] = value"
        />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue'
import type { GameNumberOption, GameOption, GameOptionValue } from '~/types/games'

const props = defineProps<{
  options: GameOption[]
  modelValue?: Record<string, GameOptionValue>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, GameOptionValue>]
}>()

const values = reactive<Record<string, GameOptionValue>>({})

const getNumberOption = (option: GameOption) => {
  return option as GameNumberOption
}

const emitValues = () => {
  emit('update:modelValue', { ...values })
}

const hydrateValues = () => {
  for (const option of props.options) {
    values[option.id] = props.modelValue?.[option.id] ?? option.default
  }
}

hydrateValues()

onMounted(() => {
  emitValues()
})

watch(
  () => props.options,
  () => {
    hydrateValues()
    emitValues()
  },
  {
    deep: true
  }
)

watch(
  () => props.modelValue,
  modelValue => {
    if (!modelValue) return

    for (const option of props.options) {
      values[option.id] = modelValue[option.id] ?? values[option.id] ?? option.default
    }
  },
  {
    deep: true
  }
)

watch(
  values,
  () => {
    emitValues()
  },
  {
    deep: true
  }
)

const getNumberValue = (id: string) => {
  const value = values[id]

  if (typeof value !== 'number') return 0
  if (!Number.isFinite(value)) return 0

  return value
}

const clampNumber = (value: number, option: GameNumberOption) => {
  const min = option.min ?? -Infinity
  const max = option.max ?? Infinity

  return Math.min(max, Math.max(min, value))
}

const updateNumber = (
  option: GameNumberOption,
  value: number | null | undefined
) => {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    values[option.id] = option.default ?? option.min ?? 0
    return
  }

  values[option.id] = clampNumber(Number(value), option)
}

const getNumberHint = (option: GameNumberOption) => {
  const min = typeof option.min === 'number' ? option.min : null
  const max = typeof option.max === 'number' ? option.max : null

  if (min !== null && max !== null) return `Entre ${min} et ${max}`
  if (min !== null) return `Minimum ${min}`
  if (max !== null) return `Maximum ${max}`

  return ''
}
</script>