/**
 * Утилита для шифрования/расшифровки токенов в памяти
 * Защита от XSS атак и кражи токенов
 */

import CryptoJS from 'crypto-js';

/**
 * Генерирует ключ шифрования на основе уникальных данных браузера
 * Ключ уникален для каждой сессии и не сохраняется
 */
const getEncryptionKey = (): string => {
    // Используем комбинацию уникальных данных браузера
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const platform = navigator.platform;
    
    // Добавляем случайное значение для уникальности
    const sessionId = sessionStorage.getItem('sessionId') || generateSessionId();
    sessionStorage.setItem('sessionId', sessionId);
    
    // Комбинируем все данные
    const combined = `${userAgent}-${language}-${platform}-${sessionId}`;
    
    // Создаем SHA256 хеш для получения фиксированной длины ключа
    return CryptoJS.SHA256(combined).toString();
};

/**
 * Генерирует уникальный ID сессии
 */
const generateSessionId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Шифрует токен перед сохранением в памяти
 * @param token - JWT токен для шифрования
 * @returns Зашифрованный токен в формате base64
 */
export const encryptToken = (token: string): string => {
    try {
        const key = getEncryptionKey();
        const encrypted = CryptoJS.AES.encrypt(token, key).toString();
        return encrypted;
    } catch (error) {
        console.error('Token encryption failed:', error);
        // В продакшене не возвращаем оригинальный токен из соображений безопасности
        throw new Error('Failed to encrypt token');
    }
};

/**
 * Расшифровывает токен из памяти
 * @param encryptedToken - Зашифрованный токен
 * @returns Расшифрованный JWT токен
 */
export const decryptToken = (encryptedToken: string): string => {
    try {
        const key = getEncryptionKey();
        const decrypted = CryptoJS.AES.decrypt(encryptedToken, key);
        const token = decrypted.toString(CryptoJS.enc.Utf8);
        
        // Проверяем, что расшифровка прошла успешно
        if (!token) {
            throw new Error('Failed to decrypt token');
        }
        
        return token;
    } catch (error) {
        console.error('Token decryption failed:', error);
        throw new Error('Invalid encrypted token');
    }
};

/**
 * Проверяет, является ли строка зашифрованным токеном
 * @param token - Токен для проверки
 * @returns true если токен зашифрован
 */
export const isEncrypted = (token: string): boolean => {
    // Зашифрованные токены имеют определенную структуру (base64)
    // JWT токены имеют формат: header.payload.signature
    try {
        // Проверяем формат JWT (3 части, разделенные точками)
        const parts = token.split('.');
        if (parts.length === 3) {
            // Это JWT, не зашифрован
            return false;
        }
        // Если не JWT, считаем зашифрованным
        return true;
    } catch {
        return false;
    }
};

/**
 * Безопасно шифрует токен, проверяя его формат
 * @param token - Токен для шифрования
 * @returns Зашифрованный токен
 */
export const safeEncryptToken = (token: string | null): string | null => {
    if (!token) return null;
    
    // Если токен уже зашифрован, возвращаем как есть
    if (isEncrypted(token)) {
        return token;
    }
    
    return encryptToken(token);
};

/**
 * Безопасно расшифровывает токен
 * @param token - Токен для расшифровки
 * @returns Расшифрованный токен или оригинал если не зашифрован
 */
export const safeDecryptToken = (token: string | null): string | null => {
    if (!token) return null;
    
    // Если токен не зашифрован (JWT формат), возвращаем как есть
    if (!isEncrypted(token)) {
        return token;
    }
    
    try {
        return decryptToken(token);
    } catch (error) {
        console.error('Failed to decrypt token:', error);
        return null;
    }
};

/**
 * Очищает все данные шифрования из сессии
 */
export const clearEncryptionData = (): void => {
    sessionStorage.removeItem('sessionId');
};

