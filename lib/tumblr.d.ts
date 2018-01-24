declare module 'tumblr.js' {
    type TumblrClientCallback = (err: any, resp: any, rawResp?: string) => void

    interface TumblrClient {
        userInfo(callback: TumblrClientCallback): void

        blogAvatar(blogIdentifier: string, size: number, params: object, callback: TumblrClientCallback): void
        blogAvatar(blogIdentifier: string, size: number, callback: TumblrClientCallback): void
        blogAvatar(blogIdentifier: string, params: object, callback: TumblrClientCallback): void
        blogAvatar(blogIdentifier: string, callback: TumblrClientCallback): void

        blogDrafts(blogIdentifier: string, params: object, callback: TumblrClientCallback): void
        blogDrafts(blogIdentifier: string, callback: TumblrClientCallback): void

        blogFollowers(blogIdentifier: string, params: object, callback: TumblrClientCallback): void
        blogFollowers(blogIdentifier: string, callback: TumblrClientCallback): void

        blogInfo(blogIdentifier: string, params: object, callback: TumblrClientCallback): void
        blogInfo(blogIdentifier: string, callback: TumblrClientCallback): void

        blogLikes(blogIdentifier: string, params: object, callback: TumblrClientCallback): void
        blogLikes(blogIdentifier: string, callback: TumblrClientCallback): void

        blogPosts(blogIdentifier: string): void
        blogPosts(blogIdentifier: string, type: string): void
        blogPosts(blogIdentifier: string, type: string, params: any): void
        blogPosts(blogIdentifier: string, params: any, callback: TumblrClientCallback): void
        blogPosts(blogIdentifier: string, callback: TumblrClientCallback): void
        blogPosts(blogIdentifier: string, type: string, params: any, callback: TumblrClientCallback): void

        blogSubmissions(blogIdentifier: string, params: object, callback: TumblrClientCallback): void
        blogSubmissions(blogIdentifier: string, callback: TumblrClientCallback): void

        blogQueue(blogIdentifier: string, params: object, callback: TumblrClientCallback): void
        blogQueue(blogIdentifier: string, callback: TumblrClientCallback): void

        createTextPost(blogIdentifier: string, options: TextPostParams, callback: TumblrClientCallback): void
        createPhotoPost(blogIdentifier: string, options: PhotoPostParams, callback: TumblrClientCallback): void
        createQuotePost(blogIdentifier: string, options: QuotePostParams, callback: TumblrClientCallback): void
        createLinkPost(blogIdentifier: string, options: LinkPostParams, callback: TumblrClientCallback): void
        createChatPost(blogIdentifier: string, options: ChatPostParams, callback: TumblrClientCallback): void
        createAudioPost(blogIdentifier: string, options: AudioPostParams, callback: TumblrClientCallback): void
        createVideoPost(blogIdentifier: string, options: VideoPostParams, callback: TumblrClientCallback): void

        taggedPosts(tag: string, options: object, callback: TumblrClientCallback): void
        taggedPosts(tag: string, callback: TumblrClientCallback): void

        deletePost(blogIdentifier: string, params: object, callback: TumblrClientCallback): void
        deletePost(blogIdentifier: string, id: number | string, callback: TumblrClientCallback): void

        editPost(blogIdentifier: string, params: object, callback: TumblrClientCallback): void

        reblogPost(blogIdentifier: string, params: object, callback: TumblrClientCallback): void

        userDashboard(params: object, callback: TumblrClientCallback): void
        userDashboard(callback: TumblrClientCallback): void

        userLikes(params: object, callback: TumblrClientCallback): void
        userLikes(callback: TumblrClientCallback): void

        userFollowing(params: object, callback: TumblrClientCallback): void
        userFollowing(callback: TumblrClientCallback): void

        followBlog(params: object, callback: TumblrClientCallback): void
        followBlog(blogURL: string, callback: TumblrClientCallback): void

        unfollowBlog(params: object, callback: TumblrClientCallback): void
        unfollowBlog(blogURL: string, callback: TumblrClientCallback): void

        likePost(params: object, callback: TumblrClientCallback): void
        likePost(id: number | string, reblogKey: string, callback: TumblrClientCallback): void

        unlikePost(params: object, callback: TumblrClientCallback): void
        unlikePost(id: number | string, reblogKey: string, callback: TumblrClientCallback): void
    }

    function createClient(options: any): TumblrClient;

    interface TextPostParams {
        title?: string
        body: string
    }

    interface PhotoPostParamsWithSource {
        source: string
        caption?: string
    }

    interface PhotoPostParamsWithData {
        data: any | Array<string>
        caption?: string
    }

    interface PhotoPostParamsWithData64 {
        data64: string
        caption?: string
    }

    type PhotoPostParams = PhotoPostParamsWithSource | PhotoPostParamsWithData | PhotoPostParamsWithData64

    interface QuotePostParams {
        quote: string
        source?: string
    }

    interface LinkPostParams {
        title?: string
        url: string
        thumbnail?: string
        excerpt?: string
        author?: string
        description?: string
    }

    interface ChatPostParams {
        title?: string
        conversation: string
    }

    interface AudioPostParamsWithExternalUrl {
        external_url: string
        caption?: string
    }

    interface AudioPostParamsWithData {
        data: any
        caption?: string
    }

    type AudioPostParams = AudioPostParamsWithExternalUrl | AudioPostParamsWithData

    interface VideoPostParamsWithEmbed {
        embed: string
        caption?: string
    }

    interface VideoPostParamsWithData {
        data: any
        caption?: string
    }

    type VideoPostParams = VideoPostParamsWithEmbed | VideoPostParamsWithData
}
