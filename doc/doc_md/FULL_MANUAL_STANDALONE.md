# Rack Designer Next - Documentación Completa (Standalone)

Esta es una versión combinada y autónoma de la documentación, con todas las imágenes incrustadas internamente, lo que permite mover este archivo sin que se rompan los enlaces.

---

# RACK Designer Next — Manual de Usuario Definitivo

Bienvenido al manual paso a paso de **RACK Designer Next**, tu herramienta definitiva para gestionar salas, racks, equipos de telecomunicaciones y conexiones. Este manual está diseñado asumiendo que **no tienes experiencia previa** con la aplicación, por lo que te guiaremos desde lo más básico hasta que seas capaz de mapear un centro de datos completo.

---

## 📖 Parte 1: Conceptos Básicos (Para Principiantes)

Antes de hacer clic en cualquier botón, es vital entender qué estamos construyendo.

### ¿Qué es un Datacenter o Sala de Equipos?
Es simplemente una habitación física donde se guardan las computadoras centrales (servidores), los aparatos que reparten internet (switches, routers) y los sistemas de energía (baterías, aires acondicionados). En nuestra aplicación, todo empieza por crear una **Sala**.

### ¿Qué es un "Rack" o "Gabinete"?
Imagina un estante metálico, como un librero muy alto y estandarizado. Su propósito es apilar equipos uno encima del otro para ahorrar espacio. 
En nuestra aplicación, los Racks van **adentro de las Salas**.

### ¿Qué es una Unidad "U"?
Como los estantes del "Rack" están vacíos, necesitamos medir la altura de los equipos para saber cuántos caben. Para ello usamos la medida **"U"**.
- Un Rack de tamaño completo suele tener **42U** de espacio de arriba a abajo.
- Un equipo pequeño ocupa **1U**. Un servidor más grande puede ocupar **2U** o **4U**.

> [!TIP]
> **Vistas de un Rack (Frente y Atrás)**
> Los Racks tienen dos puertas. Por delante (Front) sueles ver los botones de encendido y discos duros. Por detrás (Rear) sueles ver los cables de poder y puertos de red. ¡La aplicación te permite girar el Rack para trabajar por ambas caras!

![Anatomía de un Rack](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAwIDcwMCIgZmlsbD0ibm9uZSI+DQogIDxkZWZzPg0KICAgIDxzdHlsZT4NCiAgICAgIEBpbXBvcnQgdXJsKCdodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2NzczI/ZmFtaWx5PU91dGZpdDp3Z2h0QDMwMDs0MDA7NTAwOzYwMDs3MDA7ODAwJmFtcDtkaXNwbGF5PXN3YXAnKTsNCiAgICAgIHRleHQgeyBmb250LWZhbWlseTogJ091dGZpdCcsIHNhbnMtc2VyaWY7IH0NCiAgICAgIC50aXRsZSB7IGZvbnQtd2VpZ2h0OiA4MDA7IGZpbGw6ICMzOGJkZjg7IGZvbnQtc2l6ZTogMjRweDsgfQ0KICAgICAgLmRlc2MgeyBmb250LXdlaWdodDogNDAwOyBmaWxsOiAjOTRhM2I4OyBmb250LXNpemU6IDE0cHg7IH0NCiAgICAgIC5sYWJlbC1obCB7IGZvbnQtd2VpZ2h0OiA3MDA7IGZpbGw6ICMxMGI5ODE7IGZvbnQtc2l6ZTogMTZweDsgfQ0KICAgIDwvc3R5bGU+DQogIDwvZGVmcz4NCg0KICA8cmVjdCB3aWR0aD0iMTAwMCIgaGVpZ2h0PSI3MDAiIGZpbGw9IiMwYjBmMTkiIHJ4PSIxNiIvPg0KDQogIDx0ZXh0IHg9IjQwIiB5PSI1MCIgY2xhc3M9InRpdGxlIj7Cv1FVw4kgRVMgVU4gUkFDSyBZIFVOQSBVTklEQUQgIlUiPzwvdGV4dD4NCiAgPHRleHQgeD0iNDAiIHk9Ijc1IiBjbGFzcz0iZGVzYyI+RW50aWVuZGUgbGEgYW5hdG9tw61hIGLDoXNpY2EgZGVsIGFsbWFjZW5hbWllbnRvIGVuIHVuIERhdGFjZW50ZXI8L3RleHQ+DQoNCiAgPCEtLSBSYWNrIERpYWdyYW0gLS0+DQogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE1MCwgMTUwKSI+DQogICAgPCEtLSBSYWNrIEZyYW1lIC0tPg0KICAgIDxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMTUxYzJlIiBzdHJva2U9IiMyZTNkNWEiIHN0cm9rZS13aWR0aD0iNCIgcng9IjQiLz4NCiAgICANCiAgICA8IS0tIFUgc2xvdHMgLS0+DQogICAgPGcgZmlsbD0iIzBmMTcyYSIgc3Ryb2tlPSIjMjUzMDRiIiBzdHJva2Utd2lkdGg9IjEiPg0KICAgICAgPHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMjgwIiBoZWlnaHQ9IjMwIiAvPg0KICAgICAgPHRleHQgeD0iMTQ1IiB5PSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzQ3NTU2OSI+VTQyIChWYWPDrW8pPC90ZXh0Pg0KICAgICAgPHJlY3QgeD0iMTAiIHk9IjQ1IiB3aWR0aD0iMjgwIiBoZWlnaHQ9IjMwIiAvPg0KICAgICAgPHRleHQgeD0iMTQ1IiB5PSI2NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzQ3NTU2OSI+VTQxIChWYWPDrW8pPC90ZXh0Pg0KICAgICAgPCEtLSAuLi4gc2tpcCAuLi4gLS0+DQogICAgICA8cmVjdCB4PSIxMCIgeT0iMTUwIiB3aWR0aD0iMjgwIiBoZWlnaHQ9IjMwIiAvPg0KICAgICAgPHRleHQgeD0iMTQ1IiB5PSIxNzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM0NzU1NjkiPlUzMCAoVmFjw61vKTwvdGV4dD4NCiAgICA8L2c+DQoNCiAgICA8IS0tIDJVIFNlcnZlciAtLT4NCiAgICA8cmVjdCB4PSI4IiB5PSIxODUiIHdpZHRoPSIyODQiIGhlaWdodD0iNjUiIGZpbGw9IiMwNjRlM2IiIHN0cm9rZT0iIzEwYjk4MSIgc3Ryb2tlLXdpZHRoPSIyIiByeD0iMiIvPg0KICAgIDx0ZXh0IHg9IjE1MCIgeT0iMjE1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iNzAwIiBmaWxsPSIjMTBiOTgxIj5TZXJ2aWRvciBEZWxsIChPY3VwYSAyVSk8L3RleHQ+DQogICAgPHRleHQgeD0iMTUwIiB5PSIyMzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiMzNGQzOTkiPkluc3RhbGFkbyBlbiBVMjggeSBVMjk8L3RleHQ+DQoNCiAgICA8ZyBmaWxsPSIjMGYxNzJhIiBzdHJva2U9IiMyNTMwNGIiIHN0cm9rZS13aWR0aD0iMSI+DQogICAgICA8cmVjdCB4PSIxMCIgeT0iMjU1IiB3aWR0aD0iMjgwIiBoZWlnaHQ9IjMwIiAvPg0KICAgICAgPHRleHQgeD0iMTQ1IiB5PSIyNzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM0NzU1NjkiPlUyNyAoVmFjw61vKTwvdGV4dD4NCiAgICA8L2c+DQoNCiAgICA8dGV4dCB4PSIxNTAiIHk9IjQzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCI+R2FiaW5ldGUgRXN0w6FuZGFyIChFajogNDJVKTwvdGV4dD4NCiAgPC9nPg0KDQogIDwhLS0gRXhwbGFuYXRpb25zIC0tPg0KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1NTAsIDE1MCkiPg0KICAgIDx0ZXh0IHg9IjAiIHk9IjIwIiBjbGFzcz0ibGFiZWwtaGwiIGZpbGw9IiMzOGJkZjgiPjEuIMK/UXXDqSBlcyB1biBSYWNrIChHYWJpbmV0ZSk/PC90ZXh0Pg0KICAgIDx0ZXh0IHg9IjAiIHk9IjQ1IiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTRhM2I4IiB3aWR0aD0iNDAwIj5FcyB1biBhcm1hcmlvIG1ldMOhbGljbyBkaXNlw7FhZG8gcGFyYSBhcGlsYXI8L3RleHQ+DQogICAgPHRleHQgeD0iMCIgeT0iNjUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5NGEzYjgiIHdpZHRoPSI0MDAiPmVxdWlwb3MgZGUgZm9ybWEgdmVydGljYWwsIGFob3JyYW5kbyBlc3BhY2lvLjwvdGV4dD4NCg0KICAgIDx0ZXh0IHg9IjAiIHk9IjEyMCIgY2xhc3M9ImxhYmVsLWhsIiBmaWxsPSIjMTBiOTgxIj4yLiDCv1F1w6kgZXMgdW5hICJVIj88L3RleHQ+DQogICAgPHRleHQgeD0iMCIgeT0iMTQ1IiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTRhM2I4IiB3aWR0aD0iNDAwIj5MYSAiVSIgKFVuaWRhZCBSYWNrKSBlcyBsYSBtZWRpZGEgZGUgYWx0dXJhIGVzdMOhbmRhci48L3RleHQ+DQogICAgPHRleHQgeD0iMCIgeT0iMTY1IiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTRhM2I4IiB3aWR0aD0iNDAwIj4xVSA9IDEuNzUgcHVsZ2FkYXMgKDQuNDQgY20pLjwvdGV4dD4NCiAgICA8dGV4dCB4PSIwIiB5PSIxODUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5NGEzYjgiIHdpZHRoPSI0MDAiPlVuIHNlcnZpZG9yIHB1ZWRlIG9jdXBhciAxVSwgMlUgbyBtw6FzLjwvdGV4dD4NCg0KICAgIDx0ZXh0IHg9IjAiIHk9IjI0MCIgY2xhc3M9ImxhYmVsLWhsIiBmaWxsPSIjZjU5ZTBiIj4zLiBWaXN0YXM6IEZyb250YWwgeSBUcmFzZXJhPC90ZXh0Pg0KICAgIDx0ZXh0IHg9IjAiIHk9IjI2NSIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCIgd2lkdGg9IjQwMCI+TG9zIFJhY2tzIHRpZW5lbiBkb3MgImNhcmFzIi4gTG9zIGVxdWlwb3Mgc2UgbW9udGFuPC90ZXh0Pg0KICAgIDx0ZXh0IHg9IjAiIHk9IjI4NSIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCIgd2lkdGg9IjQwMCI+cG9yIGRlbGFudGUgKEZyZW50ZSksIHBlcm8gbG9zIGNhYmxlcyB5IHB1ZXJ0b3M8L3RleHQ+DQogICAgPHRleHQgeD0iMCIgeT0iMzA1IiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTRhM2I4IiB3aWR0aD0iNDAwIj5kZSByZWQgYSBtZW51ZG8gc2UgY29uZWN0YW4gcG9yIGRldHLDoXMgKEF0csOhcykuPC90ZXh0Pg0KICAgIA0KICAgIDx0ZXh0IHg9IjAiIHk9IjMyNSIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM4YmRmOCIgd2lkdGg9IjQwMCI+RW4gbGEgYXBsaWNhY2nDs24gcHVlZGVzIGFsdGVybmFyIGVudHJlIGFtYmFzIGNhcmFzLjwvdGV4dD4NCiAgPC9nPg0KPC9zdmc+DQo=)

---

## 🗺️ Parte 2: Conociendo la Interfaz

Al abrir RACK Designer Next, verás tu área de trabajo dividida en **5 paneles principales**. 

