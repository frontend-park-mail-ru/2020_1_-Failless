'use strict';

import View from '../core/view.js';

/**
 * @class create SearchView class
 */
export default class FeedUsersView extends View {

    /**
     * Create view
     * @param {HTMLElement} parent
     */
    constructor(parent) {
        super(parent);
        this.parent = parent;
    }

    /**
     * Render template
     */
    render() {
        const profile = {
            name: 'Egor',
            age: 20,
            about: 'Поскольку тут контент динамический, то будет max-height, примерно как сейчас. Будет expand поверх фотки Соответственно кнопки посередине оставшегося блока снизу padding: 15px; // везде',
            photos: ['/ProfilePhotos/1.jpg'],
            tags: tags,
        };
        this.parent.innerHTML += Handlebars.templates['feed']({tags: tags});
        let columns = this.parent.getElementsByClassName('feed__column');
        columns[1].innerHTML = Handlebars.templates['feed-center']({profile: profile});
        columns[2].innerHTML = Handlebars.templates['feed-right']({events: events});
    }
}

function Event(photos, title, place, description) {
    this.photos = photos;
    this.title = title;
    this.place = place;
    this.description = description;
}

const events = [
    new Event(
        ['/EventPhotos/3.jpg', '/EventPhotos/4.jpg'],
        'Концерт',
        'Москва',
        'Ну как его похвалить? Ну классный концерт, шикарный концерт, как его ещё похвалить?'),
    new Event(
        ['/EventPhotos/2.jpg', '/EventPhotos/1.jpg'],
        'Выставка',
        'Ленинград',
        'Выставка Ван-Гога. Обещают привезти главный экспонат')
];

function Tag(title) {
    this.title = '#' + title;
}

const tags = [
    new Tag('хочувБАР'),
    new Tag('хочувКИНО'),
    new Tag('хочунаКАТОК'),
    new Tag('хочуГУЛЯТЬ'),
    new Tag('хочуКУШАЦ'),
    new Tag('хочуСПАТЬ'),
];
