import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { isValidSuiAddress } from '@mysten/sui/utils';

export function IsSuiAddress(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isSuiAddress',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          console.log(value, isValidSuiAddress(value));

          return typeof value === 'string' && isValidSuiAddress(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid Sui wallet address`;
        },
      },
    });
  };
}
