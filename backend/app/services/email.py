import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

def send_password_reset_email(to_email: str, token: str):
    """
    Sends a password reset email to the user with a reset link.
    """
    try:
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Khôi phục mật khẩu - Hệ thống tra cứu Luật Xây dựng"
        msg["From"] = settings.SMTP_USER
        msg["To"] = to_email

        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #f9f9f9;">
                    <h2 style="color: #2563eb; text-align: center;">Khôi phục mật khẩu</h2>
                    <p>Xin chào,</p>
                    <p>Bạn nhận được email này vì bạn đã yêu cầu khôi phục mật khẩu cho tài khoản liên kết với địa chỉ email này trên hệ thống của chúng tôi.</p>
                    <p>Vui lòng click vào nút bên dưới để đặt lại mật khẩu của bạn:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{reset_link}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Đặt lại mật khẩu</a>
                    </div>
                    <p>Nếu bạn không yêu cầu việc này, vui lòng bỏ qua email. Mật khẩu của bạn sẽ không bị thay đổi.</p>
                    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #888;">Nếu nút bấm không hoạt động, bạn có thể copy và dán đường dẫn sau vào trình duyệt:<br><a href="{reset_link}" style="color: #2563eb;">{reset_link}</a></p>
                </div>
            </body>
        </html>
        """
        
        msg.attach(MIMEText(html_content, "html"))
        
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
        server.quit()
        
        logger.info(f"Password reset email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        raise e