![Mapa de la Interfaz](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAwIDg2MCIgZmlsbD0ibm9uZSI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIEBpbXBvcnQgdXJsKCdodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2NzczI/ZmFtaWx5PU91dGZpdDp3Z2h0QDMwMDs0MDA7NTAwOzYwMDs3MDA7ODAwJmFtcDtkaXNwbGF5PXN3YXAnKTsKICAgICAgQGltcG9ydCB1cmwoJ2h0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9SmV0QnJhaW5zK01vbm86d2dodEA0MDA7NTAwOzYwMCZhbXA7ZGlzcGxheT1zd2FwJyk7CiAgICAgIHRleHQgeyBmb250LWZhbWlseTogJ091dGZpdCcsIC1hcHBsZS1zeXN0ZW0sIHNhbnMtc2VyaWY7IH0KICAgICAgLm1vbm8geyBmb250LWZhbWlseTogJ0pldEJyYWlucyBNb25vJywgbW9ub3NwYWNlOyB9CiAgICAgIC50aXRsZSB7IGZvbnQtd2VpZ2h0OiA4MDA7IGZpbGw6ICMzOGJkZjg7IGZvbnQtc2l6ZTogMjRweDsgbGV0dGVyLXNwYWNpbmc6IDAuNXB4OyB9CiAgICAgIC5kZXNjIHsgZm9udC13ZWlnaHQ6IDQwMDsgZmlsbDogIzk0YTNiODsgZm9udC1zaXplOiAxNHB4OyB9CiAgICAgIC5iYWRnZSB7IGZpbGw6ICMwYjBmMTk7IGZvbnQtd2VpZ2h0OiA4MDA7IGZvbnQtc2l6ZTogMThweDsgdGV4dC1hbmNob3I6IG1pZGRsZTsgfQogICAgICAucGFuZWwtbGFiZWwgeyBmb250LXdlaWdodDogNzAwOyBmaWxsOiAjZjBmNGZmOyBmb250LXNpemU6IDE1cHg7IH0KICAgICAgLnBhbmVsLXN1YiB7IGZvbnQtd2VpZ2h0OiA0MDA7IGZpbGw6ICM5NGEzYjg7IGZvbnQtc2l6ZTogMTJweDsgfQogICAgPC9zdHlsZT4KICAgIDxmaWx0ZXIgaWQ9InNoYWRvd1dpbmRvdyIgeD0iLTUlIiB5PSItNSUiIHdpZHRoPSIxMTAlIiBoZWlnaHQ9IjExNSUiPgogICAgICA8ZmVEcm9wU2hhZG93IGR4PSIwIiBkeT0iNiIgc3RkRGV2aWF0aW9uPSIxMCIgZmxvb2QtY29sb3I9IiMwMDAiIGZsb29kLW9wYWNpdHk9IjAuNTUiLz4KICAgIDwvZmlsdGVyPgogIDwvZGVmcz4KCiAgPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iODYwIiBmaWxsPSIjMGIwZjE5IiByeD0iMTYiLz4KCiAgPCEtLSBFbmNhYmV6YWRvIFByaW5jaXBhbCAtLT4KICA8dGV4dCB4PSI0MCIgeT0iNDgiIGNsYXNzPSJ0aXRsZSI+TUFQQSBERSBMQSBJTlRFUkZBWiBQUklOQ0lQQUwg4oCUIFJBQ0sgREVTSUdORVIgTkVYVDwvdGV4dD4KICA8dGV4dCB4PSI0MCIgeT0iNzIiIGNsYXNzPSJkZXNjIj5HdcOtYSBkZSBvcmllbnRhY2nDs24gdmlzdWFsIGRlIGxvcyA1IGN1YWRyYW50ZXMgb3BlcmF0aXZvcyBkZSBsYSBjb25zb2xhIGRlIGRhdGFjZW50ZXI8L3RleHQ+CgogIDwhLS0gVkVOVEFOQSBNT0NLVVAgREUgTEEgQVBMSUNBQ0nDk04gLS0+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDAsIDk1KSIgZmlsdGVyPSJ1cmwoI3NoYWRvd1dpbmRvdykiPgogICAgPCEtLSBDb250ZW5lZG9yIEJhc2UgLS0+CiAgICA8cmVjdCB3aWR0aD0iMTEyMCIgaGVpZ2h0PSI2MTAiIHJ4PSI4IiBmaWxsPSIjMTUxYzJlIiBzdHJva2U9IiMyNTMwNGIiIHN0cm9rZS13aWR0aD0iMiIvPgogICAgCiAgICA8IS0tIDEuIEJBUlJBIFNVUEVSSU9SIChIRUFERVIgNTZweCkgLS0+CiAgICA8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTEyMCIgaGVpZ2h0PSI1OCIgZmlsbD0iIzBmMTcyYSIgcng9IjgiIHN0cm9rZT0iIzI1MzA0YiIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgICA8Y2lyY2xlIGN4PSI1NjAiIGN5PSIyOSIgcj0iMTUiIGZpbGw9IiNmNTllMGIiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICA8dGV4dCB4PSI1NjAiIHk9IjM1IiBjbGFzcz0iYmFkZ2UiPjE8L3RleHQ+CiAgICA8dGV4dCB4PSIyNCIgeT0iMzQiIGNsYXNzPSJwYW5lbC1sYWJlbCI+QkFSUkEgU1VQRVJJT1I8L3RleHQ+CiAgICA8dGV4dCB4PSIxNjAiIHk9IjM0IiBmaWxsPSIjMzhiZGY4IiBmb250LXNpemU9IjEyIiBjbGFzcz0ibW9ubyI+KFNhbGFzLCBSYWNrcywgVmlzdGFzIEbDrXNpY2EvVG9wb2xvZ8OtYSwgMyBUZW1hcyBPc2N1cm8vQ2xhcm8vU2VwaWEgTS0xOCwgVW5kby9SZWRvIE0tMDMgeSBSQkFDKTwvdGV4dD4KCiAgICA8IS0tIDIuIFNJREVCQVIgTEFURVJBTCBJWlFVSUVSRE8gKENBVMOBTE9HTykgLS0+CiAgICA8cmVjdCB4PSIwIiB5PSI1OCIgd2lkdGg9IjI0MCIgaGVpZ2h0PSIzOTIiIGZpbGw9IiMwZjE3MmEiIHN0cm9rZT0iIzI1MzA0YiIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgICA8Y2lyY2xlIGN4PSIxMjAiIGN5PSIyMjAiIHI9IjE1IiBmaWxsPSIjZjU5ZTBiIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIvPgogICAgPHRleHQgeD0iMTIwIiB5PSIyMjYiIGNsYXNzPSJiYWRnZSI+MjwvdGV4dD4KICAgIDx0ZXh0IHg9IjEyMCIgeT0iMjU2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0icGFuZWwtbGFiZWwiPkNBVMOBTE9HTyBZIFBMQU5USUxMQVM8L3RleHQ+CiAgICA8dGV4dCB4PSIxMjAiIHk9IjI3NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9InBhbmVsLXN1YiI+U2Vydmlkb3JlcywgU3dpdGNoZXMsIFJvdXRlcnMsIFBhdGNoIFBhbmVsczwvdGV4dD4KICAgIDx0ZXh0IHg9IjEyMCIgeT0iMjk0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMzhiZGY4IiBmb250LXNpemU9IjExIj5BcnJhc3RyYSBoYWNpYSBsb3MgZ2FiaW5ldGVzPC90ZXh0PgoKICAgIDwhLS0gMy4gTElFTlpPIENFTlRSQUwgKMOBUkVBIERFIFRSQUJBSk8gRFVBTCkgLS0+CiAgICA8cmVjdCB4PSIyNDAiIHk9IjU4IiB3aWR0aD0iNjMwIiBoZWlnaHQ9IjM5MiIgZmlsbD0iIzBiMGYxOSIgc3Ryb2tlPSIjMjUzMDRiIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDxjaXJjbGUgY3g9IjU1NSIgY3k9IjIyMCIgcj0iMTUiIGZpbGw9IiNmNTllMGIiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICA8dGV4dCB4PSI1NTUiIHk9IjIyNiIgY2xhc3M9ImJhZGdlIj4zPC90ZXh0PgogICAgPHRleHQgeD0iNTU1IiB5PSIyNTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJwYW5lbC1sYWJlbCI+TElFTlpPIENFTlRSQUwgKMOBUkVBIERFIFRSQUJBSk8gRFVBTCk8L3RleHQ+CiAgICA8dGV4dCB4PSI1NTUiIHk9IjI3OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9InBhbmVsLXN1YiI+4oCiIFZpc3RhIEbDrXNpY2E6IEdhYmluZXRlcyA0MlUsIEJpY2FuYWxpZGFkIFRlY2hvL1Bpc28gKE0tNDEpLCBGbGlwIDNEIHkgZ2FwIDcycHg8L3RleHQ+CiAgICA8dGV4dCB4PSI1NTUiIHk9IjI5NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9InBhbmVsLXN1YiI+4oCiIFRvcG9sb2fDrWE6IENhbnZhcyAyRCwgU2tpbnMgSGFyZHdhcmUgKE0tMjgpLCBFbmxhY2VzIEJlemllciB5IDUgU2xvdHMgKE0tNDApPC90ZXh0PgoKICAgIDwhLS0gNC4gUEFORUwgTEFURVJBTCBERVJFQ0hPIChJTlNQRUNUT1IgJiBPVVRMSU5FUikgLS0+CiAgICA8cmVjdCB4PSI4NzAiIHk9IjU4IiB3aWR0aD0iMjUwIiBoZWlnaHQ9IjM5MiIgZmlsbD0iIzBmMTcyYSIgc3Ryb2tlPSIjMjUzMDRiIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDxjaXJjbGUgY3g9Ijk5NSIgY3k9IjIyMCIgcj0iMTUiIGZpbGw9IiNmNTllMGIiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICA8dGV4dCB4PSI5OTUiIHk9IjIyNiIgY2xhc3M9ImJhZGdlIj40PC90ZXh0PgogICAgPHRleHQgeD0iOTk1IiB5PSIyNTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJwYW5lbC1sYWJlbCI+T1VUTElORVIgJmFtcDsgUFJPUElFREFERVM8L3RleHQ+CiAgICA8dGV4dCB4PSI5OTUiIHk9IjI3OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9InBhbmVsLXN1YiI+w4FyYm9sIGplcsOhcnF1aWNvIG9yZGVuYWJsZSAoVS9Ob21icmUpPC90ZXh0PgogICAgPHRleHQgeD0iOTk1IiB5PSIyOTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJwYW5lbC1zdWIiPkVkaWNpw7NuIGluc3RhbnTDoW5lYSBkZSBJUCwgTUFDIHkgcG90ZW5jaWE8L3RleHQ+CgogICAgPCEtLSA1LiBQQU5FTCBJTkZFUklPUiAoVEFCTEFTIE1PRFVMQVJFUyBERSBEQVRPUykgLS0+CiAgICA8cmVjdCB4PSIwIiB5PSI0NTAiIHdpZHRoPSIxMTIwIiBoZWlnaHQ9IjE2MCIgZmlsbD0iIzBmMTcyYSIgc3Ryb2tlPSIjMjUzMDRiIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDxjaXJjbGUgY3g9IjU2MCIgY3k9IjUxNSIgcj0iMTUiIGZpbGw9IiNmNTllMGIiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICA8dGV4dCB4PSI1NjAiIHk9IjUyMSIgY2xhc3M9ImJhZGdlIj41PC90ZXh0PgogICAgPHRleHQgeD0iNTYwIiB5PSI1NTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJwYW5lbC1sYWJlbCI+VEFCTEFTIERFIERBVE9TIE1PRFVMQVJFUyAoSW52ZW50YXJpbyB5IENvbmV4aW9uZXMpPC90ZXh0PgogICAgPHRleHQgeD0iNTYwIiB5PSI1NzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJwYW5lbC1zdWIiPlNlbGVjdG9yIGRlIENvbHVtbmFzIFZpc2libGVzIChQcm9wdWVzdGEgMykgwrcgSW1wb3J0YWNpw7NuIE1hc2l2YSBFeGNlbC9DU1YgKE0tMjEvTS0yMikgwrcgSW52ZXJzacOzbiBTd2FwIOKHhCB5IENhbmFsZXRhIFRlY2hvL1Bpc28gKE0tNDEpPC90ZXh0PgogIDwvZz4KCiAgPCEtLSBMRVlFTkRBIElORkVSSU9SIERFVEFMTEFEQSAtLT4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0MCwgNzI1KSI+CiAgICA8IS0tIENvbHVtbmEgMSAtLT4KICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsIDApIj4KICAgICAgPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNmNTllMGIiLz4KICAgICAgPHRleHQgeD0iMTIiIHk9IjE3IiBjbGFzcz0iYmFkZ2UiIGZvbnQtc2l6ZT0iMTQiPjE8L3RleHQ+CiAgICAgIDx0ZXh0IHg9IjMyIiB5PSIxMiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9IjcwMCIgZmlsbD0iI2YwZjRmZiI+QmFycmEgU3VwZXJpb3I6PC90ZXh0PgogICAgICA8dGV4dCB4PSIzMiIgeT0iMjgiIGZvbnQtc2l6ZT0iMTEuNSIgZmlsbD0iIzk0YTNiOCI+Q2FtYmlvIGRlIHNhbGEgYWN0aXZhLCBzZWxlY2Npw7NuIGRlIHJhY2tzLCBhbHRlcm5hbmNpYSBkZSB2aXN0YXMsIGNpY2xvIGRlIDMgdGVtYXMgKPCfjJkgT3NjdXJvIC8g4piA77iPIENsYXJvIC8g4piVIFNlcGlhKSwgRGVzaGFjZXIvUmVoYWNlciBlIGluaWNpbyBkZSBzZXNpw7NuIFJCQUMuPC90ZXh0PgogICAgPC9nPgoKICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsIDQ4KSI+CiAgICAgIDxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEyIiBmaWxsPSIjZjU5ZTBiIi8+CiAgICAgIDx0ZXh0IHg9IjEyIiB5PSIxNyIgY2xhc3M9ImJhZGdlIiBmb250LXNpemU9IjE0Ij4yPC90ZXh0PgogICAgICA8dGV4dCB4PSIzMiIgeT0iMTIiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI3MDAiIGZpbGw9IiNmMGY0ZmYiPkNhdMOhbG9nbyBkZSBFcXVpcG9zOjwvdGV4dD4KICAgICAgPHRleHQgeD0iMzIiIHk9IjI4IiBmb250LXNpemU9IjExLjUiIGZpbGw9IiM5NGEzYjgiPkJpYmxpb3RlY2EgYWdydXBhZGEgZGUgaGFyZHdhcmUgY2VydGlmaWNhZG8gY29uIGVzcGVjaWZpY2FjaW9uZXMgZGUgYWx0dXJhIGVuIFUsIGNvbnN1bW8gZW4gV2F0dHMgeSB0aXBvcyBkZSBjb25lY3RpdmlkYWQgcGFyYSBhcnJhc3RyZSBkaXJlY3RvIGFsIGdhYmluZXRlLjwvdGV4dD4KICAgIDwvZz4KCiAgICA8IS0tIENvbHVtbmEgMiAtLT4KICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDU4MCwgMCkiPgogICAgICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iI2Y1OWUwYiIvPgogICAgICA8dGV4dCB4PSIxMiIgeT0iMTciIGNsYXNzPSJiYWRnZSIgZm9udC1zaXplPSIxNCI+MzwvdGV4dD4KICAgICAgPHRleHQgeD0iMzIiIHk9IjEyIiBmb250LXNpemU9IjEzIiBmb250LXdlaWdodD0iNzAwIiBmaWxsPSIjZjBmNGZmIj5MaWVuem8gQ2VudHJhbDo8L3RleHQ+CiAgICAgIDx0ZXh0IHg9IjMyIiB5PSIyOCIgZm9udC1zaXplPSIxMS41IiBmaWxsPSIjOTRhM2I4Ij5Fc3BhY2lvIGludGVyYWN0aXZvIGNvbiB6b29tIGluZmluaXRvLCByZW5kZXJpemFkbyBPKDEpIHNlbGVjdGl2bywgYmljYW5hbGlkYWQgZsOtc2ljYSBkZSBjYWJsZXMgeSBtb3RvciBkZSB0b3BvbG9nw61hIENhbnZhcyAyRCBjb24gc2tpbnMgZm90b3JyZWFsaXN0YXMgeSA1IG1lbW9yaWFzLjwvdGV4dD4KICAgIDwvZz4KCiAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1ODAsIDQ4KSI+CiAgICAgIDxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEyIiBmaWxsPSIjZjU5ZTBiIi8+CiAgICAgIDx0ZXh0IHg9IjEyIiB5PSIxNyIgY2xhc3M9ImJhZGdlIiBmb250LXNpemU9IjE0Ij40PC90ZXh0PgogICAgICA8dGV4dCB4PSIzMiIgeT0iMTIiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI3MDAiIGZpbGw9IiNmMGY0ZmYiPkluc3BlY3RvciAmYW1wOyBPdXRsaW5lcjo8L3RleHQ+CiAgICAgIDx0ZXh0IHg9IjMyIiB5PSIyOCIgZm9udC1zaXplPSIxMS41IiBmaWxsPSIjOTRhM2I4Ij7DgXJib2wgZXN0cnVjdHVyYWRvIGRlIGxhIGluZnJhZXN0cnVjdHVyYSB5IGZvcm11bGFyaW8gcmVhY3Rpdm8gcGFyYSBjb25maWd1cmFjacOzbiBkZSBJUHMsIGNyZWRlbmNpYWxlcyBjaWZyYWRhcyAoQUVTLUdDTSksIGxhZG9zIGRlIG1vbnRhamUgeSBtw6l0cmljYXMgZGUgcGVzbyBUSUEtOTQyLjwvdGV4dD4KICAgIDwvZz4KCiAgICA8IS0tIEZpbGEgaW5mZXJpb3IgYW5jaGEgcGFyYSBlbCBwdW50byA1IC0tPgogICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwgOTYpIj4KICAgICAgPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNmNTllMGIiLz4KICAgICAgPHRleHQgeD0iMTIiIHk9IjE3IiBjbGFzcz0iYmFkZ2UiIGZvbnQtc2l6ZT0iMTQiPjU8L3RleHQ+CiAgICAgIDx0ZXh0IHg9IjMyIiB5PSIxMiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9IjcwMCIgZmlsbD0iI2YwZjRmZiI+VGFibGFzIGRlIERhdG9zOjwvdGV4dD4KICAgICAgPHRleHQgeD0iMTQ1IiB5PSIxMiIgZm9udC1zaXplPSIxMS41IiBmaWxsPSIjOTRhM2I4Ij5HZXN0acOzbiBtYXNpdmEgdGFidWxhciBjb24gc2VsZWN0b3IgY29uZmlndXJhYmxlIGRlIGNvbHVtbmFzLCBpbXBvcnRhY2nDs24gZGUgcGxhbmlsbGFzIFhMU1gvQ1NWLCBpbnZlcnNpw7NuIGRlIG9yaWdlbi9kZXN0aW5vIHkgZXhwb3J0YWNpw7NuIHTDqWNuaWNhLjwvdGV4dD4KICAgIDwvZz4KICA8L2c+Cgo8L3N2Zz4K)

