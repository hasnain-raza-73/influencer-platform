import { IsEnum } from 'class-validator';

export enum InvitationAction {
  ACCEPT = 'ACCEPT',
  DECLINE = 'DECLINE',
}

export class RespondToInvitationDto {
  @IsEnum(InvitationAction, { message: 'Action must be ACCEPT or DECLINE' })
  action: InvitationAction;
}
