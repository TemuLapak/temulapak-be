import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autentikasi pengguna (Register dan Login via Supabase Auth)
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrasi akun baru dan buat profil awal
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: umkm@temulapak.id
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Rahasia123!
 *               name:
 *                 type: string
 *                 example: Hanifatul Nadiva
 *               phone:
 *                 type: string
 *                 example: "081234567890"
 *               role:
 *                 type: string
 *                 enum: [admin, msme, eo]
 *                 default: msme
 *     responses:
 *       201:
 *         description: Registrasi berhasil
 *       400:
 *         description: Validasi input atau error Supabase Auth
 */
router.post('/register', AuthController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login untuk mendapatkan access_token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: umkm@temulapak.id
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Rahasia123!
 *     responses:
 *       200:
 *         description: Login berhasil dan mengembalikan access_token
 *       400:
 *         description: Email atau password kosong
 *       401:
 *         description: Email atau password salah
 */
router.post('/login', AuthController.login);

export default router;