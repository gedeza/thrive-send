"use client";

import React from "react";

export default function NewProjectPage({ params }: { params: { id: string } }) {
  // Handler placeholder for future implementation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission (API call)
    alert("Project creation logic will go here.");
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow rounded space-y-6">
      <h1 className="text-2xl font-bold mb-4">
        Create New Project for Client ID: {params.id}
      </h1>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Project Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter project name"
            disabled
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            disabled
          >
            <option value="">Select status</option>
            <option value="PLANNED">Planned</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Describe the project"
            disabled
          />
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            className="px-4 py-2 bg-gray-400 text-white font-semibold rounded cursor-not-allowed"
            disabled
          >
            Create Project (Coming Soon)
          </button>
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          <strong>Note:</strong> This is a placeholder. Form fields are disabled. Enable and connect to your backend/API when ready.
        </p>
      </form>
    </div>
  );
}