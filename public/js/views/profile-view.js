'use strict';

import Button from 'Blocks/button-comp/button-comp';
import MyView from 'Eventum/views/my-view';
import settings from 'Settings/config';
import profileLeftTemplate from 'Blocks/profile-left/template.hbs';
import profileMainTemplate from 'Components/profile-main/template.hbs';
import loadingTemplate from 'Blocks/loading/template.hbs';
import errorTemplate from 'Blocks/error/template.hbs';
import {makeEmpty} from 'Eventum/utils/basic';
import {determineClass} from 'Blocks/event/event';
import EventEdit from 'Blocks/event-edit/event-edit';
import MidEventComponent from 'Blocks/event/mid-event-comp';
import SmallEventComponent from 'Blocks/event/small-event-comp';

/**
 * @class create ProfileView class
 */
export default class ProfileView extends MyView {

    /**
     * Create view
     * @param {HTMLElement} parent
     */
    constructor(parent) {
        super(parent);
        this.parent = parent;

        this.#emptyvDOM();
    }

    destructor() {
        this.#emptyvDOM();
    }

    #emptyvDOM() {
        this.vDOM = {
            leftColumn: {
                comp: null,
                element: null,
            },
            mainColumn: {
                comp: null,
                element: null,
                personalEvents: {
                    comp: null,
                    element: null,
                    event_edit: null, // component itself
                    events: {
                        mid_events: [],
                        small_events: [],
                    },
                },
                subscriptions: {
                    comp: null,
                    element: null,
                    events: {
                        mid_events: [],
                        big_events: [],
                    },
                },
            },
        };
    }

    get subscriptionsDiv() {
        this.setDOMProfileElements();
        return this.vDOM.mainColumn.subscriptions.element;
    }

    get personalEventsDiv() {
        this.setDOMProfileElements();
        return this.vDOM.mainColumn.personalEvents.element;
    }

    get eventEditComp() {
        this.setDOMProfileElements();
        return this.vDOM.mainColumn.personalEvents.event_edit;
    }

    /**
     * Render template
     * @param {
     *  {
     *      birthday: string,
     *      password: string,
     *      gender: string,
     *      phone: string,
     *      name: string,
     *      about: string,
     *      rating: string,
     *      location: string,
     *      avatar: string,
     *      photos: string,
     *      email: string,
     *      tags: {
     *          title: string,
     *          id: string,
     *      }
     *  } } profile -  user profile from server
     */
    render(profile) {
        super.render();

        if (profile.events) {
            profile.events.forEach((event) => determineClass(event));
        }

        // let allowEdit = true;
        if (!profile.avatar.path) {
            profile.avatar.path = 'default.png';
        }

        if ('tags' in profile) {
            if (!profile.tags) {
                profile.tags = [];
            } else {
                profile.tags.forEach((tag) => {
                    tag.activeClass = 'tag__container_active';
                    tag.editable = true;
                });
            }
        }

        // Create components
        const logoutButton = new Button({
            style: 're_btn re_btn__outline logout',
            state: null,
            text: 'Выйти',
            data_bind: 'logout',
        });

        const saveButton = new Button({
            style: 're_btn re_btn__filled',
            state: null,
            text: 'Сохранить',
            data_bind: 'saveMeta',
        });

        const settingsButton = new Button({
            style: 're_btn re_btn__outline',
            state: null,
            text: 'Настройки',
            data_bind: 'showSettings',
        });

        const addEventButton = new Button({
            style: 're_btn re_btn__filled',
            state: null,
            text: 'Добавить',
            data_bind: 'addNewEventOnClick',
        });

        document.getElementsByClassName('my__left-column-body')[0].insertAdjacentHTML(
            'beforeend', profileLeftTemplate({
                profile: profile,
                avatar: `${settings.aws}/users/${profile.avatar.path}`,
                button_logout: logoutButton.data,
                save_button: saveButton.data,
                settings_button: settingsButton.data,
            })
        );
        document.getElementsByClassName('my__main-column-body')[0].insertAdjacentHTML(
            'beforeend', profileMainTemplate({
                title: 'Профиль',
                url: `${settings.aws}/users`,
                profile: profile,
                add_event_button: addEventButton.data,
                select_options: Array(14).fill(undefined, undefined, undefined).map((_, idx) => 2 + idx),
            })
        );

        this.vDOM.mainColumn.personalEvents.event_edit = new EventEdit(
            document.querySelector('.event-edit')
        );
    }

    setDOMProfileElements() {
        while (!this.vDOM.mainColumn.subscriptions.element) {
            this.vDOM.mainColumn.subscriptions.element = document.querySelector('.profile-main__subscriptions');
        }
        while (!this.vDOM.mainColumn.personalEvents.element) {
            this.vDOM.mainColumn.personalEvents.element = document.querySelector('.profile-main__personal-events');
        }
        while (!this.vDOM.mainColumn.personalEvents.event_edit.element) {
            this.vDOM.mainColumn.personalEvents.event_edit.element = document.querySelector('.event-edit');
        }
    }

    /**
     * Show loading of new event
     *
     * 1) Create div with empty event
     * 2) Insert loading inside this div
     * 3) this.renderNewEvent() will look for this div to replace insides
     *
     * @return {Promise<void>}
     */
    async renderNewEventLoading() {
        // Remove helper message if exists (case when you create your first event)
        let helper = this.personalEventsDiv.querySelector('span.font.font_bold.font__size_small.font__color_lg');
        if (helper) {
            helper.remove();
        }

        let emptyEvent = document.createElement('div');
        emptyEvent.classList.add('event');
        emptyEvent.insertAdjacentHTML('afterbegin', loadingTemplate());
        return this.eventEditComp.element.insertAdjacentElement('afterend', emptyEvent);
    }

    /**
     *
     * @param event
     * @param type {'big', 'mid', 'small'}
     * @param bodyElement {HTMLElement}
     * @return {Promise<void>}
     */
    async renderNewEvent(event, type, bodyElement) {
        let eventComponent;

        if (type === 'small') {
            eventComponent = new SmallEventComponent(event, true);
            this.vDOM.mainColumn.personalEvents.events.small_events.push(eventComponent);
        } else if (type === 'mid') {
            eventComponent = new MidEventComponent(event, true);
            this.vDOM.mainColumn.personalEvents.events.mid_events.push(eventComponent);
        } else {
            console.log('sorry not implemented for type', type);
            return;
        }

        makeEmpty(bodyElement);
        await eventComponent.renderIn(bodyElement);
    }

    /**
     *
     * @param events {
     *      mid_events: Array<{
     *          eid: Number,
     *          uid: Number,    (admin_id)
     *          title: string,
     *          description: string|null,
     *          tags: Array<Number>|null,
     *          date: string|null,
     *          photos: Array<string>|null,
     *          limit: Number,
     *          member_amount: Number,
     *          public: boolean,
     *      }>,
     *      small_events: Array<{
     *          eid: Number,
     *          uid: Number,
     *          title: string,
     *          description: string|null,
     *          tags: Array<Number>|null,
     *          date: string|null,
     *          photos: Array<string>|null,
     *      }>}
     * @return {Promise<void>}
     */
    async renderEvents(events) {
        const personalEvents = this.personalEventsDiv;
        makeEmpty(personalEvents);
        if (!events || (!events.mid_events || events.mid_events.length === 0) && (!events.small_events || events.small_events.length === 0)) {
            personalEvents.insertAdjacentHTML('afterbegin', '<span class="font font_bold font__size_small font__color_lg">У вас пока нет ни одного эвента</span>');
        } else {
            events.small_events.forEach((smallEvent) => {
                let smallEventComponent = new SmallEventComponent(smallEvent, true);
                this.vDOM.mainColumn.personalEvents.events.small_events.push(smallEventComponent);
                smallEventComponent.renderAsElement(personalEvents, 'beforeend');
            });
            events.mid_events.forEach((midEvent) => {
                let midEventComponent = new MidEventComponent(midEvent, true);
                this.vDOM.mainColumn.personalEvents.events.mid_events.push(midEventComponent);
                midEventComponent.renderAsElement(personalEvents, 'beforeend');
            });
        }
    }

    async renderEventsError(error) {
        console.error(error);
        this.showError(this.subscriptionsDiv, 'Error in subscriptions', 'warning', null);
    }

    /**
     * This function depends on non-empty chats
     * so check it somewhere outside
     * @param subscriptions {{
     *     mid_events: Array<{
     *          eid: Number,
     *          title: string,
     *          description: string|null,
     *          tags: Array<Number>|null,
     *          date: string|null,
     *          photos: Array<string>|null,
     *          limit: Number,
     *          member_amount: Number,
     *          public: boolean,
     *      }>
     * }}
     * @return {Promise<void>}
     */
    async renderSubscriptions(subscriptions) {
        if (!subscriptions
            ||
            (!subscriptions.mid_events || subscriptions.mid_events.length === 0)
                &&
            (!subscriptions.big_events || subscriptions.big_events.length === 0))
        {
            this.renderEmptySubscriptions();
            return;
        }
        const subsArea = this.subscriptionsDiv;
        makeEmpty(subsArea);
        subscriptions.mid_events.forEach((midEvent) => {
            let midEventComponent = new MidEventComponent(midEvent, false);
            this.vDOM.mainColumn.subscriptions.events.mid_events.push(midEventComponent);
            midEventComponent.renderAsElement(subsArea, 'beforeend');
        });
    }

    /**
     * Render motivational message to search for events
     * @return {Promise<void>}
     */
    async renderEmptySubscriptions() {
        const subsArea = this.subscriptionsDiv;
        makeEmpty(subsArea);
        subsArea.insertAdjacentHTML('afterbegin', errorTemplate({
            message: 'Вы ещё никуда не идёте',
            button: 'Найти эвент',
        }));
    }

    /**
     * Show error in subscription div
     * @return {Promise<void>}
     */
    async renderSubscriptionsError(error) {
        console.error(error);
        this.showError(this.subscriptionsDiv, 'Error in subscriptions', 'warning', null);
    }

    /**
     * Finds index of element in
     * @param eid {Number}
     * @return {{index: Number, source: Object}}
     */
    findEventComponentIndex(eid) {
        let index = -1;
        let sources = [this.personalEvents.small_events, this.personalEvents.mid_events, this.subscriptions.mid_events];

        let source = sources.find((source) => {
            index = source.findIndex((event) => {return event.data.eid === eid});
            return index > 0;
        });

        return {index: index, source: source};
    }

    /***********************************************
                 Additional get functions
     ***********************************************/

    get personalEvents() {
        return this.vDOM.mainColumn.personalEvents.events;
    }

    get subscriptions() {
        return this.vDOM.mainColumn.subscriptions.events;
    }
}