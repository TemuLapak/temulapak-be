import { supabase, supabaseAuth } from '../config/supabase.js';
import { ProfileModel } from '../models/profileModel.js';
import { sendSuccess } from '../utils/responHelper.js';
import { createHttpError } from '../utils/httpError.js';
import { ROLES, ROLE_VALUES } from '../utils/enum.js';
import {
  AUTH_CONFIG,
  buildFrontendRedirectUrl,
} from '../config/authConfig.js';

function resolveGoogleDisplayName(authUser) {
  const meta = authUser?.user_metadata ?? {};
  if (typeof meta.full_name === 'string' && meta.full_name.trim()) {
    return meta.full_name.trim();
  }
  if (typeof meta.name === 'string' && meta.name.trim()) {
    return meta.name.trim();
  }
  if (typeof authUser?.email === 'string' && authUser.email.includes('@')) {
    return authUser.email.split('@')[0];
  }
  return 'Pengguna TemuLapak';
}

export const AuthController = {
  async register(req, res, next) {
    try {
      const { email, password, name, phone, role } = req.body;

      if (!email || !password || !name) {
        throw createHttpError(400, 'email, password, dan name wajib diisi');
      }

      if (password.length < AUTH_CONFIG.MIN_PASSWORD_LENGTH) {
        throw createHttpError(
          400,
          `Password minimal ${AUTH_CONFIG.MIN_PASSWORD_LENGTH} karakter`
        );
      }

      const selectedRole = role || ROLES.MSME;
      if (!ROLE_VALUES.includes(selectedRole)) {
        throw createHttpError(400, 'Role tidak valid');
      }

      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          phone: phone || null,
          role: selectedRole,
        },
      });

      if (error) {
        throw createHttpError(400, error.message);
      }

      if (data?.user?.id) {
        await ProfileModel.upsert({
          id: data.user.id,
          name,
          phone: phone || null,
          role: selectedRole,
        });
      }

      return sendSuccess(res, {
        statusCode: 201,
        message: 'Registrasi berhasil',
        data: { user: data.user },
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw createHttpError(400, 'email dan password wajib diisi');
      }

      const { data, error } = await supabaseAuth.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw createHttpError(401, error.message);
      }

      const profile = data.user?.id
        ? await ProfileModel.findOptionalById(data.user.id)
        : null;

      return sendSuccess(res, {
        message: 'Login berhasil',
        data: {
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
          user: data.user,
          profile,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async googleAuthUrl(req, res, next) {
    try {
      const requestedRole = req.query.role;
      const validRole =
        typeof requestedRole === 'string' && ROLE_VALUES.includes(requestedRole)
          ? requestedRole
          : ROLES.MSME;

      const callbackBase = buildFrontendRedirectUrl(
        AUTH_CONFIG.REDIRECT_PATHS.GOOGLE_CALLBACK
      );
      const redirectTo = `${callbackBase}?role=${encodeURIComponent(validRole)}`;

      const { data, error } = await supabaseAuth.auth.signInWithOAuth({
        provider: AUTH_CONFIG.OAUTH_PROVIDER_GOOGLE,
        options: {
          redirectTo,
          queryParams: {
            access_type: AUTH_CONFIG.OAUTH_ACCESS_TYPE,
            prompt: AUTH_CONFIG.OAUTH_PROMPT,
          },
        },
      });

      if (error || !data?.url) {
        throw createHttpError(
          400,
          error?.message || 'Gagal membuat tautan autentikasi Google'
        );
      }

      return sendSuccess(res, {
        message: 'URL autentikasi Google berhasil dibuat',
        data: {
          url: data.url,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async googleCallback(req, res, next) {
    try {
      const { access_token, refresh_token, role } = req.body;

      if (!access_token) {
        throw createHttpError(400, 'access_token wajib diisi');
      }

      const { data: authData, error: authError } = await supabase.auth.getUser(
        access_token
      );

      if (authError || !authData?.user) {
        throw createHttpError(401, 'Token Google tidak valid atau kedaluwarsa');
      }

      const authUser = authData.user;
      let profile = await ProfileModel.findOptionalById(authUser.id);

      if (!profile) {
        const selectedRole =
          typeof role === 'string' && ROLE_VALUES.includes(role)
            ? role
            : ROLES.MSME;
        const resolvedName = resolveGoogleDisplayName(authUser);

        profile = await ProfileModel.upsert({
          id: authUser.id,
          name: resolvedName,
          phone: authUser.phone || null,
          role: selectedRole,
        });
      }

      return sendSuccess(res, {
        message: 'Login Google berhasil',
        data: {
          access_token,
          refresh_token: refresh_token || null,
          user: authUser,
          profile,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        throw createHttpError(400, 'email wajib diisi');
      }

      const redirectTo = buildFrontendRedirectUrl(
        AUTH_CONFIG.REDIRECT_PATHS.RESET_PASSWORD
      );

      const { error } = await supabaseAuth.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo }
      );

      if (error) {
        throw createHttpError(400, error.message);
      }

      return sendSuccess(res, {
        message:
          'Email konfirmasi pemulihan kata sandi telah dikirim. Silakan cek kotak masuk Anda.',
      });
    } catch (err) {
      next(err);
    }
  },

  async verifyRecovery(req, res, next) {
    try {
      const { token_hash, access_token } = req.body;

      if (!token_hash && !access_token) {
        throw createHttpError(
          400,
          'token_hash atau access_token konfirmasi wajib diisi'
        );
      }

      if (token_hash) {
        const { data, error } = await supabaseAuth.auth.verifyOtp({
          token_hash,
          type: AUTH_CONFIG.RECOVERY_OTP_TYPE,
        });

        if (error || !data?.session?.access_token) {
          throw createHttpError(
            401,
            error?.message ||
              'Tautan konfirmasi email tidak valid atau kedaluwarsa'
          );
        }

        return sendSuccess(res, {
          message: 'Konfirmasi email berhasil diverifikasi',
          data: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user: data.user,
          },
        });
      }

      const { data: userData, error: userError } = await supabase.auth.getUser(
        access_token
      );

      if (userError || !userData?.user) {
        throw createHttpError(
          401,
          'Tautan konfirmasi email tidak valid atau kedaluwarsa'
        );
      }

      return sendSuccess(res, {
        message: 'Konfirmasi email berhasil diverifikasi',
        data: {
          access_token,
          user: userData.user,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { access_token, new_password } = req.body;

      if (!access_token || !new_password) {
        throw createHttpError(
          400,
          'access_token dan new_password wajib diisi'
        );
      }

      if (new_password.length < AUTH_CONFIG.MIN_PASSWORD_LENGTH) {
        throw createHttpError(
          400,
          `Password baru minimal ${AUTH_CONFIG.MIN_PASSWORD_LENGTH} karakter`
        );
      }

      const { data: userData, error: userError } = await supabase.auth.getUser(
        access_token
      );

      if (userError || !userData?.user?.id) {
        throw createHttpError(
          401,
          'Sesi pemulihan tidak valid atau sudah kedaluwarsa'
        );
      }

      const { error: updateError } =
        await supabase.auth.admin.updateUserById(userData.user.id, {
          password: new_password,
        });

      if (updateError) {
        throw createHttpError(400, updateError.message);
      }

      return sendSuccess(res, {
        message: 'Kata sandi berhasil diperbarui',
      });
    } catch (err) {
      next(err);
    }
  },
};