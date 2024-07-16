# Eleet

## Instalación

```sh
# From a different folder
git clone https://github.com/azazeln28/taoro
cd taoro
git checkout develop
corepack enable pnpm
pnpm install --recursive
pnpm run link:all
```

```sh
# From the eleet folder
pnpm link --global @taoro/component
pnpm link --global @taoro/component-transform-3d
pnpm link --global @taoro/game
pnpm link --global @taoro/input
pnpm link --global @taoro/math-matrix4
pnpm link --global @taoro/math-random
pnpm link --global @taoro/math-random-lcg
pnpm link --global @taoro/math-vector3
pnpm link --global @taoro/webgl
```

```sh
pnpm install
pnpm run dev
```
