import { IsUrl, IsNotEmpty } from 'class-validator';

export class CreateUrlDto {
  @IsUrl({}, { message: 'L\'URL doit être valide' })
  @IsNotEmpty({ message: 'L\'URL est requise' })
  original: string;
}
