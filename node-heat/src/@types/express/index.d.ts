/**
 * * add prop user_id to request object
 */
declare namespace Express {
  export interface Request {
    user_id: string
  }
}