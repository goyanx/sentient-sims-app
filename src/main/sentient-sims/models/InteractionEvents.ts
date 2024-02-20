import { SentientSim } from './SentientSim';

export enum SSEventType {
  WICKED_WHIMS = 'wickedwhims',
  INTERACTION = 'interaction',
  WANTS = 'wants',
  DO_SOMETHING = 'dosomething',
  CONTINUE = 'continue',
}

export enum WWEventType {
  ASKING = 'asking',
  STARTING = 'starting',
  ACTIVE = 'active',
  MAPPING = 'mapping',
}

export type SSTime = {
  second: number;
  minute: number;
  hour: number;
  day: number;
  week: number;
};

export type SSEnvironment = {
  location_id: number;
  world_id: number;
  time: SSTime;
  weather?: any;
  season?: any;
};

export type SSEvent = {
  event_id: string;
  event_type: SSEventType;
  // TODO: Deprecated
  location_id: number;
  environment: SSEnvironment;
  sentient_sims: SentientSim[];
};

export type WWInteractionEvent = SSEvent & {
  sex_category: number;
  sex_location: number;
  testing_action?: string;
  animation_author: string;
  animation_name: string;
  animation_identifier: string;
  ww_event_type: WWEventType;
};

export type WantsInteractionEvent = SSEvent;

export type ContinueInteractionEvent = SSEvent;

export type InteractionEvent = SSEvent & {
  interaction_name: string;
};

export type DoSomethingInteractionEvent = SSEvent & {
  action: string;
};

export type InteractionEvents =
  | WWInteractionEvent
  | WantsInteractionEvent
  | ContinueInteractionEvent
  | InteractionEvent
  | DoSomethingInteractionEvent;
