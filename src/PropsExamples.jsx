// ============================================
// 1. PROPS BASICS
// ============================================

// Basic Props - Function receives props object
function Welcome(props) {
    return <h2>Hello, {props.name}!</h2>;
}

// 2. PROPS WITH DESTRUCTURING
function Welcome2({ name }) {
    return <h2>Hello, {name}!</h2>;
}

// ============================================
// 3. MULTIPLE PROPS
// ============================================
function UserCard({ name, age, email }) {
    return (
        <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Age:</strong> {age}</p>
            <p><strong>Email:</strong> {email}</p>
        </div>
    );
}

// ============================================
// 4. TYPES OF PROPS - Different Data Types
// ============================================
function TypesOfProps({
    stringProp,
    numberProp,
    booleanProp,
    arrayProp,
    objectProp,
    functionProp,
    componentProp: ComponentProp,
}) {
    return (
        <div style={{ border: "2px solid blue", padding: "15px", margin: "10px 0" }}>
            <h3>Types of Props</h3>
            <p><strong>String:</strong> {stringProp}</p>
            <p><strong>Number:</strong> {numberProp}</p>
            <p><strong>Boolean:</strong> {booleanProp ? "True" : "False"}</p>
            <p><strong>Array:</strong> {arrayProp.join(", ")}</p>
            <p><strong>Object:</strong> {JSON.stringify(objectProp)}</p>
            <button onClick={() => functionProp("Button clicked!")}>Click to Call Function</button>
            <div><strong>Component:</strong> <ComponentProp /></div>
        </div>
    );
}

// Helper component to pass as prop
function ChildComponent() {
    return <span style={{ color: "green" }}>I'm a component prop!</span>;
}

// ============================================
// 5. FUNCTIONS AS PROPS
// ============================================
function Button({ label, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: "10px 20px",
                fontSize: "16px",
                cursor: "pointer",
                margin: "5px",
            }}
        >
            {label}
        </button>
    );
}

// ============================================
// 6. DEFAULT PROPS
// ============================================
function Greeting({ name = "Guest", greeting = "Welcome" }) {
    return <h2>{greeting}, {name}!</h2>;
}

// ============================================
// 7. PROPS VS STATE COMPARISON
// ============================================
function PropsVsStateDemo({ propMessage }) {
    return (
        <div style={{ border: "2px solid purple", padding: "15px", margin: "10px 0" }}>
            <h3>Props vs State</h3>
            <p><strong>Props (from parent):</strong> {propMessage}</p>
            <p><em>Props are read-only and come from parent components</em></p>
        </div>
    );
}

// Export all for use in examples
export {
    Welcome,
    Welcome2,
    UserCard,
    TypesOfProps,
    Button,
    Greeting,
    PropsVsStateDemo,
    ChildComponent,
};
