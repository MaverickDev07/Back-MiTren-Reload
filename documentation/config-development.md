# Instalación para entorno de desarrollo

### Configurar MongoDB con Docker

Crear un Archivo `docker-compose.yml`

```yml
version: '3.8'
services:
  mongo:
    image: mongo
    container_name: mitren_db
    command: mongod --auth
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example
      MONGO_INITDB_DATABASE: admin
    ports:
      - 27017:27017
    volumes:
      - ./mongo_data:/data/db
```

Añadir Usuario mongodb

```
docker-compose exec mongo bash

mongosh -u root -p example
use admin
db.createUser({
  user:"mgary",
  pwd: "[PASSWORD]",
  roles:["dbOwner"]
})
use mitren_db
db.createUser({
  user:"mgary",
  pwd: "[PASSWORD]",
  roles:["dbOwner"]
})
```

Realizar backup

```sh
cd documentation
rm -R backup # de module-db/documentation
docker-compose exec mongo bash # Ingresar al contenedor docker
docker compose exec mongo bash
rm -R backup # del contenedor docker
exit # Salirse del contenedor
docker exec -t [container_name] mongodump -u mgary -p '[PASSWORD]' --db mitren_db --host localhost:27017 --out /backup/ # desde module-db/documentation
docker cp mitren_db:/backup backup
```

Realizar restore

```sh
docker cp backup [container_name]:/tmp/

docker-compose exec mongo bash
docker compose exec mongo bash
mongosh mitren_db -u mgary -p '[PASSWORD]'
>show collections
>db.dropDatabase()
>show collections
>exit
mongorestore -u mgary -p '[PASSWORD]' --db mitren_db /tmp/backup/mitren_db
rm -R /tmp/backup
exit

db.collection.drop() # Eliminar collection

mongorestore -u mgary -p '[PASSWORD]' --db mitren_db --collection [collection] /tmp/backup/mitren_db/[collection].bson # Restaurar collection
```

Ejecutar Docker Compose

```bash
docker-compose up -d
```

### Configurar Prettier

Crear un archivo `.prettierignore`

```bash
**/.git
**/node_modules
**/package.json
**/package-lock.json
```

Crear un archivo `.prettierrc`

```bash
{
  "useTabs": false,
  "semi": false,
  "singleQuote": true,"singleQuote": true,
  "arrowParens": "avoid",
  "bracketSpacing": true,
  "bracketSameLine": true,
  "editorconfig": true,
  "jsxSingleQuote": true,
  "printWidth": 100,
  "trailingComma": "all"
}
```

Crear un archivo `.editorconfig`

```json
# editor configuration, see https://editorconfig.org
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.js]
quote_type = single

[*.md]
max_line_length = off
trim_trailing_whitespace = false
```

### Configurar Eslint

Crear un archivo `.stylelintrc.json`

```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "alpha-value-notation": null,
    "color-function-notation": null,
    "selector-max-id": 0,
    "selector-class-pattern": null,
    "unit-allowed-list": ["%", "deg", "rem", "ms", "dvh"]
  },
  "defaultSeverity": "warning"
}
```

Crear un archivo `.eslint.config.js`

```js
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import eslintReact from 'eslint-plugin-react'
import eslintReactHooks from 'eslint-plugin-react-hooks'
import eslintReactRefresh from 'eslint-plugin-react-refresh'
import prettierPlugin from 'eslint-plugin-prettier'
import eslintConfigPrettier from 'eslint-config-prettier'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default tseslint.config(
  {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react: eslintReact,
      'react-hooks': eslintReactHooks,
      'react-refresh': eslintReactRefresh,
      prettier: prettierPlugin,
    },
  },
  {
    ignores: ['dist', 'node_modules', 'coverage', 'eslint.config.js'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
      },
      parserOptions: {
        project: ['tsconfig.json', 'tsconfig.node.json'],
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      ...prettierPlugin.configs.recommended.rules,
      ...eslintConfigPrettier.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'prefer-const': 'error',
      'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
      'react/function-component-definition': ['warn', { namedComponents: 'arrow-function' }],
      'react/self-closing-comp': ['error', { component: true, html: true }],
      'max-lines': ['warn', { max: 124 }],
      'max-params': ['error', 3],
    },
  },
)
```

### Configurar TypeScript

Crear un archivo `.tsconfig.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Default",
  "compilerOptions": {
    "lib": ["ES2015"],
    "target": "es6",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./server",
    "composite": false,
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "inlineSources": false,
    "isolatedModules": true,
    "moduleResolution": "node",
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "preserveWatchOutput": true,
    "skipLibCheck": true,
    "strict": true
  },
  "exclude": ["node_modules"],
  "include": ["server"]
}
```

Crear un archivo `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  }
}
```
