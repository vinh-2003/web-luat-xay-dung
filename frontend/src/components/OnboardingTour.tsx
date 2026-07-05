"use client";

import { useEffect, useState } from "react";
import { Joyride, STATUS, Step, TooltipRenderProps } from "react-joyride";
import { useAuth } from "@/context/AuthContext";

const CustomTooltip = ({
  index,
  size,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
  isLastStep,
}: TooltipRenderProps) => {
  return (
    <div {...tooltipProps} className="bg-card text-foreground border border-border rounded-lg shadow-xl p-4 w-[320px] md:w-[400px]">
      <div className="flex justify-between items-center mb-3">
        {step.title ? (
          <h3 className="font-semibold text-lg">{step.title}</h3>
        ) : (
          <h3 className="font-semibold text-lg">Hướng dẫn</h3>
        )}
        <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded">
          {index + 1} / {size}
        </span>
      </div>
      <div className="text-sm mb-5 text-muted-foreground">
        {step.content}
      </div>
      <div className="flex items-center justify-between mt-2 pt-3 border-t border-border">
        <button {...skipProps} className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">
          Bỏ qua
        </button>
        <div className="flex gap-2">
          {index > 0 && (
            <button {...backProps} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted font-medium transition-colors">
              Quay lại
            </button>
          )}
          <button {...primaryProps} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium transition-colors">
            {isLastStep ? "Hoàn tất" : "Tiếp theo"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function OnboardingTour() {
  const { user } = useAuth();
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Chỉ hiển thị tour khi đã đăng nhập và chưa từng xem tour
    if (user && typeof window !== "undefined") {
      const hasSeenTour = localStorage.getItem("hasSeenTour");
      if (!hasSeenTour) {
        // Đợi 1 chút để DOM render hoàn toàn
        const timer = setTimeout(() => {
          setRun(true);
          // Đánh dấu ngay lập tức để tránh reload lại hiện
          localStorage.setItem("hasSeenTour", "true");
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const steps: Step[] = [
    {
      target: "body",
      content: "Chào mừng bạn đến với Hệ thống Tra cứu Pháp luật Xây dựng! Cùng điểm qua một số tính năng chính nhé.",
      placement: "center",
    },
    {
      target: "#tour-search",
      content: "Đây là bộ lọc tìm kiếm. Bạn có thể tìm theo loại văn bản, tình trạng hiệu lực và thời gian ban hành.",
      placement: "auto",
    },
    {
      target: "#tour-results",
      content: "Kết quả tìm kiếm và các văn bản liên quan sẽ được hiển thị ở khu vực này.",
      placement: "auto",
    },
    {
      target: ".tour-source",
      content: "Bạn có thể bấm vào đây để mở và đối chiếu trực tiếp với trang nguồn gốc (VBPL, MOC, v.v.).",
      placement: "auto",
    },
    {
      target: "#tour-chatbot",
      content: "Gặp tình huống khó? Hãy mô tả ở đây, Trợ lý AI sẽ trích xuất luật và trả lời bạn ngay lập tức!",
      placement: "auto",
    },
    {
      target: "#tour-profile",
      content: "Cuối cùng, quản lý thông tin cá nhân và lịch sử lưu trữ của bạn tại menu này.",
      placement: "auto",
    }
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem("hasSeenTour", "true");
    }
  };

  if (!user || !run) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      scrollToFirstStep={true}
      // @ts-ignore - Prop exists in react-joyride but types are outdated
      showSkipButton={true}
      floaterProps={{
        disableAnimation: true,
        styles: {
          floater: {
            maxWidth: '100vw',
          },
        }
      }}
      tooltipComponent={CustomTooltip}
      callback={handleJoyrideCallback}
    />
  );
}
