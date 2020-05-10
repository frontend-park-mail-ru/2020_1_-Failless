'use strict';

import NetworkModule from 'Eventum/core/network';
import settings from 'Settings/config';
import Model from 'Eventum/core/model';

/**
 * @class EventModel
 */
export default class EventModel extends Model {

    /**
     * Create EventModel object
     */
    constructor() {
        super();
        this.tags = null;
    }

    /**
     * Get event data from server
     * @param {{limit: Number, page: Number}} eventsRequest - request with query, limits and page
     * @return {Promise} promise to get user data
     */
    static getSearchEvents(eventsRequest) {
        let errors = this.invalidEventRequest(eventsRequest);
        if (errors.length !== 0) {
            throw new Error(...errors);
        }
        return NetworkModule.fetchPost({path: '/events', body: eventsRequest}).then(
            (response) => {
                if (response.status > 499) {
                    throw new Error('Server error');
                }
                return response.json();
            },
            (error) => {
                throw new Error(error);
            });
    }

    /**
     * Get event data from server
     * @param {{query: string, page: number}} feedRequest - request with filters
     * @return {Promise} promise to get user data
     */
    static getFeedUsers(feedRequest) {
        let errors = this.invalidEventRequest(feedRequest);
        if (errors.length !== 0) {
            throw new Error(...errors);
        }
        return NetworkModule.fetchPost({path: '/users/feed', body: feedRequest}).then(
            (response) => {
                if (response.status > 499) {
                    throw new Error('Server error');
                }
                return response.json();
            },
            (error) => {
                throw new Error(error);
            });
    }

    /**
     * Get event data from server
     * @param {{uid: number, id: number, value: number}} vote - request with query, limits and page
     * @return {Promise} promise to get user data
     */
    static userVote(vote) {
        let url = '/users/';
        url += vote.value === 1 ? 'like' : 'dislike';
        return NetworkModule.fetchPut({
            api: settings.api,
            path: url,
            body: vote,
        }).then((response) => {
            if (response.status > 499) {
                throw new Error('Server error');
            }
            return response.json();
        },
        (error) => {
            throw new Error(error);
        });
    }

    /**
     * Get all tags from server
     * @return {Promise} promise to get user login data
     */
    static getTagList() {
        if (this.tags) {
            return this.tags;
        }
        return NetworkModule.fetchGet({path: '/tags/feed'}).then((response) => {
            if (response.status > 499) {
                throw new Error('Server error');
            }
            return response.json().then((tags) => {
                this.tags = tags;
                return tags;
            });
        },
        (error) => {
            return new Promise((resolve) => {
                resolve({err: error});
            });
        });
    }

    /**
     * Send small event to backend
     * @param body {{
     *      uid:            Number,
     *      title:          string,
     *      description:    string          |null,
     *      tags:           Array<Number>   |null,
     *      date:           string          |null,
     *      photos:         Array<string>   |null,
     * }}
     * @return {Promise<unknown>}
     */
    static createSmallEvent(body) {
        return NetworkModule.fetchPost({path: '/events/small', body: body, api: settings.api}).then((response) => {
            if (response.status > 499) {
                throw new Error('Server error');
            }
            return response.json();
        },
        (error) => {
            throw new Error(error);
        });
    }

    /**
     * Send mid event to backend
     * @param body {{
     *      uid:            Number,
     *      title:          string,
     *      description:    string          |null,
     *      tags:           Array<Number>   |null,
     *      date:           string          |null,
     *      photos:         string          |null,
     *      limit:          Number,
     *      public:         bool,
     * }}
     * @return {Promise<unknown>}
     */
    static createMidEvent(body) {
        return NetworkModule.fetchPost({path: '/events/mid', body: body}).then((response) => {
            if (response.status > 499) {
                throw new Error('Server error');
            }
            return response.json();
        },
        (error) => {
            throw new Error(error);
        });
    }

    /**
     * Retrieve all user personal events
     * small as well as mid
     * @param uid
     */
    static getUserOwnEvents(uid) {
        if (!uid) {
            throw new Error('Invalid profile id');
        }
        return NetworkModule.fetchGet({path: `/profile/${uid}/own-events`, api: settings.api}).then(
            (response) => {
                if (response.status > 499) {
                    throw new Error('Server error');
                }
                return response.json();
            },
            (error) => {
                throw new Error(error);
            });
    }

    /**
     * Get events which user liked
     * @param uid
     * @return {Promise<unknown>}
     */
    static getUserSubscriptions(uid) {
        return NetworkModule.fetchGet({path: `/profile/${uid}/subscriptions`, api: settings.api}).then(
            (response) => {
                if (response.status > 499) {
                    throw new Error('Server error');
                }
                return response.json();
            },
            (error) => {
                console.error(error);
                throw new Error(error);
            });
    }

    /**
     * Subscribe user (uid) to this event (eid)
     * @param {Number} uid
     * @param {Number} eid
     */
    static joinMidEvent(uid, eid) {
        return NetworkModule.fetchPost({path: `/events/mid/${eid}/member`, body: {uid: Number(uid), eid: Number(eid)}}).then(
            (response) => {
                if (response.status > 499) {
                    throw new Error('Server error');
                }
                return response.json();
            },
            (error) => {
                throw new Error(error);
            });
    }

    /**
     * Send request to leave mid event
     * @param {Number} uid
     * @param {Number} eid
     */
    static leaveMidEvent(uid, eid) {
        return NetworkModule.fetchDelete({path: `/events/mid/${eid}/member`, body: {uid: Number(uid), eid: Number(eid)}}).then(
            (response) => {
                if (response.status > 499) {
                    throw new Error('Server error');
                }
                return response.json();
            },
            (error) => {
                throw new Error(error);
            });
    }

    static invalidEventRequest(eventRequest) {
        let message = [];
        const mustHaveProperties = [
            {
                name: 'page',
                type: 'number',
            },

            {
                name: 'limit',
                type: 'number',
            },
        ];
        const mayHaveProperties = [
            {
                name: 'uid',
                type: 'number',
            },
            {
                name: 'query',
                type: 'string',
            },
            {
                name: 'userLimit',
                type: 'number',
            },
            {
                name: 'tags',
                type: 'object',
            },
            {
                name: 'location',
                type: 'string',
            },
            {
                name: 'men',
                type: 'boolean',
            },
            {
                name: 'women',
                type: 'boolean',
            },
        ];

        mustHaveProperties.every((prop) => {
            if (Object.prototype.hasOwnProperty.call(eventRequest, prop.name)) {
                if (typeof eventRequest.page !== prop.type) {
                    message.push(
                        `Invalid type of property "${prop.name}"\n` +
                        `\tExpected ${prop.type}\n` +
                        `\tActual ${typeof eventRequest.page}\n`);
                }
            } else {
                message.push('No property "' + prop.name + '"\n');
            }
        });
        mayHaveProperties.every((prop) => {
            if (Object.prototype.hasOwnProperty.call(eventRequest, prop.name)) {
                if (typeof eventRequest.page !== prop.type) {
                    message.push(
                        `Invalid type of property "${prop.name}"\n` +
                        `\tExpected ${prop.type}\n` +
                        `\tActual ${typeof eventRequest.page}\n`);
                }
            }
        });
        return message;
    }
}
