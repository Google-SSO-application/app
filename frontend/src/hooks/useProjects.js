import { useCallback, useEffect, useState } from "react";
import { project } from "../api/index.js";

export function useProjects(signedIn, target, setTarget) {
  const [projects, setProjects] = useState([]);

  const refreshProjects = useCallback(async () => {
    if (!signedIn) return;
    try {
      const response = await project.getProjects();
      if (response.ok) {
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Could not fetch projects list", error);
    }
  }, [signedIn]);

  useEffect(() => {
    if (projects.length > 0 && !target) setTarget(projects[0].name);
  }, [projects, target, setTarget]);

  return { projects, refreshProjects };
}
