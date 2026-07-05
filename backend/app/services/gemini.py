import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted
import time
import threading
import json
from app.core.config import settings

# Configure Gemini API
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

class GeminiService:
    def __init__(self):
        # Dùng model flash lite cho chat (tiết kiệm)
        self.chat_model = genai.GenerativeModel('gemini-3.1-flash-lite')
        # Dùng model flash lite thay cho pro
        self.pro_model = genai.GenerativeModel('gemini-3.1-flash-lite')
        
        # State để rate limit
        self._chat_last_call = 0.0
        self._embedding_last_call = 0.0
        self._chat_lock = threading.Lock()
        self._embedding_lock = threading.Lock()

    def _wait_chat_rate_limit(self):
        with self._chat_lock:
            now = time.time()
            elapsed = now - self._chat_last_call
            if elapsed < 4.1: # 15 RPM = 1 req / 4.1s
                time.sleep(4.1 - elapsed)
            self._chat_last_call = time.time()

    def _wait_embedding_rate_limit(self):
        with self._embedding_lock:
            now = time.time()
            elapsed = now - self._embedding_last_call
            if elapsed < 0.61: # 100 RPM = 1 req / 0.61s
                time.sleep(0.61 - elapsed)
            self._embedding_last_call = time.time()
        
    def generate_embedding(self, text: str, retries=3) -> list[float]:
        """Sinh vector embedding cho 1 đoạn văn bản."""
        for attempt in range(retries):
            try:
                self._wait_embedding_rate_limit()
                result = genai.embed_content(
                    model="models/gemini-embedding-2",
                    content=text,
                    task_type="retrieval_document"
                )
                return result['embedding']
            except ResourceExhausted:
                if attempt < retries - 1:
                    print("Rate limit hit for embedding. Sleeping for 10 seconds...")
                    time.sleep(10)
                else:
                    raise
            except Exception as e:
                print(f"Lỗi sinh embedding: {e}")
                if attempt < retries - 1:
                    time.sleep(2)
                else:
                    raise

    def generate_embeddings_batch(self, texts: list[str], retries=3) -> list[list[float]]:
        """Sinh vector embedding cho nhiều đoạn văn bản (batching)."""
        if not texts:
            return []
        for attempt in range(retries):
            try:
                self._wait_embedding_rate_limit()
                result = genai.embed_content(
                    model="models/gemini-embedding-2",
                    content=texts,
                    task_type="retrieval_document"
                )
                return result['embedding']
            except ResourceExhausted:
                if attempt < retries - 1:
                    print("Rate limit hit for batch embedding. Sleeping for 10 seconds...")
                    time.sleep(10)
                else:
                    raise
            except Exception as e:
                print(f"Lỗi sinh batch embedding: {e}")
                if attempt < retries - 1:
                    time.sleep(2)
                else:
                    raise

    def check_intent(self, question: str) -> bool:
        prompt = f"""Bạn là một bộ lọc (Intent Classifier) cho hệ thống tra cứu Pháp luật ngành Xây dựng.
Hãy đánh giá câu hỏi sau của người dùng. Nếu câu hỏi liên quan đến công trình xây dựng, bất động sản, quy hoạch, cấp phép, tiêu chuẩn kỹ thuật, hoặc luật pháp về công trình xây dựng thì trả lời 'YES'.
LƯU Ý QUAN TRỌNG: Nếu câu hỏi dùng từ "xây dựng" theo nghĩa bóng (xây dựng Đảng, xây dựng Tổ quốc, xây dựng văn hóa...) hoặc về các chủ đề khác (nấu ăn, thể thao, giải trí, luật hôn nhân, y tế thuần túy...) thì trả lời 'NO'.
Chỉ trả lời 'YES' hoặc 'NO'.

Câu hỏi: "{question}"
"""
        self._wait_chat_rate_limit()
        response = self.chat_model.generate_content(prompt)
        text = response.text.strip().upper()
        return "YES" in text

    def check_document_relevance(self, title: str, retries=3) -> bool:
        prompt = f"""Bạn là một bộ lọc văn bản cho hệ thống tra cứu Pháp luật ngành Xây dựng.
Hãy đánh giá tiêu đề văn bản sau. Nếu tiêu đề liên quan đến ngành xây dựng CÔNG TRÌNH, kiến trúc, quy hoạch đô thị, vật liệu xây dựng, bất động sản, nhà ở, hạ tầng kỹ thuật, đấu thầu xây dựng thì trả lời 'YES'.
LƯU Ý QUAN TRỌNG: Nếu tiêu đề chứa từ "xây dựng" nhưng mang nghĩa bóng (ví dụ: "xây dựng Tổ quốc", "xây dựng Đảng", "xây dựng quân đội", "xây dựng pháp luật"...) hoặc không liên quan đến công trình vật lý (ví dụ: nông thôn mới, y tế, giáo dục, dân tộc, tôn giáo...) thì trả lời 'NO'.
Chỉ trả lời 'YES' hoặc 'NO'.

Tiêu đề văn bản: "{title}"
"""
        for attempt in range(retries):
            try:
                self._wait_chat_rate_limit()
                response = self.chat_model.generate_content(prompt)
                text = response.text.strip().upper()
                return "YES" in text
            except ResourceExhausted:
                if attempt < retries - 1:
                    time.sleep(15)
                else:
                    raise
            except Exception as e:
                print(f"Lỗi kiểm tra relevance: {e}")
                if attempt < retries - 1:
                    time.sleep(5)
                else:
                    raise
        return True

    def check_documents_relevance_batch(self, titles: list[str], retries=3) -> list[bool]:
        """Kiểm tra relevance của nhiều tiêu đề cùng lúc để tiết kiệm RPD."""
        if not titles:
            return []
        titles_str = "\n".join([f"{i}. {title}" for i, title in enumerate(titles)])
        prompt = f"""Bạn là một bộ lọc văn bản cho hệ thống tra cứu Pháp luật ngành Xây dựng.
Hãy đánh giá danh sách các tiêu đề văn bản sau.
Với mỗi tiêu đề, nếu nó liên quan đến ngành xây dựng CÔNG TRÌNH, kiến trúc, quy hoạch, bất động sản, nhà ở, hạ tầng, đấu thầu xây dựng thì đánh giá là true. 
LƯU Ý QUAN TRỌNG: Nếu tiêu đề chứa từ "xây dựng" nhưng mang nghĩa bóng (ví dụ: "xây dựng Tổ quốc", "xây dựng Đảng", "xây dựng quân đội", "xây dựng pháp luật", "xây dựng văn hóa", "xây dựng nông thôn mới"...) hoặc không liên quan đến công trình xây dựng vật lý (ví dụ: y tế thuần túy, giáo dục, ngoại giao, an ninh quốc phòng...) thì PHẢI đánh giá là false.
Chỉ trả về ĐÚNG MỘT MẢNG JSON thuần túy chứa các giá trị true/false tương ứng với thứ tự của các tiêu đề. Không trả về bất kỳ text nào khác ngoài mảng JSON.

Danh sách tiêu đề:
{titles_str}
"""
        for attempt in range(retries):
            try:
                self._wait_chat_rate_limit()
                response = self.chat_model.generate_content(prompt)
                text = response.text.strip()
                if text.startswith('```json'):
                    text = text[7:]
                if text.startswith('```'):
                    text = text[3:]
                if text.endswith('```'):
                    text = text[:-3]
                text = text.strip()
                
                results = json.loads(text)
                if isinstance(results, list) and len(results) == len(titles):
                    return results
                else:
                    return [True] * len(titles)
            except ResourceExhausted:
                if attempt < retries - 1:
                    time.sleep(15)
                else:
                    raise
            except Exception as e:
                print(f"Lỗi kiểm tra relevance batch: {e}")
                if attempt < retries - 1:
                    time.sleep(5)
                else:
                    return [True] * len(titles)
        return [True] * len(titles)

    def rewrite_query(self, question: str, history: list[dict]) -> str:
        if not history:
            return question
        history_str = "\n".join([f"{msg.get('role', 'user')}: {msg.get('content', '')}" for msg in history[-4:]])
        prompt = f"""Dưới đây là lịch sử cuộc trò chuyện:
{history_str}

Người dùng vừa hỏi câu mới: "{question}"

Nhiệm vụ của bạn: Viết lại câu hỏi mới nhất sao cho nó chứa đầy đủ chủ ngữ, vị ngữ, và nhắc lại rõ các danh từ, số hiệu văn bản (nếu có) từ lịch sử để nó có thể đứng độc lập.
Chỉ trả về câu hỏi đã được viết lại, không giải thích. Nếu câu hỏi đã đầy đủ, trả về y nguyên.
Câu hỏi viết lại:"""
        self._wait_chat_rate_limit()
        response = self.chat_model.generate_content(prompt)
        return response.text.strip()

    def generate_answer(self, question: str, context: list[dict], history: list[dict] = None) -> str:
        context_str = "\n\n".join([f"Văn bản: {c['title']} (URL: {c['origin_url']})\nNội dung: {c['content']}" for c in context])
        
        history_str = ""
        if history:
            history_str = "Lịch sử trò chuyện:\n" + "\n".join([f"{msg.get('role', 'user')}: {msg.get('content', '')}" for msg in history[-6:]]) + "\n\n"

        prompt = f"""Bạn là một chuyên gia pháp lý về lĩnh vực Xây dựng tại Việt Nam.
Hãy trả lời câu hỏi của người dùng dựa trên Ngữ cảnh được cung cấp.

{history_str}Ngữ cảnh (Các trích đoạn văn bản pháp luật tìm được):
{context_str}

Câu hỏi hiện tại của người dùng: "{question}"

Yêu cầu:
1. Trả lời chính xác, mạch lạc, dễ hiểu. Nếu được hãy trích dẫn số hiệu văn bản, điều khoản liên quan từ ngữ cảnh.
2. BẮT BUỘC TRÍCH DẪN các đường dẫn (URL) tham khảo ở cuối câu trả lời hoặc chèn trực tiếp vào câu trả lời với định dạng markdown: [Tên văn bản](URL). Nguồn gốc URL đã được cung cấp sẵn ở phần Ngữ cảnh bên trên.
3. Nếu Ngữ cảnh KHÔNG chứa thông tin để trả lời, hãy nói rõ là "Dựa vào dữ liệu hiện có, tôi không tìm thấy thông tin...". KHÔNG được tự bịa ra thông tin.

Câu trả lời:"""
        self._wait_chat_rate_limit()
        response = self.pro_model.generate_content(prompt)
        return response.text.strip()
