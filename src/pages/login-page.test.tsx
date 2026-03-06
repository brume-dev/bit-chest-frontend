import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "./login-page";

// Mock all external dependencies for unit testing

// Mock navigation hook
const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
	// Mock useNavigate hook
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
	// Mock Logo component
	Logo: () => <div data-testid="logo">Logo</div>,
}));

vi.mock("../components/form-field", () => ({
	// Mock Field form component
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

// Mock login mutation hook with test state
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
	// Mock useLogin hook
	useLogin: () => mockLoginMutation,
}));

// Test suite for LoginPage component
describe("LoginPage", () => {
	// Reset mocks before each test
	beforeEach(() => {
		// Clear mock function calls and reset state
		vi.clearAllMocks();
		mockLoginMutation.isPending = false;
		mockLoginMutation.error = null;
	});

	// Test login form renders all elements
	it("renders the login form", () => {
		render(<LoginPage />);

		expect(screen.getByTestId("logo")).toBeInTheDocument();
		expect(screen.getByText("Login")).toBeInTheDocument();
		expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
		expect(screen.getByLabelText("Password")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
	});

	// Test sign up link displays and routes correctly
	it("renders the sign up link", () => {
		render(<LoginPage />);

		const signUpLink = screen.getByRole("link", { name: "Sign up" });
		expect(signUpLink).toBeInTheDocument();
		expect(signUpLink).toHaveAttribute("href", "/register");
	});

	// Test forgot password button exists
	it("renders the forgot password button", () => {
		render(<LoginPage />);

		expect(
			screen.getByRole("button", { name: "Forgot password?" }),
		).toBeInTheDocument();
	});

	// Test password visibility toggle works
	it("toggles password visibility when eye button is clicked", async () => {
		const user = userEvent.setup();
		render(<LoginPage />);

		// Assert password type before toggling
		const passwordInput = screen.getByLabelText("Password");
		expect(passwordInput).toHaveAttribute("type", "password");

		const toggleButton = screen.getByRole("button", {
			name: /toggle password/i,
		});
		// Toggle to text and verify
		await user.click(toggleButton);
		expect(passwordInput).toHaveAttribute("type", "text");

		// Toggle back to password
		await user.click(toggleButton);
		expect(passwordInput).toHaveAttribute("type", "password");
	});

	// Test form submission calls login mutation
	it("calls loginMutation.mutate with form data on submit", async () => {
		const user = userEvent.setup();
		render(<LoginPage />);

		// Fill form with test credentials
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

	// Test successful login navigates to home
	it("navigates to '/' on successful login", async () => {
		// Mock mutate to trigger onSuccess callback
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

	// Test error message displays on login failure
	it("displays error message when login fails", () => {
		// Set error state and verify display
		mockLoginMutation.error = { message: "Invalid credentials" };

		render(<LoginPage />);

		expect(screen.getByTestId("error-message")).toBeInTheDocument();
		expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
	});

	// Test submit button disabled while loading
	it("disables the submit button while login is pending", () => {
		mockLoginMutation.isPending = true;

		render(<LoginPage />);

		const submitButton = document.querySelector('button[type="submit"]')!;
		expect(submitButton).toBeDisabled();
	});

	// Test loading spinner displays during login
	it("shows a loading spinner when login is pending", () => {
		// Set pending state and verify spinner visible
		mockLoginMutation.isPending = true;

		render(<LoginPage />);

		// Verify button text replaced by spinner
		expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
		expect(document.querySelector(".loading-spinner")).toBeInTheDocument();
	});

	// Test error message hidden when no error
	it("does not show error message when there is no error", () => {
		render(<LoginPage />);

		expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
	});
});
