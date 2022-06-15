// Hand generated Typescript types from these proto files.
// This leaves out less important fields.
// https://github.com/promotedai/schema/blob/main/proto/event/event.proto
// https://github.com/promotedai/schema/blob/main/proto/common/common.proto

export interface User extends HasUserInfo {
  properties?: Properties;
}

// TODO - auto-gen type from proto.
export interface CohortMembership extends HasUserInfo {
  membershipId?: string;
  cohortId?: string;
  arm?: CohortArmMap[keyof CohortArmMap] | CohortArmString;
  properties?: Properties;
}

export interface CohortArmMap {
  UNKNOWN_GROUP: 0;
  CONTROL: 1;
  TREATMENT: 2;

  // These are generic arms (groups) that can be used when there are multiple treatments.
  TREATMENT1: 3;
  TREATMENT2: 4;
  TREATMENT3: 5;
}

export type CohortArmString = 'UNKNOWN_GROUP' | 'CONTROL' | 'TREATMENT' | 'TREATMENT1' | 'TREATMENT2' | 'TREATMENT3';

// TODO - auto-gen type from proto.
export interface View extends HasUserInfo {
  viewId?: string;
  autoViewId?: string;
  sessionId?: string;
  name?: string;
  useCase?: UseCaseMap[keyof UseCaseMap] | UseCaseString;
  searchQuery?: string;
  properties?: Properties;
}

export interface UseCaseMap {
  UNKNOWN_USE_CASE: 0;
  CUSTOM: 1; // Need to handle in wrapper proto.
  SEARCH: 2;
  SEARCH_SUGGESTIONS: 3;
  FEED: 4;
  RELATED_CONTENT: 5;
  CLOSE_UP: 6;
  CATEGORY_CONTENT: 7;
  MY_CONTENT: 8;
  MY_SAVED_CONTENT: 9;
  SELLER_CONTENT: 10;
  DISCOVER: 11;
}

export type UseCaseString =
  | 'UNKNOWN_USE_CASE'
  | 'CUSTOM'
  | 'SEARCH'
  | 'SEARCH_SUGGESTIONS'
  | 'FEED'
  | 'RELATED_CONTENT'
  | 'CLOSE_UP'
  | 'CATEGORY_CONTENT'
  | 'MY_CONTENT'
  | 'MY_SAVED_CONTENT'
  | 'SELLER_CONTENT'
  | 'DISCOVER';

// TODO - auto-gen type from proto.
export interface Impression extends HasUserInfo {
  impressionId?: string;
  insertionId?: string;
  contentId?: string;
  requestId?: string;
  viewId?: string;
  autoViewId?: string;
  sessionId?: string;
  sourceType?: ImpressionSourceTypeMap[keyof ImpressionSourceTypeMap] | ImpressionSourceTypeString;
  properties?: Properties;
}

export interface ImpressionSourceTypeMap {
  UNKNOWN_IMPRESSION_SOURCE_TYPE: 0;

  // Content was served by Promoted Delivery API.
  DELIVERY: 1;

  // Content was not served by Promoted Delivery API.
  CLIENT_BACKEND: 2;
}

export type ImpressionSourceTypeString = 'UNKNOWN_IMPRESSION_SOURCE_TYPE' | 'DELIVERY' | 'CLIENT_BACKEND';

// TODO - auto-gen type from proto.
export interface Action extends HasUserInfo {
  actionId?: string;
  impressionId?: string;
  insertionId?: string;
  contentId?: string;
  requestId?: string;
  viewId?: string;
  autoViewId?: string;
  sessionId?: string;
  name?: string;
  actionType?: ActionTypeMap[keyof ActionTypeMap] | ActionTypeString;
  elementId?: string;
  navigateAction?: NavigateAction;
  properties?: Properties;
}

export interface NavigateAction {
  targetUrl?: string;
}

export interface ActionTypeMap {
  UNKNOWN_ACTION_TYPE: 0;

  // Action that doesn't correspond to any of the below.
  CUSTOM_ACTION_TYPE: 1;

  // Navigating to details about content.
  NAVIGATE: 2;

  // Adding an item to shopping cart.
  ADD_TO_CART: 4;

  // Remove an item from shopping cart.
  REMOVE_FROM_CART: 10;

  // Going to checkout.
  CHECKOUT: 8;

  // Purchasing an item.
  PURCHASE: 3;

  // Sharing content.
  SHARE: 5;

  // Liking content.
  LIKE: 6;

  // Un-liking content.
  UNLIKE: 9;

  // Commenting on content.
  COMMENT: 7;

  // Making an offer on content.
  MAKE_OFFER: 11;

  // Asking a question about content.
  ASK_QUESTION: 12;

  // Answering a question about content.
  ANSWER_QUESTION: 13;

  // Complete sign-in.
  // No content_id needed.  If set, set it to the Content's ID (not User).
  COMPLETE_SIGN_IN: 14;

  // Complete sign-up.
  // No content_id needed.  If set, set it to the Content's ID (not User).
  COMPLETE_SIGN_UP: 15;
}

export type ActionTypeString =
  | 'UNKNOWN_ACTION_TYPE'
  | 'CUSTOM_ACTION_TYPE'
  | 'NAVIGATE'
  | 'ADD_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'CHECKOUT'
  | 'PURCHASE'
  | 'SHARE'
  | 'LIKE'
  | 'UNLIKE'
  | 'COMMENT'
  | 'MAKE_OFFER'
  | 'ASK_QUESTION'
  | 'ANSWER_QUESTION'
  | 'COMPLETE_SIGN_IN'
  | 'COMPLETE_SIGN_UP';

// This is not a proto.  This is an interface just for this library.
export interface Click extends Action {
  targetUrl: string;
}

export interface HasUserInfo {
  userInfo?: UserInfo;
}

export interface UserInfo {
  userId?: string;
  logUserId?: string;
  isInternalUser?: boolean;
  ignoreUsage?: boolean;
}

export interface Properties {
  struct: any;
}
