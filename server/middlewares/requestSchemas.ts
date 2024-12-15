/* eslint-disable max-lines */
import Joi from 'joi'

// Line
export const createLineSchema = Joi.object({
  line_name: Joi.string().min(3).max(30).required(),
  color: Joi.string().min(3).max(9).required(),
  status: Joi.string().min(3).max(10),
})

export const updateLineSchema = Joi.object({
  line_name: Joi.string().min(3).max(30),
  color: Joi.string().min(3).max(9),
  status: Joi.string().min(3).max(10),
}).or('line_name', 'color', 'status')

// Station
export const createStationSchema = Joi.object({
  station_name: Joi.string().min(3).max(70).required(),
  line_id: Joi.array().min(1).items(Joi.string().alphanum().hex().length(24)).required(),
  is_transfer_stop: Joi.boolean(),
  location: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }).required(),
  status: Joi.string().min(3).max(10),
})

export const updateStationSchema = Joi.object({
  station_name: Joi.string().min(3).max(70),
  line_id: Joi.array().min(1).items(Joi.string().alphanum().hex().length(24)),
  is_transfer_stop: Joi.boolean(),
  location: Joi.object({
    latitude: Joi.number(),
    longitude: Joi.number(),
  }),
  status: Joi.string().min(3).max(10),
}).or('station_name', 'line_id', 'is_transfer_stop', 'location', 'status')

// Kiosk
export const createKioskSchema = Joi.object({
  kiosk_code: Joi.string().min(3).max(10).required(),
  kiosk_type: Joi.string().min(3).max(10).required(),
  station_id: Joi.string().alphanum().hex().length(24).required(),
})

export const updateKioskSchema = Joi.object({
  kiosk_code: Joi.string().min(3).max(10),
  kiosk_type: Joi.string().min(3).max(10),
  station_id: Joi.string().alphanum().hex().length(24),
}).or('kiosk_code', 'kiosk_type', 'station_id')

// Route
export const createRouteSchema = Joi.object({
  line_id: Joi.string().alphanum().hex().length(24).required(),
  stations: Joi.array()
    .min(2)
    .items(
      Joi.object({
        station_id: Joi.string().alphanum().hex().length(24).required(),
        station_name: Joi.string().min(3).max(50).required(),
      }),
    )
    .required(),
})

export const updateRouteSchema = Joi.object({
  line_id: Joi.string().alphanum().hex().length(24),
  stations: Joi.array()
    .min(2)
    .items(
      Joi.object({
        station_id: Joi.string().alphanum().hex().length(24),
        station_name: Joi.string().min(3).max(50),
        _id: Joi.string().alphanum().hex().length(24),
      }),
    ),
}).or('line_id', 'stations')

export const createRouteStationRangeSchema = Joi.object({
  start_code: Joi.string().min(3).max(10).required(),
  end_code: Joi.string().min(3).max(10).required(),
  prices: Joi.array()
    .min(1)
    .items(
      Joi.object({
        interstops: Joi.boolean(),
        customer_type: Joi.string().min(3).max(15).required(),
        base_price: Joi.number().min(1).required(),
      }),
    )
    .required(),
})

// Method
export const createMethodSchema = Joi.object({
  method_name: Joi.string().min(3).max(30).required(),
  status: Joi.string().min(3).max(10),
})

export const updateMethodSchema = Joi.object({
  method_name: Joi.string().min(3).max(30),
  status: Joi.string().min(3).max(10),
}).or('method_name', 'status')

// CustomerType
export const createCustomerTypeSchema = Joi.object({
  customer_type: Joi.string().min(3).max(30).required(),
  description: Joi.string().min(3).max(150).required(),
})

export const updateCustomerTypeSchema = Joi.object({
  customer_type: Joi.string().min(3).max(30),
  description: Joi.string().min(3).max(150),
}).or('customer_type', 'description')

// Customer
export const createCustomerSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .required(),
  name: Joi.string().min(3).max(50).required(),
  lastname: Joi.string().min(3).max(50).required(),
  doc_type: Joi.string().min(2).max(6).required(),
  doc_number: Joi.string().min(6).max(15).required(),
  status: Joi.string().min(3).max(10),
  type: Joi.object({
    type_id: Joi.string().alphanum().hex().length(24).required(),
    customer_type: Joi.string().min(3).max(30).required(),
  }).required(),
})

