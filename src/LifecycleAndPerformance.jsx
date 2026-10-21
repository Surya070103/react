import React, { useState, useEffect, useCallback } from "react";

// ============================================
// 26-30. COMPONENT LIFECYCLE & PERFORMANCE
// ============================================

// 27. useEffect for LIFECYCLE (Modern approach)
function LifecycleDemo() {
    const [count, setCount] = useState(0);
    const [message, setMessage] = useState("Component Mounted");

    // Runs after every render (Mount + Update)
    useEffect(() => {
        console.log("Component mounted or updated");
    });

    // Runs only on mount
    useEffect(() => {
        console.log("Component mounted only once");
        setMessage("Component is now active!");
    }, []);

    // Runs when count changes
    useEffect(() => {
        console.log("Count changed to:", count);
    }, [count]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            console.log("Component will unmount");
        };
    }, []);

    return (
        <div style={{ border: "1px solid #ddd", padding: "15px", margin: "10px 0" }}>
            <h3>Component Lifecycle (useEffect)</h3>
            <p>{message}</p>
            <p>Count: <strong>{count}</strong></p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <p style={{ fontSize: "12px", color: "blue" }}>
                Open console to see lifecycle logs
            </p>
        </div>
    );
}

// 28. React.memo - Prevent re-renders
const MemoizedChild = React.memo(({ name, onButtonClick }) => {
    console.log(`MemoizedChild rendered with: ${name}`);
    return (
        <div style={{ border: "1px solid green", padding: "10px", margin: "5px 0" }}>
            <p>Child: {name}</p>
            <button onClick={() => onButtonClick("from child")}>Click Child</button>
        </div>
    );
});

function PerformanceOptimization() {
    const [parentCount, setParentCount] = useState(0);
    const [childName, setChildName] = useState("Initial");

    // useCallback memoizes the function
    const handleChildClick = useCallback((message) => {
        console.log("Child sent:", message);
    }, []);

    return (
        <div style={{ border: "1px solid #ddd", padding: "15px", margin: "10px 0" }}>
            <h3>Performance Optimization (React.memo)</h3>
            <p>Parent Count: <strong>{parentCount}</strong></p>
            <button onClick={() => setParentCount(parentCount + 1)}>
                Increment Parent
            </button>
            <button onClick={() => setChildName("Changed!")}>
                Change Child Name
            </button>
            <MemoizedChild name={childName} onButtonClick={handleChildClick} />
            <p style={{ fontSize: "12px", color: "blue" }}>
                Open console to see when child re-renders
            </p>
        </div>
    );
}

// ============================================
// 8. PROP DRILLING - The Problem
// ============================================
function Level3Child({ userData }) {
    return (
        <div style={{ border: "1px solid purple", padding: "10px", margin: "5px 0" }}>
            <p>Level 3 - User: {userData.name} ({userData.email})</p>
        </div>
    );
}

function Level2Middle({ userData }) {
    return (
        <div style={{ border: "1px solid orange", padding: "10px", margin: "5px 0" }}>
            <p>Level 2 - Passing data down</p>
            <Level3Child userData={userData} />
        </div>
    );
}

function PropDrillingDemo() {
    const [userData] = useState({
        name: "Ravi",
        email: "ravi@example.com",
    });

    return (
        <div style={{ border: "1px solid #ddd", padding: "15px", margin: "10px 0" }}>
            <h3>Prop Drilling Problem</h3>
            <p>
                Data flows from App → Level1 → Level2 → Level3 (even if Level2 doesn't
                need it)
            </p>
            <Level2Middle userData={userData} />
        </div>
    );
}

// ============================================
// 29. RENDERING - Modern approach
// ============================================
function RenderingDemo() {
    const [items] = useState([
        { id: 1, name: "Apple" },
        { id: 2, name: "Banana" },
        { id: 3, name: "Orange" },
    ]);

    return (
        <div style={{ border: "1px solid #ddd", padding: "15px", margin: "10px 0" }}>
            <h3>Rendering Lists</h3>
            <ul>
                {items.map((item) => (
                    <li key={item.id}>{item.name}</li>
                ))}
            </ul>
            <p style={{ fontSize: "12px", color: "green" }}>
                ✓ Always use key prop when rendering lists
            </p>
        </div>
    );
}

// ============================================
// 30. VIRTUAL DOM - Internal React Concept
// ============================================
function VirtualDOMDemo() {
    const [count, setCount] = useState(0);

    return (
        <div style={{ border: "1px solid #ddd", padding: "15px", margin: "10px 0" }}>
            <h3>Virtual DOM</h3>
            <p>Count: <strong>{count}</strong></p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <p style={{ fontSize: "12px", color: "blue" }}>
                React compares Virtual DOMs and updates only changed parts efficiently
            </p>
        </div>
    );
}

export {
    LifecycleDemo,
    PerformanceOptimization,
    PropDrillingDemo,
    RenderingDemo,
    VirtualDOMDemo,
};
