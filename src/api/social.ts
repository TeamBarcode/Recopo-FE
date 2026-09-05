import { apiClient } from './client';

// ===== 좋아요 =====
export interface IdeaLikeResponse {
  ideaId: number;
  liked: boolean;
  likeCount: number;
}

// 명세상 "다시 누르면 좋아요 취소됨"이라고 되어있어 POST 자체가 토글로 동작할 수도 있음
// — 실제 연동 시 DELETE(deleteIdeaLike)를 계속 써야 하는지 확인 필요
export const postIdeaLike = async (ideaId: number): Promise<IdeaLikeResponse> => {
  const { data } = await apiClient.post<IdeaLikeResponse>(`/api/ideas/${ideaId}/likes`);
  return data;
};

// ===== 좋아요 취소 =====
// 명세 예시 응답 필드가 cardId로 되어있음(좋아요 쪽은 ideaId) — 스펙 오타로 보이나 일단 그대로 반영,
// 연동 시 실제 응답 필드명 확인 필요
export interface IdeaUnlikeResponse {
  cardId: number;
  liked: boolean;
  likeCount: number;
}

export const deleteIdeaLike = async (ideaId: number): Promise<IdeaUnlikeResponse> => {
  const { data } = await apiClient.delete<IdeaUnlikeResponse>(`/api/ideas/${ideaId}/likes`);
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
