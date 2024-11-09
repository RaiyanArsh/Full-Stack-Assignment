"use client";

import Image from "next/image";
import { useState, ChangeEvent, FormEvent } from "react";
import { IoIosAddCircleOutline } from "react-icons/io";
import { CiFileOn } from "react-icons/ci";
import { FaUserAlt } from "react-icons/fa";
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
  const uploadEndpoint = process.env.NEXT_PUBLIC_UPLOAD_PDF_ENDPOINT;
  const chatCompletionEndpoint =
    process.env.NEXT_PUBLIC_CHAT_COMPLETION_ENDPOINT;

  // Handle PDF upload
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(`${uploadEndpoint}`, {
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

      const response = await fetch(`${chatCompletionEndpoint}`, {
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
      <header className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold flex">
            <Image src={logoSrc} alt="Logo" className="w-10 h-10" />
            <span className="flex flex-col">
              planet{" "}
              <small className="text-xs font-normal">
                formerly <span className="text-green-600 font-bold">DPhi</span>
              </small>
            </span>
          </span>
        </div>
        <div className="flex flex-row items-center space-x-8">
          {selectedFile && (
            <div className="flex space-x-2 items-center">
              {uploadError ? (
                <VscError
                  className="text-red-700 border w-8 h-8 p-1 rounded-md border-red-300"
                  size={20}
                />
              ) : (
                <CiFileOn
                  className="text-green-700 border w-8 h-8 p-1 rounded-md border-green-300"
                  size={20}
                />
              )}

              <p
                className={`text-center text-sm flex items-center space-x-2 truncate max-w-[calc(100%-2rem)] ${
                  uploadError ? "text-red-700" : "text-green-700"
                }`}
              >
                {`${selectedFile.name}`}
              </p>
            </div>
          )}
          <button
            onClick={handleUploadClick}
            className={`flex items-center space-x-2 px-8 py-2 border rounded-lg bg-white transition-all duration-300 ${
              isSessionStarted
                ? "hover:border-red-600 hover:bg-red-50"
                : "hover:border-black hover:bg-gray-50"
            }`}
          >
            {isSessionStarted ? (
              <>
                <MdDeleteOutline className="text-xl text-red-500" />
                <span className="text-red-500">{"Clear Session"}</span>
              </>
            ) : (
              <>
                <IoIosAddCircleOutline className="text-xl" />
                <span>Upload PDF</span>
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

      <div className="flex-1 bg-gray-50 p-4 overflow-y-auto">
        <div className="flex flex-col space-y-10 w-4/5 justify-center m-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex space-x-4 ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* {message.sender === "user" && (
                <div className="bg-blue-500 p-2 flex items-center justify-center rounded-full">
                  <FaUserAlt className="text-white w-4 h-4" />
                </div>
              )} */}
              {message.sender !== "user" && (
                <div className="items-start">
                  <div className="bg-gray-500 p-2 flex items-center justify-center rounded-full">
                    <AiOutlineRobot className="text-white w-4 h-4" />
                  </div>
                </div>
              )}
              <div
                className={`p-3 shadow-md max-w-4xl ${
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
      <form
        onSubmit={handleSendMessage}
        className="flex items-center p-4 w-4/5 justify-center m-auto border-t-0 bg-transparent"
      >
        <div className="flex items-center w-full border rounded-md shadow-lg box-shadow">
          <input
            type="text"
            placeholder="Send a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 px-8 rounded-sm focus:outline-none"
          />
          <button
            type="submit"
            className="p-3 px-8 text-gray-500 hover:text-gray-700 rounded-sm"
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
