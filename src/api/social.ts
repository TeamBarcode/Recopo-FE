import { apiClient } from './client';

// ===== 좋아요 =====
export interface IdeaLikeResponse {
  ideaId: number;
  liked: boolean;
  likeCount: number;
}

export const postIdeaLike = async (ideaId: number): Promise<IdeaLikeResponse> => {
  const { data } = await apiClient.post<IdeaLikeResponse>(`/api/ideas/${ideaId}/likes`);
  return data;
};

// ===== 좋아요 취소 =====
// 응답은 좋아요와 같은 모양 (명세 예시의 cardId는 오타 — 실제 BE 응답 필드는 ideaId)
export const deleteIdeaLike = async (ideaId: number): Promise<IdeaLikeResponse> => {
  const { data } = await apiClient.delete<IdeaLikeResponse>(`/api/ideas/${ideaId}/likes`);
  return data;
};

// ===== 댓글 목록 =====
export interface Reply {
  replyId: number;
  writerId: number;
  writerNickname: string;
  writerProfileImageUrl: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  commentId: number;
  writerId: number;
  writerNickname: string;
  writerProfileImageUrl: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  replies: Reply[];
}

export interface IdeaCommentsResponse {
  ideaId: number;
  comments: Comment[];
  // 댓글이 하나도 없을 때만 내려옴
  message?: string;
}

export const getIdeaComments = async (ideaId: number): Promise<IdeaCommentsResponse> => {
  const { data } = await apiClient.get<IdeaCommentsResponse>(`/api/ideas/${ideaId}/comments`);
  return data;
};

// ===== 댓글 작성 =====
export interface CreateCommentRequest {
  content: string;
}

export interface CreateCommentResponse {
  commentId: number;
  ideaId: number;
  writerId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const postIdeaComment = async (
  ideaId: number,
  request: CreateCommentRequest,
): Promise<CreateCommentResponse> => {
  const { data } = await apiClient.post<CreateCommentResponse>(
    `/api/ideas/${ideaId}/comments`,
    request,
  );
  return data;
};

// ===== 댓글 삭제 =====
export interface DeleteCommentResponse {
  message: string;
}

export const deleteComment = async (commentId: number): Promise<DeleteCommentResponse> => {
  const { data } = await apiClient.delete<DeleteCommentResponse>(`/api/comments/${commentId}`);
  return data;
};

// ===== 답글 달기 =====
export interface CreateReplyRequest {
  content: string;
}

export interface CreateReplyResponse {
  replyId: number;
  parentCommentId: number;
  writerId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const postCommentReply = async (
  commentId: number,
  request: CreateReplyRequest,
): Promise<CreateReplyResponse> => {
  const { data } = await apiClient.post<CreateReplyResponse>(
    `/api/comments/${commentId}/replies`,
    request,
  );
  return data;
};
