export type Options = {
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
     * (optional) Use promises instead of callbacks.
     */
    returnPromises?: boolean;
};
/**
 * Handles the response from a client reuest
 */
export type TumblrClientCallback = (err: Error | null, resp: any | null, response?: http.IncomingMessage | null | undefined) => void;
/**
 * @typedef Options
 * @property {string}  [consumer_key]    OAuth1 credential. Required for API key auth endpoints.
 * @property {string}  [consumer_secret] OAuth1 credential. Required for OAuth endpoints.
 * @property {string}  [token]           OAuth1 credential. Required for OAuth endpoints.
 * @property {string}  [token_secret]    OAuth1 credential. Required for Oauth endpoints.
 * @property {string}  [baseUrl]         (optional) The API url if different from the default.
 * @property {boolean} [returnPromises]  (optional) Use promises instead of callbacks.
 */
/**
 * Handles the response from a client reuest
 *
 * @callback TumblrClientCallback
 * @param {?Error} err - error message
 * @param {?Object} resp - response body
 * @param {?http.IncomingMessage} [response] - raw response
 * @returns {void}
 */
declare class TumblrClient {
    /**
     * @typedef {Map<string, ReadonlyArray<string>|string>} RequestData
     *
     * @typedef {'text'|'quote'|'link'|'answer'|'video'|'audio'|'photo'|'chat'} PostType
     *
     * @typedef {'text'|'raw'} PostFormatFilter
     *
     *
     * @typedef {{readonly auth:'none'}} NoneAuthCredentials
     * @typedef {{readonly auth:'apiKey'; readonly apiKey:string}} ApiKeyCredentials
     * @typedef {{readonly auth:'oauth1'; readonly consumer_key: string; readonly consumer_secret: string; readonly token: string; readonly token_secret: string }} OAuth1Credentials
     * @typedef {NoneAuthCredentials|ApiKeyCredentials|OAuth1Credentials} Credentials
     */
    /**
     * Creates a Tumblr API client using the given options
     *
     * @param  {Options} [options] - client options
     *
     * @constructor
     */
    constructor(options?: Options | undefined);
    /**
     * Package version
     * @type {typeof CLIENT_VERSION}
     */
    version: typeof CLIENT_VERSION;
    /**
     * Base URL to API requests
     * @type {string}
     */
    baseUrl: string;
    /** @type {Credentials} */
    credentials: {
        readonly auth: 'none';
    } | {
        readonly auth: 'apiKey';
        readonly apiKey: string;
    } | {
        readonly auth: 'oauth1';
        readonly consumer_key: string;
        readonly consumer_secret: string;
        readonly token: string;
        readonly token_secret: string;
    };
    /** @type {oauth.OAuth | null} */
    oauthClient: oauth.OAuth | null;
    /**
     * Performs a GET request
     *
     * @param  {string} apiPath - URL path for the request
     * @param  {Record<string,any>|TumblrClientCallback} [paramsOrCallback] - query parameters
     * @param  {TumblrClientCallback} [callback] - request callback
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    getRequest(apiPath: string, paramsOrCallback?: Record<string, any> | TumblrClientCallback | undefined, callback?: TumblrClientCallback | undefined): Promise<any> | undefined;
    /**
     * @template {TumblrClientCallback|undefined} CB
     *
     * @param {URL} url
     * @param {'GET'|'POST'} method request method
     * @param {null|RequestData} data
     * @param {CB} providedCallback
     *
     * @returns {CB extends undefined ? Promise<any> : undefined}
     *
     * @private
     */
    private makeRequest;
    /**
     * Performs a POST request
     *
     * @param  {string} apiPath - URL path for the request
     * @param  {Record<string,any>|TumblrClientCallback} [paramsOrCallback]
     * @param  {TumblrClientCallback} [callback]
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    postRequest(apiPath: string, paramsOrCallback?: Record<string, any> | TumblrClientCallback | undefined, callback?: TumblrClientCallback | undefined): Promise<any> | undefined;
    /**
     * @deprecated Promises are returned if no callback is provided
     */
    returnPromises(): void;
    /**
     * Creates a post on the given blog.
     *
     * @deprecated Legacy post creation methods are deprecated. Use NPF methods.
     *
     * @see {@link https://www.tumblr.com/docs/api/v2#posting|API Docs}
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {Record<string,any>|TumblrClientCallback} [paramsOrCallback]
     * @param  {TumblrClientCallback} [callback]
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    createPost(blogIdentifier: string, paramsOrCallback?: Record<string, any> | TumblrClientCallback | undefined, callback?: TumblrClientCallback | undefined): Promise<any> | undefined;
    /**
     * Edits a given post
     *
     * @deprecated Legacy post creation methods are deprecated. Use NPF methods.
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {Record<string,any>|TumblrClientCallback} [paramsOrCallback]
     * @param  {TumblrClientCallback} [callback]
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    editPost(blogIdentifier: string, paramsOrCallback?: Record<string, any> | TumblrClientCallback | undefined, callback?: TumblrClientCallback | undefined): Promise<any> | undefined;
    /**
     * Likes a post as the authenticating user
     *
     * @param  {{ id: string; reblog_key: string }} params - parameters sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    likePost(params: {
        id: string;
        reblog_key: string;
    }, callback?: TumblrClientCallback | undefined): Promise<any> | undefined;
    /**
     * Unlikes a post as the authenticating user
     *
     * @param  {{ id: string; reblog_key: string }} params - parameters sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    unlikePost(params: {
        id: string;
        reblog_key: string;
    }, callback?: TumblrClientCallback | undefined): Promise<any> | undefined;
    /**
     * Follows a blog as the authenticating user
     *
     * @param  {{url: string}|{email:string}} params - parameters sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    followBlog(params: {
        url: string;
    } | {
        email: string;
    }, callback?: TumblrClientCallback | undefined): Promise<any> | undefined;
    /**
     * Unfollows a blog as the authenticating user
     *
     * @param  {{url: string}} params - parameters sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    unfollowBlog(params: {
        url: string;
    }, callback?: TumblrClientCallback | undefined): Promise<any> | undefined;
    /**
     * Deletes a given post
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {{id:string}} params
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    deletePost(blogIdentifier: string, params: {
        id: string;
    }, callback?: TumblrClientCallback | undefined): Promise<any> | undefined;
    /**
     * Reblogs a given post
     *
     * @deprecated Legacy post creation methods are deprecated. Use NPF methods.
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {Record<string,any>} params - parameters sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    reblogPost(blogIdentifier: string, params: Record<string, any>, callback?: TumblrClientCallback | undefined): Promise<any> | undefined;
    /**
     * Gets information about a given blog
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {{'fields[blogs]'?: string}|TumblrClientCallback} [paramsOrCallback] - query parameters
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    blogInfo(blogIdentifier: string, paramsOrCallback?: TumblrClientCallback | {
        'fields[blogs]'?: string;
    } | undefined, callback?: TumblrClientCallback | undefined): Promise<any> | undefined;
    /**
     * Gets the likes for a blog
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {{limit?: number; offset?: number; before?: number; after?: number}|TumblrClientCallback} [paramsOrCallback] - optional data sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    blogLikes(blogIdentifier: string, paramsOrCallback?: TumblrClientCallback | {
        limit?: number;
        offset?: number;
        before?: number;
        after?: number;
    } | undefined, callback?: TumblrClientCallback | undefined): Promise<any> | undefined;
    /**
     * Gets the followers for a blog
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {{limit?: number; offset?: number}|TumblrClientCallback} [paramsOrCallback] - optional data sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    blogFollowers(blogIdentifier: string, paramsOrCallback?: TumblrClientCallback | {
        limit?: number;
        offset?: number;
    } | undefined, callback?: TumblrClientCallback | undefined): Promise<any> | undefined;
    /**
     * Gets a list of posts for a blog
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {{type?:PostType; limit?: number; offset?: number}|TumblrClientCallback} [paramsOrCallback] - optional data sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     */
    blogPosts(blogIdentifier: string, paramsOrCallback?: TumblrClientCallback | {
        type?: "text" | "quote" | "link" | "answer" | "video" | "audio" | "photo" | "chat";
        limit?: number;
        offset?: number;
    } | undefined, callback?: TumblrClientCallback | undefined): Promise<any> | undefined;
    /**
     * Gets the queue for a blog
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {{limit?: number; offset?: number; filter?: 'text'|'raw'}|TumblrClientCallback} [paramsOrCallback] - optional data sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    blogQueue(blogIdentifier: string, paramsOrCallback?: TumblrClientCallback | {
        limit?: number;
        offset?: number;
        filter?: 'text' | 'raw';
    } | undefined, callback?: TumblrClientCallback | undefined): Promise<any> | undefined;
    /**
     * Gets the drafts for a blog
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {{before_id?: number; filter?: PostFormatFilter}|TumblrClientCallback} [paramsOrCallback] - optional data sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    blogDrafts(blogIdentifier: string, paramsOrCallback?: TumblrClientCallback | {
        before_id?: number;
        filter?: "text" | "raw";
    } | undefined, callback?: TumblrClientCallback | undefined): Promise<any> | undefined;
    /**
     * Gets the submissions for a blog
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {{offset?: number; filter?: PostFormatFilter}|TumblrClientCallback} [paramsOrCallback] - optional data sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    blogSubmissions(blogIdentifier: string, paramsOrCallback?: TumblrClientCallback | {
        offset?: number;
        filter?: "text" | "raw";
    } | undefined, callback?: TumblrClientCallback | undefined): Promise<any> | undefined;
    /**
     * Gets the avatar URL for a blog
     *
     * @param  {string} blogIdentifier - blog name or URL
     * @param  {{size?: 16|24|30|40|48|64|96|128|512}|TumblrClientCallback} [paramsOrCallback] - optional data sent with the request
     * @param  {TumblrClientCallback} [maybeCallback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    blogAvatar(blogIdentifier: string, paramsOrCallback?: TumblrClientCallback | {
        size?: 16 | 24 | 30 | 40 | 48 | 64 | 96 | 128 | 512;
    } | undefined, maybeCallback?: TumblrClientCallback | undefined): Promise<any> | undefined;
    /**
     * Gets information about the authenticating user and their blogs
     *
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    userInfo(callback?: TumblrClientCallback | undefined): Promise<any> | undefined;
    /**
     * Gets the dashboard posts for the authenticating user
     *
     * @param  {Record<string,any>|TumblrClientCallback} [paramsOrCallback] - query parameters
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    userDashboard(paramsOrCallback?: Record<string, any> | TumblrClientCallback | undefined, callback?: TumblrClientCallback | undefined): Promise<any> | undefined;
    /**
     * Gets the blogs the authenticating user follows
     *
     * @param  {{limit?: number; offset?: number;}|TumblrClientCallback} [paramsOrCallback] - query parameters
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    userFollowing(paramsOrCallback?: TumblrClientCallback | {
        limit?: number;
        offset?: number;
    } | undefined, callback?: TumblrClientCallback | undefined): Promise<any> | undefined;
    /**
     * Gets the likes for the authenticating user
     *
     * @param  {{limit?: number; offset?: number; before?: number; after?: number}|TumblrClientCallback} [paramsOrCallback] - query parameters
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    userLikes(paramsOrCallback?: TumblrClientCallback | {
        limit?: number;
        offset?: number;
        before?: number;
        after?: number;
    } | undefined, callback?: TumblrClientCallback | undefined): Promise<any> | undefined;
    /**
     * Gets posts tagged with the specified tag
     *
     * @param  {{tag:string; [param:string]: string|number}} params - optional parameters sent with the request
     * @param  {TumblrClientCallback} [callback] - invoked when the request completes
     *
     * @return {Promise<any>|undefined} Request object, or Promise if {@link returnPromises} was used
     */
    taggedPosts(params: {
        [param: string]: string | number;
        tag: string;
    }, callback?: TumblrClientCallback | undefined): Promise<any> | undefined;
}
declare const CLIENT_VERSION: "4.0.0-alpha.0";
import oauth = require("oauth");
export declare function createClient(options?: Options | undefined): TumblrClient;
export { TumblrClient as Client };
