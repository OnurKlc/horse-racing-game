import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfettiEffect from '../ConfettiEffect.vue'
import type { Particle } from '../ConfettiEffect.vue'

describe('ConfettiEffect', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(ConfettiEffect, {
      props: {
        trigger: false,
        colors: ['#FFD700', '#FF6B6B', '#4ECDC4']
      }
    })
  })

  describe('rendering', () => {
    it('should not show confetti initially', () => {
      expect(wrapper.find('.confetti-container').exists()).toBe(false)
    })

    it('should show confetti when triggered', async () => {
      await wrapper.setProps({ trigger: true })
      expect(wrapper.find('.confetti-container').exists()).toBe(true)
    })
  })

  describe('particle generation', () => {
    it('should generate particles when triggered', async () => {
      await wrapper.setProps({ trigger: true })

      expect(wrapper.vm.particles).toHaveLength(50)
      expect(wrapper.vm.show).toBe(true)
    })

    it('should generate particles with correct properties', async () => {
      await wrapper.setProps({ trigger: true })

      wrapper.vm.particles.forEach((particle: Particle) => {
        expect(particle).toHaveProperty('x')
        expect(particle).toHaveProperty('color')
        expect(particle).toHaveProperty('delay')
        expect(particle).toHaveProperty('duration')

        expect(particle.x).toBeGreaterThanOrEqual(0)
        expect(particle.x).toBeLessThanOrEqual(100)
        expect(['#FFD700', '#FF6B6B', '#4ECDC4']).toContain(particle.color)
        expect(particle.delay).toBeGreaterThanOrEqual(0)
        expect(particle.duration).toBeGreaterThanOrEqual(2000)
      })
    })
  })

  describe('animation lifecycle', () => {
    it('should emit finished event when animation ends', async () => {
      await wrapper.setProps({ trigger: true })

      await wrapper.vm.onAnimationEnd()

      expect(wrapper.emitted('finished')).toBeTruthy()
      expect(wrapper.vm.show).toBe(false)
    })

    it('should handle multiple triggers correctly', async () => {
      // First trigger
      await wrapper.setProps({ trigger: true })
      expect(wrapper.vm.show).toBe(true)

      // Reset
      await wrapper.setProps({ trigger: false })
      wrapper.vm.show = false

      // Second trigger
      await wrapper.setProps({ trigger: true })
      expect(wrapper.vm.show).toBe(true)
    })
  })

  describe('customization', () => {
    it('should use custom colors', async () => {
      const customColors = ['#FF0000', '#00FF00', '#0000FF']

      await wrapper.setProps({
        trigger: true,
        colors: customColors
      })

      wrapper.vm.particles.forEach((particle: Particle) => {
        expect(customColors).toContain(particle.color)
      })
    })

    it('should use default colors when none provided', () => {
      const defaultWrapper = mount(ConfettiEffect, {
        props: { trigger: false }
      })

      expect(defaultWrapper.props('colors')).toEqual([
        '#FFD700',
        '#FF6B6B',
        '#4ECDC4',
        '#45B7D1',
        '#FFA07A',
        '#98D8C8'
      ])
    })
  })

  describe('accessibility', () => {
    it('should have correct ARIA attributes', async () => {
      await wrapper.setProps({ trigger: true })

      const container = wrapper.find('.confetti-container')
      expect(container.attributes('aria-hidden')).toBeUndefined() // Should be focusable but not interfere
    })

    it('should not interfere with screen readers', async () => {
      await wrapper.setProps({ trigger: true })

      const container = wrapper.find('.confetti-container')
      expect(container.classes()).toContain('confetti-container')

      // Check that it has pointer-events: none in styles
      expect(wrapper.vm.$el.style.pointerEvents).toBe('none')
    })
  })

  describe('performance', () => {
    it('should generate particles efficiently', () => {
      const startTime = performance.now()

      wrapper.vm.generateParticles()

      const endTime = performance.now()
      const duration = endTime - startTime

      // Should generate particles quickly (less than 10ms)
      expect(duration).toBeLessThan(10)
    })

    it('should clean up when component unmounts', () => {
      const cleanupSpy = vi.fn()
      wrapper.vm.$el.removeEventListener = cleanupSpy

      wrapper.unmount()

      // Component should cleanup properly
      expect(wrapper.vm.$el).toBeFalsy()
    })
  })
})
