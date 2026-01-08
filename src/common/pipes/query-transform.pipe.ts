
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class QueryTransformPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'query' && value && typeof value === 'object') {
      for (const key in value) {
        const val = value[key];
        if (val === 'true' || val === '1') value[key] = true;
        else if (val === 'false' || val === '0') value[key] = false;
        else if (!isNaN(val) && val.trim() !== '') value[key] = Number(val);
      }
    }
    return value;
  }
}
