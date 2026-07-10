<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  pressure?: number
  maxPressure?: number
  exploded?: boolean
  size?: number
  color?: string
}>(), {
  pressure: 0,
  maxPressure: 10,
  exploded: false,
  size: 180,
  color: '#1475e1'
})

const isInflating = ref(false)
const isPumping = ref(false)

let inflateTimeout: ReturnType<typeof setTimeout> | null = null
let pumpTimeout: ReturnType<typeof setTimeout> | null = null

const pressureValue = computed(() => {
  const value = props.pressure ?? 0

  if (!Number.isFinite(value)) return 0

  return Math.max(0, Math.round(value))
})

const maxPressureValue = computed(() => {
  const value = props.maxPressure ?? 10

  if (!Number.isFinite(value) || value <= 0) return 10

  return value
})

const pressureRatio = computed(() => {
  return Math.min(Math.max(pressureValue.value / maxPressureValue.value, 0), 1)
})

const balloonScale = computed(() => {
  return 0.72 + pressureRatio.value * 0.36
})

const balloonLift = computed(() => {
  return pressureRatio.value * -18
})

const pressureState = computed(() => {
  if (pressureRatio.value >= 0.78) return 'danger'
  if (pressureRatio.value >= 0.52) return 'warning'

  return 'safe'
})

const balloonStyle = computed(() => ({
  '--balloon-color': props.color,
  '--balloon-size': `${props.size}px`,
  '--balloon-scale': balloonScale.value.toString(),
  '--balloon-lift': `${balloonLift.value}px`,
  '--blink-duration': `${Math.max(300, 1500 - pressureRatio.value * 1050)}ms`,
  '--blink-opacity': `${0.08 + pressureRatio.value * 0.5}`,
  '--meter-opacity': `${0.24 + pressureRatio.value * 0.2}`
}))

watch(
  () => props.pressure,
  (next, prev) => {
    if (props.exploded) return

    if ((next ?? 0) > (prev ?? 0)) {
      isInflating.value = false
      isPumping.value = false

      if (inflateTimeout) clearTimeout(inflateTimeout)
      if (pumpTimeout) clearTimeout(pumpTimeout)

      requestAnimationFrame(() => {
        isInflating.value = true
        isPumping.value = true
      })

      inflateTimeout = setTimeout(() => {
        isInflating.value = false
      }, 360)

      pumpTimeout = setTimeout(() => {
        isPumping.value = false
      }, 280)
    }
  }
)

watch(
  () => props.exploded,
  value => {
    if (value) {
      isInflating.value = false
      isPumping.value = false
    }
  }
)

onBeforeUnmount(() => {
  if (inflateTimeout) clearTimeout(inflateTimeout)
  if (pumpTimeout) clearTimeout(pumpTimeout)
})
</script>

