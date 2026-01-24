// small helpers / config
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Backend API functions
export async function getAIResponse(
  messages,
  model = "gpt-5-mini",
  apiKey,
  userId,
  doctorId
) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/ai/prescription/analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-timezone": userTimezone,
        },
        body: JSON.stringify({
          messages,
          model,
          apiKey,
          userId,
          doctorId,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "API request failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting AI response:", error);
    throw error;
  }
}

export async function getAIImageResponse(
  files,
  model = "gpt-5-mini",
  apiKey,
  patientId,
  doctorId
) {
  try {
    const formData = new FormData();

    formData.append("patientId", patientId || "");
    formData.append("doctorId", doctorId || "");

    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch(`${API_BASE_URL}/api/ai/imaging/analyze`, {
      method: "POST",
      headers: {
        "x-timezone": userTimezone,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "API request failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting AI image response:", error);
    throw error;
  }
}

export async function getAIPrescriptionResponse(
  files,
  model = "gpt-5-mini",
  apiKey,
  patientId,
  doctorId
) {
  try {
    const formData = new FormData();

    formData.append("patientId", patientId || "");
    formData.append("doctorId", doctorId || "");

    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch(
      `${API_BASE_URL}/api/ai/prescription/analyze`,
      {
        method: "POST",
        headers: {
          "x-timezone": userTimezone,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      let errorMessage = "Prescription analysis failed";
      try {
        const error = await response.json();
        errorMessage = error.error || error.details || errorMessage;
      } catch (e) {
        // Response might not be JSON
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting AI prescription response:", error);
    throw error;
  }
}

export async function getAITreatmentPlan(
  symptoms,
  model = "gpt-5-mini",
  apiKey,
  patientId,
  doctorId
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/treatment/plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-timezone": userTimezone,
      },
      body: JSON.stringify({
        symptoms,
        model,
        apiKey,
        patientId,
        doctorId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "API request failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting AI treatment plan:", error);
    throw error;
  }
}

export async function getAIDrugInteraction(
  medications,
  model = "gpt-5-mini",
  apiKey,
  patientId,
  doctorId
) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/ai/drug-interaction/analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-timezone": userTimezone,
        },
        body: JSON.stringify({
          medications,
          model,
          apiKey,
          patientId,
          doctorId,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "API request failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting AI drug interaction analysis:", error);
    throw error;
  }
}

export async function chatResponse(
  messages,
  file = null,
  model = "gpt-5-mini",
  systemPrompt = "You are a medical AI assistant. Provide accurate, evidence-based, and concise medical information. Do not speculate, guess, or invent facts. If you do not know the answer, clearly state that you don't know. Respond only to medical-related content; politely decline any non-medical or irrelevant requests. Maintain a professional, neutral, and supportive tone. Use information from previous messages only when medically relevant. When medical images are provided, analyze them carefully within your capabilities. Prioritize clarity, safety, and accuracy in every response.",
  apiKey,
  userId,
  doctorId,
  maxTokens,
  conversationType = "user_ai"
) {
  try {
    // Require API key
    if (!apiKey || apiKey.trim() === "") {
      throw new Error(
        "API key not set. Please set your OpenAI API key in AI Settings."
      );
    }

    // Basic validation
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("messages must be a non-empty array");
    }

    // last user message
    let last = messages[messages.length - 1];
    let content = last.content;

    // guard file size
    if (file && file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `File too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Max ${
          MAX_FILE_SIZE_BYTES / (1024 * 1024)
        } MB`
      );
    }

    // Build content depending on file type
    if (file) {
      if (file.type && file.type.startsWith("image/")) {
        const base64 = await fileToBase64(file);
        content = [
          { type: "text", text: content },
          {
            type: "image_url",
            image_url: { url: `data:${file.type};base64,${base64}` },
          },
        ];
        model = model || "gpt-5-mini";
      } else if (
        file.type === "application/pdf" ||
        (file.name && file.name.toLowerCase().endsWith(".pdf"))
      ) {
        // send PDF as base64 file input to model (if model supports it)
        const base64 = await fileToBase64(file);
        content = [
          { type: "text", text: content },
          {
            type: "file",
            file: {
              filename: file.name,
              file_data: `data:application/pdf;base64,${base64}`,
            },
          },
        ];
        model = model || "gpt-5-mini";
      } else if (
        (file.type && file.type.startsWith("text/")) ||
        (file.name &&
          file.name.match(
            /\.(txt|md|json|js|jsx|ts|tsx|py|java|c|cpp|h|css|html|xml|yaml|yml)$/i
          ))
      ) {
        try {
          const textContent = await fileToText(file);
          content = `File content from ${file.name}:\n${textContent}\n\nUser message: ${content}`;
        } catch (err) {
          console.error("Error reading text file:", err);
          content += ` [Attached text file: ${file.name}, could not read content]`;
        }
      } else {
        content += ` [Attached file: ${file.name || "unknown"}, type: ${
          file.type || "unknown"
        }]`;
      }
    }

    // Build final api messages array (system first)
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.slice(0, -1),
      { role: "user", content },
    ];

    // Call backend API
    const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-timezone": userTimezone,
      },
      body: JSON.stringify({
        userId,
        doctorId,
        messages: apiMessages,
        model,
        apiKey,
        systemPrompt,
        maxTokens,
        conversationType,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Chat API request failed");
    }

    const result = await response.json();
    return result.response;
  } catch (error) {
    console.error("Error getting chat response:", error);
    throw error;
  }
}

export async function getAIScribeResponse(
  sessionContent,
  model = "gpt-5-mini",
  apiKey,
  patientId,
  doctorId
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/scribe/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-timezone": userTimezone,
      },
      body: JSON.stringify({
        patientId: patientId || "",
        doctorId: doctorId || "",
        sessionContent: sessionContent || "",
      }),
    });

    if (!response.ok) {
      let errorMessage = "Clinical notes analysis failed";
      try {
        const error = await response.json();
        errorMessage = error.error || error.details || errorMessage;
      } catch (e) {
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting AI scribe response:", error);
    throw error;
  }
}

export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      resolve(btoa(binary));
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export async function fileToText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
