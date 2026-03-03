import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Logo } from "../components/logo";
import { useLogin } from "../lib/hooks";

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  function loginAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          navigate("/");
        },
      },
    );
  }

  const isPending = loginMutation.isPending;
  const errorMessage = loginMutation.error?.message;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8">
        <div className="flex justify-center items-center flex-col">
          <Logo />
          <h2 className="text-xl font-semibold text-neutral mb-6">Login</h2>
        </div>

        <form action={loginAction} className="space-y-4">
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
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </Field>

          {errorMessage && <p className="text-error text-xs text-center font-medium">{errorMessage}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="btn btn-secondary w-full mt-4 text-white border-none disabled:bg-gray-300"
          >
            {isPending ? <span className="loading loading-spinner loading-sm" /> : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500 space-y-2">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="text-secondary hover:underline font-semibold">
              Sign up
            </Link>
          </p>
          <p>
            <button type="button" className="hover:underline">
              Forgot password?
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Helper component ─────────────────────────────────────────────────────────
function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="form-control w-full">
      <label htmlFor={id} className="label pt-0 pb-1">
        <span className="label-text text-xs font-semibold text-gray-500">{label}</span>
      </label>
      {children}
    </div>
  );
}
