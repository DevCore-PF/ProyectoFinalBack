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
  async getAllFeedBacks() {
    return await this.feedbackService.getAllFeedBacks();
  }
}
