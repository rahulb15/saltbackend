import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import * as middlewares from './middlewares/response-handler.middleware';
import api from './api';
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import {options} from "./swagger";

require('dotenv').config();

const app = express();

const allowedOrigins = [
  'http://localhost:3005',
  'http://localhost:3006',
  'https://admin.saltstayz.in',
  'https://saltstayz.in',
  'http://165.227.124.224:5001',
  'https://165.227.124.224:5001'
];

// Enhanced debugging middleware
app.use((req, res, next) => {
  console.log('Incoming Request:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    host: req.headers.host,
    'user-agent': req.headers['user-agent']
  });
  next();
});

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    console.log('Request origin:', origin); // Debug log
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Origin not allowed:', origin); // Debug log
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Helmet configuration
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" },
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Request logging
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Pre-route middleware to handle OPTIONS requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Max-Age', '86400');
    return res.status(200).send();
  }
  next();
});

// Request body logging middleware
app.use((req, res, next) => {
  if (req.body && Object.keys(req.body).length) {
    console.log('Request Body:', {
      path: req.path,
      method: req.method,
      body: req.body,
      contentType: req.headers['content-type']
    });
  }
  next();
});

// Swagger Configuration
const specs = swaggerJsDoc(options);
app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));

// Routes
app.use('/api/v1', api);

// Error handling
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

// Global error handler
app.use((err:any, req:any, res:any, next:any) => {
  console.error('Global error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500
    }
  });
});

export default app;