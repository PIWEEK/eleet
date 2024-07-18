import { Component } from '@taoro/component'
import { ColliderComponent } from './ColliderComponent'

export class SphereColliderComponent extends ColliderComponent {
  #radius = 1.0

  constructor(id, options) {
    super(id, options)
    Component.registerByConstructor(ColliderComponent, this)
    this.#radius = options?.radius ?? 1.0
  }

  get radius() { return this.#radius }
}