import { apiClient } from './client';

// ===== 친구 신청 =====
export interface FriendRequestBody {
  receiverId: number;
}

export interface FriendRequestResponse {
  friendRequestId: number;
  senderId: number;
  receiverId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export const postFriendRequest = async (
  request: FriendRequestBody,
): Promise<FriendRequestResponse> => {
  const { data } = await apiClient.post<FriendRequestResponse>('/api/friends/requests', request);
  return data;
};

// ===== 친구 목록 조회 =====
export interface Friend {
  memberId: number;
  nickname: string;
  profileImageUrl: string;
  friendSince: string;
}

export interface FriendsResponse {
  friends: Friend[];
}

export const getFriends = async (): Promise<FriendsResponse> => {
  const { data } = await apiClient.get<FriendsResponse>('/api/friends');
  return data;
};

// ===== 친구 삭제 =====
export interface DeleteFriendResponse {
  message: string;
}

export const deleteFriend = async (friendId: number): Promise<DeleteFriendResponse> => {
  const { data } = await apiClient.delete<DeleteFriendResponse>(`/api/friends/${friendId}`);
  return data;
};

// ===== 친구 카드 목록 조회 =====
export interface FriendCard {
  cardId: number;
  title: string;
  thumbnailUrl: string;
  likedByMe: boolean;
  updatedAt: string;
}

export interface FriendCardsResponse {
  friendId: number;
  friendNickname: string;
  cards: FriendCard[];
  // 공개된 카드가 없는 경우에만 내려옴
  message?: string;
}

export const getFriendCards = async (friendId: number): Promise<FriendCardsResponse> => {
  const { data } = await apiClient.get<FriendCardsResponse>(`/api/friends/${friendId}/cards`);
  return data;
};

// ===== 친구 요청 확인(받은 요청 목록) =====
export interface ReceivedFriendRequest {
  requestId: number;
  senderId: number;
  senderNickname: string;
  // 명세 예시 중 일부 항목에만 존재해서 선택값으로 처리
  senderUniversity?: string;
  senderProfileImageUrl: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface ReceivedFriendRequestsResponse {
  friendRequests: ReceivedFriendRequest[];
}

export const getReceivedFriendRequests = async (): Promise<ReceivedFriendRequestsResponse> => {
  const { data } = await apiClient.get<ReceivedFriendRequestsResponse>(
    '/api/friends/requests/received',
  );
  return data;
};

// ===== 친구 요청 수락 =====
export interface AcceptFriendRequestResponse {
  requestId: number;
  senderId: number;
  receiverId: number;
  status: 'ACCEPTED';
  message: string;
  acceptedAt: string;
}

export const patchAcceptFriendRequest = async (
  requestId: number,
): Promise<AcceptFriendRequestResponse> => {
  const { data } = await apiClient.patch<AcceptFriendRequestResponse>(
    `/api/friends/requests/${requestId}/accept`,
  );
  return data;
};

// ===== 친구 요청 거절 =====
export interface RejectFriendRequestResponse {
  requestId: number;
  senderId: number;
  receiverId: number;
  status: 'REJECTED';
  message: string;
  rejectedAt: string;
}

export const patchRejectFriendRequest = async (
  requestId: number,
): Promise<RejectFriendRequestResponse> => {
  const { data } = await apiClient.patch<RejectFriendRequestResponse>(
    `/api/friends/requests/${requestId}/reject`,
  );
  return data;
};
