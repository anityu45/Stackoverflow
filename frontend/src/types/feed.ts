import { User } from "./user";

export type PostType = "technical_update" | "code_snippet" | "project_showcase" | "learning_achievement";

export interface CodeSnippet {
  code: string;
  language: string;
}

export interface PostReport {
  user: string;
  reason: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  user: User;
  content: string;
  postType: PostType;
  codeSnippet?: CodeSnippet;
  imageUrl?: string;
  tags: string[];
  likes: string[];
  bookmarks: string[];
  shareCount: number;
  engagementScore: number;
  commentCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  reports?: PostReport[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentItem {
  _id: string;
  post: string;
  user: User;
  content: string;
  parentComment?: string | null;
  likes?: string[];
  replies?: CommentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  _id: string;
  recipient: string;
  sender: User;
  type: "like" | "comment" | "reply" | "mention" | "follow";
  post?: { _id: string; content: string; postType: string };
  comment?: { _id: string; content: string };
  read: boolean;
  createdAt: string;
}
