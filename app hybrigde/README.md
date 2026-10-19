# Hybrigde para web y móviles

Hybrigde es una aplicación web estática que puede instalarse como PWA y empaquetarse para Android o iOS con Capacitor.

## Probar como PWA

La instalación y el modo sin conexión requieren un servidor local o un sitio servido por HTTPS. Abrir `index.html` directamente como archivo (`file://`) no activa el service worker.

El navegador compatible mostrará **Instalar app** cuando Hybrigde se sirva por HTTPS y esté disponible para instalar. En iPhone/iPad, abre la página en Safari, toca **Compartir** y selecciona **Añadir a pantalla de inicio**.

## Preparar Android

Requisitos: Node.js 20 o posterior, npm y Android Studio con el SDK de Android configurado.

```sh
npm install
npm run android:add
npm run android:open
```

`android:add` crea el proyecto nativo la primera vez. Para actualizarlo después de cambiar HTML, CSS o JavaScript, usa `npm run android:open`; el script vuelve a copiar los archivos y sincroniza Capacitor antes de abrir Android Studio.

## Preparar iOS

Requisitos: Node.js 20 o posterior, npm, macOS y Xcode. La compilación y firma para iPhone requieren macOS.

```sh
npm install
npm run ios:add
npm run ios:open
```

`ios:add` crea el proyecto nativo la primera vez. Para volver a sincronizar y abrirlo después de cambios web, usa `npm run ios:open`.

Las pantallas académicas y el inicio de sesión siguen siendo demostrativos; para una app de producción deben conectarse a servicios universitarios reales.
