import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autentikasi pengguna (Email/Password, Google OAuth, dan Pemulihan Kata Sandi)
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

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Mendapatkan URL redirect OAuth Google dari Supabase Auth
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [msme, eo]
 *           default: msme
 *         description: Peran default jika user baru pertama kali mendaftar lewat Google
 *     responses:
 *       200:
 *         description: URL OAuth Google berhasil dibuat
 *       400:
 *         description: Gagal membuat URL OAuth
 */
router.get('/google', AuthController.googleAuthUrl);

/**
 * @swagger
 * /auth/google/callback:
 *   post:
 *     summary: Sinkronisasi sesi Google OAuth dan pembuatan profil otomatis
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - access_token
 *             properties:
 *               access_token:
 *                 type: string
 *               refresh_token:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [msme, eo]
 *                 default: msme
 *     responses:
 *       200:
 *         description: Login Google berhasil dan profil tersinkronisasi
 *       401:
 *         description: Token Google tidak valid
 */
router.post('/google/callback', AuthController.googleCallback);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Mengirimkan email konfirmasi pemulihan kata sandi
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: umkm@temulapak.id
 *     responses:
 *       200:
 *         description: Email konfirmasi pemulihan kata sandi terkirim
 *       400:
 *         description: Email kosong atau tidak valid
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * @swagger
 * /auth/verify-recovery:
 *   post:
 *     summary: Memverifikasi token konfirmasi email sebelum mengatur ulang kata sandi
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token_hash:
 *                 type: string
 *               access_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token konfirmasi valid
 *       401:
 *         description: Token konfirmasi tidak valid atau kedaluwarsa
 */
router.post('/verify-recovery', AuthController.verifyRecovery);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Menyimpan kata sandi baru setelah verifikasi email recovery
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - access_token
 *               - new_password
 *             properties:
 *               access_token:
 *                 type: string
 *               new_password:
 *                 type: string
 *                 format: password
 *                 example: PasswordBaru123!
 *     responses:
 *       200:
 *         description: Kata sandi berhasil diperbarui
 *       400:
 *         description: Input tidak valid
 *       401:
 *         description: Sesi pemulihan tidak valid atau kedaluwarsa
 */
router.post('/reset-password', AuthController.resetPassword);

export default router;