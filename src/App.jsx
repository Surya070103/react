import { useState } from "react";
import "./App.css";

// Import all example components
import {
  Welcome,
  Welcome2,
  UserCard,
  TypesOfProps,
  Button,
  Greeting,
  PropsVsStateDemo,
  ChildComponent,
} from "./PropsExamples";

import {
  Counter,
  FormExample,
  SafeCounter,
  UserProfile,
  Toggle,
} from "./StateExamples";

import {
  SimpleClick,
  InlineEvent,
  EventObjectDemo,
  InputEvent,
  ParametersDemo,
  FormSubmitDemo,
  FunctionReferenceDemo,
  EventBubblingDemo,
  KeyboardEventsDemo,
} from "./EventsExamples";

import {
  LifecycleDemo,
  PerformanceOptimization,
  PropDrillingDemo,
  RenderingDemo,
  VirtualDOMDemo,
} from "./LifecycleAndPerformance";

function App() {
  const [activeSection, setActiveSection] = useState("props");

  const handleFunctionProp = (message) => {
    alert(message);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>🚀 React.js Hands-On Code Examples</h1>
      <p style={{ color: "#666" }}>
        Interactive examples for Props, State, Events, Lifecycle, and Performance
      </p>

      {/* Navigation */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        {[
          { id: "props", label: "Props" },
          { id: "state", label: "State" },
          { id: "events", label: "Events" },
          { id: "lifecycle", label: "Lifecycle & Performance" },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            style={{
              padding: "10px 20px",
              backgroundColor:
                activeSection === section.id ? "#007bff" : "#ddd",
              color: activeSection === section.id ? "white" : "black",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* PROPS SECTION */}
      {activeSection === "props" && (
        <div>
          <h2>📦 Props Section</h2>

          <section style={{ marginBottom: "30px" }}>
            <h3>1. Basic Props</h3>
            <Welcome name="Ravi" />
            <Welcome name="Priya" />
            <code style={{ backgroundColor: "#f5f5f5", padding: "10px", display: "block" }}>
              {`<Welcome name="Ravi" />
<Welcome name="Priya" />`}
            </code>
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h3>2. Props with Destructuring</h3>
            <Welcome2 name="Sarah" />
            <code style={{ backgroundColor: "#f5f5f5", padding: "10px", display: "block" }}>
              {`function Welcome2({ name }) {
  return <h2>Hello, {name}!</h2>;
}`}
            </code>
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h3>3. Multiple Props</h3>
            <UserCard name="Ravi" age={25} email="ravi@example.com" />
            <UserCard name="Priya" age={23} email="priya@example.com" />
            <code style={{ backgroundColor: "#f5f5f5", padding: "10px", display: "block" }}>
              {`<UserCard name="Ravi" age={25} email="ravi@example.com" />`}
            </code>
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h3>4. Types of Props</h3>
            <TypesOfProps
              stringProp="I'm a string"
              numberProp={42}
              booleanProp={true}
              arrayProp={["React", "JavaScript", "Web Dev"]}
              objectProp={{ city: "Mumbai", country: "India" }}
              functionProp={handleFunctionProp}
              componentProp={ChildComponent}
            />
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h3>5. Functions as Props</h3>
            <Button
              label="Click Me"
              onClick={() => alert("Button clicked!")}
            />
            <Button
              label="Say Hello"
              onClick={() => alert("Hello there!")}
            />
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h3>6. Default Props</h3>
            <Greeting name="Ravi" greeting="Welcome" />
            <Greeting name="Sarah" />
            <Greeting />
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h3>7. Props vs State</h3>
            <PropsVsStateDemo propMessage="Props come from parent" />
          </section>
        </div>
      )}

      {/* STATE SECTION */}
      {activeSection === "state" && (
        <div>
          <h2>⚙️ State Section</h2>

          <section style={{ marginBottom: "30px" }}>
            <h3>9 & 10. useState Hook - Basic Counter</h3>
            <Counter />
            <code style={{ backgroundColor: "#f5f5f5", padding: "10px", display: "block" }}>
              {`const [count, setCount] = useState(0);
<button onClick={() => setCount(count + 1)}>Increment</button>`}
            </code>
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h3>11. Multiple State Values</h3>
            <FormExample />
            <code style={{ backgroundColor: "#f5f5f5", padding: "10px", display: "block" }}>
              {`const [name, setName] = useState("");
const [age, setAge] = useState("");
const [email, setEmail] = useState("");`}
            </code>
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h3>13. Updating State from Previous State</h3>
            <SafeCounter />
            <code style={{ backgroundColor: "#f5f5f5", padding: "10px", display: "block" }}>
              {`setCount(prev => prev + 1);  // Safe way
setCount(prev => prev + amount);  // With parameters`}
            </code>
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h3>14. State with Objects</h3>
            <UserProfile />
            <code style={{ backgroundColor: "#f5f5f5", padding: "10px", display: "block" }}>
              {`setUser({ ...user, name: "Priya" });  // Copy object first`}
            </code>
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h3>22. Events + State Together</h3>
            <Toggle />
          </section>
        </div>
      )}

      {/* EVENTS SECTION */}
      {activeSection === "events" && (
        <div>
          <h2>🎯 Events Section</h2>

          <section style={{ marginBottom: "30px" }}>
            <h3>16. Event Handlers</h3>
            <SimpleClick />
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h3>17. Inline Event Handlers</h3>
            <InlineEvent />
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h3>18. Event Object</h3>
            <EventObjectDemo />
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h3>19. Input Events & onChange</h3>
            <InputEvent />
            <code style={{ backgroundColor: "#f5f5f5", padding: "10px", display: "block" }}>
              {`onChange={(e) => setInputValue(e.target.value)}`}
            </code>
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h3>20. Passing Parameters to Events</h3>
            <ParametersDemo />
            <code style={{ backgroundColor: "#f5f5f5", padding: "10px", display: "block" }}>
              {`<button onClick={() => handleClick(5)}>Pass 5</button>`}
            </code>
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h3>21. Preventing Default Behavior</h3>
            <FormSubmitDemo />
            <code style={{ backgroundColor: "#f5f5f5", padding: "10px", display: "block" }}>
              {`const handleSubmit = (e) => {
  e.preventDefault();  // Stop default form reload
}`}
            </code>
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h3>23. Function Reference vs Function Call</h3>
            <FunctionReferenceDemo />
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h3>24. Event Bubbling & stopPropagation</h3>
            <EventBubblingDemo />
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h3>Keyboard Events</h3>
            <KeyboardEventsDemo />
          </section>
        </div>
      )}

      {/* LIFECYCLE & PERFORMANCE SECTION */}
      {activeSection === "lifecycle" && (
        <div>
          <h2>♻️ Lifecycle & Performance Section</h2>

          <section style={{ marginBottom: "30px" }}>
            <h3>27. Component Lifecycle (useEffect)</h3>
            <LifecycleDemo />
            <code style={{ backgroundColor: "#f5f5f5", padding: "10px", display: "block" }}>
              {`// Runs on mount only
useEffect(() => {
  console.log("Mounted");
}, []);

// Runs when dependencies change
useEffect(() => {
  console.log("Count changed");
}, [count]);`}
            </code>
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h3>28. Performance Optimization (React.memo)</h3>
            <PerformanceOptimization />
            <code style={{ backgroundColor: "#f5f5f5", padding: "10px", display: "block" }}>
              {`export default React.memo(MyComponent);  // Prevent re-renders`}
            </code>
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h3>8. Prop Drilling Problem</h3>
            <PropDrillingDemo />
            <p style={{ color: "#666" }}>
              💡 Solution: Use Context API or state management tools like Redux
            </p>
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h3>29. Rendering Lists</h3>
            <RenderingDemo />
          </section>

          <section style={{ marginBottom: "30px" }}>
            <h3>30. Virtual DOM</h3>
            <VirtualDOMDemo />
          </section>
        </div>
      )}

      <footer style={{ marginTop: "40px", padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "5px" }}>
        <h3>📚 Key Concepts Summary</h3>
        <ul>
          <li><strong>Props:</strong> Parent → Child data (read-only)</li>
          <li><strong>State:</strong> Component's own changing data</li>
          <li><strong>Events:</strong> User interactions (clicks, input, etc.)</li>
          <li><strong>Lifecycle:</strong> Mount → Update → Unmount</li>
          <li><strong>Performance:</strong> React.memo, useCallback, Virtual DOM</li>
          <li><strong>Prop Drilling:</strong> Use Context API to avoid passing props through many layers</li>
        </ul>
      </footer>
    </div>
  );
}

export default App;