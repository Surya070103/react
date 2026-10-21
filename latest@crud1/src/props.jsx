function student(props) {

    return (
        <div>
            <h1>{props.name}</h1>
            <p>{props.age}</p>
        </div>
    );
}

function app() {
    return <student name="rahul" age={18} />
}