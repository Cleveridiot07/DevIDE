import React, { useState, useEffect } from "react";
import socket from "../../utils/socket";

function FileTree({ node, name, depth = 0, path, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const isFolder = typeof node === "object" && node !== null;

  const getIcon = () => {
    if (!isFolder) return "📄";
    return isOpen ? "📂" : "📁";
  }

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer`}
        style={{ paddingLeft: `${depth * 16}px` }}
        onClick={isFolder ? toggleOpen : () => onSelect(path)} // Ensure we handle file clicks properly
      >
        <span className="mr-2">{getIcon()}</span>
        <span className="text-sm">{name}</span>
      </div>
      {isFolder && isOpen && (
        <div>
          {Object.entries(node).map(([childName, childNode]) => (
            <FileTree
              key={childName}
              node={childNode}
              name={childName}
              path={`${path}/${childName}`} // Propagate the full path for child nodes
              depth={depth + 1}
              onSelect={onSelect} // Ensure the onSelect prop is passed down
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTreeComponent({ onSelect }) {
  const [fileTree, setFileTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFileTree = async () => {
    try {
      const response = await fetch("http://localhost:8000/files"); // Replace with your API endpoint
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setFileTree(data.tree);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFileTree();
  }, []);

  useEffect(() => {
    socket.on("file:refresh", fetchFileTree);

    return () => {
      socket.off("file:refresh", fetchFileTree);
    };
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">File Explorer</h2>
        {fileTree ? (
          <FileTree path="" onSelect={onSelect} node={fileTree} name="root" />
        ) : (
          <div>No data available</div>
        )}
      </div>
    </div>
  );
}
