import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import * as dns from 'dns';
import { testDomains } from '../test-domain'; // Verifique o caminho da importação

@ValidatorConstraint({ async: true })
export class IsValidEmailConstraint implements ValidatorConstraintInterface {
  async validate(email: any): Promise<boolean> {
    if (typeof email !== 'string') {
      return false;
    }

    const domain = email.split('@')[1];

    if (testDomains.includes(domain)) {
      return false;
    }

    const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidFormat) {
      return false;
    }

    try {
      const mxRecords = await new Promise<dns.MxRecord[]>((resolve, reject) => {
        dns.resolveMx(domain, (err, addresses) => {
          if (err) {
            // Se houver um erro, a validação falha
            return reject(err);
          }
          resolve(addresses);
        });
      });
      // A validação é bem-sucedida se houver pelo menos um registro MX
      return mxRecords.length > 0;
    } catch (error) {
      // Qualquer erro de DNS significa que o domínio não é válido
      return false;
    }
  }

  defaultMessage(): string {
    return 'O e-mail ($value) não é válido ou o domínio não existe.';
  }
}

export function IsValidEmail(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidEmailConstraint,
    });
  };
}