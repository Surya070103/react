import { useState } from "react";

function Task() {
    const [selectedFile, setSelectedFile] = useState("");
    const [content, setContent] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const files = [
        "file.txt",
        "file1.txt",
        "file2.txt",
        "file3.txt",
        "file4.txt"
    ];

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            setError("Please select a file.");
            setContent("");
            return;
        }

        setLoading(true);
        setError("");
        setContent("");

        try {
            const response = await fetch(
                `http://localhost:3001/file?name=${encodeURIComponent(selectedFile)}`
            );

            const data = await response.text();
            if (!response.ok) {
                throw new Error(data || "Unable to load file.");
            }
            setContent(data);
        } catch (error) {
            setError(error.message || "Unable to load file.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="file-reader">
            <h1>File Read</h1>

            <form className="file-reader__form" onSubmit={handleSubmit}>
                <label htmlFor="file-select">Choose a file</label>
                <div className="file-reader__controls">
                    <select
                        id="file-select"
                        value={selectedFile}
                        onChange={(e) => setSelectedFile(e.target.value)}
                    >
                        <option value="">Select a file</option>

                        {files.map((file) => (
                            <option key={file} value={file}>
                                {file}
                            </option>
                        ))}
                    </select>

                    <button type="submit" disabled={loading}>
                        {loading ? "Loading..." : "Submit"}
                    </button>
                </div>
            </form>

            <h2>File Content</h2>

            {error ? (
                <p className="file-reader__error" role="alert">{error}</p>
            ) : (
                <pre className="file-reader__content" aria-live="polite">
                    {loading ? "Loading file..." : content || "Select a file and submit to view its contents."}
                </pre>
            )}
        </section>
    );
}

export default Task;