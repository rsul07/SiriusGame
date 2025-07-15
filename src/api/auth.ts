import api from './index';
import type {User} from '@/types';

// Типы для запросов и ответов
interface LoginRequest {
    login_identifier: string;
    password: string;
}

interface RegisterRequest {
    full_name: string;
    email: string;
    phone: string;
    password: string;
    birthday: string;
    gender: 'male' | 'female';
}

interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface PasswordUpdate {
    old_password: string;
    new_password: string;
}

export async function registerApi(data: RegisterRequest): Promise<User> {
    const response = await api.post('/auth/register', data);
    return response.data;
}

export async function loginApi(data: LoginRequest): Promise<TokenResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
}

export async function getMeApi(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data;
}

export async function updateMeApi(data: Partial<User>): Promise<User> {
    const payload = {
        full_name: data.fullName,
        avatar_url: data.avatarUrl,
        height_cm: data.height,
        weight_kg: data.weight,
        birthday: data.birthday,
        gender: data.gender,
    };
    const response = await api.patch('/users/me', payload);
    return response.data;
}

export async function updatePasswordApi(data: PasswordUpdate): Promise<void> {
    await api.post('/users/me/password', data);
}

export async function uploadAvatarApi(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/users/me/avatar', formData, {
        headers: {'Content-Type': 'multipart/form-data'},
    });
    return response.data;
}