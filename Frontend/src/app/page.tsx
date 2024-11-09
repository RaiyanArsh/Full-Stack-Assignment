"use client";

import Image from "next/image";
import { useState, ChangeEvent, FormEvent } from "react";
import { IoIosAddCircleOutline } from "react-icons/io";
import { CiFileOn } from "react-icons/ci";
import { AiOutlineRobot } from "react-icons/ai";
import logoSrc from "../../public/Icon.svg";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { VscError } from "react-icons/vsc";
import { MdDeleteOutline } from "react-icons/md";

type Message = {
  sender: "user" | "bot";
  text: string;
};

export default function LandingPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [pdfContent, setPdfContent] = useState<string>("");
  const [uploadError, setError] = useState<boolean>(false);
  const [isSessionStarted, setIsSessionStarted] = useState<boolean>(false);

  // Handle PDF upload
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://127.0.0.1:8000/upload-pdf/", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error("Failed to upload PDF");
        }
        const data = await response.json();
        setPdfContent(data.pdf_text || "");
        toast.success("PDF uploaded and text extracted successfully.");
        setError(false);
      } catch (error) {
        setError(true);
        toast.error("Failed to upload PDF.");
      }
    } else {
      toast.info("Please upload a valid PDF file.");
    }
  };

  // Upload Button Functionality

  const handleUploadClick = () => {
    if (isSessionStarted) {
      setMessages([]);
      setPdfContent("");
      setSelectedFile(null);
      setInput("");
      setIsSessionStarted(false);
      toast.info("Session cleared.");
    } else {
      document.getElementById("fileInput")?.click();
    }
  };

  // Handle sending message
  const handleSendMessage = async (event: FormEvent) => {
    event.preventDefault();

    if (uploadError) {
      toast.error("Failed to Upload the File, Reupload it");
      return;
    }

    if (!pdfContent) {
      toast.info("Please upload a PDF file first.");
      return;
    }
    if (!input.trim() || !pdfContent) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsSessionStarted(true);
    setInput("");

    try {
      const payload = [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: `PDF Content: ${pdfContent.slice(
            0,
            1000
          )}... \n\nQuestion: ${input}`,
        },
      ];

      const response = await fetch("http://127.0.0.1:8000/chat-completion/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from chat API");
      }

      const data = await response.json();
      const botMessage: Message = {
        sender: "bot",
        text: data.choices[0].message.content,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      toast.error("Failed to communicate with the chat API");
    }
  };

  return (
    <div className="flex flex-col h-screen justify-between">
      {/* Navbar */}
      <header className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold flex items-center">
            <Image
              src={logoSrc}
              alt="Logo"
              className="w-8 h-8 md:w-10 md:h-10"
            />
            <span className="flex-col ml-1 md:ml-2 hidden md:flex">
              planet{" "}
              <small className="text-xs font-normal">
                formerly <span className="text-green-600 font-bold">DPhi</span>
              </small>
            </span>
          </span>
        </div>
        <div className="flex items-center space-x-4 md:space-x-8">
          {/* File Upload */}
          {selectedFile && (
            <div className="flex space-x-2 items-center truncate max-w-xs">
              {uploadError ? (
                <VscError className="text-red-700 border w-6 h-6 md:w-8 md:h-8 p-1 rounded-md border-red-300" />
              ) : (
                <CiFileOn className="text-green-700 border w-6 h-6 md:w-8 md:h-8 p-1 rounded-md border-green-300" />
              )}
              <p
                className={`text-sm truncate max-w-[100px] md:max-w-xs ${
                  uploadError ? "text-red-700" : "text-green-700"
                }`}
                title={selectedFile.name} // Shows full file name on hover
              >
                {selectedFile.name}
              </p>
            </div>
          )}
          {/* Upload Button */}
          <button
            onClick={handleUploadClick}
            className={`flex items-center space-x-2 px-4 py-2 md:px-8 md:py-2 border rounded-lg bg-white transition-all duration-300 ${
              isSessionStarted
                ? "hover:border-red-600 hover:bg-red-50"
                : "hover:border-black hover:bg-gray-50"
            }`}
          >
            {isSessionStarted ? (
              <>
                <MdDeleteOutline className="text-xl text-red-500" />
                <span className="text-red-500 hidden md:block">
                  Clear Session
                </span>
              </>
            ) : (
              <>
                <IoIosAddCircleOutline className="text-xl" />
                <span className="hidden md:block">Upload PDF</span>
              </>
            )}
          </button>
        </div>
        <input
          id="fileInput"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </header>
      {/* Main Chat Area */}
      <div className="flex-1 bg-gray-50 p-2 md:p-4 overflow-y-auto">
        <div className="flex flex-col space-y-6 md:space-y-10 w-full md:w-4/5 justify-center m-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex space-x-2 md:space-x-4 ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.sender !== "user" && (
                <div className="flex items-start">
                  <div className="bg-gray-500 p-1 md:p-2 rounded-full">
                    <AiOutlineRobot className="text-white w-4 h-4 md:w-5 md:h-5" />
                  </div>
                </div>
              )}
              <div
                className={`p-2 md:p-3 shadow-md max-w-[80%] md:max-w-4xl ${
                  message.sender === "user"
                    ? "bg-green-500 text-white rounded-tr-sm rounded-br-lg rounded-tl-lg rounded-bl-lg"
                    : "bg-white text-gray-800 border rounded-tr-lg rounded-br-lg rounded-tl-sm rounded-bl-lg"
                }`}
              >
                <p>{message.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Footer for input box */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center p-2 md:p-4 w-full md:w-4/5 justify-center m-auto bg-transparent"
      >
        <div className="flex items-center w-full border rounded-md shadow-lg">
          <input
            type="text"
            placeholder="Send a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 px-4 md:px-8 rounded-sm focus:outline-none"
          />
          <button
            type="submit"
            className="p-2 md:p-3 px-4 md:px-8 text-gray-500 hover:text-gray-700 rounded-sm"
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}
