import React, { useState } from "react";
import { useLogin, useRegister } from "../lib/hooks.ts";
import { Eye, EyeOff } from "lucide-react";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLogin) {
      loginMutation.mutate({
        email: formData.email,
        password: formData.password,
      });
    } else {
      if (formData.password !== formData.confirmPassword) return;
      registerMutation.mutate({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phone,
        email: formData.email,
        password: formData.password,
      });
    }
  };

  const passwordsMatch =
    formData.confirmPassword === "" ||
    formData.password === formData.confirmPassword;

  const isPending = loginMutation.isPending || registerMutation.isPending;
  const errorMessage =
    loginMutation.error?.message || registerMutation.error?.message;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#38618c] mb-1">BitChest</h1>
          <h2 className="text-xl font-semibold text-gray-700">
            {isLogin ? "Login" : "Create Your Account"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name & Phone — register only */}
          {!isLogin && (
            <div className="flex gap-3">
              <Field label="First Name">
                <input
                  type="text"
                  name="firstName"
                  placeholder="John"
                  className="input input-bordered w-full text-sm"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </Field>
              <Field label="Last Name">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  className="input input-bordered w-full text-sm"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </Field>
            </div>
          )}

          {!isLogin && (
            <Field label="Phone Number">
              <input
                type="tel"
                name="phone"
                placeholder="+33 6 00 00 00 00"
                className="input input-bordered w-full text-sm"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </Field>
          )}

          {/* Email */}
          <Field label="Email Address">
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              className="input input-bordered w-full text-sm"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Field>

          {/* Password */}
          <Field label="Password">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                className="input input-bordered w-full pr-10 text-sm"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <Eye /> : <EyeOff />}
              </button>
            </div>
          </Field>

          {/* Confirm Password */}
          {!isLogin && (
            <Field label="Confirm Password">
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                className={`input input-bordered w-full text-sm ${!passwordsMatch ? "input-error" : ""}`}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {!passwordsMatch && (
                <span className="text-xs text-[#ff5964] mt-1 block">
                  Passwords do not match.
                </span>
              )}
            </Field>
          )}

          {/* Error */}
          {errorMessage && (
            <p className="text-[#ff5964] text-xs text-center font-medium">
              {errorMessage}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="btn w-full mt-4 bg-[#35a7ff] hover:bg-blue-400 text-white border-none disabled:bg-gray-300"
          >
            {isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500 space-y-2">
          {isLogin ? (
            <>
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-[#35a7ff] hover:underline font-semibold"
                >
                  Sign up
                </button>
              </p>
              <p>
                <button type="button" className="hover:underline">
                  Forgot password?
                </button>
              </p>
            </>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="text-[#35a7ff] hover:underline font-semibold"
              >
                Log In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helper component ─────────────────────────────────────────────────────────
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="form-control w-full">
      <label className="label pt-0 pb-1">
        <span className="label-text text-xs font-semibold text-gray-500">
          {label}
        </span>
      </label>
      {children}
    </div>
  );
}
