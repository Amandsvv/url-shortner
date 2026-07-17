export class ApiSuccessResponse<T> {
  public readonly success = true;

  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly data: T,
  ) {}
}