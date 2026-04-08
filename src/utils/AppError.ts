export class AppError extends Error {
  statusCode: number;
  code: string;
  meta?: any;

  constructor(
    error: { message: string; status: number; code: string },
    meta?: any
  ) {
    super(error.message);
    this.statusCode = error.status;
    this.code = error.code;
    this.meta = meta;

    Error.captureStackTrace(this, this.constructor);
  }
}



// export type ErrorMeta = Record<string, any>;

// export class AppError extends Error {
//   statusCode: number;
//   code: string;
//   meta?: ErrorMeta;
//   isOperational: boolean;

//   constructor(
//     error: { message: string; status: number; code: string },
//     meta?: ErrorMeta
//   ) {
//     super(error.message);

//     this.statusCode = error.status;
//     this.code = error.code;
//     this.meta = meta;

//     this.isOperational = true; // ✅ distinguish known errors

//     Error.captureStackTrace(this, this.constructor);
//   }
// }