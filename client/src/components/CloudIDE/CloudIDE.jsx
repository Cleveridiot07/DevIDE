import React, { useCallback, useEffect, useState } from "react";
import FileTreeComponent from "../FileTree/FileTree";
import Terminal from "../Terminal/Terminal";
import Editor from "../Editor/Editor";
import socket from "../../utils/socket";

// Main Cloud IDE Component
export default function CloudIDE() {
  const [selectedFilePath, setSelectedFilePath] = useState("");
  const [selectedFileContent, setSelectedFileContent] = useState("");
  const [code, setCode] = useState("");

  const isSaved = selectedFileContent === code;

  // Save file after 3 seconds of inactivity
  useEffect(() => {
    if (code && !isSaved) {
      const timer = setTimeout(() => {
        socket.emit("file:change", {
          path: selectedFilePath,
          content: code,
        });
        console.log("saved");
      }, 3000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [code, selectedFilePath, isSaved]);

  // Fetch file content based on selected file path
  const getFileContent = useCallback(async () => {
    if (!selectedFilePath) return;
    try {
      const response = await fetch(
        `http://localhost:8000/files/content?path=${selectedFilePath}`
      );
      const result = await response.json();
      setSelectedFileContent(result.content); // Set file content state
    } catch (error) {
      console.log(error);
    }
  }, [selectedFilePath]);

  // Call getFileContent whenever selectedFilePath changes
  useEffect(() => {
    if (selectedFilePath) {
      getFileContent();
    }
  }, [selectedFilePath, getFileContent]);

  // Set the editor code when file content changes
  useEffect(() => {
    if (selectedFilePath && selectedFileContent) {
      setCode(selectedFileContent);
    }
  }, [selectedFilePath, selectedFileContent]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold">Cloud IDE</h1>
      </header>

      {/* Main content area */}
      <div className="flex-grow flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <FileTreeComponent
            onSelect={(path) => {
              setSelectedFilePath(path); // Update selectedFilePath with the chosen file's path
              // console.log("Selected file path:", path); // Log the path to the console
            }}
          />
        </aside>

        {/* Code editor */}
        <main className="flex-grow overflow-hidden flex flex-col">
          <div className="flex-grow p-4 overflow-auto">
            {/* Display the selected file path above the editor */}
            <div className="mb-2 text-sm text-gray-600">
              Selected File: {selectedFilePath || "None"}
            </div>
            <Editor value={code} onChange={(e) => setCode(e)} />
          </div>

          {/* Terminal */}
          <div className="h-1/3 border-t border-gray-200 bg-black text-white p-4 font-mono text-sm overflow-auto">
            <Terminal />
          </div>
        </main>
      </div>
    </div>
  );
}
