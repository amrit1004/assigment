import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

function convertExcelDateToString(excelDate) {
  // Excel dates are based on 1900 date system. 1 corresponds to 1900-01-01.
  const jsDate = new Date((excelDate - 25569) * 86400 * 1000); // Convert to JavaScript date
  return format(jsDate, 'dd-MM-yyyy'); // Format the date to dd-mm-yyyy
}

export function FileUpload({ onFileSelect }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size <= 2 * 1024 * 1024) { 
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const firstCell = worksheet['A1'];

          let formattedDate;
          if (firstCell && firstCell.v) {
            if (typeof firstCell.v === 'number') {
              formattedDate = convertExcelDateToString(firstCell.v);
            } else if (typeof firstCell.v === 'string') {
              // If it's already a string, try to parse it
              const parts = firstCell.v.split(/[-/]/);
              if (parts.length === 3) {
                formattedDate = parts.map(p => p.padStart(2, '0')).join('-');
              } else {
                formattedDate = firstCell.v;
              }
            } else {
              formattedDate = String(firstCell.v);
            }
          } else {
            formattedDate = 'Invalid Date';
          }

          onFileSelect(file, formattedDate);
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert('File size must be less than 2MB');
      }
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  return (
    <div
      {...getRootProps()}
      className="relative flex flex-col items-center justify-center h-64 p-6 transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
    >
      <input {...getInputProps()} />
      <Upload className="w-12 h-12 mb-4 text-gray-400" />
      {isDragActive ? (
        <p className="text-lg text-gray-600">Drop the Excel file here...</p>
      ) : (
        <>
          <p className="mb-2 text-lg text-gray-600">
            Drag & drop an Excel file here, or click to select
          </p>
          <p className="text-sm text-gray-500">
            Only .xlsx files up to 2MB are supported
          </p>
        </>
      )}
    </div>
  );
}