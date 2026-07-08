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

const pressureRatio = computed(() => {
  return Math.min(Math.max((props.pressure ?? 0) / props.maxPressure, 0), 1)
})

const pressurePercent = computed(() => Math.round(pressureRatio.value * 100))

const balloonScale = computed(() => {
  return 0.72 + pressureRatio.value * 0.36
})

const balloonLift = computed(() => {
  return pressureRatio.value * -18
})

const balloonStyle = computed(() => ({
  '--balloon-color': props.color,
  '--balloon-size': `${props.size}px`,
  '--pressure-percent': pressurePercent.value.toString(),
  '--balloon-scale': balloonScale.value.toString(),
  '--balloon-lift': `${balloonLift.value}px`
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
      }, 260)
    }
  }
)

watch(
  () => props.exploded,
  (value) => {
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
    :class="{
      exploded,
      inflating: isInflating,
      pumping: isPumping
    }"
    :style="balloonStyle"
  >
    <svg
      class="illustration"
      viewBox="0 0 360 300"
      aria-hidden="true"
    >

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
          class="balloon-side"
          d="M 91 143
             C 94 93 127 65 162 63
             C 119 86 108 143 122 194
             C 111 185 91 169 91 143 Z"
        />

        <ellipse
          class="balloon-shine"
          cx="194"
          cy="102"
          rx="22"
          ry="34"
          transform="rotate(-34 194 102)"
        />

        <ellipse
          class="balloon-shine-small"
          cx="207"
          cy="145"
          rx="8"
          ry="11"
          transform="rotate(-22 207 145)"
        />

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

        <rect
          class="pump-stick"
          x="299"
          y="161"
          width="8"
          height="50"
          rx="4"
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

        <span />

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

.pressure-track,
.pressure-fill {
  fill: none;
  stroke-linecap: round;
  stroke-width: 12;
}

.pressure-track {
  stroke: var(--color-primary-100);
  opacity: 0.28;
}

.pressure-fill {
  stroke: var(--color-primary-400);
  stroke-dasharray: var(--pressure-percent) 100;
  transition: stroke-dasharray 280ms cubic-bezier(0.16, 1, 0.3, 1);
}

.pressure-ticks line {
  stroke: var(--color-primary-200);
  stroke-width: 4;
  stroke-linecap: round;
  opacity: 0.65;
}

.balloon-group {
  transform-box: fill-box;
  transform-origin: 50% 78%;
  transform:
    translateY(var(--balloon-lift))
    scale(var(--balloon-scale));
  transition: transform 280ms cubic-bezier(0.16, 1, 0.3, 1);
}

.balloon-shadow {
  fill: rgba(7, 24, 36, 0.22);
  transform-origin: center;
  transform: scaleX(calc(0.75 + var(--pressure-percent) / 180));
  opacity: 0.7;
}

.balloon-main {
  fill: url("#none");
  fill: var(--balloon-color);
}

.balloon-side {
  fill: var(--color-primary-800);
  opacity: 0.2;
}

.balloon-shine {
  fill: rgba(255, 255, 255, 0.42);
}

.balloon-shine-small {
  fill: rgba(255, 255, 255, 0.22);
}

.balloon-neck {
  fill: var(--color-primary-700);
}

.balloon-knot {
  fill: var(--color-primary-800);
}

.hose-shadow,
.hose-line {
  fill: none;
  stroke-linecap: round;
}

.hose-shadow {
  stroke: rgba(7, 24, 36, 0.28);
  stroke-width: 12;
  transform: translateY(5px);
}

.hose-line {
  stroke: var(--color-neutral-50);
  stroke-width: 8;
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

.pump-stick {
  transition: transform 160ms ease;
  transform-origin: top;
  transform-box: fill-box;
}

.pump-handle {
  transition: transform 160ms ease;
  transform-origin: center;
  transform-box: fill-box;
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
  transform: translateY(18px);
}

.pumping .pump-stick {
  transform: scaleY(0.58);
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

.exploded .pressure-arc,
.exploded .hose-line,
.exploded .hose-shadow,
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