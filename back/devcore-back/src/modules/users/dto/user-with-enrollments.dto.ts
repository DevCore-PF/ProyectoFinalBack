import { ApiProperty } from '@nestjs/swagger';

export class UserWithEnrollmentsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ type: () => [EnrollmentDto] })
  enrollments: EnrollmentDto[];

  @ApiProperty({ type: () => ProfessorProfileDto, nullable: true })
  professorProfile?: ProfessorProfileDto;
}

export class EnrollmentDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: () => CourseDto })
  course: CourseDto;
}

export class CourseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ type: () => ProfessorDto })
  professor: ProfessorDto;
}

export class ProfessorDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: () => UserBasicDto })
  user: UserBasicDto;
}

export class UserBasicDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

export class ProfessorProfileDto {
  @ApiProperty()
  bio: string;

  @ApiProperty()
  specialty: string;
}