<template>
  <div
    class="balloon-pressure"
    :class="[
      pressureState,
      {
        exploded,
        inflating: isInflating,
        pumping: isPumping
      }
    ]"
    :style="balloonStyle"
  >
    <svg
      class="illustration"
      viewBox="0 0 360 300"
      aria-hidden="true"
    >
      <defs>
        <filter id="balloonSoftGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="meterGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <clipPath id="balloonClip">
          <path
            d="M 159 58
               C 106 58 76 99 76 150
               C 76 199 117 226 151 237
               C 156 239 162 239 167 237
               C 201 226 242 199 242 150
               C 242 99 212 58 159 58 Z"
          />
        </clipPath>
      </defs>

      <g class="balloon-group">
        <path
          class="balloon-main"
          d="M 159 58
             C 106 58 76 99 76 150
             C 76 199 117 226 151 237
             C 156 239 162 239 167 237
             C 201 226 242 199 242 150
             C 242 99 212 58 159 58 Z"
        />

        <path
          class="balloon-shadow"
          d="M 96 133
             C 100 93 126 69 163 62
             C 128 84 115 141 126 194
             C 119 191 103 176 96 158
             C 93 149 92 141 96 133 Z"
        />

        <ellipse
          class="balloon-shine"
          cx="194"
          cy="103"
          rx="23"
          ry="36"
          transform="rotate(-34 194 103)"
        />

        <ellipse
          class="balloon-shine-small"
          cx="205"
          cy="147"
          rx="8"
          ry="12"
          transform="rotate(-20 205 147)"
        />

        <g clip-path="url(#balloonClip)">
          <ellipse
            class="balloon-inner-glow"
            cx="159"
            cy="165"
            rx="56"
            ry="48"
          />

          <g class="pressure-meter" filter="url(#meterGlow)">
            <ellipse
              class="pressure-meter-back"
              cx="159"
              cy="160"
              rx="42"
              ry="32"
            />

            <ellipse
              class="pressure-meter-top"
              cx="159"
              cy="150"
              rx="30"
              ry="14"
            />

            <ellipse
              class="pressure-meter-ring"
              cx="159"
              cy="160"
              rx="42"
              ry="32"
            />

            <text
              x="159"
              y="168"
              class="pressure-meter-value"
              text-anchor="middle"
            >
              {{ pressureValue }}
            </text>
          </g>
        </g>

        <path
          class="balloon-neck"
          d="M 145 230
             C 151 237 167 237 173 230
             L 180 255
             C 169 260 150 260 138 255 Z"
        />

        <path
          class="balloon-knot"
          d="M 142 251
             C 151 242 167 242 176 251
             L 166 268
             L 153 268 Z"
        />
      </g>

      <path
        class="hose-line"
        d="M 158 255 C 186 292 251 294 284 244"
      />

      <circle
        class="hose-joint"
        cx="158"
        cy="255"
        r="9"
      />

      <g class="pump-group">
        <rect
          class="pump-handle"
          x="268"
          y="147"
          width="70"
          height="18"
          rx="9"
        />

        <g class="pump-stick-wrapper">
          <rect
            class="pump-stick"
            x="299"
            y="161"
            width="8"
            height="50"
            rx="4"
          />
        </g>

        <rect
          class="pump-body-cover"
          x="275"
          y="202"
          width="56"
          height="84"
          rx="21"
        />

        <rect
          class="pump-body"
          x="279"
          y="205"
          width="48"
          height="76"
          rx="18"
        />

        <rect
          class="pump-light"
          x="289"
          y="216"
          width="10"
          height="50"
          rx="5"
        />

        <rect
          class="pump-base"
          x="268"
          y="274"
          width="70"
          height="14"
          rx="7"
        />

        <circle
          class="pump-hole"
          cx="282"
          cy="245"
          r="6"
        />
      </g>

      <g class="explosion-group">
        <circle class="explosion-ring" cx="159" cy="148" r="34" />

        <line class="burst burst-1" x1="159" y1="148" x2="159" y2="80" />
        <line class="burst burst-2" x1="159" y1="148" x2="220" y2="94" />
        <line class="burst burst-3" x1="159" y1="148" x2="244" y2="150" />
        <line class="burst burst-4" x1="159" y1="148" x2="221" y2="213" />
        <line class="burst burst-5" x1="159" y1="148" x2="158" y2="238" />
        <line class="burst burst-6" x1="159" y1="148" x2="92" y2="213" />
        <line class="burst burst-7" x1="159" y1="148" x2="72" y2="148" />
        <line class="burst burst-8" x1="159" y1="148" x2="98" y2="88" />

        <circle class="particle particle-1" cx="159" cy="76" r="7" />
        <circle class="particle particle-2" cx="234" cy="100" r="6" />
        <circle class="particle particle-3" cx="244" cy="184" r="8" />
        <circle class="particle particle-4" cx="118" cy="226" r="6" />
        <circle class="particle particle-5" cx="72" cy="116" r="7" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.balloon-pressure {
  position: relative;
  width: calc(var(--balloon-size) * 2.15);
  height: calc(var(--balloon-size) * 1.78);
  overflow: visible;
}

