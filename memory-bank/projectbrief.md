# Project Brief: RACK Designer Next

## Core Purpose
RACK Designer Next es una aplicación web progresiva (PWA) de alto rendimiento, diseñada para operar 100% en el cliente (browser-based y offline). Su propósito fundamental es el diseño, documentación, inventario y gestión de infraestructuras físicas de centros de datos (Datacenters), cuartos de telecomunicaciones y redes jerárquicas empresariales.

Permite a arquitectos de IT e ingenieros de infraestructura modelar ubicaciones físicas (Salas/Rooms), gabinetes estandarizados (Racks), equipamiento activo y periféricos (Devices), canalizaciones bicanal (techo/piso) y conexiones de cableado punto a punto con validación de puertos y direccionamiento IP/VLAN.

## Ultimate Goals
1. **Editor Visual Fluido y Reactivo:** Proveer un lienzo de diseño visual cliente-servidor desacoplado (100% PWA local), capaz de correr directamente desde `index.html` sin requerir compiladores, bundlers ni backend.
2. **Trazabilidad y Mapeo Físico y Lógico:** Visualización simultánea del alzado físico en grilla CAD milimétrica (frente y dorso 3D) y topología lógica de red (Canvas 2D con layouts DAG, presets de hardware y animaciones de paquetes a 60 FPS).
3. **Biblioteca Vectorial de Skins y Presets Isométricos:** Soporte para carátulas de hardware personalizadas y galería de skins vectoriales en `assets/img/` con estilo isométrico a 30° para periféricos y equipos de datacenter.
4. **Diseño de Grado de Producción:** Gobernanza de acceso RBAC con SHA-256, cifrado simétrico en reposo AES-GCM (WebCrypto API), exportaciones 1:1 de alta fidelidad (Retina 2x, Excel/CSV con metadatos) e importación masiva con detección de colisiones de slots.

## Scope
- **In Scope:** Modelado multiesquema de salas y gabinetes, faceplates vectoriales SVG interactivos, enrutamiento bicanal aéreo y bajo piso, topología Canvas 2D con animaciones reactivas y 5 slots de memoria rápida, importación/exportación masiva (JSON, Excel, CSV, PNG de alta definición), cifrado de credenciales en reposo, skins isométricos y catálogo arquitectónico extensible.
- **Out of Scope:** Monitorización SNMP en tiempo real, sondeo de telemetría en vivo o descubrimiento automatizado de red (la herramienta es un entorno de diseño, modelado CAD y documentación técnica de infraestructura).
