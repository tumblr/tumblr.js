export type PostState = 'published' | 'queue' | 'draft' | 'private' | 'unapproved';

export interface AudioBlock {
  type: 'audio';
  [prop: string]: any;
}
export interface ImageBlock {
  type: 'image';
  [prop: string]: any;
}
export interface LinkBlock {
  type: 'link';
  [prop: string]: any;
}
export interface PaywallBlock {
  type: 'paywall';
  [prop: string]: any;
}
export interface TextBlock {
  type: 'text';
  [prop: string]: any;
}
export interface VideoBlock {
  type: 'video';
  [prop: string]: any;
}

export type NpfContentBlock =
  | AudioBlock
  | ImageBlock
  | LinkBlock
  | PaywallBlock
  | TextBlock
  | VideoBlock;

export interface NpfLayoutAsk {
  type: 'ask';
  blocks: ReadonlyArray<number>;
  attribution: any;
}

export interface NpfLayoutRows {
  type: 'rows';
  display: ReadonlyArray<{ blocks: ReadonlyArray<number>; mode?: { type: string } }>;
  truncate_after?: 1;
}

export type NpfLayoutBlock = NpfLayoutAsk | NpfLayoutRows;

export interface NpfPostParams {
  /**
   * An array of NPF content blocks to be used to make the post; in a reblog, this is any content you want to add.
   * @link https://www.tumblr.com/docs/npf#content-blocks
   */
  content: ReadonlyArray<NpfContentBlock>;

  /**
   * An array of NPF layout objects to be used to lay out the post content.
   * @link https://www.tumblr.com/docs/npf#layout-blocks
   */
  layout?: ReadonlyArray<NpfLayoutBlock>;

  /**
   * The initial state of the new post. Defaults to "published".
   */
  state?: PostState;

  /**
   * The exact future date and time (ISO 8601 format) to publish the post, if desired.
   * This parameter will be ignored unless the state parameter is "queue".
   */
  publish_on?: string;

  /**
   * The exact date and time (ISO 8601 format) in the past to backdate the post, if desired.
   * This backdating does not apply to when the post shows up in the Dashboard.
   */
  date?: string;

  /**
   * Tags to associate with the post.
   */
  tags?: ReadonlyArray<string>;

  /**
   * A source attribution for the post content.
   */
  source_url?: string;

  /**
   * Whether this should be a private answer, if this is an answer.
   */
  is_private?: boolean;

  /**
   * A custom URL slug to use in the post's permalink URL.
   */
  slug?: string;

  /**
   * Who can interact with this when reblogging
   */
  interactability_reblog?: 'everyone' | 'noone';
}

export interface NpfReblogParams extends NpfPostParams {
  /**
   * The unique public identifier of the Tumblelog that's being reblogged from.
   */
  parent_tumblelog_uuid: string;

  /**
   * The unique public post ID being reblogged.
   */
  parent_post_id: string;

  /**
   * The unique per-post hash validating that this is a genuine reblog action.
   */
  reblog_key: string;

  /**
   * Whether or not to hide the reblog trail with this new post. Defaults to false
   */
  hide_trail?: boolean;

  /**
   * Instead of `hide_trail`, use this to specify an array of specific reblog trail item indexes to exclude from your reblog.
   */
  exclude_trail_items?: boolean;
}
