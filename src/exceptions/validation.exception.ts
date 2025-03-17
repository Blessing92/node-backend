import { BadRequestException } from './http-exception';

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationException extends BadRequestException {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super('Validation failed');
    this.errors = errors;
  }
}
