# Active Context

## Current Work Focus
Se completó la **biblioteca de 19 skins vectoriales isométricas en `assets/img/`**, con estilo artístico homogéneo a 30°, iluminación facetada en 3 planos y sombras de piso. Además, se generaron y documentaron los **4 diagramas SVG arquitectónicos completos en `doc/doc_img/doc_svg/architecture/`** (Dependencias, Grafo de Relaciones, Diagrama UML y Codemap exhaustivo). La suite de pruebas de integridad se encuentra al **100% de éxito con 360 pruebas automatizadas sin fallos**.

El foco activo continúa en el avance de las propuestas de mejora documentadas en [`mejoras.md`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/mejoras.md) y [`roadmap_mejoras.md`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_md/roadmap_mejoras.md).

## Recent Changes (Octubre 2026)
- **[2026-10-09] Biblioteca Completa de 19 Skins Vectoriales Isométricas (`assets/img/`):**
  - **Estilo Artístico Homogéneo:** Proyección isométrica limpia a 30°, iluminación facetada en tres planos (tope claro, cara frontal/lateral izquierda media, cara derecha oscura), paleta de colores técnicos (carbón, cian luminoso, naranja/rojo de alarma, acentos metálicos) y sombras de piso elípticas difuminadas.
  - **19 Activos Diseñados y Disponibles:**
    1. `desktop_workstation_iso.svg`: Estación de trabajo PC con torre nítida, monitor slim con reflejo diagonal y teclado con barra espaciadora clara.
    2. `router_modem_iso.svg`: Router/módem con antena vertical, LEDs y 5 puertos RJ45.
    3. `cctv_camera_iso.svg`: Cámara de seguridad CCTV tipo bala con lente turquesa y brazo articulado.
    4. `server_rack_open_iso.svg`: Gabinete de servidores con puerta batiente abierta a 90°, bahías SAN y LEDs.
    5. `telecom_tower_iso.svg`: Torre de transmisión inalámbrica con crucetas metálicas, baliza roja y ondas de radio.
    6. `laptop_client_iso.svg`: Laptop cliente con bisel de pantalla, teclado y trackpad.
    7. `database_storage_iso.svg`: Cilindros de base de datos en tres niveles de color (rojo, marino y cian).
    8. `switch_24p_iso.svg`: Switch de red 1U con frente amplio, matriz clara de puertos RJ45 con LEDs y jaulas SFP+ plateadas.
    9. `ups_power_iso.svg`: UPS con pantalla LCD de voltaje y módulo de baterías hot-swap.
    10. `pdu_power_strip_iso.svg`: Regleta PDU vertical 0U con tomas IEC C13, display de amperaje y cable trifásico.
    11. `firewall_shield_iso.svg`: Firewall UTM con chasis rojo y escudo protector vertical azul con candado reconocible.
    12. `access_point_iso.svg`: Punto de acceso Wi-Fi de techo tipo plato con anillo LED cian luminoso.
    13. `nvr_recorder_iso.svg`: Grabador NVR para videovigilancia CCTV con bahías SATA y 8 puertos PoE.
    14. `nas_storage_iso.svg`: Servidor NAS de almacenamiento en torre con 4 bahías hot-swap y pestillos metálicos.
    15. `decoder_box_iso.svg`: Decodificador de TV / Streaming con pantalla digital de canal y salidas HDMI.
    16. `voip_phone_iso.svg`: Teléfono IP VoIP con base angular limpia, teclado matricial contrastado, pantalla LCD y auricular separado con cable en espiral.
    17. `network_printer_iso.svg`: Impresora multifuncional láser con escáner, pantalla táctil y hoja impresa en salida.
    18. `datacenter_door_iso.svg`: Puerta de acceso a datacenter con marco de acero proporcional, puerta de cristal cian entreabierta, barra antipánico y control RFID lateral.
    19. `vehicle_barrier_iso.svg`: Barrera vehicular / talanquera con gabinete naranja, baliza ámbar y pluma reflectiva.
  - Disponibles directamente para asignación de hardware y personalización en el campo "Archivo Skin (`assets/img/`)" de los modales de equipos.
