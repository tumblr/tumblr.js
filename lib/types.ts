import { type ReadStream } from 'node:fs';
import { type IncomingMessage } from 'node:http';

export interface Options {
  /**
   * OAuth1 credential. Required for API key auth endpoints.
   */
  consumer_key?: string;
  /**
   * OAuth1 credential. Required for OAuth endpoints.
   */
  consumer_secret?: string;
  /**
   * OAuth1 credential. Required for OAuth endpoints.
   */
  token?: string;
  /**
   * OAuth1 credential. Required for Oauth endpoints.
   */
  token_secret?: string;
  /**
   * (optional) The API url if different from the default.
   */
  baseUrl?: string;
  /**
   * @deprecated Methods will return promises if no callback is provided.
   */
  returnPromises?: boolean;
}

/**
 * Handles the response from a client reuest
 *
 * @param err - error message
 * @param resp - response body
 * @param response - raw response
 */
export type TumblrClientCallback = (
  err: Error | null,
  resp: Record<string, any> | null,
  response?: IncomingMessage | null | undefined,
) => void;

export type PostState = 'published' | 'queue' | 'draft' | 'private' | 'unapproved';

/**
 * Many content blocks and their components include media objects which link directly to media assets.
 * These media objects share a common JSON object format.
 *
 * @link https://github.com/tumblr/docs/blob/master/npf-spec.md#media-objects
 */
export interface MediaObject {
  /**
   * The canonical URL of the media asset
   */
  url: string;
  /**
   * The MIME type of the media asset, or a best approximation will be made based on the given URL
   * @example "image/jpg"
   */
  type?: string;
  /**
   * The width of the media asset, if that makes sense (for images and videos, but not for audio)
   */
  width?: number;
  /**
   * The height of the media asset, if that makes sense (for images and videos, but not for audio)
   */
  height?: number;
  /**
   * For display purposes, this indicates whether the dimensions are defaults
   */
  original_dimensions_missing?: boolean;
  /**
   * This indicates whether this media object has the same dimensions as the original media
   */
  has_original_dimensions?: boolean;
  /**
   * This indicates whether this media object is a cropped version of the original media
   */
  cropped?: boolean;
}

export interface AudioBlock {
  type: 'audio';
  /**
   * NPF MediaObject or Node.js fs.ReadStream object
   *
   * Provide a fs.ReadStream object to upload media or an object satisfying the MediaObject interface to use existing media.
   *
   * @link https://www.tumblr.com/docs/npf#media-objects
   * @link https://nodejs.org/docs/latest-v18.x/api/fs.html#class-fsreadstream
   */
  media: ReadStream | MediaObject;
  [prop: string]: any;
}
export interface ImageBlock {
  type: 'image';
  /**
   * NPF MediaObject or Node.js fs.ReadStream object
   *
   * Provide a fs.ReadStream object to upload media or an object satisfying the MediaObject interface to use existing media.
   *
   * @link https://www.tumblr.com/docs/npf#media-objects
   * @link https://nodejs.org/docs/latest-v18.x/api/fs.html#class-fsreadstream
   */
  media: ReadStream | MediaObject;
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
  /**
   * NPF MediaObject or Node.js fs.ReadStream object
   *
   * Provide a fs.ReadStream object to upload media or an object satisfying the MediaObject interface to use existing media.
   *
   * @link https://www.tumblr.com/docs/npf#media-objects
   * @link https://nodejs.org/docs/latest-v18.x/api/fs.html#class-fsreadstream
   */
  media: ReadStream | MediaObject;
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
