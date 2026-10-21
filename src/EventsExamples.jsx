import { useState } from "react";

// ============================================
// 15-25. EVENTS IN REACT
// ============================================

// 16. EVENT HANDLERS
function SimpleClick() {
    const handleClick = () => {
        alert("Button clicked!");
    };

    return (
        <div style={{ border: "1px solid #ddd", padding: "15px", margin: "10px 0" }}>
            <h3>Event Handlers</h3>
            <button onClick={handleClick}>Click Me</button>
        </div>
    );
}

// 17. INLINE EVENT HANDLERS
function InlineEvent() {
    return (
        <div style={{ border: "1px solid #ddd", padding: "15px", margin: "10px 0" }}>
            <h3>Inline Event Handlers</h3>
            <button onClick={() => alert("Inline handler works!")}>
                Inline Click
            </button>
        </div>
    );
}

// 18. EVENT OBJECT
function EventObjectDemo() {
    const handleClick = (e) => {
        console.log("Event object:", e);
        alert(`You clicked on: ${e.target.tagName}`);
    };

    const handleMouseOver = (e) => {
        e.target.style.backgroundColor = "yellow";
    };

    const handleMouseOut = (e) => {
        e.target.style.backgroundColor = "";
    };

    return (
        <div style={{ border: "1px solid #ddd", padding: "15px", margin: "10px 0" }}>
            <h3>Event Object</h3>
            <button onClick={handleClick}>Click to see event object</button>
            <button
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
                style={{ marginLeft: "10px" }}
            >
                Hover Me
            </button>
        </div>
    );
}

// 19. INPUT EVENTS & onChange
function InputEvent() {
    const [inputValue, setInputValue] = useState("");

    const handleChange = (e) => {
        console.log("Input value:", e.target.value);
        setInputValue(e.target.value);
    };

    return (
        <div style={{ border: "1px solid #ddd", padding: "15px", margin: "10px 0" }}>
            <h3>Input Events (onChange)</h3>
            <input
                type="text"
                placeholder="Type something..."
                value={inputValue}
                onChange={handleChange}
            />
            <p>You typed: <strong>{inputValue}</strong></p>
        </div>
    );
}

// 20. PASSING PARAMETERS TO EVENTS
function ParametersDemo() {
    const handleClick = (amount) => {
        alert(`You passed: ${amount}`);
    };

    return (
        <div style={{ border: "1px solid #ddd", padding: "15px", margin: "10px 0" }}>
            <h3>Passing Parameters to Events</h3>
            <button onClick={() => handleClick(5)}>Pass 5</button>
            <button onClick={() => handleClick(10)}>Pass 10</button>
            <button onClick={() => handleClick(100)}>Pass 100</button>
        </div>
    );
}

// 21. PREVENTING DEFAULT BEHAVIOR
function FormSubmitDemo() {
    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Form submitted without page reload!");
    };

    return (
        <div style={{ border: "1px solid #ddd", padding: "15px", margin: "10px 0" }}>
            <h3>Preventing Default Behavior</h3>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Enter name" />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

// 23. FUNCTION REFERENCE VS FUNCTION CALL
function FunctionReferenceDemo() {
    const handleCorrect = () => alert("Correct way!");
    const handleWithParam = (value) => alert(`Value: ${value}`);

    return (
        <div style={{ border: "1px solid #ddd", padding: "15px", margin: "10px 0" }}>
            <h3>Function Reference vs Function Call</h3>
            <button onClick={handleCorrect}>
                Correct: onClick with reference
            </button>
            <button onClick={() => handleWithParam(42)}>
                With params: onClick with arrow function
            </button>
            <p style={{ fontSize: "12px", color: "red" }}>
                ❌ Wrong: onClick has parentheses - calls immediately during render
            </p>
            <p style={{ fontSize: "12px", color: "green" }}>
                ✓ Correct: Pass function reference or arrow function
            </p>
        </div>
    );
}

// 24. EVENT BUBBLING & stopPropagation
function EventBubblingDemo() {
    const [parentClicks, setParentClicks] = useState(0);
    const [childClicks, setChildClicks] = useState(0);

    const handleParentClick = () => {
        setParentClicks((prev) => prev + 1);
    };

    const handleChildClickWithBubble = () => {
        setChildClicks((prev) => prev + 1);
    };

    const handleChildClickNoBubble = (e) => {
        e.stopPropagation();
        setChildClicks((prev) => prev + 1);
    };

    return (
        <div style={{ border: "1px solid #ddd", padding: "15px", margin: "10px 0" }}>
            <h3>Event Bubbling & stopPropagation</h3>

            <div
                onClick={handleParentClick}
                style={{
                    border: "2px solid blue",
                    padding: "20px",
                    marginBottom: "10px",
                }}
            >
                Parent (clicks: {parentClicks})
                <button
                    onClick={handleChildClickWithBubble}
                    style={{ display: "block", marginBottom: "10px" }}
                >
                    Child - Bubbles (child: {childClicks})
                </button>
                <button
                    onClick={handleChildClickNoBubble}
                    style={{ display: "block" }}
                >
                    Child - stopPropagation (child: {childClicks})
                </button>
            </div>
        </div>
    );
}

// KEYBOARD EVENTS
function KeyboardEventsDemo() {
    const [key, setKey] = useState("");

    const handleKeyDown = (e) => {
        setKey(`You pressed: ${e.key}`);
    };

    return (
        <div style={{ border: "1px solid #ddd", padding: "15px", margin: "10px 0" }}>
            <h3>Keyboard Events</h3>
            <input
                type="text"
                placeholder="Press any key..."
                onKeyDown={handleKeyDown}
            />
            <p>{key}</p>
        </div>
    );
}

export {
    SimpleClick,
    InlineEvent,
    EventObjectDemo,
    InputEvent,
    ParametersDemo,
    FormSubmitDemo,
    FunctionReferenceDemo,
    EventBubblingDemo,
    KeyboardEventsDemo,
};
