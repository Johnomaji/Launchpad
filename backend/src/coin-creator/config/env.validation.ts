import { plainToInstance } from 'class-transformer';
import { IsBase64, IsNotEmpty, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsBase64()
  @IsNotEmpty()
  SUI_PRIVATE_KEY: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
