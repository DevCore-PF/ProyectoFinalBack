export class SocialProfileDto {
    email: string;
    name: string;
    image: string;
    provider: 'google' | 'github';
    providerId: string;
}