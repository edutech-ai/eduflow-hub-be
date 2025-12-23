import { Response } from 'express';
import { HTTP_STATUS, HTTP_MESSAGE } from '@/constants/http.constant.js';

interface SuccessResponse<T = any> {
  success: true;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export const sendSuccess = <T = any>(
  res: Response,
  data?: T,
  message: string = HTTP_MESSAGE.OK,
  statusCode: number = HTTP_STATUS.OK
): Response => {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    data,
  };

  return res.status(statusCode).json(response);
};

export const sendCreated = <T = any>(res: Response, data?: T, message: string = HTTP_MESSAGE.CREATED): Response => {
  return sendSuccess(res, data, message, HTTP_STATUS.CREATED);
};

export const sendAccepted = <T = any>(res: Response, data?: T, message: string = HTTP_MESSAGE.ACCEPTED): Response => {
  return sendSuccess(res, data, message, HTTP_STATUS.ACCEPTED);
};

export const sendPaginated = <T = any>(
  res: Response,
  data: T,
  meta: { page: number; limit: number; total: number },
  message: string = HTTP_MESSAGE.OK
): Response => {
  const totalPages = Math.ceil(meta.total / meta.limit);

  const response: SuccessResponse<T> = {
    success: true,
    message,
    data,
    meta: {
      ...meta,
      totalPages,
    },
  };

  return res.status(HTTP_STATUS.OK).json(response);
};