.illustration {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.balloon-group {
  transform-box: fill-box;
  transform-origin: 50% 78%;
  transform:
    translateY(var(--balloon-lift))
    scale(var(--balloon-scale));
  transition: transform 280ms cubic-bezier(0.16, 1, 0.3, 1);
}

.balloon-main {
  fill: var(--balloon-color);
  filter: url(#balloonSoftGlow);
  transition:
    filter 220ms ease,
    opacity 220ms ease;
}

.balloon-shadow {
  fill: rgba(15, 33, 46, 0.16);
}

.balloon-shine {
  fill: rgba(255, 255, 255, 0.42);
}

.balloon-shine-small {
  fill: rgba(255, 255, 255, 0.22);
}

.balloon-inner-glow {
  fill: rgba(255, 255, 255, 0.08);
}

.pressure-meter {
  opacity: 0.96;
  transform-origin: center;
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}

.pressure-meter-back {
  fill: rgba(255, 255, 255, var(--meter-opacity));
  stroke: rgba(255, 255, 255, 0.12);
  stroke-width: 1.5;
}

.pressure-meter-top {
  fill: rgba(255, 255, 255, 0.14);
}

.pressure-meter-ring {
  fill: none;
  stroke: rgba(255, 255, 255, 0.16);
  stroke-width: 2;
}

.pressure-meter-value {
  fill: white;
  font-size: 34px;
  font-weight: 900;
  letter-spacing: -0.05em;
  dominant-baseline: middle;
}

.warning .balloon-main {
  filter: drop-shadow(0 0 12px rgba(255, 193, 7, 0.24));
}

.warning .pressure-meter-back {
  fill: rgba(255, 193, 7, 0.16);
  stroke: rgba(255, 193, 7, 0.18);
}

.warning .pressure-meter-top {
  fill: rgba(255, 255, 255, 0.18);
}

.warning .pressure-meter-ring {
  stroke: rgba(255, 193, 7, 0.26);
}

.danger .balloon-main {
  filter: drop-shadow(0 0 20px rgba(237, 65, 99, 0.42));
}

.danger .balloon-group {
  animation: balloon-danger var(--blink-duration) ease-in-out infinite;
}

.danger .pressure-meter {
  animation: meter-danger var(--blink-duration) ease-in-out infinite;
}

.danger .pressure-meter-back {
  fill: rgba(237, 65, 99, 0.18);
  stroke: rgba(237, 65, 99, 0.2);
}

.danger .pressure-meter-top {
  fill: rgba(255, 255, 255, 0.16);
}

.danger .pressure-meter-ring {
  stroke: rgba(237, 65, 99, 0.3);
}

.balloon-neck {
  fill: var(--color-primary-700);
}

.balloon-knot {
  fill: var(--color-primary-800);
}

.hose-line {
  fill: none;
  stroke: var(--color-neutral-50);
  stroke-width: 8;
  stroke-linecap: round;
}

.hose-joint {
  fill: var(--color-primary-800);
}

.pump-group {
  transform-box: fill-box;
  transform-origin: 50% 100%;
}

.pump-handle,
.pump-stick {
  fill: var(--color-neutral-50);
}

.pump-stick-wrapper {
  transform-box: fill-box;
  transform-origin: 50% 100%;
}

.pump-stick {
  transform-box: fill-box;
  transform-origin: 50% 100%;
}

.pump-handle {
  transition: transform 160ms ease;
  transform-origin: center;
  transform-box: fill-box;
}

.pump-body-cover {
  fill: #213743;
}

.pump-body {
  fill: var(--color-primary-500);
}

.pump-light {
  fill: rgba(255, 255, 255, 0.18);
}

.pump-base {
  fill: var(--color-primary-800);
}

.pump-hole {
  fill: var(--color-primary-950);
}

.pumping .pump-handle {
  animation: pump-handle 280ms ease-out forwards;
}

.pumping .pump-stick-wrapper {
  animation: pump-stick-disappear 280ms ease-out forwards;
}

.inflating .balloon-group {
  animation: balloon-pop 360ms cubic-bezier(0.16, 1, 0.3, 1);
}

.explosion-group {
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
}

.explosion-ring {
  fill: none;
  stroke: var(--color-neutral-50);
  stroke-width: 7;
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
}

.burst {
  stroke: var(--color-error-500);
  stroke-width: 8;
  stroke-linecap: round;
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
}

.particle {
  fill: var(--color-secondary-400);
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
}

.exploded .balloon-group {
  animation: balloon-explode 340ms ease-out forwards;
}

.exploded .hose-line,
.exploded .hose-joint,
.exploded .pump-group {
  opacity: 0.25;
}

.exploded .explosion-group {
  opacity: 1;
}

.exploded .explosion-ring {
  animation: ring 420ms ease-out forwards;
}

.exploded .burst {
  animation: burst 460ms ease-out forwards;
}

.exploded .particle {
  animation: particle 520ms ease-out forwards;
}

@keyframes pump-handle {
  0% {
    transform: translateY(0);
  }

  55%,
  100% {
    transform: translateY(24px);
  }
}

@keyframes pump-stick-disappear {
  0% {
    opacity: 1;
    transform: translateY(0);
  }

  45% {
    opacity: 1;
    transform: translateY(14px);
  }

  70%,
  100% {
    opacity: 0;
    transform: translateY(24px) scaleY(0.2);
  }
}

@keyframes balloon-pop {
  0% {
    transform:
      translateY(var(--balloon-lift))
      scale(calc(var(--balloon-scale) * 0.92), calc(var(--balloon-scale) * 1.08));
  }

  55% {
    transform:
      translateY(calc(var(--balloon-lift) - 6px))
      scale(calc(var(--balloon-scale) * 1.08), calc(var(--balloon-scale) * 0.98));
  }

  100% {
    transform:
      translateY(var(--balloon-lift))
      scale(var(--balloon-scale));
  }
}

@keyframes balloon-danger {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: calc(1 - var(--blink-opacity));
  }
}

@keyframes meter-danger {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: calc(1 - var(--blink-opacity));
    transform: scale(1.05);
  }
}

@keyframes balloon-explode {
  0% {
    opacity: 1;
    transform:
      translateY(var(--balloon-lift))
      scale(var(--balloon-scale));
  }

  45% {
    opacity: 1;
    transform:
      translateY(calc(var(--balloon-lift) - 12px))
      scale(calc(var(--balloon-scale) * 1.16));
  }

  100% {
    opacity: 0;
    transform:
      translateY(calc(var(--balloon-lift) - 12px))
      scale(0.2);
  }
}

@keyframes ring {
  0% {
    opacity: 0.9;
    transform: scale(0.25);
  }

  100% {
    opacity: 0;
    transform: scale(2.6);
  }
}

@keyframes burst {
  0% {
    opacity: 1;
    stroke-dasharray: 0 100;
  }

  100% {
    opacity: 0;
    stroke-dasharray: 60 100;
  }
}

@keyframes particle {
  0% {
    opacity: 1;
    transform: scale(0.4);
  }

  100% {
    opacity: 0;
    transform: scale(1.25);
  }
}
</style>