1. **Barra Superior (Header):** Aquí administras tu "Rol" (para iniciar sesión como Admin y tener permisos para editar), el botón para Exportar tu plano a PNG (a escala Retina 1:1 sobre fondo de datacenter `#090d17`), CSV o Excel, y el botón para Guardar el archivo en tu computadora. También encontrarás los **tabs de vista** (Física / Topología), los controles de zoom, el interruptor para ocultar/mostrar cables, y los botones de Deshacer/Rehacer.
2. **Catálogo (Izquierda):** Es tu "tienda" de equipos con **30 plantillas arquitectónicas profesionales** organizadas en 8 familias comerciales: Redes (`network`), Cómputo (`computing`), Almacenamiento (`storage`), **Seguridad y CCTV (`security`)**, Energía (`power`), KVM (`kvm`), Accesorios y Cableado (`accesorios`) y Equipos de Piso (`floor`). Además incluye una pestaña superior **"Todos"** con buscador reactivo. Al hacer **clic en un icono**, se despliega el flyout donde puedes buscar, arrastrar equipos o crear **Equipos Personalizados por Proyecto** (`+ Equipo`) que se identifican con un distintivo `PROYECTO`.
3. **Área de Trabajo (Centro):** El lienzo principal. Aquí es donde los Racks cobran vida. En la parte superior de esta área (Cabecera), encontrarás los menús desplegables para seleccionar y crear Salas ("Data Center") y Racks, junto con las pestañas unificadas para cambiar entre **Vista Física** y **Topología**.
   - En la **Vista Física**, cada equipo se representa con carátulas vectoriales SVG de alta definición (servidores en rack 1U/2U/4U, switches de 24/48 puertos con actividad LED animada, routers, almacenamiento NAS/SAN con discos parpadeantes, grabadores NVR/DVR, UPS y PDUs), garantizando una escala visual 1:1 nítida en cualquier nivel de zoom. Los gabinetes cuentan con una separación técnica espaciosa de **`72px`** (3U).
   - **Enrutamiento Segregado de Cables:** Los cables se enrutan automáticamente en 3 zonas libres: **Canastillo Aéreo Superior** (entre gabinetes distintos, por encima del techo), **Canaleta Media** (para equipos de piso y periféricos hacia los racks) y **Organizador Lateral de Gabinete** (para enlaces internos del mismo rack), garantizando cero cruces sobre equipos o servidores.
4. **Inspector y Árbol (Derecha):** Cuando seleccionas un Rack o un servidor, en este panel verás sus propiedades completas. Se divide en tres secciones:
   - **Outliner:** Un árbol jerárquico (Salas → Racks → Equipos) con barra de herramientas (`+ Sala`, `+ Rack`, `+ Equipo`), selector de 4 modos de ordenación (por posición U, alfabético A-Z / Z-A y por tipo) y botones de acción rápida inline (`✏️` para editar y `🗑️` para eliminar con confirmación). Al hacer **clic en cualquier elemento del árbol**, la vista física saltará de sala automáticamente y hará un scroll suave para resaltarlo en pantalla.
   - **Inspector:** Panel de propiedades del elemento seleccionado, ahora **colapsable** para dar más espacio al árbol. Incluye **gestión activa (CRUD)** con botones rápidos para crear salas y gabinetes en estado vacío, y botones contextuales para editar o eliminar salas, racks y equipos de forma directa.
   - **Estadísticas:** Contadores globales (salas, racks, equipos en rack, equipos de piso, conexiones y balance de energía en Watts).
5. **Inventario (Abajo):** Una gran tabla tipo Excel con 18 columnas de metadatos (incluyendo Tamaño, Skin y Notas). 
   - **Gestión de Columnas:** Usa el botón `⚙ Columnas` para abrir un menú desplegable y seleccionar exactamente qué columnas deseas ver (Ubicación, Red, Energía, etc.). Tus preferencias se guardan automáticamente.
   - **Edición Rápida:** Permite **edición rápida en celda mediante doble clic** (`dblclick`) para modificar tamaño en U, apariencia o anotaciones sin abrir modales.

---

## 🔐 Parte 2.5: Roles y Permisos

Al abrir la aplicación por primera vez, verás un modal de inicio de sesión con tres opciones:

| Rol | Acceso | PIN Requerido |
|---|---|---|
| **Administrador** | Acceso total: editar, borrar, cambiar PIN, ver contraseñas | Sí (`rack2024` por defecto) |
| **Editor** | Editar equipos, racks, conexiones, guardar | No |
| **Espectador** | Solo ver datos, sin poder editar | No |

> [!IMPORTANT]
> **El PIN de Admin por defecto es `rack2024`.** Puedes cambiarlo desde el menú del proyecto → "Cambiar PIN Admin". El PIN se almacena como hash SHA-256 en tu navegador.
> 
> **Persistencia de Sesión:** Si recargas la página (F5), tu sesión como Administrador o Editor se mantendrá activa automáticamente sin pedirte el PIN nuevamente. Sin embargo, por seguridad, al cerrar la pestaña o el navegador, la sesión se destruye (`SESSION_EXPIRATION = VOLATILE`), requiriendo identificarse de nuevo en la siguiente visita.

---

## ⚡ Parte 3: Flujo de Trabajo y Operaciones Comunes

La aplicación fue diseñada para ser tan fácil como un juego de "arrastrar y soltar".

![Flujo de Trabajo Básico](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAwIDQwMCIgZmlsbD0ibm9uZSI+DQogIDxkZWZzPg0KICAgIDxzdHlsZT4NCiAgICAgIEBpbXBvcnQgdXJsKCdodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2NzczI/ZmFtaWx5PU91dGZpdDp3Z2h0QDMwMDs0MDA7NTAwOzYwMDs3MDA7ODAwJmFtcDtkaXNwbGF5PXN3YXAnKTsNCiAgICAgIHRleHQgeyBmb250LWZhbWlseTogJ091dGZpdCcsIHNhbnMtc2VyaWY7IH0NCiAgICAgIC5zdGVwLXRpdGxlIHsgZm9udC13ZWlnaHQ6IDcwMDsgZmlsbDogIzM4YmRmODsgZm9udC1zaXplOiAxOHB4OyB9DQogICAgICAuc3RlcC1kZXNjIHsgZm9udC13ZWlnaHQ6IDQwMDsgZmlsbDogIzk0YTNiODsgZm9udC1zaXplOiAxM3B4OyB9DQogICAgPC9zdHlsZT4NCiAgICA8bWFya2VyIGlkPSJhcnJvdyIgdmlld0JveD0iMCAwIDEwIDEwIiByZWZYPSIxMCIgcmVmWT0iNSIgbWFya2VyV2lkdGg9IjYiIG1hcmtlckhlaWdodD0iNiIgb3JpZW50PSJhdXRvLXN0YXJ0LWF1dG8iPg0KICAgICAgPHBhdGggZD0iTSAwIDAgTCAxMCA1IEwgMCAxMCB6IiBmaWxsPSIjNDc1NTY5Ii8+DQogICAgPC9tYXJrZXI+DQogIDwvZGVmcz4NCg0KICA8cmVjdCB3aWR0aD0iMTAwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMwYjBmMTkiIHJ4PSIxNiIvPg0KICA8dGV4dCB4PSI0MCIgeT0iNDAiIGZvbnQtd2VpZ2h0PSI4MDAiIGZpbGw9IiMzOGJkZjgiIGZvbnQtc2l6ZT0iMjAiPkZMVUpPIERFIFRSQUJBSk8gQsOBU0lDTyBFTiAzIFBBU09TPC90ZXh0Pg0KDQogIDwhLS0gU3RlcCAxIC0tPg0KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg2MCwgMTIwKSI+DQogICAgPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiMwZjE3MmEiIHJ4PSIxMiIgc3Ryb2tlPSIjMjUzMDRiIiBzdHJva2Utd2lkdGg9IjIiLz4NCiAgICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI1MCIgcj0iMjUiIGZpbGw9IiMxNTFjMmUiIHN0cm9rZT0iIzM4YmRmOCIgc3Ryb2tlLXdpZHRoPSIyIi8+DQogICAgPHRleHQgeD0iMTAwIiB5PSI1OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIyNCI+8J+Wse+4jzwvdGV4dD4NCiAgICA8dGV4dCB4PSIxMDAiIHk9IjEwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9InN0ZXAtdGl0bGUiPjEuIFNFTEVDQ0lPTkE8L3RleHQ+DQogICAgPHRleHQgeD0iMTAwIiB5PSIxMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJzdGVwLWRlc2MiPkVsaWdlIHVuIGVxdWlwbyBkZWwgQ2F0w6Fsb2dvPC90ZXh0Pg0KICA8L2c+DQoNCiAgPCEtLSBBcnJvdyAtLT4NCiAgPHBhdGggZD0iTSAyNzUgMTk1IEwgMzY1IDE5NSIgc3Ryb2tlPSIjNDc1NTY5IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1kYXNoYXJyYXk9IjYsNCIgbWFya2VyLWVuZD0idXJsKCNhcnJvdykiLz4NCg0KICA8IS0tIFN0ZXAgMiAtLT4NCiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzgwLCAxMjApIj4NCiAgICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzBmMTcyYSIgcng9IjEyIiBzdHJva2U9IiMyNTMwNGIiIHN0cm9rZS13aWR0aD0iMiIvPg0KICAgIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjUwIiByPSIyNSIgZmlsbD0iIzE1MWMyZSIgc3Ryb2tlPSIjMTBiOTgxIiBzdHJva2Utd2lkdGg9IjIiLz4NCiAgICA8dGV4dCB4PSIxMDAiIHk9IjU4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjI0Ij7wn6SaPC90ZXh0Pg0KICAgIDx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0ic3RlcC10aXRsZSIgZmlsbD0iIzEwYjk4MSI+Mi4gQVJSQVNUUkE8L3RleHQ+DQogICAgPHRleHQgeD0iMTAwIiB5PSIxMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJzdGVwLWRlc2MiPlN1w6lsdGFsbyBlbiB1biBSYWNrIHZhY8OtbzwvdGV4dD4NCiAgPC9nPg0KDQogIDwhLS0gQXJyb3cgLS0+DQogIDxwYXRoIGQ9Ik0gNTk1IDE5NSBMIDY4NSAxOTUiIHN0cm9rZT0iIzQ3NTU2OSIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtZGFzaGFycmF5PSI2LDQiIG1hcmtlci1lbmQ9InVybCgjYXJyb3cpIi8+DQoNCiAgPCEtLSBTdGVwIDMgLS0+DQogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDcwMCwgMTIwKSI+DQogICAgPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiMwZjE3MmEiIHJ4PSIxMiIgc3Ryb2tlPSIjMjUzMDRiIiBzdHJva2Utd2lkdGg9IjIiLz4NCiAgICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSI1MCIgcj0iMjUiIGZpbGw9IiMxNTFjMmUiIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSIyIi8+DQogICAgPHRleHQgeD0iMTAwIiB5PSI1OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIyNCI+4pyP77iPPC90ZXh0Pg0KICAgIDx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0ic3RlcC10aXRsZSIgZmlsbD0iI2Y1OWUwYiI+My4gRURJVEE8L3RleHQ+DQogICAgPHRleHQgeD0iMTAwIiB5PSIxMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJzdGVwLWRlc2MiPlBvbmxlIG5vbWJyZSBlbiBlbCBJbnNwZWN0b3I8L3RleHQ+DQogIDwvZz4NCg0KPC9zdmc+DQo=)

### Cómo moverse y seleccionar
- **Clic Izquierdo:** Selecciona un objeto (Rack, servidor, etc.). Al seleccionarlo, se iluminará y sus datos aparecerán en el panel de la derecha (Inspector).
- **Clic en el Outliner:** Selecciona elementos desde el árbol jerárquico y muestra sus propiedades.
- **Doble Clic en el Outliner:** Abre el modal de edición del elemento.
- **Rueda del Ratón:** Haz scroll para hacer acercar (Zoom In) o alejar (Zoom Out).
- **Arrastrar (Drag & Drop):** Haz clic sostenido en un equipo del catálogo izquierdo, muévelo hasta un hueco vacío en tu Rack, y suelta el botón.
- **Colocación Rápida Asistida:** En el menú inferior o contextual, usa "Colocación Rápida". Incluye un buscador reactivo para filtrar equipos y autocalcula los slots libres disponibles.
- **Arrastrar el fondo (Vista Física o Topología):** Mueve la vista completa (Pan).
- **Alternar Cables:** Activa o desactiva la visualización de cables en la vista física con el interruptor en la barra superior.

