import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import bodyParser from 'body-parser';
import * as middlewares from './middlewares/response-handler.middleware';
import api from './api';
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import {options} from "./swagger";

require('dotenv').config();

const app = express();

// ================== CORS CONFIGURATION ==================
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
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

// ================== MIDDLEWARE ORDERING ==================
app.use(morgan('dev'));
app.set('trust proxy', 1);  // Trust first proxy (NGINX)

// Security headers
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

// Body parsing (using body-parser)
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// ================== SWAGGER DOCS ==================
const specs = swaggerJsDoc(options);
app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));

// ================== REQUEST LOGGING ==================
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Request Body:', req.body);
  next();
});

// ================== ROUTES ==================
app.use('/api/v1', api);

// ================== ERROR HANDLERS ==================
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;