```fish
pnpm init # Crea el archivo package.json
pnpm add [package] # Instalar modulos, esto crea un archivo 'pnpm-lock.yaml'
pnpm add -D [package] # Instalar dependencias de desarrollo
# Al añadir dependencias nos pone unas sugerencias de que otras dependencias necesitamos

pnpm add @[package]/cli -g # Instalar modulos globales, que estén disponibles en todo el Sistema
pnpm setup # En caso de error ejecutar, antes de -g
pnpm i | pnpm install # Instalar todas las dependencias del package.json
pnpm remove [package] # Eliminar dependencias del package.json
pnpm exec [script] # En caso de ejecutar localmente un script, ej: pnpm exec tsc --init es como npx tsc --init
pnpm dlx create-react-app # Si queremos ejecutar un modulo sin la necesidad de instalarlo globalmente, ej: pnpm create vite
pnpm import # Si utilizabamos npm, luego podemos eliminar el package-lock.json
```