### Guardar y Cargar
La aplicación guarda **automáticamente** los cambios en la memoria temporal de tu navegador cada vez que haces un movimiento. Además, si tienes un archivo `.rack` abierto, se **autoguarda en disco** cada 3 segundos después del último cambio.

**Guardar manualmente:**
1. Ve a la **Barra Superior** → Menú del proyecto (⋮).
2. Haz clic en **"Guardar"** (guarda en el archivo actual) o **"Guardar como..."** (elige un nuevo archivo).
3. Se guardará un archivo con extensión `.rack`. ¡Ese es tu proyecto!

**Abrir un proyecto existente:**
1. Ve a la **Barra Superior** → Menú del proyecto (⋮).
2. Haz clic en **"Abrir"** y selecciona tu archivo `.rack` o `.json`.

### Cargar Plantillas de Demostración (Demos)
Si quieres explorar un proyecto terminado o aprender con casos reales:
1. Ve a la **Barra Superior** → Menú del proyecto (⋮) → **"Plantillas de Demostración..."**.
2. Aparecerá el **Modal de Selección de Demos** (`#modal-demo-selection`) con dos opciones arquitectónicas:
   - **🏢 Centro de Datos Empresarial (TIA-942):** 2 salas, 4 gabinetes de 42U con servidores blade, switches ToR, storage SAN y cableado estructurado.
   - **🎓 Campus Universitario UTN (A Gran Escala):** Red jerárquica de 3 capas modelando la Universidad Tecnológica Nacional con 10 edificios/salas estructuradas, 13 racks, 162 dispositivos, 24 VLANs y 97 conexiones de fibra y cobre.
3. El sistema te pedirá confirmación para no perder tu trabajo actual antes de cargar la plantilla seleccionada.

### Deshacer y Rehacer (M-03)
- **Ctrl+Z** o botón ↩ en el header: Deshace la última acción (historial acotado a 15 pasos con motor ultra-rápido `fastClone`).
- **Ctrl+Y** o botón ↪ en el header: Rehace la acción deshecha.

---

## 🎓 Parte 4: Tutoriales Prácticos Paso a Paso

¡Hora de la práctica! Vamos a crear tres salas distintas desde cero.

### Escenario 1: Datacenter Híbrido (Racks y Piso)
Vamos a crear una sala normal, que contiene 2 Racks con servidores, y adicionalmente un equipo pesado (Aire Acondicionado) que va en el piso, fuera de los racks.

**Paso 1: Crear la Sala y los Racks**
1. En la **Barra Superior (Cabecera)**, verás un menú desplegable que dice "Data Center" y a su lado un botón **"+"** (o en el Inspector con `+ Nueva Sala`).
2. Haz clic en el menú o selecciona la sala existente. En el panel Derecho (Inspector), cámbiale el nombre a `Mi Datacenter Híbrido`.
3. En la misma barra superior, junto al menú desplegable de "Racks", haz clic en el botón **"+"** para agregar un Rack (o usa `+ Nuevo Gabinete` en el Inspector). Aparecerá un cajón negro en el lienzo central con altura estándar (42U por defecto).
4. En el panel Derecho, ponle nombre a ese rack: `RACK-01`.
5. Repite el paso 3 y 4 para crear otro rack llamado `RACK-02`. Ambos gabinetes se ordenarán con una separación espaciosa de 72px.

**Paso 2: Llenar el RACK-01**
1. Ve al panel Izquierdo (Catálogo) y haz clic en el icono de **Cómputo / Servidores** para desplegar el flyout.
2. Haz clic sostenido sobre un "Servidor Rack 2U" y arrástralo hacia el `RACK-01` en el lienzo central. Suéltalo en un hueco vacío.
3. Haz clic en el icono de **Redes** en la barra de categorías. Arrastra un "Switch Acceso 24P (1U)" y suéltalo justo arriba del servidor.

**Paso 3: Añadir el equipo de piso**
1. En el Catálogo, busca la categoría **Floor / Piso** (iconos de PC, cámara, etc.).
2. Arrastra una "Unidad InRow (Aire Acondicionado)". Notarás que el sistema *no te deja* meterlo dentro del Rack. 
3. **¿Cómo lo coloco en el piso?** Muy simple: En la parte inferior del Rack, verás una zona punteada llamada **"Floor Equip (Exterior)"** alineada con un ancho mínimo de 584px. Suelta el equipo ahí.
4. Haz clic en el aire acondicionado recién colocado y, en el panel Derecho, llámalo `Aire-Principal`. ¡Felicidades, completaste el escenario 1!

---

### Escenario 2: Sala de Telecomunicaciones (Solo Racks)
Este cuarto más pequeño no tiene equipos en el piso, solo equipos de red y parcheo.

**Paso 1: Crear una Sala nueva**
1. Ve a la **Barra Superior (Cabecera)** y haz clic en el botón **"+"** que está al lado del selector de Salas ("Data Center").
2. En el panel Derecho, llámala `Cuarto de Telecomunicaciones`. Notarás que el lienzo central se vacía (porque entraste a tu nueva sala vacía).

**Paso 2: Montar el Gabinete de Red**
1. En la Barra Superior, haz clic en el botón **"+"** junto al selector de Racks y llámalo `RACK-TELCO` en el panel derecho.
2. Ve al Catálogo → Categoría **Network** (icono de switch).
3. Arrastra un "Patch Panel (1U)" a la parte más alta del rack.
4. Arrastra un "Router Core (4U)" debajo del patch panel.
5. Ve al panel Derecho y en las propiedades del Router escribe en la IP: `192.168.1.1`.

> [!NOTE]
> En este escenario no usamos equipos de piso. Tu vista principal (Topológica o Frontal) mostrará el cuarto ordenado y exclusivamente dedicado a equipos montados.

---

### Escenario 3: Sala de Fuerza / Energía (Solo Equipos de Piso)
En el sótano del edificio, tenemos una sala de baterías gigantes y generadores que no caben en ningún rack.

**Paso 1: Crear la Sala de Energía**
1. En la Barra Superior, haz clic en el botón **"+"** junto al selector de Salas.
2. En el panel Derecho, nómbrala `Cuarto de Baterías`.

**Paso 2: Llenar el cuarto sin usar Racks**
Dado que esta sala no necesita racks metálicos altos, insertaremos los equipos de manera independiente.
1. **NO** hagas clic en el botón "+" de Racks.
2. Ve directamente al Catálogo → Categoría **Floor / Piso**.
3. Arrastra un "Standalone UPS" hacia el lienzo vacío central.
4. Como no hay un Rack, la aplicación creará automáticamente una zona invisible (un chasis contenedor de piso) para alojarlo.
5. Arrastra un "Desk / Escritorio" al lienzo.
6. En el panel Derecho, renombra los equipos a `Batería-Principal` y `Mesa Operador`.

---

## 🔌 Parte 5: Visualización de Conexiones Físicas

¡Ahora también puedes visualizar cómo están conectados los cables en la vida real!

### Crear una conexión
Tienes dos métodos para conectar equipos:

#### Método A: Modo Cableado Interactivo en Vista Física (*Drag-to-Connect*, M-34)
¡La forma más rápida y visual de cablear!
1. En la **Vista Física**, haz clic en el botón **`Modo Cableado`** (`#btn-cable-mode`) en la barra de herramientas superior, o haz clic directamente en el botón **`🔌`** de cualquier equipo en rack o de piso.
2. El cursor cambiará a estilo *crosshair* (mira de precisión) y el botón se iluminará.
3. Haz clic en el equipo o puerto de origen.
4. Mueve el ratón hacia el equipo destino: verás una **línea elástica (*rubber-band*) en tiempo real** trazando una curva Bézier dinámica que conecta el origen con el puntero.
5. Haz clic en el equipo destino: el modal de conexión se abrirá **automáticamente con el equipo origen y destino ya preseleccionados**.
6. Selecciona los puertos deseados y pulsa **"Conectar"**.

#### Método B: Modal Tradicional de Conexión
1. Haz **doble clic** en un equipo (en la vista Topología o desde la tabla inferior).
2. Se abrirá el modal de **"Nueva Conexión"**.
3. Selecciona el equipo de origen, el equipo de destino y los puertos. 
   - *Tip:* Marca la casilla **"Mostrar solo puertos libres"** para ocultar los puertos que ya están ocupados y evitar errores.
   - **Discriminación de Cara Frontal vs. Trasera (M-33):** Usa los selectores de cara para especificar si el cable se conecta en la cara `[Frontal]` o `[Trasera]` del equipo. En servidores y almacenamiento de doble cara (`both`), los puertos traseros y frontales se gestionan independientemente sin falsas colisiones.
   - **Botón Swap de Inversión (⇄, M-41):** Usa el botón central de intercambio `#btn-cable-swap` para alternar instantáneamente el origen y el destino (incluyendo sus caras) con un solo clic.
   - **Orientación de Canaleta (M-41):** Elige entre **Canaleta Superior (Techo / Bandeja Aérea)** o **Canaleta Inferior (Piso Técnico / Fondo)** para segregar las rutas físicas del cableado.
4. Asigna una **VLAN** (ej. VLAN 10 Gestión, VLAN 20 Datos). El sistema sugerirá automáticamente un color de cable basado en la VLAN seleccionada.
5. Haz clic en **"Conectar"**. El sistema verificará que no haya colisiones antes de enlazar los puertos.

### Ver cables en la vista física
1. Ve a la **Vista Física** (botón superior central).
2. Haz clic en el interruptor deslizable **"Cables"** de la barra de herramientas.
3. Verás que se dibujan automáticamente los cables desde los puertos, organizados ortogonalmente:
   - Los cables con orientación **Superior** suben por las bandejas aéreas por encima de los gabinetes.
   - Los cables con orientación **Inferior** descienden por debajo de los racks a través de las canaletas del piso técnico.
4. Usa el botón rotar del rack para ver la parte trasera (Rear View) desde donde nacen las conexiones.

### Ver cables en la vista topológica
1. Cambia a la **Vista Topología** (botón superior central).
2. Las conexiones se muestran como curvas animadas con partículas de flujo.
3. **Pasa el mouse** sobre un nodo para resaltar solo sus conexiones directas.

---

## 🌐 Parte 6: Vista de Topología

La vista de topología es un diagrama de red interactivo donde puedes ver cómo están conectados todos tus equipos.

### Controles
- **Arrastrar nodo:** Mueve un equipo individual dentro de su rack o sala.
- **Arrastrar barra de rack (verde):** Mueve el rack completo con todos sus equipos.
- **Arrastrar barra de sala (naranja):** Mueve la sala completa.
- **Esquina inferior-derecha de sala/rack:** Cambia el tamaño (resize).
- **Rueda del mouse:** Zoom in/out.
- **Arrastrar el fondo:** Pan (mueve toda la vista).
- **Doble clic en un nodo:** Abre modal para crear una conexión.
- **Doble clic en un cable:** Abre modal para editar esa conexión.

### Cambiar estilo y representación visual de nodos (Skins Visuales M-28)
- Abre el menú desplegable **"🎛️ Estilo"** en la barra superior de topología para elegir entre tres modos de renderizado:
  - **Cards (Tarjetas):** Rectángulos técnicos de 150×50 px con icono, nombre e IP enfocado en lectura rápida de metadatos.
  - **Nodos (Círculos):** Círculos minimalistas de radio 22 px con icono centrado y etiquetas de nombre e IP configurables (Arriba, Abajo, Izquierda, Derecha o Juntos).
  - **Hardware (Skins Fotorrealistas):** Chasis arquitectónico de 140×50 px con bisel metálico, orejas laterales de montaje en rack, perforaciones de tornillos, carátula vectorial fotorrealista basada en 18 presets offline de fabricantes (Cisco, Dell, Fortinet, etc.) o fotos personalizadas en base64, badge de altura U y LED de estado operativo.
- Tu selección de estilo se guarda en el proyecto y puede conmutarse independientemente en cualquiera de los 5 slots de memoria (M-40).

### Carga de Fotos e Imágenes Personalizadas de Equipos (M-28)
- Puedes personalizar la apariencia visual de cualquier equipo en el diagrama de topología:
  1. Haz doble clic en el equipo o selecciónalo y pulsa "Editar" en el Inspector.
  2. En el formulario técnico del equipo, abre el bloque **"Personalización Visual"**.
  3. Puedes seleccionar un **Preset de Fabricante** predefinido (Servidor 1U/2U/4U, Switch ToR/Core, Router, Firewall UTM, Cabina Storage, Cámara CCTV, Punto de Acceso Wi-Fi, etc.).
  4. O bien, pulsa el botón **"Subir Imagen..."** para cargar una imagen propia (`.png`, `.jpg`, `.svg`). La imagen se optimiza y se almacena directamente en tu archivo de proyecto `.rack` codificada en base64 sin requerir servidores ni conexión a internet.
  5. Para remover una imagen personalizada y volver al gráfico vectorial de fábrica, basta con hacer clic en la miniatura interactiva de previsualización.

### Modo de Layout (Por Racks vs Árbol Jerárquico)
- Puedes alternar entre **Organización por Racks** (agrupa los nodos dentro de sus respectivos gabinetes) y **Árbol Jerárquico** (organización tipo Draw.io de arriba hacia abajo: Core → Distribución → Acceso, con cables ortogonales redondeados).

### Ajustar el espaciado (Control Dual H y V)
- Abre el menú desplegable **"🎛️ Estilo"** en la barra superior de topología:
  - **Barra H (Horizontal):** Ajusta la distancia entre columnas de equipos y nodos hermanos (lectura interactiva en px).
  - **Barra V (Vertical):** Ajusta la separación vertical entre niveles de red y slots (lectura interactiva en px).

### 💾 Guardar y Alternar entre 5 Vistas de Topología (M-40)
- En la barra superior dispones de la botonera compacta: `👁️ [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] [ 💾 ]`.
- **Guardar una vista:** Haz clic en cualquier botón de ranura vacía (con borde discontinuo) para guardar al instante las posiciones de los nodos, encuadre (zoom y pan), estilo y espaciados actuales.
- **Alternar o cargar una vista:** Haz clic en cualquier número de ranura guardada para conmutar inmediatamente a ese estado sin recargar la página. La ranura activa se resalta con un brillo azul cian.
- **Gestión avanzada:** Haz clic en el icono del disquete `[ 💾 ]` para abrir el menú de gestión:
  - Puedes **Renombrar** cada vista con nombres descriptivos (ej. *"1: Red Core"*, *"2: Cámaras CCTV"*).
  - Puedes **Sobrescribir** o **Vaciar** cualquier ranura con un clic.
  - El sistema de deshacer/rehacer (`Ctrl+Z` / `Ctrl+Y`) funciona de forma totalmente independiente sin alterar tus ranuras guardadas.