export const updateCustomerSchema = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
  name: Joi.string().min(3).max(50),
  lastname: Joi.string().min(3).max(50),
  doc_type: Joi.string().min(3).max(20),
  doc_number: Joi.string().min(6).max(15),
  status: Joi.string().min(3).max(10),
  type: Joi.object({
    type_id: Joi.string().alphanum().hex().length(24),
    customer_type: Joi.string().min(3).max(30),
  }),
})

// Phrases
export const createPhraseSchema = Joi.object({
  content: Joi.string().min(3).max(80).required(),
  status: Joi.string().min(3).max(10),
})

export const updatePhraseSchema = Joi.object({
  content: Joi.string().min(3).max(80),
  status: Joi.string().min(3).max(10),
}).or('content', 'status')

// Card NFC
export const createNfcCardSchema = Joi.object({
  card_code: Joi.string().min(3).max(10).required(),
  balance: Joi.number().min(0).required(),
  status: Joi.string().min(3).max(10),
  // add user by middleware
  user: Joi.object({
    user_id: Joi.string().alphanum().hex().length(24),
    fullname: Joi.string().min(3).max(50).required(),
  }).required(),
  customer: Joi.object({
    fullname: Joi.string().min(3).max(50).required(),
    doc_number: Joi.string().min(6).max(15).required(),
    cell_phone: Joi.number().min(0).required(),
  }).required(),
})

export const updateNfcCardSchema = Joi.object({
  card_code: Joi.string().min(3).max(10),
  balance: Joi.number().min(0),
  status: Joi.string().min(3).max(10),
  // add user by middleware
  user: Joi.object({
    user_id: Joi.string().alphanum().hex().length(24),
    fullname: Joi.string().min(3).max(50),
  }),
  customer: Joi.object({
    fullname: Joi.string().min(3).max(50),
    doc_number: Joi.string().min(6).max(15),
    cell_phone: Joi.number().min(0).required(),
  }),
}).or('card_code', 'balance', 'status', 'user', 'customer')

// Transaction NFC
export const createNfcTransactionSchema = Joi.object({
  customer_type: Joi.string().min(3).max(30).required(),
  amount: Joi.number().min(1).required(),
  card_id: Joi.string().alphanum().hex().length(24).required(),
  method: Joi.object({
    method_id: Joi.string().alphanum().hex().length(24).required(),
    method_name: Joi.string().min(3).max(30).required(),
  }).required(),
})

export const updateNfcTransactionSchema = Joi.object({
  customer_type: Joi.string().min(3).max(30),
  amount: Joi.number().min(1),
  card_id: Joi.string().alphanum().hex().length(24),
  method: Joi.object({
    method_id: Joi.string().alphanum().hex().length(24),
    method_name: Joi.string().min(3).max(30),
  }),
})

// Promotion
export const createPromotionSchema = Joi.object({
  title: Joi.string().min(3).max(30).required(),
  description: Joi.string().min(3).max(150).required(),
  price: Joi.number().min(1).required(),
  line_id: Joi.array().min(1).items(Joi.string().alphanum().hex().length(24)).required(),
  status: Joi.string().min(3).max(10),
})

export const updatePromotionSchema = Joi.object({
  title: Joi.string().min(3).max(30),
  description: Joi.string().min(3).max(150),
  price: Joi.number().min(1),
  line_id: Joi.array().min(1).items(Joi.string().alphanum().hex().length(24)),
  status: Joi.string().min(3).max(10),
}).or('title', 'description', 'price', 'line_id', 'status')

// User
export const createUserSchema = Joi.object({
  fullname: Joi.string().min(3).max(50).required(),
  doc_number: Joi.string().min(6).max(13).required(),
  role_name: Joi.string().min(3).max(10).required(),
  password: Joi.string().min(8).max(30).required(),
  status: Joi.string().min(3).max(10),
  /*email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .required(),*/
})

export const updateUserSchema = Joi.object({
  fullname: Joi.string().min(3).max(50),
  doc_number: Joi.string().min(6).max(13),
  role_name: Joi.string().min(3).max(10),
  password: Joi.string().min(8).max(30),
  status: Joi.string().min(3).max(10),
}).or('fullname', 'doc_number', 'role_name', 'password', 'status')

