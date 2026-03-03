import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Field } from "../components/form-field.tsx";
import { Logo } from "../components/logo.tsx";
import { useRegister } from "../lib/hooks.ts";
import type { RegisterRequest } from "../types.ts";

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegister();

  function registerAction(formData: FormData) {
    const data: RegisterRequest = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phoneNumber: formData.get("phone") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };
    registerMutation.mutate(data, {
      onSuccess: () => {
        navigate("/");
      },
    });
  }

  const isPending = registerMutation.isPending;
  const errorMessage = registerMutation.error?.message;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8">
        <div className="flex justify-center items-center flex-col">
          <Logo />
          <h2 className="text-xl font-semibold text-neutral mb-6">Create Your Account</h2>
        </div>

        <form action={registerAction} className="space-y-4">
          <div className="flex gap-3">
            <Field label="First Name" id="firstName">
              <input
                id="firstName"
                type="text"
                name="firstName"
                placeholder="John"
                className="input input-bordered w-full text-sm"
                required
              />
            </Field>
            <Field label="Last Name" id="lastName">
              <input
                id="lastName"
                type="text"
                name="lastName"
                placeholder="Doe"
                className="input input-bordered w-full text-sm"
                required
              />
            </Field>
          </div>

          <Field label="Phone Number" id="phone">
            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="+33 6 00 00 00 00"
              className="input input-bordered w-full text-sm"
              required
            />
          </Field>

          <Field label="Email Address" id="email">
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              className="input input-bordered w-full text-sm"
              required
            />
          </Field>

          <Field label="Password" id="password">
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                className="input input-bordered w-full pr-10 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-neutral/40 hover:text-secondary"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </Field>

          {errorMessage && <p className="text-error text-xs text-center font-medium">{errorMessage}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="btn btn-secondary w-full mt-4 text-white border-none disabled:bg-neutral/30"
          >
            {isPending ? <span className="loading loading-spinner loading-sm" /> : "Sign Up"}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-neutral/50">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="text-secondary hover:text-primary font-semibold">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
