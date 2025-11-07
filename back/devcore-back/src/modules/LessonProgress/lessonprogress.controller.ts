import { Controller, Post, Param, Req, UseGuards } from '@nestjs/common';
import { LessonProgressService } from './lessonprogress.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiMarkLessonCompleteDocs } from './doc/lessonprogress.docs';

@Controller('lesson-progress')
export class LessonProgressController {
  constructor(private readonly progressService: LessonProgressService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post(':lessonId/complete')
  @ApiMarkLessonCompleteDocs()
  async completeLesson(@Param('lessonId') lessonId: string, @Req() req) {
    const userId = req.user.sub;
    return await this.progressService.markLessonCompleted(userId, lessonId);
  }
}
