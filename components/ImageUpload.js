"use client";
import { useState, useRef } from "react";

export default function ImageUpload({ onUploadSuccess, currentImage }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file.type.startsWith("image/")) {
      alert("Molimo vas otpremite samo slike (JPG, PNG, WebP).");
      return;
    }
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (res.ok) {
        onUploadSuccess(data.url);
      } else {
        alert(data.error || "Greška pri otpremanju slike.");
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Došlo je do greške pri otpremanju fajla.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer relative overflow-hidden flex flex-col items-center justify-center min-h-[160px] ${isDragging ? "border-cyan-500 bg-cyan-500/10" : "border-slate-600 bg-slate-800 hover:bg-slate-700 hover:border-slate-500"}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleChange} 
        accept="image/*" 
        className="hidden" 
      />
      
      {isUploading ? (
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-cyan-500 mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-cyan-400 text-sm font-medium">Otpremanje...</p>
        </div>
      ) : currentImage && currentImage.startsWith('/') ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <img src={currentImage} alt="Uploaded" className="max-h-32 rounded object-contain" />
          <div className="absolute inset-0 bg-slate-900/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity rounded">
             <span className="text-white text-sm font-medium px-3 py-1 bg-black/50 rounded-full">Klikni za izmenu</span>
          </div>
        </div>
      ) : (
        <>
          <svg className="w-10 h-10 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <p className="text-slate-300 font-medium mb-1">Prevuci sliku ovde ili klikni</p>
          <p className="text-slate-500 text-xs">PNG, JPG, WebP do 5MB</p>
        </>
      )}
    </div>
  );
}
