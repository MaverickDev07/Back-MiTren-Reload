# Creación de Ticket

```js
```

### Previamente Poblamos datos
```js
db.line.insertOne({
  line_name: 'Línea Roja',
}) // Devuelve un _id: 63c29d106723ed38e17c2e4a

db.zone.insertOne({
  
  zone_code: 'Z-100', // Código debe ser Correlativo al siguiente (sort)
  zone_name: 'San Matías',
  line_id: ObjectId('63c29d106723ed38e17c2e4a'),
  stations: ['Litoral', 'Iglesia'],
}) // Devuelve un _id: 63c29d106723ed38e17c2100
db.zone.insertOne({
  zone_code: 'Z-150',
  zone_name: 'Reloj',
  line_id: ObjectId('63c29d106723ed38e17c2e4a'),
  stations: ['Final Junin', 'Pando'],
}) // Devuelve un _id: 63c29d106723ed38e17c2200
db.zone.insertOne({
  zone_code: 'Z-200',
  zone_name: 'Recoleta',
  line_id: ObjectId('63c29d106723ed38e17c2e4a'),
  stations: ['Nicolas Ortiz', 'Grau'],
}) // Devuelve un _id: 63c29d106723ed38e17c2300
```

#### Añadiendo Rutas y sus Precios "ADMIN"

```js
db.route.insertOne({
  zones: [
    {
      zone_name: 'San Matías',
      zone_id: ObjectId('63c29d106723ed38e17c2100'),
    },
  ],
  prices: [
    {
      customer_type: 'General',
      base_price: 1.5,
    },
    {
      customer_type: 'Preferencial',
      base_price: 1,
    },
    {
      customer_type: 'Estudiante',
      base_price: 0.5,
    },
  ]
})

db.route.insertOne({
  zones: [
    {
      zone_name: 'San Matías',
      zone_id: ObjectId('63c29d106723ed38e17c2100'),
    },
    {
      zone_name: 'Reloj',
      zone_id: ObjectId('63c29d106723ed38e17c2200'),
    },
  ],
  prices: [
    {
      customer_type: 'General',
      base_price: 2.5,
    },
    {
      customer_type: 'Preferencial',
      base_price: 1.5,
    },
    {
      customer_type: 'Estudiante',
      base_price: 1,
    },
  ]
})

db.route.insertOne({
  zones: [
    {
      zone_name: 'San Matías',
      zone_id: ObjectId('63c29d106723ed38e17c2100'),
    },
    {
      zone_name: 'Reloj',
      zone_id: ObjectId('63c29d106723ed38e17c2200'),
    },
    {
      zone_name: 'Recoleta',
      zone_id: ObjectId('63c29d106723ed38e17c2300'),
    },
  ],
  prices: [
    {
      customer_type: 'General',
      base_price: 3.5,
    },
    {
      customer_type: 'Preferencial',
      base_price: 2,
    },
    {
      customer_type: 'Estudiante',
      base_price: 1.5,
    },
  ]
})
```

### Paso 1

```js
db.ticket.insertOne({
  codigoQR: '63c29d03356e3a085a49d40e',
  date_time: '2023-01-14T12:16:03.186+00:00',
  kiosk_id: ObjectId('63c29d03356e3a085a49d30e'),
  start_station_name: 'Litoral', // Litoral -> Iglesia
  end_station_name: 'Grau',
  total_price: 0,
  routes: [],
}) // Devuelve un _id: 63c29d106723ed38e17c2e2c
```

```js
// Resultado General
db.ticket.insertOne({
  codigoQR: '63c29d03385a49d40e.63c29d03356e.56e3a085a49',
  date_time: '2023-01-14T12:16:03.186+00:00',
  start_station_name: 'Litoral',
  end_station_name: 'Grau',
  total_price: 0 + 3.5 + 2 + 1.5 = 7, // $inc cada vez que hago $push a prices
  route: {
    route_id: ObjectId('63c29d03356e3a085a49f11f'),
    zones: ['San Matías', 'Reloj', 'Recoleta'],
    prices: [
      {
        qty: 3,
        customer_type: 'General',
        base_price: 3.5,
      },
      {
        qty: 2,
        customer_type: 'Preferencial',
        base_price: 2,
      },
      {
        qty: 1,
        customer_type: 'Estudiante',
        base_price: 1.5,
      },
    ]
  }
}) // Devuelve un _id: 63c29d106723ed38e17c2e2c

// Resultado General + Preferencial
db.ticket.insertOne({
  start_station_name: 'Litoral',
  end_station_name: 'Grau',
  total_price: 0 + 5 + 4 = 5,
  routes: [
    {
      zone_name: 'San Matías',
      route_price: 0 + 4 + 1,
      prices: [
        {
          qty: 2,
          customer_type: 'General',
          base_price: 2 // sub_tot = 4
        },
        {
          qty: 1,
          customer_type: 'Preferencial',
          base_price: 1 // sub_tot = 1
        },
      ]
    },
    {
      zone_name: 'Reloj'
      route_price: 0 + 4,
      prices: [
        {
          qty: 2,
          customer_type: 'General',
          base_price: 2
        }
      ]
    },
    {
      zone_name: 'Recoleta'
      route_price: 2,
      prices: [
        {
          qty: 2,
          customer_type: 'General',
          base_price: 1
        }
      ]
    }
  ],
}) // Devuelve un _id: 63c29d106723ed38e17c2e2c
```

### Paso 2

```js
db.ticket.updateOne(
  {
    _id: ObjectId('63c29d106723ed38e17c2e2c'),
  },
  {
    $push: {
      routes: {
        zone_name: 'San Matías',
        route_price: 0
        prices: []
      }
    }
  },
  $inc: {
    total_price: +'routes.route_price'
  }
)
db.ticket.updateOne(
  {
    _id: ObjectId('63c29d106723ed38e17c2e2c'),
  },
  {
    $push: {
      'routes.prices': {
        qty: 2,
        customer_type: 'General',
        base_price: 2
      }
    }
  },
  $inc: {
    'routes.route_price': [qty * base_price]
  }
)
```