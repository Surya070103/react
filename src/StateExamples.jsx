import { useState } from "react";

// ============================================
// 9. STATE & 10. useState HOOK
// ============================================
function Counter() {
    const [count, setCount] = useState(0);

    return (
        <div style={{ border: "1px solid #ddd", padding: "15px", margin: "10px 0" }}>
            <h3>Counter - Basic useState</h3>
            <p>Count: <strong>{count}</strong></p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <button onClick={() => setCount(count - 1)}>Decrement</button>
        </div>
    );
}

// ============================================
// 11. MULTIPLE STATE VALUES
// ============================================
function FormExample() {
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [email, setEmail] = useState("");

    return (
        <div style={{ border: "1px solid #ddd", padding: "15px", margin: "10px 0" }}>
            <h3>Multiple State Values</h3>
            <div>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div>
                <input
                    type="number"
                    placeholder="Age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                />
            </div>
            <div>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <p>Name: {name}</p>
            <p>Age: {age}</p>
            <p>Email: {email}</p>
        </div>
    );
}

// ============================================
// 13. UPDATING STATE FROM PREVIOUS STATE
// ============================================
function SafeCounter() {
    const [count, setCount] = useState(0);

    const handleIncrement = () => {
        // Safe way - using previous value
        setCount((prev) => prev + 1);
    };

    const handleIncrementBy = (amount) => {
        setCount((prev) => prev + amount);
    };

    return (
        <div style={{ border: "1px solid #ddd", padding: "15px", margin: "10px 0" }}>
            <h3>Update State from Previous State</h3>
            <p>Count: <strong>{count}</strong></p>
            <button onClick={handleIncrement}>Add 1</button>
            <button onClick={() => handleIncrementBy(5)}>Add 5</button>
            <button onClick={() => handleIncrementBy(10)}>Add 10</button>
        </div>
    );
}

// ============================================
// 14. STATE WITH OBJECTS
// ============================================
function UserProfile() {
    const [user, setUser] = useState({
        name: "Ravi",
        age: 25,
        city: "Mumbai",
    });

    const updateName = () => {
        // Copy the object first, then update
        setUser({ ...user, name: "Priya" });
    };

    const updateAge = () => {
        setUser({ ...user, age: 26 });
    };

    const updateCity = () => {
        setUser({ ...user, city: "Delhi" });
    };

    return (
        <div style={{ border: "1px solid #ddd", padding: "15px", margin: "10px 0" }}>
            <h3>State with Objects</h3>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Age:</strong> {user.age}</p>
            <p><strong>City:</strong> {user.city}</p>
            <button onClick={updateName}>Change Name</button>
            <button onClick={updateAge}>Change Age</button>
            <button onClick={updateCity}>Change City</button>
        </div>
    );
}

// ============================================
// 22. EVENTS + STATE TOGETHER
// ============================================
function Toggle() {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div style={{ border: "1px solid #ddd", padding: "15px", margin: "10px 0" }}>
            <h3>Events + State</h3>
            <button onClick={() => setIsVisible(!isVisible)}>
                {isVisible ? "Hide" : "Show"} Message
            </button>
            {isVisible && <p style={{ color: "green" }}>Hidden message revealed!</p>}
        </div>
    );
}

export {
    Counter,
    FormExample,
    SafeCounter,
    UserProfile,
    Toggle,
};
