import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard, IAuthModuleOptions } from "@nestjs/passport";

export function SocialActionGuard(provider: 'google' | 'github', action: 'login' | 'register'){
    @Injectable()
    class Guard extends AuthGuard(provider) {
        getAuthenticateOptions(context: ExecutionContext){
            return {
                state: JSON.stringify({action: action})
            }
        }
    }

    return new Guard()
}