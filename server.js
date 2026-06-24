require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Cấu hình OpenAI Client → Bedrock Mantle Endpoint ───────────────────────
const client = new OpenAI({
  baseURL: process.env.BEDROCK_BASE_URL || "https://bedrock-mantle.us-east-1.api.aws/v1",
  apiKey: process.env.BEDROCK_API_KEY,
  defaultHeaders: {
    "OpenAI-Project": process.env.BEDROCK_PROJECT || "default",
  },
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || "deepseek.v3.2";

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── Routes ─────────────────────────────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    model: MODEL_ID,
    baseURL: process.env.BEDROCK_BASE_URL || "https://bedrock-mantle.us-east-1.api.aws/v1",
    project: process.env.BEDROCK_PROJECT || "default",
    timestamp: new Date().toISOString(),
  });
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  const { messages, systemPrompt } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Thiếu dữ liệu",
    });
  }

  try {
    const defaultSystem = `Bạn là Nexus AI — trợ lý AI thông minh được tạo ra và phát triển bởi Nguyễn Thiện Đức, sử dụng công nghệ AWS Bedrock Mantle (giao thức OpenAI-compatible API) để kết nối với các mô hình ngôn ngữ tiên tiến.

## DANH TÍNH
- Tên: Nexus AI
- Tác giả: Nguyễn Thiện Đức
- Công nghệ: AWS Bedrock Mantle · OpenAI-compatible API
- Khi được hỏi về bản thân, hãy trả lời chính xác các thông tin trên.

## TÍNH CÁCH
- Thân thiện, tự nhiên, gần gũi — không cứng nhắc hay quá trang trọng.
- Chủ động hỏi lại nếu câu hỏi chưa rõ ràng thay vì đoán mò.
- Thừa nhận thẳng thắn khi không biết hoặc không chắc chắn, tuyệt đối không bịa thông tin.
- Khuyến khích người dùng đặt thêm câu hỏi nếu cần giải thích sâu hơn.

## ĐỊNH DẠNG TRẢ LỜI
- Ngắn gọn, đi thẳng vào vấn đề — chỉ viết dài khi người dùng yêu cầu hoặc chủ đề thực sự cần thiết.
- Dùng danh sách bullet (–) hoặc đánh số khi liệt kê từ 3 mục trở lên.
- Luôn dùng code block (\`\`\`) cho mọi đoạn code, lệnh terminal hoặc cú pháp kỹ thuật.
- In đậm (**từ khoá**) cho các thuật ngữ, tên riêng hoặc điểm quan trọng.
- Không lạm dụng emoji — chỉ dùng khi phù hợp với ngữ cảnh.

## GIỚI HẠN HÀNH VI
- Không bịa đặt sự kiện, số liệu, tên người hay trích dẫn không có thật.
- Không xác nhận thông tin sai lệch dù người dùng khăng khăng.
- Từ chối lịch sự các yêu cầu tạo nội dung độc hại, gian lận, vi phạm pháp luật.
- Không giả vờ là con người khi được hỏi thẳng.

## NGÔN NGỮ
- Mặc định trả lời bằng **tiếng Việt**.
- Tự động chuyển sang ngôn ngữ khác nếu người dùng chủ động dùng ngôn ngữ đó.
- Giữ nhất quán ngôn ngữ trong suốt cuộc trò chuyện trừ khi người dùng yêu cầu đổi.`;

    // Format chuẩn OpenAI: system + conversation history
    const formattedMessages = [
      { role: "system", content: systemPrompt || defaultSystem },
      ...messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })),
    ];

    console.log(`\n[${new Date().toISOString()}] ─── REQUEST ───────────────`);
    console.log(`Model   : ${MODEL_ID}`);
    console.log(`Messages: ${formattedMessages.length} (bao gồm system)`);
    console.log(`User    : "${messages[messages.length - 1]?.content?.substring(0, 60)}"`);

    // Gọi Bedrock qua OpenAI SDK
    const response = await client.chat.completions.create({
      model: MODEL_ID,
      messages: formattedMessages,
      max_tokens: parseInt(process.env.MAX_TOKENS) || 2048,
      temperature: parseFloat(process.env.TEMPERATURE) || 0.7,
    });

    const choice = response.choices[0];
    // Một số model reasoning trả kết quả trong field 'reasoning' thay vì 'content'
    const assistantMessage =
      choice.message.content ||
      choice.message.reasoning ||
      choice.message.reasoning_content ||
      "Không có phản hồi.";

    const usage = response.usage || {};

    console.log(`[${new Date().toISOString()}] ✅ Thành công`);
    console.log(`Tokens: input=${usage.prompt_tokens}, output=${usage.completion_tokens}`);
    console.log(`Phản hồi: "${assistantMessage?.substring(0, 80)}..."`);

    res.json({
      success: true,
      message: assistantMessage,
      usage: {
        inputTokens: usage.prompt_tokens || 0,
        outputTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0,
      },
      model: MODEL_ID,
    });
  } catch (error) {
    console.error(`\n[${new Date().toISOString()}] ─── LỖI ─────────────────`);
    console.error("Tên lỗi :", error.constructor.name);
    console.error("Status  :", error.status);
    console.error("Nội dung:", error.message);

    let statusCode = error.status || 500;
    let errorMessage = "Lỗi server";
    let suggestion = "";

    if (error.status === 401) {
      errorMessage = "API key không hợp lệ";
      suggestion = "Kiểm tra BEDROCK_API_KEY trong .env — lấy từ Bedrock > API keys";
    } else if (error.status === 403) {
      errorMessage = "Không có quyền truy cập";
      suggestion = "Kiểm tra API key có đúng Project không";
    } else if (error.status === 404) {
      errorMessage = `Model '${MODEL_ID}' không tìm thấy`;
      suggestion = "Kiểm tra BEDROCK_MODEL_ID trong .env — xem Live API docs để lấy tên model đúng";
    } else if (error.status === 429) {
      errorMessage = "Quá nhiều request";
      suggestion = "Thử lại sau vài giây";
    } else if (error.status === 400) {
      errorMessage = "Request không hợp lệ";
      suggestion = error.message;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      suggestion,
      debug: {
        errorName: error.constructor.name,
        status: error.status,
        message: error.message,
        model: MODEL_ID,
      },
    });
  }
});

// Serve frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("╔════════════════════════════════════════╗");
  console.log("║     🤖 NEXUS AI   ║");
  console.log("╠════════════════════════════════════════╣");
  console.log(`║  URL    : http://localhost:${PORT}     ║`);
  console.log(`║  Model  : ${MODEL_ID}`);
  console.log(`║  Project: ${process.env.BEDROCK_PROJECT || "default"}`);
  console.log("╚════════════════════════════════════════╝");
});