### 📍 Afinidad Automática de Equipos de Piso por Gabinete (M-39)
- Los equipos de piso (cámaras de seguridad CCTV, puntos de acceso Wi-Fi, estaciones de trabajo, impresoras de red) se ordenan de forma inteligente **directamente debajo del rack al que están conectados**.
- Esto hace que los cables de red desciendan rectos y directos desde el switch ToR/distribución hasta sus periféricos, eliminando los molestos cruces de cables diagonales que antes atravesaban toda la sala.
- Todos los racks conservan una **misma línea de base horizontal**, asegurando una cuadrícula simétrica, ordenada y elegante.

### 🔍 HUD Tooltip Ergonómico y Nombres Técnicos
- Al pasar el cursor sobre cualquier nodo en topología, se despliega una tarjeta HUD de **240px** con soporte multilínea para nombres extensos y credenciales protegidas.
- Nombres de más de 17 caracteres en tarjetas y círculos se abrevian con una elipsis elegante (`…`), preservando las dimensiones estándar y la geometría intacta de los racks.

### Reordenar automáticamente
- Haz clic en **"Auto"** (o botón `⚡ Auto`) para que la aplicación recalcule y alinee automáticamente todas las posiciones del diagrama respetando las dependencias de red y la afinidad de gabinetes.

### Exportar como imagen
- Desde el menú de exportación o el botón **"PNG"** de la barra, descarga una imagen de alta resolución del diagrama.

---

## 📊 Parte 7: Exportación e Importación de Datos

Desde el menú del proyecto o la barra inferior, puedes exportar e importar datos con herramientas profesionales:

| Formato | Contenido | Cómo |
|---|---|---|
| **PNG (Racks)** | Imagen de la vista física de cada rack a escala Retina 1:1 (`html2canvas`) | Exportar → Rack a PNG |
| **PNG (Topología)** | Imagen del diagrama de red completo en Canvas 2D | Exportar → Topología PNG |
| **CSV** | Tabla de inventario de equipos | Botón CSV en la tabla inferior |
| **Excel (.xlsx)** | Inventario + conexiones en hojas separadas | Botón Excel en la tabla inferior |
| **Plantilla Equipos (Excel / CSV, M-21)** | Plantilla estructurada con 21 campos y hoja `"Guia_Valores"` | Exportar → Plantilla Equipos |
| **Importación Masiva (CSV / Excel, M-22)** | Carga masiva de equipos con detección de colisiones y auto-racks | Tablas → Botón "Importar..." o Menú Proyecto |
| **JSON (.rack)** | Proyecto completo (datos + catálogo + cifrado en reposo) | Guardar / Guardar como |

### 📥 Cómo usar la Importación Masiva (M-22):
1. Descarga la plantilla desde el menú **Exportar** → **Plantilla Equipos (Excel .xlsx)**.
2. Completa los datos de tus equipos siguiendo la hoja de ayuda integrada `"Guia_Valores"`.
3. En la pestaña Tablas, haz clic en el botón **"Importar..."** (o desde el Menú del Proyecto → **"Importar Equipos (CSV/Excel)"**).
4. Arrastra tu archivo `.xlsx` o `.csv` a la zona de carga.
5. El sistema analizará instantáneamente las filas:
   - Valida formatos de IP, MAC y altura en U.
   - Detecta colisiones físicas de slots en los racks.
   - Te permite elegir cómo resolver nombres duplicados (Omitir, Renombrar o Sobrescribir).
   - Crea automáticamente los racks que no existan si marcas la opción correspondiente.
6. Haz clic en **"Confirmar e Importar"**. Si cometes un error, puedes presionar **Ctrl+Z** para deshacer toda la importación de un solo golpe.

---

## 🎨 Parte 8: Temas y Personalización

### Selector de Temas Visible (M-18)
En la barra superior (cabecera), junto a los botones de Deshacer y Rehacer, dispones del botón directo de tema con icono dinámico y etiqueta:
- **Modo Oscuro (🌙):** Tema por defecto de alto contraste para entornos oscuros y reducción de consumo energético.
- **Modo Claro (☀️):** Fondo claro de alta luminosidad para oficinas bien iluminadas o presentaciones.
- **Modo Sepia (☕):** Paleta cálida relajante (tonos pergamino, texto café y acentos ámbar) diseñada específicamente para cuartos de control y largas jornadas de monitoreo sin fatiga ocular.

> [!TIP]
> **Cambio rápido con un solo clic:** Haz clic sobre el botón en la cabecera para ciclar instantáneamente: **Oscuro** ➔ **Claro** ➔ **Sepia** ➔ **Oscuro**. Tu preferencia se guarda automáticamente en el navegador y se recuerda en tus próximas sesiones. También puedes alternar el tema desde el menú principal del proyecto (⋮).

### Modo Dios y Cifrado en Reposo (M-01)
- **Seguridad en Reposo:** Las contraseñas se almacenan cifradas con AES-GCM (`enc:v1:`) en tu navegador (`localStorage`) y en respaldos `.rack`. En reposo nunca reside texto plano.
- En la interfaz, las contraseñas se enmascaran por defecto como `••••••••`.
- **Revelación Táctil:** Los Administradores pueden hacer clic en el botón de ojo (`👁`) en el Inspector para revelar la contraseña de un equipo específico.
- **Modo Dios Global:** Desde el menú del proyecto (⋮) → **"Modo Dios: Revelar Claves"**, el Administrador puede revelar simultáneamente todas las contraseñas en tablas e inspectores.
- Solo los usuarios con rol Administrador tienen autorización para activar estas opciones.

### Pausar animaciones
- Haz clic en el **punto verde** (status dot) de la barra superior para pausar/reanudar las animaciones de las partículas en la topología.

---

¡Has completado tu capacitación básica! Ahora sabes cómo navegar por la aplicación, qué significan los conceptos, cómo arrastrar componentes y cómo estructurar cuartos enteros según tus necesidades del mundo real. 

Si te equivocas, recuerda usar la opción de **Deshacer (Undo)** con Ctrl+Z o simplemente seleccionar el equipo mal colocado y presionar el botón **Eliminar (Trash/Basurero)** en el Inspector (Panel Derecho).


---

# RACK Designer Next — Guía Técnica Completa

> Explicación técnica para recrear el proyecto desde cero, con diagramas y conceptos explicados paso a paso.
> **Última actualización sincronizada con el código fuente.**

---

## Tabla de Contenidos

