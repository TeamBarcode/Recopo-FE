export interface User {
    id : string;              // 시스템 내부 식별자 (고정, 안 보임)
    userId: string;          // 사용자가 정하는 로그인 아이디 (변경 가능, @userId로 화면에 보임)
    email : string;
    nickname : string;
    profileImageUrl? : string; //?=선택적
    // 패스워드는 화면에 안 보이므로 제외
}


export const mockUser : User = {
    id : 'user1',
    userId : 'ddddyn',
    email : '2476317@ewha.ac.kr',
    nickname : '떠윤',
    profileImageUrl : 'https://i.pinimg.com/736x/e7/e9/13/e7e9131a615c9fa1d829bef7fbc3f9a6.jpg',
};
