// components/AuthModal.tsx — Login/Register modal popup over landing page
import { useState, useEffect } from "react";
import pionterestLogo from "../assets/Pionterest.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, X } from "lucide-react";
import { loginSchema, registerSchema } from "shared/validators";
import type { LoginInput, RegisterInput } from "shared/validators";
import { useAuthStore } from "../stores/auth.store";
import { ApiError } from "../services/api";
import toast from "react-hot-toast";

interface AuthModalProps {
  mode: "login" | "register";
  onClose: () => void;
  onSwitchMode: (mode: "login" | "register") => void;
}

export function AuthModal({ mode, onClose, onSwitchMode }: AuthModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register: registerUser } = useAuthStore();

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="auth-modal-overlay" onClick={onClose} id="auth-modal-overlay">
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        id="auth-modal-card"
      >
        {/* Close button */}
        <button
          className="auth-modal-close"
          onClick={onClose}
          aria-label="Close"
          id="auth-modal-close"
        >
          <X size={24} />
        </button>

        {mode === "login" ? (
          <LoginForm
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            login={login}
            onSwitchMode={onSwitchMode}
          />
        ) : (
          <RegisterForm
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            registerUser={registerUser}
            onSwitchMode={onSwitchMode}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Login Form ────────────────────────────────────────────────────── */
interface LoginFormProps {
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
  login: (data: LoginInput) => Promise<void>;
  onSwitchMode: (mode: "login" | "register") => void;
}

function LoginForm({
  showPassword,
  setShowPassword,
  isSubmitting,
  setIsSubmitting,
  login,
  onSwitchMode,
}: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsSubmitting(true);
      await login(data);
      toast.success("Login berhasil! 🎉");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Terjadi kesalahan, coba lagi nanti");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="logo-section">
        <img src={pionterestLogo} alt="Pionterest" style={{ width: "45px", height: "45px", marginBottom: "8px", objectFit: "contain" }} />
        <h1 style={{ fontSize: "32px", fontWeight: 600, letterSpacing: "-1.2px", marginBottom: "22px" }}>Welcome to Pionterest</h1>
      </div>

      <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} id="login-form">
          <div className="form-group">
            <label htmlFor="login-email" className="input-label" style={{ fontSize: "14px", fontWeight: "normal", marginBottom: "4px", color: "var(--color-text-primary)" }}>Email</label>
            <input
              id="login-email"
              type="email"
              className={`input-field ${errors.email ? "error" : ""}`}
              placeholder="Email"
              autoComplete="email"
              autoFocus
              {...register("email")}
            />
            {errors.email && <span className="input-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="input-label" style={{ fontSize: "14px", fontWeight: "normal", marginBottom: "4px", color: "var(--color-text-primary)" }}>Password</label>
            <div className="password-field">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className={`input-field ${errors.password ? "error" : ""}`}
                placeholder="Password"
                autoComplete="current-password"
                {...register("password")}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <span className="input-error">{errors.password.message}</span>}
          </div>

          <div style={{ textAlign: "left", marginTop: "8px", marginBottom: "16px" }}>
            <a href="#" className="auth-link-btn" style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>Forgot your password?</a>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            id="login-submit-btn"
            disabled={isSubmitting}
            style={{ padding: "12px 16px", fontSize: "16px", borderRadius: "24px" }}
          >
            {isSubmitting ? (
              <>
                <div className="spinner" style={{ width: 20, height: 20, borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                Logging in...
              </>
            ) : (
              "Log in"
            )}
          </button>

          <div className="auth-divider">OR</div>

          <button type="button" className="btn-google" onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/auth/google`}>
            <svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: "32px", color: "var(--color-text-primary)", fontWeight: "normal" }}>
          Not on Pionterest yet?{" "}
          <button type="button" className="auth-link-btn" onClick={() => onSwitchMode("register")} style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>
            Sign up
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Register Form ─────────────────────────────────────────────────── */
interface RegisterFormProps {
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
  registerUser: (data: RegisterInput) => Promise<void>;
  onSwitchMode: (mode: "login" | "register") => void;
}

function RegisterForm({
  showPassword,
  setShowPassword,
  isSubmitting,
  setIsSubmitting,
  registerUser,
  onSwitchMode,
}: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", username: "", password: "" },
  });

  const handleGoogleAuth = () => {
    const typedUsername = watch("username");
    let url = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/auth/google`;
    if (typedUsername) {
      url += `?u=${encodeURIComponent(typedUsername)}`;
    }
    window.location.href = url;
  };

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsSubmitting(true);
      await registerUser(data);
      toast.success("Registrasi berhasil! 🎉");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="logo-section">
        <img src={pionterestLogo} alt="Pionterest" style={{ width: "45px", height: "45px", marginBottom: "8px", objectFit: "contain" }} />
        <h1 style={{ fontSize: "32px", fontWeight: 600, letterSpacing: "-1.2px", marginBottom: "2px" }}>Welcome to Pionterest</h1>
        <p className="subtitle" style={{ color: "var(--color-text-primary)", width: "270px", margin: "0 auto 22px" }}>Find new ideas to try</p>
      </div>

      <div style={{ width: "100%", maxWidth: "268px", margin: "0 auto" }}>
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} id="register-form">
          <div className="form-group">
            <label htmlFor="reg-email" className="input-label" style={{ fontSize: "14px", fontWeight: "normal", marginBottom: "4px", color: "var(--color-text-primary)" }}>Email</label>
            <input
              id="reg-email"
              type="email"
              className={`input-field ${errors.email ? "error" : ""}`}
              placeholder="Email"
              autoFocus
              {...register("email")}
            />
            {errors.email && <span className="input-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-username" className="input-label" style={{ fontSize: "14px", fontWeight: "normal", marginBottom: "4px", color: "var(--color-text-primary)" }}>Username</label>
            <input
              id="reg-username"
              type="text"
              className={`input-field ${errors.username ? "error" : ""}`}
              placeholder="Choose a username"
              {...register("username")}
            />
            {errors.username && <span className="input-error">{errors.username.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-password" className="input-label" style={{ fontSize: "14px", fontWeight: "normal", marginBottom: "4px", color: "var(--color-text-primary)" }}>Password</label>
            <div className="password-field">
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                className={`input-field ${errors.password ? "error" : ""}`}
                placeholder="Create a password"
                {...register("password")}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <span className="input-hint" style={{ marginTop: "8px" }}>Use 8 or more letters, numbers and symbols</span>
            {errors.password && <span className="input-error">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            id="register-submit-btn"
            disabled={isSubmitting}
            style={{ padding: "12px 16px", fontSize: "16px", borderRadius: "24px", marginTop: "4px" }}
          >
            {isSubmitting ? "Creating account..." : "Continue"}
          </button>

          <div className="auth-divider">OR</div>

        <button type="button" className="btn-google" onClick={handleGoogleAuth}>
          <svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
        </form>

        <p className="auth-modal-legal" style={{ marginTop: "16px", marginBottom: "8px" }}>
          By continuing, you agree to Pionterest's <a href="#">Terms of Service</a> and acknowledge you've read our <a href="#">Privacy Policy</a>. <a href="#">Notice at collection</a>.
        </p>

        <div className="auth-footer" style={{ marginTop: "16px", color: "var(--color-text-primary)", fontWeight: "normal" }}>
          Already a member?{" "}
          <button type="button" className="auth-link-btn" onClick={() => onSwitchMode("login")} style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>
            Log in
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Inline Sign Up Form (for bottom CTA section) ──────────────────── */
export function InlineSignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register: registerUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", username: "", password: "" },
  });

  const handleGoogleAuth = () => {
    const typedUsername = watch("username");
    let url = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/auth/google`;
    if (typedUsername) {
      url += `?u=${encodeURIComponent(typedUsername)}`;
    }
    window.location.href = url;
  };

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsSubmitting(true);
      await registerUser(data);
      toast.success("Registrasi berhasil! 🎉");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="inline-signup-card" id="inline-signup-form">
      <div className="logo-section">
        <img src={pionterestLogo} alt="Pionterest" style={{ width: "45px", height: "45px", marginBottom: "8px", objectFit: "contain" }} />
        <h2 style={{ fontSize: "24px", fontWeight: 700 }}>Welcome to Pionterest</h2>
        <p className="subtitle">Find new ideas to try</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="inline-email" className="input-label">Email</label>
          <input
            id="inline-email"
            type="email"
            className={`input-field ${errors.email ? "error" : ""}`}
            placeholder="Email"
            {...register("email")}
          />
          {errors.email && <span className="input-error">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="inline-username" className="input-label">Username</label>
          <input
            id="inline-username"
            type="text"
            className={`input-field ${errors.username ? "error" : ""}`}
            placeholder="Choose a username"
            {...register("username")}
          />
          {errors.username && <span className="input-error">{errors.username.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="inline-password" className="input-label">Password</label>
          <div className="password-field">
            <input
              id="inline-password"
              type={showPassword ? "text" : "password"}
              className={`input-field ${errors.password ? "error" : ""}`}
              placeholder="Create a password"
              {...register("password")}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <span className="input-hint">Use 8 or more letters, numbers and symbols</span>
          {errors.password && <span className="input-error">{errors.password.message}</span>}
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Continue"}
        </button>

        <div className="auth-divider">OR</div>

        <button type="button" className="btn-google" onClick={handleGoogleAuth}>
          <svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
      </form>

      <p className="auth-modal-legal">
        By continuing, you agree to Pionterest's <a href="#">Terms of Service</a> and acknowledge you've read our <a href="#">Privacy Policy</a>.
      </p>
    </div>
  );
}
