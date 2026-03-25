import {
  Clock, Settings, Link, GitFork, Globe, Sparkles, Search, Lightbulb,
  TrendingUp, Compass, PenTool, Wand2, ImagePlus, Layout, Layers,
  BookOpen, Mail, Shield, Send, Magnet, BarChart2,
  type LucideIcon,
} from "lucide-react";

export const STEP_ICON_MAP: Record<string, LucideIcon> = {
  Clock,
  Settings,
  Link,
  GitFork,
  GitBranch: GitFork,
  Globe,
  Sparkles,
  Search,
  Lightbulb,
  TrendingUp,
  Compass,
  PenTool,
  Wand2,
  ImagePlus,
  Layout,
  Layers,
  BookOpen,
  Mail,
  Shield,
  Send,
  Magnet,
  BarChart2,
};

export function getStepIcon(name: string): LucideIcon {
  return STEP_ICON_MAP[name] ?? Sparkles;
}
