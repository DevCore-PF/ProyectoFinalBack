import {
  Controller,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CourseFeedbackService } from './courseFeedback.service';
import { ApiCreateCourseFeedbackDocs } from './doc/courseFeedback.doc';
import { CreateCourseFeedbackDto } from './dto/courseFeedback.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiGetAllFeedbacksDocs } from './doc/getAllFeedbacks.doc';
import { ApiGetCourseFeedbacksDocs } from './doc/getFeedbackByCourseId.doc';
import { ApiHasUserFeedbackDocs } from './doc/getFeedbackAuthUser.doc';

@ApiTags('Course Feedback')
@Controller('course-feedback')
export class CourseFeedbackController {
  constructor(private readonly feedbackService: CourseFeedbackService) {}

  @Post(':courseId/')
  @UseGuards(AuthGuard('jwt'))
  @ApiCreateCourseFeedbackDocs()
  async createFeedback(
    @Param('courseId') courseId: string,
    @Req() req,
    @Body() dto: CreateCourseFeedbackDto,
  ) {
    const userId = req.user.sub;
    return await this.feedbackService.createFeedback(userId, courseId, dto);
  }

  @Get('')
  @ApiGetAllFeedbacksDocs()
  async getAllFeedBacks() {
    return await this.feedbackService.getAllFeedBacks();
  }

  @Get(':courseId/feedbacks')
  @ApiGetCourseFeedbacksDocs()
  async getCourseFeedbacks(@Param('courseId') courseId: string) {
    return await this.feedbackService.getCourseFeedbacks(courseId);
  }

  @Get(':courseId/user-feedback')
  @ApiHasUserFeedbackDocs()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async hasUserFeedback(@Param('courseId') courseId: string, @Req() req) {
    const userId = req.user.sub;
    const hasFeedback = await this.feedbackService.hasUserFeedback(
      userId,
      courseId,
    );
    return { hasFeedback };
  }
}
