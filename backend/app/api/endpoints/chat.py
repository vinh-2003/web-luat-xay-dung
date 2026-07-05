from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.gemini import GeminiService
from app.models.document import DocumentChunk, Document
from app.models.user import User, ChatSession, ChatMessage
from app.api.deps import get_current_user_optional, get_current_active_user
from app.schemas.chat import ChatRequest, ChatResponse, ChatSessionSchema, ChatMessageSchema
from typing import List

router = APIRouter()
gemini_service = GeminiService()

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    # 1. Contextual Query Rewriting
    actual_query = request.question
    if request.history:
        try:
            actual_query = gemini_service.rewrite_query(request.question, request.history)
            print(f"Original Query: {request.question}")
            print(f"Rewritten Query: {actual_query}")
        except Exception as e:
            print(f"Lỗi khi viết lại câu hỏi: {e}")

    # 2. Kiểm tra Guardrails (Intent Classifier) trên câu hỏi đã được viết lại
    is_valid_intent = gemini_service.check_intent(actual_query)
    if not is_valid_intent:
        return ChatResponse(answer="Xin lỗi, tôi chỉ có thể hỗ trợ các câu hỏi liên quan đến lĩnh vực Xây dựng và Pháp luật Xây dựng. Vui lòng đặt câu hỏi khác.")

    # 3. Sinh embedding cho câu hỏi
    try:
        question_embedding = gemini_service.generate_embedding(actual_query)
    except Exception as e:
        return ChatResponse(answer=f"Lỗi khi xử lý mô hình AI: {e}")

    # Tìm kiếm pgvector
    chunks = db.query(DocumentChunk).order_by(DocumentChunk.embedding.cosine_distance(question_embedding)).limit(15).all()
    
    context = []
    for chunk in chunks:
        doc = db.query(Document).filter(Document.id == chunk.document_id).first()
        if doc:
            context.append({
                "title": doc.title,
                "content": chunk.chunk_text,
                "origin_url": doc.origin_url
            })

    if not context:
        answer_text = "Tôi không tìm thấy văn bản nào trong cơ sở dữ liệu phù hợp với câu hỏi của bạn."
    else:
        # Sinh câu trả lời từ Gemini
        try:
            answer_text = gemini_service.generate_answer(request.question, context, request.history)
        except Exception as e:
            answer_text = f"Lỗi khi sinh câu trả lời: {e}"
            
    # Xử lý lưu lịch sử nếu user đã đăng nhập
    session_id = request.session_id
    if current_user:
        if not session_id:
            # Tạo session mới
            title = " ".join(request.question.split()[:7]) + "..."
            new_session = ChatSession(user_id=current_user.id, title=title)
            db.add(new_session)
            db.commit()
            db.refresh(new_session)
            session_id = new_session.id
            
        if session_id:
            # Check session ownership
            session_obj = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
            if session_obj:
                # Lưu message user
                user_msg = ChatMessage(session_id=session_id, role="user", content=request.question)
                # Lưu message bot
                bot_msg = ChatMessage(session_id=session_id, role="bot", content=answer_text)
                db.add(user_msg)
                db.add(bot_msg)
                db.commit()

    return ChatResponse(answer=answer_text, session_id=session_id)

@router.get("/sessions", response_model=List[ChatSessionSchema])
def get_chat_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    sessions = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).order_by(ChatSession.created_at.desc()).all()
    return sessions

@router.get("/sessions/{session_id}", response_model=List[ChatMessageSchema])
def get_chat_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiên trò chuyện")
        
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc()).all()
    return messages
