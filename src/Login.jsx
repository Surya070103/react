import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();

    const handleLogin = () => {
        // Login logic here
        navigate("/carrier");
    };

    return (
        <div>
            <h1>Login</h1>
            <Button onClick={handleLogin}>Login</Button>
        </div>
    );
}

export default Login;