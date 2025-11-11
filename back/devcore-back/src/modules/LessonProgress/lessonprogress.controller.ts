import {
  Controller,
  Post,
  Param,
  Req,
  UseGuards,
  Get,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LessonProgressService } from './lessonprogress.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiMarkLessonCompleteDocs } from './doc/lessonprogress.docs';
import { ApiGetCompletedLessonbyCourse } from './doc/getCompleteLessonbyCourse.doc';

@Controller('lesson-progress')
export class LessonProgressController {
  constructor(private readonly lessonProgressService: LessonProgressService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post(':lessonId/complete')
  @ApiMarkLessonCompleteDocs()
  async completeLesson(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Req() req,
  ) {
    const userId = req.user.sub;
    return await this.lessonProgressService.markLessonCompleted(
      userId,
      lessonId,
    );
  }

  @Get('completed/:courseId')
  @UseGuards(AuthGuard('jwt'))
  @ApiGetCompletedLessonbyCourse()
  async getCompletedLessons(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Req() req,
  ) {
    const userId = req.user.sub;
    return this.lessonProgressService.getCompletedLessons(userId, courseId);
  }
}
