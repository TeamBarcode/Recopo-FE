import { mockUser, type User } from './user';

// ===== 로그인 =====
export interface LoginRequest {
  userId: string;
  password: string;
}

export interface LoginResponse {
    accessToken : string;
    user : User;
}

export interface LoginErrorResponse {
    errorCode: 'ID_NOT_FOUND' | 'WRONG_PASSWORD';
    message: string; // 화면에 보여줄 실제 에러 문구
}


export const mockLoginSuccess : LoginResponse = {
    accessToken: 'fake-access-token-abc123',
    user: mockUser,
}//실제 성공 데이터 만들기

export const mockLoginErrorIdNotFound : LoginErrorResponse = {
    errorCode: 'ID_NOT_FOUND',
    message: '존재하지 않는 아이디예요',
};

export const mockLoginErrorWrongPassword : LoginErrorResponse = {
    errorCode: 'WRONG_PASSWORD',
    message: '틀린 비밀번호예요',
}; //실제 에러 데이터 만들기

//가짜 서버 함수
const VALID_USER_ID = 'testuser';
const VALID_PASSWORD = 'test1234!';

export const fetchMockLogin = async (
    request: LoginRequest
) : Promise<LoginResponse> => {
    await new Promise((r) => setTimeout(r, 500));
    // 실제 api 호출에서도 async 쓰므로 여기서도 이렇게 구현
    if (request.userId !== VALID_USER_ID) throw mockLoginErrorIdNotFound;
    if(request.password !== VALID_PASSWORD) throw mockLoginErrorWrongPassword;

    return mockLoginSuccess;
};


// ===== 회원가입 =====
export interface SignupRequest {
    email : string;
    password : string;
}

export interface SignupResponse {
    accessToken : string; // 이후 프로필설정 API 호출 시 인증에 사용
    id : string; // 시스템 내부 식별자 (이 시점엔 nickname, userId 없음)
}

export interface SignupErrorResponse {
    errorCode : 'EMAIL_ALREADY_EXISTS';
    message : string; // 화면에 보여줄 실제 에러 문구
}

export const mockSignupErrorEmailExists: SignupErrorResponse = {
  errorCode: 'EMAIL_ALREADY_EXISTS',
  message: '이미 사용 중인 이메일이에요',
};

// 가짜 서버 함수
const EXISTING_EMAIL = 'existing@ewha.ac.kr'; //중복되는 이메일

export const fetchMockSignup = async (
    request : SignupRequest
) : Promise <SignupResponse> => {
    await new Promise((r) => setTimeout(r, 500));
    //이메일 중복 체크
    if(request.email === EXISTING_EMAIL) throw mockSignupErrorEmailExists;
    return {
        accessToken : 'fake-access-token-xyz789', //고정된 가짜 인증 토큰 값
        id : mockUser.id, // mockUser의 id를 재사용 (임의로 지어내지 않음)
    };
};



// ===== 프로필 설정 =====
export interface ProfileSetupRequest {
    userId : string;
    nickname : string;
    profileImageUrl? : string;
}

export interface ProfileSetupResponse {
    user : User; //설정 완료 후의 유저 정보
}

export interface ProfileSetupErrorResponse {
    errorCode : 'ID_ALREADY_EXISTS';
    message : string;
}

export const mockProfileSetupErrorIdExists : ProfileSetupErrorResponse = {
    errorCode : 'ID_ALREADY_EXISTS',
    message : '이미 사용 중인 아이디예요',
};

//가짜 서버 함수
const EXISTING_USER_ID = 'existinguser';

export const fetchMockProfileSetup = async (
    request : ProfileSetupRequest
) : Promise <ProfileSetupResponse> => {
    await new Promise((r) => setTimeout(r, 500));

    if(request.userId === EXISTING_USER_ID) throw mockProfileSetupErrorIdExists;
    return {
        user : {
            ...mockUser, 
            userId : request.userId,
            nickname : request.nickname,
        },
    };
};
