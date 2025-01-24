import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { DataTable } from './components/DataTable';
import { Modal } from './components/Modal';
import { read, utils } from 'xlsx';

function App() {
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    errors: [],
  });
  const [isUploading, setIsUploading] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  const validateRow = (row) => {
    const errors = [];
    const currentDate = new Date();
    const rowDate = new Date(row.Date);

    if (!row.Name || !row.Amount || !row.Date) {
      errors.push({ row: -1, description: 'Name, Amount, and Date are mandatory' });
    }

    if (rowDate.getMonth() !== currentDate.getMonth() || rowDate.getFullYear() !== currentDate.getFullYear()) {
      errors.push({ row: -1, description: 'Date must be within the current month' });
    }

    if (typeof row.Amount === 'number' && row.Amount <= 0) {
      errors.push({ row: -1, description: 'Amount must be greater than zero' });
    }

    return errors;
  };

  const handleFileSelect = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = read(data, { type: 'array' });

        const processedSheets = workbook.SheetNames.map((name) => {
          const worksheet = workbook.Sheets[name];
          const jsonData = utils.sheet_to_json(worksheet);
          
          const sheetErrors = [];
          jsonData.forEach((row, index) => {
            const rowErrors = validateRow(row);
            if (rowErrors.length > 0) {
              sheetErrors.push(...rowErrors.map(error => ({ ...error, row: index + 1 })));
            }
          });

          return {
            name,
            data: jsonData,
            errors: sheetErrors,
          };
        });

        setSheets(processedSheets);
        setSelectedSheet(0);

        const hasErrors = processedSheets.some(sheet => sheet.errors.length > 0);
        if (hasErrors) {
          setErrorModal({
            isOpen: true,
            errors: processedSheets[0].errors,
          });
        }
      } catch (error) {
        console.error('Error processing file:', error);
        alert('Error processing file. Please ensure it\'s a valid Excel file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDeleteRow = (index) => {
    setSheets(prevSheets => {
      const newSheets = [...prevSheets];
      newSheets[selectedSheet] = {
        ...newSheets[selectedSheet],
        data: newSheets[selectedSheet].data.filter((_, i) => i !== index),
      };
      return newSheets;
    });
  };

  const handleImport = async () => {
    if (!sheets[selectedSheet]?.data.length) return;

    setIsUploading(true);
    try {
      const response = await fetch('http://localhost:3000/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: sheets[selectedSheet].data,
          sheetName: sheets[selectedSheet].name,
        }),
      });

      const result = await response.json();
      setImportStatus({
        success: response.ok,
        message: result.message,
        importedCount: result.importedCount,
        skippedCount: result.skippedCount,
      });
    } catch (error) {
      setImportStatus({
        success: false,
        message: error.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Excel Data Importer</h1>

        {sheets.length === 0 ? (
          <FileUpload onFileSelect={handleFileSelect} />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <select
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(Number(e.target.value))}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {sheets.map((sheet, index) => (
                  <option key={index} value={index}>
                    {sheet.name}
                  </option>
                ))}
              </select>

              <div className="flex gap-4">
                <button
                  onClick={handleImport}
                  disabled={isUploading || sheets[selectedSheet]?.errors.length > 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUploading ? 'Importing...' : 'Import Data'}
                </button>

                <button
                  onClick={() => setSheets([])}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Upload Another File
                </button>
              </div>
            </div>

            {importStatus && (
              <div className={`rounded-md p-4 ${importStatus.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={`text-sm ${importStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                  {importStatus.message}
                  {importStatus.success && (
                    <span className="block mt-1">
                      Imported: {importStatus.importedCount} rows
                      {importStatus.skippedCount > 0 && `, Skipped: ${importStatus.skippedCount} rows`}
                    </span>
                  )}
                </p>
              </div>
            )}

            <DataTable
              data={sheets[selectedSheet].data}
              onDeleteRow={handleDeleteRow}
            />
          </div>
        )}

        <Modal
          isOpen={errorModal.isOpen}
          onClose={() => setErrorModal({ isOpen: false, errors: [] })}
        >
          <div>
            <h2 className="mb-4 text-xl font-semibold text-red-600">Validation Errors</h2>
            <div className="overflow-y-auto max-h-96">
              {errorModal.errors.map((error, index) => (
                <div key={index} className="p-3 mb-2 rounded-md bg-red-50">
                  <p className="text-sm text-red-800">
                    Row {error.row}: {error.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default App;