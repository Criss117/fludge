# Expo Template · SDK 57

Template de inicio rápido para aplicaciones React Native con Expo SDK 57. Pensado como punto de partida limpio y moderno para proyectos nuevos, sin el boilerplate genérico de `create-expo-app`.

## Stack

| Capa            | Tecnología                                                                     |
| --------------- | ------------------------------------------------------------------------------ |
| Runtime         | [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) · React Native 0.86     |
| Lenguaje        | TypeScript 6.0 (strict)                                                        |
| Navegación      | [expo-router](https://docs.expo.dev/router/introduction/) (file-based)         |
| Estilos         | [Tailwind CSS v4](https://tailwindcss.com/) vía [Uniwind](https://uniwind.dev) |
| Componentes     | [HeroUI Native](https://heroui-native.com)                                     |
| Animaciones     | react-native-reanimated 4.5                                                    |
| Gestos          | react-native-gesture-handler · bottom-sheet                                    |
| Fuente          | Geist (Google Fonts)                                                           |
| Package manager | Bun                                                                            |

## Estructura del proyecto

```
src/
├── app/                  # Expo Router (file-based routing)
│   ├── _layout.tsx       # Root layout: providers + Stack
│   └── index.tsx         # Pantalla inicial
├── integrations/         # Composición de providers
│   ├── index.tsx         # Integrations wrapper
│   ├── fonts/            # Carga de fuente Geist
│   └── heroui/           # Tema HeroUI (light/dark)
├── globals.css           # Design tokens + Tailwind theme
└── uniwind-types.d.ts    # Tipos autogenerados por Uniwind
```

### Design tokens

Los tokens de diseño están definidos en `src/globals.css` usando el espacio de color **oklch** y directivas `@theme` de Tailwind CSS v4. El tema incluye:

- Variantes **light** y **dark** automáticas
- Colores semánticos: `background`, `foreground`, `surface`, `overlay`, `accent`, `success`, `warning`, `danger`
- Sombras y bordes con opacidad nativa
- Tipografía Geist en 9 pesos (thin → black)

## Empezar

### Requisitos

- [Bun](https://bun.sh) (usado como package manager)
- [Expo CLI](https://docs.expo.dev/more/expo-cli/)
- Expo Go en el dispositivo, o un emulador configurado

### Instalación

```bash
bun install
```

### Desarrollo

```bash
bun start        # Expo dev server
bun android      # Android
bun ios          # iOS
bun web          # Web
```

### Linting

```bash
bun lint
```

## Personalizar

1. **Nombre del proyecto**: cambiá `"name"` en `package.json` y `app.json`.
2. **Tema**: editá los tokens en `src/globals.css`. Los colores usan oklch — podés generarlos en [oklch.com](https://oklch.com).
3. **Fuente**: cambiá la fuente en `src/integrations/fonts/` y actualizá las variables `--font-*` en `globals.css`.
4. **Iconos y splash**: reemplazá los assets en `assets/` y configuralos en `app.json`.

## Path aliases

```typescript
import { Button } from "@/components/Button"; // src/components/Button
import logo from "@/assets/icon.png"; // assets/icon.png
```

## Licencia

MIT
