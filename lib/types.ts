import { type ReadStream } from 'node:fs';
import { type IncomingMessage } from 'node:http';

export type PostType = 'text' | 'quote' | 'link' | 'answer' | 'video' | 'audio' | 'photo' | 'chat';

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

export type PostFormatFilter = 'text' | 'raw';
export type PostState = 'published' | 'queue' | 'draft' | 'private' | 'unapproved';

/**
 * Many content blocks and their components include media objects which link directly to media assets.
 * These media objects share a common JSON object format.
 *
 * @see [Media objects documentation.](https://www.tumblr.com/docs/npf#media-objects)
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
   * @see [Media objects documentation.](https://www.tumblr.com/docs/npf#media-objects)
   * @see [`fs.ReadStream` documentation.](https://nodejs.org/docs/latest-v20.x/api/fs.html#class-fsreadstream)
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
   * @see [Media objects documentation.](https://www.tumblr.com/docs/npf#media-objects)
   * @see [`fs.ReadStream` documentation.](https://nodejs.org/docs/latest-v20.x/api/fs.html#class-fsreadstream)
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
   * @see [Media objects documentation.](https://www.tumblr.com/docs/npf#media-objects)
   * @see [`fs.ReadStream` documentation.](https://nodejs.org/docs/latest-v20.x/api/fs.html#class-fsreadstream)
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
   *
   * @see [Content blocks documentation.](https://www.tumblr.com/docs/npf#content-blocks)
   */
  content: ReadonlyArray<NpfContentBlock>;

  /**
   * An array of NPF layout objects to be used to lay out the post content.
   *
   * @see [Layout blocks documentation.](https://www.tumblr.com/docs/npf#layout-blocks)
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

export interface BlogPostsParams {
  /**
   * A specific post ID. Returns the single post specified or (if not found) a 404 error.
   */
  id?: string;
  /**
   * Limits the response to posts with the specified tags
   *
   * When multiple tags are provided, posts will be returned that have *all* of the provided tags.
   * A maximum of four tags can be provided.
   */
  tag?: string | string[];
  /**
   * The type of post to return.
   */
  type?: PostType;
  /**
   * The number of posts to return: 1–20, inclusive.
   */
  limit?: number;
  /**
   * Offset post number (0 to start from first post).
   */
  offset?: number;
  /**
   * Indicates whether to return reblog information (specify true or false). Returns the various reblogged_ fields.
   */
  reblog_info?: boolean;
  /**
   * Indicates whether to return notes information (specify true or false). Returns note count and note metadata.
   */
  notes_info?: boolean;
  /**
   * Returns posts' content in NPF format instead of the legacy format.
   *
   * @see [NPF documentation.](https://www.tumblr.com/docs/npf)
   */
  npf?: boolean;
}
export interface BlogPosts<This> {
  /**
   * Gets a list of posts for a blog
   *
   * @param  blogIdentifier - blog name or URL
   * @param  params - Additional request parameters
   */
  (this: This, blogIdentifier: string, params?: BlogPostsParams, deprecated?: never): Promise<any>;
  /** @deprecated Use promises instead of callbacks */
  (this: This, blogIdentifier: string, callback: TumblrClientCallback): undefined;
  /** @deprecated Use promises instead of callbacks */
  (
    this: This,
    blogIdentifier: string,
    params: BlogPostsParams,
    callback: TumblrClientCallback,
  ): undefined;
}
