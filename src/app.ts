// import express from 'express';
// import morgan from 'morgan';
// import helmet from 'helmet';
// import cors, { CorsOptions } from 'cors';
// import * as middlewares from './middlewares/response-handler.middleware';
// import api from './api';
// import swaggerUI from "swagger-ui-express";
// import swaggerJsDoc from "swagger-jsdoc";
// import {options} from "./swagger";


// require('dotenv').config();

// const app = express();

// const allowedOrigins = [
//   'http://localhost:3005',
//   'http://localhost:3006',
//   'https://admin.saltstayz.in',
//   'https://saltstayz.in',
// ];

// const corsOptions: CorsOptions = {
//   origin: (origin, callback) => {
//     if (allowedOrigins.indexOf(origin || '') !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true // Add this if you're using credentials
// };

// app.use(morgan('dev'));
// app.use(helmet());
// app.use(cors(corsOptions));

// // Add proper body parsing middleware
// app.use(express.json({ limit: '50mb' })); // For JSON payloads
// app.use(express.urlencoded({ extended: true, limit: '50mb' })); // For form data

// // Swagger Configuration
// const specs= swaggerJsDoc(options);
// app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));

// // Add request logging middleware for debugging
// app.use((req, res, next) => {
//   console.log('Request Body:', req.body);
//   console.log('Content-Type:', req.headers['content-type']);
//   next();
// });

// // Routes
// app.use('/api/v1', api);

// app.use(middlewares.notFound);
// app.use(middlewares.errorHandler);

// export default app;


import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import * as middlewares from './middlewares/response-handler.middleware';
import api from './api';
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import { options } from "./swagger";

require('dotenv').config();

const app = express();

const allowedOrigins = [
  'http://localhost:3005',
  'http://localhost:3006',
  'https://admin.saltstayz.in',
  'https://saltstayz.in',
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin || '') !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

// Enable CORS
app.use(cors(corsOptions));

// Logging middleware
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Swagger Configuration
const specs = swaggerJsDoc(options);
app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));

// Response headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  
  // Log request details
  console.log('Request Body:', req.body);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Origin:', req.headers.origin);
  
  // Log response headers (after response is sent)
  const originalSend = res.send;
  res.send = function(body) {
    console.log('Response Headers:', res.getHeaders());
    return originalSend.call(this, body);
  };
  
  next();
});

// API routes
app.use('/api/v1', api);

// Error handling
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;