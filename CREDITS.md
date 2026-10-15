# Credits and provenance for the Hummle website

## Fonts (self-hosted, SIL Open Font License 1.1)

- Fraunces: headings
- Atkinson Hyperlegible Next: interface text
- Literata: reading text
- Kalam: handwritten margin notes

All four are served from `fonts/`; the site makes no requests to other hosts.

## Voice portraits (`voices/`)

The portraits are AI-generated. They are not photographs of real people.

- Model: Z-Image Turbo (Tongyi-MAI), Apache 2.0, used as the Q8_0 GGUF conversion from `leejet/Z-Image-Turbo-GGUF`.
- Text encoder: Qwen3-4B-Instruct-2507 (Apache 2.0). Autoencoder: FLUX.1 `ae.safetensors` (Apache 2.0, from the FLUX.1-schnell release).
- Runtime: stable-diffusion.cpp `master-929-3f8527a`, Vulkan build, run locally on a desktop graphics card.
- Settings: 1024 × 1280, 8 steps, CFG 1.0. The prompt for each voice is kept with Hummle's project files; the seed chosen for each voice is listed below.
- Web files: `<id>.webp` (640 × 800) and `<id>-sm.webp` (300 × 300 face crop).

| Voice | Seed |
|---|---|
| Mara | 1000 |
| Elias | 1000 |
| June | 1000 |
| Theo | 1000 |
| Nadia | 1001 |
| Idris | 1000 |
| Clara | 1000 |
| Arthur | 1000 |
| Sade | 1000 |
| Luca | 1001 |

## Illustrations

The Hummle bird, its stickers (`art/`) and the logo (`brand/`) are original to Hummle.
