import { endOfDay, getUnixTime, startOfDay } from 'date-fns';

import { FollowUp } from '../entities/follow-up.entity';

export const formatFollowUpStatus = (followUp: FollowUp) => {
  if (followUp.is_done) {
    return 'Complete';
  }

  if (
    followUp.follow_up_at >= getUnixTime(startOfDay(new Date())) &&
    followUp.follow_up_at <= getUnixTime(endOfDay(new Date()))
  ) {
    return 'Due Today';
  }

  if (followUp.follow_up_at < getUnixTime(startOfDay(new Date()))) {
    return 'Overdue';
  }

  return 'Upcoming';
};