export const updatePasswordUserSchema = Joi.object({
  password: Joi.string().min(6).max(30).required(),
})

// Price
export const createPriceSchema = Joi.object({
  base_price: Joi.number().min(0.1).required(),
  customer_type: Joi.string().min(3).max(15).required(),
  customer_type_id: Joi.string().alphanum().hex().length(24).required(),
  start_station: Joi.object({
    station_id: Joi.string().alphanum().hex().length(24).required(),
    station_name: Joi.string().min(3).max(50).required(),
  }),
  end_station: Joi.object({
    station_id: Joi.string().alphanum().hex().length(24).required(),
    station_name: Joi.string().min(3).max(50).required(),
  }),
})

export const updatePriceSchema = Joi.object({
  base_price: Joi.number().min(0.1),
  customer_type: Joi.string().min(3).max(15),
  customer_type_id: Joi.string().alphanum().hex().length(24),
  start_station: Joi.object({
    station_id: Joi.string().alphanum().hex().length(24),
    station_name: Joi.string().min(3).max(50),
  }),
  end_station: Joi.object({
    station_id: Joi.string().alphanum().hex().length(24),
    station_name: Joi.string().min(3).max(50),
  }),
}).or('base_price', 'customer_type', 'customer_type_id', 'start_station', 'end_station')

// Ticket
export const createTicketSchema = Joi.object({
  kiosk_code: Joi.string().min(3).max(10).required(),
  total_price: Joi.number().min(0.1).required(),
  payment_method: Joi.object({
    method_name: Joi.string().min(3).max(30).required(),
    method_id: Joi.string().min(3).max(24).required(),
  }).required(),
  prices: Joi.array()
    .min(1)
    .items(
      Joi.object({
        qty: Joi.number().min(1).required(),
        customer_type: Joi.string().min(3).max(15).required(),
        base_price: Joi.number().min(0.1).required(),
      }),
    )
    .required(),
  route: Joi.object({
    start_point: Joi.object({
      start_station: Joi.string().min(3).max(50).required(),
      start_line: Joi.string().min(3).max(30).required(),
    }).required(),
    end_point: Joi.object({
      end_station: Joi.string().min(3).max(50).required(),
      end_line: Joi.string().min(3).max(30).required(),
    }).required(),
    transfer_point: Joi.object({
      is_transfer: Joi.boolean().required(),
      transfer_station: Joi.string().min(3).max(50).required(),
    }).required(),
  }).required(),
  status: Joi.string().min(3).max(15),
})

export const updateTicketSchema = Joi.object({
  promotion_title: Joi.string().min(3).max(30),
  payment_method: Joi.object({
    method_name: Joi.string().min(3).max(30),
    method_id: Joi.string().min(3).max(24),
  }),
  prices: Joi.array()
    .min(1)
    .items(
      Joi.object({
        qty: Joi.number().min(1),
        customer_type: Joi.string().min(3).max(15),
        base_price: Joi.number().min(1),
      }),
    ),
  route: Joi.object({
    start_point: Joi.object({
      start_station: Joi.string().min(3).max(50),
      start_line: Joi.string().min(3).max(30),
    }),
    end_point: Joi.object({
      end_station: Joi.string().min(3).max(50),
      end_line: Joi.string().min(3).max(30),
    }),
    transfer_point: Joi.object({
      is_transfer: Joi.boolean(),
      transfer_station: Joi.string().min(3).max(50),
    }),
  }),
  status: Joi.string().min(3).max(15),
}).or('promotion_title', 'payment_method', 'prices', 'route', 'status')

// Cash
export const generateCashSchema = Joi.object({
  amount: Joi.number().min(0.1).required(),
})

// Wallet
export const createWalletSchema = Joi.object({
  code: Joi.string().alphanum().hex().length(24),
  price: Joi.number().min(0.0).required(),
  currency: Joi.string().min(2).max(3).required(),
  amount_paid: Joi.number().min(0.0),
  cash_back: Joi.number().min(0.0),
  payment_methods: Joi.string().min(3).max(15),
  created_on: Joi.string(),
  status: Joi.string().min(3).max(15),
  summary: Joi.string().min(0).max(50),
})

export const updateWalletSchema = Joi.object({
  status: Joi.string().min(3).max(15).required(),
  summary: Joi.string().min(0).max(50),
}).or('status', 'summary')
