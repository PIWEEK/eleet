![rrss header](https://github.com/user-attachments/assets/0511ca01-c0f3-4c98-a558-1ae7182c9e05)

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
pnpm link --global @taoro/math-interpolation
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

## Generar modelos

Si quieres exportar un único modelo, se puede hacer con el comando:

```sh
blender --background --python scripts/export.py -- models/basic-ship.blend
```

Para exportar todos los modelos de la carpeta `public/models`:

```sh
pnpm run models:export
```

## IA

```sh
curl -fsSL https://ollama.com/install.sh | sh
ollama run llama3
```
