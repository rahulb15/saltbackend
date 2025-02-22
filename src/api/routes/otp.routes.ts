
// routes/otp.routes.ts
import { Router } from 'express';
import otpController from '../controllers/otp.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/otp/send:
 *   post:
 *     summary: Send OTP to phone number
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/send', otpController.sendOTP);

/**
 * @swagger
 * /api/v1/otp/verify:
 *   post:
 *     summary: Verify OTP
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *               otp:
 *                 type: string
 *                 description: OTP to verify
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 *       500:
 *         description: Server error
 */
router.post('/verify', otpController.verifyOTP);

export default router;