- **[2026-10-09] Documentación y Diagramación Vectorial Arquitectónica (`doc/doc_img/doc_svg/architecture/`):**
  - **`codemap_grafo_completo.svg` (2400x1600 px):** Codemap exhaustivo de la base de código en Dark Mode que mapea todas las funciones, módulos y flujos del sistema con sección interactiva *"¿Qué archivo toco si quiero...?"*.
  - **`diagrama_uml_completo_sistema.svg` (2200x1500 px):** Diagrama UML técnico de clases y paquetes modelando Platform, Styles, Core, Security, UIView, Modals, Topology, Runtime y Vendor.
  - **`grafo_relaciones_archivos_sistema.svg` (2000x1350 px):** Grafo integral de relaciones y dependencias entre la totalidad de los archivos de código del proyecto.
  - **`diagrama_dependencias_completo.svg` (1600x1100 px):** Diagrama estructurado de las 8 capas arquitectónicas del sistema.
- **[2026-10-06] Plantilla Demo Adicional: Campus Universitario UTN y Modal de Selección:**
  - Red jerárquica de 3 capas modelando la UTN (10 edificios: DCC, TIC, ADM, AUL, ING, BIB, LAB, CAM, DEP, RES).
  - 13 gabinetes estructurados, 24 VLANs según el esquema 10.0.0.0/8, 162 dispositivos y 97 conexiones físicas.
  - Modal `#modal-demo-selection` con selección visual interactiva y respaldo automático de seguridad.
  - Runner web en `tests/index.html` adaptado para operación en `file:///` desacoplando `fetch()` con fallback autónomo.
- **[2026-10-05] Implementación de M-04: Redibujado Selectivo y Despacho Optimizado:**
  - Redibujado granular de gabinetes individuales con `renderSingleRack(rackId)` en `js/ui/rack.js`.
  - Coalescencia rAF a 60 FPS en `main.js` y banderas de estado sucio (`_renderState`).
  - Monitor de telemetría y diagnóstico `window.RenderPerformance`.
- **[2026-10-05] Implementación de M-03: Optimización de deepClone y Limitación de Historial:**
  - Algoritmo `fastClone` 4x más veloz que JSON en `js/utils.js`.
  - Límite estricto de 15 instantáneas (`_maxHistory = 15`) y deduplicación reactiva $O(1)$.
  - Snapshots livianos excluyendo `topologySlots` con ahorro de hasta 80% en RAM.
- **[2026-10-05] Implementación de M-28: Skins Visuales en Topología (Cards, Nodos e Imágenes / Hardware Skins):**
  - Módulo `TopologySkins.js` con 18 presets offline, renderizado fotorrealista de chasis y soporte para base64 DataURL.

## Next Steps
Continuar con el roadmap técnico ([`mejoras.md`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/mejoras.md) / [`roadmap_mejoras.md`](file:///c:/Users/admin/.gemini/antigravity/scratch/Rack_Designer_2/doc/doc_md/roadmap_mejoras.md)):
1. **Fase 2 — Core de Datos y Ergonomía de Puertos:**
   - **M-26:** Gestión avanzada de puertos, validación de ocupación y soporte de VLANs en conexiones.
   - **M-33:** Separación de cableado frontal vs. trasero en puertos duales.
   - **M-34:** Conexiones interactivas *Drag-to-Connect* arrastrando puertos directamente en la vista física.
2. **Fase 3 — Ergonomía y Layout:**
   - **M-25A:** Optimización adaptativa y responsive para pantallas de Desktop y Laptops medianas.
3. **Fase 6 — Colaboración y Resiliencia:**
   - **M-35:** Flexibilidad de ubicación sin restricciones arbitrarias.
   - **M-07:** Resolución de conflictos multiusuario y versionado de proyectos.

## Active Decisions & Considerations
- **100% Vanilla JS + CSS3 + HTML5:** Arquitectura reactiva con Proxy nativo ES6 sin dependencias de compilación.
- **Cero Diálogos Bloqueantes:** Modales HTML5 interactivos accesibles para todas las operaciones.
- **Suite de Integridad 100% OK:** 360 pruebas automáticas en `tests/integrity_check.cjs` y `tests/index.html` pasando sin errores.
- **Actualización Obligatoria de Documentación:** Mantener sincronizados `memory-bank/` y `doc/log/CHANGELOG.md` en cada hito de desarrollo.
