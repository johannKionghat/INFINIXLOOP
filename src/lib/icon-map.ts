import {
  Radio, BookOpen, Clapperboard, Globe, Video, Image as ImageIcon,
  LayoutTemplate, Scissors, Mail, MessageCircle, Bot, ClipboardList,
  type LucideIcon,
} from "lucide-react";
import type { AgentIconName } from "./agents";

export const ICON_MAP: Record<AgentIconName, LucideIcon> = {
  Radio,
  BookOpen,
  Clapperboard,
  Globe,
  Video,
  ImageIcon,
  LayoutTemplate,
  Scissors,
  Mail,
  MessageCircle,
  Bot,
  ClipboardList,
};

export function getIcon(name: AgentIconName): LucideIcon {
  return ICON_MAP[name] ?? Radio;
}
