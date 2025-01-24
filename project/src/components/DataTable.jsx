import React, { useState } from 'react';
import { Trash2, AlertCircle } from 'lucide-react';

export function DataTable({ data, onDeleteRow }) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Handle empty data case
  if (!data || data.length === 0) {
    return (
      <div className="w-full p-8 mt-6 text-center border border-gray-200 rounded-lg bg-gray-50">
        <AlertCircle className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
        <p className="mt-1 text-sm text-gray-500">
          Upload an Excel file to see the data here.
        </p>
      </div>
    );
  }

  // Calculate pagination
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data.slice(startIndex, endIndex);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  // Reset to first page if current page becomes invalid due to data changes
  if (currentPage > totalPages) {
    setCurrentPage(1);
  }

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this row?')) {
      onDeleteRow(index);
    }
  };

  return (
    <div className="w-full mt-6">
      {/* Data summary */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table header */}
          <thead className="bg-gray-50">
            <tr>
              {Object.keys(data[0] || {}).map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                >
                  {header}
                </th>
              ))}
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          {/* Table body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                className="transition-colors hover:bg-gray-50"
              >
                {Object.values(row).map((value, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap"
                  >
                    {value}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(startIndex + rowIndex)}
                    className="p-1 text-red-600 transition-colors rounded-full hover:text-red-800 hover:bg-red-50"
                    title="Delete row"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 mt-4">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}