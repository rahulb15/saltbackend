import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
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
  'http://165.227.124.224:5001'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true
}));

// Less restrictive Helmet configuration
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" },
  contentSecurityPolicy: false
}));

app.use(morgan('dev'));
// app.use(helmet());
// app.use(cors(corsOptions));

// Add proper body parsing middleware
app.use(express.json({ limit: '50mb' })); // For JSON payloads
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // For form data

// Swagger Configuration
const specs= swaggerJsDoc(options);
app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));

// Add request logging middleware for debugging
app.use((req, res, next) => {
  console.log('Request Body:', req.body);
  console.log('Content-Type:', req.headers['content-type']);
  next();
});

// Routes
app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;