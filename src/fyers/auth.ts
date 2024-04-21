// export let currentUserAuthCode: string | null;
// export let currentUserAccessToken: string | null;

export function setAuthCode(auth_code: string) {
    process.env.AUTH_CODE = auth_code;
}

export function getAuthCode(){
    return process.env.AUTH_CODE;
}

export function setAccessToken(access_token: string) {
    process.env.ACCESS_TOKEN = access_token;
}

export function getAccessToken(){
    return process.env.ACCESS_TOKEN;
}