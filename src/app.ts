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

// CORS Configuration - MUST BE FIRST
const allowedOrigins = [
    'http://localhost:3005',
    'http://localhost:3006',
    'https://admin.saltstayz.in',
    'https://saltstayz.in',
    'https://api.saltstayz.in'
];

const corsOptions = {
    origin: function(origin: any, callback: any) {
        console.log('Request origin:', origin); // For debugging
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Origin rejected:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['set-cookie'],
    maxAge: 86400 // 24 hours
};

// Important: CORS must be before other middleware
app.use(cors(corsOptions));

// Trust first proxy
app.set('trust proxy', 1);

// Security middleware with modified settings
app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false
}));

// Logging middleware
app.use(morgan('dev'));

// Body parsing middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Swagger documentation setup
const specs = swaggerJsDoc(options);
app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));

// Debug logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);
    next();
});

// API routes
app.use('/api/v1', api);

// Error handling middleware
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
