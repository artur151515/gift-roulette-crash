import { http } from './http';
import {
  TelegramLoginDto, TelegramLoginResponseDto,
  UserResponseDto
} from '@/types/auth';

export async function loginWithTelegram(dto: TelegramLoginDto) {
  const { data } = await http.post<TelegramLoginResponseDto>('/auth/telegram', dto);
  return data;
}

export async function getMe() {
  const { data } = await http.get<UserResponseDto>('/auth/me');
  return data;
}
