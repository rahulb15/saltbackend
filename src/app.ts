import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as middlewares from './middlewares/response-handler.middleware';
import api from './api';
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import {options} from "./swagger";

require('dotenv').config();

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3005',
  'http://localhost:3006',
  'https://admin.saltstayz.in',
  'https://saltstayz.in',
  'https://api.saltstayz.in'
];

const corsOptions = {
  origin: function(origin:any, callback:any) {
    console.log('Request origin:', origin); // For debugging
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

// Middleware setup
app.use(morgan('dev'));
app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));

app.use(cors(corsOptions));

// Body parsing
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Swagger setup
const specs = swaggerJsDoc(options);
app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Request Body:', req.body);
  next();
});

// Routes
app.use('/api/v1', api);

// Error handlers
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;