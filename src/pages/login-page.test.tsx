import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "./login-page";

// --- Mock dependencies ---

const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
	useNavigate: () => mockNavigate,
	Link: ({
		to,
		children,
		className,
	}: {
		to: string;
		children: React.ReactNode;
		className?: string;
	}) => (
		<a href={to} className={className}>
			{children}
		</a>
	),
}));

vi.mock("../components/logo", () => ({
	Logo: () => <div data-testid="logo">Logo</div>,
}));

vi.mock("../components/form-field", () => ({
	Field: ({
		label,
		id,
		children,
	}: {
		label: string;
		id: string;
		children: React.ReactNode;
	}) => (
		<div>
			<label htmlFor={id}>{label}</label>
			{children}
		</div>
	),
}));

const mockMutate = vi.fn();
const mockLoginMutation: {
	mutate: ReturnType<typeof vi.fn>;
	isPending: boolean;
	error: { message: string } | null;
} = {
	mutate: mockMutate,
	isPending: false,
	error: null,
};

vi.mock("../lib/hooks", () => ({
	useLogin: () => mockLoginMutation,
}));

// --- Tests ---

describe("LoginPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLoginMutation.isPending = false;
		mockLoginMutation.error = null;
	});

	it("renders the login form", () => {
		render(<LoginPage />);

		expect(screen.getByTestId("logo")).toBeInTheDocument();
		expect(screen.getByText("Login")).toBeInTheDocument();
		expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
		expect(screen.getByLabelText("Password")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
	});

	it("renders the sign up link", () => {
		render(<LoginPage />);

		const signUpLink = screen.getByRole("link", { name: "Sign up" });
		expect(signUpLink).toBeInTheDocument();
		expect(signUpLink).toHaveAttribute("href", "/register");
	});

	it("renders the forgot password button", () => {
		render(<LoginPage />);

		expect(
			screen.getByRole("button", { name: "Forgot password?" }),
		).toBeInTheDocument();
	});

	it("toggles password visibility when eye button is clicked", async () => {
		const user = userEvent.setup();
		render(<LoginPage />);

		const passwordInput = screen.getByLabelText("Password");
		expect(passwordInput).toHaveAttribute("type", "password");

		const toggleButton = screen.getByRole("button", {
			name: /toggle password/i,
		});
		await user.click(toggleButton);
		expect(passwordInput).toHaveAttribute("type", "text");

		await user.click(toggleButton);
		expect(passwordInput).toHaveAttribute("type", "password");
	});

	it("calls loginMutation.mutate with form data on submit", async () => {
		const user = userEvent.setup();
		render(<LoginPage />);

		await user.type(screen.getByLabelText("Email Address"), "user@example.com");
		await user.type(screen.getByLabelText("Password"), "secret123");

		fireEvent.submit(
			screen.getByRole("button", { name: "Sign In" }).closest("form")!,
		);

		await waitFor(() => {
			expect(mockMutate).toHaveBeenCalledWith(
				{ email: "user@example.com", password: "secret123" },
				expect.objectContaining({ onSuccess: expect.any(Function) }),
			);
		});
	});

	it("navigates to '/' on successful login", async () => {
		mockMutate.mockImplementation(
			(_data: unknown, options: { onSuccess: () => void }) => {
				options.onSuccess();
			},
		);

		render(<LoginPage />);

		fireEvent.submit(
			screen.getByRole("button", { name: "Sign In" }).closest("form")!,
		);

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith("/");
		});
	});

	it("displays error message when login fails", () => {
		mockLoginMutation.error = { message: "Invalid credentials" };

		render(<LoginPage />);

		expect(screen.getByTestId("error-message")).toBeInTheDocument();
		expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
	});

	it("disables the submit button while login is pending", () => {
		mockLoginMutation.isPending = true;

		render(<LoginPage />);

		const submitButton = document.querySelector('button[type="submit"]')!;
		expect(submitButton).toBeDisabled();
	});

	it("shows a loading spinner when login is pending", () => {
		mockLoginMutation.isPending = true;

		render(<LoginPage />);

		expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
		expect(document.querySelector(".loading-spinner")).toBeInTheDocument();
	});

	it("does not show error message when there is no error", () => {
		render(<LoginPage />);

		expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
	});
});