1. [Qué es este proyecto?](#1-qué-es-este-proyecto)
2. [Stack Tecnológico (qué usamos y por qué)](#2-stack-tecnológico)
3. [Arquitectura General](#3-arquitectura-general)
4. [El Patrón Reactivo (Proxy ES6)](#4-el-patrón-reactivo)
5. [Estructura de Archivos](#5-estructura-de-archivos)
6. [El Layout de la Interfaz (CSS Grid)](#6-el-layout-de-la-interfaz)
7. [Cada Área de la UI explicada](#7-cada-área-de-la-ui)
8. [El Topology View (Canvas 2D)](#8-el-topology-view)
9. [Renderizado de Cableado Físico (SVG)](#9-renderizado-de-cableado-físico)
10. [Sistema de Autenticación (RBAC)](#10-sistema-de-autenticación)
11. [Gestión de Archivos (File System Access API)](#11-gestión-de-archivos)
12. [Flujo de Datos Completo](#12-flujo-de-datos-completo)
13. [Cómo recrear desde cero](#13-cómo-recrear-desde-cero)
14. [Diagramas SVG del Proyecto](#14-diagramas-svg)
15. [Roadmap de Mejoras](#15-roadmap-de-mejoras)

---

## 1. Qué es este proyecto?

**RACK Designer Next** es una aplicación web (PWA) que sirve para diseñar y administrar centros de datos. Permite:

- Crear **salas** (rooms) que representan habitaciones de un datacenter
- Crear **gabinetes** (racks) dentro de esas salas con alturas configurables (4U–48U)
- Colocar **equipos** (servidores, switches, routers, firewalls, UPS, etc.) dentro de los gabinetes o como equipos de piso
- Conectar los equipos entre sí con **cables** (cobre, fibra óptica, DAC)
- Ver todo en dos vistas: **Vista Física** (cómo se ve el rack, con cables SVG) y **Vista Topología** (diagrama de red en Canvas 2D)
- **Exportar** a PNG, CSV, Excel y guardar/cargar proyectos como archivos `.rack`
- Sistema de **roles** (Admin, Editor, Viewer) con PIN y SHA-256

**Lo más importante:** Es una PWA (Progressive Web App) que funciona sin servidor backend. Todos los datos se guardan en el navegador del usuario (`localStorage`) o en archivos locales (File System Access API). **No hay backend ni base de datos remota.**

### Ejecutar el proyecto

```
# Opción 1: Live Server en VS Code
# Click derecho en index.html → "Open with Live Server"

# Opción 2: Cualquier servidor estático
npx serve .
python -m http.server 8000
```

**No necesitas** `npm start`, `webpack`, `vite` ni nada para compilar. Solo abre el `index.html`.

---

## 2. Stack Tecnológico

### Qué usamos

| Tecnología | Para qué sirve | Por qué la elegimos |
|---|---|---|
| **JavaScript ES6+** | Toda la lógica | Sin frameworks, vanilla puro |
| **HTML5** | Estructura de la app | Semánticos, modals, canvas |
| **CSS3** | Estilos y layout | Grid, Flexbox, variables CSS, temas |
| **Canvas 2D** | Vista de topología | Animaciones y dibujo de red |
| **SVG inline** | Cables en vista física | Trazado reactivo de rutas ortogonales |
| **Proxy ES6** | Estado reactivo | Reemplaza a Redux/useState |
| **localStorage** | Guardar datos | Persistencia sin servidor |
| **sessionStorage** | Sesiones de auth | Se borra al cerrar pestaña |
| **SHA-256** | Hasheo de PIN | Seguridad básica de admin (Web Crypto API + fallback) |
| **File System Access API** | Abrir/guardar archivos | Sin necesidad de upload, con autoguardado |
| **SheetJS** | Exportar a Excel | Dependencia vendor (`xlsx.full.min.js`) |
| **html2canvas** | Captura DOM Retina 1:1 a PNG | Dependencia vendor (`html2canvas.min.js`) con fallback Canvas 2D |
| **mobile-drag-drop** | Polyfill touch drag | Soporte táctil para drag & drop |

### Qué NO usamos (y por qué)

| No usamos | Por qué |
|---|---|
| React/Vue/Angular | El proyecto es vanilla, sin build step |
| Webpack/Vite | No hay paso de compilación |
| TypeScript | Vanilla JS puro |
| Backend/API | Todo es local en el navegador |
| Base de datos | localStorage es suficiente |
| npm/yarn | Solo **pnpm** para gestionar `marked` (build scripts) |

### Diagrama de tecnologías

Ver: `doc/doc_img/doc_svg/architecture/architecture_overview.svg` (sección Tech Stack)

---

## 3. Arquitectura General

El proyecto sigue un patrón llamado **"Reactive Proxy Pattern"**. Esto significa que:

1. **Toda la información vive en un solo lugar** (el `store`)
2. **Cuando algo cambia**, el Proxy lo detecta automáticamente
3. **Se guarda** en el navegador (localStorage)
4. **Se notifica** a la interfaz que hay datos nuevos
5. **La interfaz se redibuja** con los datos actualizados

```
USUARIO hace algo
    ↓
EVENT HANDLER ejecuta una función
    ↓
STORE METHOD modifica los datos
    ↓
snapshot() → crea copia profunda para Undo/Redo
    ↓
MUTACIÓN en this._raw (push, assign, splice)
    ↓
PROXY SET TRAP detecta el cambio
    ↓
_save() → localStorage.setItem('RACK_DESIGNER_NEXT_STATE', ...)
    ↓
_emit('change', { source: 'addDeviceToRack' })
    ↓
main.js escucha el evento → renderAll({ source })
    ↓
Se redibujan SOLO las vistas afectadas según el "source"
```

**Ver diagrama completo:** `doc/doc_img/doc_svg/flows/project_flow.svg` (Flow 2)

### Por qué es importante esto?

Porque si intentas modificar el HTML directamente (por ejemplo, `document.getElementById('algo').innerHTML = '...'`), el proyecto se rompe. **Siempre** debes modificar el `store` y dejar que la interfaz se actualice sola.

---

## 4. El Patrón Reactivo

### Cómo funciona el Proxy ES6

```javascript
// El store crea un Proxy sobre el estado
this._raw = { rooms: [], racks: [], devices: [], ... };
this.state = this._makeProxy(this._raw);

// El Proxy intercepta CADA escritura en el estado:
_makeProxy(obj, path = '') {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (this._proxyCache.has(obj)) return this._proxyCache.get(obj); // Cache con WeakMap

  const proxy = new Proxy(obj, {
    set: (target, key, value) => {
      if (['__proto__', 'constructor', 'prototype'].includes(key)) return true; // Seguridad
      target[key] = value;       // 1. Aplica el cambio
      this._save();              // 2. Guarda en localStorage
      this._emit('change', {     // 3. Notifica a todos los listeners
        path: `${path}.${key}`, key, value
      });
      return true;
    },
    get: (target, key) => {
      const val = target[key];
      if (typeof val === 'function') return val.bind(target);
      // Si el valor es un objeto, lo envuelve en otro Proxy (recursivo)
      if (typeof val === 'object' && val !== null && !Array.isArray(val))
        return this._makeProxy(val, `${path}.${key}`);
      return val;
    }
  });
  this._proxyCache.set(obj, proxy);
  return proxy;
}
```

> **Nota importante:** El `get` trap solo envuelve sub-objetos (no arrays). Esto significa que mutaciones en arrays (como `push`, `splice`) **no disparan el Proxy automáticamente**. Por eso cada método del store llama manualmente a `this._save()` y `this._emit()` después de mutar arrays.

### El flujo en código

```
Usuario arrastra un equipo al rack
    ↓
onSlotDrop() detecta el drop
    ↓
store.addDeviceToRack(template, rackId, slotU, side)
    ↓
store.snapshot() → guarda estado actual usando fastClone (máximo 15 instantáneas)
    ↓
this._raw.devices.push(nuevoEquipo) → muta los datos
    ↓
this._save() + this._emit('change', { source: 'addDeviceToRack', rackId, device })
    ↓
renderAll({ source: 'addDeviceToRack', rackId, device }) [con coalescencia rAF 60 FPS]
    ↓
renderSingleRack(rackId) → redibujado atómico del gabinete sin reconstruir la sala completa
renderStats() → estadísticas se actualizan
renderOutliner() → árbol se actualiza si está abierto
renderBottomPanel() → tabla se actualiza si está visible
```

**Ver diagrama:** `doc/doc_img/doc_svg/flows/project_flow.svg` (Flow 3a)

### Undo/Redo Optimizado (M-03)

Cada vez que mutas el store, `snapshot()` guarda una copia del estado anterior (máximo acotado a 15 instantáneas mediante `fastClone(obj)`, excluyendo `topologySlots` para ahorrar hasta un 80% de RAM). Cuando el usuario presiona Ctrl+Z:

1. Se toma el estado actual y se guarda en `_redoStack`
2. Se saca el estado anterior de `_undoStack`
3. Se sobreescribe `_raw` con ese estado
4. Se redibuja todo con `renderAll({ source: 'undo' })`

**Ver diagrama:** `doc/doc_img/doc_svg/flows/project_flow.svg` (Flow 4)

### Optimización: Debounce para Zoom/Pan

Los métodos `setZoom()` y `setPan()` usan `_saveDebounced()` en lugar de `_save()`:

```javascript
_saveDebounced() {
  if (this._saveTimer) cancelAnimationFrame(this._saveTimer);
  this._saveTimer = requestAnimationFrame(() => {
    this._saveTimer = null;
    this._save();
  });
}
```

Esto agrupa ~60 escrituras/seg (durante zoom/pan con la rueda del ratón) en 1 escritura por frame, evitando saturar localStorage.

### Integridad Relacional en Cascada y Auto-Saneamiento (`_sanitize()`)

Para garantizar que el modelo de datos nunca acumule referencias rotas ni elementos huérfanos:

1. **Cascada en `deleteRack(id)`:** Al eliminar un gabinete, se buscan todos los dispositivos contenidos en él y se filtran automáticamente de `this._raw.connections` todas las conexiones que partían o llegaban a ellos.
2. **Limpieza en `deleteDevice(id)`:** Al eliminar un equipo individual, se purgan sus conexiones y se eliminan sus coordenadas en `topology.nodePositions`.
3. **Motor `_sanitize()`:** Al iniciar la aplicación (`_load()`) o importar un proyecto (`loadData()`), el Store ejecuta un saneamiento exhaustivo que elimina cables zombis y nodos huérfanos de proyectos antiguos o manipulados.
4. **Exposición Global:** `window.store = store;` expuesto para interoperabilidad y depuración.

---

## 5. Estructura de Archivos

### Árbol del proyecto

```
Rack_Designer_2/
├── index.html                    ← Archivo principal (HTML + modals)
├── service-worker.js             ← PWA offline (el que se registra)
├── package.json                  ← Solo pnpm. Dependencia: "marked"
├── mejoras.md                    ← Roadmap de mejoras (Source of Truth)
│
├── css/
│   ├── style.css                 ← Importa todos los CSS (@imports)
│   ├── variables.css             ← Variables CSS (colores, fuentes, tamaños, temas)
│   ├── layout.css                ← Grid layout, header, sidebar, panels
│   ├── mobile-drag-drop.css      ← Estilos del polyfill drag-and-drop
│   └── components/
│       ├── panels.css            ← Bottom panel, tablas, badges
│       ├── rack.css              ← Tarjetas de rack, flip 3D
│       ├── faceplates.css        ← Faceplates de dispositivos, LEDs
│       ├── modals.css            ← Modales, formularios, acordeón
│       └── misc.css              ← Iconos SVG, tooltips, drag ghost, scrollbar
│
├── js/
│   ├── store.js                  ← ESTADO CENTRAL (Proxy ES6 + WeakMap cache + Undo/Redo acotado N=15)
│   ├── main.js                   ← Orquestador (init, eventos, renderAll)
│   ├── utils.js                  ← Funciones auxiliares (uid, fastClone/deepClone multi-tier, notify, etc.)
│   ├── icons.js                  ← SVG inline de todos los dispositivos
│   ├── demoData.js               ← Carga datos de ejemplo (lazy load)
│   │
│   ├── auth/
│   │   ├── roles.js              ← RBAC (Admin/Editor/Viewer) con SHA-256
│   │   └── crypto.js             ← Cifrado simétrico AES-GCM (enc:v1:) para credenciales
│   │
│   ├── ui/
│   │   ├── catalog.js            ← Sidebar flyout: catálogo + categorías + filtros
│   │   ├── rack.js               ← Renderizado físico de racks + cables SVG
│   │   ├── faceplates.js         ← HTML de faceplates por tipo
│   │   ├── tables.js             ← Tabla de inventario/conexiones
│   │   ├── outliner.js           ← Árbol jerárquico (sala→rack→equipo)
│   │   ├── inspector.js          ← Panel de propiedades
│   │   ├── fileManager.js        ← File System Access API + autoguardado
│   │   ├── modals.js             ← Orquestador de modales
│   │   │
│   │   ├── modals/
│   │   │   ├── Globals.js        ← Variables globales de modales
│   │   │   ├── RackModal.js      ← Modal de crear/editar rack
│   │   │   ├── DeviceModal.js    ← Modal de crear/editar equipo (acordeones)
│   │   │   ├── CableModal.js     ← Modal de crear/editar cable (swap e inversión de canaleta M-41)
│   │   │   ├── RoomModal.js      ← Modal de crear sala
│   │   │   ├── ExportModal.js    ← Modal de exportar PNG/CSV/Excel/Topología (M-37)
│   │   │   ├── ImportModal.js    ← Modal de importación masiva CSV/Excel y plantillas de 21 campos (M-21 y M-22)
│   │   │   └── PlacementModal.js ← Modal de colocación rápida
│   │   │
│   │   └── topology/
│   │       ├── TopologySkins.js      ← Skins modulares: 3 modos (circle/card/image), 18 presets offline, imágenes custom e hit-testing M-28
│   │       ├── TopologyState.js      ← Estado del canvas (hover, dragging, 5 slots M-40)
│   │       ├── TopologyLayout.js     ← Algoritmo de layout automático y afinidad piso M-39
│   │       ├── TopologyRenderer.js   ← Dibujado Canvas 2D (card/circle/image, temas dark/light/sepia M-18)
│   │       ├── TopologyEvents.js     ← Interacciones (drag, zoom, click, resize)
│   │       └── TopologyOrchestrator.js ← Lifecycle + exportación PNG
│   │
│   ├── xlsx.full.min.js          ← SheetJS (exportar Excel)
│   ├── mobile-drag-drop.min.js   ← Polyfill touch drag
│   └── mobile-drag-drop-scroll.min.js
│
├── assets/
│   ├── default/                  ← 16 SVGs vectoriales de alta fidelidad con animaciones CSS integradas
│   ├── icons/                    ← Iconos SVG monocromáticos por categoría
│   ├── img/                      ← Imágenes estáticas (logos, fondos, skins personalizadas)
│   └── svg/
│       └── default/              ← Repositorio vectorial organizado por familias
│
├── doc/
│   ├── doc_md/                   ← Documentación técnica en Markdown
│   ├── doc_img/doc_svg/          ← 33 diagramas SVG del proyecto
│   ├── log/                      ← CHANGELOG.md (diario de cambios)
│   └── temp/                     ← Archivos temporales
│
├── scripts/                      ← Scripts Node.js para compilación
│   ├── build_standalone_manual.cjs
│   └── generate_svgs.cjs
│
├── .agents/                      ← Instrucciones para agentes IA
├── .py/                          ← Scripts Python utilitarios
├── memory-bank/                  ← Contexto persistente para agentes IA
├── json/                         ← Archivos JSON auxiliares (manifest.json)
└── tests/
    ├── index.html                ← Runner web interactivo de pruebas en navegador (335 tests en 21 grupos al 100%)
    └── integrity_check.cjs       ← Suite de pruebas automatizadas de integridad (335 tests en 21 grupos al 100%)
```

**Ver diagrama:** `doc/doc_img/doc_svg/architecture/architecture_overview.svg` (File Structure)

### Orden de carga de CSS

```
variables.css → layout.css → panels.css → rack.css → faceplates.css → modals.css → misc.css
```

Este orden es **importante** porque CSS se resuelve en cascada. Si `misc.css` define algo que `layout.css` también define, gana `misc.css` (se carga después).

### Scripts en index.html

Todos los `<script>` van al final del `<body>`, en orden:

1. **Vendor:** `xlsx.full.min.js`, `html2canvas.min.js`, `mobile-drag-drop.min.js`, `mobile-drag-drop-scroll.min.js`
2. **Core:** `store.js`, `utils.js`, `icons.js`, `demoData.js`
3. **Auth & Cripto:** `auth/crypto.js`, `auth/roles.js`
4. **UI:** `ui/catalog.js`, `ui/tables.js`, `ui/outliner.js`, `ui/inspector.js`
5. **Modals:** `Globals.js`, `RackModal.js`, `DeviceModal.js`, `CableModal.js`, `RoomModal.js`, `ExportModal.js`, `PlacementModal.js`
6. **Topology:** `TopologyState.js`, `TopologyLayout.js`, `TopologyRenderer.js`, `TopologyEvents.js`, `TopologyOrchestrator.js`
7. **Orchestration:** `ui/modals.js`, `ui/fileManager.js`
8. **Init:** `main.js` (último, porque depende de todo lo demás)

> ⚠️ **NO** son módulos ES. Todos cargan en scope global. Si añades un archivo JS nuevo, debes agregar una etiqueta `<script>` en `index.html`.

---

## 6. El Layout de la Interfaz (CSS Grid)

La app usa **CSS Grid** para dividir la pantalla en 5 áreas fijas:

```
┌─────────────────────────────────────────────────────┐
│                    HEADER (56px)                     │
├──────────┬──────────────────────┬────────────────────┤
│          │                      │                    │
│ SIDEBAR  │       MAIN CANVAS    │    RIGHT PANEL     │
│ (50px/   │        (1fr)         │     (300px)        │
│  260px)  │                      │                    │
├──────────┴──────────────────────┴────────────────────┤
│                  BOTTOM PANEL (220px)                 │
└─────────────────────────────────────────────────────┘
```

### CSS que define esto

```css
#app {
  display: grid;
  grid-template-rows: var(--header-h) 1fr var(--bottom-h);
  grid-template-columns: var(--sidebar-w) 1fr var(--right-panel-w);
  grid-template-areas:
    "header  header        header"
    "sidebar main          right-panel"
    "bottom  bottom        bottom";
  height: 100vh;
  overflow: hidden;
}
```

### Sidebar dinámico (flyout)

El sidebar tiene dos estados controlados por CSS:
- **Colapsado** (`--sidebar-w: 50px`): Solo muestra iconos de categorías
- **Expandido** (`--sidebar-w: 260px`): Muestra el flyout con la lista de equipos del catálogo

La función `openFlyout(category)` en `catalog.js` actualiza la variable CSS dinámicamente:
```javascript
document.documentElement.style.setProperty('--sidebar-w', '260px');
```

### Variables CSS importantes

```css
:root {
  /* Dimensiones */
  --sidebar-w: 50px;          /* Colapsado por defecto */
  --right-panel-w: 300px;
  --header-h: 56px;
  --bottom-h: 220px;
  --rack-unit-h: 24px;        /* 1U = 24px */

  /* Colores oscuros (tema por defecto) */
  --bg-main: #0b0f19;
  --bg-card: #151c2e;
  --border: #25304b;
  --accent: #0ea5e9;

  /* Fuentes */
  --font-ui: 'Outfit', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

/* Tema claro */
[data-theme="light"] {
  --bg-main: #f0f4f8;
  --bg-card: #ffffff;
  --accent: #0284c7;
  /* ... */
}
```

**Ver diagramas:** `doc/doc_img/doc_svg/layout/layout_header.svg`, `layout_sidebar.svg`, etc.

---

## 7. Cada Área de la UI explicada

### Header (56px)

**Archivo:** `index.html` (sección `#header`), estilos en `css/layout.css`

Contiene:
- Logo + nombre del proyecto (`#project-filename`)
- Menú del proyecto (dropdown con Abrir, Guardar, Guardar como, Demo, Tema, Modo Dios, Cambiar PIN, Limpiar proyecto)
- Dropdown de salas (selector de sala activa + botón "+" para nueva sala)
- Dropdown de racks (navegación rápida + scroll al rack)
- Tabs de vista (`Vista Física` / `Topología`)
- Controles de topología (estilo card/circle, slider espaciado, auto-ordenar)
- Toggle de cables SVG (solo en vista física)
- Buscador global
- Botones Undo/Redo
- Badge de usuario (rol actual: Admin/Editor/Espectador)

**Ver:** `doc/doc_img/doc_svg/layout/layout_header.svg`

### Sidebar (50px colapsado / 260px expandido)

**Archivo:** `index.html` (sección `#sidebar`), renderizado por `js/ui/catalog.js`

Contiene:
- **Barra de iconos de categorías** (`#sidebar-category-icons`): Iconos por familia de hardware (redes, cómputo, almacenamiento, seguridad/CCTV, energía, KVM, accesorios/cableado, periféricos de piso, más pestaña global "Todos" con buscador)
- **Flyout** (`#catalog-flyout`): Se despliega al hacer clic en una categoría
  - Título de la categoría activa
  - Buscador del catálogo (`#catalog-search`)
  - Botones de acción rápida: `+ Rack` y `+ Equipo`
  - Botón cerrar flyout
  - Lista de dispositivos del catálogo filtrados por categoría
- **30 plantillas arquitectónicas estandarizadas** en el array `CATALOG` organizadas en 8 familias comerciales (`CATALOG_GROUPS`): servidores 1U/2U/4U/blade, switches 24P/48P/Core, routers de borde, firewalls UTM, APs, storage NAS/SAN/JBOD, seguridad CCTV (NVR 1U/2U, DVR 1U, decodificador 1U), UPS online 1500/3000VA, PDUs, patch panels Cat6A, bandeja ODF fibra óptica 24P, organizadores, bandejas, KVMs y equipos de piso.
- **Equipos personalizados por proyecto (`store.state.customCatalog`):** Creación de plantillas custom con badge distintivo `PROYECTO`, persistencia en el archivo `.rack` y reset limpio en nuevo proyecto.
- Cada item es arrastrable al rack (drag & drop)
- Menú contextual por item (⋮): Ubicación rápida, Editar plantilla, Eliminar plantilla

**Ver:** `doc/doc_img/doc_svg/layout/layout_sidebar.svg`

### Main Canvas (1fr)

**Archivo:** `index.html` (sección `#main`), renderizado por `js/ui/rack.js` y `js/ui/topology/`

Contiene dos vistas (se alternan con tabs en el header):

- **Vista Física** (`#view-physical`):
  - Tarjetas de rack con slots numerados (1U = 24px) y ancho fijo proporcional de 240px (10:1)
  - Espaciado técnico entre gabinetes ampliado a **`gap: 72px`** (3U) para legibilidad y pasillos
  - Grilla técnica milimétrica de fondo (CAD) con paso de 24px
  - **Motor Visual SVG-First (`faceplates.js`):** Cada dispositivo carga un SVG vectorial de alta fidelidad desde `assets/svg/default/` con animaciones CSS `@keyframes` integradas en el propio SVG (LEDs intermitentes de red, actividad de discos, barras de carga y puertos).
  - Overlay de información con nombre de equipo e IP nítida sobre la carátula.
  - Vista frontal/trasera (flip 3D por rack)
  - Drag & drop para colocar/mover equipos
  - Equipos de piso alineados en sección inferior con `min-width: 584px`
  - **Cables Físicos Segregados** (`#physical-cables-svg`): Enrutamiento ortogonal en 3 zonas libres (Canastillo Aéreo Superior, Canaleta Media libre y Organizador Lateral de gabinete), erradicando colisiones sobre racks o periféricos
  - Zoom/Pan con controles del header

- **Vista Topología** (`#topology-canvas`):
  - Canvas 2D animado a 60fps
  - Nodos en estilo Card (150×50) o Circle (radio 22)
  - Salas como rectángulos naranjas, racks como rectángulos verdes
  - Conexiones con curvas Bézier cúbicas y partículas animadas
  - Drag & drop de nodos, racks y salas
  - Resize handles en salas y racks
  - HUD tooltip al hover sobre nodos
  - Búsqueda global para destacar nodos

**Ver:** `doc/doc_img/doc_svg/layout/layout_main_canvas.svg`

### Right Panel (300px)

**Archivo:** `index.html` (sección `#right-panel`), orquestado por `js/ui/outliner.js` e `js/ui/inspector.js`

Tres secciones:
1. **Outliner** (`#outliner-tree`): Árbol jerárquico (Sala → Rack → Equipo) con toolbar superior (`+ Sala`, `+ Rack`, `+ Equipo`), selector de 4 modos de ordenación (`#outliner-sort-select`: slot, name-asc, name-desc, type) y botones de acción rápida inline (`✏️` y `🗑️`).
   - Click: Selecciona y muestra en Inspector
   - Doble clic: Abre modal de edición
   - Hover: Resaltado visual
2. **Inspector** (`#inspector-section`): Tarjeta de propiedades del elemento seleccionado con soporte **colapsable** interactivo para expandir el Outliner. Incluye **CRUD activo** con Empty State (`+ Nueva Sala`, `+ Nuevo Gabinete`), y botones contextuales de eliminación segura (`deleteRoomFromInspector`, `deleteRackFromInspector`, `deleteDeviceFromInspector`).
3. **Estadísticas** (`#stat-*`): Métricas globales (salas, racks, equipos en rack, equipos de piso, conexiones, potencia en Watts).

**Ver:** `doc/doc_img/doc_svg/layout/layout_right_panel.svg`

### Bottom Panel (220px)

**Archivo:** `index.html` (sección `#bottom`), renderizado por `js/ui/tables.js`

Contiene:
- Tabs: Inventario / Conexiones
- Tabla de Inventario de 18 columnas con metadatos completos: Rack, U, Lado, Nombre, Marca, Modelo, Tipo, **Tamaño**, IP, MAC, Serie, Usuario, Contraseña, Consumo (W), Tomas, **Skin**, **Notas**, Acciones.
- **Selector Dinámico de Columnas:** Menú flotante (`#columns-dropdown`) accesible desde el botón `⚙ Columnas` que permite alternar la visibilidad de cualquier columna. El estado se persiste de forma local mediante `localStorage` (clave `RACK_DESIGNER_TABLE_COLUMNS`).
- Edición inline interactiva por doble clic (`finishCellEdit()`) que persiste cambios numéricos de tamaño, skin y notas directamente al store.
- Botones: Agregar equipo, Colocación rápida (con buscador reactivo `#qp-dev-search`), Nueva conexión.
- Menú de exportación con soporte a PNG 1:1 Retina (`html2canvas.min.js`), CSV estructurado y Excel (`xlsx.full.min.js`).
- Botón expandir/contraer.

**Ver:** `doc/doc_img/doc_svg/layout/layout_bottom_panel.svg`

---

## 8. El Topology View (Canvas 2D)

La vista de topología es un **lienzo HTML5 Canvas** dividido en 6 módulos:

| Archivo | Responsabilidad |
|---|---|
| `TopologySkins.js` | Motor modular de skins (cards, circle, hardware skins), 18 presets offline, imágenes custom base64 e hit-testing unificado (M-28) |
| `TopologyState.js` | Variables de estado del canvas (hover, dragging, posiciones, 5 slots de memoria M-40) |
| `TopologyLayout.js` | Algoritmo de distribución automática y afinidad de piso (M-39) |
| `TopologyRenderer.js` | Dibujado Canvas 2D (nodos, enlaces, partículas, temas M-18) |
| `TopologyEvents.js` | Interacciones (drag, zoom, pan, dblclick, resize) con detección de colisión matemática |
| `TopologyOrchestrator.js` | Lifecycle (init, start, stop) + export PNG |

### Colores oficiales del canvas

| Elemento | Color | Código |
|---|---|---|
| Fondo | Azul | `#2255aa` |
| Grid puntos | Blanco 13% opacity | `#ffffff22` |
| Salas | Naranja | `#f97316` |
| Bordes sala activa | Blanco 4px | `#ffffff` |
| Bordes sala inactiva | Naranja oscuro 3px | `#c2410c` |
| Racks | Verde | `#65a30d` |
| Nodos (card/circle/image) | Navaja oscuro | `#0f172a` |
| Borde nodo | Color del tipo | `TYPE_COLORS[dev.type]` |
| Conexiones | Color del cable | `conn.color` |
| Partículas | Blanco + glow | `#ffffff` + shadow |

### Estilos de nodos (Skins Visuales M-28)

La variable `window.TOPOLOGY_STYLE` controla el modo de renderizado activo:

- **`'circle'`** (Nodos): Círculos de radio 22 px con icono SVG centrado, nombre arriba y badge IP personalizable.
- **`'card'`** (Tarjetas): Rectángulos de 150×50 px con icono, nombre e IP enfocado en lectura rápida de metadatos.
- **`'image'`** (Hardware Skins): Chasis fotorrealista de 140×50 px con orejas metálicas de montaje en rack, carátula vectorial basada en `EMBEDDED_SVG_CACHE` (18 presets de fábrica 100% offline) o imagen personalizada subida por el usuario en base64 DataURL, con etiqueta U y LED de estado operativo.

El menú desplegable `#topo-style-dropdown` permite alternar instantáneamente entre los 3 modos (**Cards**, **Nodos** y **Hardware**) y persiste en el proyecto y en los 5 slots de memoria (M-40).

### Cómo se dibuja

```
drawTopo() se ejecuta 60 veces por segundo (requestAnimationFrame)
    ↓
1. Limpia el canvas (fillRect azul #2255aa)
    ↓
2. Dibuja grid de puntos (40px spacing)
    ↓
3. Aplica transformación zoom + pan (ctx.translate + ctx.scale)
    ↓
4. Dibuja salas (roundRect naranja con resize handle)
    ↓
5. Dibuja racks dentro de salas (roundRect verde con resize handle)
    ↓
6. Dibuja conexiones (curvas Bézier cúbicas con 4 partículas animadas)
    ↓
7. Dibuja nodos de dispositivos (card o circle según TOPOLOGY_STYLE)
    ↓
8. Dibuja HUD tooltip al hover (nombre, tipo, IP, usuario, contraseña)
    ↓
9. Solicita siguiente frame → loop continuo
```

### Layout automático

El motor en `TopologyLayout.js` implementa dos modos de distribución y algoritmos de contención armónica:

1. **Salas (Rooms):** Distribuidas horizontalmente con 60px de separación entre ellas y padding perimetral de 80px (`ROOM_MARGIN`).
2. **Racks (Gabinetes):** Distribuidos horizontalmente en cada sala con `RACK_GAP = 32px` y padding interno de 16px.
3. **Equipos montados en rack:** Apilados verticalmente dentro de las cotas de su rack con espaciado vertical adaptable.
4. **Equipos de piso (Floor Devices - M-39):**
   - Agrupación por **afinidad ponderada al rack anfitrión** (`_findAffinityRackForFloorDevice()`): Se conectan y alinean automáticamente justo debajo del gabinete con el que tienen mayor cableado o enlace directo.
   - **Línea de base uniforme:** Se sitúan a `floorBaseY = rackTopY + maxRackH + 28px`, garantizando armonía estética entre racks de alturas desiguales en la misma sala.
   - **Centrado y escalonamiento:** Centrados en el eje X del rack anfitrión con apilamiento vertical ordenado (`+44px` por periférico adicional) sin solapar racks contiguos (`RACK_GAP = 32px`).
   - Periféricos huérfanos o sin conexiones directas se distribuyen de forma equitativa bajo el primer rack disponible de la sala.
5. **Layout en Árbol Jerárquico (M-32):** Algoritmo de árbol genealógico DAG (Core → Distribution → Access → Floor/Leaf) con trazado de cableado ortogonal/manhattan y base inferior para nodos desconectados.

Los sliders `#topo-spacing-h` y `#topo-spacing-v` controlan independientemente el espaciado horizontal y vertical en tiempo real a 60 FPS con presets ('compact', 'normal', 'wide').

### Persistencia de posiciones

Las posiciones de nodos, racks y salas en la topología se guardan en `store._raw.topology` mediante `saveTopo()`. Al reabrir, `loadTopoState()` restaura las posiciones manuales.

### Interacciones

- **Arrastrar nodo:** Mueve el equipo en el diagrama (confinado dentro de su rack/sala)
- **Arrastrar rack (barra superior):** Mueve todo el rack con sus equipos (confinado en su sala)
- **Arrastrar sala (barra superior):** Mueve la sala completa con todo su contenido
- **Resize handle (esquina inferior-derecha):** Cambia el tamaño de sala/rack (respeta contenido mínimo)
- **Rueda del mouse:** Zoom in/out (0.1x – 3x)
- **Click + arrastrar fondo:** Pan (mover vista)
- **Doble click nodo:** Abre modal de crear cable (`openCableModal`)
- **Doble click cable:** Abre modal de editar cable (`openEditCableModal`)

### Exportación PNG

`exportTopologyToPNG()` en `TopologyOrchestrator.js` crea un canvas offscreen a 2x resolución, renderiza un frame estático sin hover, y descarga como PNG.

**Ver:** `doc/doc_img/doc_svg/layout/layout_topology.svg`

---

## 9. Renderizado de Cableado Físico (SVG)

A diferencia de la topología (Canvas 2D), el cableado físico se resuelve inyectando dinámicamente un lienzo vectorial `<svg id="physical-cables-svg">` posicionado de forma absoluta dentro de `#view-physical-content`.

### Arquitectura de Enrutamiento Segregado en 3 Zonas Libres:

Para erradicar colisiones de cables sobre servidores o periféricos de piso, el motor `drawPhysicalCables()` en `js/ui/rack.js` segrega las trayectorias en 3 zonas exclusivas:

1. **Canastillo Aéreo Superior (Conexiones Inter-Rack):**
   - Los cables que viajan entre gabinetes distintos se elevan hacia la zona aérea por encima de la cabecera del rack más alto (`overheadY = minRackTop - 14px - (index % 7) * 5`).
   - Salida y entrada inteligente por el lateral más cercano al rack de destino, evitando cruzar frontalmente los servidores intermedios.
2. **Canaleta Media Segregada (Equipos de Piso ↔ Racks / Piso ↔ Piso):**
   - Los periféricos de piso viajan por la canaleta horizontal intermedia situada entre los racks y la sección de piso (`middleGutterY = maxRackBottom + 18px + (index % 6) * 4`).
   - Ascienden verticalmente por el pasillo lateral de 72px del gabinete de destino. Se eliminó al 100% el cruce sobre las tarjetas de piso.
3. **Organizador Lateral de Gabinete (Conexiones Intra-Rack):**
   - Los enlaces entre switches y servidores alojados en el mismo gabinete se confinan estrictamente al organizador vertical derecho (`gutterX = p1.rightEdgeX + 8px + (index % 5) * 4`), sin salir del perímetro del rack.
4. **Propiedades Geométricas:**
   - Curvaturas ortogonales con radio suave `r = 6px` y arcos cuadráticos Bézier (`Q`).
   - Switch interactivo `#checkbox-toggle-cables` en la barra de herramientas para ocultar/mostrar cables al instante.

**Ver Diagramas:**
- `doc/doc_img/doc_svg/propuestas/enrutamiento_equipos_piso_y_racks.svg` (Doble canaleta y zonas segregadas)
- `doc/doc_img/doc_svg/propuestas/propuesta_1_canastillo_aereo.svg` (Canastillo aéreo superior)

---

## 10. Sistema de Autenticación y Criptografía

**Archivos:** `js/auth/roles.js` (expuesto como `window.RackAuth`) y `js/auth/crypto.js` (expuesto como `window.RackCrypto`).

### Roles y permisos (RBAC)

| Rol | Descripción | Permisos |
|---|---|---|
| **Admin** | Acceso completo | Todo + Modo Dios + Revelar Contraseñas + Cambiar PIN |
| **Editor** | Edición sin PIN | Todo excepto cambiar PIN y Modo Dios |
| **Viewer** | Solo lectura | Solo ver datos, sin editar |

### Permisos detallados

| Permiso | Admin | Editor | Viewer |
|---|---|---|---|
| `toggleGodMode` | ✅ | ❌ | ❌ |
| `editDevices` | ✅ | ✅ | ❌ |
| `addRacks` | ✅ | ✅ | ❌ |
| `deleteRacks` | ✅ | ✅ | ❌ |
| `addConnections` | ✅ | ✅ | ❌ |
| `clearProject` | ✅ | ✅ | ❌ |
| `changeAdminPin` | ✅ | ❌ | ❌ |
| `viewData` | ✅ | ✅ | ✅ |

### Implementación de Roles
- **PIN por defecto:** `rack2024` (hash SHA-256: `392bd907...`)
- **Hasheo:** Web Crypto API (`crypto.subtle.digest`) con fallback JS puro (`sha256_fallback`)
- **Sesión:** `sessionStorage` bajo la clave `RACK_SESSION_USER` (se destruye al cerrar la pestaña)
- **Integridad y Persistencia F5:** Los administradores tienen un token criptográfico persistido en `sessionStorage` bajo `RACK_SESSION_TOKEN` (`TOKEN_KEY`). Si un usuario altera manualmente los valores sin coincidir con el token, se fuerza logout de inmediato.
- **Verificar permisos:** `RackAuth.can('toggleGodMode')` retorna boolean.

### Blindaje Criptográfico en Reposo (`RackCrypto`, M-01)
- **Cifrado Simétrico:** Módulo `RackCrypto` implementa cifrado de 256 bits bajo el estándar `enc:v1:<iv>:<ciphertext>`. Genera un vector de inicialización (IV) de 12 bytes único por cada registro.
- **Persistencia Segura:** `store._save()` cifra automáticamente los campos sensibles de los equipos (`pass`) antes de guardarlos en `localStorage` (tanto en el slot principal como en el slot redundante de respaldo).
- **Descifrado Transparente:** `store._load()` y `store.loadData()` descifran las credenciales al instanciar el estado en memoria, permitiendo que la UI y las operaciones funcionen en texto plano sin penalizar la velocidad.
- **Exportación Segura:** `fileManager.writeToFile` y `downloadFallback` cifran las credenciales al generar archivos `.rack` o `.json`.
- **Modo Dios y Revelación Táctil:**
  - Las contraseñas se renderizan por defecto con `••••••••` en tablas e Inspector.
  - Los administradores pueden activar el **Modo Dios** (`SHOW_PASSWORDS = true`) para auditar todas las contraseñas a la vez.
  - En el Inspector, el botón de ojo táctil (`toggleDevicePasswordInspector(devId)`) permite a los administradores alternar la visualización de la contraseña de un equipo individual. Espectadores y Editores son bloqueados por RBAC.

---

## 11. Gestión de Archivos

**Archivo:** `js/ui/fileManager.js`

### File System Access API

- **Abrir:** `showOpenFilePicker()` con filtro `.rack` / `.json`
- **Guardar:** `showSaveFilePicker()` con extensión `.rack`
- **Autoguardado:** Debounce de 3 segundos después del último cambio, solo si hay un `fileHandle` abierto y permisos concedidos

### Fallback

En navegadores que no soportan File System Access API (Firefox, Safari), se usa:
- **Abrir:** `<input type="file">` tradicional
- **Guardar:** `downloadJSON()` que crea un Blob y genera un link de descarga

### Formato de archivo

```json
{
  "version": 1,
  "project": { /* todo el estado de store._raw */ },
  "catalog": [ /* array CATALOG con las 21+ plantillas */ ]
}
```

---

## 12. Flujo de Datos Completo

### Crear un dispositivo (Drag & Drop)

```
1. Usuario arrastra item del catálogo
2. onCatalogDragStart() guarda el template
3. Usuario suelta en un slot del rack
4. onSlotDrop() obtiene el template
5. store.addDeviceToRack() es llamado
6. snapshot() guarda estado para undo
7. Se crea el objeto device con uid()
8. Se valida colisiones en el slot/lado
9. Se hace push a this._raw.devices
10. this._save() guarda en localStorage
11. this._emit('change', { source: 'addDeviceToRack' })
12. renderAll() redibuja:
    - renderStats() → estadísticas se actualizan
    - renderOutliner() → árbol se actualiza
    - renderPhysical() → nuevo faceplate aparece
    - renderBottomPanel() → tabla se actualiza
13. fileManager.autoSave() → si hay archivo abierto (3s debounce)

### Validación y Creación de Conexiones (VLANs)

```
1. Usuario abre modal de "Nueva Conexión"
2. Selecciona origen, destino y puertos
3. El modal filtra puertos (opcionalmente) ocultando los que `store.isPortOccupied()` reporta en uso
4. Usuario selecciona una VLAN del catálogo (`store.getVlans()`)
5. store.addConnection() es llamado
6. store.validateConnection() bloquea la acción si detecta colisión de puertos
7. snapshot() guarda estado
8. this._raw.connections.push(newConn)
9. this._save() + this._emit('change', { source: 'Connection' })
10. renderAll() redibuja vistas afectadas (Inspector, tablas, cables)
```
```

### renderAll Source Dispatch

La función `renderAll()` en `main.js` usa el string `source` del evento para decidir qué vistas redibujar:

| Valor de `source` | Vistas que se redibujan |
|---|---|
| `""` (vacío), `loadData`, `undo`, `redo` | **TODAS** las vistas (redibujado completo) |
| Contiene `Room`, o es `room-rename` / `changeRoom` | Room tabs, rack selector, stats, vista física, topología |
| Contiene `Rack` | Rack selector, stats, outliner, vista física |
| Contiene `Device`, `addFloorDevice`, `moveDevice`, `deleteDevice`, `updateDevice`, `addDeviceToRack` | Stats, outliner, vista física, panel inferior |
| Contiene `Connection` | Stats, outliner, panel inferior |
| Contiene `Zoom` o `Pan` | Solo actualiza la etiqueta de zoom |

### Guardar / Cargar proyecto

```
Guardar:
1. fileManager.saveProject() / saveProjectAs()
2. Verifica File System API disponible
3. Si SÍ: writeToFile(handle) → JSON.stringify → writable.write()
4. Si NO: downloadFallback() → crea blob → descarga

Cargar:
1. fileManager.openProject()
2. Si SÍ API: showOpenFilePicker() → getFile() → text()
3. Si NO: <input type="file"> → FileReader
4. loadDataFromString(text) → JSON.parse
5. store.loadData(data.project) → sobreescribe estado
6. Undo/redo se limpian
7. renderAll() → redibuja todo
```

---

## 13. Cómo recrear desde cero

Si quieres construir algo similar paso a paso:

### Paso 1: Crear la estructura básica

```bash
mkdir rack-designer && cd rack-designer
touch index.html css/style.css js/store.js js/main.js
```

### Paso 2: Definir el layout CSS (variables + grid)

### Paso 3: Crear el store reactivo (Proxy ES6 + localStorage + Undo/Redo)

### Paso 4: Crear el orquestador (main.js con renderAll + source dispatch)

### Paso 5: Crear los componentes UI
- `catalog.js` → Lista de dispositivos arrastrables con flyout
- `rack.js` → Renderizado de racks con drag & drop + cables SVG
- `faceplates.js` → HTML de cada tipo de dispositivo
- `tables.js` → Tabla de inventario con edición inline
- `outliner.js` → Árbol jerárquico
- `inspector.js` → Panel de propiedades

### Paso 6: Crear los modales (Device, Rack, Cable, Room, Placement, Export)

### Paso 7: Agregar Canvas 2D (Topología con MVC)

### Paso 8: Agregar autenticación (RBAC con SHA-256 + sessionStorage)

### Paso 9: Agregar gestión de archivos (File System Access API + fallback)

### Paso 10: Agregar PWA (`service-worker.js` + `manifest.json`)

---

## 14. Diagramas SVG del Proyecto

Todos los diagramas están en `doc/doc_img/doc_svg/` (33 archivos):

### Diagramas de Layout

| Archivo | Dimensiones | Contenido |
|---|---|---|
| `layout/layout_header.svg` | 1100×140 | Layout detallado del header |
| `layout/layout_sidebar.svg` | 360×780 | Sidebar con catálogo de equipos |
| `layout/layout_main_canvas.svg` | 720×580 | Área principal con racks |
| `layout/layout_right_panel.svg` | 340×680 | Panel derecho (outliner/inspector/stats) |
| `layout/layout_bottom_panel.svg` | 1100×360 | Panel inferior con tabla |
| `layout/layout_topology.svg` | 1400×700 | Vista de topología (Canvas 2D) |
| `layout/ui_layout_map.svg` | — | Mapa completo del layout UI |

### Diagramas de Arquitectura

| Archivo | Contenido |
|---|---|
| `architecture/architecture_overview.svg` | Arquitectura completa del proyecto (2400×2800) |
| `architecture/architecture_current.svg` | Arquitectura actual con flujos reactivos, RBAC y fallbacks |
| `flows/project_flow.svg` | Flujo de datos completo (2000×2600) |
| `flows/file_communication_flow.svg` | Comunicación y llamadas inter-módulo |
| `flows/store_reactivity.svg` | Detalle del patrón reactivo del Store |
| `architecture/module_dependencies.svg` | Dependencias entre módulos JS |
| `architecture/dependencies_map.svg` | Mapa de dependencias completo |

### Diagramas de Funcionalidades

| Archivo | Contenido |
|---|---|
| `flows/drag_drop_flow.svg` | Flujo de drag & drop |
| `propuestas/topology_engine.svg` | Motor de topología Canvas 2D |
| `propuestas/modals_accordions.svg` | Sistema de modales con acordeones |
| `flows/roles_permissions.svg` | Matriz de roles y permisos |
| `flows/security_rbac_crypto.svg` | Seguridad: RBAC + SHA-256 |
| `flows/file_manager_api.svg` | File System Access API |
| `flows/autosave_history.svg` | Autoguardado e historial |
| `flows/export_system.svg` | Sistema de exportación |
| `architecture/pwa_service_worker.svg` | Service Worker y PWA |
| `layout/theme_switcher.svg` | Sistema de temas claro/oscuro |
| `propuestas/hybrid_network_ports.svg` | Puertos de red híbridos |

### Diagramas del Manual de Usuario

| Archivo | Contenido |
|---|---|
| `manual/manual_rack_anatomy.svg` | Anatomía de un rack |
| `manual/manual_ui_overview.svg` | Mapa de la interfaz para usuarios |
| `manual/manual_action_flow.svg` | Flujo de acciones comunes |

### Diagramas de Mejoras

| Archivo | Contenido |
|---|---|
| `architecture/mejoras_architecture_final.svg` | Arquitectura final propuesta |
| `propuestas/mejoras_device_skins_fallback.svg` | Sistema de skins con fallback |

### Cableado Físico y Vistas

| Archivo | Contenido |
|---|---|
| `propuestas/enrutamiento_equipos_piso_y_racks.svg` | Arquitectura de doble canaleta (Aérea vs Piso) |
| `propuestas/propuesta_1_canastillo_aereo.svg` | Canastillo superior aéreo inter-rack |
| `propuestas/propuesta_2_fila_continua_nowrap.svg` | Disposición en fila continua de racks |
| `propuestas/propuesta_3_cables_interactivos_hover.svg` | Modo interactivo Smart Focus |

### Diagramas Entidad-Relación (ERD Vectoriales por Niveles)

| Archivo | Nivel | Contenido |
|---|---|---|
| [`erd_01_atomic_core.svg`](../doc_img/doc_svg/erd/erd_01_atomic_core.svg) | Nivel 1 (Atómico) | Primitivas base: VLAN, Port, CableType, RackAuth, Session, RackCrypto y Utils_FastClone |
| [`erd_02_datacenter_entities.svg`](../doc_img/doc_svg/erd/erd_02_datacenter_entities.svg) | Nivel 2 (Datacenter) | Entidades físicas: Room, Rack, Device, Connection, CustomCatalogItem y proyección a UI física |
| [`erd_03_topology_engine.svg`](../doc_img/doc_svg/erd/erd_03_topology_engine.svg) | Nivel 3 (Topología 2D) | Motor Canvas 2D: TopologyState, Geometrías (Node, Rack, Room), TopologySkins (M-28), 5 TopologySlots (M-40) |
| [`erd_04_system_reactive_architecture.svg`](../doc_img/doc_svg/erd/erd_04_system_reactive_architecture.svg) | Nivel 4 (Sistema Global) | Arquitectura reactiva: index.html, store.js (Proxy ES6), main.js (rAF 60 FPS, renderSingleRack), UI Views, Modales y Suite 360 Tests |

### Otros

| Archivo | Contenido |
|---|---|
| `architecture/directory_structure.svg` | Estructura de directorios |
| `architecture/project_areas.svg` | Áreas del proyecto |
| `flows/user_personas.svg` | Perfiles de usuario |

---

## 15. Roadmap de Mejoras

El documento `mejoras.md` en la raíz del proyecto es el **Source of Truth** para todas las mejoras planificadas. Contiene un análisis detallado de:

- Problemas críticos de seguridad e integridad
- Límites de rendimiento y escalabilidad
- Robustez y ciclo de vida PWA
- Deuda técnica y calidad
- Problemas de UX y consistencia
- Fases del roadmap de implementación (1–5)
- Mejoras específicas implementadas para topología (skins de hardware M-28, 5 ranuras de memoria M-40, afinidad espacial M-39)

---

## Resumen Final

El proyecto RACK Designer Next es una app web vanilla que:

1. **No necesita build step** → Solo abre index.html
2. **Usa Proxy ES6** para estado reactivo (como Redux pero nativo, con cache WeakMap)
3. **Guarda todo en localStorage** (con cifrado AES-GCM en reposo) + autoguardado en disco con File System Access API
4. **Tiene 5 áreas fijas** en CSS Grid (header, sidebar flyout, main, right, bottom)
5. **Canvas 2D** para la vista de topología (3 estilos: card, circle y Hardware Skins fotorrealistas con 18 presets offline, M-28)
6. **SVG inline** para cables en la vista física con bicanalidad segregada aérea y bajo piso (M-41)
7. **Drag & drop** nativo para colocar equipos y reordenar slots
8. **3 roles** (Admin, Editor, Viewer) con SHA-256 + token de integridad
9. **Exporta e Importa** masivamente en Excel (.xlsx) y CSV con detección reactiva de colisiones (M-21/M-22), PNG 1:1 Retina y JSON (.rack)
10. **PWA** con Service Worker (`rack-designer-next-cache-v30`) para uso offline
11. **Doble Escenario Demo:** Datacenter TIA-942 y Campus Universitario UTN (10 salas, 13 racks, 162 equipos, 24 VLANs) mediante selector interactivo
12. **Suite de Integridad Automatizada** con 360 pruebas en 23 grupos pasando al 100% en Node.js (`tests/integrity_check.cjs`) y navegador web (`tests/index.html`)

**La regla más importante:** Nunca mutar el DOM directamente. Siempre actualizar el `store` y dejar que `renderAll()` se encargue de redibujar.
