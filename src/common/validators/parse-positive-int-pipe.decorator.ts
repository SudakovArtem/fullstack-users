import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParsePositiveIntPipe
  extends ParseIntPipe
  implements PipeTransform
{
  constructor() {
    super();
  }

  async transform(
    value: string,
    metadata: ArgumentMetadata,
  ): Promise<number | null | undefined> {
    const val = await super.transform(value, metadata);
    if (typeof val === 'number' && val <= 0) {
      throw new BadRequestException('Value must be a positive integer');
    }

    return val;
  }
}
