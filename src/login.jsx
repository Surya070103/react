import { useState } from "react";
import { Button, Input, Alert } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:4000";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Login failed");
            }

            const userResponse = await fetch(`${API_URL}/users/${data.user.id}`);
            const userData = await userResponse.json();
            if (!userResponse.ok) {
                throw new Error(userData.error || "Could not load user details");
            }
            onLogin({ ...userData, token: data.token });
            navigate("/");

        } catch (error) {
            setError(error.message || "Unable to connect to the server");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="login-page">
            <section className="login-panel" aria-labelledby="login-title">
                <header className="login-heading">
                    <h1 id="login-title">Login</h1>
                    <p>Welcome back! Please sign in to continue.</p>
                </header>

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="login-field">
                        <label htmlFor="login-email">Email address</label>
                        <Input
                            id="login-email"
                            type="email"
                            autoComplete="username"
                            prefix={<MailOutlined aria-hidden="true" />}
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="login-password">Password</label>
                        <Input.Password
                            id="login-password"
                            autoComplete="current-password"
                            prefix={<LockOutlined aria-hidden="true" />}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {error && (
                        <Alert
                            className="login-error"
                            type="error"
                            showIcon
                            title="Login failed"
                            description={error}
                        />
                    )}

                    <Button
                        className="login-submit"
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                    >
                        Login
                    </Button>
                </form>
            </section>
        </main>
    );
}

export default Login;