import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  const [template, setTemplate] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/atlas.html")
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load Atlas template (${response.status})`);
        return response.text();
      })
      .then((html) => {
        if (!active) return;
        const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html;
        setTemplate(body);
      })
      .catch((error) => {
        if (active) setTemplate(`<p class="frontend-error">${error.message}</p>`);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!template) return undefined;
    const script = document.createElement("script");
    script.src = "/support.js";
    script.async = false;
    document.body.appendChild(script);
    return () => script.remove();
  }, [template]);

  return <div id="atlas-template" dangerouslySetInnerHTML={{ __html: template }} />;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);
