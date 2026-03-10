/**
 * 扩展 Express Request 类型
 * 添加 rawBody 属性用于 Slack 签名Validation
 */
declare namespace Express {
  export interface Request {
    rawBody?: Buffer;
  }
}
