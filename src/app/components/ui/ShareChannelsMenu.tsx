import { toast } from "sonner";
import type { ShareChannel } from "../../../utils/shareChannels";
import { openShareChannel, buildShareText } from "../../../utils/shareChannels";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

interface ShareChannelsMenuProps {
  children: React.ReactNode;
  shareTitle: string;
  shareUrl: string;
  align?: "start" | "center" | "end";
  contentClassName?: string;
}

const CHANNELS: { id: ShareChannel; label: string }[] = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "instagram", label: "Instagram" },
  { id: "telegram", label: "Telegram" },
  { id: "x", label: "X" },
];

export function ShareChannelsMenu({
  children,
  shareTitle,
  shareUrl,
  align = "end",
  contentClassName = "",
}: ShareChannelsMenuProps) {
  const text = buildShareText(shareTitle, shareUrl);

  const handleSelect = (channel: ShareChannel) => {
    if (channel === "instagram") {
      void navigator.clipboard.writeText(shareUrl).then(
        () => {
          toast.success("Link copiado. Cole no Instagram (stories ou mensagens).");
        },
        () => {
          toast.error("Não foi possível copiar o link.");
        }
      );
      return;
    }
    openShareChannel(channel, shareUrl, text);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className={`min-w-[198px] bg-[#24191b] border border-[#30292b] text-[#f8f8f8] ${contentClassName}`}
      >
        {CHANNELS.map(({ id, label }) => (
          <DropdownMenuItem
            key={id}
            className="cursor-pointer focus:bg-white/10"
            onSelect={(e) => {
              e.preventDefault();
              handleSelect(id);
            }}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
