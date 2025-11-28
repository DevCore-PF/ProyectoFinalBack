import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { log } from 'console';

@Injectable()
export class TaskService {
  @Cron('*/10 * * * * *')
  handleCron() {
    // console.log('Hello word!');
  }
}
