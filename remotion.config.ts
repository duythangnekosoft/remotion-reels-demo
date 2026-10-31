import { Config } from "@remotion/cli/config";

// 1. Hardware & Engine Optimization
Config.setChromiumOpenGlRenderer("angle"); // Optimized DirectX/ANGLE rendering on Windows
Config.setVideoImageFormat("jpeg");        // 2x faster frame encoding than uncompressed PNG
Config.setJpegQuality(90);                // Crisp visuals with optimal file size

// 2. Multi-core Concurrency
Config.setConcurrency(null);              // Automatically utilize all available CPU cores

// 3. Audio & Codec Configuration
Config.setCodec("h264");
Config.setCrf(18);                        // Visually lossless studio CRF for H.264
Config.setPixelFormat("yuv420p");         // Standard format compatible with FB, TikTok, and YouTube

// 4. Entry point
Config.setEntryPoint("./src/index.ts");

