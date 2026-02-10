import type { VideoservicesApiClient } from '../client';

export abstract class BaseApi {
    protected client: VideoservicesApiClient;

    constructor(client: VideoservicesApiClient) {
        this.client = client;
    }
}
